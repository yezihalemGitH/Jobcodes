(function(){
// Reporter Jobs "My Resume" filler. Personal data comes from window.RJR, set by the bookmark.
var D=window.RJR||{},$=window.jQuery,log=[];
if(!D.cl){alert('rjresume: no data. Use the rjresume bookmark, not this file.');return}
function q(s){return document.querySelector(s)}
function vis(e){return !!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)}
function setv(e,v){var p=e.tagName=='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,v);['input','change'].forEach(function(x){e.dispatchEvent(new Event(x,{bubbles:true}))})}
// what is already saved
function vals(n){return [].map.call(document.querySelectorAll('[name="'+n+'[]"]'),function(e){return e.value.trim()}).filter(Boolean)}
var ed=vals('jobsearch_field_education_title'),ex=vals('jobsearch_field_experience_title'),co=vals('jobsearch_field_experience_company'),la=vals('jobsearch_field_lang_title');

function key(e,k){['keydown','keypress','keyup'].forEach(function(x){e.dispatchEvent(new KeyboardEvent(x,{key:k==13?'Enter':',',keyCode:k,which:k,bubbles:true}))});if($)try{$(e).trigger($.Event('keydown',{keyCode:k,which:k}))}catch(x){}}
function addOne(){if(i>=todo.length){log.splice(1,0,si?'OK: Skills ('+todo.length+' added, '+((D.sk||[]).length-todo.length)+' already there)':'NOT FOUND: Skills box');return done()}
var s=todo[i++];si.focus();
if(ul&&ul.length){try{ul.tagit('createTag',s);return setTimeout(addOne,200)}catch(x){}}
setv(si,s);key(si,13);
setTimeout(function(){if(si.value==s){var b=null,a=si.parentElement;for(var d=0;d<3&&a&&!b;d++){b=[].filter.call(a.querySelectorAll('button,a,input[type=button],span,i'),function(x){return x!=si&&/^\s*(\+|add)/i.test((x.innerText||x.value||x.className||'').trim())})[0];a=a.parentElement}if(b)b.click();else key(si,188)}setTimeout(addOne,300)},300)}
function done(){var cc=q('[name=jobsearch_field_resume_cover_letter]');log.push('','CHECK: cover letter box now has '+(cc?cc.value.length:'no')+' characters; skills area shows: '+(box?box.innerText.replace(/\s+/g,' ').trim().slice(0,200):'-'));var ed=vals('jobsearch_field_education_title'),ex=vals('jobsearch_field_experience_title'),co=vals('jobsearch_field_experience_company'),la=vals('jobsearch_field_lang_title');log.push('','SAVED ON YOUR RESUME:','Education ('+ed.length+'): '+ed.join('; '),'Experience ('+ex.length+'):');
ex.forEach(function(t,i){log.push('- '+t+(co[i]?' @ '+co[i]:''))});
log.push('Languages ('+la.length+'): '+la.join(', '));var b=document.createElement('div');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;border:2px solid #1a7f37;border-radius:10px;padding:12px;font:15px sans-serif;white-space:pre-wrap;max-height:55vh;overflow:auto';
b.textContent=log.join('\n')+'\n\nTap this box to copy it, then paste it to Claude so the saved entries can be checked.\nThen tick the Terms box yourself and tap Save.';b.onclick=function(){try{navigator.clipboard.writeText(b.textContent)}catch(x){}b.remove()};document.body.appendChild(b)}
// entries: add the education, experience and language items not already saved
var have2={edu:ed,expr:ex,lang:la},NM={edu:'Education',expr:'Experience',lang:'Language'},add=[],j=0;
function byId(id){return document.getElementById(id)}
function setId(id,v){var e=byId(id);if(!e)return null;if(e.tagName=='SELECT')[].forEach.call(e.options,function(o){if(o.text.trim().toLowerCase()==v.toLowerCase())e.value=o.value});else setv(e,v);e.dispatchEvent(new Event('blur',{bubbles:true}));if($)try{$(e).trigger('change')}catch(x){}return e}
function btn(el){var a=el.parentElement;while(a&&a!=document.body){var bs=a.querySelectorAll('button,input[type=submit],input[type=button],a');for(var k=0;k<bs.length;k++){var t=(bs[k].innerText||bs[k].value||'').trim();if(/^(\+\s*)?(add|save|submit|update)\b/i.test(t)&&!/cancel|close/i.test(t))return bs[k]}a=a.parentElement}return null}
function items(){(D.items||[]).forEach(function(s){var h=have2[s[0]].map(function(x){return x.toLowerCase()});if(s[0]=='lang'&&[].some.call(document.querySelectorAll('body *:not(option):not(script)'),function(x){return [].filter.call(x.childNodes,function(t){return t.nodeType==3}).map(function(t){return t.textContent}).join('').trim().toLowerCase()==s[1].toLowerCase()&&vis(x)}))return;if(h.indexOf(s[1].toLowerCase())<0)add.push(s)});
if(!add.length){log.splice(2,0,'OK: Education, experience, languages (all there)');return phase2()}next()}
function next(){if(j>=add.length)return phase2();var s=add[j++],f;
if(s[0]=='lang'){f=setId('add-lang-title',s[1]);setId('add-lang-level',s[2]);setId('add-lang-percentage',s[3])}
else{var p='add-'+s[0]+'-';f=setId(p+'title',s[1]);setId(p+'date-start',s[2]);setId(p+'date-end',s[3]);setId(p+(s[0]=='edu'?'institute':'company'),s[4]);setId(p+'desc',s[5])}
var b=f&&btn(f);if(!b){log.splice(2,0,'NOT ADDED: '+NM[s[0]]+' '+s[1]);return next()}
b.click();log.splice(2,0,'OK: added '+NM[s[0]]+' '+s[1]);setTimeout(next,5000)}
function phase2(){
// cover letter: always rewritten so contact details stay current
c=q('[name=jobsearch_field_resume_cover_letter]');
if(c){setv(c,D.cl);if(window.tinymce&&tinymce.editors){[].forEach.call(tinymce.editors,function(ed){try{if(ed.getElement()==c){ed.setContent(D.cl.replace(/\n/g,'<br>'));ed.save()}}catch(x){}})}c.style.background='#d7f5dd';log.push('OK: Cover letter')}else log.push('NOT FOUND: Cover letter');
// skills: add only the ones not already there
si=null;[0,1].forEach(function(pass){[].forEach.call(document.querySelectorAll('input[type=text]'),function(e){if(si||e.name||e.id||(!pass&&!vis(e)))return;var l=(e.placeholder||'')+' '+((e.closest('label,li,div')||{}).innerText||'');if(/skill/i.test(l))si=e})});
box=si&&(si.closest('ul')||si.parentElement.parentElement);have=box?box.innerText.toLowerCase():'';
todo=(D.sk||[]).filter(function(s){return have.indexOf(s.toLowerCase())<0});i=0;
ul=$&&$.fn.tagit&&si?$(si).closest('ul.tagit'):null;
if(si)addOne();else{log.splice(1,0,'NOT FOUND: Skills box');done()}}
var c,si,box,have,todo,i=0,ul;
items();
})();
