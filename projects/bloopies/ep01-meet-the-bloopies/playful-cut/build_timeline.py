import json,re,numpy as np,soundfile as sf
FPS=30;lines=json.load(open("lines.json"));L=[];t=0.0;TAG={}
for i,(who,text,gap,tag) in enumerate(lines):
    a,sr=sf.read(f"voice/l_{i:02d}.wav");d=len(a)/sr;t+=gap
    ws=re.findall(r"[A-Za-z']+",text);wt=[len(w)+1.5 for w in ws];tot=sum(wt);c=t;words=[]
    for w,x in zip(ws,wt):e=c+d*x/tot;words.append({"w":w,"s":round(c,3),"e":round(e,3)});c=e
    hop=sr//FPS;env=[float(np.sqrt(np.mean(a[k*hop:(k+1)*hop]**2))) for k in range(int(np.ceil(len(a)/hop)))]
    m=max(env) or 1;L.append({"i":i,"tag":tag,"who":who,"text":text,"start":round(t,3),"end":round(t+d,3),"words":words,"env":[round(v/m,3) for v in env]});TAG[tag]=i;t+=d
S=lambda g:L[TAG[g]]["start"];E=lambda g:L[TAG[g]]["end"]
def W(g,w,k=0):return [x for x in L[TAG[g]]["words"] if x["w"].lower()==w][k]["s"]
press=E("dont")-.3;L[TAG["dont"]]["cut"]=round(press+.06,3);L[TAG["dont"]]["end"]=round(press+.06,3)
flip=E("silly")+.25;land=flip+.95;r1=E("nox?")+.3;appear=E("behind")+.75;flash=E("cheese2")+.3
END=round(E("brand")+1.4,3)
ev=[["slide",0.0],["press",press],["bounce",press+.15],["title",S("meet")-.35],["whip",S("hi")-.35],
 ["card_sunny",S("hi")-.15],["hop",W("hi","hi",0)],["hop",W("hi","hi",1)],["hop",W("hi","hiii")],["spin",W("amazing","amazing")-.1],
 ["confetti_land",E("amazing")+.45],["card_moka",E("amazing")+.85],["sunny_to_moka",S("wake")-.4],
 ["yawn",E("tomorrow")+.1],["gust",E("tomorrow")+.65],["sip",E("tomorrow")+1.35],
 ["zippy_run",S("silly")-1.6],["card_zippy",S("silly")-1.2],["flip",flip],["land",land],["cocoa",land+.08],["books",land+.8],
 ["nimi_shot",land+1.5],["card_nimi",land+1.7],["click",land+1.95],["bulb",W("solutions","three")-.05],
 ["restack",S("one")],["restack",S("two")],["restack",S("three")],["check",E("three")+.15],["nimi_back",E("three")+.3],
 ["zippy_next",S("again1")-.4],["row",S("coolest")-.35],["drumroll",E("coolest")-.1],["cymbal",E("coolest")+.9],
 ["react",r1],["react",r1+.6],["react",r1+1.2],["react",r1+1.8],["freeze",E("behind")+.05],["appear",appear],["scream",appear+.05],
 ["nox_cu",appear+1.35],["card_nox",appear+1.5],["group_hop",S("photo")+.05],["nimi_run",S("photo")+.9],["nimi_runback",S("threetwo")-.15],
 ["beep",S("threetwo")+.05],["beep",S("threetwo")+.55],["vanish",S("cheese")],["moka_lean",S("cheese2")-.35],["beep",E("cheese2")+.05],
 ["flash",flash],["shutter",flash-.03],["photobomb",flash],["polaroid",flash+.3],["outro",E("again2")+.35],["white",S("brand")-.35],["logo_end",S("brand")-.1],
 ["tagline",W("brand","five")]]
for l in L:
    if l["who"]!="n":ev.append(["talk",l["start"],l["who"]])
ev=[[e[0],round(e[1],3)]+e[2:] for e in ev]
shots=[["button",0,0],["bounce",press+.15,0],["sunny",S("hi")-.35,9],["moka",E("amazing")+.25,22],["zippyrun",S("silly")-1.6,0],
 ["cocoa",land+.08,0],["books",land+.8,0],["nimi",land+1.5,0],["nimi2",S("again1")-.4,0],["row",S("coolest")-.35,0],["rock",E("coolest")+.15,22],
 ["r_sunny",r1,0],["r_zippy",r1+.6,0],["r_nimi",r1+1.2,0],["r_moka",r1+1.8,0],["scare",appear,0],["noxcu",appear+1.35,0],
 ["group",S("photo")-.1,0],["photo",flash+.2,0],["outro",E("again2")+.35,0]]
shots=[[s[0],round(s[1],3),s[2]] for s in shots]
json.dump({"fps":FPS,"end":END,"frames":int(np.ceil(END*FPS)),"lines":L,"events":sorted(ev,key=lambda e:e[1]),"shots":shots,"tags":TAG},open("timeline.json","w"))
json.dump([w|{"line":l["i"]} for l in L for w in l["words"]],open("voice/words.json","w"))
print("END",END,"frames",int(np.ceil(END*FPS)))
for s in shots:print(s)
