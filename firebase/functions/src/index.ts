import http from "node:http";
import { handleApiRequest } from "./handler.js";

export * from "./handler.js";

/**
 * Entrypoint for local test runner and Cloud Functions 2nd Gen
 */
export const api = handleApiRequest;

/**
 * Optional local server launcher for testing or containerized deployments
 */
export function createLocalServer(port: number = 8080): http.Server {
  const server = http.createServer((req, res) => {
    handleApiRequest(req, res);
  });

  server.listen(port, () => {
    console.log(`[Trainable DS Cloud Functions] API listening on http://localhost:${port}`);
  });

  return server;
}
