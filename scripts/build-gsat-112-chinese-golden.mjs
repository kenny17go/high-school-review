import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'gsat-112-chinese-unified-bank.js'),'utf8'),context);
const bank=context.window.GSAT_UNIFIED_BANK_112_CHINESE;
const letters="A C A D D D D A D C C A B C B A D C C B B B B D B AB ABC BCD BE BE BCE BDE / A / A /".split(" ");
const manifest=Object.fromEntries(letters.map((value,i)=>[i+1,value==="/"
 ?{grading:"manual_required",reference:{
  33:"(1)流傳中須經不同歷史階段過濾篩選；創作時展現新手法或開創新視野。(2)《論語》建言至今仍可為人生解惑。",
  35:"(1)各就所抽中的人物賦詩歌詠。(2)①生命有限，終有一死；②隨任自然、曠達釋懷。",
  37:"(1)《哈姆雷特》反映人性現實，能獲得普遍回響。(2)經典熟悉感提供高層主管參考座標與向觀眾行銷的著力點。"
 }[i+1]}:value.length===1?{index:value.charCodeAt(0)-65}:{indices:value.split("").map(c=>c.charCodeAt(0)-65)}]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function buildGoldenInput(){
 const questions=Array.from(bank.questions,q=>({...q,answer_match:same(q.answer,manifest[q.question_number]),input_classification_status:q.classification_status,content_capture_status:q.group_id?'question_plus_group_reference':'inline_normalized'}));
 return {
  exam:{id:'ceec-112-chinese',subject:'chinese',academic_year:112,exam:'學測',variant:'國綜',sourceType:'ceec_official',
   source_title:'112學年度學科能力測驗國語文綜合能力測驗',source_url:bank.meta.paperUrl,answer_url:bank.meta.answerUrl,
   expected_question_count:37,total_points:100,raw_layer:'official_pdf_reference'},
  groups:bank.groups.map(g=>({...g})),answer_manifest:manifest,
  visual_review:{questions:Array.from({length:37},(_,i)=>i+1),paper_pages:Array.from({length:11},(_,i)=>i+1),answer_pages:[1],rubric_pages:[1,2,3],objection_pages:[1,2,3,4,5,6,7,8,9,10,11,12],
   method:'official_pdfs_text_extraction_and_targeted_rendered_page_review',reviewed_on:'2026-09-27'},
  questions
 };
}
export function buildGoldenArtifacts(){const raw=buildGoldenInput();return {raw,staging:prepareExamBatch(raw)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-112-chinese.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-112-chinese.batch-import-v1.json'));
 const {raw,staging}=buildGoldenArtifacts();
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
