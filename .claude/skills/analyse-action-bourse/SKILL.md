---
name: analyse-action-bourse
description: Analyse une action cotée en bourse (ou compare plusieurs actions) en français — valorisation (PER, PEG, VE/EBITDA, rendement du free cash flow), rentabilité, solidité financière, croissance et dividende, notés par rapport aux repères du secteur, avec une section risques et actualité. Utiliser quand l'utilisateur demande d'analyser une action, si une action est chère, de comparer des actions, ou cite un nom de société cotée ou un ticker (NVDA, MC.PA, TTE…) en lien avec la bourse.
---

# Analyse d'action en bourse

Version française, centrée sur les actions, du skill `analyzing-financial-statements` (cookbook Anthropic). Elle corrige ses défauts :

- **Une donnée manquante n'est jamais comptée comme 0.** Le ratio est marqué « n.d. » et exclu des notes, au lieu d'être noté « mauvais ».
- **Ratios boursiers en plus** : PER prévisionnel, rendement du free cash flow, rendement du dividende, taux de distribution, dette nette / EBITDA.
- **Repères pour 10 secteurs** : general, technologie, semi-conducteurs, luxe, energie, banque, industrie, distribution, sante, telecom. Les ratios non pertinents (VE/EBITDA pour une banque…) sont ignorés.
- **Section risques et actualité** obligatoire : les ratios ne voient ni les enquêtes, ni les procès, ni les changements de dirigeants.
- **Mode comparatif** : plusieurs actions côte à côte.

## Étapes

1. **Identifier l'action** (nom, ticker, place de cotation) et choisir le secteur de comparaison le plus proche.

2. **Récupérer les chiffres**, de préférence dans les documents de la société (communiqué de résultats, rapport annuel, dépôt SEC/AMF), sinon sur StockAnalysis, Zonebourse, Boursorama ou Yahoo Finance. Faire les recherches en parallèle :
   - derniers résultats publiés et bilan ;
   - cours récent, nombre d'actions, capitalisation ;
   - actualité récente (« <société> stock news <mois année> ») pour la section risques.

   Règles :
   - Prendre les chiffres **sur 12 mois glissants** (ou le dernier exercice complet) pour le compte de résultat, et le **dernier bilan** publié.
   - Recouper les sources. Si elles divergent, privilégier la société elle-même et le signaler.
   - **Ne jamais inventer un chiffre** introuvable : laisser le champ absent.
   - Si l'utilisateur fournit lui-même les chiffres (texte, capture, tableau), les utiliser en priorité.

3. **Remplir une fiche JSON** dans le scratchpad (modèle ci-dessous, exemple complet dans `exemples/nvidia.json`).

4. **Lancer le script** (aucune dépendance) :

   ```bash
   PYTHONDONTWRITEBYTECODE=1 python3 -I scripts/analyse_action.py fiche.json
   ```

   Comparatif : `scripts/analyse_action.py a.json b.json c.json`. Résultats bruts : ajouter `--json`.

5. **Présenter le résultat** à l'utilisateur, en français simple :
   - commencer par le verdict en une phrase (chère ou pas, solide ou pas, et pourquoi) ;
   - reprendre les tableaux du rapport et expliquer chaque ratio clé en une ligne ;
   - **relier les chiffres à l'actualité** : une action « bon marché » l'est souvent pour une raison (enquête, chute des bénéfices attendue, secteur cyclique au sommet) ;
   - citer les données manquantes et les hypothèses (ex. croissance utilisée pour le PEG) ;
   - terminer par la liste des sources en liens markdown ;
   - rappeler que c'est une analyse des chiffres, pas un conseil d'achat ou de vente, et que le cours est à vérifier au jour J.

## Fiche JSON

Tous les montants dans **la même unité** (champ `unite`, ex. `"Md"` pour milliards). Le nombre d'actions s'exprime dans cette même unité (24,1 milliards d'actions → `24.1` si `unite` = `"Md"`). Le cours et les montants par action sont en unités normales. Les taux de croissance sont en %.

| Champ | Contenu | Obligatoire |
|---|---|---|
| `societe`, `ticker`, `secteur`, `devise`, `unite`, `date_cours` | identification | `secteur` conseillé |
| `cours`, `nb_actions` | cours et nombre d'actions | oui |
| `chiffre_affaires`, `benefice_net` | sur 12 mois | oui |
| `benefice_brut`, `resultat_operationnel`, `ebitda`, `charges_interets` | compte de résultat | non |
| `free_cash_flow`, ou `flux_tresorerie_operationnel` + `capex` | flux de trésorerie | non |
| `capitaux_propres`, `total_actif`, `dette_totale`, `tresorerie` | bilan | conseillé |
| `actif_courant`, `passif_courant` | liquidité | non |
| `dividende_par_action` | dividende annuel par action | non |
| `bpa` | bénéfice par action, sinon calculé | non |
| `bpa_prevu` ou `benefice_net_prevu` | prévisions (consensus) | non |
| `croissance_ca`, `croissance_bpa` (en %), ou `chiffre_affaires_precedent`, `benefice_net_precedent` | croissance | non |
| `croissance_bpa_prevue` (en %) | croissance attendue, pour le PEG | non |
| `risques` | liste de phrases : actualité, enquêtes, dirigeants, concurrence | **toujours remplir** |
| `sources` | liste « libellé : URL » | oui |

Le PEG utilise `croissance_bpa_prevue` si elle est fournie, sinon la croissance passée du bénéfice (indiqué dans le rapport).

## Lecture des notes

- Chaque ratio est classé sur 4 niveaux selon les repères du secteur : très bon, bon, moyen, faible. Pour la valorisation : bon marché, raisonnable, assez cher, cher.
- Note par pilier sur 10 : moyenne des ratios disponibles. 🟢 ≥ 7,5 · 🟡 ≥ 5 · 🟠 ≥ 3,5 · 🔴 en dessous.
- Le script ajoute des **signaux d'alerte** automatiques : pertes, dividende supérieur au bénéfice, free cash flow négatif, capitaux propres négatifs, baisse des bénéfices attendue, ROE gonflé par la dette, marges exceptionnelles.

## Limites

- Les repères sectoriels sont des ordres de grandeur de long terme écrits dans le script, pas des moyennes de marché en temps réel. Ils sont à ajuster dans `REPERES` si besoin.
- Pas de flux boursier en direct : le cours vient d'une recherche web ou de l'utilisateur, et peut dater de la veille.
- Les ratios reposent sur des comptes publiés : en cas de doute sur leur fiabilité (enquête comptable, retraitement), le dire clairement.
- Ne jamais présenter le résultat comme une recommandation d'investissement.
