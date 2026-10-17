import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Local verification of an already exported Expo bundle. This is not a production host.
const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function insideRoot(candidate) {
  const path = relative(root, candidate);
  return path === '' || !isAbsolute(path) && path !== '..' && !path.startsWith('../') && !path.startsWith('..\\');
}

async function resolveFile(candidate) {
  try {
    const canonical = await realpath(candidate);
    if (!insideRoot(canonical)) return null;
    const info = await stat(canonical);
    return info.isFile() ? { path: canonical, size: info.size } : null;
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null;
    throw error;
  }
}

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Frame-Options', 'DENY');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    // Decode before path resolution so both encoded traversal and Windows separators are rejected.
    const rawPath = (request.url ?? '/').split('?')[0];
    let path;
    try { path = decodeURIComponent(rawPath); }
    catch { response.writeHead(400).end(); return; }
    if (!path.startsWith('/') || path.startsWith('//') || /[\\\x00%]/.test(path) || path.split('/').some(segment => segment.startsWith('.'))) {
      response.writeHead(403).end();
      return;
    }
    const candidate = resolve(root, `.${path}`);
    if (!insideRoot(candidate)) { response.writeHead(403).end(); return; }
    let file = await resolveFile(candidate);
    // Expo Router routes do not have a physical HTML file in a single-page export.
    if (!file && !extname(path)) file = await resolveFile(resolve(root, 'index.html'));
    if (!file) { response.writeHead(404).end(); return; }
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(file.path).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': file.size,
    });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(file.path);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch {
    if (response.headersSent) response.destroy();
    else response.writeHead(500).end();
  }
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(8081, '127.0.0.1', () => {
  console.log('Expo export preview: http://127.0.0.1:8081');
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
