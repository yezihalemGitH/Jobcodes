(function(){
// Reporter Jobs profile filler. Personal data comes from window.RJ, set by the bookmark.
var D=window.RJ||{},log=[],$=window.jQuery;
if(!D.first&&!window.RFONLY){alert('rjfix: no data. Use the ReporterFill bookmark, not this file.');return}
function q(s){return document.querySelector(s)}
function fire(e){['input','change','blur'].forEach(function(t){e.dispatchEvent(new Event(t,{bubbles:true}))});if($)try{$(e).trigger('change').trigger('chosen:updated')}catch(x){}}
function txt(sel,v,n){var e=q(sel);if(!e){log.push('NOT FOUND: '+n);return}
var d=Object.getOwnPropertyDescriptor((e.tagName=='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement).prototype,'value');d.set.call(e,v);fire(e);e.style.background='#d7f5dd';log.push('OK: '+n)}
function pick(sel,re,n,only,unre){var e=q(sel);if(!e){log.push('NOT FOUND: '+n);return false}var ok=0,before=e.multiple?null:e.value;
[].forEach.call(e.options,function(o){var t=o.text.trim();if(unre&&unre.test(t))o.selected=false;if(!ok||e.multiple){if(re.test(t)&&(!only||!ok)){o.selected=true;ok=1;if(!e.multiple)e.value=o.value}}});
if(ok){if(e.multiple||e.value!=before)fire(e);log.push('OK: '+n)}else log.push('NO MATCH: '+n+' (choices: '+[].slice.call(e.options,0,12).map(function(o){return o.text.trim()}).join(', ')+')');return !!ok}
function ifEmpty(sel,v,n){var e=q(sel);if(e&&!e.value)txt(sel,v,n);else if(e)log.push('OK (already): '+n);else log.push('NOT FOUND: '+n)}
function photo(){var e=q('input[type=file][name=user_avatar]')||q('input[type=file][name*=avatar]');if(!e){log.push('NOT FOUND: Photo');return}if(!D.img){log.push('NO DATA: Photo');return}
try{var s=atob(D.img),a=new Uint8Array(s.length);for(var k=0;k<s.length;k++)a[k]=s.charCodeAt(k);var t=new DataTransfer();t.items.add(new File([a],(D.imgName||'photo')+'.jpg',{type:'image/jpeg'}));e.files=t.files;e.dispatchEvent(new Event('change',{bubbles:true}));log.push('OK: Photo')}catch(x){log.push('FAILED: Photo ('+x.message+')')}}
function want(k){return !window.RFONLY||RFONLY.indexOf(k)>=0}
function norm(s){return String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function rx(v){return new RegExp('^'+norm(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i')}
// choose the option whose text matches v: exact, then starts with, then contains, then first word
function choose(sel,v,n,clear){var e=q(sel);if(!e){log.push('NOT FOUND: '+n);return}if(!v||(Array.isArray(v)&&!v.length)){log.push('NO DATA: '+n);return}
var vs=[].concat(v),os=[].slice.call(e.options).filter(function(o){return o.value!==''}),hit=[],miss=[];
if(e.multiple&&clear)os.forEach(function(o){o.selected=false});
vs.forEach(function(w){var t=norm(w),f=os.filter(function(o){return norm(o.text)==t})[0]||os.filter(function(o){return norm(o.text).indexOf(t)==0})[0]||os.filter(function(o){return norm(o.text).indexOf(t)>=0})[0]||os.filter(function(o){return t.split(' ')[0].length>3&&norm(o.text).indexOf(t.split(' ')[0])==0})[0];
if(f){f.selected=true;if(!e.multiple)e.value=f.value;hit.push(f.text.trim())}else miss.push(w)});
if(hit.length){fire(e);log.push('OK: '+n+(e.multiple?' ('+hit.join(', ')+')':''))}
if(miss.length)log.push('NO MATCH: '+n+' "'+miss.join(', ')+'" (choices: '+os.slice(0,12).map(function(o){return o.text.trim()}).join(', ')+')')}
if(want('photo'))photo();
if(want('personal')){txt('[name=u_firstname]',D.first,'First name');txt('[name=u_lastname]',D.last,'Last name');ifEmpty('[name=user_email_field]',D.email,'Email');
choose('select[name^=gender]',D.gender,'Gender');choose('select[name=marital-status]',D.marital,'Marital status');if(D.dob)txt('[name=jobsearch_field_user_dob_whole]',D.dob,'Date of birth')}
if(want('phone')&&D.phone)txt('[name=user_phone]',D.phone,'Phone');
if(want('work')){choose('select[name=maximum-level-of-education]',D.edulevel,'Education level');choose('select[name=career-level]',D.career,'Career level');choose('select[name=employment-type]',D.emptype,'Employment type');
if(D.years)txt('[name=total-years-of-experience]',D.years,'Years of experience');if(D.employer)txt('[name=current-recent-employer]',D.employer,'Current/recent employer');if(D.title)txt('[name=jobsearch_field_candidate_jobtitle]',D.title,'Job title');
var fs=q('select[name^="field-name-"]');if(fs)choose('select[name="'+fs.name+'"]',D.field?String(D.field).split(/\s*,\s*/):'','Field of study',1);else log.push('NOT FOUND: Field of study');
choose('[name="user_sector[]"]',D.sectors,'Sectors',1)}
if(want('links')){[['cand_user_twitter_url',D.twitter,'Twitter'],['cand_user_linkedin_url',D.linkedin,'LinkedIn'],['cand_user_facebook_url',D.facebook,'Facebook'],['candidate_dynm_social1',D.telegram,'Telegram']].forEach(function(l){if(l[1])txt('[name^='+l[0]+']',l[1],l[2])})}
var bio=D.bio;
if(want('bio')&&bio){txt('[name=user_bio]',bio,'Summary about yourself');var be=q('[name=user_bio]');if(be&&window.tinymce&&tinymce.editors)[].forEach.call(tinymce.editors,function(ed){try{if(ed.getElement()==be){ed.setContent(bio.replace(/\n/g,'<br>'));ed.save()}}catch(x){}})}
var c=q('[name=jobsearch_field_location_location1]');
function step(sel,re,n,next,tries){tries=tries||0;var e=q(sel);if(e&&e.options.length>1){pick(sel,re,n,1);next&&setTimeout(next,1500)}else if(tries<25){if(tries==4&&/location3/.test(sel)){var rg=q('[name=jobsearch_field_location_location2]');if(rg)fire(rg)}setTimeout(function(){step(sel,re,n,next,tries+1)},700)}else{log.push('NOT LOADED: '+n);next&&next()}}
function left(){var why={'current-recent-salary':'salary: left empty on purpose (optional)',cand_user_facebook_url:'Facebook: optional',cand_user_linkedin_url:'LinkedIn: optional',candidate_dynm_social0:'Instagram: optional',candidate_dynm_social1:'Telegram: optional',terms_cond_check:'Terms box: you tick it'},r=[],seen={};
[].forEach.call(document.querySelectorAll('input,select,textarea'),function(e){var ty=(e.type||'').toLowerCase();if(/hidden|submit|button|reset|image|password/.test(ty)||!e.name)return;if(!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&e.tagName!='SELECT')return;
var empty=ty=='checkbox'||ty=='radio'?!e.checked:ty=='file'?!(e.files&&e.files.length):e.tagName=='SELECT'?!(e.multiple?e.selectedOptions.length:e.selectedIndex>0):!e.value;if(!empty)return;
var k=Object.keys(why).filter(function(x){return e.name.indexOf(x)==0})[0];var m=k?why[k]:'UNKNOWN: '+e.name+' ('+((e.labels&&e.labels[0]&&e.labels[0].innerText)||e.placeholder||'')+')';if(!seen[m]){seen[m]=1;r.push(m)}});
return r}
function city(){var e=q('[name=jobsearch_field_location_location3]');if(e&&D.city&&norm((e.options[e.selectedIndex]||{}).text).indexOf(norm(D.city))<0){var o=document.createElement('option');o.text=o.value=D.city;e.appendChild(o);e.value=D.city;fire(e);log.push('OK: City (added '+D.city+' to the list)')}
var ad=q('[name=jobsearch_field_location_address]');if(ad&&(!ad.value||D.address)){txt('[name=jobsearch_field_location_address]',D.address||[D.city,D.country].filter(Boolean).join(', '),'Address')}done()}
function done(){var L=left();log.push('','STILL EMPTY ('+L.length+'):');L.forEach(function(x){log.push('- '+x)});var b=document.createElement('div');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;border:2px solid #1a7f37;border-radius:10px;padding:12px;font:15px sans-serif;white-space:pre-wrap;max-height:55vh;overflow:auto';
b.textContent=log.join('\n')+'\n\nLines that say NO MATCH or STILL EMPTY: fill them on the page yourself.\nNow check the page, tick the Terms box yourself and tap Save.\n(Tap this box to copy it and close.)';b.onclick=function(){try{navigator.clipboard.writeText(b.textContent)}catch(x){}b.remove()};document.body.appendChild(b)}
if(!want('place'))done();else if(c){pick('[name=jobsearch_field_location_location1]',rx(D.country||'Ethiopia'),'Country',1);setTimeout(function(){step('[name=jobsearch_field_location_location2]',rx(D.region||D.city||''),'Region',function(){step('[name=jobsearch_field_location_location3]',rx(D.city||D.region||''),'City',city)})},1500)}else{log.push('NOT FOUND: Country');done()}
})();
