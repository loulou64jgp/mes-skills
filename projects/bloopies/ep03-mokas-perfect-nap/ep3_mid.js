// ---------- EPISODE 3: Moka's Perfect Nap ----------
const T=n=>E1(n);
EXPR.grumpy={eye:"open",es:.32,by:-.12,br:-.32,mouth:"flat"};
EXPR.asleep={eye:"happy",by:-.12,br:.12,mouth:"smile"};
chars[1].rig.cfg.def="asleep";
// props
const bigCloudMat=toon(0xffffff);
function puffCloud(parts,s=1){const g=G();parts.forEach(([x,y,z,r])=>mesh(S(r,28,20),bigCloudMat,{parent:g,pos:[x*s,y*s,z*s],outline:.035}).scale.y=.85);return g;}
const CL=puffCloud([[0,0,0,1.25],[1.15,-.2,.1,.95],[-1.15,-.18,0,.95],[.5,.25,-.7,.9],[-.55,.2,.7,.85],[0,-.35,.9,.8],[1.9,-.35,0,.6],[-1.9,-.35,.1,.6]]);scene.add(CL);
CL.position.set(7,6.8,-9);CL.visible=false;
const ST=puffCloud([[0,0,0,.45],[.4,-.05,0,.32],[-.38,-.06,.05,.3]]);scene.add(ST);ST.position.set(-4.15,.9,-.45);ST.scale.setScalar(.001);
const HOV=new V(-3.2,2.55,-1.05),FAR=new V(-9.8,5.4,-7.8),RET=new V(-2.0,3.3,.35);
// Nimi's gadget
const gad=G();gad.position.set(-5.25,0,2.05);world.add(gad);gad.visible=false;
mesh(new THREE.BoxGeometry(.42,.34,.34),0x39d6c8,{parent:gad,pos:[0,.17,0],outline:.05});
mesh(new THREE.CylinderGeometry(.1,.1,.03,18),0xffffff,{parent:gad,pos:[0,.22,.18],rot:[Math.PI/2,0,0],outline:.1});
const gLight=mesh(S(.05,10,8),basic(0xff3b4a),{outline:0,parent:gad,pos:[.13,.3,.17]});
mesh(new THREE.CylinderGeometry(.015,.015,.3,6),0x35263f,{outline:0,parent:gad,pos:[-.12,.48,0]});
mesh(S(.05,10,8),0xffd84a,{parent:gad,pos:[-.12,.64,0]});
const prop=G();prop.position.set(.08,.4,0);gad.add(prop);for(let k=0;k<3;k++){const b=mesh(new THREE.BoxGeometry(.3,.02,.06),0xff8fb0,{parent:prop,outline:0});b.rotation.y=k*Math.PI/3;}
const spring=mesh(new THREE.CylinderGeometry(.06,.06,.25,10),0xb8b8c8,{parent:gad,pos:[0,.3,0]});spring.visible=false;
// quiet sign + ring
const qs=G();qs.position.set(-3.45,0,1.15);qs.rotation.y=.2;world.add(qs);qs.scale.setScalar(.001);
mesh(new THREE.CylinderGeometry(.03,.035,.75,8),0xb07a55,{parent:qs,pos:[0,.37,0]});
{const cv=document.createElement("canvas");cv.width=256;cv.height=180;const x=cv.getContext("2d");x.fillStyle="#f3eeff";x.fillRect(0,0,256,180);
 x.lineWidth=14;x.strokeStyle="#9a80ff";x.strokeRect(7,7,242,166);x.fillStyle="#6a4fc4";x.font="900 44px system-ui,sans-serif";x.textAlign="center";
 x.fillText("QUIET",128,68);x.fillText("ZONE",128,114);x.font="700 34px system-ui,sans-serif";x.fillStyle="#ff7fb0";x.fillText("shhh...",128,158);
 const tx=new THREE.CanvasTexture(cv);const bd=mesh(new THREE.BoxGeometry(.56,.4,.04),0xf3eeff,{parent:qs,pos:[0,.86,0],rot:[0,0,-.06],outline:.04});
 const fc=new THREE.Mesh(new THREE.PlaneGeometry(.54,.38),new THREE.MeshBasicMaterial({map:tx}));fc.position.z=.022;bd.add(fc);}
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.75,.04,8,64),basic(0xb7a2f5));ring.rotation.x=Math.PI/2;ring.position.set(-4.7,.03,.25);world.add(ring);ring.scale.setScalar(.001);
// flower pile
const pile=G();pile.position.set(-5.45,0,3.15);world.add(pile);const pileHeads=[];
for(let k=0;k<16;k++){const a=k*2.4,r=.12+(k%5)*.08;const h=mesh(S(.1,10,8),flowerCols[k%5],{parent:pile,pos:[Math.cos(a)*r,.12+(k%3)*.1,Math.sin(a)*r],outline:.12});pileHeads.push(h);}
const zFlowers=[];for(let k=0;k<3;k++){const h=mesh(S(.09,10,8),flowerCols[(k+1)%5],{parent:chars[2].g,pos:[-.3+k*.3,.78+(k%2)*.05,.1],outline:.12});h.visible=false;zFlowers.push(h);}
// Moka parts
const mk=chars[1];const mokaEars=mk.g.children.filter(m=>m.geometry&&m.geometry.type==="SphereGeometry"&&Math.abs(m.geometry.parameters.radius-.21)<1e-6);
const CAP0={p:mk.ex.cap.position.clone(),r:mk.ex.cap.rotation.clone()};
// ---------- tweens ----------
const tweens=[];
function tw(c,to,t0,d,o={}){tweens.push(Object.assign({c,to:to.clone(),t0,d,from:null,arc:0,ry:null,rz:null},o));}
function tele(c,p,ry){c.root.position.copy(p);if(ry!=null)c.root.rotation.y=ry;}
function runTweens(t){for(const w of tweens){const q=(t-w.t0)/w.d;if(q<0||w.done)continue;
  if(!w.from){w.from=w.c.root.position.clone();w.ry0=w.c.root.rotation.y;w.rz0=w.c.root.rotation.z;}
  const k=Math.min(1,q),e=w.lin?k:ss(k);w.c.root.position.lerpVectors(w.from,w.to,e);w.c.root.position.y+=Math.sin(k*Math.PI)*w.arc;
  if(w.ry!=null)w.c.root.rotation.y=w.ry0+(w.ry-w.ry0)*e;if(w.rz!=null)w.c.root.rotation.z=w.rz0+(w.rz-w.rz0)*e;if(q>=1)w.done=true;}}
