const pptxgen = require('pptxgenjs');
const path = require('path');
const IMG = process.argv[2];           // dossier des images
const OUT = process.argv[3];           // fichier .pptx
const im = n => path.join(IMG, n + '.jpg');

const ECRU = 'EEE5D0', ECRU2 = 'F6F1E6', GAR = 'AE2A2C', VERT = '2E5B3F', NUIT = '1F3557', ENCRE = '2B211C', DOUX = '5A4A3F', BORD = 'D8CDB5', BLANC = 'FFFFFF';
const F = 'Inter';

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625
pres.title = 'Maison Pierre Oteiza — Stratégie de communication';
pres.theme = { headFontFace: F, bodyFontFace: F };

// ---------- layouts ----------
const bandes = (y0) => [
  { rect: { x: 0, y: y0, w: 10, h: 0.045, fill: { color: GAR } } },
  { rect: { x: 0, y: y0 + 0.075, w: 10, h: 0.11, fill: { color: VERT } } },
  { rect: { x: 0, y: y0 + 0.215, w: 10, h: 0.025, fill: { color: NUIT } } },
];
pres.defineSlideMaster({
  title: 'CONTENU', background: { color: ECRU },
  objects: [
    ...bandes(5.33),
    { text: { text: 'Maison Pierre Oteiza · Stratégie de communication', options: { x: 0.5, y: 5.06, w: 6, h: 0.22, fontFace: F, fontSize: 8, color: DOUX, margin: 0 } } },
  ],
  slideNumber: { x: 9.0, y: 5.06, w: 0.5, h: 0.22, fontFace: F, fontSize: 8, color: DOUX, align: 'right' },
});
pres.defineSlideMaster({ title: 'SEPARATION', background: { color: VERT }, objects: [] });

// ---------- helpers ----------
let section = '';
function contenu(titre) {
  const s = pres.addSlide({ masterName: 'CONTENU', sectionTitle: section });
  s.addText(titre, { x: 0.5, y: 0.32, w: 9, h: 0.6, fontFace: F, fontSize: 24, bold: true, color: VERT, margin: 0, valign: 'middle', isTextBox: true });
  return s;
}
function txt(s, t, o) { s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: ENCRE, margin: 0, valign: 'top', isTextBox: true, paraSpaceAfter: 4 }, o)); }
function carte(s, x, y, w, h, fill) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || BLANC }, line: { color: fill || BLANC }, shadow: { type: 'outer', color: '000000', opacity: 0.12, blur: 6, offset: 2, angle: 90 } }); }
function bloc(s, x, y, w, h, titre, corps, opt = {}) {
  carte(s, x, y, w, h, opt.fill);
  const tc = opt.fill === VERT || opt.fill === GAR ? ECRU : (opt.tc || GAR);
  const bc = opt.fill === VERT || opt.fill === GAR ? ECRU : ENCRE;
  s.addText([{ text: titre, options: { bold: true, color: tc, fontSize: opt.ts || 13, breakLine: true } }, ...(Array.isArray(corps) ? corps : [{ text: corps, options: { color: bc, fontSize: opt.bs || 11 } }])],
    { x: x + 0.18, y: y + 0.15, w: w - 0.36, h: h - 0.3, fontFace: F, margin: 0, valign: 'top', isTextBox: true, paraSpaceAfter: 5 });
}
function puces(items, size = 11, color = ENCRE) {
  return items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, fontSize: size, color, breakLine: i < items.length - 1 } }));
}
function tableau(s, rows, o) {
  const head = rows[0].map(c => ({ text: c, options: { bold: true, color: ECRU, fill: { color: VERT }, fontSize: o.hs || 10 } }));
  const body = rows.slice(1).map((r, i) => r.map((c, j) => {
    const base = { fontSize: o.fs || 9.5, color: ENCRE, fill: { color: i % 2 ? ECRU2 : BLANC } };
    if (j === 0 && o.firstBold !== false) Object.assign(base, { bold: true, color: o.firstColor || VERT });
    if (o.num && o.num.includes(j)) base.align = 'right';
    if (o.boldRows && o.boldRows.includes(i)) Object.assign(base, { bold: true });
    return typeof c === 'string' ? { text: c, options: base } : { text: c.text, options: Object.assign(base, c.options || {}) };
  }));
  s.addTable([head, ...body], { x: o.x || 0.5, y: o.y || 1.1, w: o.w || 9, colW: o.colW, fontFace: F, border: { type: 'solid', pt: 0.5, color: BORD }, margin: [3, 5, 3, 5], valign: 'middle', autoPage: false });
}
function separation(num, titre, sous, photo) {
  section = 'Séance ' + num; pres.addSection({ title: section });
  const s = pres.addSlide({ masterName: 'SEPARATION', sectionTitle: section });
  [[5.33, 0.045, GAR], [5.405, 0.11, ECRU], [5.545, 0.025, GAR]].forEach(([y, h, c]) => s.addShape(pres.shapes.RECTANGLE, { x: 0, y, w: 10, h, fill: { color: c }, line: { color: c } }));
  txt(s, 'Séance ' + num, { x: 0.5, y: 1.6, w: 9, h: 2.0, fontSize: 96, bold: true, color: ECRU, align: 'center', valign: 'middle' });
  return s;
}
function chiffre(s, x, y, w, grand, petit, col = GAR) {
  txt(s, grand, { x, y, w, h: 0.75, fontSize: 40, bold: true, color: col, valign: 'bottom' });
  txt(s, petit, { x, y: y + 0.8, w, h: 0.55, fontSize: 10.5, color: DOUX });
}

// ================= COUVERTURE =================
section = 'Ouverture'; pres.addSection({ title: section });
let s = pres.addSlide({ sectionTitle: section }); s.background = { color: ECRU };
[[5.33, 0.045, GAR], [5.405, 0.11, VERT], [5.545, 0.025, NUIT]].forEach(([y, h, c]) => s.addShape(pres.shapes.RECTANGLE, { x: 0, y, w: 10, h, fill: { color: c }, line: { color: c } }));
txt(s, 'MAISON PIERRE OTEIZA · LES ALDUDES', { x: 0.5, y: 1.25, w: 9, h: 0.3, fontSize: 11, bold: true, color: VERT, charSpacing: 2, align: 'center' });
txt(s, 'Stratégie de communication', { x: 0.3, y: 1.7, w: 9.4, h: 1.0, fontSize: 42, bold: true, color: ENCRE, align: 'center', valign: 'middle' });
txt(s, 'Cas Pierre Oteiza · Séances 1 à 7', { x: 0.5, y: 3.0, w: 9, h: 0.3, fontSize: 12, color: DOUX, align: 'center' });

// ================= SOMMAIRE =================
s = contenu('Sommaire');
const som = [['1', 'Brief et diagnostic', 'Brief, fiche annonceur, SWOT, PESTEL'], ['2', 'Positionnement, cibles et objectifs', 'Positionnement, cibles, objectifs CAC'], ['3', 'Mix de communication', 'État des lieux, solutions, quatre questions'], ['4', 'Stratégie digitale', 'Plateformes, banque d’idées, calendriers, prototypes'], ['5', 'Budget, planning et KPI', 'Budget ventilé, Gantt sur 12 semaines, indicateurs'], ['6', 'Création graphique', 'Brief créatif, affiche A3, justification'], ['7', 'Ambassadorat', 'Journée des Ambassadeurs, post LinkedIn']];
som.forEach((r, i) => {
  const col = i % 2, row = Math.floor(i / 2), x = i === 6 ? 2.8 : 0.5 + col * 4.6, y = 1.05 + row * 0.98;
  carte(s, x, y, 4.4, 0.85);
  s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.15, w: 0.56, h: 0.56, fill: { color: i % 2 ? VERT : GAR }, line: { color: i % 2 ? VERT : GAR } });
  txt(s, r[0], { x: x + 0.2, y: y + 0.15, w: 0.56, h: 0.56, fontSize: 18, bold: true, color: ECRU, align: 'center', valign: 'middle' });
  txt(s, r[1], { x: x + 0.95, y: y + 0.13, w: 3.3, h: 0.32, fontSize: 13, bold: true });
  txt(s, r[2], { x: x + 0.95, y: y + 0.47, w: 3.3, h: 0.3, fontSize: 10, color: DOUX });
});

// ================= SÉANCE 1 =================
separation(1, 'Brief et diagnostic', 'Comprendre l’annonceur, son marché et son enjeu de communication', 'aldudes');

