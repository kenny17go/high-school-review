/* Canonical question contract, reviewed provenance, filtering and paged transport. */
(function(root){
"use strict";
const genuine=new Set(['ceec_official','school_official','school_exam_verified']);
const safeUrl=value=>{try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:null;}catch{return null;}};
function normalize(row){
 const subject=row.subject||row.subjectId||'math',meta=row.chineseMetadata||{};
 const q={...row,subject,subjectId:subject,course:row.course||row.courseId||null,category:row.category||row.topic,unit:row.unit||row.chapterId||null,chapter:row.chapter||row.chapterId||null,
  skill:row.skill||null,questionType:row.questionType||'single_choice',stem:row.stem??row.q,options:row.options??row.o,answer:row.answer??row.a,explanation:row.explanation??row.e,
  difficulty:row.difficulty||row.level||'基礎',sourceType:row.sourceType||'unknown',sourceId:row.sourceId||null,tags:row.tags||[],chineseMetadata:meta};
 return {...q,q:q.stem,o:q.options,a:q.answer,e:q.explanation,level:q.difficulty,topic:q.topic||q.category,sub:q.sub||q.skill};
}
function errors(q){
 const out=[];
 for(const f of ['id','subject','grade','category','unit','questionType','stem','sourceType'])if(q[f]==null||q[f]==='')out.push(f);
 if(!root.SubjectRegistry.sourceTypes.includes(q.sourceType))out.push('sourceType');
 if(![1,2,3].includes(q.grade))out.push('grade');
 if(q.questionType!=='single_choice')out.push('unsupported questionType');
 if(!Array.isArray(q.options)||q.options.length<2||new Set(q.options).size!==q.options.length)out.push('options');
 if(q.answer_available!==false&&(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options?.length||!q.explanation))out.push('answer');
 if(genuine.has(q.sourceType)){
  if(!safeUrl(q.source_url)||!q.source_title||!Number.isInteger(Number(q.academic_year))||Number(q.academic_year)<=0||!q.question_number)out.push('provenance');
  if(q.sourceType!=='ceec_official'&&!root.LearningCatalog.schools.includes(q.school))out.push('school');
  if(q.sourceType==='ceec_official'&&Number(q.academic_year)<110)out.push('old curriculum');
  if(q.sourceType==='ceec_official'&&safeUrl(q.source_url)){const host=new URL(q.source_url).hostname;if(host!=='ceec.edu.tw'&&!host.endsWith('.ceec.edu.tw'))out.push('CEEC host');}
  if(q.generated===true)out.push('generated cannot be genuine');
 }
 return out;
}
const isVerified=q=>genuine.has(q.sourceType)&&q.classification_status==='verified'&&!!q.verified_at&&!errors(q).length;
const playable=q=>!errors(q).length&&q.answer_available!==false&&(!genuine.has(q.sourceType)||isVerified(q));
function textLinks(q,links){return links.filter(l=>l.question_id===q.id&&l.classification_status==='verified'&&l.confidence>=0.9);}
function filter(bank,{grade,textIds=[],skills=[],source='all',school,weakOnly=false,weak=()=>false}={},links=[]){
 return bank.filter(q=>playable(q)&&(!grade||q.grade===grade||q.grades?.includes(grade))&&
  (!textIds.length||textLinks(q,links).some(l=>textIds.includes(l.text_id)))&&
  (!skills.length||skills.some(s=>(q.chineseMetadata.skills||[q.skill]).includes(s)))&&
  (!school||q.school===school)&&(!weakOnly||weak(q))&&
  (source==='all'||source==='real-first'||source==='ceec'&&q.sourceType==='ceec_official'||source==='school'&&['school_official','school_exam_verified'].includes(q.sourceType)||source==='platform'&&['platform_generated','platform_simulated'].includes(q.sourceType)));
}
function pick(pool,qty,source='all',weak=()=>false){
 const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return shuffled.sort((a,b)=>(source==='real-first'?Number(isVerified(b))-Number(isVerified(a)):0)||Number(weak(b))-Number(weak(a))).slice(0,qty);
}
function coverage(bank,links,textId){
 const rows=bank.filter(q=>isVerified(q)&&textLinks(q,links).some(l=>l.text_id===textId));
 return {ceec:rows.filter(q=>q.sourceType==='ceec_official').length,schools:Object.fromEntries(root.LearningCatalog.schools.map(s=>[s,rows.filter(q=>q.school===s).length])),relationships:['direct','indirect','comparison','extended'].map(type=>({type,count:rows.filter(q=>textLinks(q,links).some(l=>l.text_id===textId&&l.relationship_type===type)).length}))};
}
async function paged(query,{pageSize=500,isCurrent=()=>true,timeoutMs=5000,onPage=()=>{}}={}){
 let offset=0,rows=[];
 while(isCurrent()){
  let timer;const task=query().range(offset,offset+pageSize-1);
  const res=await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('題庫讀取逾時')),timeoutMs);})]).finally(()=>clearTimeout(timer));
  if(!isCurrent())return null;if(res.error)throw res.error;
  const page=res.data||[];rows.push(...page);onPage([...rows]);
  if(page.length<pageSize)return rows;offset+=pageSize;
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 return null;
}
function fromMath(q){return normalize({...q,subject:'math',grade:q.grade||1,course:q.courseId||'math-108-g1',unit:q.chapterId||q.topic,chapter:q.chapterId||q.topic,category:q.topic,skill:q.sub||q.topic,sourceType:q.sourceType||(q.isOriginal?'platform_simulated':'unknown'),mathMetadata:{chapterId:q.chapterId,requiredChapterIds:q.requiredChapterIds,curriculumTrack:q.curriculumTrack}});}
root.LearningCore={normalize,fromMath,errors,isVerified,playable,textLinks,filter,pick,coverage,paged,safeUrl};
})(typeof window!=='undefined'?window:globalThis);
