(async function(){
// ReporterFill: fills an Ethiopian Reporter Jobs profile from the applicant's own CV.
// Everything (CV, photo, certificates, details) stays in this site's browser storage on the applicant's phone.
// It never saves, submits or applies: the applicant checks each page and taps Save.
var base=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
var PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/',MAMMOTH='https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
if(!/(^|\.)ethiopianreporterjobs\.com$/.test(location.hostname)){if(confirm('ReporterFill works on Ethiopian Reporter Jobs. Open it now? Then tap the bookmark again there.'))location.href='https://www.ethiopianreporterjobs.com/user-dashboard/';return}
if(location.hostname!='www.ethiopianreporterjobs.com'){location.href=location.href.replace('//'+location.hostname,'//www.ethiopianreporterjobs.com');return}

// ---------- phone storage ----------
function db(){return new Promise(function(ok,no){var r=indexedDB.open('reporterfill',1);r.onupgradeneeded=function(){r.result.createObjectStore('f')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}})}
async function get(k){var d=await db();return new Promise(function(ok){var r=d.transaction('f').objectStore('f').get(k);r.onsuccess=function(){ok(r.result||null)};r.onerror=function(){ok(null)}})}
async function put(k,v){var d=await db();return new Promise(function(ok,no){var t=d.transaction('f','readwrite');if(v==null)t.objectStore('f').delete(k);else t.objectStore('f').put(v,k);t.oncomplete=function(){ok()};t.onerror=function(){no(t.error)}})}
async function jpeg(file){try{var bm=await createImageBitmap(file),sc=Math.min(1,800/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.round(bm.width*sc);c.height=Math.round(bm.height*sc);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);return await new Promise(function(ok){c.toBlob(ok,'image/jpeg',0.9)})}catch(x){return file}}
function b64(u){var s='';for(var i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

// ---------- the site's own choices ----------
var L={gender:['Male','Female'],marital:['Single','Married','Divorced','Widowed'],
edulevel:['Primary school','High, secondary school','Certificate','Technical and vocational education (TVET)','Diploma','Bachelor’s degree','Master’s Degree','Doctoral degree (PhD)','Doctor of Medicine (M.D.)'],
career:['Entry Level (Fresh Graduate)','Junior Level (6 mo - 2 years)','Mid Level (2+ - 5 years)','Senior Level (5+ years)','Managerial Level','Executive Level'],
emptype:['Full time','Contract','Part time','Freelance','Internship and Trainee','Seasonal'],
level:['Beginner','Intermediate','Proficient'],
sectors:['Accounting, Auditing and Finance','Admin, Clerical and Secretarial','Agriculture','Animal Science/Veterinary','Automotive','Banking and Insurance','Business and Administration','Business Development','Communications, PR and Journalism','Construction and Architecture','Consulting and Strategy','Creative Arts','Customer Service and Support','Driver and Transport','Economics','Education and Training','Electrician and Mechanic','Engineering','Environment and Natural Resources','Health Care','ICT','Legal','Logistics and Supply Chain','Marketing and Sales','NGO','Project Management','Research','Social Work']};
// review sections: [key,label,kind,choices,required]
var S={personal:['Your name and details',[['first','First name','t',0,1],['last','Last name','t',0,1],['email','Email (the one you registered with)','t',0,1],['gender','Gender','s','gender',1],['marital','Marital status','s','marital'],['dob','Date of birth (dd-mm-yyyy)','t',0,1]]],
phone:['Phone number',[['phone','Phone (example +251911223344)','t',0,1]]],
work:['Work and education level',[['title','Job title you want','t',0,1],['years','Years of experience (number)','t',0,1],['employer','Current or last employer','t'],['edulevel','Highest education','s','edulevel',1],['career','Career level','s','career',1],['emptype','Employment type wanted','s','emptype',1],['field','Field of study (example Civil Engineering)','t',0,1],['sectors','Sectors (one per line)','a',0,1]]],
place:['Where you live',[['country','Country','t',0,1],['region','Region (example Addis Ababa, Amhara)','t',0,1],['city','City','t',0,1],['address','Address (optional)','t']]],
links:['Social links (optional)',[['linkedin','LinkedIn link','t'],['facebook','Facebook link','t'],['twitter','Twitter / X link','t'],['telegram','Telegram @username','t']]],
bio:['Summary about yourself',[['bio','Summary about yourself','a',0,1]]],
cl:['Cover letter',[['cl','Cover letter','a',0,1]]],
sk:['Skills',[['sk','Skills (one per line)','a',0,1]]]};
var LISTS={edu:['Education',[['title','Degree or certificate'],['place','School / university'],['start','Start (dd-mm-yyyy)'],['end','End (dd-mm-yyyy)'],['desc','Short description']]],
expr:['Experience',[['title','Job title'],['place','Company and city'],['start','Start (dd-mm-yyyy)'],['end','End (dd-mm-yyyy, empty if current)'],['desc','What you did']]],
lang:['Languages',[['name','Language'],['level','Level'],['pct','Percent (0-100)']]]};
var ORDER=['personal','phone','work','place','bio','cl','sk','edu','expr','lang','links'];
// update menu: [key, label, page]
var PARTS=[['photo','Photo','Profile'],['cv','CV file','CV'],['phone','Phone number','Profile'],['personal','Name, gender, birth date, marital status','Profile'],['work','Job title, experience, education level, sectors','Profile'],['place','Where you live','Profile'],['bio','Summary about yourself','Profile'],['links','Social links','Profile'],['cl','Cover letter','Resume'],['sk','Skills','Resume'],['edu','Education','Resume'],['expr','Experience','Resume'],['lang','Languages','Resume']];

// ---------- screen ----------
var old=document.getElementById('rf');if(old)old.remove();
var O=document.createElement('div');O.id='rf';
var css='#rf{position:fixed;inset:0;z-index:2147483647;background:#f4f6f4;overflow:auto;font:16px/1.4 sans-serif;color:#111;text-align:left}#rf .w{max-width:560px;margin:0 auto;padding:14px 14px 80px}#rf h2{font-size:21px;margin:6px 0 10px;color:#1a7f37}#rf h3{font-size:17px;margin:18px 0 6px}#rf p{margin:8px 0}'+
'#rf button,#rf .b{display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:13px;border:0;border-radius:9px;background:#1a7f37;color:#fff;font:bold 16px sans-serif;text-align:center;text-decoration:none}#rf .g{background:#dfe7df;color:#111}#rf .r{background:#fff;color:#b00;border:1px solid #b00}'+
'#rf label{display:block;margin:10px 0 3px;font-size:14px;color:#333}#rf input,#rf select,#rf textarea{width:100%;box-sizing:border-box;padding:9px;border:1px solid #aaa;border-radius:7px;font:16px sans-serif;background:#fff;color:#111}#rf textarea{min-height:90px}#rf .miss{border:2px solid #d00;background:#fff4f4}'+
'#rf .card{background:#fff;border-radius:10px;padding:10px 12px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.12)}#rf .warn{background:#fff0f0;border:1px solid #d00;border-radius:9px;padding:10px;color:#900}#rf .ok{background:#e9f7ec;border-radius:9px;padding:10px}#rf .x{position:fixed;top:8px;right:10px;width:auto;padding:6px 12px;margin:0;background:#fff;color:#111;border:1px solid #888}#rf input[type=checkbox]{width:auto;transform:scale(1.4);margin-right:10px}#rf .chk{display:flex;align-items:center;font-size:16px;color:#111}';
var st=document.createElement('style');st.textContent=css;O.appendChild(st);var W=document.createElement('div');W.className='w';O.appendChild(W);document.body.appendChild(O);
function view(h){W.innerHTML=h+'<button class="x" id=rfx>Close</button>';W.querySelector('#rfx').onclick=function(){O.remove()};O.scrollTop=0}
function $(s){return W.querySelector(s)}
function on(s,f){var e=$(s);if(e)e.onclick=f}

var P=await get('profile'),DR=await get('draft');

// ---------- home ----------
function home(){
var h='<h2>ReporterFill</h2>';
if(!/user-dashboard/.test(location.pathname)){h+='<div class="warn">Log in to Reporter Jobs first and open your dashboard, then tap '+(window.RFApp?'the green ReporterFill button':'the bookmark')+' again.'+(window.RFApp?'<br><br>In this app, log in with your email and password. Google and LinkedIn login only work in Chrome.':'')+'<br><br>New to Reporter Jobs? Tap Register on the site and create your account and password yourself. ReporterFill never asks for your password.</div><a class="b" href="/user-dashboard/">Open my dashboard</a>'}
if(P){h+='<p>Hello '+esc(P.first)+'. Your details are saved on this phone.</p><button id=rffill>Fill my Reporter Jobs profile</button><button id=rfupd class=g>Update one part</button><button id=rffiles class=g>My saved files</button><button id=rfnew class=g>Start again from my CV</button><button id=rfdel class=r>Delete my details from this phone</button>'}
else{h+='<p>This fills your Reporter Jobs Profile, Resume and CV from your own CV. Your files stay on this phone.</p><p>You will need: your CV (PDF or Word), a photo of you, and if you like, your certificates and experience letters.</p>'+(DR?'<button id=rfcont>Continue where I stopped</button>':'')+'<button id=rfnew'+(DR?' class=g':'')+'>Start: pick my CV</button>'}
h+='<button id=rffiles class=g>My saved files</button>';
view(h);on('#rffill',function(){fill(null)});on('#rfupd',update);on('#rfnew',pick);on('#rfcont',function(){DR.stage=='review'?review(DR,ORDER,null):ai(DR)});
on('#rffiles',files);on('#rfdel',async function(){if(!confirm('Delete your saved details, CV and photo from this phone? Your Reporter Jobs account is not touched.'))return;['profile','draft','photo','cv','certs'].forEach(function(k){put(k,null)});P=DR=null;home()})}

// ---------- my saved files ----------
function kb(b){return b&&b.size?Math.max(1,Math.round(b.size/1024))+' KB':''}
async function files(){var ph=await get('photo'),cv=await get('cv'),ce=await get('certs')||[],it=[],u=[];
if(ph)it.push({k:'photo',name:((P&&P.first)||'my')+'-photo.jpg',blob:ph});if(cv)it.push({k:'cv',name:cv.name,blob:cv.blob});ce.forEach(function(c,i){it.push({k:'cert',i:i,name:c.name,blob:c.blob})});
var h='<h2>My saved files</h2><p>These copies are kept inside this browser for Reporter Jobs. Tap <b>Save to phone</b> to put a copy in My Files &gt; Download'+(window.RFApp?' &gt; Job Documents':'')+'.</p>';
if(!it.length)h+='<div class=warn>No files saved yet.</div>';
it.forEach(function(f,j){var url=URL.createObjectURL(f.blob);u.push(url);h+='<div class=card><b>'+(f.k=='photo'?'Photo':f.k=='cv'?'CV':'Certificate / letter')+'</b><br>'+esc(f.name)+' '+kb(f.blob)+(/^image\//.test(f.blob.type||'')||f.k=='photo'?'<br><img src="'+url+'" style="max-width:100%;max-height:220px;margin-top:6px;border-radius:6px">':'')+
'<a class="b" href="'+url+'" download="'+esc(f.name)+'">Save to phone</a>'+(f.k=='cert'?'<button class=r data-rmc='+f.i+'>Remove from ReporterFill</button>':'')+'</div>'});
if(it.length)h+='<button id=rfall>Save all to phone</button>';h+='<div class=card><label><b>Add certificates or letters</b></label><input type=file id=rfadd multiple accept=".pdf,.doc,.docx,image/*"></div><button id=rfb class=g>Back</button>';view(h);
on('#rfb',function(){u.forEach(URL.revokeObjectURL);home()});
async function save1(f){if(!window.RFApp){var l=document.createElement('a');l.href=URL.createObjectURL(f.blob);l.download=f.name;document.body.appendChild(l);l.click();l.remove();return 'ok'}
return RFApp.save(b64(new Uint8Array(await f.blob.arrayBuffer())),f.name,f.blob.type||'')}
[].forEach.call(W.querySelectorAll('#rf a.b[download]'),function(a,j){a.onclick=async function(ev){if(!window.RFApp)return;ev.preventDefault();var r=await save1(it[j]);a.textContent=r=='ok'?'Saved in My Files > Download > Job Documents':r}});
on('#rfall',async function(){var b=this,n=0;b.textContent='Saving...';for(var j=0;j<it.length;j++){if(await save1(it[j])=='ok')n++}b.textContent=n+' of '+it.length+' saved'+(window.RFApp?' in My Files > Download > Job Documents':' to Download')});
W.onclick=async function(ev){var i=ev.target.dataset.rmc;if(i==null)return;if(!confirm('Remove this file from ReporterFill? Your own copy on the phone is not touched.'))return;ce.splice(+i,1);await put('certs',ce);files()};
$('#rfadd').onchange=async function(){var n=[].slice.call(this.files).map(function(f){return {blob:f,name:f.name,type:f.type}});await put('certs',ce.concat(n));files()}}

// ---------- step 1: files ----------
async function pick(){var ph=await get('photo'),cv=await get('cv'),ce=await get('certs')||[];
view('<h2>Step 1 of 3: your files</h2><p>They are kept on this phone only.</p>'+
'<div class=card><label><b>Your CV</b> (PDF or Word)'+(cv?' saved: '+esc(cv.name)+'. Pick again to change.':'')+'</label><input type=file id=rfcv accept=".pdf,.doc,.docx,application/pdf"></div>'+
'<div class=card><label><b>Your photo</b>'+(ph?' saved. Pick again to change.':'')+'</label><input type=file id=rfph accept="image/*"></div>'+
'<div class=card><label><b>Certificates and experience letters</b> (optional, you can pick several)'+(ce.length?' saved: '+ce.length+'.':'')+'</label><input type=file id=rfce multiple accept=".pdf,.doc,.docx,image/*"></div>'+
'<p id=rfm class=warn style="display:none"></p><button id=rfgo>Next: read my CV</button><button id=rfb class=g>Back</button>');
on('#rfb',home);on('#rfgo',async function(){var c=$('#rfcv').files[0],p=$('#rfph').files[0],cs=[].slice.call($('#rfce').files),m=$('#rfm');
function msg(t){m.style.display='block';m.textContent=t}
if(!(c||cv))return msg('Please pick your CV.');if(!(p||ph))return msg('Please pick your photo.');
this.textContent='Reading your CV...';this.disabled=true;
try{if(c){await put('cv',{blob:c,name:c.name,type:c.type||'application/pdf'});cv=await get('cv')}if(p)await put('photo',await jpeg(p));if(cs.length){ce=cs.map(function(f){return {blob:f,name:f.name,type:f.type}});await put('certs',ce)}}catch(x){return msg('Could not save on this phone: '+x.message)}
var t=await text(cv),ct=[],img=0;for(var i=0;i<ce.length;i++){var r=await text(ce[i]);if(r.text)ct.push('--- '+ce[i].name+' ---\n'+r.text);else img++}
var d=guess(t.text);d.stage='ai';d.cvtext=t.text;d.cvnote=t.note;d.certtext=ct.join('\n\n');d.certimg=img;await put('draft',d);DR=d;ai(d)})}

// ---------- reading the files ----------
function js(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=function(){no(new Error('could not load a helper'))};document.head.appendChild(s)})}
async function text(f){var n=(f.name||'').toLowerCase(),t=f.type||'';
try{if(/pdf/.test(t)||/\.pdf$/.test(n)){if(!window.pdfjsLib)await js(PDFJS+'pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';
var doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.blob.arrayBuffer())}).promise,out=[];
for(var i=1;i<=doc.numPages;i++){var pg=await doc.getPage(i),c=await pg.getTextContent();out.push(c.items.map(function(it){return it.str+(it.hasEOL?'\n':' ')}).join(''))}
var s=out.join('\n').replace(/[ \t]+/g,' ').replace(/\n\s*\n\s*\n+/g,'\n\n').trim();return {text:s,note:s.length<80?'scan':''}}
if(/\.docx$/.test(n)||/officedocument/.test(t)){if(!window.mammoth)await js(MAMMOTH);var r=await mammoth.extractRawText({arrayBuffer:await f.blob.arrayBuffer()});return {text:r.value.trim(),note:''}}
if(/\.doc$/.test(n))return {text:'',note:'doc'};return {text:'',note:'image'}}catch(x){return {text:'',note:'error: '+x.message}}}
function guess(t){var d={country:'Ethiopia',emptype:'Full time',sk:[],edu:[],expr:[],lang:[],sectors:[]};t=t||'';
var e=t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);if(e)d.email=e[0];
(t.match(/(\+?251|\b0)[\s\-()]*[79][\d\s\-]{7,12}/g)||[]).some(function(m){var n=m.replace(/\D/g,'').replace(/^251/,'').replace(/^0/,'');if(/^[79]\d{8}$/.test(n)){d.phone='+251'+n;return true}});
var ln=t.split('\n').map(function(s){return s.trim()}).filter(Boolean);for(var i=0;i<Math.min(8,ln.length);i++){var w=ln[i].split(/\s+/);if(w.length>=2&&w.length<=4&&!/[\d@:|]/.test(ln[i])&&!/curriculum|vitae|resume|profile|contact/i.test(ln[i])){d.first=cap(w[0]);d.last=cap(w[w.length-1]);break}}
if(/addis\s*ababa/i.test(t)){d.region='Addis Ababa';d.city='Addis Ababa'}return d}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()}

