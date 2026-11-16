// ================= FILM v2: "Meet the Bloopies" (playful cut) =================
const TL=window.__TL,FPS=TL.fps,W=1440,H=2560;
renderer.setPixelRatio(1);renderer.setSize(W,H,false);camera.fov=40;camera.aspect=W/H;camera.updateProjectionMatrix();
const reduce=false,hovered=-1,ptr={in:false};const tmp=new V(),tmp2=new V();
const KEY={sunny:0,moka:1,zippy:2,nimi:3,nox:4};
chars.forEach(c=>{c.dropAt=-10;c.landed=1;});
let composer=null,bloom=null,grade=null;
{const rt=new THREE.WebGLMultisampleRenderTarget(W,H,{format:THREE.RGBAFormat});rt.samples=4;
 composer=new THREE.EffectComposer(renderer,rt);composer.addPass(new THREE.RenderPass(scene,camera));
 bloom=new THREE.UnrealBloomPass(new THREE.Vector2(W,H),.3,.45,.95);composer.addPass(bloom);
 grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},vig:{value:.3},sat:{value:1.12},tint:{value:new THREE.Color(1,1,1)},flash:{value:0}},
  vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  fragmentShader:"uniform sampler2D tDiffuse;uniform float vig,sat,flash;uniform vec3 tint;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,sat)*tint;vec2 d=vUv-.5;c.rgb*=1.0-vig*dot(d,d)*2.4;c.rgb=mix(c.rgb,vec3(1.0),flash);gl_FragColor=c;}"});
 composer.addPass(grade);composer.setSize(W,H);}
const ss=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
const EVT=n=>TL.events.filter(e=>e[0]===n).map(e=>e[1]),E1=n=>EVT(n)[0];
const LN=tag=>TL.lines[TL.tags[tag]];
// ---------- world group (everything that bounces; Nox floats, so he stays outside) ----------
const world=G();scene.add(world);world.attach(island);
chars.forEach((c,i)=>{if(i!==2)world.attach(c.plat.p);if(i!==4)world.attach(c.root);});
const HOME=chars.map(c=>c.root.position.clone()),HRY=chars.map(c=>c.root.rotation.y);
const C0=chars.map((c,i)=>HOME[i].clone().add(new V(0,c.base,0)));
// ---------- props ----------
const btn=G();btn.position.set(3.3,0,3.4);world.add(btn);
mesh(new THREE.CylinderGeometry(.13,.17,.32,16),0xfff1e0,{parent:btn,pos:[0,.16,0]});
mesh(new THREE.CylinderGeometry(.32,.34,.1,24),0xece6f6,{parent:btn,pos:[0,.36,0]});
const btnCap=mesh(S(.27,28,20),0xff3b4a,{parent:btn,pos:[0,.42,0],scale:[1,.5,1]});
mesh(S(.07,10,8),basic(0xffffff),{outline:0,parent:btnCap,pos:[-.1,.17,.13]});
const tri=G();tri.position.set(1.15,0,8.2);tri.rotation.y=Math.PI+.12;world.add(tri);tri.visible=false;
for(let k=0;k<3;k++){const a=k/3*Math.PI*2;const leg=mesh(new THREE.CylinderGeometry(.025,.03,1.3,8),0x8a7aa8,{parent:tri,pos:[Math.cos(a)*.22,.62,Math.sin(a)*.22],rot:[Math.sin(a)*.3,0,-Math.cos(a)*.3],outline:.1});}
const camBody=mesh(new THREE.BoxGeometry(.46,.3,.28),0xff8fb0,{parent:tri,pos:[0,1.33,0]});
mesh(new THREE.CylinderGeometry(.1,.11,.14,20),0x35263f,{parent:tri,pos:[0,1.33,.2],rot:[Math.PI/2,0,0]});
mesh(new THREE.CircleGeometry(.07,16),basic(0x9fe7ff),{outline:0,parent:tri,pos:[0,1.33,.275]});
const recLight=mesh(S(.035,10,8),basic(0xff2a4a),{outline:0,parent:tri,pos:[.16,1.45,.14]});
// cocoa + mug
let cocoa=null;chars[1].g.traverse(o=>{if(o.isMesh&&o.material.color&&o.material.color.getHex()===0x7a4a32&&o.geometry.type==="CircleGeometry")cocoa=o;});
const COCOA_Y=cocoa.position.y;
// Nimi's books: split the stack into three movable books
const BK=[-.1,-.3,-.5].map(y=>{const g=G();g.position.y=y;return g;});
{const pp=chars[3].plat.p;[...pp.children].forEach(m=>{let k=BK.findIndex(g=>Math.abs(m.position.y-g.position.y)<.08);if(k<0)k=0;m.position.y-=BK[k].position.y;BK[k].add(m);});BK.forEach(g=>pp.add(g));}
const BKHOME=BK.map(g=>g.position.clone()),BKDOWN=[new V(-1.35,-.5,.95),new V(1.25,-.5,1.05),new V(.35,-.5,1.7)],BKROT=[.9,-.6,.35];
// ---------- tweens ----------
const tweens=[];
function tw(c,to,t0,d,o={}){tweens.push(Object.assign({c,to:to.clone(),t0,d,from:null,arc:0,ry:null,rz:null},o));}
function tele(c,p,ry){c.root.position.copy(p);if(ry!=null)c.root.rotation.y=ry;}
function runTweens(t){for(const w of tweens){const q=(t-w.t0)/w.d;if(q<0||w.done)continue;
  if(!w.from){w.from=w.c.root.position.clone();w.ry0=w.c.root.rotation.y;w.rz0=w.c.root.rotation.z;}
  const k=Math.min(1,q),e=w.lin?k:ss(k);w.c.root.position.lerpVectors(w.from,w.to,e);w.c.root.position.y+=Math.sin(k*Math.PI)*w.arc;
  if(w.ry!=null)w.c.root.rotation.y=w.ry0+(w.ry-w.ry0)*e;if(w.rz!=null)w.c.root.rotation.z=w.rz0+(w.rz-w.rz0)*e;if(q>=1)w.done=true;}}
