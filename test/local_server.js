/**
 * Kasir Koperasi Picha - Standalone Zero-Dependency Local HTTP Server
 * Disimpan di folder test/ agar Vercel tidak mendeteksinya sebagai Serverless Function yang membajak static files.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 8000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqUrl = req.url.split('?')[0];

  if (reqUrl === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      app: 'Kasir Koperasi Picha',
      version: '2.0.4',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, reqUrl);

  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqUrl);
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(resolvedPath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`Kasir Koperasi Picha Local Server Aktif!`);
  console.log(`------------------------------------------------------`);
  console.log(`Akses Lokal   : http://localhost:${PORT}`);
  console.log(`Health Check  : http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

