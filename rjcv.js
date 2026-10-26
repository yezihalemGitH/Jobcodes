(function(){
// Reporter Jobs CV Manager: uploads the CV PDF handed over in window.RJCV.
var D=window.RJ||{},log=[];
function box(t){var b=document.createElement('div');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;border:2px solid #1a7f37;border-radius:10px;padding:12px;font:15px sans-serif;white-space:pre-wrap';b.textContent=t+'\n\nCheck that your CV shows in the list. If the page has a Save or Upload button, tap it yourself.\n(Tap this box to copy it and close.)';b.onclick=function(){try{navigator.clipboard.writeText(b.textContent)}catch(x){}b.remove()};document.body.appendChild(b)}
if(!window.RJCV)return box('NO DATA: CV file could not be loaded.');
var D=window.RJ||{};
var Z=window.Dropzone,dz=Z&&Z.instances&&Z.instances[0];
try{var s0=atob(window.RJCV),a0=new Uint8Array(s0.length);for(var k0=0;k0<s0.length;k0++)a0[k0]=s0.charCodeAt(k0);var f0=new File([a0],(window.RJCVT&&RJCVT.name)||((D.imgName||'My')+'-CV.pdf'),{type:(window.RJCVT&&RJCVT.type)||'application/pdf'});
if(dz){dz.addFile(f0);return box('OK: CV handed to the uploader ('+a0.length+' bytes). Wait until it shows in your CV list.')}}catch(x){log.push('uploader: '+x.message)}
var fs=[].filter.call(document.querySelectorAll('input[type=file]'),function(e){return !/avatar|cover/i.test(e.name+' '+e.id)});
var e=fs.filter(function(x){return /cv|resume/i.test(x.name+' '+x.id+' '+x.className+' '+(x.accept||''))})[0]||fs.filter(function(x){return /pdf|doc/i.test(x.accept||'')})[0]||fs[0];
if(!e)return box('NOT FOUND: CV upload box. Inputs here: '+[].map.call(document.querySelectorAll('input[type=file]'),function(x){return x.name||x.id}).join(', '));
try{var s=atob(window.RJCV),a=new Uint8Array(s.length);for(var k=0;k<s.length;k++)a[k]=s.charCodeAt(k);var t=new DataTransfer();t.items.add(new File([a],(window.RJCVT&&RJCVT.name)||((D.imgName||'My')+'-CV.pdf'),{type:(window.RJCVT&&RJCVT.type)||'application/pdf'}));e.files=t.files;
['input','change'].forEach(function(x){e.dispatchEvent(new Event(x,{bubbles:true}))});box('OK: CV uploaded into "'+(e.name||e.id)+'" ('+a.length+' bytes)')}catch(x){box('FAILED: CV ('+x.message+')')}
})();
