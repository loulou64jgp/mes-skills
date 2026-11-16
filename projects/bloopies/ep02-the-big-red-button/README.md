# Episode 2 — The Big Red Button (65 s, 1080x1920)

Zippy finds a red button with a "DO NOT PRESS!" sign, ignores Nimi and presses it. A bubble machine hidden
under the island floods everything with bubbles: Sunny floats away in one, Zippy kickflips off one, Nimi swats
them, Moka is carried off asleep with his cocoa, Nox stays unimpressed. Nimi's three solutions fail, a giant
bubble lifts the group, Moka suggests pressing it again, everyone pushes, Nox helps in secret with violet
magic, Zippy lands on the button and every bubble pops. Final joke: a blue button rises from the grass.

Same models, island, lighting and post as episode 1 (the film page is assembled from `../../bloopies.html`).
Build: `synth.py` + `layered.py` (voices), `build_timeline.py`, then
`TAIL=film_tail3.js OUT=film.html python3 ../ep01-meet-the-bloopies/assemble.py ../../bloopies.html` (film_tail3.js
= header of ep01's playful-cut film_tail2.js + `ep2_mid.js` + its overlay code), `render.js` for frames and
overlays (`OVL=1`), `audio.py`, `finish.sh` (downscales to 1080x1920).
