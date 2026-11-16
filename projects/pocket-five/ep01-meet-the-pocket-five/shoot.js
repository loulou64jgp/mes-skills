const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1600,height:1600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve('portrait.html'));await p.waitForFunction('window.FILM_READY===true',null,{timeout:60000}).catch(()=>{});
if(errs.length){console.log(errs);process.exit(1);}
const names=["Sunny","Moka","Zippy","Nimi","Nox"];fs.mkdirSync('portraits',{recursive:true});
for(let i=0;i<5;i++){const d=await p.evaluate(i=>PORTRAIT(i),i);fs.writeFileSync(`portraits/${names[i]}.png`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();console.log('done');})();
