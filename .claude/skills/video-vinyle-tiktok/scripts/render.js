// node render.js config.json out.mp4 [--preview t1,t2,...]  (appelé par make-video.js)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [cfgPath, out, flag, list] = process.argv.slice(2);
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.cover = 'data:image/jpeg;base64,' + fs.readFileSync(cfg.coverPath).toString('base64');
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); p.on('pageerror', e => console.error('page:', e.message));
  // serve this folder over http so ES modules (three/addons) can load
  const http = require('http'); const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
  const srv = http.createServer((q, s) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.statusCode = 404; return s.end(); } s.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); s.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); process.on('exit', () => srv.close());
  await p.goto(`http://127.0.0.1:${srv.address().port}/${cfg.scene || 'vinyle.html'}`);
  await p.waitForFunction(() => typeof window.setup === 'function');
  const info = await p.evaluate(c => window.setup(c), cfg); console.error(info);
  const fps = cfg.fps || 30;
  if (flag === '--preview') {
    for (const t of list.split(',').map(Number)) {
      const d = await p.evaluate(t => window.frame(t), t);
      fs.writeFileSync(out.replace(/\.\w+$/, '') + `-t${t}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
    }
    await b.close(); process.exit(0);
  }
  const n = Math.round(info.duration * fps);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '24', '-maxrate', '12M', '-bufsize', '24M', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const d = await p.evaluate(t => window.frame(t), f / fps);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.error(`frame ${f}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.error('done', out); process.exit(0);
})();