s = contenu('Le brief');
txt(s, 'Notre annonceur est la Maison Pierre Oteiza, entreprise familiale implantée aux Aldudes, au cœur du Pays Basque. Fondée en 1987, la maison s’est développée autour d’un savoir-faire artisanal et d’un fort attachement au territoire, notamment à travers la sauvegarde et la valorisation du porc basque.', { x: 0.5, y: 1.15, w: 4.3, h: 2.2, fontSize: 13 });
chiffre(s, 0.5, 3.35, 2, '1987', 'Fondation aux Aldudes');
chiffre(s, 2.3, 3.35, 2.6, '≈ 40 ans', 'de savoir-faire artisanal');
carte(s, 5.2, 1.15, 4.3, 3.6, GAR);
txt(s, 'Problématique', { x: 5.45, y: 1.35, w: 3.8, h: 0.3, fontSize: 12, bold: true, color: 'F3D0C4' });
txt(s, 'Cependant, la Maison rencontre un enjeu important de visibilité auprès des jeunes consommateurs. L’objectif est donc de moderniser sa communication et de renforcer sa présence digitale afin de séduire une nouvelle génération, tout en conservant son authenticité, son savoir-faire artisanal et son ancrage territorial.', { x: 5.45, y: 1.75, w: 3.8, h: 2.8, fontSize: 14, bold: true, color: ECRU });

s = contenu('Fiche annonceur');
tableau(s, [['Rubrique', 'Informations'],
  ['Origine', 'Créée en 1987 par Pierre et Catherine Oteiza aux Aldudes.'],
  ['Secteur d’activité', 'Agroalimentaire / charcuterie artisanale / produits du terroir'],
  ['Modèle économique', 'Production de produits alimentaires, vente directe, boutiques physiques, vente en ligne, restauration et développement d’une expérience touristique autour du terroir et du savoir-faire basque'],
  ['Implantation géographique', 'Siège et site de production aux Aldudes ; boutiques aux Aldudes, à Ainhoa, Saint-Jean-de-Luz, Capbreton, Biarritz, Bayonne, Bordeaux et Paris ; vente en ligne en France et en Europe.'],
  ['Communication', 'Site e-commerce, réseaux sociaux, newsletter et offres commerciales, relations presse, événements gastronomiques et locaux (Foire au jambon de Bayonne), communication en boutique et réseau d’ambassadeurs.'],
  [{ text: 'Slogan' }, { text: 'Vivre et travailler au Pays Basque', options: { bold: true, color: GAR } }]],
  { y: 1.1, colW: [2.1, 6.9], fs: 12.5, hs: 12 });

s = contenu('SWOT — analyse interne');
tableau(s, [['', 'Forces', 'Faiblesses'],
  ['Annonceur', 'Produits locaux d’exception (Jambon de Kintoa AOP)\nIdentité familiale et humaine forte\nAncrage territorial\nPrès de 40 ans d’existence\nDistribution multicanale : boutiques, e-commerce, ambassadeurs', 'Image pouvant être perçue comme traditionnelle voire vieillissante chez les jeunes consommateurs.\nPrix élevés pour une consommation régulière.\nNotoriété plus faible hors du Pays Basque.'],
  ['Valeurs / RSE', 'Engagement historique pour la sauvegarde du porc basque\nSoutien à une filière agricole et à des producteurs locaux.', 'Positionnement responsable qui pourrait être davantage valorisé dans la communication'],
  ['Com. antérieure', 'Boutiques, site web, réseaux sociaux, newsletter, relations presse et événements (Foire au jambon de Bayonne)', 'Communication encore très orientée vers le terroir et la tradition → frein pour certains jeunes consommateurs.']],
  { colW: [1.6, 3.7, 3.7], fs: 12, hs: 12 });

s = contenu('SWOT — analyse externe');
tableau(s, [['', 'Opportunités', 'Menaces'],
  ['Environnement (PESTEL)', 'Intérêt croissant pour le local et la traçabilité\nEssor du tourisme gastronomique et expérientiel\nAOP valorisant l’origine et la qualité', 'Inflation et baisse du pouvoir d’achat\nRemise en question de l’impact environnemental de l’élevage\nRéglementation stricte (étiquetage, allégations)'],
  ['Offre', 'Valorisation de l’expérience touristique aux Aldudes\nSe différencier grâce au porc basque, au Jambon de Kintoa AOP et au savoir-faire artisanal', 'Forte concurrence des producteurs et charcutiers artisanaux du Pays Basque\nConcurrence des marques gastronomiques premium françaises et des producteurs espagnols de jambon ibérique'],
  ['Demande', 'Développement du tourisme expérientiel', 'Une partie des jeunes consommateurs peut privilégier des produits moins chers']],
  { colW: [1.6, 3.7, 3.7], fs: 12, hs: 12 });

s = contenu('PESTEL');
tableau(s, [['', 'Opportunités', 'Menaces'],
  ['Politique', 'Soutien possible aux filières agricoles et aux productions locales', 'Évolution des politiques agricoles et des aides'],
  ['Économique', 'Développement du tourisme et de la consommation gastronomique', 'Inflation et baisse du pouvoir d’achat'],
  ['Social', 'Intérêt croissant pour le local', 'Évolution des habitudes alimentaires et recherche de prix plus bas'],
  ['Technologique', 'Réseaux sociaux, e-commerce', 'Forte concurrence digitale et nécessité de renouveler régulièrement les contenus'],
  ['Environnemental', 'Valorisation de l’élevage local', 'Enjeux liés à l’impact environnemental de l’élevage et aux attentes écologiques'],
  ['Légal', 'AOP permettant de valoriser l’origine et la qualité des produits', 'Réglementations strictes concernant l’étiquetage, l’alimentation et les allégations environnementales']],
  { colW: [1.6, 3.7, 3.7], fs: 12, hs: 12 });

s = contenu('Diagnostic : un paradoxe');
txt(s, 'L’analyse SWOT fait ressortir un paradoxe : les principaux atouts de la Maison Pierre Oteiza sont aussi à l’origine de sa principale faiblesse auprès des jeunes consommateurs.', { x: 0.5, y: 1.05, w: 9, h: 0.75, fontSize: 14, bold: true, color: GAR });
bloc(s, 0.5, 1.95, 4.4, 2.9, 'Forces', 'La Maison dispose d’un capital de marque rare : près de 40 ans d’histoire, une famille qui incarne la marque, un engagement reconnu pour la sauvegarde du porc basque Pie Noir et un produit phare, le Jambon de Kintoa AOP. Elle s’appuie aussi sur une distribution multicanale (boutiques, e-commerce, ambassadeurs) et sur une véritable expérience touristique aux Aldudes.', { fill: VERT, bs: 12.5, ts: 14 });
bloc(s, 5.1, 1.95, 4.4, 2.9, 'Faiblesses', 'Cette identité très patrimoniale peut paraître traditionnelle, voire vieillissante, pour les 25-40 ans. La communication reste centrée sur le terroir et sur les offres commerciales, et valorise encore peu l’engagement responsable de la Maison, alors qu’il répond directement aux attentes de cette cible (local, traçabilité, lien avec les producteurs).', { bs: 12.5, ts: 14 });

s = contenu('Environnement et enjeu de communication');
bloc(s, 0.5, 1.1, 4.4, 3.75, 'Environnement', 'Le contexte est plutôt favorable : intérêt croissant pour le local, essor du tourisme expérientiel et réseaux sociaux propices aux contenus gastronomiques. Les menaces tiennent surtout au prix (inflation, recherche de produits moins chers), à une concurrence nombreuse qui revendique elle aussi l’authenticité, et aux interrogations sur la consommation de viande.', { bs: 14, ts: 15 });
bloc(s, 5.1, 1.1, 4.4, 3.75, 'Enjeu de communication', 'La Maison n’a pas besoin de changer son discours, mais la manière de le raconter. Il s’agit de transformer son patrimoine (histoire, gestes, territoire) en contenus actuels et en expériences à vivre, afin de justifier son prix premium et de créer de la désirabilité auprès des 25-40 ans, sans perdre la clientèle fidèle des 35-65 ans.', { fill: GAR, bs: 14.5, ts: 15 });

// ================= SÉANCE 2 =================
separation(2, 'Positionnement, cibles et objectifs', 'À qui parler, avec quelle identité, pour obtenir quoi', 'rencontre');

s = contenu('Positionnement');
txt(s, 'Le positionnement de Pierre Oteiza peut être résumé par trois éléments :', { x: 0.5, y: 1.05, w: 9, h: 0.35, fontSize: 13, bold: true, color: GAR });
[['Un produit d’exception', 'Nous pouvons qualifier son positionnement de premium gastronomique. Les produits proposés, comme le Jambon de Kintoa AOP, nécessitent des matières premières de qualité, un savoir-faire spécifique et parfois plusieurs années d’affinage. Le prix des produits reflète donc leur qualité, leur origine, leur rareté et le travail artisanal réalisé.'],
 ['Un terroir basque fort', 'La marque possède un fort ancrage territorial. Pierre Oteiza a fondé sa Maison aux Aldudes et a construit son identité autour du Pays Basque. Cette dimension est renforcée par son identité familiale et humaine, ainsi que par son soutien aux agriculteurs et aux producteurs locaux.'],
 ['Une histoire humaine et familiale', 'La Maison repose sur un savoir-faire artisanal développé depuis près de 40 ans. Pierre Oteiza est notamment engagé depuis les années 1980 dans la sauvegarde du porc basque Pie Noir. Cet engagement permet de ne pas seulement vendre de la charcuterie, mais également de raconter une histoire, un territoire et un savoir-faire.']]
 .forEach((c, i) => bloc(s, 0.5 + i * 3.05, 1.55, 2.9, 3.3, c[0], c[1], { fill: i === 1 ? VERT : undefined, bs: 11.5, ts: 14 }));

