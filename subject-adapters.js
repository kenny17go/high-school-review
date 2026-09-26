(function(root){
"use strict";
const R=root.SubjectRegistry,C=root.LearningCore,S=root.LearningStorage.create(root.localStorage);
S.migrate();root.LearningProgress=S;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=()=>root.ChineseData||{questions:[],passages:[],question_text_links:[],sources:[],reviewQueue:[]};
let cloud=[],links=[],loadPromise=null,mode='exam',selectedTexts=new Set(),selectedSkills=new Set(),source='all',weakOnly=false,schoolOnly='',selection,actions;
const all=()=>[...new Map([...cloud,...data().questions].map(q=>[q.id,q])).values()];
const allLinks=()=>[...links,...data().question_text_links];
const exams=['第一次段考','第二次段考','第三次段考／期末'];
const scopes=root.LearningCatalog.schools.flatMap(school=>[112,113,114].flatMap(academic_year=>[1,2].flatMap(grade=>[1,2].flatMap(semester=>[1,2,3].map(exam=>({subject:'chinese',school,academic_year,grade,semester,exam,sourceType:'platform',lessons:root.ClassicalTexts.slice(((semester-1)*3+exam-1)*5,((semester-1)*3+exam)*5).map(t=>t.text_id),skills:R.skills.map(s=>s.id),publisher:null,verified:false}))))));
R.subjects.chinese.examMapping=scopes;
function scope(s){
 if(mode==='classical')return {...s,subjectId:'chinese',sourceType:'platform',label:[...selectedTexts].map(id=>root.ClassicalTexts.find(t=>t.text_id===id)?.title).join('、')||'尚未選擇篇目',note:'自主精讀；依篇目、能力與題源選擇，不套用段考範圍。',textIds:[...selectedTexts],skills:[...selectedSkills],mode};
 if(mode!=='exam')return {...s,subjectId:'chinese',sourceType:'platform',label:mode==='reading'?'閱讀素養':'字音字形／成語／國學常識',note:'平台自主練習範圍',mode};
 const row=scopes.find(r=>r.school===s.school&&r.grade===s.grade&&r.academic_year===s.academicYear&&r.semester===s.semester&&r.exam===(typeof s.exam==='number'?s.exam:exams.indexOf(s.exam)+1));
 return {...s,subjectId:'chinese',...row,sourceType:'platform',label:row?row.lessons.map(id=>root.ClassicalTexts.find(t=>t.text_id===id).title).join('、')+'；語文基礎與閱讀':'尚未建立範圍',note:'平台模擬範圍；尚無已核驗的本校國文課本版本／課次映射，不代表已授課進度。',textIds:row?.lessons||[],skills:row?.skills||[],mode:'exam'};
}
function pool(s){
 const sc=scope(s);let rows=all();
 if(mode==='exam')rows=sc.textIds.length?rows.filter(q=>q.unit!=='classical'||C.textLinks(q,allLinks()).some(l=>sc.textIds.includes(l.text_id))):[];
 if(mode==='reading')rows=rows.filter(q=>q.unit==='reading');
 if(mode==='language')rows=rows.filter(q=>q.unit==='language');
 if(mode==='classical'&&(!selectedTexts.size||!selectedSkills.size))return [];
 return C.filter(rows,{grade:s.grade,textIds:mode==='classical'?[...selectedTexts]:[],skills:mode==='classical'?[...selectedSkills]:[],source:mode==='classical'?source:'all',school:mode==='classical'?schoolOnly:'',weakOnly:mode==='classical'&&weakOnly,weak:S.weak},allLinks());
}
function pick(rows,n){const selected=C.pick(rows,n,mode==='classical'?source:'all',mode==='classical'&&weakOnly?S.weak:()=>false),groups=new Map();for(const q of selected){const key=q.chineseMetadata?.passage_id||root.UnifiedQuestionBank?.context?.(q)?.id||q.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);}return [...groups.values()].flat();}
function ensure(){
 if(root.ChineseData)return Promise.resolve();if(loadPromise)return loadPromise;
 loadPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='chinese-data.js?v=5.0-111-matha-explanation-v2';script.onload=()=>resolve();script.onerror=()=>{loadPromise=null;script.remove();reject(Error('國文本機題庫未載入，請重試。'));};document.head.appendChild(script);});return loadPromise;
}
function adaptCloud(row){
 if(!row.learning_metadata||row.classification_status!=='verified'||!row.verified_at)return null;
 const m={...row.learning_metadata};
 const text_links=(row.question_text_links||[]).filter(l=>l.classification_status==='verified'&&l.confidence>=0.9);
 const group=row.question_group_items?.[0]?.question_groups,passage=group?.passages;
 // A hidden/missing relation must not be replaced by an unreviewed metadata body.
 if((group||m.chineseMetadata?.passage_id)&&!passage?.body)return null;
 m.chineseMetadata={...m.chineseMetadata,text_links,text_ids:[...new Set(text_links.map(l=>l.text_id))],skills:(row.question_skills||[]).map(s=>s.skill),passage_id:passage?.passage_id||null,passage:passage||null};
 const q=C.normalize({...m,id:row.id,subject:'chinese',grade:Number(row.grade),grades:[Number(row.grade)],stem:row.question_text,options:row.options,answer:row.correct_index,explanation:row.explanation,origin:'cloud',sourceType:row.source_type||'unknown',source_url:row.source_url,source_title:row.source_title??m.source_title,academic_year:row.academic_year??m.academic_year,question_number:row.question_number??m.question_number,school:row.school??m.school,semester:row.semester??row.term??m.semester,exam:row.exam??row.exam_name??m.exam,classification_status:row.classification_status,verified_at:row.verified_at});
 return C.errors(q).length?null:q;
}
function receive(rows){cloud=rows.map(adaptCloud).filter(Boolean);links=cloud.flatMap(q=>(q.chineseMetadata?.text_links||[]).map(l=>({...l,question_id:q.id})));render();}
function history({source='all',school='全部',year='全部',term='全部',exam='全部',grade='',textId=''}={}){
 return all().filter(q=>C.isVerified(q)&&(source==='all'||source==='ceec'&&q.sourceType==='ceec_official'||source==='school'&&['school_official','school_exam_verified'].includes(q.sourceType))&&
  (school==='全部'||q.school===school)&&(year==='全部'||String(q.academic_year)===String(year))&&(term==='全部'||String(q.semester)===String(term))&&
  (exam==='全部'||(q.exam_name||q.exam)===exam||exams[Number(q.exam)-1]===exam)&&(!grade||q.grade===Number(grade))&&(!textId||C.textLinks(q,allLinks()).some(l=>l.text_id===textId)));
}
function passage(q){const p=data().passages.find(p=>p.passage_id===q.chineseMetadata?.passage_id)||q.chineseMetadata?.passage;return p?`<blockquote class="readingPassage"><b>${esc(p.title)}</b><p>${esc(p.body)}</p></blockquote>`:'';}
function stats(){
 const summary=S.summary('chinese'),wrong=S.wrong().filter(q=>q.subject==='chinese'),rows=pool(selection());
 for(const [id,value] of [['score',summary.percent??'-'],['doneN',summary.total],['wrongN',wrong.length],['bankTotalN',all().length]])document.getElementById(id).textContent=value;
 document.getElementById('prog').style.width=Math.min(100,summary.total*2)+'%';document.getElementById('bankVerifyText').textContent=`國文 ${all().length} 題｜本次條件 ${rows.length} 題｜平台題與真題明確分開`;
}
function render(){
 if(!actions)return;
 const group=document.getElementById('classicalGroup').value;
 const texts=root.ClassicalTexts.filter(t=>group==='all'||t.group===group),visible=new Set(texts.map(t=>t.text_id));
 for(const id of selectedTexts)if(!visible.has(id))selectedTexts.delete(id);
 document.getElementById('textChoices').innerHTML=texts.map(t=>{const p=S.summary('chinese',t.text_id);return `<label class="choice"><input type="checkbox" data-text-id="${t.text_id}" ${selectedTexts.has(t.text_id)?'checked':''}><span>${esc(t.title)} <small>${p.percent===null?'尚未練習':p.percent+'%（'+p.total+'次作答）'}</small></span></label>`;}).join('');
 document.getElementById('textSelectionCount').textContent=`已選 ${selectedTexts.size} / ${texts.length}`;
 document.getElementById('singleTextDetails').innerHTML=selectedTexts.size===1?detail([...selectedTexts][0]):'<p>選擇單篇可看分層能力、真題紀錄與熟練度。</p>';
 document.getElementById('classicalAvailable').textContent=`符合篇目／能力／題源 ${pool({...selection()}).length} 題；缺題不跨範圍補足。`;
 document.getElementById('classicalWeakOnly').checked=weakOnly;
}
function detail(id){
 const text=root.ClassicalTexts.find(t=>t.text_id===id),cov=C.coverage(all(),allLinks(),id),p=S.summary('chinese',id);
 const levels=R.skills.map(skill=>{const progress=S.summary('chinese',id,skill.id),n=C.filter(all(),{textIds:[id],skills:[skill.id]},allLinks()).length;return `<li>Level ${skill.level} · ${esc(skill.name)}：${n?n+' 題':'待補資料'}；${progress.percent===null?'尚未練習':progress.percent+'%（'+progress.total+'次）'}</li>`;}).join('');
 return `<h3>單篇精讀：${esc(text.title)}</h3><p>${esc(text.author)}｜${esc(text.era)}｜整體 ${p.percent===null?'尚未練習':p.percent+'%'}。${esc(text.notes)}</p><ul>${levels}</ul><div class="filters">${[['all','精讀練習'],['ceec','學測真題'],['school','八校段考真題'],['comparison','延伸／跨文本'],['platform','平台模擬題']].map(([value,label])=>`<button class="soft" data-text-source="${value}">${label}</button>`).join('')}</div><p>已驗證學測相關題 ${cov.ceec} 題</p><div class="filters">${Object.entries(cov.schools).map(([school,n])=>`<button class="soft" data-text-school="${esc(school)}">${esc(school)} ${n?'✓ '+n+'題':'— 0題'}</button>`).join('')}</div><p class="small">✓ 僅表示資料庫確有已驗證關聯題目；0 不代表歷來未考。</p>`;
}
function init(api){
 actions=api;selection=api.selection;
 document.getElementById('skillChoices').innerHTML=R.skills.map(s=>`<label class="choice"><input type="checkbox" data-skill-id="${s.id}" checked><span>${esc(s.name)}</span></label>`).join('');R.skills.forEach(s=>selectedSkills.add(s.id));
 document.getElementById('classicalPanel').addEventListener('change',e=>{
  if(e.target.dataset.textId){const id=e.target.dataset.textId;e.target.checked?selectedTexts.add(id):selectedTexts.delete(id);}
  if(e.target.dataset.skillId){const id=e.target.dataset.skillId;e.target.checked?selectedSkills.add(id):selectedSkills.delete(id);}
  if(e.target.id==='classicalSource'){source=e.target.value;schoolOnly='';}
  if(e.target.id==='classicalWeakOnly')weakOnly=e.target.checked;
  render();
 });
 document.getElementById('classicalPanel').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.textAction){const texts=root.ClassicalTexts.filter(t=>document.getElementById('classicalGroup').value==='all'||t.group===document.getElementById('classicalGroup').value);selectedTexts.clear();if(b.dataset.textAction!=='clear')texts.filter(t=>b.dataset.textAction==='all'||all().some(q=>q.chineseMetadata?.text_ids?.includes(t.text_id)&&S.weak(q))).forEach(t=>selectedTexts.add(t.text_id));}
  if(b.dataset.textSource){source=b.dataset.textSource==='comparison'?'all':b.dataset.textSource;schoolOnly='';document.getElementById('classicalSource').value=source;if(b.dataset.textSource==='comparison'){selectedSkills=new Set(['comparison','extension']);document.querySelectorAll('[data-skill-id]').forEach(x=>x.checked=selectedSkills.has(x.dataset.skillId));}}
  if(b.dataset.textSchool){schoolOnly=b.dataset.textSchool;source='school';document.getElementById('classicalSource').value='school';}
  if(b.id==='startClassical'){mode='classical';api.startPractice();}
  render();
 });
}
const adapter={ensure,pool,pick,scope,topics:()=>R.categories,all,allLinks,passage,stats,init,receive,history,clearCloud(){cloud=[];links=[];},mode:()=>mode,setMode(value){mode=value;},render,adaptCloud,sourceName:q=>({'platform_simulated':'平台模擬題','platform_generated':'平台生成題','ceec_official':'學測真題','school_official':'校方真題','school_exam_verified':'已核驗段考題','unknown':'來源待核驗'}[q.sourceType]||'來源待核驗')};
R.registerAdapter('chinese',adapter);root.ChineseLearning=adapter;
})(window);
