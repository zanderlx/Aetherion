import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameStore } from './src/store.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const catalog = JSON.parse(await readFile(resolve(root, 'data/definitions/catalog.json'), 'utf8'));
const defaults = JSON.parse(await readFile(resolve(root, 'data/defaults/settings.json'), 'utf8'));
const store = await new GameStore(process.env.HORSE_DATA_DIR || resolve(root, 'data'), catalog, defaults).init();
const port = Number(process.env.PORT || 4173);
const publicRoot = resolve(root, 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const send = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
};
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'");
  const boundPort = server.address().port;
  const allowedHosts = new Set([`localhost:${boundPort}`, `127.0.0.1:${boundPort}`]);
  if (!allowedHosts.has(req.headers.host)) return send(res, 403, { error: 'Local connections only.' });
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/state') { await store.refreshConfiguration(); return send(res,200,{state:store.snapshot(),catalog:store.getCatalog(),defaults}); }
    if (req.method === 'GET' && url.pathname === '/api/export') {
      await store.refreshConfiguration();
      res.setHeader('Content-Disposition', 'attachment; filename="aetherion-backup.json"');
      return send(res, 200, { state: store.snapshot(), catalog: store.getCatalog(), defaults });
    }
    if (req.method === 'POST' && url.pathname === '/api/action') {
      if (req.headers.origin !== `http://${req.headers.host}` || !req.headers['content-type']?.startsWith('application/json')) return send(res, 403, { error: 'Same-origin JSON requests required.' });
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 1048576) return send(res, 413, { error: 'Request too large.' });
      }
      const { type, payload } = JSON.parse(body);
      return send(res, 200, { state: await store.action(type, payload), catalog: store.getCatalog() });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not supported.' });
    const path = resolve(publicRoot, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(publicRoot + sep)) return send(res, 403, { error: 'Access denied.' });
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    send(res, error.code === 'ENOENT' ? 404 : 400, { error: error.code === 'ENOENT' ? 'Not found.' : error.message });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Aetherion is ready at http://127.0.0.1:${server.address().port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
