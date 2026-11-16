# Episode 1 — playful cut (60 s)

The final version of "Meet the Pocket Five": button cold open, the island bouncing like jelly, title sting,
name cards, chained introductions (confetti → Moka's yawn → Zippy's kickflip knocks over Nimi's books → she
restacks them counting "One… Two… Three!"), the empty rock, Moka's "He's behind us", the jump-scare,
the group photo shown as a polaroid with Nox photobombing, then the sky, white and the brand card
"Five friends. One wobbly world. Endless adventures!".

Build from this folder (same tools as the parent README):
1. `../../tts/venv/bin/python synth.py ../../tts` and `python scream.py ../../tts` (voices; final takes are in `voice/`)
2. `python build_timeline.py` → `timeline.json`
3. link `lib/` and `fonts/` from the parent build, write `timeline.js`, then
   `TAIL=film_tail2.js OUT=film.html python3 ../assemble.py ../../pocket-five.html`
4. `node render.js /opt/node22/lib 0 1799 out/frames 1` and `OVL=1 node render.js /opt/node22/lib 0 1799 out/ovl 1`
5. `python -I audio.py` then `./finish.sh`
