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

# ---------------- MUSIC: sections ----------------
bpm=120;B=60/bpm;BAR=4*B
MAJ=[(53,[65,69,72]),(50,[62,65,69]),(46,[62,65,70]),(48,[64,67,72])]
MIN=[(50,[62,65,69]),(46,[58,62,65]),(43,[55,58,62]),(45,[57,61,64])]
MOTIF=[2,1,0,1, 2,2,None,1, 0,1,2,None, 1,0,None,None]
def bed(t0,t1,prog,drums=True,melody=True,bass_oct=0):
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
            for s in range(2):place(o,pluck(note(ch[(b*2+s)%3]+12)),tb+s*B/2,.16)
            if melody and MOTIF[(bar%4)*4+b] is not None:place(o,glock(note(ch[MOTIF[(bar%4)*4+b]]+12)),tb,.12)
        t+=BAR;bar+=1
    m=np.zeros(N);i0,i1=int(t0*SR),int(min(t1,END)*SR);m[i0:i1]=1
    k=int(.08*SR);m=np.convolve(m,np.ones(k)/k,"same");return o*m
mus=np.zeros(N)
b0=e1("bounce");row=e1("row");freeze=e1("freeze");ap=e1("appear");grp=e1("group_hop")-.4;out=e1("outro");white=e1("white")
mus+=bed(b0,row,MAJ)
mus+=bed(row,freeze,MIN,drums=False,melody=False,bass_oct=-12)*.9
mus+=bed(ap+.6,grp,MIN,drums=True,melody=False,bass_oct=-12)
mus+=bed(grp,out,MAJ)
place(mus,pad([note(m) for m in(53,65,69,72,77)],END-out+.4),out,1.3)
for k,m in enumerate([72,77,81,84]):place(mus,glock(note(m),2.5),out+.2+k*.18,.15)
fade=np.ones(N);fe=int(END*SR);fade[fe-int(1.0*SR):fe]=np.linspace(1,0,int(1.0*SR));fade[fe:]=0;mus*=fade

# ---------------- VOICE ----------------
voice=np.zeros(N)
for l in TL["lines"]:
    a,sr=sf.read(f"voice/l_{l['i']:02d}.wav");a=a/np.max(np.abs(a))*(.8 if l["who"]=="n" else .7)
    if "cut" in l:n=int((l["cut"]-l["start"])*SR);a=a[:n].copy();a[-int(.03*SR):]*=np.linspace(1,0,int(.03*SR))
    place(voice,a,l["start"])
for k,who in enumerate(["sunny","moka","zippy","nimi"]):
    a,sr=sf.read(f"voice/scream_{who}.wav");place(voice,a/np.max(np.abs(a))*.5,e1("scream")+k*.03)
v=np.abs(voice);w=int(.05*SR);sm=np.convolve(v,np.ones(w)/w,"same")
gate=(sm>.01).astype(float);k=int(.35*SR);gate=np.convolve(gate,np.ones(k)/k,"same").clip(0,1)
mus*=1-gate*(1-10**(-11/20))

