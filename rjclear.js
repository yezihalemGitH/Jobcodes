(function(){
// Empties the Reporter Jobs fields that rj fills, so rj can be tested on a clean page.
// Keeps name, email and photo.
var base=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
var k=0,KEEP=/^(u_firstname|u_lastname|user_email_field|terms_cond_check)$|^jobsearch_field_(education|experience|lang)_|^jobsearch_(single_)?pdf|^jobsearch_excel/;
function clear(win){var d=win.document,$=win.jQuery,n=0;k=0;
function fire(e){['input','change'].forEach(function(t){e.dispatchEvent(new Event(t,{bubbles:true}))});if($)try{$(e).trigger('change').trigger('chosen:updated')}catch(x){}}
[].forEach.call(d.querySelectorAll('input,select,textarea'),function(e){var ty=(e.type||'').toLowerCase();if(!e.name||KEEP.test(e.name)||/hidden|submit|button|reset|image|password|file|checkbox|radio/.test(ty))return;
if(e.tagName=='SELECT'){var was=e.multiple?e.selectedOptions.length:e.selectedIndex>0;if(!was)return;if(e.multiple)[].forEach.call(e.options,function(o){o.selected=false});else e.selectedIndex=0}
else{if(!e.value)return;var p=e.tagName=='TEXTAREA'?win.HTMLTextAreaElement.prototype:win.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,'')}
fire(e);e.style.background='#ffe0e0';n++});
[].forEach.call(d.querySelectorAll('[name=jobsearch_field_resume_cover_letter],[name=user_bio]'),function(c){if(win.tinymce&&tinymce.editors)[].forEach.call(win.tinymce.editors,function(ed){try{if(ed.getElement()==c){ed.setContent('');ed.save()}}catch(x){}})});
// entries: remove each saved education / experience / language block from the form
var m=0;['education','experience','lang'].forEach(function(t){[].slice.call(d.querySelectorAll('[name="jobsearch_field_'+t+'_title[]"]')).forEach(function(e){var a=e;while(a.parentElement&&a.parentElement!=d.body&&a.parentElement.querySelectorAll('[name="jobsearch_field_'+t+'_title[]"]').length==1)a=a.parentElement;a.remove();m++})});
// skills: remove the tags next to the Add Skills box
var si=null;[].forEach.call(d.querySelectorAll('input[type=text]'),function(e){if(si||e.name||e.id)return;var l=(e.placeholder||'')+' '+((e.closest('label,li,div')||{}).innerText||'');if(/skill/i.test(l))si=e});
if(si){var ul=si.closest('ul');if(ul)[].slice.call(ul.children).forEach(function(li){if(!li.contains(si)){li.remove();k++}})}
// skills: click each tag's remove button
[].forEach.call(d.querySelectorAll('.tagit-close,a.tagit-close,[class*=skill] [class*=remove],[class*=skill] [class*=close],[class*=skill] [class*=delete]'),function(x){try{x.click();k++}catch(e){}});
return n+' fields emptied, '+m+' resume entries and '+k+' skills removed'}
function box(d,t){var b=d.createElement('div');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;border:2px solid #c00;border-radius:10px;padding:12px;font:15px sans-serif;white-space:pre-wrap';b.textContent=t+'\n\nCheck the page, then tick Terms and tap Save yourself.\n(Tap this box to close.)';b.onclick=function(){b.remove()};d.body.appendChild(b)}
if(/my-resume/.test(location.search)||document.querySelector('[name=user_phone],[name=u_firstname]'))return box(document,clear(window));
var old=document.getElementById('rjpanel');if(old)old.remove();
var P=document.createElement('div');P.id='rjpanel';P.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;font:15px sans-serif';
var bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;padding:6px;background:#c00';P.appendChild(bar);
var pages=[['Profile','dashboard-settings'],['Resume','my-resume']],frames=[],btns=[];
function show(i){frames.forEach(function(f,j){f.style.display=i<0||i==j?'block':'none';btns[j].style.background=i==j?'#fff':'#ffe0e0'})}
pages.forEach(function(p,i){var b=document.createElement('button');b.textContent=p[0];b.style.cssText='flex:1;padding:10px;border:0;border-radius:6px;font:bold 15px sans-serif';b.onclick=function(){show(i)};bar.appendChild(b);btns.push(b);
var f=document.createElement('iframe');f.style.cssText='flex:1;border:0;width:100%';f.src=location.origin+'/user-dashboard/?tab='+p[1];
f.onload=function(){if(f.done){b.textContent=p[0]+' (reloaded)';return}f.done=1;setTimeout(function(){try{box(f.contentDocument,clear(f.contentWindow));b.textContent=p[0]+' ✓'}catch(x){b.textContent=p[0]+' ✗';alert('rjclear could not empty '+p[0]+': '+x.message)}if(frames.every(function(g){return g.done}))setTimeout(function(){show(0)},3000)},1500)};
frames.push(f);P.appendChild(f)});
var x=document.createElement('button');x.textContent='Close';x.style.cssText='padding:10px;border:0;border-radius:6px;background:#fff';x.onclick=function(){P.remove()};bar.appendChild(x);
document.body.appendChild(P);show(-1);
})();
