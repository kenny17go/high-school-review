import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const QUESTION_TYPES=new Set(['single_choice','multiple_choice','fill_blank','numeric','short_answer','essay']);
export const SOURCE_TYPES=new Set(['ceec_official','school_official','school_exam_verified','platform_generated','platform_simulated','unknown']);
export const REQUIRED_EXPLANATION=['concept','key_insight','solution','common_errors'];

const clean=v=>typeof v==='string'?v.trim():v;
const asArray=v=>Array.isArray(v)?v:[];
const unique=a=>[...new Set(a)];
const countBy=(items,key)=>Object.fromEntries([...new Set(items.map(x=>x[key]??'unknown'))].sort().map(value=>[value,items.filter(x=>(x[key]??'unknown')===value).length]));

export function normalizeQuestion(raw,exam={}){
 const q={...raw};
 q.id=clean(q.id);
 q.subject=clean(q.subject||exam.subject);
 q.academic_year=Number(q.academic_year??exam.academic_year);
 q.exam=clean(q.exam||exam.exam);
 q.variant=clean(q.variant||exam.variant);
 q.question_number=Number(q.question_number);
 q.questionType=clean(q.questionType);
 q.sourceType=clean(q.sourceType||exam.sourceType||'unknown');
 q.source_url=clean(q.source_url||exam.source_url);
 q.answer_url=clean(q.answer_url||exam.answer_url);
 q.source_title=clean(q.source_title||exam.source_title);
 q.source_page=q.source_page==null?(exam.source_page==null?null:Number(exam.source_page)):Number(q.source_page);
 q.group_id=clean(q.group_id||q.groupId)||null;
 q.depends_on=asArray(q.depends_on).map(String);
 q.primary_unit=clean(q.primary_unit)||null;
 q.secondary_concepts=unique(asArray(q.secondary_concepts).map(clean).filter(Boolean));
 q.skill_tags=unique(asArray(q.skill_tags).map(clean).filter(Boolean));
 q.explanation=q.explanation&&typeof q.explanation==='object'?q.explanation:null;
 q.explanation_source=q.explanation_source||'platform_authored';
 q.review_flags=unique(asArray(q.review_flags).map(clean).filter(Boolean));
 q.parse_confidence=Number.isFinite(Number(q.parse_confidence))?Number(q.parse_confidence):null;
 q.classification_confidence=Number.isFinite(Number(q.classification_confidence))?Number(q.classification_confidence):null;
 q.answer_match=q.answer_match===false?false:true;
 q.classification_status='needs_review';
 q.pipeline_stage='staging';
 q.published=false;
 return q;
}

function answerShapeOk(q){
 const a=q.answer;
 if(q.questionType==='single_choice')return Number.isInteger(a?.index);
 if(q.questionType==='multiple_choice')return Array.isArray(a?.indices)&&a.indices.length>0&&a.indices.every(Number.isInteger);
 if(q.questionType==='fill_blank')return Array.isArray(a?.cells)&&a.cells.length>0&&a.cells.every(x=>String(x).trim()!=='');
 if(q.questionType==='numeric')return a!=null&&(typeof a==='number'||a?.value!=null);
 if(q.questionType==='short_answer'||q.questionType==='essay')return a?.grading==='manual_required'||a?.reference!=null;
 return false;
}

