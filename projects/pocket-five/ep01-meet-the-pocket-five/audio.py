# Original score + synthesized SFX + mix, all from timeline.json
import json,numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt
SR=48000;TL=json.load(open("timeline.json"));N=int(TL["end"]*SR)+SR
rng=np.random.default_rng(7)
def bf(x,f,kind,o=2):return sosfilt(butter(o,f,kind,fs=SR,output="sos"),x)
def env(n,a=.005,d=.2):t=np.arange(n)/SR;return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def place(buf,x,t,g=1.0):
    i=int(t*SR);
    if i<0:x=x[-i:];i=0
    n=min(len(x),len(buf)-i);buf[i:i+n]+=x[:n]*g
def note(m):return 440*2**((m-69)/12)
def sine(f,dur,ph=0):t=np.arange(int(dur*SR))/SR;return np.sin(2*np.pi*f*t+ph)
_PC={}
def pluck(f,dur=.6,bright=.5):
    if (f,dur) in _PC:return _PC[(f,dur)]
    _PC[(f,dur)]=_pluck(f,dur,bright);return _PC[(f,dur)]
def _pluck(f,dur,bright):
    n=int(dur*SR);p=max(2,int(SR/f));buf=rng.uniform(-1,1,p);out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%p];buf[i%p]=.5*(buf[i%p]+buf[(i+1)%p])*(.994 if bright>.4 else .99)
    return out*env(n,.002,dur*.6)
def glock(f,dur=1.2):
    return (sine(f,dur)+.35*sine(f*2.76,dur)+.12*sine(f*5.4,dur))*env(int(dur*SR),.001,.35)
def kick():n=int(.35*SR);t=np.arange(n)/SR;f=50+70*np.exp(-t*30);return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.001,.12)
def noise(d):return rng.uniform(-1,1,int(d*SR))
def shaker():return bf(noise(.06),6000,"highpass")*env(int(.06*SR),.002,.02)
def clap():return bf(noise(.2),[900,2500],"bandpass")*env(int(.2*SR),.001,.05)
def pad(fs,dur):
    x=sum(sine(f*(1+d),dur) for f in fs for d in(-.003,0,.003))
    t=np.arange(len(x))/SR;return bf(x,1800,"lowpass")*np.minimum(1,t/1.2)*np.minimum(1,(dur-t)/1.0)/len(fs)/3

# ---------------- MUSIC ----------------
bpm=112;B=60/bpm;BAR=4*B
lines={l["i"]:l for l in TL["lines"]};S=lambda i:lines[i]["start"];E=lambda i:lines[i]["end"]
mus=np.zeros(N)
MAJ=[(53,[65,69,72]),(50,[62,65,69]),(46,[62,65,70]),(48,[64,67,72])]   # F Dm Bb C
MIN=[(50,[62,65,69]),(46,[58,62,65]),(43,[55,58,62]),(45,[57,61,64])]   # Dm Bb Gm A
MOTIF=[2,1,0,1, 2,2,None,1, 0,1,2,None, 1,0,None,None]
start=S(1);noxA,noxB=S(13),TL["events"][[e[0] for e in TL["events"]].index("appear")][1]
grp=S(17);out=S(20)
# hook: pad + twinkles
place(mus,pad([note(m) for m in(65,69,72,77)],start+.2),0,1.0)
for k in range(9):place(mus,glock(note([84,81,77,79,84,88,84,81,79][k])),.4+k*B*1.2,.18)
t=start;bar=0
import os
while t<out+BAR*.5 and not os.environ.get('QUICK'):
    nox=noxA<=t<grp;prog=MIN if nox else MAJ;root,ch=prog[bar%4]
    drums=not(nox and t<noxB)
    for b in range(4):
        tb=t+b*B
        if drums:
            if b in(0,2):place(mus,kick(),tb,.55)
            if b in(1,3):place(mus,clap(),tb,.12)
            for s in range(4):place(mus,shaker(),tb+s*B/4,.05+.03*(s%2))
        place(mus,bf(sine(note(root-12 if nox else root),B*.95)*env(int(B*.95*SR),.01,.5),400,"lowpass"),tb,.42 if b in(0,2) else .0)
        for s in range(2):place(mus,pluck(note(ch[(b*2+s)%3]+12)),tb+s*B/2,.16)
    if not nox:
        for s in range(4):
            m=MOTIF[(bar%4)*4+s]
            if m is not None:place(mus,glock(note(ch[m]+12)),t+s*B,.13)
    else:
        place(mus,glock(note(ch[0]+24),2.0),t,.06)
    t+=BAR;bar+=1