# ---------------- SFX ----------------
fx=np.zeros(N)
def whoosh(d=.6):x=noise(d);t=np.arange(len(x))/SR;e=np.sin(np.pi*t/d)**2;return bf(x*e,[400,3000],"bandpass")*.9
def sparkle():o=np.zeros(int(.8*SR));[place(o,glock(note(m),.5),k*.06,.5) for k,m in enumerate([88,91,95,100])];return o
def poof():o=bf(noise(.7),1600,"lowpass")*env(int(.7*SR),.004,.18)*1.4;return mixin(o,sweep(160,50,.5)*.5)
def boing(f0=300):t=np.arange(int(.35*SR))/SR;f=f0+260*np.sin(t*40)*np.exp(-t*6)+300*t;return np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.003,.15)
def bigboing():t=np.arange(int(.9*SR))/SR;f=120+380*np.abs(np.sin(t*18))*np.exp(-t*3)+60;return np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.003,.4)*1.2
def wobble(d=1.4):t=np.arange(int(d*SR))/SR;f=90+40*np.sin(2*np.pi*7*t);return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2.2)*.8
def impact():return mixin(sweep(120,40,.6)*1.2,bf(noise(.15),800,"lowpass")*env(int(.15*SR),.001,.05))
def tick():return bf(noise(.03),[1500,4000],"bandpass")*env(int(.03*SR),.001,.008)*2
def click():return bf(noise(.02),3000,"highpass")*env(int(.02*SR),.001,.005)*2
def ding():return mixin(glock(note(91),.9),glock(note(96),.8)*.6,int(.06*SR))
def plink(m):return glock(note(m),.4)
def crash():o=np.zeros(int(.9*SR));[place(o,bf(noise(.12),[300,1800],"bandpass")*env(int(.12*SR),.001,.05)*1.5,k*.11) for k in range(4)];return o
def splash():return bf(noise(.4),[500,2500],"bandpass")*env(int(.4*SR),.005,.1)*1.3
def slurp():t=np.arange(int(.5*SR))/SR;return bf(noise(.5),[600,1800],"bandpass")*(.5+.5*np.sin(2*np.pi*14*t))*np.exp(-t*3)*1.2
def yawn():return sweep(380,160,1.1)*.5
def zap():return mixin(sweep(1400,180,.22,"sq")*.4,sweep(900,90,.18,"saw")*.2,int(.05*SR))
def roll(d=1.2):x=bf(noise(d),[150,900],"bandpass");t=np.arange(len(x))/SR;return x*(.6+.4*np.sin(2*np.pi*22*t))*np.minimum(1,(d-t)/.3)*.8
def skid():return bf(noise(.35),[1200,3500],"bandpass")*env(int(.35*SR),.01,.2)*1.4
def drumroll(d):x=np.zeros(int(d*SR));[place(x,bf(noise(.04),[200,2000],"bandpass")*env(int(.04*SR),.001,.015),k*.035,.5+.5*k*.035/d) for k in range(int(d/.035))];return x
def cymbal():return bf(noise(1.6),5000,"highpass")*env(int(1.6*SR),.001,.5)*1.2
def wind(d=2.2):x=bf(noise(d),[300,900],"bandpass");t=np.arange(len(x))/SR;return x*np.sin(np.pi*t/d)*.5
def scratch():t=np.arange(int(.35*SR))/SR;f=600*np.sin(2*np.pi*3*t)+700;return bf(noise(.35),[200,3000],"bandpass")*.3+np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.002,.12)*.6
def boom():return mixin(sweep(90,30,1.2)*1.4,bf(noise(.5),400,"lowpass")*env(int(.5*SR),.002,.2)*1.2)
def beep(f=1760):return sine(f,.12)*env(int(.12*SR),.002,.06)
def shutter():o=np.zeros(int(.3*SR));place(o,bf(noise(.02),3000,"highpass"),0,1);place(o,bf(noise(.04),[1000,2500],"bandpass")*env(int(.04*SR),.001,.01),.09,1.2);return o
def paper():return bf(noise(.5),[2000,6000],"bandpass")*np.sin(np.pi*np.arange(int(.5*SR))/(.5*SR))*.7
def jingle(t0,g=.5):[place(fx,glock(note(m),1.2),t0+k*.14,g) for k,m in enumerate([77,81,84,89])]
def sting(who,t0):
    if who=="sunny":[place(fx,pluck(note(m),.8),t0+k*.025,.7) for k,m in enumerate([65,69,72,77,81])]
    if who=="moka":place(fx,bf(sweep(110,82,.5,"saw"),500,"lowpass"),t0,.9);place(fx,bf(sweep(82,65,.6,"saw"),500,"lowpass"),t0+.32,.9)
    if who=="zippy":place(fx,bf(sweep(330,1320,.4,"sq"),3000,"lowpass"),t0,.5);place(fx,sparkle(),t0+.25,.3)
    if who=="nimi":[place(fx,plink(m),t0+k*.07,.7) for k,m in enumerate([72,76,79,84,88])]
    if who=="nox":place(fx,bf(sweep(55,52,1.6,"saw"),300,"lowpass")*1.2,t0,.8);place(fx,glock(note(93),1.5),t0+.2,.4)
