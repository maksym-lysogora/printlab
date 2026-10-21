// Локальний запуск без Vercel: npm run dev → http://localhost:3000
// Ключі беруться з файлу .env (див. .env.example)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

if (existsSync('.env')) process.loadEnvFile('.env');

const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const API = { '/api/estimate': () => import('./api/estimate.js'), '/api/order': () => import('./api/order.js') };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (API[url.pathname]) {
      const mod = await API[url.pathname]();
      const handler = mod[req.method];
      if (!handler) { res.writeHead(405).end(); return; }
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const request = new Request(url, { method: req.method, headers: req.headers, body: Buffer.concat(chunks) });
      const response = await handler(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const path = normalize(join('public', url.pathname === '/' ? 'index.html' : url.pathname));
    if (!path.startsWith('public')) { res.writeHead(403).end(); return; }
    const data = await readFile(path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500).end(e.code === 'ENOENT' ? 'Not found' : String(e));
  }
}).listen(PORT, () => console.log(`print.lab → http://localhost:${PORT}`));
