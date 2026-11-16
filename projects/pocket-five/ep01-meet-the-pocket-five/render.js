const {chromium}=require(process.argv[2]+'/node_modules/playwright');
const fs=require('fs');const path=require('path');
(async()=>{
 const [ , , , from, to, outDir, step]=process.argv;const st=+(step||1);
 fs.mkdirSync(outDir,{recursive:true});
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1440,height:2560}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+path.resolve('film.html'));await p.waitForFunction('window.FILM_READY===true',null,{timeout:60000}).catch(()=>{});
 if(errs.length){console.log('ERR',errs.join('\n'));process.exit(1);}
 const t0=Date.now();
 for(let n=+from;n<=+to;n+=st){
   const f=path.join(outDir,`f_${String(n).padStart(5,'0')}.png`);
   if(fs.existsSync(f)){await p.evaluate(n=>FILM.frame(n,false),n);continue;}
   const LIST=process.env.LIST?process.env.LIST.split(',').map(Number):null;if(LIST&&!LIST.includes(n)){await p.evaluate(n=>FILM.frame(n,false),n);continue;}
   const d=await p.evaluate(n=>FILM.frame(n,true),n);
   fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));
   if(n%30===0)console.log('frame',n,((Date.now()-t0)/1000).toFixed(1)+'s');
 }
 if(errs.length)console.log('ERR',errs.join('\n'));await b.close();})();