export function validateQuestion(q,groups=new Map()){
 const errors=[],warnings=[];
 const need=(ok,code)=>{if(!ok)errors.push(code);};
 need(Boolean(q.id),'missing_id');
 need(Boolean(q.subject),'missing_subject');
 need(Number.isInteger(q.academic_year)&&q.academic_year>0,'invalid_academic_year');
 need(Number.isInteger(q.question_number)&&q.question_number>0,'invalid_question_number');
 need(QUESTION_TYPES.has(q.questionType),'unsupported_question_type');
 need(SOURCE_TYPES.has(q.sourceType)&&q.sourceType!=='unknown','invalid_source_type');
 need(Boolean(q.source_title),'missing_source_title');
 need(Boolean(q.source_url),'missing_source_url');
 need(Boolean(clean(q.stem)),'missing_question_stem');
 if(q.source_url){
  try{
   const u=new URL(q.source_url);
   need(['http:','https:'].includes(u.protocol),'unsafe_source_url');
   if(q.sourceType==='ceec_official')need(u.hostname==='ceec.edu.tw'||u.hostname.endsWith('.ceec.edu.tw'),'invalid_ceec_domain');
  }catch{errors.push('invalid_source_url');}
 }
 if(q.sourceType==='ceec_official')need(q.academic_year>=110,'pre_110_ceec_blocked');
 if(q.sourceType==='ceec_official')need(Boolean(q.answer_url),'missing_answer_url');
 if(q.answer_url){
  try{
   const u=new URL(q.answer_url);
   need(['http:','https:'].includes(u.protocol),'unsafe_answer_url');
   if(q.sourceType==='ceec_official')need(u.hostname==='ceec.edu.tw'||u.hostname.endsWith('.ceec.edu.tw'),'invalid_ceec_answer_domain');
  }catch{errors.push('invalid_answer_url');}
 }
 need(q.answer_match!==false,'official_answer_mismatch');
 need(answerShapeOk(q),'invalid_answer_shape');
 if(['single_choice','multiple_choice'].includes(q.questionType)){
  need(Array.isArray(q.options)&&q.options.length>=2,'missing_options');
  if(Array.isArray(q.options)){
   const max=q.options.length-1;
   const indices=q.questionType==='single_choice'?[q.answer?.index]:q.answer?.indices||[];
   need(indices.every(i=>Number.isInteger(i)&&i>=0&&i<=max),'answer_index_out_of_range');
  }
 }
 if(q.group_id&&!groups.has(q.group_id))errors.push('missing_group_context');
 if(['short_answer','essay'].includes(q.questionType)&&q.sourceType==='ceec_official'&&!q.grading_rubric)warnings.push('missing_grading_rubric');
 if(q.source_page==null||!Number.isInteger(q.source_page)||q.source_page<1)warnings.push('missing_source_page');
 if(q.parse_confidence!=null&&(q.parse_confidence<0||q.parse_confidence>1))errors.push('invalid_parse_confidence');
 else if(q.parse_confidence!=null&&q.parse_confidence<0.9)warnings.push('low_parse_confidence');
 if(q.classification_confidence!=null&&(q.classification_confidence<0||q.classification_confidence>1))errors.push('invalid_classification_confidence');
 else if(q.classification_confidence!=null&&q.classification_confidence<0.8)warnings.push('low_classification_confidence');
 warnings.push(...q.review_flags);
 if(!q.primary_unit)warnings.push('missing_primary_unit');
 if(!q.skill_tags.length)warnings.push('missing_skill_tags');
 if(!q.explanation)warnings.push('missing_explanation');
 else for(const k of REQUIRED_EXPLANATION)if(!clean(q.explanation[k]))warnings.push('explanation_'+k+'_missing');
 if(q.explanation_source==='platform_authored'&&q.explanation_status==='official')errors.push('platform_explanation_cannot_be_official');
 return {errors:unique(errors),warnings:unique(warnings)};
}

export function validateGroup(group){
 const errors=[],warnings=[];
 const need=(ok,code)=>{if(!ok)errors.push(code);};
 need(Boolean(group.id),'missing_group_id');
 need(Boolean(clean(group.stem)),'missing_group_context');
 if(group.source_url){
  try{const u=new URL(group.source_url);need(['http:','https:'].includes(u.protocol),'unsafe_group_source_url');}
  catch{errors.push('invalid_group_source_url');}
 }
 if(group.rights_status==='metadata_only_pending_rights')warnings.push('rights_review_required','external_context_required');
 warnings.push(...asArray(group.review_flags).map(clean).filter(Boolean));
 return {errors:unique(errors),warnings:unique(warnings)};
}

