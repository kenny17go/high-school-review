import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'gsat-114-chinese-unified-bank.js'),'utf8'),context);
const bank=context.window.GSAT_UNIFIED_BANK_114_CHINESE;
const letters="A D B C A D C C D C B B A D A C B B B D C A C A CE AE CE BD AE ABD BDE D D / / /".split(" ");
const manifest=Object.fromEntries(letters.map((value,i)=>[i+1,value==="/"
 ?{grading:"manual_required",reference:{
  34:"(1)他是紅拂的伴侶，不容許虯髯客有非分之想。(2)出家人的框架，慈悲為懷。",
  35:"(1)以兄妹界定她與虯髯客的關係，並立刻下拜，不容虯髯客拒絕。(2)捨去做妖仙，要修成正果。",
  36:"(1)紅拂聰慧，故李靖應非等閒之輩。(2)①避地太原；②能投明主。或①吃負心人的心肝；②有膽識。"
 }[i+1]}:value.length===1?{index:value.charCodeAt(0)-65}:{indices:value.split("").map(c=>c.charCodeAt(0)-65)}]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function buildGoldenInput(){
 const questions=Array.from(bank.questions,q=>({...q,answer_match:same(q.answer,manifest[q.question_number]),input_classification_status:q.classification_status,content_capture_status:q.group_id?'question_plus_group_reference':'inline_normalized'}));
 return {
  exam:{id:'ceec-114-chinese',subject:'chinese',academic_year:114,exam:'學測',variant:'國綜',sourceType:'ceec_official',
   source_title:'114學年度學科能力測驗國語文綜合能力測驗',source_url:bank.meta.paperUrl,answer_url:bank.meta.answerUrl,
   expected_question_count:36,total_points:100,raw_layer:'official_pdf_reference'},
  groups:bank.groups.map(g=>({...g})),answer_manifest:manifest,
  visual_review:{questions:Array.from({length:36},(_,i)=>i+1),paper_pages:Array.from({length:11},(_,i)=>i+1),answer_pages:[1],rubric_pages:[1,2,3],
   method:'official_pdfs_text_extraction_and_targeted_rendered_page_review',reviewed_on:'2026-09-26'},
  questions
 };
}
export function buildGoldenArtifacts(){const raw=buildGoldenInput();return {raw,staging:prepareExamBatch(raw)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-114-chinese.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-114-chinese.batch-import-v1.json'));
 const {raw,staging}=buildGoldenArtifacts();
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
