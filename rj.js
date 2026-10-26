(async function(){
// Reporter Jobs one-tap filler. On the profile, resume or CV page it fills that page;
// anywhere else on the site it opens Profile, Resume and CV Manager in a panel and fills them there.
// The photo and CV live only on the user's phone: picked once, kept in this site's browser storage (IndexedDB).
var base=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function run(win,f){var d=win.document;win.RJ=window.RJ;win.RJR=window.RJR;win.RJCV=window.RJCV;win.RJCVT=window.RJCVT;var s=d.createElement('script');s.src=base+f+'.js';d.body.appendChild(s)}
if(window.RJZ&&!window.RJ){try{var z=Uint8Array.from(atob(window.RJZ),function(c){return c.charCodeAt(0)});
var o=JSON.parse(await new Response(new Blob([z]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());window.RJ=o.RJ;window.RJR=o.RJR}catch(x){alert('rj: could not unpack data ('+x.message+')');return}}
function b64(u){var s='';for(var i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
// phone storage
function db(){return new Promise(function(ok,no){var r=indexedDB.open('reporterfill',1);r.onupgradeneeded=function(){r.result.createObjectStore('f')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}})}
async function get(k){var d=await db();return new Promise(function(ok){var r=d.transaction('f').objectStore('f').get(k);r.onsuccess=function(){ok(r.result||null)};r.onerror=function(){ok(null)}})}
async function put(k,v){var d=await db();return new Promise(function(ok,no){var t=d.transaction('f','readwrite');t.objectStore('f').put(v,k);t.oncomplete=function(){ok()};t.onerror=function(){no(t.error)}})}
async function jpeg(file){try{var bm=await createImageBitmap(file),sc=Math.min(1,800/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.round(bm.width*sc);c.height=Math.round(bm.height*sc);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);return await new Promise(function(ok){c.toBlob(ok,'image/jpeg',0.9)})}catch(x){return file}}
function setup(have){return new Promise(function(done){var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font:16px sans-serif';
o.innerHTML='<div style="background:#fff;border-radius:12px;padding:18px;max-width:420px;width:90%"><b style="font-size:18px">rj: your photo and CV</b><p>Pick them once. They stay on this phone only, and rj uses them every time.</p>'+
'<p><b>Photo</b> '+(have.photo?'(saved, pick again to change)':'')+'<br><input type=file accept="image/*" id=rjph></p><p><b>CV</b> (PDF or Word) '+(have.cv?'(saved, pick again to change)':'')+'<br><input type=file accept=".pdf,.doc,.docx" id=rjcvf></p>'+
'<button id=rjsave style="width:100%;padding:12px;border:0;border-radius:8px;background:#1a7f37;color:#fff;font:bold 16px sans-serif">Save and continue</button><p id=rjmsg style="color:#b00"></p></div>';
document.body.appendChild(o);o.querySelector('#rjsave').onclick=async function(){var p=o.querySelector('#rjph').files[0],c=o.querySelector('#rjcvf').files[0],m=o.querySelector('#rjmsg');
if(!(p||have.photo)||!(c||have.cv)){m.textContent='Please pick both your photo and your CV.';return}
try{if(p)await put('photo',await jpeg(p));if(c)await put('cv',{blob:c,name:c.name,type:c.type||'application/pdf'});o.remove();done()}catch(x){m.textContent='Could not save: '+x.message}}})}
async function load(force){var ph=await get('photo'),cv=await get('cv');if(force||!ph||!cv){await setup({photo:!!ph,cv:!!cv});ph=await get('photo');cv=await get('cv')}
if(window.RJ&&ph)window.RJ.img=b64(new Uint8Array(await ph.arrayBuffer()));if(cv){window.RJCV=b64(new Uint8Array(await cv.blob.arrayBuffer()));window.RJCVT={name:cv.name,type:cv.type}}}
try{await load(false)}catch(x){alert('rj: phone storage is not available ('+x.message+'). Photo and CV will be skipped.')}
if(/cv-manager/.test(location.search))return run(window,'rjcv');
if(/my-resume/.test(location.search))return run(window,'rjresume');
if(document.querySelector('[name=user_phone],[name=u_firstname]'))return run(window,'rjfix');
var old=document.getElementById('rjpanel');if(old)old.remove();
var P=document.createElement('div');P.id='rjpanel';
P.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;font:15px sans-serif';
var bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;padding:6px;background:#1a7f37';P.appendChild(bar);
var cvl=[].filter.call(document.querySelectorAll('a[href*="tab="]'),function(a){return /cv\s*manager/i.test(a.textContent)})[0],cvt=cvl?(cvl.href.match(/tab=([^&#]+)/)||[])[1]:'';
var pages=[['Profile','dashboard-settings','rjfix'],['Resume','my-resume','rjresume'],['CV',cvt||'cv-manager','rjcv']],frames=[],btns=[];
function show(i){frames.forEach(function(f,j){f.style.display=i<0||i==j?'block':'none';btns[j].style.background=i==j?'#fff':'#d7f5dd'})}
pages.forEach(function(p,i){var b=document.createElement('button');b.textContent=p[0];b.style.cssText='flex:1;padding:10px 4px;border:0;border-radius:6px;font:bold 14px sans-serif';b.onclick=function(){show(i)};bar.appendChild(b);btns.push(b);
var f=document.createElement('iframe');f.style.cssText='flex:1;border:0;width:100%';f.src=location.origin+'/user-dashboard/?tab='+p[1];
f.onload=function(){if(f.done){b.textContent=p[0]+' (reloaded)';return}f.done=1;try{run(f.contentWindow,p[2]);b.textContent=p[0]+' ✓';if(frames.every(function(g){return g.done}))setTimeout(function(){show(0)},10000)}catch(x){b.textContent=p[0]+' ✗';alert('rj could not fill '+p[0]+': '+x.message)}};
frames.push(f);P.appendChild(f)});
var fb=document.createElement('button');fb.textContent='Files';fb.style.cssText='padding:10px 6px;border:0;border-radius:6px;background:#fff';fb.onclick=function(){load(true).then(function(){alert('Saved. Run rj again to use the new files.')})};bar.appendChild(fb);
var x=document.createElement('button');x.textContent='Close';x.style.cssText='padding:10px 6px;border:0;border-radius:6px;background:#fff';x.onclick=function(){P.remove()};bar.appendChild(x);
document.body.appendChild(P);show(-1);
alert('rj is filling your Profile, Resume and CV. Wait about 1 minute, then use the buttons at the top to switch. On each one: check it, tick Terms, tap Save.');
})();