// ---------- state ----------
let noxHidden=false,flashT=-9,kickT=-9,prevT=-1/FPS,bounces=[],mokaConf=[],lean=0,leanT=1e9,frozen=false,zzzDone=false;
const pops=[];function pop(i,t,amp,d=.6){pops.push({i,t,amp,d});}
const FORM={0:new V(-.8,0,2.3),2:new V(.8,0,2.3),1:new V(-1.55,0,1.0),3:new V(1.55,0,1.0),4:new V(0,chars[4].plat.h,-1.4)};
const NOXF=new V(0,.55,3.0),PB=new V(0,.15,4.3),SUNMOKA=new V(-3.62,0,1.25);
const ROCKCAM={p:new V(0,3.7,4.9),l:new V(0,2.45,-1.4)};
const T=n=>E1(n);
const F_={bounce:T("bounce"),spin:T("spin"),flip:T("flip"),land:T("land"),books:T("books"),appear:T("appear"),flash:T("flash"),outro:T("outro"),
  row:T("row"),group:T("group_hop"),white:T("white"),nimiShot:T("nimi_shot"),react:EVT("react"),restack:EVT("restack"),polaroid:T("polaroid")};
function flipH(t){const q=(t-F_.flip)/.9;return q>=0&&q<=1?Math.sin(q*Math.PI)*1.0:0;}
function talkingNow(i,t){const key=CAST[i].key;for(const l of TL.lines){if(l.who!==key)continue;if(t>=l.start&&t<l.end){const f=Math.floor((t-l.start)*FPS);return(l.env[f]||0)>.16;}}return false;}
const LINE_EXPR={dont:[[3,"worried"],[2,"happy"]],meet:[[0,"happy"],[2,"happy"],[3,"happy"],[1,"sleepy"]],hi:[[0,"happy"]],amazing:[[0,"happy"]],
 wake:[[0,"happy"],[1,"sleepy"]],tomorrow:[[1,"sleepy"]],comfy:[[1,"sleepy"],[0,"happy"]],silly:[[2,"happy"]],solutions:[[3,"neutral"]],
 one:[[3,"happy"]],two:[[3,"happy"]],three:[[3,"happy"]],again1:[[2,"happy"]],no:[[3,"neutral"],[2,"surprised"]],coolest:[[0,"happy"]],
 "nox?":[[0,"worried"],[3,"worried"],[2,"surprised"]],behind:[[1,"sleepy"]],late:[[4,"smug"]],photo:[[2,"happy"]],threetwo:[[3,"neutral"]],
 cheese:[[0,"happy"]],cheese2:[[1,"sleepy"]],noxshout:[[0,"surprised"]],again2:[[2,"happy"]],brand:[[0,"happy"],[2,"happy"],[3,"happy"]]};
