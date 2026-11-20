#!/usr/bin/env node
// Génère les 2 slides d'un carrousel TikTok « lyrics » à partir d'un lien Spotify.
// Options : --3d (pochette en 3D sur la slide 1), --punch "..." (phrase culte en couleur), --signature "..."
// Usage : node make-slides.js <lien-spotify-track> <refrain.txt | -> <dossier-de-sortie> [--emoji "🍭"] [--artiste "Vacra, La Rvfleuze"]
//   --emoji   : emoji dans le coin en haut à gauche de la slide 1 (optionnel)
//   --artiste : nom affiché sous le titre (par défaut : artistes Spotify séparés par des virgules)
//   slide 1 : titre au milieu + pochette (à cheval sur les 2 slides)
//   slide 2 : refrain
// Prérequis réseau : open.spotify.com et i.scdn.co autorisés.
// Police : Nimbus Sans (clone de Helvetica) -> apt-get install -y fonts-urw-base35
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function fail(msg) { console.error('Erreur : ' + msg); process.exit(1); }

function get(url) {
  try {
    return execFileSync('curl', ['-sSfL', '-m', '20', url], { maxBuffer: 1 << 25, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    fail(`impossible de télécharger ${url}. Vérifie que open.spotify.com et i.scdn.co sont autorisés dans le réseau de l'environnement.\n${e.stderr || ''}`);
  }
}

(async () => {
  const args = process.argv.slice(2), opts = { emoji: '', artiste: null, punch: '', signature: '@repeatmusique', cover3d: false }, pos = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--emoji') opts.emoji = args[++i] || '';
    else if (args[i] === '--artiste') opts.artiste = args[++i] || '';
    else if (args[i] === '--3d') opts.cover3d = true;
    else if (args[i] === '--punch') opts.punch = args[++i] || '';
    else if (args[i] === '--signature') opts.signature = args[++i] ?? '';
    else pos.push(args[i]);
  }
  const [url, lyricsPath, outArg] = pos;
  if (!url || !outArg) fail('usage : node make-slides.js <lien-spotify-track> <refrain.txt | -> <dossier-de-sortie>');
  const m = url.match(/track\/([A-Za-z0-9]+)/);
  if (!m) fail(`ce n'est pas un lien de morceau Spotify (open.spotify.com/track/...) : ${url}`);
  const outDir = path.resolve(outArg);

  // Titre, artistes et pochette depuis la page « embed » publique de Spotify.
  const embed = get(`https://open.spotify.com/embed/track/${m[1]}`).toString();
  const nd = embed.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!nd) fail('la page Spotify a changé de format : infos du morceau introuvables.');
  const ent = JSON.parse(nd[1]).props.pageProps.state.data.entity;
  // « Cuenta (feat. Meryl & Shay) » -> « Cuenta » : les artistes sont déjà écrits sous le titre.
  const title = ent.name.replace(/\s*[([](feat|ft)\.?[^)\]]*[)\]]/i, '').trim() || ent.name;
  const artists = ent.artists.map(a => a.name).join(' & ');
  const img = ent.visualIdentity.image.sort((a, b) => b.maxWidth - a.maxWidth)[0].url;

  fs.mkdirSync(outDir, { recursive: true });
  const coverPath = path.join(outDir, 'cover.jpg');
  // Le CDN renvoyé par Spotify varie ; i.scdn.co sert les mêmes images.
  fs.writeFileSync(coverPath, get('https://i.scdn.co/image/' + img.split('/image/').pop()));

  const lyrics = lyricsPath && lyricsPath !== '-' ? fs.readFileSync(lyricsPath, 'utf8') : '';

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'generateur-slides.html'));
  await page.waitForTimeout(800);
  await page.fill('#title', title);
  await page.fill('#lyrics', lyrics);
  await page.fill('#artist', opts.artiste ?? ent.artists.map(a => a.name).join(', '));
  await page.fill('#emoji', opts.emoji);
  await page.fill('#punch', opts.punch);
  await page.fill('#sig', opts.signature);
  await page.setInputFiles('#cover', coverPath);
  if (opts.cover3d) {   // pochette en 3D : rendue à part, puis donnée au générateur
    const p3 = path.join(outDir, 'cover3d.png');
    const r3 = require('child_process').spawnSync('node', [path.join(__dirname, 'cover3d.js'), coverPath, p3], { stdio: 'inherit' });
    if (r3.status) fail('rendu 3D de la pochette impossible');
    const info = JSON.parse(fs.readFileSync(p3.replace(/\.png$/, '.json'), 'utf8'));
    await page.evaluate(async ({ src, bottom }) => { const i = new Image(); await new Promise(r => { i.onload = r; i.src = src; }); window.__cover3dImg = i; window.__cover3dBottom = bottom; },
      { src: 'data:image/png;base64,' + fs.readFileSync(p3).toString('base64'), bottom: info.bottom });
    await page.waitForTimeout(600);
    await page.fill('#title', title + ' '); await page.fill('#title', title);
  }
  await page.waitForTimeout(1500);

  const slug = title.toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'slides';
  const files = [];
  for (const [sel, n] of [['#out1', 1], ['#out2', 2]]) {
    const src = await page.getAttribute(sel, 'src');
    const file = path.join(outDir, `${slug}-${n}.png`);
    fs.writeFileSync(file, Buffer.from(src.split(',')[1], 'base64'));
    files.push(file);
  }
  await browser.close();
  console.log(JSON.stringify({ title, artists, files }, null, 2));
})();
