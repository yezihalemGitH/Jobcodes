(function(){
// Reporter Jobs "My Resume" filler. Personal data comes from window.RJR, set by the bookmark.
var D=window.RJR||{},$=window.jQuery,log=[];
if(!D.cl){alert('rjresume: no data. Use the rjresume bookmark, not this file.');return}
function q(s){return document.querySelector(s)}
function vis(e){return !!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)}
function setv(e,v){var p=e.tagName=='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,v);['input','change'].forEach(function(x){e.dispatchEvent(new Event(x,{bubbles:true}))})}
// cover letter: always rewritten so contact details stay current
var c=q('[name=jobsearch_field_resume_cover_letter]');
if(c){setv(c,D.cl);if(window.tinymce&&tinymce.editors){[].forEach.call(tinymce.editors,function(ed){try{if(ed.getElement()==c){ed.setContent(D.cl.replace(/\n/g,'<br>'));ed.save()}}catch(x){}})}c.style.background='#d7f5dd';log.push('OK: Cover letter')}else log.push('NOT FOUND: Cover letter');
// what is already saved
function vals(n){return [].map.call(document.querySelectorAll('[name="'+n+'[]"]'),function(e){return e.value.trim()}).filter(Boolean)}
var ed=vals('jobsearch_field_education_title'),ex=vals('jobsearch_field_experience_title'),co=vals('jobsearch_field_experience_company'),la=vals('jobsearch_field_lang_title');
log.push('','SAVED ON YOUR RESUME:','Education ('+ed.length+'): '+ed.join('; '),'Experience ('+ex.length+'):');
ex.forEach(function(t,i){log.push('- '+t+(co[i]?' @ '+co[i]:''))});
log.push('Languages ('+la.length+'): '+la.join(', '));
// skills: add only the ones not already there
var si=null;[0,1].forEach(function(pass){[].forEach.call(document.querySelectorAll('input[type=text]'),function(e){if(si||e.name||e.id||(!pass&&!vis(e)))return;var l=(e.placeholder||'')+' '+((e.closest('label,li,div')||{}).innerText||'');if(/skill/i.test(l))si=e})});
var box=si&&(si.closest('ul')||si.parentElement.parentElement),have=box?box.innerText.toLowerCase():'';
var todo=(D.sk||[]).filter(function(s){return have.indexOf(s.toLowerCase())<0}),i=0;
var ul=$&&$.fn.tagit&&si?$(si).closest('ul.tagit'):null;
function key(e,k){['keydown','keypress','keyup'].forEach(function(x){e.dispatchEvent(new KeyboardEvent(x,{key:k==13?'Enter':',',keyCode:k,which:k,bubbles:true}))});if($)try{$(e).trigger($.Event('keydown',{keyCode:k,which:k}))}catch(x){}}
function addOne(){if(i>=todo.length){log.splice(1,0,si?'OK: Skills ('+todo.length+' added, '+((D.sk||[]).length-todo.length)+' already there)':'NOT FOUND: Skills box');return done()}
var s=todo[i++];si.focus();
if(ul&&ul.length){try{ul.tagit('createTag',s);return setTimeout(addOne,200)}catch(x){}}
setv(si,s);key(si,13);
setTimeout(function(){if(si.value==s){var b=null,a=si.parentElement;for(var d=0;d<3&&a&&!b;d++){b=[].filter.call(a.querySelectorAll('button,a,input[type=button],span,i'),function(x){return x!=si&&/^\s*(\+|add)/i.test((x.innerText||x.value||x.className||'').trim())})[0];a=a.parentElement}if(b)b.click();else key(si,188)}setTimeout(addOne,300)},300)}
function done(){var b=document.createElement('div');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;border:2px solid #1a7f37;border-radius:10px;padding:12px;font:15px sans-serif;white-space:pre-wrap;max-height:55vh;overflow:auto';
b.textContent=log.join('\n')+'\n\nTap this box to copy it, then paste it to Claude so the saved entries can be checked.\nThen tick the Terms box yourself and tap Save.';b.onclick=function(){try{navigator.clipboard.writeText(b.textContent)}catch(x){}b.remove()};document.body.appendChild(b)}
if(si)addOne();else{log.splice(1,0,'NOT FOUND: Skills box');done()}
})();
