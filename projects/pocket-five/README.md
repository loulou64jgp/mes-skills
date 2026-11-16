# The Pocket Five

An original kawaii 3D universe: Sunny, Moka, Zippy, Nimi and Nox on a floating island.

| Path | What it is |
|---|---|
| `pocket-five.html` | Interactive 3D page: the five characters, their faces, voices, signature moves, day/night, scenes and the character bible. Every model in the videos comes from this file. |
| `CHATGPT_PROMPT.md` | The full brief (look, personality, voice, rules) to paste into ChatGPT or any other assistant. |
| `portraits/` | 1600x1600 transparent PNG of each character. |
| `ep01-meet-the-pocket-five/` | Episode 1 sources. **`playful-cut/` is the final version** (60 s); the folder root holds the first, slower cut (its last voice line still says the old name). |

## Rebuild episode 1

Needs Node 22 with Playwright + Chromium, Python 3, ffmpeg.

1. **Voice model** (Kokoro-82M, Apache-2.0, from npm because the usual model hosts may be blocked):
   ```bash
   mkdir -p ../tts && cd ../tts && npm init -y && npm i --ignore-scripts kokoro-q8-shards kokoro-js three@0.128.0
   cat node_modules/kokoro-q8-shards/kokoro-q8.part{0,1,2,3,4,5}.bin > kokoro-q8.onnx   # sha256 fbae9257…a1478
   python3 -m venv venv && ./venv/bin/pip install kokoro-onnx soundfile scipy pillow
   ./venv/bin/python -I ../ep01-meet-the-pocket-five/tts/mkvoices.py node_modules/kokoro-js/voices voices.npz
   ```
   The scripts expect this `tts/` folder next to the episode folder, and `pocket-five.html` one level above the episode folder.
2. **Voices:** `../tts/venv/bin/python synth.py ../tts` (lines and voices are in `lines.json`; the final takes are already in `voice/`).
3. **Timeline:** `python build_timeline.py` → `timeline.json` (line timings, words, events, shots; everything else reads it).
4. **Film page:** copy three r128 + `examples/js` post-processing files into `lib/`, write `timeline.js` (`window.__TL=<timeline.json>;`), then `python3 assemble.py ../pocket-five.html`.
5. **Frames:** `node render.js /opt/node22/lib 0 1948 out/frames 1` (resumable; ~1 s per 2K frame with SwiftShader).
6. **Sound:** `../tts/venv/bin/python -I audio.py` (original score + synthesized SFX, music +3 dB, SFX −6 dB, voice unchanged).
7. **Speech bubbles + title:** `OVL=1 node render.js /opt/node22/lib 0 1935 out/ovl 1` (needs `npm i @fontsource/mochiy-pop-one @fontsource/m-plus-rounded-1c` in `fonts/`).
8. **Final:** `./finish.sh` (H.264 CRF 16, loudness −14 LUFS / −1.5 dBTP, mux) then QA with the `cartoon-3d-short` skill's `short_qa.py`.

Portraits: `TAIL=portrait_tail.js OUT=portrait.html python3 assemble.py ../pocket-five.html`, set the canvas to 1600x1600, then `node shoot.js`.