// ---------- state ----------
let noxHidden=false,flashT=-9,kickT=-9,prevT=-1/FPS,beam=null,onCloud=false,pillowFollow=false;
const pops=[];function pop(i,t,amp,d=.6){pops.push({i,t,amp,d});}
const F_={polaroid:1e9,outro:1e9,white:T("white")};
function talkingNow(i,t){const key=CAST[i].key;for(const l of TL.lines){if(l.who!==key)continue;if(t>=l.start&&t<l.end){const f=Math.floor((t-l.start)*FPS);return(l.env[f]||0)>.16;}}return false;}
const LINE_EXPR={silence:[[1,"asleep"]],coming:[[2,"happy"]],adventure:[[0,"happy"]],woohoo:[[2,"happy"]],test:[[3,"happy"]],awake:[[1,"grumpy"]],
 calc:[[3,"neutral"]],quiet:[[3,"neutral"]],finally:[[4,"smug"]],oops:[[2,"surprised"]],achoo:[[0,"surprised"]],almost:[[4,"smug"]],
 impossible:[[3,"worried"]],sigh:[[1,"grumpy"]],perfect:[[1,"asleep"]],leaving:[[3,"surprised"]],ohno:[[0,"worried"]],gethim:[[2,"happy"]],
 comingback:[[0,"worried"]],tomorrow:[[1,"sleepy"]]};
// windows
const ZZZ=[[0,T("zippy_pass")-.2],[T("settle")+.6,T("drift")+3],[T("eyes_close"),TL.end]];let zzzNext=.3;
const ONE=[[T("one_eye"),T("sunny_hop")],[T("one_eye2"),T("eyes_close")]];
const cloudPos=t=>{const tin=T("cloud_in"),td=T("drift"),tr=T("return");if(t<tin)return CL.position.clone();
  let p=new V(7,6.8,-9).lerp(HOV,ss((t-tin)/2.2));if(t>td)p=HOV.clone().lerp(FAR,ss((t-td)/4.2));if(t>tr)p=FAR.clone().lerp(RET,ss((t-tr)/2.8));
  p.y+=Math.sin(t*1.1)*.08;return p;};
