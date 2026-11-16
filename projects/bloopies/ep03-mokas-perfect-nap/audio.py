# Episode 1 (playful cut): original score + character stings + SFX + mix, all driven by timeline.json
import json,os,numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt
SR=48000;TL=json.load(open("timeline.json"));END=TL["end"];N=int(END*SR)+SR
rng=np.random.default_rng(7)
def bf(x,f,kind,o=2):return sosfilt(butter(o,f,kind,fs=SR,output="sos"),x)
def env(n,a=.005,d=.2):t=np.arange(n)/SR;return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def place(buf,x,t,g=1.0):
    i=int(t*SR)
    if i<0:x=x[-i:];i=0
    n=min(len(x),len(buf)-i)
    if n>0:buf[i:i+n]+=x[:n]*g
def note(m):return 440*2**((m-69)/12)
def sine(f,dur):t=np.arange(int(dur*SR))/SR;return np.sin(2*np.pi*f*t)
_PC={}
def pluck(f,dur=.6):
    k=(round(f,2),dur)
    if k in _PC:return _PC[k]
    n=int(dur*SR);p=max(2,int(SR/f));buf=rng.uniform(-1,1,p);out=np.zeros(n)
    for i in range(n):out[i]=buf[i%p];buf[i%p]=.5*(buf[i%p]+buf[(i+1)%p])*.994
    _PC[k]=out*env(n,.002,dur*.6);return _PC[k]
def glock(f,dur=1.2):return (sine(f,dur)+.35*sine(f*2.76,dur)+.12*sine(f*5.4,dur))*env(int(dur*SR),.001,.35)
def kick():n=int(.35*SR);t=np.arange(n)/SR;f=50+70*np.exp(-t*30);return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.001,.12)
def noise(d):return rng.uniform(-1,1,int(d*SR))
def shaker():return bf(noise(.06),6000,"highpass")*env(int(.06*SR),.002,.02)
def clap():return bf(noise(.2),[900,2500],"bandpass")*env(int(.2*SR),.001,.05)
def pad(fs,dur):
    x=sum(sine(f*(1+d),dur) for f in fs for d in(-.003,0,.003));t=np.arange(len(x))/SR
    return bf(x,1800,"lowpass")*np.minimum(1,t/.8)*np.minimum(1,np.maximum(0,(dur-t)/.8))/len(fs)/3
def sweep(f1,f2,d,kind="sine"):
    t=np.arange(int(d*SR))/SR;f=f1*(f2/f1)**(t/d);ph=2*np.pi*np.cumsum(f)/SR
    x=np.sin(ph) if kind=="sine" else (np.sign(np.sin(ph))*.5 if kind=="sq" else 2*((ph/(2*np.pi))%1)-1)
    return x*env(len(t),.004,d*.5)
def mixin(a,b,off=0):
    n=max(len(a),off+len(b));o=np.zeros(n);o[:len(a)]+=a;o[off:off+len(b)]+=b;return o


E={};[E.setdefault(e[0],[]).append(e[1]) for e in TL["events"]]
e1=lambda n:E[n][0]
L={l["tag"]:l for l in TL["lines"]}
bpm=120;B=60/bpm;BAR=4*B
MAJ=[(53,[65,69,72]),(50,[62,65,69]),(46,[62,65,70]),(48,[64,67,72])]
MIN=[(50,[62,65,69]),(46,[58,62,65]),(43,[55,58,62]),(45,[57,61,64])]
MOTIF=[2,1,0,1, 2,2,None,1, 0,1,2,None, 1,0,None,None]
def bed(t0,t1,prog,drums=True,melody=True,bass_oct=0,pl=.16):
    o=np.zeros(N);t=t0;bar=0
    while t<t1:
        root,ch=prog[bar%4]
        for b in range(4):
            tb=t+b*B
            if tb>=t1:break
            if drums:
                if b in(0,2):place(o,kick(),tb,.55)
                if b in(1,3):place(o,clap(),tb,.12)
                for s in range(4):place(o,shaker(),tb+s*B/4,.05+.03*(s%2))
            if b in(0,2):place(o,bf(sine(note(root+bass_oct),B*1.9)*env(int(B*1.9*SR),.01,.5),400,"lowpass"),tb,.42)
            for s in range(2):place(o,pluck(note(ch[(b*2+s)%3]+12)),tb+s*B/2,pl)
            if melody and MOTIF[(bar%4)*4+b] is not None:place(o,glock(note(ch[MOTIF[(bar%4)*4+b]]+12)),tb,.12)
        t+=BAR;bar+=1
    m=np.zeros(N);i0,i1=int(t0*SR),int(min(t1,END)*SR);m[i0:i1]=1;k=int(.08*SR);m=np.convolve(m,np.ones(k)/k,"same");return o*m

