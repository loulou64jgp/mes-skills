import json,re,numpy as np,soundfile as sf
T=json.load(open("timeline_bloopies.json"));L=json.load(open("lines.json"))
for l in T["lines"]:
    if l["tag"] not in("meet","coolest","brand"):continue
    i=l["i"];a,sr=sf.read(f"voice/l_{i:02d}.wav");d=l["end"]-l["start"];text=L[i][1];l["text"]=text
    ws=re.findall(r"[A-Za-z']+",text);wt=[len(w)+1.5 for w in ws];tot=sum(wt);c=l["start"];words=[]
    for w,x in zip(ws,wt):e=c+d*x/tot;words.append({"w":w,"s":round(c,3),"e":round(e,3)});c=e
    l["words"]=words;hop=sr//30;env=[float(np.sqrt(np.mean(a[k*hop:(k+1)*hop]**2))) for k in range(int(np.ceil(len(a)/hop)))];m=max(env) or 1;l["env"]=[round(v/m,3) for v in env]
json.dump(T,open("timeline.json","w"));print([(l['tag'],l['text'],l['start']) for l in T['lines'] if l['tag'] in('meet','coolest','brand')])