const cibles = [['Cibles', 'Motivations', 'Freins possibles'],
  ['Cible principale : adultes de 35 à 65 ans, amateurs de gastronomie et de produits du terroir', 'Hédonistes : déguster des produits artisanaux de qualité.\nOblatives : partager de bons produits avec ses proches.\nD’auto-expression : affirmer son goût pour la gastronomie et l’authenticité.', 'Prix élevés pour une consommation régulière ; volonté de limiter sa consommation de charcuterie ; habitudes d’achat auprès de concurrents.'],
  ['Cœur de cible : habitants du Pays Basque recherchant des produits authentiques et de qualité', 'Hédonistes : retrouver les saveurs du terroir basque.\nOblatives : faire découvrir les spécialités locales à son entourage.\nD’auto-expression : exprimer son attachement au Pays Basque et soutenir les producteurs locaux.', 'Fidélité à d’autres artisans locaux ; prix perçus comme élevés ; sentiment de trouver des produits similaires moins chers à proximité.'],
  ['Cible secondaire : clientèle CSP+, touristes et clientèle nationale intéressée par la gastronomie', 'Hédonistes : découvrir des spécialités basques et savourer des produits d’exception.\nOblatives : offrir un souvenir gourmand ou un cadeau de qualité.\nD’auto-expression : affirmer son goût pour le savoir-faire artisanal.', 'Méconnaissance de la marque ; difficulté à comprendre ce qui justifie le prix ; contraintes de transport et de conservation ; frais de livraison pour les achats à distance.'],
  ['Entreprises : cadeaux et coffrets', 'Oblatives : remercier les clients, partenaires et salariés.\nD’auto-expression : transmettre une image de l’entreprise associée à la qualité et au terroir.', 'Budget limité par cadeau ; contraintes de livraison et de commande en volume ; produits à base de porc inadaptés à certains régimes alimentaires.'],
  ['Relais : journalistes', 'Motivations professionnelles : faire découvrir une histoire familiale, un savoir-faire artisanal et le patrimoine gastronomique basque ; proposer un sujet intéressant à leur public.', 'Manque de nouveauté ou d’actualité ; message trop commercial ; sujet déjà traité ; manque d’informations ou de visuels exploitables.'],
  ['Cible interne : salariés et famille Oteiza', 'Hédonistes : prendre plaisir à exercer et transmettre un savoir-faire.\nD’auto-expression : être fier de contribuer à une Maison familiale et de défendre les valeurs du terroir basque.', 'Éventuel manque de reconnaissance ou d’information ; résistance au changement ; crainte que le développement commercial éloigne la Maison de ses valeurs artisanales.']];
s = contenu('Cibles, motivations et freins (1/2)');
tableau(s, [cibles[0], ...cibles.slice(1, 4)], { colW: [2.4, 3.6, 3.0], fs: 10, hs: 11 });
s = contenu('Cibles, motivations et freins (2/2)');
tableau(s, [cibles[0], ...cibles.slice(4, 7)], { colW: [2.4, 3.6, 3.0], fs: 11, hs: 11.5 });

s = contenu('Objectifs de communication : le modèle CAC');
[['Cognitif', 'Faire savoir', ['Faire connaître la Maison Pierre Oteiza auprès des amateurs de gastronomie, des touristes et de la clientèle nationale.', 'Faire découvrir ses spécialités, notamment le Jambon de Kintoa AOP.', 'Expliquer son savoir-faire artisanal, l’origine des produits et son engagement dans la sauvegarde du porc basque Pie Noir, afin de mieux faire comprendre son positionnement premium.']],
 ['Affectif', 'Faire aimer', ['Valoriser l’authenticité de la Maison, son histoire familiale et son ancrage au Pays Basque.', 'Renforcer l’attachement des habitants à une marque qui représente leur territoire.', 'Créer une préférence auprès des amateurs de gastronomie en mettant en avant la qualité des produits et la dimension humaine de la Maison.']],
 ['Conatif', 'Faire agir', ['Inciter les consommateurs à visiter les boutiques et à découvrir les produits lors de dégustations.', 'Encourager l’achat, pour se faire plaisir ou offrir un cadeau.', 'Inciter les entreprises à choisir les coffrets pour leurs cadeaux professionnels et encourager les journalistes à consacrer un sujet à la Maison.']]]
 .forEach((c, i) => {
   const x = 0.5 + i * 3.05; const fill = [BLANC, BLANC, BLANC][i];
   carte(s, x, 1.1, 2.9, 3.75, fill);
   s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.1, w: 2.9, h: 0.72, rectRadius: 0.08, fill: { color: [GAR, VERT, NUIT][i] }, line: { color: [GAR, VERT, NUIT][i] } });
   txt(s, [{ text: c[0].toUpperCase(), options: { bold: true, fontSize: 13, breakLine: true } }, { text: c[1], options: { fontSize: 11 } }], { x: x + 0.18, y: 1.18, w: 2.6, h: 0.6, color: ECRU, valign: 'middle' });
   txt(s, puces(c[2], 11.5), { x: x + 0.18, y: 1.95, w: 2.6, h: 2.8, paraSpaceAfter: 5 });
 });

// ================= SÉANCE 3 =================
separation(3, 'Mix de communication', 'De la communication actuelle aux cinq solutions retenues', 'tranches');

s = contenu('État des lieux de la communication actuelle');
txt(s, 'La Maison Pierre Oteiza utilise déjà plusieurs moyens de communication pour valoriser ses produits, son histoire et son terroir :', { x: 0.5, y: 1.0, w: 9, h: 0.4, fontSize: 12, color: DOUX });
bloc(s, 0.5, 1.5, 2.9, 3.35, 'Médias', 'Pierre Oteiza bénéficie de retombées dans la presse, notamment dans Le Figaro, qui a mis en avant son taloa parisien. Cette visibilité renforce la notoriété et la crédibilité de la Maison. Elle permet aussi de présenter une image plus actuelle de la gastronomie basque.', { bs: 11.5, ts: 14 });
bloc(s, 3.55, 1.5, 2.9, 3.35, 'Hors-média', 'La Maison utilise les relations presse, les événements gastronomiques et locaux comme la Foire au jambon de Bayonne, ainsi que la communication en boutique et son réseau d’ambassadeurs. Aux Aldudes, les dégustations, la restauration et le sentier pédagogique permettent également de faire découvrir son univers. Ces moyens sont cohérents avec son identité : ils favorisent le contact direct, valorisent le savoir-faire et renforcent l’attachement au terroir basque.', { bs: 10.5, ts: 14, fill: VERT });
bloc(s, 6.6, 1.5, 2.9, 3.35, 'Digital', 'Pierre Oteiza possède un site e-commerce, des réseaux sociaux et une newsletter diffusant notamment des offres commerciales. La marque partage également des contenus sur les recettes, le terroir et la famille. Ces supports permettent de vendre à distance et d’entretenir la relation avec les clients.', { bs: 11.5, ts: 14 });

const mix = [['Solution détaillée', 'Objectif visé', 'Cible principalement touchée', 'Justification'],
  ['MÉDIA — Publicité dans un magazine local ou touristique.\nDiffuser un encart en avril-mai présentant une escapade gourmande aux Aldudes.', 'Cognitif.\nFaire connaître l’expérience proposée aux Aldudes.', 'Touristes et jeunes actifs de la région.', 'Présenter la Maison comme un lieu à découvrir, en associant gastronomie, paysages et rencontre avec les producteurs.'],
  ['HORS-MÉDIA — Ateliers « Apéro basque ».\nProposer des ateliers sur inscription pour apprendre à composer une planche et découvrir les produits avec un membre de l’équipe.', 'Affectif et conatif.\nRenforcer l’attachement à la marque et inciter à essayer les produits.', 'Jeunes actifs de 25 à 40 ans, habitants et touristes.', 'Faire participer les consommateurs à une expérience conviviale qui valorise la transmission du savoir-faire, en utilisant les lieux existants.'],
  ['HORS-MÉDIA — Boutique éphémère chez un partenaire.\nInstaller un espace de découverte dans un lieu urbain lié à la gastronomie, pendant un week-end.', 'Cognitif et conatif.\nFaire découvrir la maison et encourager l’achat de coffrets.', 'Urbains de 25 à 40 ans.', 'Rencontrer de nouveaux consommateurs qui ne fréquentent pas les boutiques de la maison, avec une présentation soignée reflétant son positionnement premium.'],
  ['DIGITAL — Série vidéo « Une minute aux Aldudes ».\nPublier de courts épisodes sur les gestes artisanaux, les producteurs et la transmission entre Pierre et Frantxoa.', 'Cognitif et affectif.\nExpliquer le savoir-faire et moderniser l’image de la Maison.', '25-40 ans sensibles à l’origine des produits et à la traçabilité.', 'Raconter l’histoire de la Maison dans un format court et actuel, tout en préservant son authenticité grâce aux personnes et aux gestes réels.'],
  ['DIGITAL — Collaboration avec des microcréateurs de contenu.\nInviter quelques créateurs spécialisés en gastronomie et tourisme à découvrir les Aldudes et à partager leur expérience.', 'Cognitif et affectif.\nDévelopper la visibilité et donner envie de découvrir la Maison.', 'Jeunes amateurs de gastronomie et touristes.', 'Toucher de nouveaux publics grâce à des créateurs dont l’audience et les valeurs correspondent à celles de la Maison.']];
