const S2=1600;renderer.setPixelRatio(1);renderer.setSize(S2,S2,false);renderer.setClearColor(0x000000,0);
const bloom=null,grade=null;camera.fov=28;camera.aspect=1;camera.updateProjectionMatrix();
applySky(0);scene.fog=null;RIM.strength.value=.35;
const keep=new Set([hemi,sun,sun.target]);
window.PORTRAIT=(i)=>{
  scene.children.forEach(o=>{o.visible=keep.has(o)||o===chars[i].root;});
  const c=chars[i];c.plat.p.visible=false;c.root.rotation.y=0;c.g.rotation.set(0,i===4?.15:.28,0);
  c.ex.bulb&&(c.ex.bulb.scale.setScalar(i===3?1:0));
  const ex=["happy","sleepy","neutral","neutral","smug"][i];c.rig.exprUntil=0;c.rig.cfg.def=ex;c.rig.blinkAt=1e9;c.rig.talking=false;updateRig(c.rig,1);
  if(i===0)c.ex.rays.rotation.z=.1;
  if(i===4){c.ex.crystals.children.forEach((m,k)=>{const an=m.userData.a+.6;m.position.set(Math.cos(an)*.95,.35,Math.sin(an)*.95);});}
  const b=new THREE.Box3().setFromObject(c.root),ctr=b.getCenter(new V()),sz=b.getSize(new V());
  const d=Math.max(sz.y,sz.x)*1.18/(2*Math.tan(14*Math.PI/180));
  camera.position.set(ctr.x+d*.12,ctr.y+d*.1,ctr.z+d);camera.lookAt(ctr);
  sun.position.set(ctr.x+6,ctr.y+10,ctr.z+8);sun.target.position.copy(ctr);
  renderer.render(scene,camera);return canvas.toDataURL("image/png");};
window.FILM_READY=true;
