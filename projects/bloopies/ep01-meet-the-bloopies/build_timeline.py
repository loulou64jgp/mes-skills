import json,re,numpy as np,soundfile as sf
FPS=30
lines=json.load(open("lines.json"))
L=[];t=0.0
for i,(who,text,gap) in enumerate(lines):
    a,sr=sf.read(f"voice/l_{i:02d}.wav");d=len(a)/sr;t+=gap
    ws=re.findall(r"[A-Za-z']+",text);wt=[len(w)+1.5 for w in ws];tot=sum(wt);c=t;words=[]
    for w,x in zip(ws,wt):e=c+d*x/tot;words.append({"w":w,"s":round(c,3),"e":round(e,3)});c=e
    hop=sr//FPS;env=[float(np.sqrt(np.mean(a[k*hop:(k+1)*hop]**2))) for k in range(int(np.ceil(len(a)/hop)))]
    m=max(env) or 1;env=[round(v/m,3) for v in env]
    L.append({"i":i,"who":who,"text":text,"start":round(t,3),"end":round(t+d,3),"words":words,"env":env});t+=d
END=round(t+2.7,3)
def W(i,w):return next(x for x in L[i]["words"] if x["w"].lower()==w)["s"]
S=lambda i:L[i]["start"];E=lambda i:L[i]["end"]
flip=W(8,"flips")-.15;appear=S(15)-.55;flash2=E(19)+.25
ev=[["flash",S(1),"all"],["spin",S(3)-.1,"sunny"],["yawn",E(4)+.15,"moka"],["flip",flip,"zippy"],["kick",flip+.86,"zippy"],
    ["bulb",W(11,"three")-.07,"nimi"],["hide",S(13),"nox"],["appear",appear,"nox"],["kick",appear+.05,"nox"],
    ["hop",S(17)+.05,"all"],["vanish",S(19)-.05,"nox"],["flash",flash2,"all"],["shutter",flash2-.03,"all"],["photobomb",flash2,"nox"],
    ["zzz",E(20)-.9,"moka"],["ascend",E(20)+.05,"all"],["white",END-1.0,"all"]]
for l in L:
    if l["who"]!="n":ev.append(["talk",l["start"],l["who"]])
shots=[["hook",0,0],["wide",S(1),0],["sunny",S(2),18],["ots",S(4),0],["moka",S(5),22],["zippy",S(8),0],["nimi",S(10),20],
       ["rock",S(13),24],["group",S(17),0],["outro",S(20)+.2,54]]
json.dump({"fps":FPS,"end":END,"frames":int(np.ceil(END*FPS)),"lines":L,"events":sorted(ev,key=lambda e:e[1]),"shots":shots},open("timeline.json","w"))
json.dump([w|{"line":l["i"]} for l in L for w in l["words"]],open("voice/words.json","w"),indent=0)
print("end",END,"frames",int(np.ceil(END*FPS)));[print(e) for e in sorted(ev,key=lambda e:e[1])];print(shots)