s = contenu('Proposition d’un mix de communication (1/2)');
tableau(s, [mix[0], ...mix.slice(1, 4)], { colW: [3.0, 2.0, 1.6, 2.4], fs: 10.5, hs: 11 });
s = contenu('Proposition d’un mix de communication (2/2)');
tableau(s, [mix[0], ...mix.slice(4, 6)], { colW: [3.0, 2.0, 1.6, 2.4], fs: 12, hs: 11 });

s = contenu('Quatre questions pour valider le mix');
bloc(s, 0.5, 1.05, 4.4, 2.2, '1. Chaque support est-il cohérent avec le positionnement ?', 'Oui, les cinq solutions valorisent les différentes dimensions de son positionnement. La publicité présente le territoire et l’expérience des Aldudes, tandis que les ateliers permettent de transmettre le savoir-faire. La boutique éphémère met en avant les produits dans un cadre soigné. Enfin, les vidéos et les collaborations avec des créateurs modernisent la communication tout en conservant une dimension humaine et authentique. Le choix des partenaires et des créateurs devra rester cohérent avec cette identité.', { ts: 11, bs: 9.5 });
bloc(s, 5.1, 1.05, 4.4, 2.2, '2. Au moins un support couvre-t-il chaque objectif CAC ?', 'Oui, les trois objectifs sont couverts. L’objectif cognitif est présent à travers la publicité, la boutique éphémère, les vidéos et les créateurs, qui font connaître la Maison. L’objectif affectif repose sur les ateliers, les vidéos et les collaborations, qui renforcent l’attachement à la marque. Enfin, l’objectif conatif est couvert par les ateliers et la boutique éphémère, qui encouragent l’essai et l’achat.', { ts: 11, bs: 9.5 });
bloc(s, 0.5, 3.4, 9.0, 1.45, '4. Au moins un support touche-t-il la cible principale identifiée en séance 2 ?', 'Les ateliers et la publicité locale peuvent toucher les 35-65 ans amateurs de gastronomie, identifiés comme cible principale dans notre première analyse. Les vidéos, les microcréateurs et la boutique éphémère visent davantage les 25-40 ans urbains, qui constituent la cible à développer selon le brief. Le mix permet donc de conserver un lien avec la clientèle actuelle tout en attirant de nouveaux consommateurs.', { ts: 12, bs: 10.5, fill: VERT });

s = contenu('3. Le mix est-il réaliste au regard du budget ?');
txt(s, 'Le mix reste réaliste dans l’enveloppe de 15 000 à 25 000 € par an, à condition de limiter l’ampleur des actions : les ateliers utilisent les lieux existants, la boutique éphémère ne dure qu’un week-end, les vidéos sont réalisées lors de tournages regroupés, le nombre de microcréateurs est limité et la publicité est concentrée sur les périodes prioritaires.', { x: 0.5, y: 1.05, w: 5.4, h: 1.3, fontSize: 11 });
tableau(s, [['Action (répartition indicative)', 'Montant'],
  ['Encart dans un magazine local ou touristique (avril-mai)', '3 500 €'],
  ['Ateliers « Apéro basque » (environ 6 sessions)', '2 000 €'],
  ['Boutique éphémère (un week-end)', '4 500 €'],
  ['Série vidéo « Une minute aux Aldudes » (2 jours de tournage, 8 à 10 épisodes)', '6 000 €'],
  ['Microcréateurs (4 à 5 créateurs)', '3 500 €'],
  ['Sponsorisation des publications Instagram et Facebook', '2 000 €']],
  { x: 0.5, y: 2.45, w: 5.4, colW: [4.4, 1.0], fs: 10.5, num: [1], firstBold: false });
carte(s, 6.2, 1.05, 3.3, 3.8, GAR);
txt(s, '21 500 €', { x: 6.4, y: 1.4, w: 2.9, h: 0.8, fontSize: 38, bold: true, color: ECRU });
txt(s, 'soit le milieu de la fourchette.', { x: 6.4, y: 2.2, w: 2.9, h: 0.35, fontSize: 12, color: ECRU });
txt(s, 'La marge restante (environ 3 500 €) peut couvrir les imprévus ou renforcer la période de novembre-décembre.', { x: 6.4, y: 2.8, w: 2.9, h: 1.6, fontSize: 12, color: 'F3D0C4' });

// ================= SÉANCE 4 =================
separation(4, 'Stratégie digitale', 'Plateformes, calendrier éditorial et contenus prototypes', 'planche');

s = contenu('Deux plateformes prioritaires');
[['Instagram', ['Nous choisissons Instagram pour toucher les jeunes actifs de 25 à 40 ans, amateurs de gastronomie et touristes à la recherche d’une expérience authentique. Cette plateforme permet de valoriser les produits, les paysages basques et les gestes artisanaux à travers des contenus visuels, tout en modernisant l’image de la Maison.', 'Nous privilégierons les Reels, notamment avec la série « Une minute aux Aldudes », pour présenter les producteurs, les coulisses et des idées d’apéritifs.', 'Nous prévoyons deux publications par mois (le 1er et le 3e mardi), complétées par des stories régulières (sondages, questions, coulisses).'], GAR],
 ['Facebook', ['Nous choisissons Facebook en complément pour toucher les habitants de la région, notamment notre cible principale des 35-65 ans, et les touristes préparant leur séjour. L’objectif sera de faire découvrir la Maison à travers des expériences accessibles et conviviales, notamment les ateliers « Apéro basque » et les visites aux Aldudes.', 'Nous privilégierons les publications photo accompagnées d’un texte court et les événements Facebook, afin de donner envie de participer.', 'Nous prévoyons deux publications par mois (le 2e et le 4e jeudi), avec des rappels à l’approche des événements.'], VERT]]
 .forEach((c, i) => {
   const x = 0.5 + i * 4.6; carte(s, x, 1.1, 4.4, 3.75);
   s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.18, y: 1.25, w: 1.5, h: 0.42, rectRadius: 0.2, fill: { color: c[2] }, line: { color: c[2] } });
   txt(s, c[0], { x: x + 0.18, y: 1.25, w: 1.5, h: 0.42, fontSize: 13, bold: true, color: ECRU, align: 'center', valign: 'middle' });
   txt(s, puces(c[1], 11), { x: x + 0.2, y: 1.8, w: 4.0, h: 2.95, paraSpaceAfter: 6 });
 });

const pil = (titre, st, av, mai) => {
  s = contenu('Banque d’idées — ' + titre);
  tableau(s, [['', 'Produit', 'Recette', 'Lifestyle', 'Pop culture'], ['Sous-thème', ...st], ['Avril', ...av], ['Mai', ...mai]], { colW: [0.9, 2.025, 2.025, 2.025, 2.025], fs: 9.5, hs: 11 });
};
pil('Pilier 1 : Informer', ['Origine et savoir-faire', 'Conseils de préparation', 'Vie aux Aldudes', 'Décryptage des tendances culinaires'],
  ['Reel Instagram\nLe porc basque Pie Noir : présenter la race, son élevage en plein air et ses liens avec le territoire.', 'Carrousel Instagram\nBien préparer une planche basque : expliquer la découpe, les portions et la présentation des produits.', 'Post photo Facebook\nDans les coulisses de la Maison : présenter le quotidien d’un artisan et les étapes de son travail.', 'Reel Instagram\nLe taloa, la street-food basque : expliquer ses origines et la manière dont il se déguste aujourd’hui.'],
  ['Reel Instagram\nLes secrets de l’affinage : expliquer le rôle du temps dans le développement du goût du jambon.', 'Carrousel Instagram\nCuisiner avec la ventrèche : présenter ce produit et expliquer comment l’utiliser dans une recette simple.', 'Post photo Facebook\nUne histoire de famille : présenter Pierre, Catherine et Frantxoa et la transmission du savoir-faire.', 'Carrousel Instagram\nLes planches apéritives sur les réseaux : décrypter leur présentation et expliquer comment y intégrer des spécialités basques.']);
