import sys,subprocess,soundfile as sf
from kokoro_onnx import Kokoro
T=sys.argv[1];k=Kokoro(T+"/kokoro-q8.onnx",T+"/voices.npz")
V={"sunny":("af_bella",1.16),"moka":("am_michael",.97),"zippy":("am_puck",1.2),"nimi":("af_nicole",1.1)}
for who,(v,p) in V.items():
    a,sr=k.create("Aaaaah!",voice=v,speed=1.1,lang="en-us");sf.write(f"voice/raw_scream_{who}.wav",a,sr)
    subprocess.run(["ffmpeg","-y","-v","error","-i",f"voice/raw_scream_{who}.wav","-af",f"asetrate={int(sr*p*1.08)},aresample=48000,atempo={1/(p*1.08):.4f},silenceremove=start_periods=1:start_threshold=-45dB","-ar","48000","-ac","1",f"voice/scream_{who}.wav"],check=True)
    print(who,sf.info(f"voice/scream_{who}.wav").duration)
