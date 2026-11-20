#!/usr/bin/env node
// node cover3d.js <cover.jpg> <sortie.png> : rend la pochette en 3D (PNG transparent)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const http = require('http');
(async () => {
  const [src, out] = process.argv.slice(2);
  const types = { '.html': 'text/html', '.js': 'text/javascript' };
  const srv = http.createServer((q, s) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.statusCode = 404; return s.end(); } s.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); s.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); p.on('pageerror', e => console.error('page:', e.message));
  await p.goto(`http://127.0.0.1:${srv.address().port}/cover3d.html`); await p.waitForFunction(() => window.ready3d);
  const data = 'data:image/jpeg;base64,' + fs.readFileSync(src).toString('base64');
  const r = await p.evaluate(s => window.render3d(s), data);
  fs.writeFileSync(out, Buffer.from(r.png.split(',')[1], 'base64'));
  fs.writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify({ bottom: r.bottom }));
  await b.close(); srv.close();
})();
