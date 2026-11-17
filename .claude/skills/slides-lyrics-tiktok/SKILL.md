---
name: slides-lyrics-tiktok
description: Génère les 2 slides d'un carrousel TikTok « lyrics » (slide 1 titre + pochette, slide 2 refrain) à partir d'un lien Spotify et du refrain. Utiliser quand l'utilisateur envoie un lien open.spotify.com/track avec des paroles (texte ou capture d'écran) pour son compte TikTok de rap FR, ou demande des slides de paroles.
---

# Slides lyrics TikTok

Format inspiré des comptes « lyrics » (style Music Package) : carrousel photo de 2 images en 1080×1920.

- **Slide 1** : titre du son en majuscules, centré dans l'espace à gauche, sur un fond uni pris dans la pochette (assombri).
- **Badge et accroche (optionnels)** au-dessus du titre, en gras, dans la couleur la plus vive de la pochette (rose pour une pochette rose, etc.). Badge = pastille pleine (ex. `#1 TOP 50`, `TENDANCE`, `NOUVEAUTÉ`), accroche = phrase courte (ex. « Le son que tout TikTok utilise », « N°1 en France cette semaine »).
- **Slide 2** : le refrain, aligné à gauche, texte blanc.
- La pochette est **à cheval sur les deux slides** : quand on swipe, l'image se continue.
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
   Ajouter `--badge "#1 Top 50"` et/ou `--accroche "Le son que tout TikTok utilise"` si l'utilisateur en veut (sans ces options : slide 1 sans badge ni accroche).
   Mettre le dossier de sortie dans le scratchpad. `-` à la place du fichier = slide 2 sans paroles.
3. Regarder une fois les 2 PNG, puis les envoyer à l'utilisateur avec SendUserFile (slide 1 puis slide 2).
4. Proposer la légende : `Titre – Artistes` + `#rapfr #lyrics #<artiste> #<titre> #pourtoi`.

Plusieurs sons dans un même message : lancer le script une fois par lien, avec un dossier de sortie par son.

## Générateur manuel

`scripts/generateur-slides.html` est la même mise en page sous forme de page web (titre, pochette, refrain → 2 images). Le script l'utilise pour le rendu : toute modification du style se fait dans ce fichier (fonction `render`). Version publiée : https://claude.ai/artifact/6BTiqg2XMb48z8j1gczcPi