function fire(n,t,who){
  const c=who?chars[KEY[who]]:null;
  switch(n){
   case"slide":tele(chars[2],new V(6.6,.28,2.6),-Math.PI/2);tw(chars[2],new V(3.6,.28,2.62),t,.8,{ry:0});break;
   case"press":tw(chars[2],new V(3.6,.2,2.95),t,.12,{lin:true});tw(chars[2],new V(3.6,.28,2.62),t+.18,.25);break;
   case"bounce":tele(chars[2],HOME[2],HRY[2]);bounces.push({t,A:.9});[0,1,2,3].forEach((i,k)=>pop(i,t+k*.06,1.1));break;
   case"whip":btn.visible=false;break;
   case"hop":{const k=Math.max(0,EVT("hop").indexOf(t));const f=new V(Math.sin(HRY[0]),0,Math.cos(HRY[0]));
     tw(chars[0],HOME[0].clone().setY(0).addScaledVector(f,.42*(k+1)),t-.05,.3,{arc:.55});break;}
   case"spin":act(0,"spin");break;
   case"confetti_land":{const g=chars[1].g,cols=[0xffcf3d,0xff8fab,0x8be0c8,0xab95ff,0x6fd3ff];
     for(let k=0;k<46;k++){const th=Math.random()*1.25,ph=Math.random()*Math.PI*2;if(Math.sin(th)*Math.sin(ph)<-.6)continue;
       const n=new V(Math.sin(th)*Math.sin(ph),Math.cos(th),Math.sin(th)*Math.cos(ph)).normalize();
       const m=new THREE.Mesh(new THREE.BoxGeometry(.09,.02,.06),basic(cols[k%5]));const tgt=n.clone().multiplyScalar(.78);m.position.copy(tgt).add(new V(0,1.2,0));
       m.quaternion.setFromUnitVectors(UPV,n);m.rotateY(Math.random()*3);g.add(m);mokaConf.push({m,tgt,t0:t+Math.random()*.55});}
     break;}
   case"sunny_to_moka":tele(chars[0],new V(-2.85,0,1.6),-.6);tw(chars[0],SUNMOKA,t,.35,{arc:.6});break;
   case"yawn":act(1,"yawn");break;
   case"gust":{chars[1].g.updateMatrixWorld(true);mokaConf.forEach(o=>{const p=new V();o.m.getWorldPosition(p);chars[1].g.remove(o.m);o.m.position.copy(p);o.m.material.transparent=true;
       spawn(o.m,{v:new V(2.2+Math.random()*2,.3+Math.random()*1.4,.4+Math.random()*.6),life:.9+Math.random()*.4,g:-2,spin:true});});mokaConf=[];
     setExpr(chars[0].rig,"happy",2,t);act(0,"talk");break;}
   case"zippy_run":tele(chars[0],HOME[0],HRY[0]);tele(chars[2],new V(8.3,.28,1.4),-Math.PI/2);tw(chars[2],HOME[2],t,1.25,{ry:HRY[2]-Math.PI*2});break;
   case"flip":act(2,"flip");break;
   case"land":bounces.push({t,A:.5});kickT=t;pop(0,t,.5);pop(1,t,.45);break;
   case"books":tw(chars[3],new V(3.95,0,1.3),t+.05,.5,{arc:.5,rz:.55});setExpr(chars[3].rig,"surprised",1.2,t);break;
   case"click":tw(chars[3],new V(3.95,0,1.3),t,.15,{rz:.22});break;
   case"bulb":act(3,"bulb");break;
   case"restack":FX.sparks&&0;break;
   case"nimi_back":tw(chars[3],HOME[3],t,.4,{arc:.8,rz:0});break;
   case"zippy_next":world.attach(chars[2].plat.p);tele(chars[2],new V(3.05,0,1.7),.35);tw(chars[2],new V(3.4,0,1.35),t,.3,{arc:.45});break;
   case"row":tele(chars[2],HOME[2],HRY[2]);chars[2].root.attach(chars[2].plat.p);tele(chars[3],HOME[3],HRY[3]);chars[3].root.rotation.z=0;noxHidden=true;break;
   case"freeze":[0,2,3].forEach(i=>setExpr(chars[i].rig,"surprised",2.4,t));break;
   case"appear":{const c4=chars[4];tele(c4,NOXF,0);noxHidden=false;FX.puff(c4,-.6);setExpr(c4.rig,"smug",9,t);kickT=t;
     [0,1,3].forEach((i,k)=>pop(i,t+.05+k*.03,1.2,.55));world.attach(chars[2].plat.p);
     tw(chars[2],new V(4.7,1.98,.25),t+.05,.7,{arc:1.4,ry:HRY[3]});break;}
   case"group_hop":chars.forEach((c,k)=>{tw(c,FORM[k],t+[.0,.25,.12,.35,.05][k],.75,{arc:1.3,ry:0});});tri.visible=true;break;
   case"nimi_run":tw(chars[3],new V(1.0,0,7.3),t,.45,{arc:.3,ry:Math.PI});break;
   case"nimi_runback":tw(chars[3],FORM[3],t,.6,{arc:.35,ry:0});break;
   case"vanish":FX.puff(chars[4],-.6);noxHidden=true;break;
   case"moka_lean":leanT=t;break;
   case"flash":flashT=t;break;
   case"photobomb":{const c4=chars[4];tele(c4,PB,0);noxHidden=false;FX.puff(c4,-.6);setExpr(chars[0].rig,"happy",9,t);setExpr(chars[2].rig,"surprised",9,t);setExpr(chars[3].rig,"surprised",9,t);setExpr(c4.rig,"smug",9,t);break;}
   case"talk":act(KEY[who],"talk");break;
  }}