T=e1
def lull(t0,t1,g=1.0):
    o=np.zeros(N);t=t0;k=0;CH=[[65,69,72],[62,65,69],[58,62,65],[60,64,67]]
    while t<t1:
        ch=CH[k%4];place(o,pad([note(m) for m in ch],min(4.0,t1-t)+.6),t,.9)
        for j,m in enumerate([ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+24]):
            if t+j*.95<t1:place(o,glock(note(m),1.6),t+j*.95,.1)
        t+=3.8;k+=1
    m=np.zeros(N);i0,i1=int(t0*SR),int(min(t1,END)*SR);m[i0:i1]=1;kk=int(.3*SR);m=np.convolve(m,np.ones(kk)/kk,"same");return o*m*g
def pizz(t0,t1):
    o=np.zeros(N);t=t0;k=0;seq=[60,64,67,64,62,65,69,65]
    while t<t1:place(o,pluck(note(seq[k%8]),.3),t,.25);t+=.3;k+=1
    return o
mus=np.zeros(N)
mus+=lull(0,T("zippy_pass"))
mus+=bed(T("zippy_pass")+.4,T("sign")-.2,MAJ)
mus+=pizz(T("sign"),T("sneeze"))
mus+=lull(T("notice")-.3,T("drift")+.4)
mus+=bed(T("drift")+.4,T("return"),MIN,drums=True,melody=False,bass_oct=-12)
mus+=lull(T("return"),T("white"),.9)
place(mus,pad([note(m) for m in(53,65,69,72,77)],END-T("white")+.4),T("white"),1.3)
fade=np.ones(N);fe=int(END*SR);fade[fe-int(1.0*SR):fe]=np.linspace(1,0,int(1.0*SR));fade[fe:]=0;mus*=fade
voice=np.zeros(N)
for l in TL["lines"]:
    a,sr=sf.read(f"voice/l_{l['i']:02d}.wav");a=a/np.max(np.abs(a))*(.8 if l["who"]=="n" else .7);place(voice,a,l["start"])
v=np.abs(voice);w=int(.05*SR);sm=np.convolve(v,np.ones(w)/w,"same")
gate=(sm>.01).astype(float);k=int(.35*SR);gate=np.convolve(gate,np.ones(k)/k,"same").clip(0,1)
mus*=1-gate*(1-10**(-11/20))
fx=np.zeros(N)
def whoosh(d=.6):x=noise(d);t=np.arange(len(x))/SR;e=np.sin(np.pi*t/d)**2;return bf(x*e,[400,3000],"bandpass")*.9
def sparkle():o=np.zeros(int(.8*SR));[place(o,glock(note(m),.5),k*.06,.5) for k,m in enumerate([88,91,95,100])];return o
def boing(f0=300):t=np.arange(int(.35*SR))/SR;f=f0+260*np.sin(t*40)*np.exp(-t*6)+300*t;return np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.003,.15)
def plip(f):return sweep(f,f*1.8,.07)*.8
def pop(big=False):d=.12 if not big else .3;return mixin(bf(noise(d),[800,4000] if not big else [300,2500],"bandpass")*env(int(d*SR),.001,d/4)*(1.6 if big else 1),sweep(900 if not big else 300,200 if not big else 60,d)*.4)
def boop(f=880):return mixin(sweep(f,f/2,.18)*1.0,bf(noise(.02),3000,"highpass")*1.5)
def bloop(d=.7):return sweep(140,520,d)*.9
def rumble(d):x=bf(noise(d),180,"lowpass");t=np.arange(len(x))/SR;return x*np.minimum(1,t/.2)*np.minimum(1,(d-t)/.4)*3
def hum(d):t=np.arange(int(d*SR))/SR;f=70+6*np.sin(2*np.pi*3*t);x=bf(2*((np.cumsum(f)/SR)%1)-1,500,"lowpass");return x*np.minimum(1,t/.3)*np.minimum(1,(d-t)/.3)*.5
def clank():return bf(noise(.08),[1500,5000],"bandpass")*env(int(.08*SR),.001,.02)*2
def roll(d=1.2):x=bf(noise(d),[150,900],"bandpass");t=np.arange(len(x))/SR;return x*(.6+.4*np.sin(2*np.pi*22*t))*np.minimum(1,(d-t)/.3)*.8
def skid():return bf(noise(.35),[1200,3500],"bandpass")*env(int(.35*SR),.01,.2)*1.4
def swish():return whoosh(.25)*1.2
def bonk():return mixin(boing(220),bf(noise(.05),600,"lowpass")*1.5)
def shimmer():o=np.zeros(int(1.6*SR));[place(o,glock(note(m),.8),k*.07,.45) for k,m in enumerate([84,88,91,96,100,103])];place(o,bf(sweep(110,220,1.4,"saw"),600,"lowpass")*.4,0);return o
def jingle(t0,g=.5):[place(fx,glock(note(m),1.2),t0+k*.14,g) for k,m in enumerate([77,81,84,89])]