// ---------- step 2: free AI ----------
function prompt(d){return 'Help me fill my profile on the Ethiopian Reporter Jobs website. Read my CV below'+(d.certtext?' and my certificates and letters':'')+(d.certimg||d.cvnote?' and the files I attached':'')+'. Answer with ONLY one JSON object and no other text, in exactly this shape:\n'+
'{"first":"","last":"","email":"","phone":"","gender":"","marital":"","dob":"","title":"","years":"","employer":"","edulevel":"","career":"","emptype":"","field":"","sectors":[],"country":"","region":"","city":"","bio":"","cl":"","sk":[],"edu":[{"title":"","place":"","start":"","end":"","desc":""}],"expr":[{"title":"","place":"","start":"","end":"","desc":""}],"lang":[{"name":"","level":"","pct":""}],"missing":[]}\n'+
'Rules:\n- Use only facts from my documents. Never invent anything. If something is not there, leave it "" and add a short name for it to "missing".\n- Dates as dd-mm-yyyy. If only month and year are known, use the 1st of the month.\n'+
'- gender: Male or Female. marital: one of '+L.marital.join(', ')+'.\n- edulevel (highest): one of '+L.edulevel.join('; ')+'.\n- career: one of '+L.career.join('; ')+'.\n- emptype: one of '+L.emptype.join(', ')+' (default Full time).\n'+
'- title: the job title I fit best, short. years: total years of work experience, a number. employer: my current or last employer.\n- field: my field of study, for example Civil Engineering. sectors: 1 to 3 from: '+L.sectors.join('; ')+'.\n- country, region, city: where I live now.\n'+
'- bio: the "Summary about yourself" for my profile: 3 to 5 sentences in the first person, under 600 characters, simple and true.\n- cl: a general cover letter that starts "Dear Hiring Manager," of about 200 to 250 words, ending with my name, phone and email.\n'+
'- sk: 8 to 12 short skills. edu and expr: newest first; in expr, place is the company and city and desc is 1 to 3 sentences.\n- lang: level one of '+L.level.join(', ')+'; pct 0 to 100. Include my mother tongue.\n\nMY CV:\n'+(d.cvtext||'(attached as a file)')+(d.certtext?'\n\nMY CERTIFICATES AND LETTERS:\n'+d.certtext:'')}
function ai(d){var pr=prompt(d),warn='';
if(d.cvnote)warn='<div class=warn>'+(d.cvnote=='doc'?'Your CV is an old Word file (.doc), which this phone cannot read. ':d.cvnote=='scan'?'Your CV looks like a scanned picture, so its text could not be read. ':'Your CV could not be read here. ')+'In the AI chat, also attach your CV file (the + or paperclip button).</div>';
if(d.certimg)warn+='<div class=warn>'+d.certimg+' of your certificates or letters are pictures. Attach them in the AI chat too if you want them used.</div>';
view('<h2>Step 2 of 3: let a free AI read your CV</h2>'+warn+'<div class=card><p><b>1.</b> Tap Copy.</p><button id=rfcp>Copy</button><p><b>2.</b> Open ChatGPT or Gemini, paste into the chat and send. You can use them without paying.</p><a class="b g" href="https://chatgpt.com/" target=_blank>Open ChatGPT</a><a class="b g" href="https://gemini.google.com/app" target=_blank>Open Gemini</a>'+
'<p><b>3.</b> When it answers, copy its whole answer, come back to this tab and paste it here.</p><textarea id=rfans placeholder="Paste the AI answer here"></textarea><p id=rfm class=warn style="display:none"></p><button id=rfrd>Read the answer</button></div>'+
'<button id=rfsk class=g>Skip the AI, I will type my details</button><button id=rfb class=g>Back</button><textarea id=rfpr style="position:absolute;left:-9999px;height:1px">'+esc(pr)+'</textarea>');
on('#rfb',pick);on('#rfsk',function(){d.stage='review';put('draft',d);review(d,ORDER,null)});
on('#rfcp',function(){var b=this,t=$('#rfpr');function done(){b.textContent='Copied. Now open ChatGPT or Gemini.'}if(navigator.clipboard)navigator.clipboard.writeText(pr).then(done,function(){t.select();document.execCommand('copy');done()});else{t.select();document.execCommand('copy');done()}});
on('#rfrd',function(){var s=$('#rfans').value,m=$('#rfm');var a=s.indexOf('{'),b=s.lastIndexOf('}');try{var o=JSON.parse(s.slice(a,b+1).replace(/[“”]/g,'"'))}catch(x){m.style.display='block';m.textContent='That does not look like the full answer. Copy all of the AI answer (it starts with { and ends with }) and paste again.';return}
Object.keys(o).forEach(function(k){var v=o[k];if(v==null||v===''||(Array.isArray(v)&&!v.length))return;d[k]=v});
d.bioOK=false;d.stage='review';put('draft',d);review(d,ORDER,null)})}

