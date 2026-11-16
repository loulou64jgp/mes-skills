// ================= FILM v2: "The Big Red Button" =================
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
// ---------- EPISODE 2 props ----------
tele(chars[2],new V(7.2,.28,2.6),-Math.PI/2);
const BTN=new V(0,0,2.5),BLUE=new V(1.45,0,3.55),VENT=new V(1.75,0,3.35);
function pedestal(pos,capCol){const g=G();g.position.copy(pos);world.add(g);
  mesh(new THREE.CylinderGeometry(.15,.2,.34,16),0xfff1e0,{parent:g,pos:[0,.17,0]});
  mesh(new THREE.CylinderGeometry(.36,.38,.1,24),0xece6f6,{parent:g,pos:[0,.37,0]});
  const cap=mesh(S(.3,28,20),capCol,{parent:g,pos:[0,.44,0],scale:[1,.5,1]});
  mesh(S(.075,10,8),basic(0xffffff),{outline:0,parent:cap,pos:[-.11,.18,.14]});return{g,cap};}
const RED=pedestal(BTN,0xff3b4a),BLU=pedestal(BLUE,toon(0x3fa9ff,{emissive:0x000000}));BLU.g.position.y=-.8;
// warning sign
const sign=G();sign.position.set(.82,0,2.85);sign.rotation.y=-.25;world.add(sign);
mesh(new THREE.CylinderGeometry(.03,.035,.7,8),0xb07a55,{parent:sign,pos:[0,.35,0]});
{const cv=document.createElement("canvas");cv.width=256;cv.height=160;const x=cv.getContext("2d");x.fillStyle="#fff8e6";x.fillRect(0,0,256,160);
 x.lineWidth=14;x.strokeStyle="#ff3b4a";x.strokeRect(7,7,242,146);x.fillStyle="#ff3b4a";x.font="900 46px system-ui,sans-serif";x.textAlign="center";
 x.fillText("DO NOT",128,70);x.fillText("PRESS!",128,122);const tx=new THREE.CanvasTexture(cv);
 const bd=mesh(new THREE.BoxGeometry(.5,.32,.04),0xfff8e6,{parent:sign,pos:[0,.78,0],rot:[0,0,.08],outline:.04});
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.48,.3),new THREE.MeshBasicMaterial({map:tx}));face.position.z=.022;bd.add(face);}
// vent + cork
const vent=G();vent.position.copy(VENT);world.add(vent);
mesh(new THREE.CircleGeometry(.22,24),basic(0x2b1d35),{outline:0,parent:vent,pos:[0,.015,0],rot:[-Math.PI/2,0,0]});
mesh(new THREE.TorusGeometry(.23,.045,8,24),0x8a7aa8,{parent:vent,pos:[0,.02,0],rot:[Math.PI/2,0,0],outline:.06});
const cork=mesh(new THREE.CylinderGeometry(.24,.19,.3,20),0xd9a066,{parent:world,pos:[VENT.x,.15,VENT.z]});cork.visible=false;
// bubble machine under the island
const mach=G();mach.position.set(0,-2.35,5.95);world.add(mach);
mesh(new THREE.BoxGeometry(1.7,1.0,.9),0xff8fb0,{parent:mach,outline:.03});
mesh(new THREE.CylinderGeometry(.26,.26,.06,24),0xffffff,{parent:mach,pos:[-.45,.1,.47],rot:[Math.PI/2,0,0],outline:.1});
const needle=mesh(new THREE.BoxGeometry(.03,.2,.02),basic(0xff3b4a),{outline:0,parent:mach,pos:[-.45,.1,.51]});
const gear1=mesh(new THREE.TorusGeometry(.2,.07,6,10),0xffd84a,{parent:mach,pos:[.35,.2,.47],outline:.08});
const gear2=mesh(new THREE.TorusGeometry(.13,.06,6,8),0x8fe3ff,{parent:mach,pos:[.6,-.15,.47],outline:.08});
mesh(new THREE.CylinderGeometry(.12,.12,1.0,14),0xb9a6ff,{parent:mach,pos:[0,-.35,.8],rot:[Math.PI/2.6,0,0]});
const wand=mesh(new THREE.TorusGeometry(.55,.08,10,32),0xffd84a,{parent:mach,pos:[0,-.75,1.35],rot:[.9,0,0],outline:.06});
// ---------- bubbles ----------
const bubMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tm:{value:0}},
  vertexShader:"varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vP=position;gl_Position=projectionMatrix*mv;}",
  fragmentShader:"uniform float tm;varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){float f=1.0-abs(dot(vN,vV));float fr=pow(f,2.0);vec3 rb=0.5+0.5*cos(6.2832*(vec3(0.0,0.33,0.67)+f*1.4+vP.y*0.5+tm*0.12));vec3 c=mix(vec3(1.0),rb,0.6);float a=0.07+fr*0.8;float hl=smoothstep(0.22,0.0,length(vN.xy-vec2(-0.38,0.42)));c=mix(c,vec3(1.0),hl);a+=hl*0.85;float rim=smoothstep(0.9,1.0,f);c=mix(c,vec3(0.35,0.25,0.5),rim*0.6);gl_FragColor=vec4(c,clamp(a,0.0,1.0));}"});