def zap():return mixin(sweep(1400,180,.22,"sq")*.4,sweep(900,90,.18,"saw")*.2,int(.05*SR))
def bwomp():return mixin(bf(sweep(110,82,.45,"saw"),500,"lowpass"),bf(sweep(82,62,.6,"saw"),500,"lowpass"),int(.3*SR))
def bang():return mixin(mixin(impact()*1.2,poof()),bf(noise(.1),[2000,6000],"bandpass")*env(int(.1*SR),.001,.03)*2)
def impact():return mixin(sweep(120,40,.6)*1.2,bf(noise(.15),800,"lowpass")*env(int(.15*SR),.001,.05))
def poof():o=bf(noise(.7),1600,"lowpass")*env(int(.7*SR),.004,.18)*1.4;return mixin(o,sweep(160,50,.5)*.5)
def beep(f=1760):return sine(f,.1)*env(int(.1*SR),.002,.05)
jingle(.35,.4)
for name,t,*who in TL["events"]:
    if name=="zippy_pass":place(fx,roll(.8)*1.4,t,.9);place(fx,whoosh(.6)*1.4,t+.1,1.0)
    elif name=="one_eye":place(fx,glock(note(84),.4),t+.2,.35)
    elif name=="sunny_hop":[place(fx,boing(360+k*90),t+.45+k*.42,.5) for k in range(3)]
    elif name=="kickflip":place(fx,zap(),t,.6);place(fx,impact(),t+.9,.9)
    elif name=="machine":[place(fx,beep(1400+(k%3)*300),t+.2+k*.18,.5) for k in range(int((T("bang")-t-.2)/.18))]
    elif name=="bang":place(fx,bang(),t,1.0);place(fx,boing(300),t+.15,.6)
    elif name=="grumpy":place(fx,bwomp()*.6,t+.2,.5)
    elif name=="sign":place(fx,boing(520),t,.5);place(fx,sparkle(),t+.3,.35)
    elif name=="tiptoe":[place(fx,plip(500+k*80),t+k*.4,.35) for k in range(5)]
    elif name=="creep":place(fx,roll(1.9)*.35,t,.6)
    elif name=="crash":place(fx,poof()*.6,t+.25,.6);place(fx,bf(noise(.5),[2000,6000],"bandpass")*env(int(.5*SR),.01,.2),t+.25,.6)
    elif name=="sneeze":place(fx,whoosh(.5)*1.3,t,.8);place(fx,sweep(600,1800,.6)*.3,t+.1,.6)
    elif name=="cloud_in":place(fx,shimmer(),t,.5)
    elif name=="climb":place(fx,boing(260),t+.6,.4);place(fx,boing(320),t+2.0,.4)
    elif name=="settle":place(fx,bf(noise(.4),600,"lowpass")*env(int(.4*SR),.02,.15),t+.4,.8)
    elif name=="drift":place(fx,whoosh(2.5)*.7,t,.5)
    elif name=="panic":[place(fx,boing(420),t+k*.3,.4) for k in range(4)]
    elif name=="ride":place(fx,roll(1.3)*1.2,t,.8)
    elif name=="skid":place(fx,skid()*1.3,t,.9);[place(fx,plip(900+k*150),t+.3+k*.12,.3) for k in range(6)]
    elif name=="magic":place(fx,shimmer(),t,.7)
    elif name=="return":place(fx,whoosh(2.5)*.5,t,.4)
    elif name=="eyes_close":place(fx,glock(note(77),.8),t,.3)
    elif name=="looks":[place(fx,plip(800+k*200),t+.2+k*.35,.4) for k in range(3)]
    elif name=="nox_smirk":place(fx,bwomp(),t+.2,.8)
    elif name=="white":place(fx,sparkle(),t,.5)
    elif name=="logo_end":jingle(t,.5);place(fx,boing(380),t+.6,.4)
MUS=.5*10**(3/20)*10**(-5/20);FXG=.6*10**(-6/20)*10**(-3/20)
mix=voice+mus*MUS+fx*FXG
mix=mix[:int(END*SR)];peak=np.max(np.abs(mix));mix=mix/peak*.89
os.makedirs("audio",exist_ok=True)
sf.write("audio/mix_raw.wav",mix,SR);sf.write("audio/stem_voice.wav",voice[:len(mix)],SR)
sf.write("audio/stem_music.wav",(mus*MUS)[:len(mix)],SR);sf.write("audio/stem_sfx.wav",(fx*FXG)[:len(mix)],SR)
print("len",len(mix)/SR,"peak",peak)