function step(t,dt){
  FT=t;
  for(const e of TL.events)if(e[1]>prevT&&e[1]<=t)fire(e[0],e[1],e[2]);
  for(const l of TL.lines)if(l.start>prevT&&l.start<=t){(LINE_EXPR[l.tag]||[]).forEach(([k,ex])=>setExpr(chars[k].rig,ex,(l.end-l.start)+.7,t));
    chars.forEach((c,k)=>{c.lookAt=(l.who!=="n"&&KEY[l.who]!==k)?KEY[l.who]:null;});}
  if(TL.lines.every(l=>!(t>=l.start-.05&&t<l.end+.3&&l.who!=="n")))chars.forEach(c=>c.lookAt=null);
  if(t>=F_.row&&t<F_.react[0])[0,1,2,3].forEach(i=>chars[i].lookAt=4);
  if(t>=F_.react[0]&&t<F_.appear)[0,1,2,3].forEach(i=>chars[i].lookAt=null);
  if(t<F_.bounce)chars[2].lookAt=null;
  prevT=t;
  const cp=camAt(t);
  if(frozen||(t>=F_.flash+.12&&t<F_.outro)){frozen=t<F_.outro;
    if(frozen){placeCam(cp,0);const ff=(t-flashT)*FPS;grade.uniforms.flash.value=ff>=0&&ff<10?Math.pow(1-ff/10,1.6):0;return;}}
  runTweens(t);
  // world jelly bounce
  let wy=0,sq=0;for(const b of bounces){const u=t-b.t;if(u<0)continue;const e=b.A*Math.exp(-u*3.2);wy+=e*Math.sin(u*Math.PI*2*2.2)*.9;sq+=e*Math.cos(u*Math.PI*2*2.2);}
  world.position.y=wy;world.scale.set(1+.035*sq,1-.07*sq,1+.035*sq);
  // button
  {const q=t-E1("press");btnCap.position.y=q>0&&q<.35?.36:.42;}
  // cocoa jump
  {const q=(t-E1("cocoa"))/.55;cocoa.position.y=COCOA_Y+(q>0&&q<1?Math.sin(q*Math.PI)*.5:0);
    if(q>0&&!cocoa.userData.sp){cocoa.userData.sp=1;const p=new V();cocoa.getWorldPosition(p);for(let k=0;k<10;k++){const m=new THREE.Mesh(oct,basic(0x7a4a32,{transparent:true}));m.position.copy(p);const a=Math.random()*6.28;spawn(m,{v:new V(Math.cos(a)*1.2,2+Math.random()*1.5,Math.sin(a)*1.2),life:.7});}}}
  // books
  {const R=F_.restack,order=[2,1,0];BK.forEach((g,k)=>{const tb=F_.books+k*.08,tr=R[order.indexOf(k)];
     const q1=(t-tb)/.5,q2=(t-tr)/.35;let p=BKHOME[k].clone(),ry=0,rz=0;
     if(q1>0){const a=Math.min(1,q1);p.lerpVectors(BKHOME[k],BKDOWN[k],ss(a));p.y+=Math.sin(a*Math.PI)*.8;rz=a<1?a*Math.PI*2:0;ry=BKROT[k]*ss(a);}
     if(q2>0){const a=Math.min(1,q2);p.lerpVectors(BKDOWN[k],BKHOME[k],ss(a));p.y+=Math.sin(a*Math.PI)*1.0;ry=BKROT[k]*(1-ss(a));rz=a<1?-a*Math.PI*2:0;
       if(!g.userData.fx&&a>.9){g.userData.fx=1;const w=new V();g.getWorldPosition(w);for(let j=0;j<8;j++){const m=new THREE.Mesh(oct,basic(j%2?0xfff27a:0xffffff,{transparent:true}));m.position.copy(w);const an=Math.random()*6.28;spawn(m,{v:new V(Math.cos(an)*1.6,1+Math.random()*1.2,Math.sin(an)*1.6),life:.5,g:0});}}}
     g.position.copy(p);g.rotation.set(0,ry,rz);});}
  // confetti settling on Moka
  mokaConf.forEach(o=>{const q=Math.max(0,Math.min(1,(t-o.t0)/.35));o.m.visible=t>=o.t0;o.m.position.lerpVectors(o.tgt.clone().add(new V(0,1.2,0)),o.tgt,ss(q));});
  tri.visible=t>=F_.group;recLight.visible=Math.floor(t*3)%2===0;
  const night=t>F_.outro?.45*ss((t-F_.outro)/3):0;applySky(night);
  clouds.forEach(c=>{const u=c.userData,a=u.a+t*u.speed;c.position.set(Math.cos(a)*u.r,u.y+Math.sin(t*.3+u.a)*.2,Math.sin(a)*u.r*(u.y>0?.6:1)-(u.y>0?14:2));});
  flies.forEach(f=>{const u=f.userData;f.position.set(u.x+Math.sin(t*.5+u.p)*.8,u.y+Math.sin(t*.9+u.p*2)*.4,u.z+Math.cos(t*.4+u.p)*.8);f.scale.setScalar(Math.max(.001,night*(.6+.5*Math.sin(t*3+u.p))));});
  petals.forEach(p=>{const u=p.userData;const y=((u.y-u.s*t)%7+7)%7;p.position.set(u.x+Math.sin(t*.6+u.p)*.7,y,u.z+Math.cos(t*.5+u.p)*.4);p.rotation.set(t*1.3+u.p,t+u.p,0);p.scale.setScalar(Math.max(.001,1-night));});
  trees.forEach((tr,i)=>tr.rotation.z=Math.sin(t*.8+i)*.015);
  chars[4].plat.crys.forEach((m,i)=>{const s=1+.25*Math.sin(t*2+i);m.material.color.setRGB(.55+.35*night*s,.4+.1*night,1);});
  sunnyLight.position.copy(chars[0].root.position).add(tmp.set(0,1.4,.6));
  camera.position.copy(cp.p);
  //__CHARLOOP__
  // additive character beats
  pops.forEach(p=>{const q=(t-p.t)/p.d;if(q>0&&q<1)chars[p.i].bob.position.y+=Math.sin(q*Math.PI)*p.amp;});
  {const fh=flipH(t);chars[2].bob.position.y+=fh;}
  const R=F_.react;
  if(t>=R[0]&&t<R[1])chars[0].g.rotation.y=Math.sin((t-R[0])*14)*.9;
  {const b=chars[2].plat.board;if(t>=R[1]&&t<R[2]){b.rotation.z=-1.35;b.position.set(.75,.35,.35);chars[2].g.rotation.x=.25;}else{b.rotation.z=0;b.position.x=0;b.position.z=0;}}
  if(t>=R[2]&&t<R[3]){chars[3].ex.board.rotation.set(-1.0,.35,0);chars[3].ex.board.position.set(-.38,-.22,.72);chars[3].g.rotation.x=.2;}
  else chars[3].ex.board.position.set(-.44,-.36,.55);
  if(t>=leanT){const k=ss((t-leanT)/.5);chars[1].g.rotation.z=-.35*k;}
  if(t>=R[3]&&!zzzDone){zzzDone=true;FX.zzz(chars[1]);}
  if(noxHidden)chars[4].bob.scale.setScalar(.0001);
  for(let k=fx.length-1;k>=0;k--){const m=fx[k],u=m.userData;
    if(u.delay>0){u.delay-=dt;m.visible=false;continue;}m.visible=true;
    u.v.y+=u.g*dt;m.position.addScaledVector(u.v,dt);if(u.spin){m.rotation.x+=dt*6;m.rotation.y+=dt*8;}
    u.life-=dt;m.material.opacity=Math.max(u.life/u.max,0)*.95;if(u.grow)m.scale.multiplyScalar(1+u.grow*dt);
    if(u.life<=0){scene.remove(m);m.material.dispose();fx.splice(k,1);}}
  const kf=Math.floor((t-kickT)*FPS);let kx=0,kr=0;if(kf>=0&&kf<7){const a=(1-kf/7)*(kf%2?-1:1);kx=a*.08;kr=a*1.5*Math.PI/180;}
  placeCam(cp,kx,kr);
  const ff=(t-flashT)*FPS;grade.uniforms.flash.value=ff>=0&&ff<10?Math.pow(1-ff/10,1.6):0;
}
function placeCam(cp,kx=0,kr=0){camera.position.copy(cp.p).add(new V(kx,-kx*.6,0));camera.fov=cp.fov;camera.updateProjectionMatrix();camera.up.set(0,1,0);camera.lookAt(cp.l);camera.rotateZ(cp.roll+kr);camera.updateMatrixWorld();}
// ---------- camera ----------
function CUat(center,ry,dist,h,side,dy){const a=ry+side;return{p:center.clone().add(new V(Math.sin(a)*dist,h,Math.cos(a)*dist)),l:center.clone().add(new V(0,dy,0))};}
const SH=TL.shots.map((s,k)=>({id:s[0],s:s[1],g:s[2]/FPS,e:k+1<TL.shots.length?TL.shots[k+1][1]:TL.end}));
let photoPose=null;
function shotPose(id,t,s0,s1){const u=Math.max(0,Math.min(1,(t-s0)/Math.max(.01,s1-s0)));let a,b,fov=40,roll=0;
  switch(id){
   case"button":a={p:new V(3.5,1.15,7.0),l:new V(3.45,.8,2.8)};b={p:new V(3.5,1.1,6.5),l:new V(3.45,.78,2.8)};break;
   case"bounce":a={p:new V(2,7.5,25),l:new V(0,.8,0)};b={p:new V(1,8.6,22),l:new V(0,.6,0)};break;
   case"sunny":{a=CUat(C0[0],HRY[0],5.5,.55,.1,.45);b=CUat(C0[0],HRY[0],6.1,.6,.1,.5);const q=(t-F_.spin)/.9;if(q>0&&q<1){a.l.y+=Math.sin(q*Math.PI)*.9;b.l.y+=Math.sin(q*Math.PI)*.9;}break;}
   case"moka":{const mid=new V(-4.22,1.25,.72);a={p:mid.clone().add(new V(Math.sin(.28)*6.6,.6,Math.cos(.28)*6.6)),l:mid.clone()};b={p:mid.clone().add(new V(Math.sin(.28)*6.0,.55,Math.cos(.28)*6.0)),l:mid.clone()};break;}
   case"zippyrun":{const zx=chars[2].root.position.x;a={p:new V(zx-.3,.95,7.7),l:new V(zx,1.0+flipH(t)*1.35+(t>F_.flip&&t<F_.flip+.9?Math.sin((t-F_.flip)/.9*Math.PI)*.9:0),1.4)};b={p:a.p.clone().add(new V(0,0,-.3)),l:a.l.clone()};break;}
   case"cocoa":{const m=new V();cocoa.parent.getWorldPosition(m);m.y+=.1;const f=HRY[1];a={p:m.clone().add(new V(Math.sin(f)*1.35,.3,Math.cos(f)*1.35)),l:m.clone().add(new V(0,.15,0))};b={p:a.p.clone().add(new V(0,0,-.1)),l:a.l.clone()};break;}
   case"books":a=CUat(C0[3],HRY[3],6.3,.35,-.15,-.3);b=CUat(C0[3],HRY[3],6.0,.35,-.15,-.3);break;
   case"nimi":{const c=new V(3.95,.8,1.3),f=HRY[3]-.15,w=ss((t-F_.restack[0]+.35)/.6);
     const A=CUat(c,f,3.3,.3,0,.05),B=CUat(new V(4.35,.95,.75),f,5.8,.5,0,.1);a={p:A.p.lerp(B.p,w),l:A.l.lerp(B.l,w)};b=a;roll=5*(1-w);break;}
   case"nimi2":{const l=new V(4.05,1.15,.75),f=HRY[3]-.3;a={p:l.clone().add(new V(Math.sin(f)*5.7,.45,Math.cos(f)*5.7)),l};b={p:l.clone().add(new V(Math.sin(f)*5.3,.45,Math.cos(f)*5.3)),l};break;}
   case"row":a={p:new V(6.9,1.95,7.5),l:new V(-1.2,1.25,.4)};b={p:new V(6.5,1.9,7.1),l:new V(-1.2,1.25,.4)};break;
   case"rock":a={p:ROCKCAM.p.clone(),l:ROCKCAM.l.clone()};b={p:ROCKCAM.p.clone().add(new V(0,-.1,-.5)),l:ROCKCAM.l.clone()};break;
   case"r_sunny":a=CUat(C0[0],HRY[0],4.4,.3,0,.2);b=CUat(C0[0],HRY[0],4.0,.3,0,.2);break;
   case"r_zippy":a=CUat(C0[2],HRY[2],4.8,.35,0,.35);b=CUat(C0[2],HRY[2],4.4,.35,0,.35);break;
   case"r_nimi":a=CUat(C0[3],HRY[3],4.2,.35,0,.2);b=CUat(C0[3],HRY[3],3.9,.35,0,.2);break;
   case"r_moka":a=CUat(C0[1],HRY[1],4.3,.35,0,.25);b=CUat(C0[1],HRY[1],3.6,.3,0,.25);break;
   case"scare":a={p:new V(0,2.9,13.4),l:new V(0,1.45,.9)};b={p:new V(0,2.8,12.7),l:new V(0,1.45,.9)};break;
   case"noxcu":a={p:new V(.3,2.15,6.5),l:new V(0,2.0,3.0)};b={p:new V(.25,2.1,6.0),l:new V(0,2.0,3.0)};roll=4;break;
   case"group":a={p:new V(0,3.0,15.2),l:new V(0,1.65,.8)};b={p:new V(0,2.85,14.2),l:new V(0,1.6,.8)};break;
   case"photo":{if(!photoPose){const g=SH.find(s=>s.id==="group");photoPose=shotPose("group",F_.flash,g.s,g.e);}return{p:photoPose.p.clone(),l:photoPose.l.clone(),fov:photoPose.fov,roll:0};}
   case"outro":{a={p:new V(3.2,5.2,24),l:new V(0,.4,0)};b={p:new V(3.8,5.8,26),l:new V(0,.3,0)};const ta=F_.outro+.7;
     if(t>ta){const k=ss((t-ta)/(F_.white-ta+.3));const up=new V(0,9*k,-4*k);a.p.add(up);b.p.add(up);const sky=new V(0,40,-30);a.l.lerp(sky,k*.9);b.l.lerp(sky,k*.9);}break;}
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

// ================= OVERLAY =================
const ov=document.createElement("canvas");ov.width=W;ov.height=H;const ox=ov.getContext("2d");
const BCOL={sunny:"#f2b200",moka:"#b88762",zippy:"#1fb4e8",nimi:"#9a80ff",nox:"#a58bff"};
const DISP="'Mochiy Pop One'",BODY="'MPR'";
const ROLE={sunny:"THE OPTIMIST",moka:"THE DREAMER",zippy:"THE TROUBLEMAKER",nimi:"THE LITTLE GENIUS",nox:"THE MYSTERIOUS ONE"};
function wrap(text,maxW){ox.font=`800 66px ${BODY}`;const ws=text.split(" ");const out=[];let cur="";
  for(const w of ws){const tr=cur?cur+" "+w:w;if(ox.measureText(tr).width>maxW&&cur){out.push(cur);cur=w;}else cur=tr;}out.push(cur);return out;}
function rr(x,y,w,h,r){ox.beginPath();ox.moveTo(x+r,y);ox.arcTo(x+w,y,x+w,y+h,r);ox.arcTo(x+w,y+h,x,y+h,r);ox.arcTo(x,y+h,x,y,r);ox.arcTo(x,y,x+w,y,r);ox.closePath();}
const easeBack=x=>{const c=1.9;x=Math.max(0,Math.min(1,x));return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const inPhoto=t=>t>=F_.polaroid-.1&&t<F_.outro;
function drawBubble(l,t){
  const who=l.who,i=KEY[who],col=BCOL[who],dark=who==="nox";
  const nx=TL.lines.find(m=>m.who!=="n"&&m.start>l.start);const tIn=l.start,tOut=Math.min(l.end+.5,nx?nx.start-.12:1e9);if(t<tIn||t>tOut+.2)return;
  const pin=easeBack((t-tIn)/.22),pout=t>tOut?1-Math.min(1,(t-tOut)/.15):1,sc=pin*pout;if(sc<=.01)return;
  const lines=wrap(l.text,980);ox.font=`800 66px ${BODY}`;
  const tw_=Math.max(...lines.map(s=>ox.measureText(s).width),260),bw=tw_+90,bh=lines.length*82+122;
  const shownN=l.words.filter(w=>t>=w.s-.04).length;
  const c=chars[i];c.anchor.getWorldPosition(tmp);tmp.project(camera);
  let ax=(tmp.x*.5+.5)*W,ay=(-tmp.y*.5+.5)*H;const onScreen=!inPhoto(t)&&tmp.z<1&&ax>40&&ax<W-40&&ay>0&&ay<H&&!(i===4&&noxHidden);
  let bx=Math.min(Math.max(ax-bw/2,70),W-bw-70),by=ay-bh-70,below=false;
  if(!onScreen){bx=(W-bw)/2;by=Math.round(H*(inPhoto(t)?.815:.76));below=null;}
  else if(by<480){by=Math.round(H*.76);below=true;}
  ox.save();const ox0=Math.min(Math.max(ax,bx+70),bx+bw-70),oy0=below?by:by+bh;
  ox.translate(below===null?W/2:ox0,below===null?by+bh:oy0);ox.scale(sc,sc);ox.translate(-(below===null?W/2:ox0),-(below===null?by+bh:oy0));ox.globalAlpha=Math.min(1,pout*1.4);
  const fill=dark?"#241a36":"#fffdfb",ink=dark?"#f1e8ff":"#35263f";
  ox.fillStyle=col;rr(bx,by+12,bw,bh,52);ox.fill();
  if(below!==null){const tx=Math.min(Math.max(ax,bx+80),bx+bw-80);ox.beginPath();
    if(!below){ox.moveTo(tx-34,by+bh-4);ox.lineTo(tx+34,by+bh-4);ox.lineTo(tx+Math.max(-60,Math.min(60,(ax-tx)*.5)),by+bh+58);}
    else{ox.moveTo(tx-34,by+4);ox.lineTo(tx+34,by+4);ox.lineTo(tx+Math.max(-60,Math.min(60,(ax-tx)*.5)),by-58);}
    ox.closePath();ox.fillStyle=fill;ox.strokeStyle=col;ox.lineWidth=10;ox.lineJoin="round";ox.fill();ox.stroke();}
  rr(bx,by,bw,bh,52);ox.fillStyle=fill;ox.fill();ox.lineWidth=10;ox.strokeStyle=col;ox.stroke();
  if(below!==null){const tx=Math.min(Math.max(ax,bx+80),bx+bw-80);ox.fillStyle=fill;ox.fillRect(tx-28,below?by+1:by+bh-12,56,12);}
  ox.fillStyle=col;ox.font=`400 36px ${DISP}`;ox.textBaseline="alphabetic";ox.textAlign="left";ox.fillText(CAST[i].name.toUpperCase(),bx+46,by+66);
  ox.font=`800 66px ${BODY}`;ox.fillStyle=ink;let k=0;
  lines.forEach((ln,j)=>{let x=bx+46;const y=by+138+j*82;for(const w of ln.split(" ")){const has=/[A-Za-z']/.test(w);if(has)k++;if(k>shownN&&has)break;ox.fillText(w,x,y);x+=ox.measureText(w+" ").width;}});
  ox.restore();}
const LOGO="BLOOPIES",LCOL=["#ffc93d","#ff9b3d","#ff5f86","#ff7fc0","#3fb6ff","#39d6c8","#9a7bff","#c873ff"];
function drawLogoAt(t,t0,cy,s,tOut){if(t<t0-.3)return;let out=1;if(tOut!=null){if(t>tOut+.2)return;if(t>tOut)out=1-(t-tOut)/.2;}
  ox.save();ox.textAlign="center";ox.textBaseline="middle";ox.lineJoin="round";ox.translate(W/2,cy);ox.scale(s*out,s*out);
  const the=easeBack((t-t0+.25)/.3);if(the>0){ox.save();ox.translate(0,-180);ox.scale(the,the);ox.font=`400 92px ${DISP}`;
    ox.lineWidth=34;ox.strokeStyle="#4a2a8a";ox.strokeText("THE",0,0);ox.lineWidth=14;ox.strokeStyle="#fff";ox.strokeText("THE",0,0);ox.fillStyle="#fff";ox.fillText("THE",0,0);ox.restore();}
  ox.font=`400 186px ${DISP}`;const ws=[...LOGO].map(ch=>ox.measureText(ch).width*.9),tot=ws.reduce((a,b)=>a+b,0);let x=-tot/2;
  [...LOGO].forEach((ch,k)=>{const p=easeBack((t-t0-k*.06)/.3);const cx=x+ws[k]/2;x+=ws[k];if(p<=0)return;
    ox.save();ox.translate(cx,Math.sin(t*2.4+k*.8)*8);ox.rotate(Math.sin(t*3+k)*.03+(k%2?.05:-.05));ox.scale(p,p);
    ox.lineWidth=44;ox.strokeStyle="#4a2a8a";ox.strokeText(ch,0,0);ox.lineWidth=20;ox.strokeStyle="#ffffff";ox.strokeText(ch,0,0);
    const g=ox.createLinearGradient(0,-80,0,80);g.addColorStop(0,"#ffffff");g.addColorStop(.28,LCOL[k]);g.addColorStop(1,LCOL[k]);ox.fillStyle=g;ox.fillText(ch,0,0);ox.restore();});
  ox.restore();}
function drawCard(t,t0,key){if(t<t0||t>t0+2.35)return;const p=easeBack((t-t0)/.3),out=t>t0+2.1?Math.max(0,1-(t-t0-2.1)/.25):1;const s=p*out;if(s<=0)return;
  const col=BCOL[key];ox.save();ox.translate(W/2,330+Math.sin(t*3)*6);ox.rotate(-.03);ox.scale(s,s);ox.textAlign="center";ox.textBaseline="middle";ox.lineJoin="round";
  ox.font=`400 150px ${DISP}`;const nm=CAST[KEY[key]].name.toUpperCase();
  ox.lineWidth=34;ox.strokeStyle="#3a2350";ox.strokeText(nm,0,0);ox.lineWidth=16;ox.strokeStyle="#fff";ox.strokeText(nm,0,0);ox.fillStyle=col;ox.fillText(nm,0,0);
  ox.font=`800 44px ${BODY}`;const rw=ox.measureText(ROLE[key]).width+70;rr(-rw/2,92,rw,70,35);ox.fillStyle="#3a2350";ox.fill();
  ox.fillStyle="#fff";ox.fillText(ROLE[key],0,129);ox.restore();}
function drawScream(t,t0){const u=t-t0;if(u<0||u>1.25)return;const s=easeBack(u/.2)*(u>1.05?1-(u-1.05)/.2:1);
  ox.save();ox.translate(W/2+Math.sin(t*70)*10,520+Math.cos(t*63)*8);ox.rotate(-.06);ox.scale(s,s);ox.beginPath();
  for(let k=0;k<28;k++){const a=k/28*Math.PI*2,r=k%2?250:360;ox.lineTo(Math.cos(a)*r*1.25,Math.sin(a)*r*.8);}ox.closePath();
  ox.fillStyle="#ffe14a";ox.fill();ox.lineWidth=12;ox.strokeStyle="#3a2350";ox.stroke();
  ox.textAlign="center";ox.textBaseline="middle";ox.lineJoin="round";ox.font=`400 170px ${DISP}`;ox.lineWidth=26;ox.strokeStyle="#3a2350";ox.strokeText("AAAH!",0,8);ox.fillStyle="#ff4d6d";ox.fillText("AAAH!",0,8);ox.restore();}
function drawPolaroid(t){const t0=F_.polaroid;if(t<t0-.1||t>=F_.outro)return;
  const q=easeBack((t-t0)/.4),rot=(-14+10*Math.min(1,(t-t0)/.4))*Math.PI/180,cx=W/2,cy=1150+(1-q)*H*.8;
  const hw=540,hh=650,bd=46,bb=210;
  const pts=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>[cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);
  const poly=(P,rev)=>{const Q=rev?[...P].reverse():P;ox.moveTo(...Q[0]);Q.slice(1).forEach(p=>ox.lineTo(...p));ox.closePath();};
  const hole=pts(-hw,-hh,hw,hh),outer=pts(-hw-bd,-hh-bd,hw+bd,hh+bb);
  const g=ox.createLinearGradient(0,0,0,H);g.addColorStop(0,"#ffd6ea");g.addColorStop(1,"#c9b8ff");
  ox.save();ox.beginPath();ox.rect(0,0,W,H);poly(hole,true);ox.fillStyle=g;ox.fill("evenodd");
  for(let k=0;k<26;k++){const x=(k*397)%W,y=(k*911)%H;ox.fillStyle="rgba(255,255,255,.55)";ox.beginPath();ox.arc(x,y,6+(k%3)*4,0,7);ox.fill();}
  ox.shadowColor="rgba(58,35,80,.35)";ox.shadowBlur=40;ox.shadowOffsetY=18;ox.beginPath();poly(outer,false);poly(hole,true);ox.fillStyle="#fffdf7";ox.fill("evenodd");ox.shadowColor="transparent";
  ox.translate(cx,cy);ox.rotate(rot);ox.textAlign="center";ox.font=`400 64px ${DISP}`;ox.fillStyle="#6a4fc4";ox.fillText("Bloopies · Day 1",0,hh+bb*.62);ox.restore();}
function drawEnd(t){const tw=F_.white,wf=ss((t-tw)/.5);if(wf<=0)return;ox.fillStyle=`rgba(255,255,255,${wf})`;ox.fillRect(0,0,W,H);
  drawLogoAt(t,E1("logo_end"),1080,1.12);const t2=E1("tagline");if(t>=t2){const s=easeBack((t-t2)/.35);ox.save();ox.translate(W/2,1480);ox.scale(s,s);
    ox.font=`800 62px ${BODY}`;ox.textAlign="center";ox.textBaseline="middle";const L1="Five friends. One wobbly world.",L2="Endless adventures!";
    const w=Math.max(ox.measureText(L1).width,ox.measureText(L2).width)+110;rr(-w/2,-95,w,190,60);ox.fillStyle="#5b3bb8";ox.fill();ox.lineWidth=10;ox.strokeStyle="#ffffff";ox.stroke();
    ox.fillStyle="#fff";ox.fillText(L1,0,-38);ox.fillStyle="#ffe14a";ox.fillText(L2,0,42);ox.restore();}}
function drawOverlay(t){ox.clearRect(0,0,W,H);
  drawPolaroid(t);
  for(const l of TL.lines)if(l.who!=="n")drawBubble(l,t);
  drawLogoAt(t,E1("title"),620,.9,E1("whip")-.05);
  ["sunny","moka","zippy","nimi","nox"].forEach(k=>drawCard(t,E1("card_"+k),k));
  drawScream(t,E1("scream"));
  drawEnd(t);}
window.FILM.overlay=function(n){FILM.frame(n,false);drawOverlay(n/FPS);return ov.toDataURL("image/png");};
document.fonts.ready.then(()=>{window.FILM_READY=true;});
