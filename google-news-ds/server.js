const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
let PORT = parseInt(process.env.PORT, 10) || 5000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API to update tokens with disk locking
  if (req.method === 'POST' && req.url === '/api/v1/update-tokens') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const tokensPath = path.join(BASE_DIR, 'tokens.json');
        if (fs.existsSync(tokensPath)) {
          const currentTokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
          if (payload.systemTokens && Array.isArray(payload.systemTokens)) {
            payload.systemTokens.forEach(t => {
              if (currentTokens.sys?.color?.light?.[t.name]) {
                currentTokens.sys.color.light[t.name].$value = t.light;
                currentTokens.sys.color.light[t.name].$extensions['tds:locked'] = true;
              }
              if (currentTokens.sys?.color?.dark?.[t.name]) {
                currentTokens.sys.color.dark[t.name].$value = t.dark;
                currentTokens.sys.color.dark[t.name].$extensions['tds:locked'] = true;
              }
            });
            fs.writeFileSync(tokensPath, JSON.stringify(currentTokens, null, 2));
            console.log('[Server] Saved locked tokens to tokens.json');
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'Tokens updated and locked' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static files
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/overview.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`🚀 [Trainable DS Reviewer Portal] Running at http://localhost:${port}/overview.html`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port === 5000 ? 5002 : port + 1;
      console.warn(`[Trainable DS] Port ${port} is in use (often macOS ControlCenter). Retrying on port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('[Trainable DS] Server error:', err);
    }
  });
}

startServer(PORT);