pil('Pilier 2 : Inspirer', ['Plaisir et découverte des saveurs', 'Cuisine simple et conviviale', 'Escapades gourmandes au Pays Basque', 'Tendances culinaires revisitées'],
  ['Carrousel Instagram\nUne planche aux couleurs du Pays Basque : mettre en scène une sélection de charcuteries pour donner envie de découvrir les saveurs de la Maison.', 'Reel Instagram\nUn taloa pour le brunch du dimanche : proposer une recette gourmande à préparer entre amis avec des produits de la Maison.', 'Post photo Facebook\nUn week-end pour déconnecter aux Aldudes : montrer une escapade mêlant paysages, rencontre avec les producteurs et dégustation.', 'Reel Instagram\nLe brunch prend l’accent basque : revisiter ce rendez-vous convivial avec un taloa, du jambon et des spécialités locales.'],
  ['Carrousel Instagram\nLes saveurs basques à emporter : présenter une sélection de produits dans un cadre de pique-nique printanier.', 'Reel Instagram\nDes bouchées basques à partager : proposer des idées de pintxos simples pour les premiers repas en terrasse.', 'Post photo Facebook\nUne table entre amis au grand air : mettre en scène un moment convivial autour des produits, dans un paysage basque.', 'Reel Instagram\nLa tendance des apéro boards, version basque : imaginer une planche à partager, esthétique et gourmande, inspirée des présentations des réseaux sociaux.']);
pil('Pilier 3 : Engager', ['Préférences et découvertes', 'Participation culinaire', 'Expériences partagées', 'Défis et votes'],
  ['Story Instagram avec sondage\nLe duel des saveurs : proposer un vote entre jambon et saucisson : « Lequel est indispensable sur votre planche ? »', 'Story Instagram avec sondages\nComposez votre taloa : faire voter les abonnés entre plusieurs garnitures, puis réaliser la recette préférée en vidéo.', 'Post photo Facebook\nVotre escapade idéale aux Aldudes : demander en commentaire de choisir entre balade, rencontre avec un producteur et dégustation.', 'Carrousel Instagram\nLe casting de votre apéro : présenter les profils amusants d’un groupe d’amis : celui qui prépare, celui qui goûte tout, celui qui arrive en retard. Inviter les abonnés à reconnaître leurs amis.'],
  ['Story Instagram avec question\nCréez votre sélection pour un pique-nique : présenter plusieurs produits et demander aux abonnés de choisir leurs trois incontournables.', 'Reel Instagram\nÀ vous de dresser la planche : montrer un exemple, puis inviter les abonnés à partager leur création en story en identifiant la Maison.', 'Post photo Facebook\nVotre coin préféré du Pays Basque : demander à la communauté de partager ses lieux favoris pour un pique-nique et à raconter un souvenir associé.', 'Story Instagram avec boîte à questions\nLe défi « Mon apéro basque en trois mots » : inviter les abonnés à décrire leur moment idéal avec trois mots ou trois emojis.']);

['avril', 'mai'].forEach(m => {
  s = contenu('Calendrier de publication — ' + m + ' 2027');
  s.addImage({ path: im('cal-' + m), x: (10 - 4.0 * 2000 / 1350) / 2, y: 0.98, w: 4.0 * 2000 / 1350, h: 4.0 });
});

s = contenu('Temps fort de novembre-décembre');
txt(s, 'Le brief fixe une seconde période prioritaire, consacrée aux cadeaux, aux coffrets et à la gastronomie de fêtes. Nous conservons le même rythme (deux publications Instagram et deux publications Facebook par mois) en orientant les contenus vers les coffrets :', { x: 0.5, y: 1.05, w: 9, h: 0.75, fontSize: 13 });
[['Informer', 'Reel Instagram « Dans les coulisses d’un coffret », sur la sélection des produits et la préparation des colis aux Aldudes.', GAR], ['Inspirer', 'Carrousel Instagram « Une table de fêtes basque », avec des idées de planche et d’entrée autour du Jambon de Kintoa AOP.', VERT], ['Engager', 'Story Instagram avec sondage « Quel coffret pour qui ? », pour aider les abonnés à choisir un cadeau selon la personne.', NUIT], ['Facebook', 'Posts photo sur les coffrets pour les entreprises et rappel des dates limites de commande pour une livraison avant Noël.', GAR]]
  .forEach((c, i) => {
    const x = 0.5 + i * 2.3; carte(s, x, 2.0, 2.15, 2.85);
    s.addShape(pres.shapes.OVAL, { x: x + 0.18, y: 2.18, w: 0.22, h: 0.22, fill: { color: c[2] }, line: { color: c[2] } });
    txt(s, c[0], { x: x + 0.5, y: 2.15, w: 1.5, h: 0.3, fontSize: 13, bold: true, color: c[2] });
    txt(s, c[1], { x: x + 0.18, y: 2.6, w: 1.8, h: 2.1, fontSize: 12.5 });
  });

s = contenu('Contenus prototypes');
txt(s, 'Parmi les publications du calendrier, nous avons réalisé deux contenus prototypes, un pour chaque plateforme retenue. Ils apparaissent encadrés en rouge (« Prototype ») dans le calendrier d’avril.', { x: 0.5, y: 1.05, w: 4.6, h: 1.1, fontSize: 12 });
txt(s, 'Les deux prototypes partagent la même identité visuelle, inspirée du linge basque, un objet du quotidien que tout le monde associe au Pays Basque :', { x: 0.5, y: 2.2, w: 4.6, h: 0.8, fontSize: 12, bold: true, color: VERT });
txt(s, puces(['un fond écru avec une trame tissée ;', 'des bandes rouge garance, vert et bleu nuit ;', 'des titres très gras (Bricolage Grotesque) et un texte simple et lisible (Hanken Grotesk) ;', 'des photos posées légèrement inclinées, comme des tirages sur une table.'], 11), { x: 0.5, y: 3.05, w: 4.6, h: 1.8 });
s.addImage({ path: im('carrousel'), x: 5.4, y: 1.05, w: 4.1, h: 4.1 * 1339 / 2000 });
txt(s, 'La Maison est ainsi reconnaissable d’un réseau à l’autre, avec une image moderne mais fidèle à son territoire.', { x: 5.4, y: 3.9, w: 4.1, h: 0.9, fontSize: 11, color: DOUX });

s = contenu('Prototype 1 — Carrousel Instagram');
s.addImage({ path: im('carrousel'), x: 0.5, y: 1.05, w: 5.3, h: 5.3 * 1339 / 2000 });
txt(s, '« Bien préparer une planche basque » · mardi 6 avril', { x: 6.1, y: 1.05, w: 3.4, h: 0.55, fontSize: 13, bold: true, color: GAR });
txt(s, [{ text: 'Pilier : ', options: { bold: true } }, { text: 'Informer · thème Recette', options: { breakLine: true } }, { text: 'Format : ', options: { bold: true } }, { text: 'carrousel de 5 slides carrées (1080×1080)', options: { breakLine: true } }, { text: 'Cible : ', options: { bold: true } }, { text: 'jeunes actifs urbains de 25 à 40 ans, amateurs de gastronomie' }], { x: 6.1, y: 1.7, w: 3.4, h: 1.4, fontSize: 11, paraSpaceAfter: 4 });
txt(s, 'Elle informe sans vendre (règle 80/20) en transmettant un savoir-faire concret. Le carrousel « tuto » est un format très enregistré et partagé, ce qui modernise l’image de la Maison. L’origine des produits (Jambon de Kintoa AOP affiné 18 à 24 mois, porc basque Pie Noir élevé en plein air aux Aldudes) est racontée au fil des gestes.', { x: 6.1, y: 3.2, w: 3.4, h: 1.7, fontSize: 10.5 });

s = contenu('Prototype 2 — Post photo Facebook');
s.addImage({ path: im('post'), x: 0.5, y: 1.0, w: 3.2, h: 4.0 });
txt(s, '« Votre escapade idéale aux Aldudes » · jeudi 22 avril', { x: 4.1, y: 1.05, w: 5.4, h: 0.35, fontSize: 13, bold: true, color: GAR });
txt(s, [{ text: 'Pilier : ', options: { bold: true } }, { text: 'Engager · thème Lifestyle', options: { breakLine: true } }, { text: 'Format : ', options: { bold: true } }, { text: 'post photo en portrait 4:5 (1080×1350), le format qui occupe le plus de place dans le fil Facebook sur mobile', options: { breakLine: true } }, { text: 'Cible : ', options: { bold: true } }, { text: 'habitants de la région (cible principale des 35-65 ans) et touristes qui préparent leur séjour' }], { x: 4.1, y: 1.45, w: 5.4, h: 1.3, fontSize: 11, paraSpaceAfter: 4 });
bloc(s, 4.1, 2.85, 5.4, 2.0, 'Pourquoi cette publication ?', 'Elle fait participer la communauté avec un choix simple (1, 2 ou 3) en commentaire, ce qui augmente la portée du post sur Facebook. Elle met en avant l’expérience touristique proposée aux Aldudes : le sentier pédagogique consacré au porc basque, la rencontre avec les producteurs et la dégustation sur place. Elle est publiée en avril, au début de la saison touristique, première période prioritaire du brief.', { bs: 11, ts: 12 });

