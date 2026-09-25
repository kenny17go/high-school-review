/* Additive, resumable migration: original keys and raw records are never deleted. */
(function(root){
"use strict";
function create(storage){
 const read=(key,fallback)=>{try{return JSON.parse(storage.getItem(key))??fallback;}catch{return fallback;}};
 const write=(key,value)=>storage.setItem(key,JSON.stringify(value));
 function migrate(){
  if(read('v5_migration',{}).version>=1)return;
  const records={};
  for(const key of ['wrong','studyQueue']){
   const rows=read(key,[]);if(!Array.isArray(rows))continue;
   for(const row of rows){if(!row||row.id==null)continue;const subject=row.subject||row.subjectId||'math';records[subject+':'+row.id]={...row,subject,subjectId:subject,legacyKey:key};}
  }
  // An id-only old wrong record stays id-only; no invented answer history.
  const ids=read('v42wrong',[]);if(Array.isArray(ids))for(const id of ids)records['math:'+id]??={id,subject:'math',legacyKey:'v42wrong'};
  write('v5_legacy_records',{...records,...read('v5_legacy_records',{})});
  write('v5_legacy_math_analytics',{...read('v42hist',{}),...read('v5_legacy_math_analytics',{})});
  write('v5_migration',{version:1,at:new Date().toISOString()});
 }
 const attempts=()=>{const rows=read('v5_attempts',[]);return (Array.isArray(rows)?rows:[]).filter(x=>x&&typeof x==='object').map(x=>({...x,subject:x.subject||x.subjectId||'math',text_ids:Array.isArray(x.text_ids)?x.text_ids:[],skills:Array.isArray(x.skills)?x.skills:[]}));};
 const key=q=>(q.subject||q.subjectId||'math')+':'+q.id;
 function record(set,answers,sessionId,mode){
  const a=attempts(),seen=new Set(a.map(x=>x.eventId));
  for(const q of set){if(answers[q.id]==null)continue;const eventId=sessionId+':'+key(q);if(seen.has(eventId))continue;
   a.push({eventId,question_id:q.id,subject:q.subject||q.subjectId||'math',text_ids:q.chineseMetadata?.text_ids||[],skills:q.chineseMetadata?.skills||[q.skill||q.topic],category:q.category||q.topic,correct:(root.LearningCore?.equalAnswer?.(q,answers[q.id])??answers[q.id]===q.a)===true,mode,at:new Date().toISOString()});seen.add(eventId);
   if((root.LearningCore?.equalAnswer?.(q,answers[q.id])??answers[q.id]===q.a)===false)help(q,'答錯');
  }
  write('v5_attempts',a);
 }
 function help(q,reason){const rows=read('v5_wrong',{});rows[key(q)]={...q,subject:q.subject||q.subjectId||'math',reason,at:new Date().toISOString()};write('v5_wrong',rows);}
 function wrong(){
  const out={...read('v5_legacy_records',{}),...read('v5_wrong',{})};
  const legacy=read('v42wrong',[]);if(Array.isArray(legacy))for(const id of legacy)out['math:'+id]??={id,subject:'math'};
  return Object.values(out);
 }
 function summary(subject,textId,skill,category){
  const a=attempts().filter(x=>x.subject===subject&&(!textId||x.text_ids.includes(textId))&&(!skill||x.skills.includes(skill))&&(!category||x.category===category));
  return {total:a.length,correct:a.filter(x=>x.correct).length,percent:a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null};
 }
 function weak(q){
  if(wrong().some(x=>key(x)===key(q)))return true;
  return (q.chineseMetadata?.text_ids||[]).some(t=>(q.chineseMetadata?.skills||[]).some(s=>{const v=summary(q.subject,t,s);return v.total>0&&v.percent<70;}));
 }
 return {read,write,migrate,record,help,wrong,summary,weak,attempts};
}
root.LearningStorage={create};
})(typeof window!=='undefined'?window:globalThis);
