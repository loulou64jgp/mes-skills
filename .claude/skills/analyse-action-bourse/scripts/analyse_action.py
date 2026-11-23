#!/usr/bin/env python3
"""Analyse d'une action cotée (ou comparaison de plusieurs) à partir d'un fichier JSON.

Usage :
    python3 analyse_action.py fiche.json                 # rapport complet d'une action
    python3 analyse_action.py a.json b.json c.json       # tableau comparatif
    python3 analyse_action.py fiche.json --json          # résultats bruts en JSON

Règle clé : une donnée absente n'est jamais remplacée par 0. Le ratio est marqué
« non disponible » et il est exclu des notes.

Aucune dépendance hors bibliothèque standard.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# Repères par secteur (indicatifs, ordres de grandeur de long terme).
# Pour chaque ratio : (très bon, bon, moyen). Au-delà de « moyen » : faible.
# Le sens (plus bas = mieux ou plus haut = mieux) est défini dans RATIOS.
# None = ratio non pertinent pour le secteur.
# ---------------------------------------------------------------------------
GENERAL = {
    "per": (12, 18, 25),
    "per_prevu": (11, 16, 22),
    "peg": (1.0, 1.5, 2.0),
    "ev_ebitda": (8, 12, 16),
    "cours_ca": (1.5, 3, 5),
    "cours_valeur_comptable": (1.5, 3, 5),
    "rendement_fcf": (6, 4, 2.5),
    "marge_brute": (50, 35, 20),
    "marge_operationnelle": (20, 12, 6),
    "marge_nette": (15, 8, 4),
    "roe": (20, 14, 9),
    "roa": (10, 6, 3),
    "dette_capitaux_propres": (0.3, 0.7, 1.5),
    "dette_nette_ebitda": (0.5, 1.5, 3.0),
    "liquidite_generale": (2.0, 1.5, 1.0),
    "couverture_interets": (15, 8, 3),
    "croissance_ca": (15, 8, 3),
    "croissance_bpa": (15, 8, 3),
    "rendement_dividende": (4, 2.5, 1),
    "taux_distribution": (40, 60, 80),
}


def _secteur(**changes):
    d = dict(GENERAL)
    d.update(changes)
    return d


REPERES = {
    "general": GENERAL,
    "technologie": _secteur(
        per=(18, 25, 35), per_prevu=(16, 22, 30), ev_ebitda=(12, 18, 25),
        cours_ca=(3, 6, 10), cours_valeur_comptable=(4, 8, 12), rendement_fcf=(5, 3.5, 2),
        marge_brute=(70, 55, 40), marge_operationnelle=(30, 20, 10), marge_nette=(25, 15, 8),
        roe=(25, 18, 12), croissance_ca=(25, 12, 5), croissance_bpa=(25, 12, 5),
        rendement_dividende=(2, 1, 0.3),
    ),
    "semi-conducteurs": _secteur(
        per=(16, 24, 35), per_prevu=(14, 20, 30), ev_ebitda=(12, 18, 25),
        cours_ca=(4, 7, 12), cours_valeur_comptable=(4, 8, 14), rendement_fcf=(5, 3.5, 2),
        marge_brute=(60, 50, 40), marge_operationnelle=(35, 25, 12), marge_nette=(30, 20, 10),
        roe=(25, 18, 12), croissance_ca=(25, 12, 5), croissance_bpa=(25, 12, 5),
        rendement_dividende=(2, 1, 0.3),
    ),
    "luxe": _secteur(
        per=(18, 24, 32), per_prevu=(16, 22, 28), ev_ebitda=(12, 16, 22),
        cours_ca=(3, 5, 8), cours_valeur_comptable=(4, 7, 10),
        marge_brute=(70, 62, 55), marge_operationnelle=(28, 20, 14), marge_nette=(18, 13, 8),
        roe=(25, 18, 12), rendement_dividende=(3, 2, 1),
    ),
    "energie": _secteur(
        per=(8, 11, 15), per_prevu=(8, 11, 15), ev_ebitda=(4, 6, 8),
        cours_ca=(0.6, 1.0, 1.6), cours_valeur_comptable=(1.0, 1.6, 2.5), rendement_fcf=(10, 7, 4),
        marge_brute=(None), marge_operationnelle=(15, 10, 5), marge_nette=(10, 6, 3),
        roe=(18, 12, 8), dette_nette_ebitda=(0.7, 1.5, 2.5), croissance_ca=(8, 3, 0),
        croissance_bpa=(10, 3, 0), rendement_dividende=(5, 3.5, 2), taux_distribution=(40, 55, 75),
    ),
    "banque": _secteur(
        per=(7, 10, 13), per_prevu=(7, 9, 12), ev_ebitda=None, cours_ca=None,
        cours_valeur_comptable=(0.8, 1.1, 1.5), rendement_fcf=None, marge_brute=None,
        marge_operationnelle=None, marge_nette=(30, 22, 15), roe=(14, 11, 8), roa=(1.2, 0.9, 0.6),
        dette_capitaux_propres=None, dette_nette_ebitda=None, liquidite_generale=None,
        couverture_interets=None, croissance_ca=(8, 4, 1), croissance_bpa=(10, 5, 1),
        rendement_dividende=(6, 4.5, 3), taux_distribution=(45, 60, 75),
    ),
    "industrie": _secteur(
        per=(14, 18, 24), ev_ebitda=(9, 12, 15), cours_ca=(1.2, 2, 3),
        marge_brute=(35, 27, 20), marge_operationnelle=(15, 10, 6), marge_nette=(10, 7, 4),
        roe=(18, 13, 9), rendement_dividende=(3, 2, 1),
    ),
    "distribution": _secteur(
        per=(12, 17, 23), ev_ebitda=(7, 10, 13), cours_ca=(0.4, 0.8, 1.5),
        marge_brute=(35, 25, 18), marge_operationnelle=(7, 4.5, 2.5), marge_nette=(4, 2.5, 1.2),
        roe=(20, 14, 9), liquidite_generale=(1.5, 1.1, 0.8),
    ),
    "sante": _secteur(
        per=(16, 22, 30), per_prevu=(14, 19, 26), ev_ebitda=(11, 15, 20), cours_ca=(3, 5, 8),
        marge_brute=(70, 55, 40), marge_operationnelle=(28, 18, 10), marge_nette=(20, 12, 6),
        roe=(22, 15, 10), rendement_dividende=(3, 2, 1),
    ),
    "telecom": _secteur(
        per=(10, 14, 18), ev_ebitda=(5, 7, 9), cours_ca=(0.8, 1.5, 2.5),
        marge_operationnelle=(20, 14, 8), marge_nette=(12, 8, 4), roe=(14, 10, 6),
        dette_nette_ebitda=(1.5, 2.5, 3.5), dette_capitaux_propres=(0.8, 1.3, 2.0),
        croissance_ca=(5, 2, 0), croissance_bpa=(8, 3, 0),
        rendement_dividende=(6, 4.5, 3), taux_distribution=(50, 70, 90),
    ),
}

ALIAS_SECTEURS = {
    "tech": "technologie", "logiciel": "technologie", "semi": "semi-conducteurs",
    "semiconducteurs": "semi-conducteurs", "puces": "semi-conducteurs", "énergie": "energie",
    "petrole": "energie", "pétrole": "energie", "banques": "banque", "assurance": "banque",
    "santé": "sante", "pharma": "sante", "télécom": "telecom", "télécoms": "telecom",
    "telecoms": "telecom", "commerce": "distribution", "retail": "distribution",
}

# (clé, libellé, pilier, sens, format)  sens : "bas" = plus bas est mieux.
RATIOS = [
    ("per", "PER (cours / bénéfice)", "valorisation", "bas", "x"),
    ("per_prevu", "PER prévisionnel", "valorisation", "bas", "x"),
    ("peg", "PEG (PER / croissance)", "valorisation", "bas", "x"),
    ("ev_ebitda", "VE / EBITDA", "valorisation", "bas", "x"),
    ("cours_ca", "Capitalisation / chiffre d'affaires", "valorisation", "bas", "x"),
    ("cours_valeur_comptable", "Cours / valeur comptable", "valorisation", "bas", "x"),
    ("rendement_fcf", "Rendement du free cash flow", "valorisation", "haut", "%"),
    ("marge_brute", "Marge brute", "rentabilite", "haut", "%"),
    ("marge_operationnelle", "Marge opérationnelle", "rentabilite", "haut", "%"),
    ("marge_nette", "Marge nette", "rentabilite", "haut", "%"),
    ("roe", "ROE (rentabilité des capitaux propres)", "rentabilite", "haut", "%"),
    ("roa", "ROA (rentabilité des actifs)", "rentabilite", "haut", "%"),
    ("dette_capitaux_propres", "Dette / capitaux propres", "solidite", "bas", "x"),
    ("dette_nette_ebitda", "Dette nette / EBITDA", "solidite", "bas", "x"),
    ("liquidite_generale", "Liquidité générale (actif / passif courant)", "solidite", "haut", "x"),
    ("couverture_interets", "Couverture des intérêts", "solidite", "haut", "x"),
    ("croissance_ca", "Croissance du chiffre d'affaires", "croissance", "haut", "%"),
    ("croissance_bpa", "Croissance du bénéfice par action", "croissance", "haut", "%"),
    ("rendement_dividende", "Rendement du dividende", "dividende", "haut", "%"),
    ("taux_distribution", "Taux de distribution (part du bénéfice versée)", "dividende", "bas", "%"),
]

PILIERS = {
    "valorisation": "Valorisation : l'action est-elle chère ?",
    "rentabilite": "Rentabilité : l'entreprise gagne-t-elle bien sa vie ?",
    "solidite": "Solidité financière : peut-elle encaisser un coup dur ?",
    "croissance": "Croissance : est-ce qu'elle grandit ?",
    "dividende": "Dividende : que reverse-t-elle aux actionnaires ?",
}

APPRECIATIONS = {4: "Très bon", 3: "Bon", 2: "Moyen", 1: "Faible"}
APPRECIATIONS_VALO = {4: "Bon marché", 3: "Raisonnable", 2: "Assez cher", 1: "Cher"}


@dataclass
class Resultat:
    fiche: dict
    secteur: str
    unite: str
    devise: str
    calc: dict = field(default_factory=dict)
    notes: dict = field(default_factory=dict)
    alertes: list = field(default_factory=list)
    manquants: list = field(default_factory=list)


def _num(fiche: dict, cle: str):
    v = fiche.get(cle)
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _div(a, b):
    if a is None or b is None or b == 0:
        return None
    return a / b


def _pct(a, b):
    r = _div(a, b)
    return None if r is None else r * 100


def calculer(fiche: dict) -> Resultat:
    secteur = str(fiche.get("secteur", "general")).strip().lower()
    secteur = ALIAS_SECTEURS.get(secteur, secteur)
    if secteur not in REPERES:
        secteur = "general"
    res = Resultat(fiche, secteur, fiche.get("unite", ""), fiche.get("devise", ""))
    g = lambda k: _num(fiche, k)  # noqa: E731
    c = res.calc

    cours, nb = g("cours"), g("nb_actions")
    ca, bn = g("chiffre_affaires"), g("benefice_net")
    ebitda, cp = g("ebitda"), g("capitaux_propres")
    dette, treso = g("dette_totale"), g("tresorerie")

    c["capitalisation"] = cours * nb if cours is not None and nb is not None else None
    c["bpa"] = g("bpa") if g("bpa") is not None else _div(bn, nb)
    c["valeur_comptable_par_action"] = _div(cp, nb)
    c["dette_nette"] = dette - treso if dette is not None and treso is not None else None
    cap = c["capitalisation"]
    c["valeur_entreprise"] = cap + c["dette_nette"] if cap is not None and c["dette_nette"] is not None else None

    fcf = g("free_cash_flow")
    if fcf is None and g("flux_tresorerie_operationnel") is not None and g("capex") is not None:
        fcf = g("flux_tresorerie_operationnel") - abs(g("capex"))
    c["free_cash_flow"] = fcf

    # Valorisation
    c["per"] = _div(cours, c["bpa"]) if c["bpa"] and c["bpa"] > 0 else None
    bpa_prevu = g("bpa_prevu")
    if bpa_prevu is None and g("benefice_net_prevu") is not None:
        bpa_prevu = _div(g("benefice_net_prevu"), nb)
    c["bpa_prevu"] = bpa_prevu
    c["per_prevu"] = _div(cours, bpa_prevu) if bpa_prevu and bpa_prevu > 0 else None
    c["ev_ebitda"] = _div(c["valeur_entreprise"], ebitda) if ebitda and ebitda > 0 else None
    c["cours_ca"] = _div(cap, ca)
    c["cours_valeur_comptable"] = _div(cours, c["valeur_comptable_par_action"]) if cp and cp > 0 else None
    c["rendement_fcf"] = _pct(fcf, cap)

    # Rentabilité
    brut = g("benefice_brut")
    c["marge_brute"] = _pct(brut, ca)
    c["marge_operationnelle"] = _pct(g("resultat_operationnel"), ca)
    c["marge_nette"] = _pct(bn, ca)
    c["roe"] = _pct(bn, cp) if cp and cp > 0 else None
    c["roa"] = _pct(bn, g("total_actif"))

    # Solidité
    c["dette_capitaux_propres"] = _div(dette, cp) if cp and cp > 0 else None
    c["dette_nette_ebitda"] = _div(c["dette_nette"], ebitda) if ebitda and ebitda > 0 else None
    c["liquidite_generale"] = _div(g("actif_courant"), g("passif_courant"))
    interets = g("charges_interets")
    c["couverture_interets"] = _div(g("resultat_operationnel"), abs(interets)) if interets else None

    # Croissance (taux fournis directement en %, sinon calculés)
    c["croissance_ca"] = g("croissance_ca")
    if c["croissance_ca"] is None and g("chiffre_affaires_precedent"):
        c["croissance_ca"] = (_div(ca, g("chiffre_affaires_precedent")) - 1) * 100 if ca else None
    c["croissance_bpa"] = g("croissance_bpa")
    if c["croissance_bpa"] is None and g("benefice_net_precedent") and bn is not None:
        prec = g("benefice_net_precedent")
        if prec > 0:
            c["croissance_bpa"] = (bn / prec - 1) * 100
    croissance_prevue = g("croissance_bpa_prevue")
    base_peg = croissance_prevue if croissance_prevue is not None else c["croissance_bpa"]
    c["peg_base"] = "prévue" if croissance_prevue is not None else ("passée" if base_peg is not None else None)
    c["peg"] = _div(c["per"], base_peg) if c["per"] and base_peg and base_peg > 0 else None

    # Dividende
    dpa = g("dividende_par_action")
    c["rendement_dividende"] = _pct(dpa, cours) if dpa is not None else None
    c["taux_distribution"] = _pct(dpa, c["bpa"]) if dpa is not None and c["bpa"] and c["bpa"] > 0 else None

    _noter(res)
    _alertes(res)
    return res


def _noter_ratio(cle, valeur, seuils, sens):
    if valeur is None or seuils is None:
        return None
    t, b, m = seuils
    if sens == "bas":
        if valeur < 0:
            # Dette nette négative = plus de trésorerie que de dette : le meilleur cas.
            # Ailleurs (multiple de valorisation négatif), signe d'une anomalie.
            return 4 if cle == "dette_nette_ebitda" else 1
        return 4 if valeur <= t else 3 if valeur <= b else 2 if valeur <= m else 1
    return 4 if valeur >= t else 3 if valeur >= b else 2 if valeur >= m else 1


def _noter(res: Resultat):
    rep = REPERES[res.secteur]
    par_pilier: dict[str, list[int]] = {}
    for cle, libelle, pilier, sens, _ in RATIOS:
        seuils = rep.get(cle)
        val = res.calc.get(cle)
        if seuils is None:
            continue
        if val is None:
            if cle == "rendement_dividende" and res.fiche.get("dividende_par_action") is None:
                continue  # pas de dividende renseigné : pilier ignoré, pas une donnée manquante critique
            if cle in ("per_prevu", "peg", "taux_distribution"):
                continue
            res.manquants.append(libelle)
            continue
        n = _noter_ratio(cle, val, seuils, sens)
        res.notes[cle] = n
        par_pilier.setdefault(pilier, []).append(n)
    res.calc["notes_piliers"] = {
        p: round(sum(v) / len(v) * 2.5, 1) for p, v in par_pilier.items() if v
    }


def _alertes(res: Resultat):
    c, a = res.calc, res.alertes
    if c.get("bpa") is not None and c["bpa"] <= 0:
        a.append("L'entreprise perd de l'argent : le PER n'a pas de sens.")
    if c.get("taux_distribution") is not None and c["taux_distribution"] > 100:
        a.append("Le dividende dépasse le bénéfice : il n'est pas soutenable sans puiser dans la trésorerie ou s'endetter.")
    if c.get("free_cash_flow") is not None and c["free_cash_flow"] < 0:
        a.append("Le free cash flow est négatif : l'entreprise consomme plus de trésorerie qu'elle n'en génère.")
    if c.get("cours_valeur_comptable") is None and _num(res.fiche, "capitaux_propres") is not None \
            and _num(res.fiche, "capitaux_propres") <= 0:
        a.append("Capitaux propres négatifs : les ratios sur fonds propres (ROE, dette/capitaux propres) ne sont pas calculables.")
    if c.get("per") and c.get("per_prevu") and c["per_prevu"] > c["per"] * 1.15:
        a.append("Le PER prévisionnel est plus élevé que le PER actuel : le marché s'attend à une baisse des bénéfices.")
    if c.get("roe") and c["roe"] > 50 and c.get("dette_capitaux_propres") and c["dette_capitaux_propres"] > 2:
        a.append("ROE très élevé mais gonflé par la dette : la rentabilité est moins solide qu'il n'y paraît.")
    if c.get("marge_nette") and c["marge_nette"] > 45:
        a.append("Marges exceptionnellement hautes : vérifier qu'elles sont durables (concurrence, cycle, éléments exceptionnels).")


# ---------------------------------------------------------------------------
# Mise en forme
# ---------------------------------------------------------------------------
def _f(v, fmt="x", dec=1):
    if v is None:
        return "n.d."
    s = f"{v:,.{dec}f}".replace(",", " ").replace(".", ",")
    return s + (" %" if fmt == "%" else "")


def _montant(res, v):
    if v is None:
        return "n.d."
    return f"{_f(v)} {res.unite}{res.devise}".strip()


def _seuils_txt(seuils, sens, fmt):
    if seuils is None:
        return "—"
    t, b, m = seuils
    signe = "≤" if sens == "bas" else "≥"
    return f"très bon {signe} {_f(t, fmt)} · moyen {signe} {_f(m, fmt)}"


def _verdict(note):
    if note is None:
        return "—"
    return "🟢" if note >= 7.5 else "🟡" if note >= 5 else "🟠" if note >= 3.5 else "🔴"


def rapport(res: Resultat) -> str:
    f, c = res.fiche, res.calc
    nom = f.get("societe", "Société")
    ticker = f" ({f['ticker']})" if f.get("ticker") else ""
    L = [f"# Analyse boursière : {nom}{ticker}", ""]
    L.append(f"Secteur de comparaison : **{res.secteur}**"
             + (f" · Cours au {f['date_cours']}" if f.get("date_cours") else ""))
    L.append("")
    L.append("## Chiffres clés")
    L.append("")
    L.append("| | |")
    L.append("|---|---|")
    L.append(f"| Cours | {_f(_num(f, 'cours'), dec=2)} {res.devise} |")
    L.append(f"| Capitalisation | {_montant(res, c['capitalisation'])} |")
    L.append(f"| Valeur d'entreprise (capitalisation + dette nette) | {_montant(res, c['valeur_entreprise'])} |")
    L.append(f"| Bénéfice par action (BPA) | {_f(c['bpa'], dec=2)} {res.devise} |")
    if c.get("bpa_prevu"):
        L.append(f"| BPA prévu | {_f(c['bpa_prevu'], dec=2)} {res.devise} |")
    L.append(f"| Dette nette (négative = plus de trésorerie que de dette) | {_montant(res, c['dette_nette'])} |")
    L.append(f"| Free cash flow | {_montant(res, c['free_cash_flow'])} |")
    L.append("")

    notes_p = c["notes_piliers"]
    L.append("## Notes par pilier (sur 10)")
    L.append("")
    L.append("| Pilier | Note | |")
    L.append("|---|---|---|")
    for p, titre in PILIERS.items():
        n = notes_p.get(p)
        L.append(f"| {titre.split(' :')[0]} | {_f(n) if n is not None else 'n.d.'} | {_verdict(n)} |")
    L.append("")
    L.append("_Pour la valorisation, une bonne note veut dire que l'action est bon marché par rapport aux repères du secteur._")
    L.append("")

    rep = REPERES[res.secteur]
    for p, titre in PILIERS.items():
        lignes = []
        for cle, libelle, pilier, sens, fmt in RATIOS:
            if pilier != p or rep.get(cle) is None:
                continue
            val = c.get(cle)
            if val is None and cle in ("per_prevu", "peg", "rendement_dividende", "taux_distribution"):
                continue
            n = res.notes.get(cle)
            app = "n.d." if n is None else (APPRECIATIONS_VALO if p == "valorisation" else APPRECIATIONS)[n]
            lib = libelle + (f" (croissance {c['peg_base']})" if cle == "peg" and c.get("peg_base") else "")
            lignes.append(f"| {lib} | {_f(val, fmt)} | {app} | {_seuils_txt(rep[cle], sens, fmt)} |")
        if not lignes:
            continue
        L.append(f"## {titre}")
        L.append("")
        L.append("| Ratio | Valeur | Appréciation | Repère secteur |")
        L.append("|---|---|---|---|")
        L.extend(lignes)
        L.append("")

    forts = [lib for cle, lib, *_ in RATIOS if res.notes.get(cle) == 4]
    faibles = [lib for cle, lib, *_ in RATIOS if res.notes.get(cle) == 1]
    L.append("## En résumé")
    L.append("")
    L.append("**Points forts :** " + (", ".join(forts) if forts else "aucun ratio au niveau « très bon »."))
    L.append("")
    L.append("**Points faibles :** " + (", ".join(faibles) if faibles else "aucun ratio au niveau « faible »."))
    L.append("")
    if res.alertes:
        L.append("**Signaux d'alerte :**")
        L.append("")
        L.extend(f"- {a}" for a in res.alertes)
        L.append("")

    risques = f.get("risques") or []
    L.append("## Risques et actualité")
    L.append("")
    if risques:
        L.extend(f"- {r}" for r in risques)
    else:
        L.append("- Aucun élément d'actualité renseigné. Les ratios ne disent rien des enquêtes, procès, "
                 "changements de dirigeants ou ruptures de marché : à vérifier avant toute conclusion.")
    L.append("")

    if res.manquants:
        L.append("## Données manquantes")
        L.append("")
        L.append("Ces ratios n'ont pas pu être calculés et sont **exclus des notes** (ils ne comptent pas comme mauvais) : "
                 + ", ".join(res.manquants) + ".")
        L.append("")

    sources = f.get("sources") or []
    if sources:
        L.append("## Sources")
        L.append("")
        L.extend(f"- {s}" for s in sources)
        L.append("")

    L.append("---")
    L.append("_Repères sectoriels indicatifs (ordres de grandeur de long terme), pas des données de marché en temps réel. "
             "Analyse des chiffres uniquement, pas un conseil d'achat ou de vente._")
    return "\n".join(L)


def comparatif(resultats: list[Resultat]) -> str:
    noms = [r.fiche.get("ticker") or r.fiche.get("societe", "?") for r in resultats]
    L = ["# Comparatif : " + " · ".join(noms), ""]
    L.append("| | " + " | ".join(noms) + " |")
    L.append("|---|" + "---|" * len(noms))
    L.append("| Secteur | " + " | ".join(r.secteur for r in resultats) + " |")
    L.append("| Capitalisation | " + " | ".join(_montant(r, r.calc["capitalisation"]) for r in resultats) + " |")
    for cle, libelle, _, _, fmt in RATIOS:
        vals = [r.calc.get(cle) for r in resultats]
        if all(v is None for v in vals):
            continue
        L.append(f"| {libelle} | " + " | ".join(_f(v, fmt) for v in vals) + " |")
    L.append("| **Notes /10** | " + " | ".join("" for _ in resultats) + " |")
    for p, titre in PILIERS.items():
        vals = [r.calc["notes_piliers"].get(p) for r in resultats]
        if all(v is None for v in vals):
            continue
        L.append(f"| {titre.split(' :')[0]} | "
                 + " | ".join(f"{_f(v)} {_verdict(v)}" if v is not None else "n.d." for v in vals) + " |")
    L.append("")
    for r in resultats:
        if r.alertes:
            nom = r.fiche.get("ticker") or r.fiche.get("societe")
            L.extend(f"- **{nom}** : {a}" for a in r.alertes)
    L.append("")
    L.append("_Comparer de préférence des sociétés du même secteur. Pas un conseil d'achat ou de vente._")
    return "\n".join(L)


def main(argv):
    fichiers = [a for a in argv if not a.startswith("--")]
    if not fichiers:
        print(__doc__)
        return 1
    resultats = []
    for chemin in fichiers:
        with open(chemin, encoding="utf-8") as fh:
            resultats.append(calculer(json.load(fh)))
    if "--json" in argv:
        out = [{"societe": r.fiche.get("societe"), "secteur": r.secteur, "ratios": r.calc,
                "notes_ratios": r.notes, "alertes": r.alertes, "donnees_manquantes": r.manquants}
               for r in resultats]
        print(json.dumps(out if len(out) > 1 else out[0], ensure_ascii=False, indent=2))
    elif len(resultats) == 1:
        print(rapport(resultats[0]))
    else:
        print(comparatif(resultats))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