// ---------- step 3: review ----------
function need(d,keys){var m=[];keys.forEach(function(k){if(S[k])S[k][1].forEach(function(f){var v=d[f[0]];if(f[4]&&(!v||(Array.isArray(v)&&!v.length)))m.push(f[1].replace(/ \(.*/,''))});if(LISTS[k]&&!(d[k]||[]).length)m.push(LISTS[k][0]+' (add at least one)')});return m}
function field(d,f){var v=d[f[0]];if(Array.isArray(v))v=v.join('\n');var cl=f[4]&&!v?' class=miss':'',h='<label>'+esc(f[1])+(f[4]?' *':'')+'</label>';
if(f[2]=='s'){h+='<select data-k="'+f[0]+'"'+cl+'><option value="">Choose</option>'+L[f[3]].map(function(o){return '<option'+(norm(o)==norm(v)?' selected':'')+'>'+esc(o)+'</option>'}).join('')+(v&&!L[f[3]].some(function(o){return norm(o)==norm(v)})?'<option selected>'+esc(v)+'</option>':'')+'</select>'}
else if(f[2]=='a')h+='<textarea data-k="'+f[0]+'"'+cl+(f[0]=='cl'?' style="min-height:220px"':'')+'>'+esc(v)+'</textarea>';else h+='<input data-k="'+f[0]+'" value="'+esc(v)+'"'+cl+'>';return h}
function entry(t,e,i){return '<div class=card data-l="'+t+'" data-i='+i+'>'+LISTS[t][1].map(function(f){var v=e[f[0]]||'';return '<label>'+f[1]+'</label>'+(f[0]=='level'?'<select data-f=level><option value="">Choose</option>'+L.level.map(function(o){return '<option'+(norm(o)==norm(v)?' selected':'')+'>'+o+'</option>'}).join('')+'</select>':f[0]=='desc'?'<textarea data-f=desc>'+esc(v)+'</textarea>':'<input data-f="'+f[0]+'" value="'+esc(v)+'">')}).join('')+'<button class=r data-rm="'+t+'">Remove this one</button></div>'}
function collect(d,keys){[].forEach.call(W.querySelectorAll('[data-k]'),function(e){var v=e.value.trim();d[e.dataset.k]=e.dataset.k=='sk'||e.dataset.k=='sectors'?v.split(e.dataset.k=='sk'?/\n|,/:/\n|;/).map(function(s){return s.trim()}).filter(Boolean):v});
keys.forEach(function(t){if(!LISTS[t])return;d[t]=[].map.call(W.querySelectorAll('[data-l="'+t+'"]'),function(c){var o={};[].forEach.call(c.querySelectorAll('[data-f]'),function(e){o[e.dataset.f]=e.value.trim()});return o}).filter(function(o){return o.title||o.name})});var b=$('#rfok');if(b)d.bioOK=b.checked}
function review(d,keys,part){var m=need(d,keys),h='<h2>'+(part?'Update: '+esc(PARTS.filter(function(p){return p[0]==part})[0][1]):'Step 3 of 3: check your details')+'</h2>';
if(m.length)h+='<div class=warn><b>Still missing:</b> '+esc(m.join(', '))+'.<br>Type them in the red boxes below. Or add them to your CV and tap "Start again from my CV".</div>';else h+='<div class=ok>Everything needed is filled. Read it once more before saving.</div>';
if(d.missing&&d.missing.length&&!part)h+='<p style="color:#900">The AI could not find: '+esc([].concat(d.missing).join(', '))+'.</p>';
keys.forEach(function(k){if(S[k]){h+='<h3>'+S[k][0]+'</h3>'+S[k][1].map(function(f){return field(d,f)}).join('');
if(k=='bio')h+='<button class=g id=rfwr>Write a summary for me from my details</button><label class=chk><input type=checkbox id=rfok'+(d.bioOK?' checked':'')+'>I read my summary and it is true about me</label>'}
if(LISTS[k])h+='<h3>'+LISTS[k][0]+'</h3><div id="rfl-'+k+'">'+(d[k]||[]).map(function(e,i){return entry(k,e,i)}).join('')+'</div><button class=g data-add="'+k+'">+ Add '+LISTS[k][0].toLowerCase().replace(/s$/,'')+'</button>'});
h+='<p id=rfm class=warn style="display:none"></p><button id=rfsv>Save and fill Reporter Jobs</button><button id=rfso class=g>Save only</button><button id=rfb class=g>Back</button>';view(h);
W.onclick=function(ev){var a=ev.target.dataset;if(a.rm){ev.target.parentElement.remove()}if(a.add){$('#rfl-'+a.add).insertAdjacentHTML('beforeend',entry(a.add,{},0))}};
W.oninput=function(ev){var e=ev.target;if(e.classList.contains('miss')&&e.value)e.classList.remove('miss');if(!part){collect(d,keys);put('draft',d)}};
on('#rfwr',function(){collect(d,keys);var t=autoBio(d);if(!t){alert('Fill your job title, experience and education first.');return}$('[data-k=bio]').value=t;$('[data-k=bio]').classList.remove('miss');$('#rfok').checked=false});
on('#rfb',function(){collect(d,keys);part?update():(d.stage='ai',put('draft',d),ai(d))});
async function save(go){collect(d,keys);var mm=$('#rfm');if(keys.indexOf('bio')>=0&&d.bio&&!d.bioOK){mm.style.display='block';mm.textContent='Please read your summary and tick "it is true about me" first.';return}
var m2=need(d,keys);if(m2.length&&!confirm('Still missing: '+m2.join(', ')+'. Save anyway?'))return;
d.stage='';var p=Object.assign({},P||{},d);delete p.cvtext;delete p.certtext;await put('profile',p);await put('draft',null);P=p;DR=null;
if(go)fill(part?(part=='all'?null:[part]):null);else{alert('Saved on this phone.');home()}}
on('#rfsv',function(){save(true)});on('#rfso',function(){save(false)})}
function norm(s){return String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function autoBio(d){if(!d.title)return '';var e=(d.edu||[])[0],x=(d.expr||[]).slice(0,2).map(function(x){return x.place}).filter(Boolean),sk=[].concat(d.sk||[]).slice(0,4);
var tt=d.title.replace(/^(a|an) /i,'');return 'I am '+(/^[aeiou]/i.test(tt)?'an ':'a ')+tt+(d.years?' with '+d.years+' years of experience':'')+'.'+(e&&e.title?' I hold a '+e.title+(e.place?' from '+e.place:'')+'.':'')+(x.length?' I have worked with '+x.join(' and ')+'.':'')+(sk.length?' My strengths include '+sk.join(', ').replace(/, ([^,]*)$/,' and $1')+'.':'')+' I am reliable, hard-working and ready to contribute from day one.'}

// ---------- update one part ----------
function update(){view('<h2>What do you want to update?</h2>'+PARTS.map(function(p){return '<button class=g data-p="'+p[0]+'">'+esc(p[1])+'</button>'}).join('')+'<button data-p=all>Fill everything again</button><button id=rfb class=g>Back</button>');
on('#rfb',home);W.onclick=function(ev){var k=ev.target.dataset.p;if(!k)return;W.onclick=null;if(k=='all')return fill(null);if(k=='photo'||k=='cv')return file(k);review(Object.assign({},P),[k],k)}}
async function file(k){view('<h2>New '+(k=='cv'?'CV file':'photo')+'</h2><div class=card><input type=file id=rff accept="'+(k=='cv'?'.pdf,.doc,.docx':'image/*')+'"></div><button id=rfsv>Save and fill</button><button id=rfb class=g>Back</button>');on('#rfb',update);
on('#rfsv',async function(){var f=$('#rff').files[0];if(!f)return alert('Pick a file first.');if(k=='cv')await put('cv',{blob:f,name:f.name,type:f.type||'application/pdf'});else await put('photo',await jpeg(f));
if(k=='cv'&&confirm('Do you also want the AI to read the new CV and refresh your details?')){var t=await text({blob:f,name:f.name,type:f.type});var d=Object.assign({},P,{cvtext:t.text,cvnote:t.note,certtext:'',certimg:0,stage:'ai'});await put('draft',d);return ai(d)}fill([k])})}

// ---------- fill the site ----------
function toRJ(p){var sk=[].concat(p.sk||[]);return {RJ:{first:p.first,last:p.last,email:p.email,gender:p.gender,marital:p.marital,years:p.years,employer:p.employer,dob:p.dob,phone:p.phone,title:p.title,twitter:p.twitter,linkedin:p.linkedin,facebook:p.facebook,telegram:p.telegram,
edulevel:p.edulevel,career:p.career,emptype:p.emptype,field:p.field,sectors:(Array.isArray(p.sectors)?p.sectors:String(p.sectors||'').split(/\n|;/)).map(function(s){return s.trim()}).filter(Boolean),country:p.country||'Ethiopia',region:p.region,city:p.city,address:p.address,bio:p.bio,imgName:((p.first||'My')+'-'+(p.last||'')).replace(/\s+/g,'-')},
RJR:{cl:p.cl,sk:sk,items:[].concat((p.edu||[]).map(function(e){return ['edu',e.title,e.start,e.end,e.place,e.desc||'']}),(p.expr||[]).map(function(e){return ['expr',e.title,e.start,e.end,e.place,e.desc||'']}),(p.lang||[]).map(function(e){return ['lang',e.name,e.level||'Proficient',String(e.pct||'')]}))}}}
async function fill(only){if(!/user-dashboard/.test(location.pathname)){alert('Log in and open your Reporter Jobs dashboard first, then tap '+(window.RFApp?'the green ReporterFill button':'the bookmark')+' again.');location.href='/user-dashboard/';return}
var o=toRJ(P),ph=await get('photo'),cv=await get('cv');window.RJ=o.RJ;window.RJR=o.RJR;window.RFONLY=only;
if(ph)RJ.img=b64(new Uint8Array(await ph.arrayBuffer()));if(cv){window.RJCV=b64(new Uint8Array(await cv.blob.arrayBuffer()));window.RJCVT={name:cv.name,type:cv.type}}
var need={Profile:!only,Resume:!only,CV:!only};(only||[]).forEach(function(k){PARTS.forEach(function(p){if(p[0]==k)need[p[2]]=true})});
O.remove();panel(need)}
function run(win,f){var d=win.document;['RJ','RJR','RJCV','RJCVT','RFONLY'].forEach(function(k){win[k]=window[k]});var s=d.createElement('script');s.src=base+f+'.js';d.body.appendChild(s)}
function panel(need){var old=document.getElementById('rjpanel');if(old)old.remove();
var Q=document.createElement('div');Q.id='rjpanel';Q.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;font:15px sans-serif';
var bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;padding:6px;background:#1a7f37';Q.appendChild(bar);
var cvl=[].filter.call(document.querySelectorAll('a[href*="tab="]'),function(a){return /cv\s*manager/i.test(a.textContent)})[0],cvt=cvl?(cvl.href.match(/tab=([^&#]+)/)||[])[1]:'';
var pages=[['Profile','dashboard-settings','rjfix'],['Resume','my-resume','rjresume'],['CV',cvt||'cv-manager','rjcv']].filter(function(p){return need[p[0]]}),frames=[],btns=[];
function show(i){frames.forEach(function(f,j){f.style.display=i<0||i==j?'block':'none';btns[j].style.background=i==j?'#fff':'#d7f5dd'})}
pages.forEach(function(p,i){var b=document.createElement('button');b.textContent=p[0];b.style.cssText='flex:1;padding:10px 4px;border:0;border-radius:6px;font:bold 14px sans-serif';b.onclick=function(){show(i)};bar.appendChild(b);btns.push(b);
var f=document.createElement('iframe');f.style.cssText='flex:1;border:0;width:100%';f.src=location.origin+'/user-dashboard/?tab='+p[1];
f.onload=function(){if(f.done){b.textContent=p[0]+' (reloaded)';return}f.done=1;try{run(f.contentWindow,p[2]);b.textContent=p[0]+' ✓';if(frames.every(function(g){return g.done}))setTimeout(function(){show(0)},pages.length>1?10000:500)}catch(x){b.textContent=p[0]+' ✗';alert('ReporterFill could not fill '+p[0]+': '+x.message)}};
frames.push(f);Q.appendChild(f)});
var x=document.createElement('button');x.textContent='Close';x.style.cssText='padding:10px 6px;border:0;border-radius:6px;background:#fff';x.onclick=function(){Q.remove()};bar.appendChild(x);
document.body.appendChild(Q);show(-1);
alert('ReporterFill is filling '+pages.map(function(p){return p[0]}).join(', ')+'. Wait about '+(pages.length>1?'1 minute':'20 seconds')+', then use the buttons at the top to switch. On each page: check it, tick Terms yourself, and tap Save.')}

home();
})();
