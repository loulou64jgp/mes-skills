---
name: slides-lyrics-tiktok
description: Génère les 2 slides d'un carrousel TikTok « lyrics » (slide 1 titre + pochette, slide 2 refrain) à partir d'un lien Spotify et du refrain. Utiliser quand l'utilisateur envoie un lien open.spotify.com/track avec des paroles (texte ou capture d'écran) pour son compte TikTok de rap FR, ou demande des slides de paroles.
---

# Slides lyrics TikTok

Format inspiré des comptes « lyrics » (style Music Package) : carrousel photo de 2 images en 1080×1920.

- **Slide 1** : pochette entière centrée, titre en majuscules et en gras dessous, artistes dans la couleur la plus vive de la pochette.
- **Emoji** : l'utilisateur l'ajoute lui-même dans TikTok (en haut à gauche de la slide 1), pour avoir le style des emojis iPhone. Ne pas en mettre dans les slides.
- **Slide 2** : toutes les paroles d'un coup (c'est le format qui marche le mieux sur le compte), alignées à gauche, en blanc. Option `--punch "..."` : la ligne qui contient ce passage passe en gras dans la couleur de la pochette (la phrase culte).
- **Pochette 3D** (option `--3d`) : la pochette est rendue comme un objet posé en biais (épaisseur, léger vernis, ombre, reflet au sol) au lieu d'un carré à plat. Rendu Three.js via `scripts/cover3d.js` (`three` installé avec `npm install` dans `scripts/`).
- **Signature** `@repeatmusique` en petit en bas de la slide 2 (`--signature ""` pour l'enlever).
- **Zone visible TikTok** : tout reste entre x = 110 et 920, y = 250 et 1450. Les téléphones allongés rognent les bords et les boutons j'aime/commentaires couvrent la droite. Plus de pochette à cheval entre les deux slides (elle était coupée).
- Police : Helvetica (Nimbus Sans dans le conteneur).

## Prérequis (une fois par session)

1. Réseau : `open.spotify.com` et `i.scdn.co` doivent être autorisés dans l'environnement.
2. Police : `apt-get install -y fonts-urw-base35 && fc-cache -f`
   (sans elle, le rendu retombe sur une autre police).
3. Playwright et Chromium sont préinstallés dans les sessions cloud.

## Étapes

1. Récupérer le lien Spotify du morceau et le refrain fourni par l'utilisateur.
   - Si le refrain arrive en capture d'écran, le retranscrire fidèlement, un vers par ligne.
   - Ne jamais inventer ni compléter les paroles soi-même : utiliser uniquement ce que l'utilisateur fournit (droit d'auteur).
2. Écrire le refrain dans un fichier texte, puis lancer :
   ```bash
   node .claude/skills/slides-lyrics-tiktok/scripts/make-slides.js "<lien-spotify>" refrain.txt <dossier-de-sortie>
   ```
   Ne pas passer `--emoji` (voir plus haut). Proposer une phrase culte avec `--punch`. Le nom des artistes vient de Spotify ; `--artiste "..."` pour l'écrire autrement.
   Mettre le dossier de sortie dans le scratchpad. `-` à la place du fichier = slide 2 sans paroles.
3. Regarder une fois les 2 PNG, puis les envoyer à l'utilisateur avec SendUserFile (slide 1 puis slide 2).
4. Proposer pour chaque son, prêts à copier-coller :
   - un **titre accrocheur** pour le champ « Titre » du post TikTok (90 caractères max). Il doit donner une raison de swiper ou de commenter : une question, un débat, une référence à la phrase culte du refrain, ou « le son que… ». Pas de fausse info (ne pas écrire « N°1 » si ce n'est pas vrai).
   - la **légende** : `Titre – Artistes` + `#rapfr #lyrics #<artiste> #<titre> #pourtoi`.
   - un **emoji** à ajouter soi-même en haut à gauche de la slide 1.

Plusieurs sons dans un même message : lancer le script une fois par lien, avec un dossier de sortie par son.

## Générateur manuel

`scripts/generateur-slides.html` est la même mise en page sous forme de page web (titre, pochette, refrain → 2 images). Le script l'utilise pour le rendu : toute modification du style se fait dans ce fichier (fonction `render`). Version publiée : https://claude.ai/artifact/6BTiqg2XMb48z8j1gczcPi
