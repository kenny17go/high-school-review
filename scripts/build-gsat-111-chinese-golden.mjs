import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'gsat-111-chinese-unified-bank.js'),'utf8'),context);
const bank=context.window.GSAT_UNIFIED_BANK_111_CHINESE;
const letters="A B A C A B B B C B B A C A D C B A D C D D C D C BD ADE CE ABC ABD CE AB B / / / B".split(" ");
const manifest=Object.fromEntries(letters.map((value,i)=>[i+1,value==="/"
 ?{grading:"manual_required",reference:{
  34:"(1)能作苦。(2)德行好；君真端謹。或：心思純淨；歸宜潔持。",
  35:"(1)解決氣候變遷問題。(2)既有全球基礎設施運作到正常壽命時，排放量會超出大災難前可接受限額。",
  36:"(1)若知氣候問題無法解決，民眾便不想減碳。(2)即使不知能否解決氣候變遷，仍應繼續減碳。"
 }[i+1]}:value.length===1?{index:value.charCodeAt(0)-65}:{indices:value.split("").map(c=>c.charCodeAt(0)-65)}]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function buildGoldenInput(){
 const questions=Array.from(bank.questions,q=>({...q,answer_match:same(q.answer,manifest[q.question_number]),input_classification_status:q.classification_status,content_capture_status:q.group_id?'question_plus_group_reference':'inline_normalized'}));
 return {
  exam:{id:'ceec-111-chinese',subject:'chinese',academic_year:111,exam:'學測',variant:'國綜',sourceType:'ceec_official',
   source_title:'111學年度學科能力測驗國語文綜合能力測驗',source_url:bank.meta.paperUrl,answer_url:bank.meta.answerUrl,
   expected_question_count:37,total_points:100,raw_layer:'official_pdf_reference'},
  groups:bank.groups.map(g=>({...g})),answer_manifest:manifest,
  visual_review:{questions:Array.from({length:37},(_,i)=>i+1),paper_pages:Array.from({length:11},(_,i)=>i+1),answer_pages:[1],rubric_pages:[1,2,3],objection_pages:Array.from({length:10},(_,i)=>i+1),
   method:'official_pdfs_text_extraction_and_targeted_rendered_page_review',reviewed_on:'2026-09-27'},
  questions
 };
}
export function buildGoldenArtifacts(){const raw=buildGoldenInput();return {raw,staging:prepareExamBatch(raw)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-111-chinese.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-111-chinese.batch-import-v1.json'));
 const {raw,staging}=buildGoldenArtifacts();
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