s = contenu('Règles de composition appliquées');
tableau(s, [['Règle', 'Application dans les deux prototypes'],
  ['Hiérarchie visuelle', 'Un titre très gros, puis l’image, puis un texte court. Une seule idée par slide ou par bloc.'],
  ['Cohérence des couleurs', 'Uniquement les couleurs du linge basque (écru, rouge garance, vert et bleu nuit). Le rouge est réservé aux éléments importants : chiffres, mots-clés, CTA.'],
  ['Lisibilité', 'Texte foncé sur fond clair, avec un fort contraste, et une taille de texte pensée pour une lecture sur téléphone.'],
  ['CTA visible', 'Un bouton rouge plein avec une icône : « Partagez-la en story » sur Instagram, « Répondez 1, 2 ou 3 en commentaire » sur Facebook.'],
  ['Identité de marque', 'Linge basque, signature « Maison Pierre Oteiza · Les Aldudes » et slogan « Vivre et travailler au Pays Basque ».']],
  { colW: [2.2, 6.8], fs: 13, hs: 12 });
txt(s, 'Les photos utilisées ont été générées par intelligence artificielle (ChatGPT) pour les besoins du prototype. Pour une publication réelle, elles seraient remplacées par des photos de la Maison.', { x: 0.5, y: 4.45, w: 9, h: 0.45, fontSize: 9, italic: true, color: DOUX });

// ================= SÉANCE 5 =================
separation(5, 'Budget, planning et KPI', 'Combien ça coûte, quand ça se passe, comment mesurer le succès', 'balade');

s = contenu('Budget prévisionnel par support (HT)');
tableau(s, [['Support', 'Détail des coûts', 'Production', 'Achat d’espace', 'Total'],
  ['Encart magazine local ou touristique', 'Création de l’annonce (500 €) ; 2 parutions pleine page en avril et en mai (2 × 1 500 €)', '500 €', '3 000 €', '3 500 €'],
  ['Ateliers « Apéro basque »', '6 sessions : produits dégustés (900 €), supports et matériel (400 €), animation par l’équipe (700 €)', '2 000 €', '—', '2 000 €'],
  ['Boutique éphémère', 'Un week-end : location de l’espace (1 500 €), aménagement et PLV (1 800 €), produits de dégustation (700 €), personnel et transport (500 €)', '4 500 €', '—', '4 500 €'],
  ['Série vidéo « Une minute aux Aldudes »', '2 jours de tournage (2 400 €), montage de 8 à 10 épisodes (2 600 €), habillage et sous-titres (500 €), déplacements (500 €)', '6 000 €', '—', '6 000 €'],
  ['Microcréateurs', '4 créateurs : rémunération (4 × 500 €), accueil aux Aldudes (1 000 €), produits offerts (500 €)', '3 500 €', '—', '3 500 €'],
  ['Meta Ads avril-mai', 'Environ 1 000 € par mois pendant 2 mois', '—', '2 000 €', '2 000 €'],
  ['Renfort novembre-décembre', 'Meta Ads sur les coffrets de Noël : environ 1 000 € par mois pendant 2 mois', '—', '2 000 €', '2 000 €'],
  ['Réserve pour imprévus', 'Environ 6 % du budget', '—', '—', '1 500 €'],
  [{ text: 'Total', options: { fill: { color: 'E8E4DA' } } }, { text: '', options: { fill: { color: 'E8E4DA' } } }, { text: '16 500 €', options: { bold: true, fill: { color: 'E8E4DA' } } }, { text: '7 000 €', options: { bold: true, fill: { color: 'E8E4DA' } } }, { text: '25 000 €', options: { bold: true, color: GAR, fill: { color: 'E8E4DA' } } }]],
  { y: 1.0, colW: [2.0, 4.3, 0.9, 0.95, 0.85], fs: 9.5, hs: 10, num: [2, 3, 4] });

s = contenu('Budget par poste de dépenses');
tableau(s, [['Poste', 'Supports concernés', 'Montant', 'Part'],
  ['Achat d’espace média', 'Encart magazine (3 000 €), Meta Ads avril-mai (2 000 €), Meta Ads novembre-décembre (2 000 €)', '7 000 €', '28 %'],
  ['Production de contenus', 'Création de l’encart (500 €), série vidéo « Une minute aux Aldudes » (6 000 €)', '6 500 €', '26 %'],
  ['Événementiel', 'Ateliers « Apéro basque » (2 000 €), boutique éphémère (4 500 €)', '6 500 €', '26 %'],
  ['Influence', 'Microcréateurs (3 500 €)', '3 500 €', '14 %'],
  ['Imprévus', 'Réserve (1 500 €)', '1 500 €', '6 %']],
  { y: 1.05, w: 5.6, colW: [1.5, 2.7, 0.8, 0.6], fs: 10.5, num: [2, 3] });
carte(s, 6.4, 1.05, 3.1, 1.75, GAR);
txt(s, '25 000 € HT', { x: 6.6, y: 1.2, w: 2.8, h: 0.65, fontSize: 28, bold: true, color: ECRU });
txt(s, 'le total ne dépasse pas le budget maximum du brief. Sans la réserve, les actions coûtent 23 500 € HT.', { x: 6.6, y: 1.85, w: 2.75, h: 0.9, fontSize: 9.5, color: ECRU });
bloc(s, 6.4, 2.95, 3.1, 1.9, 'Logique de répartition', '86 % du budget (21 500 €) est concentré sur le printemps, autour de la première période prioritaire d’avril-mai. Les vidéos tournées au printemps pourront être réutilisées en novembre-décembre.', { bs: 9.5, ts: 11 });
txt(s, 'Tous les montants sont hors taxes. Lorsque nous n’avions pas de prix précis, nous avons estimé par analogie : une page dans la presse régionale coûte entre 500 et 2 000 €, et une campagne Meta Ads locale entre 300 et 1 500 € par mois.', { x: 0.5, y: 3.75, w: 5.6, h: 1.0, fontSize: 9.5, color: DOUX });

s = contenu('Planning sur 12 semaines : avril – juin 2027');
s.addImage({ path: im('gantt'), x: (10 - 4.0 * 2000 / 1150) / 2, y: 0.98, w: 4.0 * 2000 / 1150, h: 4.0 });

s = contenu('Trois phases pour raconter la campagne');
[['Lancement', 'Semaines 1 à 4 · avril', 'Faire connaître', 'Le tournage de la série vidéo a lieu dès la première semaine, puis un épisode est publié chaque semaine. L’encart paraît dans le magazine local ou touristique et la sponsorisation Meta Ads démarre pour diffuser les premiers contenus, dont le carrousel « Bien préparer une planche basque ». Le premier atelier « Apéro basque » a lieu en fin de phase.', 'C0623A'],
 ['Déploiement', 'Semaines 5 à 9 · mai', 'Faire participer', 'C’est la phase la plus dense. Les microcréateurs sont accueillis aux Aldudes et publient leurs contenus, les ateliers se poursuivent chaque semaine, et la boutique éphémère ouvre le week-end des 22-23 mai. Le deuxième encart paraît début mai. La sponsorisation s’arrête fin mai, avec la fin de la période prioritaire.', 'A9862A'],
 ['Bilan', 'Semaines 10 à 12 · juin', 'Mesurer', 'Les derniers épisodes de la série et les publications continuent au même rythme, sans achat d’espace. Nous relevons l’ensemble des KPI, nous les comparons aux objectifs, puis nous ajustons la stratégie pour la seconde période prioritaire de novembre-décembre (coffrets et fêtes).', '2F6A86']]
 .forEach((c, i) => {
   const x = 0.5 + i * 3.05; carte(s, x, 1.05, 2.9, 3.8);
   s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.05, w: 2.9, h: 0.85, rectRadius: 0.08, fill: { color: c[4] }, line: { color: c[4] } });
   txt(s, [{ text: c[0], options: { bold: true, fontSize: 15, breakLine: true } }, { text: c[1] + ' · ' + c[2], options: { fontSize: 9.5 } }], { x: x + 0.18, y: 1.12, w: 2.6, h: 0.72, color: BLANC, valign: 'middle' });
   txt(s, c[3], { x: x + 0.18, y: 2.05, w: 2.6, h: 2.7, fontSize: 11 });
 });

const kpi = (titre, rows) => {
  s = contenu('KPI — ' + titre);
  tableau(s, [['Type', 'KPI', 'Objectif', 'Outil de mesure'], ...rows.map(r => [{ text: r[0], options: { color: r[0] === 'Quantitatif' ? GAR : VERT } }, r[1], { text: r[2], options: { bold: r[2] !== '—', color: GAR } }, r[3]])], { colW: [1.2, 3.8, 1.6, 2.4], fs: 12.5, hs: 12 });
};
kpi('Encart dans un magazine local ou touristique', [
  ['Quantitatif', 'Nombre de scans du QR code de l’encart vers la page « Visiter les Aldudes »', '500 scans', 'Outil de suivi du QR code'],
  ['Quantitatif', 'Nombre de visiteurs présentant l’encart ou citant le magazine aux Aldudes', '80 visiteurs', 'Question posée en boutique, comptage en caisse'],
  ['Quantitatif', 'Évolution de la fréquentation de la boutique des Aldudes en avril-mai', '+10 % par rapport à avril-mai 2026', 'Comptage des entrées et des tickets de caisse'],
  ['Qualitatif', 'Ce que les visiteurs retiennent de l’annonce (message, visuel)', '—', 'Échanges en boutique, verbatims notés par l’équipe'],
  ['Qualitatif', 'Image de la Maison comme lieu à visiter, et pas seulement comme marque de charcuterie', '—', 'Mini-questionnaire aux visiteurs']]);
