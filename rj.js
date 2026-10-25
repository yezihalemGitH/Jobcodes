(async function(){
// Reporter Jobs one-tap filler. On the profile or resume page it fills that page;
// anywhere else on the site it opens Profile, Resume and CV Manager in a panel and fills them there.
// CV and photo are stored encrypted in this repo; the key lives only in the user's bookmark.
var base=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function run(win,f){var d=win.document;win.RJ=window.RJ;win.RJR=window.RJR;win.RJCV=window.RJCV;var s=d.createElement('script');s.src=base+f+'.js';d.body.appendChild(s)}
if(window.RJZ&&!window.RJ){try{var z=Uint8Array.from(atob(window.RJZ),function(c){return c.charCodeAt(0)});
var o=JSON.parse(await new Response(new Blob([z]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());window.RJ=o.RJ;window.RJR=o.RJR}catch(x){alert('rj: could not unpack data ('+x.message+')');return}}
if(window.RJP&&window.RJ&&!window.RJ.img){try{var im=new Image();im.src='data:image/webp;base64,'+window.RJP;await im.decode();var cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;cv.getContext('2d').drawImage(im,0,0);window.RJ.img=cv.toDataURL('image/jpeg',0.92).split(',')[1]}catch(x){}}
function b64(u){var s='';for(var i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
async function dec(n){var r=await fetch(base+n);if(!r.ok)throw Error(n+' '+r.status);var b=new Uint8Array(await r.arrayBuffer());var k=await crypto.subtle.importKey('raw',Uint8Array.from(atob(window.RJK),function(c){return c.charCodeAt(0)}),'AES-GCM',false,['decrypt']);return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},k,b.slice(12)))}
if(window.RJK){try{if(window.RJ&&!window.RJ.img)window.RJ.img=b64(await dec('photo.bin'))}catch(x){}try{if(!window.RJCV)window.RJCV=b64(await dec('cv.bin'))}catch(x){}}
if(/cv-manager/.test(location.search))return run(window,'rjcv');
if(/my-resume/.test(location.search))return run(window,'rjresume');
if(document.querySelector('[name=user_phone],[name=u_firstname]'))return run(window,'rjfix');
var old=document.getElementById('rjpanel');if(old)old.remove();
var P=document.createElement('div');P.id='rjpanel';
P.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;font:15px sans-serif';
var bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;padding:6px;background:#1a7f37';P.appendChild(bar);
var cvl=[].filter.call(document.querySelectorAll('a[href*="tab="]'),function(a){return /cv\s*manager/i.test(a.textContent)})[0],cvt=cvl?(cvl.href.match(/tab=([^&#]+)/)||[])[1]:'cv-manager';
var pages=[['Profile','dashboard-settings','rjfix'],['Resume','my-resume','rjresume'],['CV','cv-manager','rjcv']];pages[2][1]=cvt||'cv-manager',frames=[],btns=[];
function show(i){frames.forEach(function(f,j){f.style.display=i<0||i==j?'block':'none';btns[j].style.background=i==j?'#fff':'#d7f5dd'})}
pages.forEach(function(p,i){var b=document.createElement('button');b.textContent=p[0];b.style.cssText='flex:1;padding:10px;border:0;border-radius:6px;font:bold 15px sans-serif';b.onclick=function(){show(i)};bar.appendChild(b);btns.push(b);
var f=document.createElement('iframe');f.style.cssText='flex:1;border:0;width:100%';f.src=location.origin+'/user-dashboard/?tab='+p[1];
f.onload=function(){if(f.done){b.textContent=p[0]+' (reloaded)';return}f.done=1;try{run(f.contentWindow,p[2]);b.textContent=p[0]+' \u2713';if(frames.every(function(g){return g.done}))setTimeout(function(){show(0)},10000)}catch(x){b.textContent=p[0]+' \u2717';alert('rj could not fill '+p[0]+': '+x.message)}};
frames.push(f);P.appendChild(f)});
var x=document.createElement('button');x.textContent='Close';x.style.cssText='padding:10px;border:0;border-radius:6px;background:#fff';x.onclick=function(){P.remove()};bar.appendChild(x);
document.body.appendChild(P);show(-1);
alert('rj is filling your Profile, Resume and CV. Wait about 10 seconds, then use the buttons at the top to switch. On each one: check it, tick Terms, tap Save.');
})();
