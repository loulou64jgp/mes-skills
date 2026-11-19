#!/usr/bin/env python3
"""Mesure les basses d'un enregistrement (pour l'animation uniquement, l'audio n'est jamais réutilisé).
Usage : python3 bass.py <enregistrement.mp4> <decalage_s> <duree_video_s> <sortie.json>
  decalage_s = instant de l'enregistrement qui correspond à t=0 de la vidéo.
Sortie : {"bass": [niveau 0..1 par image à 30 i/s], "bassKick": [enveloppe des coups de basse 0..1]}"""
import sys, json, math, subprocess, array
src, off, dur, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
SR, FPS = 22050, 30
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-map', '0:a', '-ac', '1', '-ar', str(SR),
                      '-af', 'lowpass=f=120,lowpass=f=120', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = array.array('h'); a.frombytes(raw)
win = SR // FPS
def rms_at(t):
    i = int(t * SR) - win // 2
    if i < 0 or i + win > len(a): return 1e-6
    return math.sqrt(sum(x * x for x in a[i:i + win]) / win) / 32768 + 1e-6
n = int(dur * FPS) + 1
db = [20 * math.log10(rms_at(off + k / FPS)) for k in range(n)]
srt = sorted(db); lo, hi = srt[int(0.2 * n)], srt[min(n - 1, int(0.98 * n))]
lvl = [max(0.0, min(1.0, (d - lo) / max(1e-3, hi - lo))) for d in db]
lvl = [lvl[0]] + [0.5 * lvl[k] + 0.5 * lvl[k - 1] for k in range(1, n)]          # light smoothing
on = [0.0] + [max(0.0, lvl[k] - lvl[k - 1]) for k in range(1, n)]               # rising edges = bass hits
m = sorted(on)[int(0.97 * n)] or 1e-3
kick, env = [], 0.0
for v in on:
    env = max(env * 0.80, min(1.0, v / m)); kick.append(round(env, 3))
json.dump({'bass': [round(v, 3) for v in lvl], 'bassKick': kick}, open(out, 'w'))
print(f'{n} images, basses mesurées, {sum(1 for v in on if v > 0.6 * m)} coups détectés')
