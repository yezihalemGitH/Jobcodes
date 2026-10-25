(function(){
// Reporter Jobs profile filler. Personal data comes from window.RJ, set by the bookmark.
var D=window.RJ||{},log=[],$=window.jQuery;
if(!D.first){alert('rjfix: no data. Use the rjfix bookmark, not this file.');return}
function q(s){return document.querySelector(s)}
function fire(e){['input','change','blur'].forEach(function(t){e.dispatchEvent(new Event(t,{bubbles:true}))});if($)try{$(e).trigger('change').trigger('chosen:updated')}catch(x){}}
function txt(sel,v,n){var e=q(sel);if(!e){log.push('NOT FOUND: '+n);return}
var d=Object.getOwnPropertyDescriptor((e.tagName=='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement).prototype,'value');d.set.call(e,v);fire(e);e.style.background='#d7f5dd';log.push('OK: '+n)}
function pick(sel,re,n,only,unre){var e=q(sel);if(!e){log.push('NOT FOUND: '+n);return false}var ok=0;
[].forEach.call(e.options,function(o){var t=o.text.trim();if(unre&&unre.test(t))o.selected=false;if(!ok||e.multiple){if(re.test(t)&&(!only||!ok)){o.selected=true;ok=1;if(!e.multiple)e.value=o.value}}});
if(ok){fire(e);log.push('OK: '+n)}else log.push('NO MATCH: '+n+' (choices: '+[].slice.call(e.options,0,12).map(function(o){return o.text.trim()}).join(', ')+')');return !!ok}
function ifEmpty(sel,v,n){var e=q(sel);if(e&&!e.value)txt(sel,v,n);else if(e)log.push('OK (already): '+n);else log.push('NOT FOUND: '+n)}
function photo(){var e=q('input[type=file][name=user_avatar]')||q('input[type=file][name*=avatar]');if(!e){log.push('NOT FOUND: Photo');return}if(!D.img){log.push('NO DATA: Photo');return}
try{var s=atob(D.img),a=new Uint8Array(s.length);for(var k=0;k<s.length;k++)a[k]=s.charCodeAt(k);var t=new DataTransfer();t.items.add(new File([a],(D.imgName||'photo')+'.jpg',{type:'image/jpeg'}));e.files=t.files;e.dispatchEvent(new Event('change',{bubbles:true}));log.push('OK: Photo')}catch(x){log.push('FAILED: Photo ('+x.message+')')}}
photo();
ifEmpty('[name=u_firstname]',D.first,'First name');
ifEmpty('[name=u_lastname]',D.last,'Last name');
ifEmpty('[name=user_email_field]',D.email,'Email');
pick('select[name^=gender]',new RegExp('^\\s*'+D.gender,'i'),'Gender',1);
pick('select[name=marital-status]',new RegExp(D.marital,'i'),'Marital status',1);
pick('select[name=maximum-level-of-education]',/bachelor/i,'Education level',1);
pick('select[name=career-level]',/senior/i,'Career level',1);
pick('select[name=employment-type]',/full/i,'Employment type',1);
txt('[name=total-years-of-experience]',D.years,'Years of experience');
txt('[name=current-recent-employer]',D.employer,'Current/recent employer');
pick('[name="user_sector[]"]',/construction and architecture/i,'Sector Construction');
txt('[name=jobsearch_field_user_dob_whole]',D.dob,'Date of birth');
txt('[name=user_phone]',D.phone,'Phone');
txt('[name=jobsearch_field_candidate_jobtitle]',D.title,'Job title');
txt('[name=cand_user_twitter_url]',D.twitter,'Twitter');
var R=window.RJR||{},bio=D.bio||(R.cl?R.cl.split(/\n\n/).slice(1,3).join('\n\n'):'');
if(bio){txt('[name=user_bio]',bio,'Summary about yourself');var be=q('[name=user_bio]');if(be&&window.tinymce&&tinymce.editors)[].forEach.call(tinymce.editors,function(ed){try{if(ed.getElement()==be){ed.setContent(bio.replace(/\n/g,'<br>'));ed.save()}}catch(x){}})}
var fs=q('select[name^="field-name-"]');if(fs){pick('select[name="'+fs.name+'"]',/^civil engineering$/i,'Field of study',1,/bio-?chemical/i)||pick('select[name="'+fs.name+'"]',/^civil/i,'Field of study',1,/bio-?chemical/i)}else log.push('NOT FOUND: Field of study');
pick('[name="user_sector[]"]',/^engineering$/i,'Sector + Engineering');
var c=q('[name=jobsearch_field_location_location1]');
function step(sel,re,n,next,tries){tries=tries||0;var e=q(sel);if(e&&e.options.length>1){pick(sel,re,n,1);next&&setTimeout(next,1500)}else if(tries<25)setTimeout(function(){step(sel,re,n,next,tries+1)},700);else{log.push('NOT LOADED: '+n);next&&next()}}
function left(){var why={'current-recent-salary':'salary: left empty on purpose (optional)',cand_user_facebook_url:'Facebook: optional, send me your link if you have one',cand_user_linkedin_url:'LinkedIn: optional, send me your link if you have one',candidate_dynm_social0:'Instagram: optional',candidate_dynm_social1:'Telegram: optional, send me your @username if you want it',terms_cond_check:'Terms box: you tick it'},r=[],seen={};
[].forEach.call(document.querySelectorAll('input,select,textarea'),function(e){var ty=(e.type||'').toLowerCase();if(/hidden|submit|button|reset|image|password/.test(ty)||!e.name)return;if(!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&e.tagName!='SELECT')return;
var empty=ty=='checkbox'||ty=='radio'?!e.checked:ty=='file'?!(e.files&&e.files.length):e.tagName=='SELECT'?!(e.multiple?e.selectedOptions.length:e.selectedIndex>0):!e.value;if(!empty)return;
var k=Object.keys(why).filter(function(x){return e.name.indexOf(x)==0})[0];var m=k?why[k]:'UNKNOWN: '+e.name+' ('+((e.labels&&e.labels[0]&&e.labels[0].innerText)||e.placeholder||'')+')';if(!seen[m]){seen[m]=1;r.push(m)}});
return r}
function done(){var L=left();log.push('','STILL EMPTY ('+L.length+'):');L.forEach(function(x){log.push('- '+x)});var b=document.createElement('div');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;border:2px solid #1a7f37;border-radius:10px;padding:12px;font:15px sans-serif;white-space:pre-wrap;max-height:55vh;overflow:auto';
b.textContent=log.join('\n')+'\n\nCopy this box to Claude if any line says UNKNOWN or NOT FOUND.\nNow check the page, tick the Terms box yourself and tap Save.\n(Tap this box to copy it and close.)';b.onclick=function(){try{navigator.clipboard.writeText(b.textContent)}catch(x){}b.remove()};document.body.appendChild(b)}
if(c){pick('[name=jobsearch_field_location_location1]',/ethiopia/i,'Country',1);setTimeout(function(){step('[name=jobsearch_field_location_location2]',/addis/i,'Region',function(){step('[name=jobsearch_field_location_location3]',/addis/i,'City',done)})},1500)}else{log.push('NOT FOUND: Country');done()}
})();