const bubGeo=S(1,28,18),bubbles=[];
function addBubble(p,r,v,t,life=7,force=false){if(!force&&bubbles.length>230)return null;const m=new THREE.Mesh(bubGeo,bubMat);m.renderOrder=2;m.position.copy(p);m.scale.setScalar(.001);scene.add(m);
  const b={m,r,v:v.clone(),born:t,life,wob:Math.random()*6,alive:true};bubbles.push(b);return b;}
function popBubble(b,n=5){if(!b||!b.alive)return;b.alive=false;scene.remove(b.m);const k=bubbles.indexOf(b);if(k>=0)bubbles.splice(k,1);
  for(let j=0;j<n;j++){const m=new THREE.Mesh(oct,basic(j%2?0xffffff:0xbfe9ff,{transparent:true}));m.position.copy(b.m.position).add(new V((Math.random()-.5)*b.r*1.5,(Math.random()-.5)*b.r*1.5,(Math.random()-.5)*b.r));
    const a=Math.random()*6.28;spawn(m,{v:new V(Math.cos(a)*1.5,Math.random()*1.5,Math.sin(a)*1.5),life:.4+Math.random()*.3,g:-2});}}
// special (character) bubbles
const SB={};function sBubble(name,p,r){const m=new THREE.Mesh(bubGeo,bubMat);m.renderOrder=3;m.position.copy(p);m.scale.setScalar(.001);scene.add(m);SB[name]={m,r,grow:0,alive:true};return SB[name];}
function sPop(name,n=14){const b=SB[name];if(!b||!b.alive)return;popBubble({m:b.m,r:b.r,alive:true},n);b.alive=false;}
// flowers that float
const flowers=island.children.filter(o=>o.type==="Group"&&o.children.length===2&&o.children[0].geometry&&o.children[0].geometry.type==="CylinderGeometry"&&Math.abs(o.children[0].geometry.parameters.radiusTop-.02)<1e-6);
flowers.forEach(f=>{f.userData.h=.4+Math.random()*1.2;f.userData.p=Math.random()*6;});
// ---------- tweens / follow ----------
const tweens=[];
function tw(c,to,t0,d,o={}){tweens.push(Object.assign({c,to:to.clone(),t0,d,from:null,arc:0,ry:null,rz:null},o));}
function tele(c,p,ry){c.root.position.copy(p);if(ry!=null)c.root.rotation.y=ry;}
function runTweens(t){for(const w of tweens){const q=(t-w.t0)/w.d;if(q<0||w.done)continue;
  if(!w.from){w.from=w.c.root.position.clone();w.ry0=w.c.root.rotation.y;w.rz0=w.c.root.rotation.z;}
  const k=Math.min(1,q),e=w.easeIn?k*k:(w.lin?k:ss(k));w.c.root.position.lerpVectors(w.from,w.to,e);w.c.root.position.y+=Math.sin(k*Math.PI)*w.arc;
  if(w.ry!=null)w.c.root.rotation.y=w.ry0+(w.ry-w.ry0)*e;if(w.rz!=null)w.c.root.rotation.z=w.rz0+(w.rz-w.rz0)*e;if(q>=1)w.done=true;}}
const follow={};// charIndex -> {b:SBname, off:V}
// ---------- state ----------
let noxHidden=false,flashT=-9,kickT=-9,prevT=-1/FPS,emitRate=0,emitStop=1e9,shakeA=0,shakeUntil=-9,beam=null,beamT=-9,nods=-9,reachT=-9;
const pops=[];function pop(i,t,amp,d=.6){pops.push({i,t,amp,d});}
const T=n=>E1(n);
const GBPATH={rise0:null};
function talkingNow(i,t){const key=CAST[i].key;for(const l of TL.lines){if(l.who!==key)continue;if(t>=l.start&&t<l.end){const f=Math.floor((t-l.start)*FPS);return(l.env[f]||0)>.16;}}return false;}
const LINE_EXPR={dont:[[3,"worried"]],wasnt:[[2,"happy"]],wow:[[0,"surprised"]],awesome:[[2,"happy"]],floating:[[0,"happy"]],disaster:[[3,"worried"]],
 dream:[[1,"sleepy"]],warned:[[4,"smug"]],sol1:[[3,"neutral"]],sol2:[[3,"neutral"]],sol3:[[3,"worried"]],again:[[1,"sleepy"]],technically:[[3,"surprised"]],
 onit:[[2,"happy"]],push:[[0,"happy"]],solved:[[3,"happy"],[0,"happy"],[2,"happy"]],thisone:[[2,"happy"]],herewego:[[4,"smug"]],brand:[]};
