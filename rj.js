(function(){
// Reporter Jobs one-tap filler. On the profile or resume page it fills that page;
// anywhere else on the site it opens both pages in a panel and fills them there.
var base=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function run(win,f){var d=win.document;win.RJ=window.RJ;win.RJR=window.RJR;var s=d.createElement('script');s.src=base+f+'.js';d.body.appendChild(s)}
if(/my-resume/.test(location.search))return run(window,'rjresume');
if(document.querySelector('[name=user_phone],[name=u_firstname]'))return run(window,'rjfix');
var old=document.getElementById('rjpanel');if(old)old.remove();
var P=document.createElement('div');P.id='rjpanel';
P.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;font:15px sans-serif';
var bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;padding:6px;background:#1a7f37';P.appendChild(bar);
var pages=[['Profile','dashboard-settings','rjfix'],['Resume','my-resume','rjresume']],frames=[],btns=[];
function show(i){frames.forEach(function(f,j){f.style.display=i<0||i==j?'block':'none';btns[j].style.background=i==j?'#fff':'#d7f5dd'})}
pages.forEach(function(p,i){var b=document.createElement('button');b.textContent=p[0];b.style.cssText='flex:1;padding:10px;border:0;border-radius:6px;font:bold 15px sans-serif';b.onclick=function(){show(i)};bar.appendChild(b);btns.push(b);
var f=document.createElement('iframe');f.style.cssText='flex:1;border:0;width:100%';f.src=location.origin+'/user-dashboard/?tab='+p[1];
f.onload=function(){if(f.done){b.textContent=p[0]+' (reloaded)';return}f.done=1;try{run(f.contentWindow,p[2]);b.textContent=p[0]+' \u2713';if(frames.every(function(g){return g.done}))setTimeout(function(){show(0)},10000)}catch(x){b.textContent=p[0]+' \u2717';alert('rj could not fill '+p[0]+': '+x.message)}};
frames.push(f);P.appendChild(f)});
var x=document.createElement('button');x.textContent='Close';x.style.cssText='padding:10px;border:0;border-radius:6px;background:#fff';x.onclick=function(){P.remove()};bar.appendChild(x);
document.body.appendChild(P);show(-1);
alert('rj is filling your Profile and Resume. Wait about 10 seconds, then use the buttons at the top to switch. On each one: check it, tick Terms, tap Save.');
})();