kpi('Ateliers « Apéro basque »', [
  ['Quantitatif', 'Taux de remplissage des 6 ateliers (12 places par session)', '85 % (61 participants)', 'Fichier des inscriptions'],
  ['Quantitatif', 'Part des participants âgés de 25 à 40 ans', '50 %', 'Formulaire d’inscription'],
  ['Quantitatif', 'Part des participants qui achètent un produit après l’atelier', '60 %', 'Ventes enregistrées en caisse'],
  ['Qualitatif', 'Satisfaction et ressenti des participants (convivialité, transmission du savoir-faire)', '—', 'Questionnaire de fin d’atelier, commentaires libres'],
  ['Qualitatif', 'Tonalité des contenus publiés par les participants sur leurs réseaux', '—', 'Veille des identifications de la Maison']]);
kpi('Boutique éphémère chez un partenaire', [
  ['Quantitatif', 'Nombre de visiteurs sur le week-end', '400 visiteurs', 'Comptage à l’entrée'],
  ['Quantitatif', 'Chiffre d’affaires réalisé sur le week-end', '5 000 € HT', 'Caisse de la boutique éphémère'],
  ['Quantitatif', 'Nombre d’inscriptions à la newsletter', '120 inscriptions', 'Formulaire sur tablette'],
  ['Qualitatif', 'Perception de la présentation (premium, soignée, fidèle au Pays Basque)', '—', 'Mini-questionnaire aux visiteurs'],
  ['Qualitatif', 'Retour du partenaire et envie de renouveler l’opération', '—', 'Entretien avec le partenaire après le week-end']]);
kpi('Série vidéo « Une minute aux Aldudes »', [
  ['Quantitatif', 'Nombre moyen de vues par épisode', '5 000 vues', 'Statistiques Instagram et Facebook'],
  ['Quantitatif', 'Taux de visionnage complet des épisodes', '40 %', 'Statistiques des Reels'],
  ['Quantitatif', 'Nouveaux abonnés Instagram sur les 12 semaines', '+1 500 abonnés', 'Statistiques du compte Instagram'],
  ['Qualitatif', 'Tonalité des commentaires (curiosité, fierté, envie de venir)', '—', 'Lecture et classement des commentaires'],
  ['Qualitatif', 'Image perçue de la Maison : plus moderne et plus proche', '—', 'Sondage en story à la fin de la série']]);
kpi('Collaboration avec des microcréateurs', [
  ['Quantitatif', 'Portée cumulée des publications des créateurs', '100 000 personnes', 'Statistiques transmises par les créateurs'],
  ['Quantitatif', 'Taux d’engagement moyen des publications', '5 %', 'Statistiques transmises par les créateurs'],
  ['Quantitatif', 'Utilisations des codes promo personnels des créateurs sur pierreoteiza.com', '150 utilisations', 'Suivi des codes sur le site e-commerce'],
  ['Qualitatif', 'Cohérence des contenus avec les valeurs de la Maison (authenticité, savoir-faire, territoire)', '—', 'Grille d’analyse remplie par l’équipe'],
  ['Qualitatif', 'Intentions de visite ou d’achat exprimées dans les commentaires', '—', 'Lecture des commentaires sous les publications']]);

// ================= SÉANCE 6 =================
separation(6, 'Création graphique', 'Brief créatif, affiche A3 et justification', 'degustation');

s = contenu('La promesse');
carte(s, 0.5, 1.1, 9, 2.0, GAR);
txt(s, '« Avec Pierre Oteiza, le vrai goût du Pays Basque se vit et se partage, aujourd’hui comme depuis près de 40 ans. »', { x: 0.85, y: 1.3, w: 8.3, h: 1.6, fontSize: 22, bold: true, color: ECRU, valign: 'middle' });
txt(s, 'Elle répond à la problématique du brief : « se vit et se partage » parle à la nouvelle génération (expérience, convivialité), « le vrai goût » et « près de 40 ans » préservent l’authenticité et le savoir-faire.', { x: 0.5, y: 3.4, w: 9, h: 1.2, fontSize: 16 });

s = contenu('Brief créatif : preuves et bénéfice consommateur');
bloc(s, 0.5, 1.05, 4.6, 3.8, 'Preuves — ce qui rend la promesse crédible', puces(['Une Maison familiale fondée en 1987 aux Aldudes par Pierre et Catherine Oteiza, rejoints par leur fils Frantxoa.', 'La sauvegarde du porc basque Pie Noir, menacé de disparition, élevé en plein air.', 'Le Jambon de Kintoa AOP (depuis 2019), affiné 18 à 24 mois au séchoir collectif de la vallée des Aldudes.', 'Une expérience à vivre sur place : boutique, dégustation, restauration, sentier pédagogique.', 'Une reconnaissance médiatique (Le Figaro, juin 2026).'], 12), { ts: 14 });
bloc(s, 5.3, 1.05, 4.2, 3.8, 'Bénéfice consommateur — motivations', puces(['Hédoniste : savourer des produits d’exception, artisanaux et pleins de goût.', 'Oblative : partager un moment convivial entre amis ou en famille, offrir un cadeau qui a du sens.', 'Auto-expression : affirmer son goût pour le local, la traçabilité et les producteurs que l’on connaît.'], 13, ECRU), { fill: VERT, ts: 14 });

s = contenu('Brief créatif : ton, ambiance et contraintes');
bloc(s, 0.5, 1.05, 4.0, 3.8, 'Ton et ambiance générale', [{ text: 'Ton chaleureux, convivial et authentique. Simple et direct, avec une pointe d’humour complice mais jamais moqueur : la marque parle comme un producteur fier qui invite à sa table, pas comme une marque de luxe distante.', options: { fontSize: 12, breakLine: true } }, { text: ' ', options: { fontSize: 6, breakLine: true } }, { text: 'Ambiance : un moment de partage au Pays Basque. Lumière dorée, vert des montagnes, planche et linge basque, vrais produits et vrais gestes, dans une mise en page moderne et épurée.', options: { fontSize: 12 } }], { ts: 14 });
bloc(s, 4.7, 1.05, 4.8, 3.8, 'Contraintes', [{ text: 'Légales', options: { bold: true, fontSize: 11, color: VERT, breakLine: true } }, ...puces(['mention sanitaire obligatoire pour un produit avec sel ajouté (www.mangerbouger.fr) ;', 'loi Évin : aucun alcool mis en avant ;', 'dénomination exacte « Jambon de Kintoa AOP » ;', 'aucune allégation environnementale non prouvée ;', 'droit à l’image des personnes photographiées.'], 10).map((p, i, a) => i === a.length - 1 ? Object.assign(p, { options: Object.assign(p.options, { breakLine: true }) }) : p), { text: 'Créatives et éléments imposés', options: { bold: true, fontSize: 11, color: VERT, breakLine: true } }, ...puces(['logo Pierre Oteiza et slogan « Vivre et travailler au Pays Basque » ;', 'charte « linge basque » : écru, rouge garance, vert, bleu nuit ;', 'format A3 portrait, message compris en 3 secondes ;', 'site pierreoteiza.com et QR code (prévu dans les KPI).'], 10)], { ts: 14 });

s = contenu('Maquette d’affiche A3 (297 × 420 mm)');
s.addImage({ path: im('affiche'), x: 0.5, y: 0.98, w: 2.85, h: 2.85 * 2000 / 1414 });
txt(s, [{ text: 'Le Pays Basque, ', options: { color: ENCRE } }, { text: 'ça se partage.', options: { color: GAR } }], { x: 3.8, y: 1.1, w: 5.7, h: 0.6, fontSize: 24, bold: true });
txt(s, puces(['Une photo de partage : plusieurs mains d’amis se servent sur une planche, sur une nappe basque, face aux montagnes.', 'Une ligne de preuve : Jambon de Kintoa AOP, porc basque Pie Noir élevé en plein air aux Aldudes, une histoire de famille depuis 1987.', 'Un appel à l’action « Venez le vivre aux Aldudes » et un QR code vers pierreoteiza.com.', 'Le slogan « Vivre et travailler au Pays Basque » et la mention sanitaire obligatoire.'], 13), { x: 3.8, y: 1.85, w: 5.7, h: 2.4, paraSpaceAfter: 6 });
txt(s, 'La photo a été générée par intelligence artificielle (ChatGPT) pour la maquette. Le nom « PIERRE OTEIZA » est une mise en forme provisoire, à remplacer par le logo officiel.', { x: 3.8, y: 4.3, w: 5.7, h: 0.6, fontSize: 9, italic: true, color: DOUX });

