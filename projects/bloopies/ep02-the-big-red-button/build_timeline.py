import json,re,numpy as np,soundfile as sf
FPS=30;lines=json.load(open("lines.json"));L=[];t=0.0;TAG={}
for i,(who,text,gap,tag) in enumerate(lines):
    a,sr=sf.read(f"voice/l_{i:02d}.wav");d=len(a)/sr;t+=gap
    ws=re.findall(r"[A-Za-z']+",text);wt=[len(w)+1.5 for w in ws];tot=sum(wt);c=t;words=[]
    for w,x in zip(ws,wt):e=c+d*x/tot;words.append({"w":w,"s":round(c,3),"e":round(e,3)});c=e
    hop=sr//FPS;env=[float(np.sqrt(np.mean(a[k*hop:(k+1)*hop]**2))) for k in range(int(np.ceil(len(a)/hop)))]
    m=max(env) or 1;L.append({"i":i,"tag":tag,"who":who,"text":text,"start":round(t,3),"end":round(t+d,3),"words":words,"env":[round(v/m,3) for v in env]});TAG[tag]=i;t+=d
S=lambda g:L[TAG[g]]["start"];E=lambda g:L[TAG[g]]["end"]
press=E("wasnt")+.12
push=E("push");magic=push+1.2;gpop=magic+1.0;stop=gpop+.75
END=round(E("brand")+2.1,3)
ev=[["roll_in",1.0],["eyes",2.6],["tiptoe",3.3],["nimi_in",3.75],["press",press],["rumble",press+.6],["machine",press+2.2],
 ["first_bubble",press+3.65],["second_bubble",press+4.15],["hundreds",press+4.8],["giant",press+6.0],
 ["sunny_jump",E("awesome")+.3],["zippy_trick",E("floating")+.3],["nimi_swat",E("floating")+1.95],["moka_bonk",E("disaster")+.4],
 ["nox_cu",E("dream")+.3],["ear_pop",S("warned")-.35],["montage",E("warned")+.3],["swat",S("sol1")+.35],["book",S("sol2")+.3],["bonk_nimi",S("sol3")+1.2],
 ["power",E("sol3")+.4],["group_bubble",E("sol3")+1.3],["freeze",E("again")+.1],["onit_reach",S("onit")],["push",S("push")+.2],
 ["magic",magic],["gpop",gpop],["press2",gpop+.55],["stop",stop],["calm",stop+1.6],["nod",E("solved")+.15],["blue",E("solved")+.75],["allno",E("thisone")+.25],
 ["press3",E("herewego")+.35],["white",E("herewego")+.55],["logo_end",S("brand")-.3],["tagline",S("brand")+.6]]
for l in L:
    if l["who"]!="n":ev.append(["talk",l["start"],l["who"]])
ev=[[e[0],round(e[1],3)]+e[2:] for e in ev]
shots=[["establish",0,0],["eyes",2.6,0],["approach",3.3,0],["press",press-.1,0],["rumble",press+.6,0],["machine",press+2.2,0],
 ["first",press+3.6,0],["hundreds",press+4.8,0],["giant",press+6.0,0],["sunny",E("awesome")+.25,0],["zippy",E("floating")+.25,0],
 ["nimi",E("floating")+1.9,0],["moka",E("disaster")+.35,0],["nox",E("dream")+.3,0],["montage",E("warned")+.3,0],["sol1",S("sol1")-.2,0],
 ["sol2",S("sol2")-.2,0],["sol3",S("sol3")-.2,0],["power",E("sol3")+.4,0],["again",S("again")-.3,18],["technically",S("technically")-.15,0],
 ["onit",S("onit")-.1,0],["push",S("push")-.15,0],["noxmagic",magic-.15,0],["gpop",gpop-.1,0],["stop",stop-.05,0],["calm",stop+1.6,0],
 ["blue",E("solved")+.7,0],["allno",E("thisone")+.2,0],["herewego",S("herewego")-.2,0],["press3",E("herewego")+.25,0]]
shots=[[s[0],round(s[1],3),s[2]] for s in shots]
json.dump({"fps":FPS,"end":END,"frames":int(np.ceil(END*FPS)),"lines":L,"events":sorted(ev,key=lambda e:e[1]),"shots":shots,"tags":TAG},open("timeline.json","w"))
json.dump([w|{"line":l["i"]} for l in L for w in l["words"]],open("voice/words.json","w"))
print("END",END,"frames",int(np.ceil(END*FPS)))
for s in shots:print(s[0],s[1],end=" | ")