function fire(n,t,who){
  switch(n){
   case"zippy_pass":tele(chars[2],new V(-1.5,.28,2.25),-Math.PI/2-.35);tw(chars[2],new V(-7.0,.28,.15),t,.6,{lin:true});break;
   case"sunny_hop":tele(chars[0],new V(-2.65,0,1.95),-.5);tw(chars[0],new V(-3.62,0,1.25),t,.35,{arc:.6});[0,1,2].forEach(k=>pop(0,t+.45+k*.42,.45,.35));break;
   case"kickflip":tele(chars[2],new V(-2.5,.28,2.7),-1.2);tw(chars[2],new V(-3.25,.28,2.3),t,.9,{arc:.3});act(2,"flip");kickT=t+.9;break;
   case"machine":tele(chars[3],new V(-5.85,0,1.55),.55);gad.visible=true;setExpr(chars[3].rig,"happy",2,t);break;
   case"bang":kickT=t;FX.puff(chars[3],-1.1);spring.visible=true;spring.userData.t=t;setExpr(chars[3].rig,"surprised",1.6,t);pop(3,t,.5);pop(1,t,.25);break;
   case"sign":tw(chars[3],new V(-3.85,0,1.45),t-.6,.45,{arc:.5,ry:.4});qs.userData.t=t;ring.userData.t=t+.3;break;
   case"tiptoe":[0,3].forEach((i,k)=>{for(let j=0;j<3;j++)pop(i,t+j*.4+k*.2,.12,.3);});break;
   case"creep":tele(chars[2],new V(-2.6,.28,3.75),-Math.PI/2-.15);tw(chars[2],new V(-5.0,.28,3.3),t,1.9,{lin:true});break;
   case"crash":tw(chars[2],new V(-5.55,0,3.2),t,.3,{arc:.35,rz:.55});zFlowers.forEach(f=>f.visible=true);
     pileHeads.forEach(h=>{const w=new V();h.getWorldPosition(w);const m=new THREE.Mesh(oct,basic(h.material.color.getHex(),{transparent:true}));m.position.copy(w);const a=Math.random()*6.28;spawn(m,{v:new V(Math.cos(a)*1.4,1.5+Math.random()*1.5,Math.sin(a)*1.4),life:.8});h.visible=Math.random()<.3;});break;
   case"sneeze":{const c=chars[0];tw(c,new V(-3.35,0,1.55),t,.25);for(let k=0;k<26;k++){const m=new THREE.Mesh(oct,basic(k%2?0xffffff:0xfff3a6,{transparent:true}));const p=new V();c.anchor.getWorldPosition(p);p.y-=.7;m.position.copy(p);
       spawn(m,{v:new V(-2.5-Math.random()*2,Math.random()*1.5,-1.2-Math.random()),life:.7,g:0});}mk.ex.cap.userData.t=t;pop(1,t+.1,.35);setExpr(mk.rig,"grumpy",2,t);break;}
   case"sigh_puff":for(let k=0;k<8;k++){const m=new THREE.Mesh(S(.12,10,8),basic(0xffffff,{transparent:true,opacity:.7}));const p=new V();mk.anchor.getWorldPosition(p);p.y-=1.2;m.position.copy(p).add(new V(.2,0,.6));
       spawn(m,{v:new V(.4+Math.random()*.4,.2,.9),life:.9,g:0,grow:1.2,spin:false,delay:k*.04});}break;
   case"cloud_in":CL.visible=true;break;
   case"climb":ST.userData.t=t-.5;tw(mk,new V(-4.15,1.33,-.45),t,.75,{arc:.6,ry:.2});tw(mk,HOV.clone().add(new V(0,.95,0)),t+1.25,.85,{arc:.7,ry:.15});
     pillowFollow=t+.2;break;
   case"settle":onCloud=true;break;
   case"drift":break;
   case"panic":[0].forEach(i=>{for(let j=0;j<4;j++)pop(i,t+j*.3,.35,.28);});tele(chars[0],new V(-2.2,0,2.4),-.2);tele(chars[3],new V(-1.0,0,2.6),.1);break;
   case"ride":tele(chars[2],new V(-1.6,.28,3.05),-Math.PI/2+.1);chars[2].root.rotation.z=0;zFlowers.forEach(f=>f.visible=false);if(chars[2].plat.p.parent!==chars[2].root)chars[2].root.attach(chars[2].plat.p);
     tw(chars[2],new V(-8.35,.28,3.7),t,1.3,{});break;
   case"skid":kickT=t;setExpr(chars[2].rig,"surprised",2.5,t);break;
   case"smirk":setExpr(chars[4].rig,"smug",3,t);break;
   case"magic":break;
   case"return":break;
   case"looks":tele(chars[2],new V(.25,.28,2.45),0);tele(chars[0],new V(-2.25,0,2.45),.1);tele(chars[3],new V(-1.0,0,2.65),0);[0,2,3].forEach(i=>setExpr(chars[i].rig,"neutral",3,t));break;
   case"nox_smirk":setExpr(chars[4].rig,"smug",4,t);break;
   case"talk":act(KEY[who],"talk");break;
  }}
