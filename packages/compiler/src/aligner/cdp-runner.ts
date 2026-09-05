import { spawn, ChildProcess } from "node:child_process";
import fs from "node:fs";
import { getInPageHarvesterScript, HarvestedSystemSnapshot, normalizeHarvestedSnapshot } from "./deep-harvester.js";

export interface CdpRunnerOptions {
  chromePath?: string;
  port?: number;
  headless?: boolean;
}

export class CdpRunner {
  private chromeProcess?: ChildProcess;
  private wsUrl?: string;
  private port = 9222;

  constructor(private options: CdpRunnerOptions = {}) {
    if (options.port) this.port = options.port;
  }

  private findChromePath(): string {
    if (this.options.chromePath && fs.existsSync(this.options.chromePath)) {
      return this.options.chromePath;
    }
    const macPath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    if (fs.existsSync(macPath)) return macPath;

    const linuxPaths = ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];
    for (const p of linuxPaths) {
      if (fs.existsSync(p)) return p;
    }
    return "";
  }

  /**
   * Harvests runtime computed styles and DOM/shadow-root tree from a target URL.
   */
  async harvestUrl(url: string, timeoutMs = 15000): Promise<HarvestedSystemSnapshot> {
    const chromeBin = this.findChromePath();
    if (!chromeBin) {
      throw new Error("Google Chrome binary not found. Please install Chrome or specify chromePath.");
    }

    // Try connecting to existing Chrome instance first
    let connected = false;
    try {
      const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
      if (res.ok) {
        const info = await res.json() as { webSocketDebuggerUrl?: string };
        this.wsUrl = info.webSocketDebuggerUrl;
        connected = true;
      }
    } catch {
      // Chrome not running on this port, will launch new instance
    }

    if (!connected) {
      // Pick dynamic or default port
      const targetPort = this.port;
      const args = [
        `--remote-debugging-port=${targetPort}`,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "about:blank"
      ];

      this.chromeProcess = spawn(chromeBin, args, { stdio: "ignore" });

      // Poll until CDP is ready
      const startTime = Date.now();
      while (Date.now() - startTime < 8000) {
        try {
          const res = await fetch(`http://127.0.0.1:${targetPort}/json/version`);
          if (res.ok) {
            const info = await res.json() as { webSocketDebuggerUrl?: string };
            this.wsUrl = info.webSocketDebuggerUrl;
            connected = true;
            break;
          }
        } catch {
          await new Promise(r => setTimeout(r, 200));
        }
      }

      if (!connected || !this.wsUrl) {
        this.cleanup();
        throw new Error(`Failed to launch headless Chrome and connect to CDP port ${targetPort}`);
      }
    }

    // Execute navigation and evaluation via WebSocket
    try {
      const result = await this.evaluateInPage(url, getInPageHarvesterScript(), timeoutMs);
      return normalizeHarvestedSnapshot(result);
    } finally {
      this.cleanup();
    }
  }

  private async evaluateInPage(url: string, script: string, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.wsUrl) {
        return reject(new Error("No WebSocket URL available"));
      }

      const ws = new WebSocket(this.wsUrl);
      let id = 1;
      const send = (method: string, params: any = {}) => {
        ws.send(JSON.stringify({ id: id++, method, params }));
      };

      const timer = setTimeout(() => {
        ws.close();
        reject(new Error(`Timeout (${timeoutMs}ms) evaluating ${url}`));
      }, timeoutMs);

      ws.onopen = () => {
        send("Page.enable");
        send("Runtime.enable");
        send("Page.navigate", { url });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data));
          if (msg.method === "Page.loadEventFired") {
            // Wait 1.5s for dynamic web components to hydrate
            setTimeout(() => {
              send("Runtime.evaluate", {
                expression: script,
                returnByValue: true,
                awaitPromise: true
              });
            }, 1500);
          } else if (msg.id && msg.result && msg.result.result) {
            // Result from Runtime.evaluate
            clearTimeout(timer);
            ws.close();
            resolve(msg.result.result.value);
          }
        } catch (err) {
          clearTimeout(timer);
          ws.close();
          reject(err);
        }
      };

      ws.onerror = (err) => {
        clearTimeout(timer);
        reject(err);
      };
    });
  }

  cleanup() {
    if (this.chromeProcess) {
      try {
        this.chromeProcess.kill();
      } catch {
        // ignore
      }
      this.chromeProcess = undefined;
    }
  }
}