press=e1("press")
for k in range(int(press/.5)+1):place(fx,tick(),.15+k*.5,.5)
place(fx,click(),press,1);place(fx,bigboing(),press+.05,1.0)
for name,t,*who in TL["events"]:
    if name=="bounce":[place(fx,boing(260-k*40),t+k*.32,.6) for k in range(3)];place(fx,wobble(),t,.6)
    elif name=="title":jingle(t,.45)
    elif name=="whip":place(fx,whoosh(.4),t-.1,.6)
    elif name.startswith("card_"):sting(name[5:],t)
    elif name=="hop":place(fx,boing(320+E["hop"].index(t)*120),t,.6)
    elif name=="spin":place(fx,boing(),t,.8);place(fx,sparkle(),t+.25,.5);place(fx,bf(noise(.25),[1000,5000],"bandpass")*env(int(.25*SR),.002,.08),t+.1,.6)
    elif name=="confetti_land":[place(fx,tick()*.6,t+k*.07,.4) for k in range(9)]
    elif name=="sunny_to_moka":place(fx,boing(420),t,.5)
    elif name=="yawn":place(fx,yawn(),t,.7)
    elif name=="gust":place(fx,whoosh(.7),t,.8)
    elif name=="sip":place(fx,slurp(),t,.7)
    elif name=="zippy_run":place(fx,roll(1.2),t,.7);place(fx,skid(),t+1.0,.7);place(fx,zap(),t+.3,.4)
    elif name=="flip":place(fx,zap(),t,.6);place(fx,whoosh(.5),t+.1,.5)
    elif name=="land":place(fx,impact(),t-.02,1.0);place(fx,wobble(1.1),t,.6)
    elif name=="cocoa":place(fx,splash(),t+.05,.7)
    elif name=="books":place(fx,crash(),t+.1,.8)
    elif name=="click":place(fx,click(),t,.9)
    elif name=="bulb":place(fx,ding(),t,.6)
    elif name=="restack":place(fx,plink([79,84,88][E["restack"].index(t)]),t+.3,.8)
    elif name=="check":place(fx,bf(noise(.25),[2000,5000],"bandpass")*.5,t,.6)
    elif name=="zippy_next":place(fx,boing(500),t,.5)
    elif name=="drumroll":place(fx,drumroll(e1("cymbal")-t),t,.7)
    elif name=="cymbal":place(fx,cymbal(),t,.6);place(fx,wind(),t+.2,.6)
    elif name=="react":place(fx,boing(600+E["react"].index(t)*90)*.6,t,.4)
    elif name=="freeze":place(fx,scratch(),t,.7)
    elif name=="appear":place(fx,boom(),t,.9);place(fx,poof(),t,.7)
    elif name=="card_nox":pass
    elif name=="group_hop":[place(fx,boing(300+k*60),t+d,.5) for k,d in enumerate((0,.12,.25,.35,.05))]
    elif name=="beep":place(fx,beep(1760 if E["beep"].index(t)<2 else 2350),t,.6)
    elif name=="vanish":place(fx,poof()*.4,t,.5)
    elif name=="shutter":place(fx,shutter(),t,1.0)
    elif name=="flash":place(fx,sparkle(),t,.5)
    elif name=="polaroid":place(fx,paper(),t,.8)
    elif name=="outro":place(fx,whoosh(1.6),t+.6,.7)
    elif name=="white":place(fx,sparkle(),t,.5)
    elif name=="logo_end":jingle(t,.5);place(fx,boing(380),t+.6,.4)

MUS=.5*10**(3/20)*10**(-5/20);FXG=.6*10**(-6/20)*10**(-3/20)
mix=voice+mus*MUS+fx*FXG
mix=mix[:int(END*SR)];peak=np.max(np.abs(mix));mix=mix/peak*.89
os.makedirs("audio",exist_ok=True)
sf.write("audio/mix_raw.wav",mix,SR);sf.write("audio/stem_voice.wav",voice[:len(mix)],SR)
sf.write("audio/stem_music.wav",(mus*MUS)[:len(mix)],SR);sf.write("audio/stem_sfx.wav",(fx*FXG)[:len(mix)],SR)
print("len",len(mix)/SR,"peak",peak)
