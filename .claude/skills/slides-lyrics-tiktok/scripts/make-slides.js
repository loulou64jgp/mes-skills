#!/usr/bin/env node
// Génère les 2 slides d'un carrousel TikTok « lyrics » à partir d'un lien Spotify.
// Usage : node make-slides.js <lien-spotify-track> <refrain.txt | -> <dossier-de-sortie> [--badge "#1 TOP 50"] [--accroche "Le son que tout TikTok utilise"]
//   --badge / --accroche : optionnels, en gras dans la couleur la plus vive de la pochette
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
  const args = process.argv.slice(2), opts = { badge: '', accroche: '' }, pos = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--badge') opts.badge = args[++i] || '';
    else if (args[i] === '--accroche') opts.accroche = args[++i] || '';
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
  const title = ent.name;
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
  await page.fill('#badge', opts.badge);
  await page.fill('#hook', opts.accroche);
  await page.setInputFiles('#cover', coverPath);
  await page.waitForTimeout(1500);

  const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
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