const J = [['Q1 — Pourquoi cette accroche ?', '« Le Pays Basque, ça se partage. » traduit directement la promesse : en six mots, la cible retient le territoire (« le Pays Basque ») et l’expérience conviviale (« ça se partage »). La formule est courte, orale et complice, donc lisible en 3 secondes, et le mot « partage » est mis en rouge pour être retenu.'],
  ['Q2 — Pourquoi ce visuel ?', 'Plusieurs mains d’amis se servent en même temps sur une planche de charcuteries : le visuel montre littéralement la promesse, le partage, autour du produit d’exception (jambon, saucisson, chorizo, brebis). La nappe basque et les montagnes en arrière-plan ancrent la marque dans son territoire, et les visages coupés permettent à chacun de s’imaginer à cette table. Le style de photo pris sur le vif parle aux 25-40 ans, et seuls des verres d’eau sont sur la table, pour respecter la loi Évin.'],
  ['Q3 — Pourquoi ces couleurs ?', 'Ce sont les couleurs du linge basque (écru, rouge garance, vert, bleu nuit), déjà utilisées dans nos prototypes Instagram et Facebook : elles rendent la campagne reconnaissable sur tous les supports. Le rouge, réservé à la fin de l’accroche, au produit phare et au bouton, guide l’œil vers l’essentiel ; l’écru et le vert évoquent l’authenticité et la nature des Aldudes, cohérents avec le positionnement premium et terroir.'],
  ['Q4 — Pourquoi ce ton ?', 'Le ton est chaleureux et direct, comme défini dans la copy stratégie : « ça se partage » est une phrase qu’on pourrait entendre à table, et l’invitation « Venez le vivre aux Aldudes » parle comme un producteur qui accueille chez lui. Le texte court rassure sur l’authenticité (AOP, porc Pie Noir, famille depuis 1987) sans jargon ni ton de luxe distant.'],
  ['Q5 — Cette affiche toucherait-elle notre cible principale ?', 'Oui. Les 35-65 ans amateurs de gastronomie y retrouvent la qualité et les preuves qu’ils recherchent (Kintoa AOP, histoire familiale depuis 1987), et les 25-40 ans à conquérir y voient un moment convivial, une mise en page moderne et un QR code pour passer à l’action. L’affiche invite à venir aux Aldudes, en lien avec la saison touristique, première période prioritaire du brief.']];
s = contenu('Justification créative (1/2)');
bloc(s, 0.5, 1.05, 4.4, 3.8, J[0][0], J[0][1], { bs: 15, ts: 15 });
bloc(s, 5.1, 1.05, 4.4, 3.8, J[1][0], J[1][1], { bs: 13, ts: 15, fill: VERT });
s = contenu('Justification créative (2/2)');
J.slice(2).forEach((q, i) => bloc(s, 0.5 + i * 3.05, 1.05, 2.9, 3.8, q[0], q[1], { bs: 12, ts: 12.5, fill: i === 1 ? GAR : undefined }));


// ================= SÉANCE 7 =================
separation(7, 'Ambassadorat', 'De l’événement interne à la communication externe', 'rencontre');

s = contenu('L’ambassadorat chez Pierre Oteiza');
carte(s, 0.5, 1.05, 9, 1.15, VERT);
txt(s, 'L’ambassadorat consiste à faire des collaborateurs les porte-parole de leur entreprise : ils communiquent sur la Maison de manière positive, avec leurs propres réseaux sociaux.', { x: 0.75, y: 1.18, w: 8.5, h: 0.9, fontSize: 15, bold: true, color: ECRU, valign: 'middle' });
txt(s, 'Pour Pierre Oteiza, c’est une suite logique : le brief cite déjà un réseau d’ambassadeurs, et la cible interne (salariés et famille Oteiza) a été identifiée en séance 2, avec un frein possible, le manque de reconnaissance ou d’information.', { x: 0.5, y: 2.45, w: 9, h: 0.8, fontSize: 13 });
[['Fierté', 'Répond au frein de la cible interne et renforce l’appartenance à une Maison familiale.'], ['Authenticité', 'Illustre l’« histoire humaine » avec de vraies personnes et de vrais gestes.'], ['Peu coûteux', 'Lieux existants aux Aldudes, diffusion par les comptes des salariés.'], ['Volontariat', 'Personne n’est obligé de publier ; règles expliquées pendant l’atelier.']]
 .forEach((c, i) => bloc(s, 0.5 + i * 2.3, 3.35, 2.15, 1.5, c[0], c[1], { bs: 10.5, ts: 13 }));

s = contenu('De l’événement interne à la communication externe');
[['1', 'L’événement interne', 'La Journée des Ambassadeurs réunit toutes les équipes aux Aldudes : élevage de porcs basques Pie Noir, séchoir de la vallée, échange avec Pierre et Frantxoa, puis un atelier pour apprendre à raconter son métier sur les réseaux.', GAR],
 ['2', 'Le passage à l’externe', 'Chaque collaborateur volontaire publie sur son propre compte, surtout LinkedIn. La Maison fournit un kit : photos de la journée, hashtag commun, idées de sujets. Chacun écrit avec ses mots.', VERT],
 ['3', 'Dans la durée', 'Les ambassadeurs partagent régulièrement les coulisses de leur métier. La parole d’un salarié est perçue comme plus sincère qu’une publicité et touche des publics que la page de la marque n’atteint pas.', NUIT]]
 .forEach((c, i) => {
   const x = 0.5 + i * 3.05; carte(s, x, 1.1, 2.9, 3.75);
   s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: 1.28, w: 0.62, h: 0.62, fill: { color: c[3] }, line: { color: c[3] } });
   txt(s, c[0], { x: x + 0.2, y: 1.28, w: 0.62, h: 0.62, fontSize: 22, bold: true, color: ECRU, align: 'center', valign: 'middle' });
   txt(s, c[1], { x: x + 0.95, y: 1.3, w: 1.85, h: 0.6, fontSize: 14, bold: true, color: c[3], valign: 'middle' });
   txt(s, c[2], { x: x + 0.2, y: 2.1, w: 2.5, h: 2.6, fontSize: 12 });
 });

s = contenu('Exemple : le post LinkedIn d’une ambassadrice');
s.addImage({ path: im('linkedin-visuel'), x: 0.5, y: 0.98, w: 3.04, h: 3.8 });
const liTxt = 'Il y a des journées qui rappellent pourquoi on aime son métier.\nHier, toutes les équipes de la Maison Pierre Oteiza se sont retrouvées aux Aldudes pour notre première Journée des Ambassadeurs : boutiques, production, restauration, de Bayonne à Paris.\nAu programme : la visite de l’élevage de porcs basques Pie Noir, le séchoir où notre Jambon de Kintoa AOP s’affine 18 à 24 mois, un échange avec Pierre et Frantxoa, et un atelier pour raconter notre métier sur les réseaux.\nCe que je retiens : derrière chaque tranche que je sers en boutique, il y a une race sauvée, une vallée et une famille. Et j’ai envie de vous le raconter.\n#VivreEtTravaillerAuPaysBasque #PierreOteiza #Aldudes';
carte(s, 4.0, 0.98, 5.5, 4.0);
s.addShape(pres.shapes.OVAL, { x: 4.2, y: 1.15, w: 0.5, h: 0.5, fill: { color: VERT }, line: { color: VERT } });
txt(s, 'ME', { x: 4.2, y: 1.15, w: 0.5, h: 0.5, fontSize: 11, bold: true, color: ECRU, align: 'center', valign: 'middle' });
txt(s, [{ text: 'Maddi Etxeberri', options: { bold: true, fontSize: 12, breakLine: true } }, { text: 'Conseillère de vente · Maison Pierre Oteiza, boutique de Bayonne', options: { fontSize: 9, color: DOUX } }], { x: 4.85, y: 1.13, w: 4.5, h: 0.55 });
txt(s, liTxt, { x: 4.2, y: 1.8, w: 5.1, h: 3.1, fontSize: 9.5, paraSpaceAfter: 5 });
txt(s, 'Personne fictive et photo générée par IA pour la maquette.', { x: 0.5, y: 4.83, w: 3.3, h: 0.2, fontSize: 8, italic: true, color: DOUX });

// ================= FIN =================
section = 'Clôture'; pres.addSection({ title: section });
s = pres.addSlide({ sectionTitle: section }); s.background = { color: ECRU };
[[5.33, 0.045, GAR], [5.405, 0.11, VERT], [5.545, 0.025, NUIT]].forEach(([y, h, c]) => s.addShape(pres.shapes.RECTANGLE, { x: 0, y, w: 10, h, fill: { color: c }, line: { color: c } }));
txt(s, 'MAISON PIERRE OTEIZA · LES ALDUDES', { x: 0.5, y: 1.25, w: 9, h: 0.3, fontSize: 11, bold: true, color: VERT, charSpacing: 2, align: 'center' });
txt(s, 'Vivre et travailler au Pays Basque', { x: 0.3, y: 1.7, w: 9.4, h: 1.0, fontSize: 36, bold: true, color: ENCRE, align: 'center', valign: 'middle' });
txt(s, 'Stratégie de communication · Cas Pierre Oteiza', { x: 0.5, y: 3.0, w: 9, h: 0.3, fontSize: 12, color: DOUX, align: 'center' });

pres.writeFile({ fileName: OUT }).then(f => console.log('écrit', f));
