import re,sys
src=open(sys.argv[1]).read();import os
tail=open(os.environ.get("TAIL","film_tail.js")).read()
def cut(a,b):i=src.index(a);j=src.index(b,i);return src[i:j]
A=cut("// ================= THREE: materials","// ================= BUBBLES & TALK")
B=cut("// ================= DAY / NIGHT","const dnBtn")
loop=cut("  chars.forEach((c,i)=>{\n    const amp","\n  // particles")
data=cut("const CAST=[","// ================= AUDIO")
A=A.replace("new THREE.WebGLRenderer({canvas,antialias:true})",("new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true})" if os.environ.get("TAIL") else "new THREE.WebGLRenderer({canvas,antialias:false,preserveDrawingBuffer:true})"))
A=A.replace("renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));","")
loop=loop.replace('(speaker>=0&&speaker!==i&&bubbles[speaker].el.classList.contains("show")?speaker:null)',"null")
loop=loop.replace("else if(ptr.in){lookY=ptr.x*.45;lookX=ptr.y*.15;}","else if(1){c.root.getWorldPosition(tmp);lookY=Math.max(-1,Math.min(1,Math.atan2(camera.position.x-tmp.x,camera.position.z-tmp.z)-c.root.rotation.y));lookX=-.05;}")
loop=loop.replace("c.rig.talking=bubbles[i].typing;","c.rig.talking=talkingNow(i,t);")
assert "talkingNow" in loop and "bubbles" not in loop
pre="""let __s=12345;Math.random=()=>(__s=(__s*16807)%2147483647)/2147483647;
let FT=0;const now=()=>FT;const SFX=new Proxy({},{get:()=>()=>{}});
"""
tail=tail.replace("  //__CHARLOOP__",loop)
html=f"""<!doctype html><html><head><meta charset="utf-8"><style>@font-face{{font-family:'Mochiy Pop One';src:url(fonts/node_modules/@fontsource/mochiy-pop-one/files/mochiy-pop-one-latin-400-normal.woff2)}}@font-face{{font-family:MPR;font-weight:800;src:url(fonts/node_modules/@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-latin-800-normal.woff2)}}html,body{{margin:0;background:#000}}canvas{{display:block;width:1440px;height:2560px}}</style></head><body>
<canvas id="c" width="1440" height="2560"></canvas><div style="font-family:'Mochiy Pop One'">a</div><div style="font-family:MPR;font-weight:800">a</div>
<script src="lib/three.min.js"></script><script src="lib/CopyShader.js"></script><script src="lib/LuminosityHighPassShader.js"></script>
<script src="lib/EffectComposer.js"></script><script src="lib/RenderPass.js"></script><script src="lib/ShaderPass.js"></script><script src="lib/UnrealBloomPass.js"></script>
<script>window.__TL=null;</script><script src="timeline.js"></script>
<script>(function(){{\n{data}\n{pre}\n{A}\n{B}\n{tail}\n}})();</script></body></html>"""
open(os.environ.get("OUT","film.html"),"w").write(html);print("ok",len(html))
