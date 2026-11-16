import json,re,numpy as np,soundfile as sf
FPS=30;lines=json.load(open("lines.json"));L=[];t=0.0;TAG={}
for i,(who,text,gap,tag) in enumerate(lines):
    a,sr=sf.read(f"voice/l_{i:02d}.wav");d=len(a)/sr;t+=gap
    ws=re.findall(r"[A-Za-z']+",text);wt=[len(w)+1.5 for w in ws];tot=sum(wt);c=t;words=[]
    for w,x in zip(ws,wt):e=c+d*x/tot;words.append({"w":w,"s":round(c,3),"e":round(e,3)});c=e
    hop=sr//FPS;env=[float(np.sqrt(np.mean(a[k*hop:(k+1)*hop]**2))) for k in range(int(np.ceil(len(a)/hop)))]
    m=max(env) or 1;L.append({"i":i,"tag":tag,"who":who,"text":text,"start":round(t,3),"end":round(t+d,3),"words":words,"env":[round(v/m,3) for v in env]});TAG[tag]=i;t+=d
S=lambda g:L[TAG[g]]["start"];E=lambda g:L[TAG[g]]["end"]
END=round(E("brand")+2.0,3)
P=S("perfect")
ev=[["zzz",.3],["zippy_pass",S("coming")-.15],["one_eye",E("coming")+.25],["sunny_hop",S("adventure")-.35],["kickflip",S("woohoo")-.05],
 ["machine",S("test")-.5],["bang",E("test")+.35],["grumpy",S("awake")-.1],["sign",S("quiet")+.2],["tiptoe",E("quiet")+.2],
 ["creep",S("oops")-2.1],["crash",S("oops")-.25],["sneeze",S("achoo")+.75],["sigh_puff",S("sigh")+.1],
 ["notice",E("sigh")+.6],["cloud_in",E("sigh")+.2],["climb",E("sigh")+2.0],["settle",P-.5],["zzz2",E("perfect")+.3],
 ["drift",E("perfect")+.6],["panic",S("ohno")],["ride",S("gethim")+.2],["skid",S("gethim")+1.5],["smirk",S("gethim")+2.6],
 ["magic",S("gethim")+3.1],["return",S("gethim")+3.4],["one_eye2",S("tomorrow")-.6],["eyes_close",E("tomorrow")+.35],
 ["looks",E("tomorrow")+.9],["nox_smirk",E("tomorrow")+2.35],["white",S("brand")-.45],["logo_end",S("brand")-.25],["tagline",S("brand")+.55]]
for l in L:
    if l["who"]!="n":ev.append(["talk",l["start"],l["who"]])
ev=[[e[0],round(e[1],3)]+e[2:] for e in ev]
shots=[["hook",0,0],["oneeye",E("coming")+.15,0],["sunny",S("adventure")-.4,0],["kick",S("woohoo")-.15,0],["machine",S("test")-.55,0],
 ["awake",S("awake")-.2,0],["calc",S("calc")-.15,0],["quiet",S("quiet")-.1,0],["tiptoe",E("quiet")+.15,0],["finally",S("finally")-.15,0],
 ["creep",S("oops")-2.15,0],["achoo",S("achoo")-.15,0],["almost",S("almost")-.15,0],["impossible",S("impossible")-.1,0],["sigh",S("sigh")-.1,0],
 ["notice",E("sigh")+.55,0],["climb",E("sigh")+2.0,0],["perfect",P-.6,0],["drift",E("perfect")+.5,0],["leaving",S("leaving")-.15,0],
 ["ohno",S("ohno")-.1,0],["ride",S("gethim")-.1,0],["smirk",S("gethim")+2.55,0],["magic",S("gethim")+3.05,0],["comingback",S("comingback")-.3,0],
 ["tomorrow",S("tomorrow")-.7,0],["looks",E("tomorrow")+.85,0],["noxend",E("tomorrow")+2.3,0]]
shots=[[s[0],round(s[1],3),s[2]] for s in shots]
json.dump({"fps":FPS,"end":END,"frames":int(np.ceil(END*FPS)),"lines":L,"events":sorted(ev,key=lambda e:e[1]),"shots":shots,"tags":TAG},open("timeline.json","w"))
json.dump([w|{"line":l["i"]} for l in L for w in l["words"]],open("voice/words.json","w"))
print("END",END,"frames",int(np.ceil(END*FPS)))