# outro: final chord ringing
place(mus,pad([note(m) for m in(53,65,69,72,77)],TL["end"]-out+.5),out,1.2)
for k,m in enumerate([72,77,81,84]):place(mus,glock(note(m),2.5),t+k*.18,.15)
fade=np.ones(N);fe=int(TL["end"]*SR);fade[fe-int(1.2*SR):fe]=np.linspace(1,0,int(1.2*SR));fade[fe:]=0;mus*=fade

# ---------------- VOICE ----------------
voice=np.zeros(N)
for l in TL["lines"]:
    a,sr=sf.read(f"voice/l_{l['i']:02d}.wav");a=a/np.max(np.abs(a))*.7;place(voice,a,l["start"])
# sidechain duck: -7 dB under voice
v=np.abs(voice);w=int(.05*SR);sm=np.convolve(v,np.ones(w)/w,"same")
gate=(sm>.01).astype(float);k=int(.35*SR);gate=np.convolve(gate,np.ones(k)/k,"same").clip(0,1)
mus*=1-gate*(1-10**(-7/20))

# ---------------- SFX ----------------
fx=np.zeros(N)
def sweep(f1,f2,d,kind="sine"):
    t=np.arange(int(d*SR))/SR;f=f1*(f2/f1)**(t/d);ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph) if kind=="sine" else np.sign(np.sin(ph))*.5)*env(len(t),.004,d*.5)
def whoosh(d=.6):x=noise(d);t=np.arange(len(x))/SR;e=np.sin(np.pi*t/d)**2;return bf(x*e,[400,3000],"bandpass")*.9
def sparkle():o=np.zeros(int(.8*SR));[place(o,glock(note(m),.5),k*.06,.5) for k,m in enumerate([88,91,95,100])];return o
def poof():
    o=bf(noise(.7),1600,"lowpass")*env(int(.7*SR),.004,.18)*1.4;w=sweep(160,50,.5)*.5;o[:len(w)]+=w;return o
def shutter():o=np.zeros(int(.3*SR));place(o,bf(noise(.02),3000,"highpass"),0,1);place(o,bf(noise(.04),[1000,2500],"bandpass")*env(int(.04*SR),.001,.01),.09,1.2);return o
def boing():t=np.arange(int(.35*SR))/SR;f=300+260*np.sin(t*40)*np.exp(-t*6)+300*t;return np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.003,.15)
def zzz():t=np.arange(int(1.6*SR))/SR;return sine(600,1.6)*(.5+.5*np.sin(2*np.pi*7*t))*np.exp(-t*1.5)*.3
def impact():
    o=sweep(120,40,.6)*1.2;h=bf(noise(.15),800,"lowpass")*env(int(.15*SR),.001,.05);o[:len(h)]+=h;return o
SFXMAP={"spin":lambda:boing()+np.pad(sparkle(),(int(.15*SR),0))[:int(.35*SR)]*0,"yawn":lambda:sweep(380,160,1.1)*.5,
 "flip":lambda:sweep(1300,200,.25,"sq")*.5,"bulb":lambda:glock(note(91),.9)+.6*np.pad(glock(note(96),.8),(int(.06*SR),int(.04*SR)))[:int(.9*SR)],
 "appear":lambda:poof(),"vanish":lambda:poof()*.8,"shutter":shutter,"zzz":zzz}
for name,t,who in TL["events"]:
    if name=="spin":place(fx,boing(),t,.9);place(fx,sparkle(),t+.25,.5)
    elif name=="kick":place(fx,impact(),t-.02,.8)
    elif name=="flash":place(fx,sparkle(),t-.05,.6);place(fx,whoosh(.5)[::-1],t-.45,.6)
    elif name=="hop":[place(fx,boing(),t+d,.6) for d in(0,.12,.25,.35,.45)]
    elif name in SFXMAP:place(fx,SFXMAP[name](),t,.8)
for sid,t,g in TL["shots"]:
    if g>0:place(fx,whoosh(.55),t-.05,.45)

# ---------------- MIX (music +3 dB, SFX -6 dB, voice unchanged) ----------------
MUS=.5*10**(3/20);FXG=.6*10**(-6/20)
mix=voice+mus*MUS+fx*FXG
mix=mix[:int(TL["end"]*SR)]
peak=np.max(np.abs(mix));mix=mix/peak*.89
sf.write("audio/mix_raw.wav",mix,SR);sf.write("audio/stem_voice.wav",voice[:len(mix)],SR)
sf.write("audio/stem_music.wav",(mus*MUS)[:len(mix)],SR);sf.write("audio/stem_sfx.wav",(fx*FXG)[:len(mix)],SR)
print("len",len(mix)/SR,"peak before norm",peak)