function step(t,dt){
  FT=t;
  for(const e of TL.events)if(e[1]>prevT&&e[1]<=t)fire(e[0],e[1],e[2]);
  for(const l of TL.lines)if(l.start>prevT&&l.start<=t){(LINE_EXPR[l.tag]||[]).forEach(([k,ex])=>setExpr(chars[k].rig,ex,(l.end-l.start)+.7,t));
    chars.forEach((c,k)=>{c.lookAt=(l.who!=="n"&&KEY[l.who]!==k)?KEY[l.who]:null;});}
  if(TL.lines.every(l=>!(t>=l.start-.05&&t<l.end+.3&&l.who!=="n")))chars.forEach(c=>c.lookAt=null);
  prevT=t;
  runTweens(t);
  // cloud, stairs, Moka riding
  CL.position.copy(cloudPos(t));
  {const tm=T("magic");const g=t>tm&&t<T("return")+2.8?Math.min(1,(t-tm)/.4)*(1-Math.max(0,(t-T("return")-2.2)/.6)):0;bigCloudMat.emissive=bigCloudMat.emissive||new THREE.Color();bigCloudMat.emissive.setRGB(.25*g,.12*g,.45*g);}
  if(ST.userData.t!=null){const q=(t-ST.userData.t)/.4,q2=(t-T("settle")-.4)/.5;ST.scale.setScalar(Math.max(.001,Math.min(1,q)*(q2>0?Math.max(0,1-q2):1)));}
  if(onCloud)mk.root.position.copy(CL.position).add(new V(0,.95,0));
  if(pillowFollow&&t>=pillowFollow){const pp=mk.plat.p;if(pp.parent!==scene)scene.attach(pp);const tgt=mk.root.position.clone();pp.position.lerp(tgt,Math.min(1,dt*6));}
  // props
  {const q=(t-(qs.userData.t||1e9))/.35;qs.scale.setScalar(q>0?Math.max(.001,easeBk(q)):.001);const r=(t-(ring.userData.t||1e9))/.5;ring.scale.setScalar(r>0?Math.max(.001,Math.min(1,r)):.001);}
  prop.rotation.y=gad.visible?t*25:0;gLight.visible=Math.floor(t*6)%2===0;
  {const u=t-(spring.userData.t||1e9);if(u>0){spring.position.y=.3+Math.min(1.2,u*5-u*u*6);spring.rotation.z=u*8;if(u>1.2)spring.visible=false;}
   const b=t-T("bang");gad.position.x=-5.25+(b>-1.2&&b<0?Math.sin(t*70)*.03:0);}
  {const u=t-(mk.ex.cap.userData.t||1e9);const cap=mk.ex.cap;if(u>0&&u<1.1){cap.position.set(CAP0.p.x,CAP0.p.y+Math.sin(u/1.1*Math.PI)*1.1,CAP0.p.z);cap.rotation.set(CAP0.r.x,CAP0.r.y,CAP0.r.z+u*7);}
   else if(u>=1.1){cap.position.copy(CAP0.p);cap.rotation.set(CAP0.r.x,CAP0.r.y,CAP0.r.z+.5);}}
  applySky(0);
  clouds.forEach(c=>{const u=c.userData,a=u.a+t*u.speed;c.position.set(Math.cos(a)*u.r,u.y+Math.sin(t*.3+u.a)*.2,Math.sin(a)*u.r*(u.y>0?.6:1)-(u.y>0?14:2));});
  flies.forEach(f=>f.scale.setScalar(.001));
  petals.forEach(p=>{const u=p.userData;const y=((u.y-u.s*t)%7+7)%7;p.position.set(u.x+Math.sin(t*.6+u.p)*.7,y,u.z+Math.cos(t*.5+u.p)*.4);p.rotation.set(t*1.3+u.p,t+u.p,0);});
  trees.forEach((tr,i)=>tr.rotation.z=Math.sin(t*.8+i)*.015);
  sunnyLight.position.copy(chars[0].root.position).add(tmp.set(0,1.4,.6));
  if(t>=zzzNext){if(ZZZ.some(([a,b])=>t>=a&&t<b))FX.zzz(mk);zzzNext=t+1.7;}
  const cp=camAt(t);camera.position.copy(cp.p);
  //__CHARLOOP__
  pops.forEach(p=>{const q=(t-p.t)/p.d;if(q>0&&q<1)chars[p.i].bob.position.y+=Math.sin(q*Math.PI)*p.amp;});
  // one eye open
  if(ONE.some(([a,b])=>t>=a&&t<b)){const e=mk.rig.eyes;e[0].happy.visible=true;e[0].open.visible=false;e[1].happy.visible=false;e[1].open.visible=true;
    const k=ONE.find(([a,b])=>t>=a&&t<b)[0];e[1].open.scale.y=Math.max(.06,.55*ss((t-k)/.35));}
  // grumpy ears droop
  {const g=t>=T("grumpy")&&t<T("grumpy")+2.6?1:0;mokaEars.forEach((m,k)=>{m.rotation.z=(m.position.x<0?1:-1)*.5*g;m.position.y=.55-.08*g;});}
  // sneeze build-up: Sunny swells on "ah... ah..."
  {const s=T("sneeze"),u=t-(s-.75);if(u>0&&u<.75){chars[0].bob.scale.multiplyScalar(1+.18*(u/.75));chars[0].g.rotation.x-=.25*(u/.75);}
   else if(t>=s&&t<s+.3){chars[0].g.rotation.x+=.35*(1-(t-s)/.3);}}
  // Zippy skid at the edge: windmill
  {const s=T("skid");if(t>=s&&t<s+1.6){const k=1-(t-s)/1.6;chars[2].g.rotation.z=Math.sin((t-s)*16)*.35*k;chars[2].root.position.x=-8.35+Math.sin((t-s)*9)*.05*k;}}
  // looks: the three turn to each other
  {const l=T("looks");if(t>=l&&t<l+1.5){const k=Math.sin((t-l)*3.2);chars[0].g.rotation.y=.7*k;chars[3].g.rotation.y=-.7*k;chars[2].g.rotation.y=-.7*k;}}
  // Nox magic beam to the cloud
  {const q=(t-T("magic"))/1.6;if(q>0&&q<1){if(!beam){beam=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1,10,1,true),new THREE.MeshBasicMaterial({color:0xeadcff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
       const halo=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,1,12,1,true),new THREE.MeshBasicMaterial({color:0x9b6bff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));beam.add(halo);scene.add(beam);}
     const a=new V();chars[4].anchor.getWorldPosition(a);a.y-=.6;const b=CL.position.clone();const len=a.distanceTo(b)*Math.min(1,q/.3);const dir=b.clone().sub(a).normalize();
     beam.position.copy(a).addScaledVector(dir,len/2);beam.scale.set(1,len,1);beam.quaternion.setFromUnitVectors(UPV,dir);beam.material.opacity=.95*(q<.8?1:1-(q-.8)/.2);beam.visible=true;
     if(Math.floor(t*20)!==Math.floor((t-dt)*20)){const m=new THREE.Mesh(oct,basic(0xd7b6ff,{transparent:true}));m.position.copy(a).addScaledVector(dir,len*Math.random());spawn(m,{v:new V((Math.random()-.5),Math.random(),(Math.random()-.5)),life:.5,g:0});}}
   else if(beam)beam.visible=false;}
  for(let k=fx.length-1;k>=0;k--){const m=fx[k],u=m.userData;
    if(u.delay>0){u.delay-=dt;m.visible=false;continue;}m.visible=true;
    u.v.y+=u.g*dt;m.position.addScaledVector(u.v,dt);if(u.spin){m.rotation.x+=dt*6;m.rotation.y+=dt*8;}
    u.life-=dt;m.material.opacity=Math.max(u.life/u.max,0)*.95;if(u.grow)m.scale.multiplyScalar(1+u.grow*dt);
    if(u.life<=0){scene.remove(m);m.material.dispose();fx.splice(k,1);}}
  const kf=Math.floor((t-kickT)*FPS);let kx=0,kr=0;if(kf>=0&&kf<7){const a=(1-kf/7)*(kf%2?-1:1);kx=a*.07;kr=a*1.3*Math.PI/180;}
  placeCam(cp,kx,kr);grade.uniforms.flash.value=0;
}
function easeBk(x){const c=1.9;x=Math.max(0,Math.min(1,x));return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);}
function placeCam(cp,kx=0,kr=0){camera.position.copy(cp.p).add(new V(kx,-kx*.6,0));camera.fov=cp.fov;camera.updateProjectionMatrix();camera.up.set(0,1,0);camera.lookAt(cp.l);camera.rotateZ(cp.roll+kr);camera.updateMatrixWorld();}
// ---------- camera ----------
function CUat(center,ry,dist,h,side,dy){const a=ry+side;return{p:center.clone().add(new V(Math.sin(a)*dist,h,Math.cos(a)*dist)),l:center.clone().add(new V(0,dy,0))};}
const live=i=>chars[i].root.position.clone().add(new V(0,chars[i].base,0));
const SH=TL.shots.map((s,k)=>({id:s[0],s:s[1],g:s[2]/FPS,e:k+1<TL.shots.length?TL.shots[k+1][1]:TL.end}));
const C1=C0[1],F1=HRY[1];
function shotPose(id,t,s0,s1){const u=Math.max(0,Math.min(1,(t-s0)/Math.max(.01,s1-s0)));let a,b,fov=40,roll=0;
  switch(id){
   case"hook":a=CUat(C1,F1,3.0,.25,.1,.05);b=CUat(C1,F1,2.6,.22,.1,.05);break;
   case"oneeye":a=CUat(C1,F1,2.4,.15,.05,.1);b=CUat(C1,F1,2.2,.15,.05,.1);break;
   case"sunny":{const m=new V(-4.15,1.2,.75);a={p:m.clone().add(new V(Math.sin(.3)*5.3,.5,Math.cos(.3)*5.3)),l:m};b={p:m.clone().add(new V(Math.sin(.3)*4.9,.5,Math.cos(.3)*4.9)),l:m.clone()};break;}
   case"kick":a={p:new V(-2.3,.85,7.4),l:new V(-3.4,1.35,1.8)};b={p:new V(-2.4,.85,7.0),l:new V(-3.4,1.35,1.8)};break;
   case"machine":a={p:new V(-3.7,1.4,6.6),l:new V(-5.2,.9,1.4)};b={p:new V(-3.8,1.35,6.2),l:new V(-5.2,.9,1.4)};break;
   case"awake":a=CUat(C1,F1,3.1,.25,0,.1);b=CUat(C1,F1,2.8,.25,0,.1);roll=-3;break;
   case"calc":{const c=live(3);a=CUat(c,.6,3.6,.3,0,.15);b=CUat(c,.6,3.3,.3,0,.15);break;}
   case"quiet":a={p:new V(-2.2,3.1,8.2),l:new V(-4.0,.9,.9)};b={p:new V(-2.3,3.0,7.7),l:new V(-4.0,.9,.9)};break;
   case"tiptoe":a={p:new V(-2.0,2.5,7.8),l:new V(-4.0,1.0,1.1)};b={p:new V(-2.1,2.45,7.4),l:new V(-4.0,1.0,1.1)};break;
   case"finally":a=CUat(C0[4],0,3.7,.3,.15,.15);b=CUat(C0[4],0,3.4,.3,.15,.15);break;
   case"creep":{const c=live(2);a={p:c.clone().add(new V(.8,.05,3.6)),l:c.clone().add(new V(-.4,0,0))};b=a;break;}
   case"achoo":{const m=new V(-3.95,1.15,.95);a={p:m.clone().add(new V(Math.sin(.45)*5.0,.45,Math.cos(.45)*5.0)),l:m};b={p:m.clone().add(new V(Math.sin(.45)*4.6,.45,Math.cos(.45)*4.6)),l:m.clone()};break;}
   case"almost":a=CUat(C0[4],0,3.0,.2,-.15,.2);b=CUat(C0[4],0,2.8,.2,-.15,.2);break;
   case"impossible":{const c=live(3);a=CUat(c,.5,3.4,.3,0,.15);b=CUat(c,.5,3.1,.3,0,.15);roll=3;break;}
   case"sigh":a=CUat(C1,F1,3.2,.3,.05,.1);b=CUat(C1,F1,2.9,.3,.05,.1);break;
   case"notice":a={p:new V(-5.5,1.3,2.4),l:new V(-3.2,3.0,-1.0)};b={p:new V(-5.4,1.25,2.2),l:new V(-3.2,2.8,-1.0)};break;
   case"climb":a={p:new V(-.9,2.7,6.9),l:new V(-3.9,2.0,-.45)};b={p:new V(-1.1,2.75,6.5),l:new V(-3.8,2.3,-.6)};break;
   case"perfect":{const c=live(1);a={p:c.clone().add(new V(1.3,.35,3.3)),l:c.clone()};b={p:c.clone().add(new V(1.15,.3,3.0)),l:c.clone()};break;}
   case"drift":{const c=CL.position.clone();a={p:new V(.5,3.4,12.5),l:c};b={p:new V(.2,3.5,12.0),l:c.clone()};break;}
   case"leaving":{const c=live(3);a=CUat(c,.2,3.4,.2,0,.2);b=CUat(c,.2,3.1,.2,0,.2);break;}
   case"ohno":{const c=live(0);a=CUat(c,.1,3.8,.3,0,.3);b=CUat(c,.1,3.5,.3,0,.3);break;}
   case"ride":{const c=live(2);a={p:c.clone().add(new V(1.8,.45,4.0)),l:c.clone().add(new V(-1.2,0,0))};b=a;break;}
   case"smirk":a=CUat(C0[4],0,3.0,.2,.1,.2);b=CUat(C0[4],0,2.7,.2,.1,.2);break;
   case"magic":{const c=CL.position.clone(),n=C0[4].clone();a={p:n.clone().add(new V(4.6,1.3,3.6)),l:n.clone().lerp(c,.5)};b={p:n.clone().add(new V(4.2,1.2,3.3)),l:a.l.clone()};break;}
   case"comingback":{const s=live(0),c=CL.position.clone();a={p:s.clone().add(new V(1.6,.2,3.6)),l:s.clone().lerp(c,.45)};b={p:s.clone().add(new V(1.5,.2,3.3)),l:a.l.clone()};break;}
   case"tomorrow":{const c=live(1);a={p:c.clone().add(new V(.8,-.25,3.1)),l:c.clone()};b={p:c.clone().add(new V(.7,-.25,2.8)),l:c.clone()};break;}
   case"looks":a={p:new V(-1.0,1.9,8.8),l:new V(-1.0,1.05,2.5)};b={p:new V(-1.0,1.85,8.3),l:new V(-1.0,1.05,2.5)};break;
   case"noxend":a=CUat(C0[4],0,3.2,.2,0,.2);b=CUat(C0[4],0,2.9,.2,0,.2);break;
   default:a={p:new V(0,3,15),l:new V(0,1.5,0)};b=a;
  }
  return{p:a.p.clone().lerp(b.p,u),l:a.l.clone().lerp(b.l,u),fov,roll:roll*Math.PI/180};}
function camAt(t){let k=SH.findIndex(s=>t>=s.s&&t<s.e);if(k<0)k=SH.length-1;const s=SH[k];let P=shotPose(s.id,t,s.s,s.e);
  if(s.g>0&&k>0&&t<s.s+s.g){const pr=SH[k-1],Q=shotPose(pr.id,s.s,pr.s,pr.e),q=ss((t-s.s)/s.g);
    P={p:Q.p.lerp(P.p,q),l:Q.l.lerp(P.l,q),fov:Q.fov+(P.fov-Q.fov)*q,roll:Q.roll+(P.roll-Q.roll)*q};}
  return P;}
let simT=-1;
window.FILM={frames:TL.frames,
  frame(n,render=true){if(simT<0){step(0,1/FPS);simT=0;}while(simT<n){simT++;step(simT/FPS,1/FPS);}
    if(render){composer.render();return canvas.toDataURL("image/png");}return null;}};
