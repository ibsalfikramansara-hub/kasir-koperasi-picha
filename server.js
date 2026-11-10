/**
 * Kasir Koperasi Picha - Production & Local HTTP Server (Vercel Serverless + Node.js Compatible)
 * Menyertakan explicit path references untuk @vercel/nft (Node File Trace)
 * agar seluruh halaman HTML, JS, CSS, dan JSON dibundel secara utuh di Vercel.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 8000;
const ROOT_DIR = __dirname;

// Explicit references untuk @vercel/nft bundler agar semua file statis disertakan di Lambda
const STATIC_MANIFEST = {
  '/index.html': path.join(__dirname, 'index.html'),
  '/login.html': path.join(__dirname, 'login.html'),
  '/dashboard-admin.html': path.join(__dirname, 'dashboard-admin.html'),
  '/kasir.html': path.join(__dirname, 'kasir.html'),
  '/kepala-koperasi.html': path.join(__dirname, 'kepala-koperasi.html'),
  '/pengurus.html': path.join(__dirname, 'pengurus.html'),
  '/penitip.html': path.join(__dirname, 'penitip.html'),
  '/users.html': path.join(__dirname, 'users.html'),
  '/barang.html': path.join(__dirname, 'barang.html'),
  '/aruskas.html': path.join(__dirname, 'aruskas.html'),
  '/laporan.html': path.join(__dirname, 'laporan.html'),
  '/backup.html': path.join(__dirname, 'backup.html'),
  '/audit.html': path.join(__dirname, 'audit.html'),
  '/penutupan-kas.html': path.join(__dirname, 'penutupan-kas.html'),
  '/js/core.js': path.join(__dirname, 'js/core.js'),
  '/js/auth.js': path.join(__dirname, 'js/auth.js'),
  '/css/app.css': path.join(__dirname, 'css/app.css'),
  '/initial_data.json': path.join(__dirname, 'initial_data.json'),
};

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

function requestHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqUrl = (req.url || '/').split('?')[0];
  if (reqUrl.length > 1 && reqUrl.endsWith('/')) {
    reqUrl = reqUrl.slice(0, -1);
  }

  // API Health Check
  if (reqUrl === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'ok',
      app: 'Kasir Koperasi Picha',
      version: '2.0.6',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  // Cek di manifest terlebih dahulu (mendukung URL dengan .html maupun tanpa .html)
  let targetPath = STATIC_MANIFEST[reqUrl] || STATIC_MANIFEST[reqUrl + '.html'];

  if (!targetPath) {
    let candidate = path.join(ROOT_DIR, reqUrl);
    if (!path.extname(candidate) && fs.existsSync(candidate + '.html')) {
      candidate = candidate + '.html';
    }
    const resolved = path.resolve(candidate);
    if (resolved.startsWith(path.resolve(ROOT_DIR))) {
      targetPath = resolved;
    }
  }

  if (targetPath && fs.existsSync(targetPath)) {
    try {
      const stat = fs.statSync(targetPath);
      if (stat.isFile()) {
        const ext = path.extname(targetPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.writeHead(200, { 'Content-Type': contentType });
        const content = fs.readFileSync(targetPath);
        res.end(content);
        return;
      }
    } catch (e) {
      // Lanjut ke fallback
    }
  }

  // Fallback ke index.html jika rute tidak ditemukan
  const fallbackIndex = STATIC_MANIFEST['/index.html'];
  if (fs.existsSync(fallbackIndex)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(fallbackIndex));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}

// Jika dijalankan langsung dengan `node server.js`
if (require.main === module) {
  const server = http.createServer(requestHandler);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`Kasir Koperasi Picha Server Aktif!`);
    console.log(`------------------------------------------------------`);
    console.log(`Akses Lokal   : http://localhost:${PORT}`);
    console.log(`Health Check  : http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

// Export untuk Vercel Serverless (@vercel/node)
module.exports = requestHandler;