const F_={polaroid:1e9,outro:1e9,white:T("white"),stop:T("stop"),hundreds:T("hundreds"),gpop:T("gpop"),power:T("power")};
const offs={0:new V(-.82,-.45,.15),3:new V(.82,-.5,.15),2:new V(0,.42,.35)};
function fire(n,t,who){
  switch(n){
   case"roll_in":tele(chars[2],new V(7.2,.28,2.6),-Math.PI/2);tw(chars[2],new V(1.15,.28,2.6),t,1.4,{ry:-Math.PI/2});break;
   case"eyes":tw(chars[2],new V(1.15,.28,2.6),t,.25,{ry:-.35});setExpr(chars[2].rig,"surprised",1.4,t);break;
   case"tiptoe":tw(chars[2],new V(.88,.28,2.6),t,.3,{arc:.15});tw(chars[2],new V(.66,.28,2.6),t+.45,.3,{arc:.15});break;
   case"nimi_in":tele(chars[3],new V(-1.3,0,1.1),.4);tw(chars[3],new V(-.3,0,1.7),t,.35,{arc:.5});break;
   case"press":tw(chars[2],new V(.45,.12,2.55),t,.1,{lin:true});tw(chars[2],new V(.66,.28,2.6),t+.2,.25);break;
   case"rumble":shakeA=.06;shakeUntil=t+1.7;tw(chars[3],new V(1.55,0,1.95),t+.9,.6,{arc:.35,ry:-.6});chars.forEach((c,k)=>{if(k!==1&&k!==4)setExpr(c.rig,"surprised",1.8,t);});break;
   case"first_bubble":addBubble(new V(.35,0,3.25),.13,new V(0,.35,0),t,5,true);break;
   case"second_bubble":addBubble(new V(-.25,0,3.0),.1,new V(0,.4,0),t,5,true);break;
   case"hundreds":for(let k=0;k<110;k++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*7.5;addBubble(new V(Math.cos(a)*r,.05,Math.sin(a)*r),.08+Math.random()*.38,new V((Math.random()-.5)*.5,.5+Math.random()*1.3,(Math.random()-.5)*.5),t+Math.random()*1.2,6+Math.random()*4);}emitRate=22;break;
   case"giant":{const b=sBubble("g0",new V(-1.0,.2,2.0),1.05);b.from=new V(-1.0,.2,2.0);b.t0=t;break;}
   case"sunny_jump":tw(chars[0],new V(-1.0,1.45-.78,2.0),t,.55,{arc:1.0});follow.pending0={b:"g0",at:t+.55};act(0,"spin");break;
   case"zippy_trick":{act(2,"flip");const zb=addBubble(new V(1.7,.62,2.95),.62,new V(0,0,0),t-.6,9,true);if(zb)zb.fixed=true;GBPATH.zb=zb;
     tw(chars[2],new V(1.7,1.22,2.95),t,.55,{arc:1.1});tw(chars[2],new V(2.6,.28,2.6),t+.75,.5,{arc:.7});break;}
   case"nimi_swat":for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const b=addBubble(new V(1.55+Math.cos(a)*.8,.9+Math.sin(k)*.4,1.95+Math.sin(a)*.5),.2,new V(0,.05,0),t-.4,9,true);if(b){b.fixed=true;b.popAt=t+.25+k*.28;}}break;
   case"moka_bonk":{const b=sBubble("mb",new V(-3.0,1.3,1.2),1.18);b.from=new V(-3.0,1.3,1.2);b.t0=t;b.toChar=1;
     tw(chars[1],new V(-4.35,1.3,.5),t+1.0,2.6);tw(chars[1],new V(-2.3,2.55,1.5),t+3.7,9);setExpr(chars[1].rig,"sleepy",30,t);break;}
   case"ear_pop":{const b=addBubble(new V(.42,3.38,-1.35),.16,new V(0,-.25,0),t-.6,9,true);if(b){b.fixed=true;b.popAt=t+.3;}break;}
   case"swat":{const b=addBubble(new V(1.9,1.25,2.35),.3,new V(0,0,0),t-.5,9,true);if(b){b.fixed=true;b.popAt=t+.15;}
     for(let k=0;k<3;k++){const c=addBubble(new V(1.9+(k-1)*.35,1.25+(k%2)*.2,2.35),.22,new V((k-1)*.3,.25,0),t+.25,8);}break;}
   case"book":cork.visible=true;cork.position.set(VENT.x,.15,VENT.z);FX.puff(chars[3],-1.2);GBPATH.cork=t;FX.puff&&0;break;
   case"bonk_nimi":{const b=sBubble("nb",new V(3.0,1.0,2.4),1.0);b.from=new V(3.0,1.0,2.4);b.t0=t;b.toChar=3;tw(chars[3],new V(1.55,.65,1.95),t+.5,1.6);setExpr(chars[3].rig,"worried",4,t);break;}
   case"power":emitRate=48;shakeA=.04;shakeUntil=t+1.4;break;
   case"group_bubble":{const b=sBubble("gb",new V(.9,-1.6,2.2),2.3);b.from=new V(.9,-1.6,2.2);b.t0=t;world.attach(chars[2].plat.p);
     [0,3,2].forEach((i,k)=>{follow[i]=null;});
     GBPATH.merge=t+.5;break;}
   case"freeze":[0,2,3].forEach(i=>setExpr(chars[i].rig,"surprised",1.2,t));break;
   case"onit_reach":reachT=t;break;
   case"push":[0,2,3].forEach(i=>setExpr(chars[i].rig,"happy",1.6,t));break;
   case"magic":beamT=t;setExpr(chars[4].rig,"smug",4,t);break;
   case"gpop":{sPop("gb",40);[0,3,2].forEach(i=>{follow[i]=null;});kickT=t;
     tw(chars[2],new V(0,.56,2.5),t,.45,{easeIn:true,ry:0});tw(chars[0],new V(-1.0,0,2.95),t,.5,{easeIn:true,ry:.15});tw(chars[3],new V(1.0,0,2.95),t,.5,{easeIn:true,ry:-.15});
     [0,2,3].forEach(i=>setExpr(chars[i].rig,"surprised",1.2,t));break;}
   case"press2":kickT=t;emitRate=0;break;
   case"stop":bubbles.slice().forEach((b,k)=>{b.popAt=t+Math.random()*.9;b.fixed=true;});
     setTimeoutLike(t+.35,()=>sPop("mb",20));tw(chars[1],new V(-1.95,0,2.3),t+.45,1.6);break;
   case"calm":tw(chars[2],new V(.35,0,3.15),t,.35,{arc:.45});break;
   case"nod":nods=t;break;
   case"blue":GBPATH.blue=t;tw(chars[2],new V(.55,0,3.2),t+.4,.3,{ry:.95});setExpr(chars[2].rig,"surprised",1.2,t);break;
   case"allno":[0,1,3].forEach(i=>setExpr(chars[i].rig,"worried",2.5,t));[0,3].forEach(i=>pop(i,t,.45,.5));break;
   case"press3":tw(chars[2],new V(BLUE.x,.56,BLUE.z),t-.3,.32,{arc:.6});break;
   case"white":flashT=t;break;
   case"talk":act(KEY[who],"talk");break;
  }}
