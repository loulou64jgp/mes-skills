// ================= FILM =================
const TL=window.__TL,FPS=TL.fps,W=1440,H=2560;
renderer.setPixelRatio(1);renderer.setSize(W,H,false);camera.fov=40;camera.aspect=W/H;camera.updateProjectionMatrix();
const reduce=false,hovered=-1,ptr={in:false};const tmp=new V(),tmp2=new V();
const KEY={sunny:0,moka:1,zippy:2,nimi:3,nox:4};
chars.forEach(c=>{c.dropAt=-10;c.landed=1;});
// post
let composer=null,bloom=null,grade=null;
{const rt=new THREE.WebGLMultisampleRenderTarget(W,H,{format:THREE.RGBAFormat});rt.samples=4;
 composer=new THREE.EffectComposer(renderer,rt);composer.addPass(new THREE.RenderPass(scene,camera));
 bloom=new THREE.UnrealBloomPass(new THREE.Vector2(W,H),.3,.45,.95);composer.addPass(bloom);
 grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},vig:{value:.3},sat:{value:1.12},tint:{value:new THREE.Color(1,1,1)},flash:{value:0}},
  vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  fragmentShader:"uniform sampler2D tDiffuse;uniform float vig,sat,flash;uniform vec3 tint;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,sat)*tint;vec2 d=vUv-.5;c.rgb*=1.0-vig*dot(d,d)*2.4;c.rgb=mix(c.rgb,vec3(1.0),flash);gl_FragColor=c;}"});
 composer.addPass(grade);composer.setSize(W,H);}
// static body centres
const C=chars.map(c=>new V(c.root.position.x,c.root.position.y+c.base,c.root.position.z));
const FWD=chars.map(c=>c.root.rotation.y);
const ss=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
function CU(i,dist,h,side,dy){const a=FWD[i]+side;return{p:C[i].clone().add(new V(Math.sin(a)*dist,h,Math.cos(a)*dist)),l:C[i].clone().add(new V(0,dy,0))};}
const lineAt=i=>TL.lines[i];
const L14=lineAt(14),L13=lineAt(13);
const ROCKCAM={p:new V(0,3.7,4.9),l:new V(0,2.45,-1.4)};
const NOXPOP=new V(.3,1.3,.45);
const FORM={0:new V(-.8,0,2.3),2:new V(.8,0,2.3),1:new V(-1.55,0,1.0),3:new V(1.55,0,1.0),4:new V(0,chars[4].plat.h,-1.4)};
const PHOTOBOMB=new V(0,.15,4.3);
function shotPose(id,t,s0,s1){const u=(t-s0)/Math.max(.01,s1-s0);let a,b,fov=40,roll=0;
  switch(id){
   case"hook":{const q=ss(u/.93);return{p:new V(7,-9,27).lerp(new V(1.2,3.6,16),q),l:new V(0,-2.2,0).lerp(new V(0,1.3,0),q),fov:44-4*q,roll:(-4+4*q)*Math.PI/180};}
   case"wide":a={p:new V(12.2,5.0,12.8),l:new V(.2,1.25,0)};b={p:new V(11.4,4.7,12.0),l:new V(.1,1.2,0)};roll=1.5;break;
   case"sunny":a=CU(0,5.9,.7,.12,.6);b=CU(0,5.1,.6,.12,.6);break;
   case"ots":a={p:new V(-.2,2.3,5.4),l:C[1].clone().add(new V(.2,.1,0))};b={p:new V(-.4,2.25,5.0),l:C[1].clone().add(new V(.2,.1,0))};break;
   case"moka":a=CU(1,4.5,.5,-.15,.2);b=CU(1,3.8,.45,-.15,.2);break;
   case"zippy":a=CU(2,5.8,-.25,.25,.45);b=CU(2,5.1,-.25,.25,.45);fov=42;break;
   case"nimi":a=CU(3,4.7,.6,-.2,.4);b=CU(3,4.1,.55,-.2,.4);break;
   case"rock":{a={p:ROCKCAM.p.clone(),l:ROCKCAM.l.clone()};b={p:ROCKCAM.p.clone().add(new V(0,-.1,-.5)),l:ROCKCAM.l.clone()};
     const ts=L14.start;let lx=0;
     if(t>ts-.15&&t<APPEAR)lx=-1.5*ss((t-ts+.15)/.35)+3.0*ss((t-ts-.35)/.45)-1.5*ss((t-APPEAR+.25)/.2);
     a.l.x+=lx;b.l.x+=lx;
     if(t>APPEAR){const k=ss((t-APPEAR)/2.5);const nl=NOXPOP.clone().add(new V(0,1.7,0));a.l.lerp(nl,1);b.l.lerp(nl,1);a.p.add(new V(0,-.35,-.3*k));b.p.add(new V(0,-.35,-.6*k));roll=4*k;}
     break;}
   case"group":a={p:new V(0,3.0,15.2),l:new V(0,1.65,.8)};b={p:new V(0,2.85,14.2),l:new V(0,1.6,.8)};if(t>FLASH2)roll=-4*ss((t-FLASH2)/1.2);break;
   case"outro":a={p:new V(3.2,5.2,24),l:new V(0,.4,0)};b={p:new V(4.4,6.3,28),l:new V(0,.2,0)};break;
  }
  return{p:a.p.lerp(b.p,u),l:a.l.lerp(b.l,u),fov,roll:roll*Math.PI/180};}
