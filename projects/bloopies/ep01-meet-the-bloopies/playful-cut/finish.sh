#!/bin/bash
# encode frames -> h264 crf 16, loudness-normalise the mix to -14 LUFS / -1.5 dBTP (two-pass), mux, QA
set -e
cd "$(dirname "$0")"
ffmpeg -y -v error -framerate 30 -i out/frames/f_%05d.png -framerate 30 -i out/ovl/o_%05d.png -filter_complex "[0][1]overlay=format=auto,format=yuv420p" -frames:v $(ls out/ovl | wc -l) -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -movflags +faststart out/video.mp4
M=$(ffmpeg -nostats -i audio/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i audio/mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -ar 48000 audio/mix.wav
ffmpeg -y -v error -i out/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest out/bloopies-ep1-v2.mp4
ls -la out/bloopies-ep1-v2.mp4