const later=[];function setTimeoutLike(t,f){later.push({t,f});}
function step(t,dt){
  FT=t;bubMat.uniforms.tm.value=t;
  for(const e of TL.events)if(e[1]>prevT&&e[1]<=t)fire(e[0],e[1],e[2]);
  for(const x of later)if(!x.done&&t>=x.t){x.done=true;x.f();}
  for(const l of TL.lines)if(l.start>prevT&&l.start<=t){(LINE_EXPR[l.tag]||[]).forEach(([k,ex])=>setExpr(chars[k].rig,ex,(l.end-l.start)+.7,t));
    chars.forEach((c,k)=>{c.lookAt=(l.who!=="n"&&KEY[l.who]!==k)?KEY[l.who]:null;});}
  if(TL.lines.every(l=>!(t>=l.start-.05&&t<l.end+.3&&l.who!=="n")))chars.forEach(c=>c.lookAt=null);
  if(t>=T("again")-.2&&t<T("technically")+.5)[0,2,3].forEach(i=>chars[i].lookAt=1);
  if(t>=T("blue")&&t<T("press3"))chars[2].lookAt=null;
  prevT=t;
  runTweens(t);
  // shaking
  const sh=t<shakeUntil?shakeA*Math.min(1,(shakeUntil-t)/.4):0;world.position.set(Math.sin(t*61)*sh,Math.sin(t*47)*sh*.6,0);
  trees.forEach((tr,i)=>tr.rotation.z=Math.sin(t*.8+i)*.015+(sh>0?Math.sin(t*38+i)*.05:0));
  // buttons
  {const q1=t-T("press"),q2=t-T("press2"),q3=t-T("press3");RED.cap.position.y=(q1>0&&q1<.35)||(q2>0&&q2<.5)?.37:.44;
   const b=GBPATH.blue;BLU.g.position.y=b?-.8+.8*ss((t-b)/.6):-.8;BLU.cap.position.y=q3>0?.37:.44;BLU.cap.material.emissive.setRGB(.05,.18*(b&&t>b?.6+.4*Math.sin(t*6):0),.35*(b&&t>b?.6+.4*Math.sin(t*6):0));}
  // machine
  {const on=t>T("machine")&&t<T("press2");wand.rotation.z=on?t*4:wand.rotation.z;gear1.rotation.z=on?t*3:0;gear2.rotation.z=on?-t*4.5:0;needle.rotation.z=on?Math.sin(t*9)*.9:0;
   if(on&&t>T("machine")+.3&&Math.floor(t*12)!==Math.floor((t-dt)*12)){const p=new V();wand.getWorldPosition(p);addBubble(p.clone().add(new V((Math.random()-.5)*.6,(Math.random()-.5)*.3,0)),.15+Math.random()*.2,new V((Math.random()-.5)*.6,1.0+Math.random(),.6),t,4);}}
  // emission over the island
  if(emitRate>0&&t<T("press2")){const n=emitRate*dt;let k=Math.floor(n)+(Math.random()<n%1?1:0);while(k--){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*7.8;
      addBubble(new V(Math.cos(a)*r,.05,Math.sin(a)*r),.08+Math.random()*.42,new V((Math.random()-.5)*.6,.6+Math.random()*1.4,(Math.random()-.5)*.6),t,6+Math.random()*3);}
    if(GBPATH.cork==null||t<GBPATH.cork||t>GBPATH.cork+.9){if(Math.random()<dt*6)addBubble(VENT.clone().add(new V(0,.1,0)),.12+Math.random()*.15,new V(0,1.2,.1),t,5);}}
  // update bubbles
  for(const b of bubbles.slice()){const age=t-b.born;if(age<0){b.m.visible=false;continue;}b.m.visible=true;
    b.m.scale.setScalar(b.r*Math.min(1,age/.3+.05));
    if(!b.fixed){b.v.y+=( .9-b.v.y)*dt*.3;b.m.position.addScaledVector(b.v,dt);b.m.position.x+=Math.sin(t*1.3+b.wob)*dt*.25;b.m.position.z+=Math.cos(t*1.1+b.wob)*dt*.15;}
    else{b.m.position.y+=Math.sin(t*2+b.wob)*dt*.05;}
    if((b.popAt&&t>=b.popAt)||age>b.life||b.m.position.y>12)popBubble(b,b.popAt?6:2);}
  // cork: sits on the vent, then launches on a bubble
  if(GBPATH.cork!=null){const q=t-GBPATH.cork;if(q>=.9){cork.position.set(VENT.x+(q-.9)*.3,.15+(q-.9)*(q-.9)*2.2+(q-.9)*1.2,VENT.z);cork.rotation.z=(q-.9)*2;
      if(!GBPATH.corkB){GBPATH.corkB=addBubble(cork.position.clone(),.5,new V(0,0,0),t,6,true);if(GBPATH.corkB)GBPATH.corkB.fixed=true;}
      if(GBPATH.corkB&&GBPATH.corkB.alive)GBPATH.corkB.m.position.copy(cork.position);}}
  // special bubbles
  const sbPos=(name)=>SB[name]&&SB[name].alive?SB[name].m.position:null;
  if(SB.g0&&SB.g0.alive){const b=SB.g0,u=t-b.t0;const P=b.from.clone().lerp(new V(-1.0,1.45,2.0),ss(u/1.5));
    if(t>T("sunny_jump")+.55)P.lerp(new V(-1.4,3.0,1.7),ss((t-T("sunny_jump")-.55)/6));b.m.position.copy(P);}
  if(SB.mb&&SB.mb.alive){const b=SB.mb,u=t-b.t0;const c=chars[1].root.position.clone().add(new V(0,chars[1].base,0));b.m.position.copy(b.from.clone().lerp(c,ss(u/.7)));}
  if(SB.nb&&SB.nb.alive){const b=SB.nb,u=t-b.t0;const c=chars[3].root.position.clone().add(new V(0,chars[3].base,0));b.m.position.copy(b.from.clone().lerp(c,ss(u/.6)));}
  if(SB.gb&&SB.gb.alive){const b=SB.gb,u=t-b.t0;let P=b.from.clone().lerp(new V(.9,2.0,2.2),ss(u/1.2));P.lerp(new V(.9,3.0,2.2),ss((t-T("group_bubble")-1.2)/2.5));
    P.lerp(new V(0,3.0,2.55),ss((t-T("push"))/1.4));P.y+=Math.sin(t*1.7)*.08;b.m.position.copy(P);
    if(t>=GBPATH.merge&&!GBPATH.merged){GBPATH.merged=true;if(SB.g0)SB.g0.alive=false,scene.remove(SB.g0.m);if(SB.nb)SB.nb.alive=false,scene.remove(SB.nb.m);
      [0,3,2].forEach(i=>{follow[i]={b:"gb",off:offs[i],t0:t,from:chars[i].root.position.clone()};});}}
  for(const name in SB){const b=SB[name];if(b.alive)b.m.scale.setScalar(b.r*Math.min(1,(t-(b.t0||0))/.4+.05));}
  // characters following a bubble
  if(follow.pending0&&t>=follow.pending0.at&&!follow[0]){follow[0]={b:"g0",off:new V(0,0,0),t0:t,from:chars[0].root.position.clone()};}
  for(const i of [0,2,3]){const f=follow[i];if(!f)continue;const bp=sbPos(f.b);if(!bp){continue;}
    const tgt=bp.clone().add(f.off).sub(new V(0,chars[i].base,0));chars[i].root.position.copy(f.from.clone().lerp(tgt,ss((t-f.t0)/.6)));}
  // flowers float during the chaos
  flowers.forEach(f=>{const u=f.userData;const up=ss((t-F_.hundreds)/2)*(1-ss((t-F_.stop)/1.2));f.position.y=up*(u.h+Math.sin(t*1.5+u.p)*.15);f.rotation.z=up*Math.sin(t+u.p)*.6;});
  applySky(0);
  clouds.forEach(c=>{const u=c.userData,a=u.a+t*u.speed;c.position.set(Math.cos(a)*u.r,u.y+Math.sin(t*.3+u.a)*.2,Math.sin(a)*u.r*(u.y>0?.6:1)-(u.y>0?14:2));});
  flies.forEach(f=>f.scale.setScalar(.001));
  petals.forEach(p=>{const u=p.userData;const y=((u.y-u.s*t)%7+7)%7;p.position.set(u.x+Math.sin(t*.6+u.p)*.7,y,u.z+Math.cos(t*.5+u.p)*.4);p.rotation.set(t*1.3+u.p,t+u.p,0);});
  chars[4].plat.crys.forEach((m,i)=>{const s=1+.25*Math.sin(t*2+i);m.material.color.setRGB(.55,.4,1);});
  sunnyLight.position.copy(chars[0].root.position).add(tmp.set(0,1.4,.6));
  const cp=camAt(t);camera.position.copy(cp.p);
  //__CHARLOOP__
  pops.forEach(p=>{const q=(t-p.t)/p.d;if(q>0&&q<1)chars[p.i].bob.position.y+=Math.sin(q*Math.PI)*p.amp;});
  // beats
  if(t>=T("nimi_swat")-.1&&t<T("nimi_swat")+1.9){const b=chars[3].ex.board;b.rotation.set(-.4+Math.sin((t-T("nimi_swat"))*14)*.9,.3,Math.sin((t-T("nimi_swat"))*14)*.5);}
  else if(t>=T("swat")-.1&&t<T("swat")+.6){chars[3].ex.board.rotation.set(-.4+Math.sin((t-T("swat"))*12)*1.1,.3,.2);}
  else chars[3].ex.board.rotation.set(-.25,.45,.12);
  if(t>=reachT&&t<reachT+1.1){const q=(t-reachT)/1.1;chars[2].bob.scale.y*=1+.25*Math.sin(q*Math.PI);chars[2].bob.position.y-=.25*Math.sin(q*Math.PI);}
  if(t>=T("push")&&t<T("push")+1.5){const k=Math.sin((t-T("push"))/1.5*Math.PI);[0,2,3].forEach(i=>chars[i].g.rotation.z+=k*.35);}
  if(t>=nods&&t<nods+.9){[0,1,2,3].forEach((i,k)=>{chars[i].g.rotation.x+=Math.sin((t-nods-k*.05)*14)*.18;});}
  if(t>=T("blue")&&t<T("allno")){const a=chars[2].ex.bolt;a.material.emissive.setRGB(.8,.7,0);}
  // Nox magic beam
  {const q=(t-beamT)/1.0;chars[4].ex.crystals.children.forEach((m,k)=>{if(q>0&&q<1.2)m.position.multiplyScalar(1+Math.sin(q*Math.PI)*.4);});
   if(q>0&&q<1){if(!beam){beam=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1,10,1,true),new THREE.MeshBasicMaterial({color:0xeadcff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
       const halo=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,1,12,1,true),new THREE.MeshBasicMaterial({color:0x9b6bff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));beam.add(halo);scene.add(beam);}
     const a=new V();chars[4].anchor.getWorldPosition(a);a.y-=.6;const bp=sbPos("gb")||new V(0,3,2.55);const b=bp.clone().add(new V(0,1.6,0));
     const len=a.distanceTo(b)*Math.min(1,q/.35);const dir=b.clone().sub(a).normalize();beam.position.copy(a).addScaledVector(dir,len/2);beam.scale.set(1,len,1);beam.quaternion.setFromUnitVectors(UPV,dir);
     beam.material.opacity=.95*(q<.8?1:1-(q-.8)/.2);beam.visible=true;
     if(Math.floor(t*20)!==Math.floor((t-dt)*20)){const m=new THREE.Mesh(oct,basic(0xd7b6ff,{transparent:true}));m.position.copy(a).addScaledVector(dir,len*Math.random());spawn(m,{v:new V((Math.random()-.5),Math.random(),(Math.random()-.5)),life:.5,g:0});}}
   else if(beam)beam.visible=false;}
  for(let k=fx.length-1;k>=0;k--){const m=fx[k],u=m.userData;
    if(u.delay>0){u.delay-=dt;m.visible=false;continue;}m.visible=true;
    u.v.y+=u.g*dt;m.position.addScaledVector(u.v,dt);if(u.spin){m.rotation.x+=dt*6;m.rotation.y+=dt*8;}
    u.life-=dt;m.material.opacity=Math.max(u.life/u.max,0)*.95;if(u.grow)m.scale.multiplyScalar(1+u.grow*dt);
    if(u.life<=0){scene.remove(m);m.material.dispose();fx.splice(k,1);}}
  const kf=Math.floor((t-kickT)*FPS);let kx=0,kr=0;if(kf>=0&&kf<7){const a=(1-kf/7)*(kf%2?-1:1);kx=a*.08;kr=a*1.5*Math.PI/180;}
  if(sh>0){kx+=Math.sin(t*53)*sh*.6;}
  placeCam(cp,kx,kr);
  grade.uniforms.flash.value=0;
}
function placeCam(cp,kx=0,kr=0){camera.position.copy(cp.p).add(new V(kx,-kx*.6,0));camera.fov=cp.fov;camera.updateProjectionMatrix();camera.up.set(0,1,0);camera.lookAt(cp.l);camera.rotateZ(cp.roll+kr);camera.updateMatrixWorld();}
// ---------- camera ----------
function CUat(center,ry,dist,h,side,dy){const a=ry+side;return{p:center.clone().add(new V(Math.sin(a)*dist,h,Math.cos(a)*dist)),l:center.clone().add(new V(0,dy,0))};}
const live=i=>chars[i].root.position.clone().add(new V(0,chars[i].base,0));
const SH=TL.shots.map((s,k)=>({id:s[0],s:s[1],g:s[2]/FPS,e:k+1<TL.shots.length?TL.shots[k+1][1]:TL.end}));
function shotPose(id,t,s0,s1){const u=Math.max(0,Math.min(1,(t-s0)/Math.max(.01,s1-s0)));let a,b,fov=40,roll=0;const q=ss(u);
  switch(id){
   case"establish":a={p:new V(2.5,6.8,23),l:new V(0,1.0,0)};b={p:new V(1.4,2.0,8.6),l:new V(.4,.75,2.5)};return{p:a.p.lerp(b.p,q),l:a.l.lerp(b.l,q),fov,roll:0};
   case"eyes":{const c=live(2);a={p:c.clone().add(new V(-.35,.12,2.2)),l:c.clone().add(new V(0,.12,0))};b={p:c.clone().add(new V(-.3,.12,1.85)),l:a.l.clone()};break;}
   case"approach":a={p:new V(-1.7,1.5,7.6),l:new V(.85,.85,2.2)};b={p:new V(-1.5,1.45,7.1),l:new V(.85,.85,2.2)};break;
   case"press":a={p:new V(.25,1.0,4.3),l:new V(.1,.5,2.5)};b={p:new V(.22,.95,4.0),l:new V(.1,.5,2.5)};break;
   case"rumble":a={p:new V(4.2,3.6,14),l:new V(0,1.0,0)};b={p:new V(3.9,3.4,13.2),l:new V(0,1.0,0)};break;
   case"machine":a={p:new V(3.4,-6.2,13.4),l:new V(0,-2.7,6.0)};b={p:new V(3.0,-5.8,12.6),l:new V(0,-2.6,6.0)};break;
   case"first":a={p:new V(.5,.6,5.0),l:new V(.25,.35,3.2)};b={p:new V(.45,.62,4.6),l:new V(.2,.42,3.1)};break;
   case"hundreds":a={p:new V(0,5.6,17),l:new V(0,1.8,0)};b={p:new V(0,5.0,15.5),l:new V(0,2.0,0)};break;
   case"giant":a={p:new V(.9,.45,7.2),l:new V(-.6,1.5,1.6)};b={p:new V(.8,.45,6.8),l:new V(-.6,1.6,1.6)};break;
   case"sunny":{const c=live(0);a={p:c.clone().add(new V(1.0,.4,4.6)),l:c.clone()};b={p:c.clone().add(new V(.9,.3,4.2)),l:c.clone()};break;}
   case"zippy":a={p:new V(2.0,1.3,8.8),l:new V(2.0,1.55,2.8)};b={p:new V(2.0,1.3,8.3),l:new V(2.0,1.55,2.8)};break;
   case"nimi":{const c=live(3);a=CUat(c,-.35,3.9,.35,0,.1);b=CUat(c,-.35,3.5,.35,0,.1);break;}
   case"moka":{const c=live(1);a={p:c.clone().add(new V(1.6,.2,4.2)),l:c.clone()};b={p:c.clone().add(new V(1.4,.1,3.8)),l:c.clone()};break;}
   case"nox":{const c=C0[4];a=CUat(c,0,3.8,.3,.15,.15);b=CUat(c,0,3.4,.3,.15,.15);break;}
   case"montage":a={p:new V(0,4.4,15.5),l:new V(-.5,2.6,0)};b={p:new V(0,4.2,14.6),l:new V(-.5,2.6,0)};break;
   case"sol1":{const c=live(3);a=CUat(c,-.3,3.9,.35,0,.2);b=CUat(c,-.3,3.6,.35,0,.2);break;}
   case"sol2":a={p:new V(2.8,1.4,6.6),l:new V(1.65,.6,2.7)};b={p:new V(2.7,1.35,6.3),l:new V(1.65,.65,2.7)};break;
   case"sol3":{const c=live(3);a=CUat(c,-.3,4.2,.3,0,.1);b=CUat(c,-.3,3.9,.3,0,.1);break;}
   case"power":a={p:new V(.6,1.0,12.5),l:new V(.6,2.2,1.5)};b={p:new V(.6,1.1,11.8),l:new V(.6,2.5,1.5)};break;
   case"again":a={p:new V(-.6,3.6,10.4),l:new V(-.6,3.0,1.9)};b={p:new V(-.6,3.5,9.8),l:new V(-.6,3.0,1.9)};break;
   case"technically":{const c=live(3);a={p:c.clone().add(new V(.6,.1,3.4)),l:c.clone()};b={p:c.clone().add(new V(.55,.1,3.1)),l:c.clone()};break;}
   case"onit":{const c=live(2);a={p:c.clone().add(new V(.2,-.2,3.2)),l:c.clone().add(new V(0,-.2,0))};b={p:c.clone().add(new V(.2,-.2,2.9)),l:a.l.clone()};break;}
   case"push":{const c=SB.gb&&SB.gb.alive?SB.gb.m.position.clone():new V(0,3,2.5);a={p:c.clone().add(new V(1.5,.3,8.0)),l:c.clone()};b={p:c.clone().add(new V(1.3,.3,7.4)),l:c.clone()};break;}
   case"noxmagic":a={p:new V(1.7,4.7,-5.4),l:new V(0,3.1,1.6)};b={p:new V(1.5,4.6,-5.0),l:new V(0,3.1,1.6)};roll=-4;break;
   case"gpop":a={p:new V(0,2.3,9.6),l:new V(0,1.6,2.5)};b={p:new V(0,2.2,9.1),l:new V(0,1.5,2.5)};break;
   case"stop":a={p:new V(0,5.2,16),l:new V(-.5,2.2,0)};b={p:new V(0,4.8,15),l:new V(-.5,2.0,0)};break;
   case"calm":a={p:new V(.2,2.3,9.6),l:new V(-.2,1.3,1.6)};b={p:new V(.2,2.2,9.0),l:new V(-.2,1.3,1.6)};break;
   case"blue":a={p:new V(1.2,1.0,6.2),l:new V(1.1,.55,3.3)};b={p:new V(1.15,.95,5.8),l:new V(1.1,.55,3.3)};break;
   case"allno":a={p:new V(.2,2.4,10.2),l:new V(-.1,1.3,1.8)};b={p:new V(.2,2.35,9.8),l:new V(-.1,1.3,1.8)};break;
   case"herewego":{const c=C0[4];a=CUat(c,0,3.3,.25,-.1,.2);b=CUat(c,0,3.0,.25,-.1,.2);break;}
   case"press3":a={p:new V(1.75,1.1,6.2),l:new V(1.4,.7,3.5)};b={p:new V(1.7,1.05,5.8),l:new V(1.4,.7,3.5)};break;
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

function drawTitle(t){const t0=.35,t1=2.9;if(t>t1+.25)return;drawLogoAt(t,t0,430,.62,t1);
  const p=easeBack((t-t0-.45)/.3)*(t>t1?Math.max(0,1-(t-t1)/.2):1);if(p<=0)return;ox.save();ox.translate(W/2,640);ox.scale(p,p);
  ox.textAlign="center";ox.textBaseline="middle";ox.font=`800 50px ${BODY}`;const s1="EPISODE 2",s2="THE BIG RED BUTTON";
  ox.font=`400 64px ${DISP}`;const w=Math.max(ox.measureText(s2).width,300)+100;rr(-w/2,-80,w,175,56);ox.fillStyle="#ff3b4a";ox.fill();ox.lineWidth=10;ox.strokeStyle="#fff";ox.stroke();
  ox.font=`800 40px ${BODY}`;ox.fillStyle="#ffe14a";ox.fillText(s1,0,-32);ox.font=`400 64px ${DISP}`;ox.fillStyle="#fff";ox.fillText(s2,0,36);ox.restore();}
function drawShout(t,t0,txt){const u=t-t0;if(u<0||u>1.3)return;const s=easeBack(u/.2)*(u>1.1?1-(u-1.1)/.2:1);
  ox.save();ox.translate(W/2+Math.sin(t*70)*10,560+Math.cos(t*63)*8);ox.rotate(-.06);ox.scale(s,s);ox.beginPath();
  for(let k=0;k<28;k++){const a=k/28*Math.PI*2,r=k%2?260:370;ox.lineTo(Math.cos(a)*r*1.45,Math.sin(a)*r*.78);}ox.closePath();
  ox.fillStyle="#ffe14a";ox.fill();ox.lineWidth=12;ox.strokeStyle="#3a2350";ox.stroke();
  ox.textAlign="center";ox.textBaseline="middle";ox.lineJoin="round";ox.font=`400 132px ${DISP}`;ox.lineWidth=26;ox.strokeStyle="#3a2350";ox.strokeText(txt,0,8);ox.fillStyle="#ff4d6d";ox.fillText(txt,0,8);ox.restore();}
function drawOverlay(t){ox.clearRect(0,0,W,H);
  for(const l of TL.lines)if(l.who!=="n")drawBubble(l,t);
  drawTitle(t);drawShout(t,E1("allno"),"ZIPPY, NO!");drawEnd(t);}
window.FILM.overlay=function(n){FILM.frame(n,false);drawOverlay(n/FPS);return ov.toDataURL("image/png");};
document.fonts.ready.then(()=>{window.FILM_READY=true;});