const SH=TL.shots.map((s,k)=>({id:s[0],s:s[1],g:s[2]/FPS,e:k+1<TL.shots.length?TL.shots[k+1][1]:TL.end}));
const EV=t=>TL.events.filter(e=>e[0]===t).map(e=>e[1]);
const APPEAR=EV("appear")[0],FLASH2=EV("flash")[1];
function camAt(t){let k=SH.findIndex(s=>t>=s.s&&t<s.e);if(k<0)k=SH.length-1;const s=SH[k];let P=shotPose(s.id,t,s.s,s.e);
  if(s.g>0&&k>0&&t<s.s+s.g){const pr=SH[k-1],Q=shotPose(pr.id,s.s,pr.s,pr.e),q=ss((t-s.s)/s.g);
    P={p:Q.p.lerp(P.p,q),l:Q.l.lerp(P.l,q),fov:Q.fov+(P.fov-Q.fov)*q,roll:Q.roll+(P.roll-Q.roll)*q};}
  return P;}
// talking from voice envelope
function talkingNow(i,t){const key=CAST[i].key;for(const l of TL.lines){if(l.who!==key)continue;if(t>=l.start&&t<l.end){const f=Math.floor((t-l.start)*FPS);return(l.env[f]||0)>.16;}}return false;}
const LINE_EXPR={3:[[0,"happy"]],4:[[1,"sleepy"],[4,"smug"],[2,"happy"]],6:[[1,"sleepy"]],7:[[1,"sleepy"]],9:[[2,"happy"],[3,"worried"]],11:[[3,"neutral"]],12:[[3,"happy"]],15:[[4,"smug"]],16:[[4,"smug"]],17:[[2,"happy"]],18:[[0,"happy"]],19:[[1,"sleepy"]]};
let noxHidden=false,flashT=-9,kickT=-9,prevT=-1/FPS,hops=[];
function fire(name,who,t){const i=who==="all"?-1:KEY[who];
  switch(name){
   case"spin":case"yawn":case"flip":case"bulb":act(i,name);break;
   case"talk":act(i,"talk");break;
   case"kick":kickT=t;break;
   case"flash":flashT=t;break;
   case"appear":{const c=chars[4];noxHidden=false;c.root.position.copy(NOXPOP);c.root.rotation.y=Math.atan2(ROCKCAM.p.x-NOXPOP.x,ROCKCAM.p.z-NOXPOP.z);scene.attach(c.plat.p);FX.puff(c,-.6);setExpr(c.rig,"smug",8,t);break;}
   case"hop":chars.forEach((c,k)=>{if(c.plat.p.parent===c.root)scene.attach(c.plat.p);hops.push({c,from:c.root.position.clone(),to:FORM[k],ry0:c.root.rotation.y,t0:t+[.0,.25,.12,.35,.05][k],d:.75});});break;
   case"vanish":FX.puff(chars[4],-.6);noxHidden=true;break;
   case"photobomb":{const c=chars[4];c.root.position.copy(PHOTOBOMB);c.root.rotation.y=0;noxHidden=false;FX.puff(c,-.6);chars.forEach((d,k)=>{if(k!==4)setExpr(d.rig,"surprised",1.6,t);});setExpr(c.rig,"smug",9,t);break;}
   case"hide":noxHidden=true;break;
   case"zzz":FX.zzz(chars[1]);setExpr(chars[1].rig,"sleepy",9,t);break;
  }}