export function prepareExamBatch(input){
 const exam=input?.exam||{};
 const rawGroups=asArray(input?.groups);
 const groups=new Map(rawGroups.map(g=>{
  const group={...g,id:String(g.id),pipeline_stage:'staging',classification_status:'needs_review'};
  const validation=validateGroup(group),reasons=unique([...validation.errors,...validation.warnings]);
  return [group.id,{...group,validation,review_required:reasons.length>0,review_reasons:reasons}];
 }));
 const seenIds=new Set(),seenNumbers=new Set();
 const questions=asArray(input?.questions).map(raw=>{
  const q=normalizeQuestion(raw,exam);
  const result=validateQuestion(q,groups);
  if(seenIds.has(q.id))result.errors.push('duplicate_id'); else seenIds.add(q.id);
  if(seenNumbers.has(q.question_number))result.errors.push('duplicate_question_number'); else seenNumbers.add(q.question_number);
  const reasons=unique([...result.errors,...result.warnings]);
  return {...q,validation:{errors:unique(result.errors),warnings:unique(result.warnings)},review_required:reasons.length>0,review_reasons:reasons};
 });
 const exceptions=questions.filter(q=>q.review_required);
 const groupExceptions=[...groups.values()].filter(g=>g.review_required);
 const cleanQuestions=questions.filter(q=>!q.review_required);
 const expectedCount=Number(exam.expected_question_count||0)||null;
 const numbers=questions.map(q=>q.question_number).filter(Number.isInteger).sort((a,b)=>a-b);
 const missingNumbers=expectedCount?[...Array(expectedCount)].map((_,i)=>i+1).filter(n=>!numbers.includes(n)):[];
 const examErrors=[];
 if(expectedCount&&questions.length!==expectedCount)examErrors.push('question_count_mismatch');
 if(missingNumbers.length)examErrors.push('missing_question_numbers');
 const summary={
  exam_id:exam.id||null,
  total:questions.length,
  clean:cleanQuestions.length,
  needs_review:exceptions.length,
  group_needs_review:groupExceptions.length,
  error_count:questions.filter(q=>q.validation.errors.length).length,
  warning_count:questions.filter(q=>q.validation.warnings.length).length,
  group_error_count:[...groups.values()].filter(g=>g.validation.errors.length).length,
  group_warning_count:[...groups.values()].filter(g=>g.validation.warnings.length).length,
  groups:groups.size,
  expected_question_count:expectedCount,
  missing_question_numbers:missingNumbers,
  exam_errors:examErrors,
  by_type:countBy(questions,'questionType'),
  by_status:countBy(questions,'classification_status'),
  by_reason:Object.fromEntries(unique(exceptions.flatMap(q=>q.review_reasons)).sort().map(reason=>[reason,exceptions.filter(q=>q.review_reasons.includes(reason)).length])),
  by_group_reason:Object.fromEntries(unique(groupExceptions.flatMap(g=>g.review_reasons)).sort().map(reason=>[reason,groupExceptions.filter(g=>g.review_reasons.includes(reason)).length])),
  ready_for_human_review:examErrors.length===0,
  ready_for_publish:false
 };
 return {schema_version:'batch-import-v1',exam,groups:[...groups.values()],questions,review_summary:summary,exception_queue:exceptions.map(q=>({id:q.id,question_number:q.question_number,reasons:q.review_reasons,source_page:q.source_page})),group_exception_queue:groupExceptions.map(g=>({id:g.id,question_numbers:g.question_numbers||[],reasons:g.review_reasons,source_page:g.source_page}))};
}

export function approveBatch(batch,review){
 if(!review?.reviewer||!review?.evidence)throw Error('Reviewer and evidence required');
 if(batch.review_summary?.exam_errors?.length)throw Error('Blocking exam-level validation errors remain');
 if(batch.questions.some(q=>q.validation?.errors?.length))throw Error('Blocking validation errors remain');
 if((batch.groups||[]).some(g=>g.validation?.errors?.length))throw Error('Blocking group validation errors remain');
 if(batch.questions.some(q=>q.review_required&&!review.approved_question_ids?.includes(q.id)))throw Error('All exceptions require explicit approval');
 if((batch.groups||[]).some(g=>g.review_required&&!review.approved_group_ids?.includes(g.id)))throw Error('All group exceptions require explicit approval');
 const verified_at=new Date().toISOString();
 return {...batch,groups:(batch.groups||[]).map(g=>({...g,classification_status:'verified',review_required:false,review_reasons:[],reviewer:review.reviewer,review_evidence:review.evidence,verified_at,pipeline_stage:'verified'})),questions:batch.questions.map(q=>({...q,classification_status:'verified',review_required:false,review_reasons:[],reviewer:review.reviewer,review_evidence:review.evidence,verified_at,pipeline_stage:'verified'})),review_summary:{...batch.review_summary,needs_review:0,group_needs_review:0,ready_for_publish:true,reviewed_by:review.reviewer,verified_at},exception_queue:[],group_exception_queue:[]};
}

export function publishArtifact(batch){
 if(!batch.review_summary?.ready_for_publish||batch.questions.some(q=>q.classification_status!=='verified'||!q.verified_at))throw Error('Review gate: batch is not verified');
 return {...batch,questions:batch.questions.map(q=>({...q,published:true,pipeline_stage:'publish_artifact'})),review_summary:{...batch.review_summary,published_artifact:true}};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [inputPath,outputPath]=process.argv.slice(2);
 if(!inputPath||!outputPath)throw Error('Usage: node scripts/batch-exam-import.mjs input.json staging-output.json');
 if(path.resolve(inputPath)===path.resolve(outputPath))throw Error('Raw input and staging output must be different files');
 const input=JSON.parse(fs.readFileSync(inputPath,'utf8'));
 const result=prepareExamBatch(input);
 fs.writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result.review_summary,null,2));
 if(result.review_summary.error_count)process.exitCode=2;
}
