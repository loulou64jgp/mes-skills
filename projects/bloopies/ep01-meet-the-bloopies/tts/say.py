import sys,soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro(sys.argv[1],sys.argv[2])
a,sr=k.create(sys.argv[4],voice=sys.argv[3],speed=float(sys.argv[6]) if len(sys.argv)>6 else 1.0,lang="en-us")
sf.write(sys.argv[5],a,sr);print(sr,len(a)/sr)
