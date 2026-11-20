#!/usr/bin/env node
// Vidéo TikTok « vinyle néon » synchronisée sur les paroles.
// Usage : node make-video.js <lien-spotify-track> <refrain.txt> <dossier-de-sortie> [--preview]
//   - titre, artistes, pochette : depuis Spotify (open.spotify.com + i.scdn.co)
//   - minutage des lignes : depuis LRCLIB (lrclib.net) ; sinon lignes réparties toutes les 1,6 s
//   - sortie : <titre>-vinyle.mp4 (1080×1920, sans son) + l'instant où faire démarrer le son dans TikTok
//   --preview : rend seulement 4 images JPG pour vérifier la mise en page (rapide)
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LEAD = 1.2;        // secondes de vidéo avant la 1re ligne (intro macro + recul de la caméra)
const FALLBACK_LINE = 1.6;

function fail(msg) { console.error('Erreur : ' + msg); process.exit(1); }
function get(url, args = []) {
  try { return execFileSync('curl', ['-sSfL', '-m', '25', ...args, url], { maxBuffer: 1 << 25, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { fail(`téléchargement impossible : ${url}. Vérifie que open.spotify.com, i.scdn.co et lrclib.net sont autorisés.\n${e.stderr || ''}`); }
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\([^)]*\)/g, ' ')
  .replace(/\bce qui\b/g, 'cqui').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
function sim(a, b) {   // token overlap (Dice) on normalised text
  const A = norm(a).split(' ').filter(Boolean), B = norm(b).split(' ').filter(Boolean);
  if (!A.length || !B.length) return 0;
  const bag = new Map(); B.forEach(w => bag.set(w, (bag.get(w) || 0) + 1)); let common = 0;
  A.forEach(w => { if (bag.get(w)) { common++; bag.set(w, bag.get(w) - 1); } });
  return 2 * common / (A.length + B.length);
}
const parseLrc = txt => txt.split('\n').map(l => l.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/)).filter(Boolean)
  .map(m => ({ t: +m[1] * 60 + +m[2], text: m[3].trim() })).filter(l => l.text);

(async () => {
  const args = process.argv.slice(2), preview = args.includes('--preview');
  const [url, lyricsPath, outArg] = args.filter(a => a !== '--preview');
  if (!url || !lyricsPath || !outArg) fail('usage : node make-video.js <lien-spotify-track> <refrain.txt> <dossier-de-sortie> [--preview]');
  const id = (url.match(/track\/([A-Za-z0-9]+)/) || [])[1]; if (!id) fail('lien Spotify de morceau attendu (open.spotify.com/track/...)');
  const outDir = path.resolve(outArg); fs.mkdirSync(outDir, { recursive: true });

  // 1. Spotify : titre, artistes, durée, pochette
  const embed = get(`https://open.spotify.com/embed/track/${id}`).toString();
  const nd = embed.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s); if (!nd) fail('page Spotify illisible');
  const ent = JSON.parse(nd[1]).props.pageProps.state.data.entity;
  const title = ent.name.replace(/\s*[([](feat|ft)\.?[^)\]]*[)\]]/i, '').trim() || ent.name;
  const artistNames = ent.artists.map(a => a.name);
  const durationS = (ent.duration || 0) / 1000;
  const img = ent.visualIdentity.image.sort((a, b) => b.maxWidth - a.maxWidth)[0].url;
  const coverPath = path.join(outDir, 'cover.jpg');
  fs.writeFileSync(coverPath, get('https://i.scdn.co/image/' + img.split('/image/').pop()));

  // 2. Refrain fourni par l'utilisateur
  const lines = fs.readFileSync(lyricsPath, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) fail('refrain vide');

  // 3. LRCLIB : version synchronisée la plus proche de la durée Spotify
  let lrc = null, source = 'aucun minutage trouvé';
  try {
    const q = encodeURIComponent(`${artistNames[0]} ${title}`);
    const res = JSON.parse(get(`https://lrclib.net/api/search?q=${q}`).toString())
      .filter(r => r.syncedLyrics && (!durationS || !r.duration || Math.abs(r.duration - durationS) <= 4));
    res.sort((a, b) => Math.abs((a.duration || 0) - durationS) - Math.abs((b.duration || 0) - durationS));
    for (const r of res) {   // keep the first candidate whose lyrics contain the chorus
      const L = parseLrc(r.syncedLyrics);
      if (L.some(l => sim(l.text, lines[0]) >= 0.6)) { lrc = L; source = `LRCLIB #${r.id}`; break; }
    }
  } catch (e) { /* fall back below */ }

  // 4. Associer chaque vers du refrain à une ligne LRC (dans l'ordre)
  let times = null, end = null, songStart = 0;
  if (lrc) {
    // try every LRC line as a start, keep the best-scoring sequential alignment
    let best = null;
    for (let s = 0; s < lrc.length; s++) {
      if (sim(lrc[s].text, lines[0]) < 0.6) continue;
      let p = s, score = 0; const tt = [];
      for (const ln of lines) {
        let bi = -1, bs = 0;
        for (let j = p; j < Math.min(lrc.length, p + 3); j++) { const v = sim(lrc[j].text, ln); if (v > bs) { bs = v; bi = j; } }
        if (bi < 0 || bs < 0.4) { tt.push(null); continue; }
        tt.push(lrc[bi].t); score += bs; p = bi + 1;
      }
      if (!best || score > best.score) best = { score, tt, next: lrc[p] ? lrc[p].t : null };
    }
    if (best && best.tt.filter(x => x !== null).length >= Math.ceil(lines.length * 0.6)) {
      const tt = best.tt;
      // fill unmatched lines by interpolation
      for (let i = 0; i < tt.length; i++) if (tt[i] === null) {
        let a = i - 1; while (a >= 0 && tt[a] === null) a--; let b = i + 1; while (b < tt.length && tt[b] === null) b++;
        const ta = a >= 0 ? tt[a] : null, tb = b < tt.length ? tt[b] : null;
        tt[i] = ta !== null && tb !== null ? ta + (tb - ta) * (i - a) / (b - a) : ta !== null ? ta + 2 * (i - a) : tb - 2 * (b - i);
      }
      const last = tt[tt.length - 1];
      const endT = best.next && best.next > last ? Math.min(best.next, last + 5) : last + 3;
      songStart = +Math.max(0, tt[0] - LEAD).toFixed(2);
      times = tt.map(x => +(x - songStart).toFixed(2)); end = +(endT - songStart).toFixed(2);
    } else source = 'LRCLIB trouvé mais refrain non reconnu';
  }
  if (!times) {
    times = lines.map((_, i) => +(LEAD + i * FALLBACK_LINE).toFixed(2));
    end = +(LEAD + lines.length * FALLBACK_LINE).toFixed(2); songStart = null;
  }

  // 5. Rendu
  const cfg = { scene: 'vinyle.html', title, artist: artistNames.join(', '), coverPath, lines, times, end,
    songStart: songStart ?? 0, songDuration: durationS || 180 };
  const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'video';
  const cfgPath = path.join(outDir, `${slug}-video.json`); fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 1));
  if (!fs.existsSync(path.join(__dirname, 'node_modules', 'three'))) {
    const r = spawnSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: __dirname, stdio: 'inherit' }); if (r.status) fail('npm install a échoué');
  }
  const out = path.join(outDir, preview ? `${slug}-preview.jpg` : `${slug}-vinyle.mp4`);
  const rArgs = [path.join(__dirname, 'render.js'), cfgPath, out];
  if (preview) rArgs.push('--preview', [0.3, LEAD + 0.2, (times[1] ?? LEAD) + 0.4, end - 1].map(x => x.toFixed(2)).join(','));
  const r = spawnSync('node', rArgs, { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status) fail('le rendu a échoué');

  const mmss = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
  console.log(JSON.stringify({
    title, artists: artistNames, synchro: source,
    demarrage_son_tiktok: songStart === null ? null : mmss(songStart),
    duree_video_s: +(end + 0.8).toFixed(1), fichier: preview ? path.dirname(out) : out,
  }, null, 2));
})();