function step(t,dt){
  FT=t;
  for(const e of TL.events)if(e[1]>prevT&&e[1]<=t)fire(e[0],e[2],t);
  for(const l of TL.lines)if(l.start>prevT&&l.start<=t){(LINE_EXPR[l.i]||[]).forEach(([k,ex])=>setExpr(chars[k].rig,ex,(l.end-l.start)+.6,t));
    chars.forEach((c,k)=>{c.lookAt=(l.who!=="n"&&KEY[l.who]!==k)?KEY[l.who]:null;});}
  if(TL.lines.every(l=>!(t>=l.start-.05&&t<l.end+.3&&l.who!=="n")))chars.forEach(c=>c.lookAt=null);
  prevT=t;
  hops.forEach(h=>{const q=(t-h.t0)/h.d;if(q<0||q>1.2)return;const k=Math.min(1,Math.max(0,q));h.c.root.position.lerpVectors(h.from,h.to,ss(k));h.c.root.position.y+=Math.sin(k*Math.PI)*1.3;
    h.c.root.rotation.y=h.ry0*(1-ss(k));});
  const night=t>SH[SH.length-1].s?.5*ss((t-SH[SH.length-1].s)/4):0;applySky(night);
  const cp=camAt(t);
  // world
  clouds.forEach(c=>{const u=c.userData,a=u.a+t*u.speed;c.position.set(Math.cos(a)*u.r,u.y+Math.sin(t*.3+u.a)*.2,Math.sin(a)*u.r*(u.y>0?.6:1)-(u.y>0?14:2));});
  flies.forEach(f=>{const u=f.userData;f.position.set(u.x+Math.sin(t*.5+u.p)*.8,u.y+Math.sin(t*.9+u.p*2)*.4,u.z+Math.cos(t*.4+u.p)*.8);f.scale.setScalar(Math.max(.001,night*(.6+.5*Math.sin(t*3+u.p))));});
  petals.forEach(p=>{const u=p.userData;const y=((u.y-u.s*t)%7+7)%7;p.position.set(u.x+Math.sin(t*.6+u.p)*.7,y,u.z+Math.cos(t*.5+u.p)*.4);p.rotation.set(t*1.3+u.p,t+u.p,0);p.scale.setScalar(Math.max(.001,1-night));});
  trees.forEach((tr,i)=>tr.rotation.z=Math.sin(t*.8+i)*.015);
  chars[4].plat.crys.forEach((m,i)=>{const s=1+.25*Math.sin(t*2+i);m.material.color.setRGB(.55+.35*night*s,.4+.1*night,1);});
  sunnyLight.position.copy(chars[0].root.position).add(tmp.set(0,1.4,.6));
  camera.position.copy(cp.p);
  //__CHARLOOP__
  if(noxHidden)chars[4].bob.scale.setScalar(.0001);
  for(let k=fx.length-1;k>=0;k--){const m=fx[k],u=m.userData;
    if(u.delay>0){u.delay-=dt;m.visible=false;continue;}m.visible=true;
    u.v.y+=u.g*dt;m.position.addScaledVector(u.v,dt);if(u.spin){m.rotation.x+=dt*6;m.rotation.y+=dt*8;}
    u.life-=dt;m.material.opacity=Math.max(u.life/u.max,0)*.95;if(u.grow)m.scale.multiplyScalar(1+u.grow*dt);
    if(u.life<=0){scene.remove(m);m.material.dispose();fx.splice(k,1);}}
  // camera + kick
  const kf=Math.floor((t-kickT)*FPS);let kx=0,kr=0;if(kf>=0&&kf<7){const a=(1-kf/7)*(kf%2?-1:1);kx=a*.07;kr=a*1.4*Math.PI/180;}
  camera.position.copy(cp.p).add(new V(kx,-kx*.6,0));camera.fov=cp.fov;camera.updateProjectionMatrix();camera.up.set(0,1,0);camera.lookAt(cp.l);camera.rotateZ(cp.roll+kr);
  const ff=(t-flashT)*FPS;grade.uniforms.flash.value=ff>=0&&ff<10?Math.pow(1-ff/10,1.6):0;
}
let simT=-1;
window.FILM={frames:TL.frames,
  frame(n,render=true){const t=n/FPS;if(simT<0){step(0,1/FPS);simT=0;}
    while(simT<n){simT++;step(simT/FPS,1/FPS);}
    if(render){composer.render();return canvas.toDataURL("image/png");}return null;}};
window.FILM_READY=true;
