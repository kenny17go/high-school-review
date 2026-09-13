/* Shared, DOM-free learning data contract. Add subjects/courses without copying UI logic. */
(function(root){
"use strict";
const schools=["建國中學","北一女中","師大附中","成功高中","中山女高","松山高中","延平高中","薇閣高中"];
const subjects=[{id:"math",label:"數學"}];
const courses=["A","B","AB"].map(track=>({id:`math-108-g2-${track.toLowerCase()}`,subjectId:"math",grade:2,curriculum:"108",track,label:track==="AB"?"高二全部（AB 共通）":`高二數學 ${track}`}));
const chapters=[
  ["trig","三角函數",1,["三角函數"]],
  ["exp-log","指數與對數函數",1,["指數與對數函數","指數與對數"]],
  ["plane-vector","平面向量",1,["平面向量"]],
  ["space-vector","空間向量",2,["空間向量"]],
  ["space-line-plane","空間中的平面與直線",2,["空間中的平面與直線","空間中平面與直線"]],
  ["probability","機率",2,["機率"]],
  ["matrix","矩陣",2,["矩陣"]],
  ["space-coordinates","空間坐標",2,["空間坐標","空間座標","空間概念與空間坐標系"]]
].map(([key,label,semester,aliases])=>({id:`math-108-g2-a:${key}`,courseId:"math-108-g2-a",subjectId:"math",grade:2,semester,label,aliases}));
const chapterById=new Map(chapters.map(c=>[c.id,c]));
const labels={official:"官方範圍 ✓",inferred:"歷屆題目推定",platform:"平台模擬範圍"};
const examNumber=value=>typeof value==="number"?value:({"第一次段考":1,"第二次段考":2,"第三次段考":3,"第三次段考／期末":3,"期末考":3}[value]||0);
const academicYear=s=>Number(s.academic_year??s.academicYear);
const key=s=>[s.subjectId,s.courseId,s.grade,s.school,academicYear(s),s.semester,examNumber(s.exam)].join("|");
const selectedTrack=s=>courses.find(c=>c.id===s.courseId)?.track||s.curriculumTrack;
const trackAllows=(track,questionTrack)=>track==="AB"?questionTrack==="AB":[track,"AB"].includes(questionTrack);
// These explicit year/track assignments are platform plans, NOT researched school exam schedules.
// All schools deliberately share the same plan until exact, evidenced overrides exist.
const plans={1:[["trig"],["exp-log"],["plane-vector"]],2:[["space-vector","space-coordinates"],["space-line-plane"],["probability","matrix"]]};
const sharedPlans={1:plans[1],2:[["space-coordinates"],["matrix"],["probability"]]};
const academicYears=[112,113,114];
const scopes=schools.flatMap(school=>academicYears.flatMap(academic_year=>courses.flatMap(course=>[1,2].flatMap(semester=>[1,2,3].map(exam=>({
  id:`platform:${school}:${academic_year}:${course.track}:${semester}:${exam}`,school,subjectId:"math",courseId:course.id,curriculumTrack:course.track,grade:2,
  academic_year,academicYear:academic_year,semester,exam,sourceType:"platform",sourceUrl:null,
  chapterIds:(course.track==="A"?plans:sharedPlans)[semester][exam-1].map(c=>`math-108-g2-a:${c}`),
  note:`${academic_year} 學年度平台模擬安排；尚未核驗本校本次實際進度。其他學年度需另行映射。`
}))))));
function selectionMatches(row,s){
  return row.subjectId===s.subjectId&&row.courseId===s.courseId&&row.grade===s.grade&&row.school===s.school&&
    row.semester===s.semester&&row.exam===examNumber(s.exam)&&academicYear(row)===academicYear(s);
}
function resolve(s,overrides=[]){
  const candidates=[...overrides,...(root.REVIEWED_GRADE2_SCOPES||[])].filter(r=>selectionMatches(r,s));
  const ranks={official:0,inferred:1,platform:2};
  const record=candidates.sort((a,b)=>(ranks[a.sourceType]??9)-(ranks[b.sourceType]??9))[0]||scopes.find(r=>selectionMatches(r,s));
  if(!record)return {key:key(s),...s,chapterIds:[],sourceType:"platform",label:"尚未建立範圍",note:"此課程尚未建立分流資料。"};
  const pending=(root.GRADE2_SCOPE_REVIEWS||[]).find(r=>selectionMatches(r,s)&&r.status==="pending");
  return {...record,...(record.sourceType==="platform"&&pending?{note:`${pending.note} 附件原文：${pending.rawScope}`,sourceUrl:pending.sourceUrl}:{}),key:key(s),academic_year:academicYear(s),academicYear:academicYear(s),label:record.scopeLabel||record.chapterIds.map(id=>chapterById.get(id)?.label||id).join("、")||"範圍尚待章節映射"};
}
function matchesQuestion(q,scope){
  const chapter=chapterById.get(q.chapterId);
  return !!chapter&&q.grade===scope.grade&&q.subjectId===scope.subjectId&&courses.some(c=>c.id===q.courseId)&&trackAllows(selectedTrack(scope),q.curriculumTrack||selectedTrack(q))&&
    q.semester===scope.semester&&chapter.semester===scope.semester&&scope.chapterIds.includes(q.chapterId)&&
    Array.isArray(q.requiredChapterIds)&&q.requiredChapterIds.every(id=>scope.chapterIds.includes(id))&&
    (!scope.allowedSubtopics||scope.allowedSubtopics[q.chapterId]?.includes(q.sub))&&q.isOriginal===true;
}
function pool(scope,primary,fallback){
  const seen=new Set();
  return [...primary,...fallback].filter(q=>{
    if(!matchesQuestion(q,scope)||seen.has(q.id))return false;
    seen.add(q.id);return true;
  });
}
function chapterId(value,s){
  const exact=chapterById.get(value);
  if(!courses.some(c=>c.id===s.courseId))return null;
  if(exact)return exact.semester===s.semester?exact.id:null;
  return chapters.find(c=>c.semester===s.semester&&c.aliases.includes(value))?.id||null;
}
function isMath(row,subjectRows=[]){
  if(row.subject_id!=null){const subject=subjectRows.find(s=>String(s.id)===String(row.subject_id));return !!subject&&subject.code==="MATH"&&subject.enabled!==false;}
  return row.subject==="數學";
}
function isLegacyMath(row,subjectRows=[]){return (row.grade==null||Number(row.grade)===1)&&(row.subject_id!=null?isMath(row,subjectRows):(row.subject==null||row.subject==="數學"));}
function safeUrl(value){try{const u=new URL(value);return ["https:","http:"].includes(u.protocol)?u.href:null;}catch{return null;}}
// No inference from school name or a free-text scope_label. Preserve unknown labels visibly;
// a trusted but untranslatable scope closes the pool instead of widening it.
function adaptScope(row,s,subjectRows=[]){
  if(Number(row.grade)!==s.grade||!isMath(row,subjectRows)||Number(row.academic_year)!==academicYear(s)||
    Number(row.term)!==s.semester||examNumber(row.exam_name)!==examNumber(s.exam)||
    (row.course_id&&row.course_id!==s.courseId))return null;
  const sourceUrl=safeUrl(row.source_url);
  const type=({official:"official",official_school:"official",official_department:"official",inferred:"inferred",past_papers:"inferred",platform:"platform"})[row.source_type||row.provenance];
  if(!type||(type!=="platform"&&!sourceUrl))return null;
  // A/B cannot be assumed from grade alone. Legacy rows need explicit course/track metadata.
  if(row.course_id!==s.courseId&&(row.curriculum_track||row.track)!==selectedTrack(s))return null;
  const topics=Array.isArray(row.chapter_ids)?row.chapter_ids:Object.entries(row.topic_weights||{}).filter(([,w])=>Number(w)>0).map(([t])=>t);
  const mapped=topics.map(t=>chapterId(t,s));
  const unknown=topics.filter((_,i)=>!mapped[i]);
  return {...s,exam:examNumber(s.exam),chapterIds:unknown.length?[]:[...new Set(mapped)],sourceType:type,sourceUrl,
    note:unknown.length?`來源範圍含尚未映射章節：${unknown.join("、")}；暫不抽題，避免超出範圍。`:"依此學年度與考試的已建立映射抽題。"};
}
function adaptQuestion(row,subjectRows=[]){
  // Untagged legacy questions stay with grade 1; never promote them by topic name.
  if(Number(row.grade)!==2||!isMath(row,subjectRows)||row.is_original!==true||(row.question_type&&row.question_type!=="single_choice"))return null;
  const course=courses.find(c=>c.id===row.course_id);
  const track=row.curriculum_track||course?.track;
  if(!["A","B","AB"].includes(track)||(row.course_id&&!course))return null;
  if(course&&!trackAllows(course.track,track))return null;
  // Explicit legacy topic/subtopic crosswalk; never assign every "空間與矩陣" row to one chapter.
  const spaceMap={"空間坐標":"space-coordinates","空間向量":"space-vector","矩陣運算":"matrix","行列式與反矩陣":"matrix","聯立方程式":"matrix","線性變換":"matrix"};
  const legacyId=row.topic==="空間與矩陣"?spaceMap[row.subtopic]:null;
  const chapter=chapterById.get(row.chapter_id)||(legacyId?chapterById.get(`math-108-g2-a:${legacyId}`):chapters.find(c=>c.aliases.includes(row.topic)));
  if(!chapter)return null;
  const semester=Number(row.semester??row.term??chapter.semester),s={courseId:course?.id||`math-108-g2-${track.toLowerCase()}`,semester};
  const id=chapterId(chapter.id,s);
  if(!id||!Number.isSafeInteger(Number(row.id))||Number(row.id)<=0||!Array.isArray(row.options)||row.options.length!==4||
    !Number.isInteger(row.correct_index)||row.correct_index<0||row.correct_index>3||!row.question_text||!row.explanation)return null;
  const required=Array.isArray(row.required_chapter_ids)?row.required_chapter_ids.map(x=>chapterId(x,s)):[id];
  if(required.some(x=>!x))return null;
  return {id:Number(row.id),grade:2,subjectId:"math",courseId:s.courseId,curriculumTrack:track,semester,chapterId:id,requiredChapterIds:required,
    topic:chapterById.get(id).label,sub:row.subtopic||"",level:row.difficulty,q:row.question_text,o:row.options,a:row.correct_index,e:row.explanation,
    isOriginal:true,origin:"cloud"};
}
function shuffleOptions(q,random=Math.random){
  const indices=q.o.map((_,i)=>i);
  for(let i=indices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
  return {...q,o:indices.map(i=>q.o[i]),a:indices.indexOf(q.a),optionOrder:indices.map(i=>q.optionOrder?.[i]??i)};
}
const api={schemaVersion:2,schools,subjects,courses,chapters,scopes,academicYears,labels,key,resolve,matchesQuestion,pool,adaptScope,adaptQuestion,isMath,isLegacyMath,trackAllows,shuffleOptions};
root.LearningCatalog=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
