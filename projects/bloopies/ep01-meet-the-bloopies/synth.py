import json,sys,subprocess,soundfile as sf,numpy as np
from kokoro_onnx import Kokoro
T=sys.argv[1];k=Kokoro(T+"/kokoro-q8.onnx",T+"/voices.npz")
V={"n":("bm_george",.98,1.0),"sunny":("af_bella",1.1,1.16),"moka":("am_michael",.82,.97),"zippy":("am_puck",1.18,1.2),"nimi":("af_nicole",1.0,1.1),"nox":("am_onyx",.88,.94)}
lines=json.load(open("lines.json"))
ONLY=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else None
for i,(who,text,_) in enumerate(lines):
    if ONLY and i not in ONLY:continue
    v,sp,pitch=V[who];a,sr=k.create(text,voice=v,speed=sp,lang="en-us")
    raw=f"voice/raw_{i:02d}.wav";sf.write(raw,a,sr)
    f=f"asetrate={int(sr*pitch)},aresample=48000,atempo={1/pitch:.5f}" if pitch!=1 else "aresample=48000"
    if who=="nox":f+=",aecho=0.8:0.6:90|180:0.25|0.12"
    subprocess.run(["ffmpeg","-y","-v","error","-i",raw,"-af",f+",silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse","-ar","48000","-ac","1",f"voice/l_{i:02d}.wav"],check=True)
    d=sf.info(f"voice/l_{i:02d}.wav").duration;print(i,who,round(d,2))
