import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'gsat-113-chinese-unified-bank.js'),'utf8'),context);
const bank=context.window.GSAT_UNIFIED_BANK_113_CHINESE;
const letters="A A C D D D C B B A C A C C D B B C A D B D D B ABC ACE BE ADE BCE AE CE / / B D /".split(" ");
const manifest=Object.fromEntries(letters.map((value,i)=>[i+1,value==="/"
 ?{grading:"manual_required",reference:{
  32:"(1)自主的回憶。(2)往日失而復得的喜悅；意識到往日已逝的感傷。",
  33:"(1)斷片：不完整；照片褪色：逐漸失去細節。(2)感官：嗅覺（鼻子）；大腦：杏仁核＋海馬迴。",
  36:"(1)由帝王淪為囚徒。(2)劍；劍是他征戰沙場的工具。"
 }[i+1]}:value.length===1?{index:value.charCodeAt(0)-65}:{indices:value.split("").map(c=>c.charCodeAt(0)-65)}]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function buildGoldenInput(){
 const questions=Array.from(bank.questions,q=>({...q,answer_match:same(q.answer,manifest[q.question_number]),input_classification_status:q.classification_status,content_capture_status:q.group_id?'question_plus_group_reference':'inline_normalized'}));
 return {
  exam:{id:'ceec-113-chinese',subject:'chinese',academic_year:113,exam:'學測',variant:'國綜',sourceType:'ceec_official',
   source_title:'113學年度學科能力測驗國語文綜合能力測驗',source_url:bank.meta.paperUrl,answer_url:bank.meta.answerUrl,
   expected_question_count:36,total_points:100,raw_layer:'official_pdf_reference'},
  groups:bank.groups.map(g=>({...g})),answer_manifest:manifest,
  visual_review:{questions:Array.from({length:36},(_,i)=>i+1),paper_pages:Array.from({length:11},(_,i)=>i+1),answer_pages:[1],rubric_pages:[1,2,3],
   method:'official_pdfs_text_extraction_and_targeted_rendered_page_review',reviewed_on:'2026-09-26'},
  questions
 };
}
export function buildGoldenArtifacts(){const raw=buildGoldenInput();return {raw,staging:prepareExamBatch(raw)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-113-chinese.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-113-chinese.batch-import-v1.json'));
 const {raw,staging}=buildGoldenArtifacts();
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
