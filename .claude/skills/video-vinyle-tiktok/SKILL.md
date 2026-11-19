---
name: video-vinyle-tiktok
description: Génère une vidéo TikTok « vinyle néon » (1080×1920, sans son) synchronisée sur les paroles, à partir d'un lien Spotify et du refrain. Utiliser quand l'utilisateur demande une vidéo (et pas des slides) pour un son de son compte TikTok Repeat, ou envoie un lien open.spotify.com/track en demandant le format vidéo / vinyle.
---

# Vidéo vinyle néon TikTok

Format validé par l'utilisateur (compte TikTok Repeat, @repeatmusique). Ne pas changer le style sans qu'il le demande.

## Le format

**Haut (3D, Three.js + post-traitement)**
- Vinyle « splatter » dans les 2 couleurs principales de la pochette, vernis brillant, reflets studio fixes pendant que les sillons tournent.
- Pochette au centre du vinyle **non éclairée** (pleine luminosité, bien lisible) avec un fin cercle de la couleur d'accent.
- Visualiseur circulaire de 120 barres néon autour du disque.
- Rayons de lumière et halo derrière, particules.
- Intro : très gros plan sur l'étiquette, puis la caméra recule pour révéler le vinyle (≈ 1,2 s).
- Sur chaque nouvelle ligne (minutage LRCLIB) : onde de choc, étincelles, légère aberration chromatique, petit flash, petit coup de zoom. **Effets volontairement doux** : l'utilisateur a trouvé la version plus forte « trop ».

**Bas (2D) — à ne pas modifier, validé « nickel »**
- Titre en majuscules, artistes dans la couleur d'accent, barre de lecture avec le vrai temps du morceau.
- Paroles qui défilent façon Spotify ; sur la ligne active, les mots s'allument un par un (karaoké).

Police : Helvetica (Nimbus Sans dans le conteneur).

## Choix des sons

Le compte ne poste **que des sons dont LRCLIB a le minutage** (décision de l'utilisateur). Avant d'ajouter un son au planning, vérifier qu'une version synchronisée existe et contient le refrain (`synchro` doit commencer par « LRCLIB # » ; sinon, écarter le son et le dire à l'utilisateur).

## Prérequis (une fois par session)

1. Réseau : `open.spotify.com`, `i.scdn.co` et `lrclib.net` autorisés dans l'environnement.
2. Police : `apt-get install -y fonts-urw-base35 && fc-cache -f`
3. Playwright/Chromium sont préinstallés. `three` est installé automatiquement (`npm install` dans `scripts/`) au premier lancement.

## Étapes

1. Récupérer le lien Spotify et le refrain de l'utilisateur.
   - Capture d'écran : retranscrire fidèlement, un vers par ligne. Ne jamais inventer ni compléter les paroles (droit d'auteur).
2. Écrire le refrain dans un fichier texte (scratchpad), puis vérifier la mise en page en 30 s :
   ```bash
   node .claude/skills/video-vinyle-tiktok/scripts/make-video.js "<lien-spotify>" refrain.txt <dossier-sortie> --preview
   ```
   Regarder une fois les 4 JPG (intro, 1re ligne, ligne 2, fin).
3. Rendu complet (≈ 4 min pour 20 s ; le lancer en arrière-plan) :
   ```bash
   node .claude/skills/video-vinyle-tiktok/scripts/make-video.js "<lien-spotify>" refrain.txt <dossier-sortie>
   ```
   La sortie JSON donne `synchro` (source du minutage), `demarrage_son_tiktok` et le chemin du MP4 (≈ 30 Mo).
4. Envoyer le MP4 avec SendUserFile et dire :
   - **à quel moment faire démarrer le son officiel dans TikTok** (`demarrage_son_tiktok`, la 1re ligne tombe 1,2 s après le début) ;
   - si `synchro` vaut « aucun minutage trouvé » ou « refrain non reconnu » : les lignes sont espacées de 1,6 s, la synchro n'est pas exacte (proposer les slides à la place, ou demander le minutage).
   - Les différentes versions LRCLIB d'un même son peuvent être décalées de quelques dixièmes de seconde : dire à l'utilisateur d'ajuster d'un cran dans TikTok si besoin.
5. Proposer aussi le titre accrocheur, l'emoji et la légende (voir la skill `slides-lyrics-tiktok`).

## Fichiers

- `scripts/make-video.js` : Spotify (titre, artistes, durée, pochette) → LRCLIB (version synchronisée la plus proche de la durée Spotify, qui contient le refrain) → alignement vers par vers → rendu.
- `scripts/render.js` : sert le dossier en HTTP local, pilote Chromium image par image, encode en H.264 avec ffmpeg.
- `scripts/vinyle.html` : la scène (3D + composition 2D). Tous les réglages visuels sont là (`window.frame`).
