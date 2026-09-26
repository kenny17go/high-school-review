import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceModule='gsat-115-chinese-unified-bank.js';
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,sourceModule),'utf8'),context,{filename:sourceModule});
const bank=context.window.GSAT_UNIFIED_BANK_115_CHINESE;
const MANIFEST={
 1:{index:2},2:{index:0},3:{index:3},4:{index:1},5:{index:2},6:{index:3},7:{index:2},8:{index:3},9:{index:0},10:{index:2},
 11:{index:3},12:{index:1},13:{index:1},14:{index:1},15:{index:0},16:{index:3},17:{index:1},18:{index:3},19:{index:3},20:{index:0},
 21:{index:0},22:{index:2},23:{index:1},24:{index:2},25:{indices:[1,4]},26:{indices:[0,1,3]},27:{indices:[0,1,3]},28:{indices:[0,2,3,4]},
 29:{indices:[2,3]},30:{indices:[2,3]},31:{indices:[0,1,4]},
 32:{grading:'manual_required',reference:'(1)教育栽培子孫。(2)①取材女子日常生活的平凡小事。②幽閑貞靜之德，能章明王者教化。'},
 33:{grading:'manual_required',reference:'(1)長輩主張的高壓控制方式／打罵碎念管束。(2)①覺得抱歉；②依習俗與養父母疼愛，本應嫁卻不肯嫁。'},
 34:{grading:'manual_required',reference:'(1)為讓孩子認識／自由表達負面情緒，耐心陪伴並承受譴責。(2)因婚姻須有感情基礎／與養兄無感情，拒絕作新娘。'},
 35:{index:2},36:{index:0}
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function buildGoldenInput(){
 const questions=Array.from(bank.questions,q=>({...q,answer_match:same(q.answer,MANIFEST[q.question_number]),input_classification_status:q.classification_status,content_capture_status:q.group_id?'question_plus_group_reference':'inline_normalized'}));
 return {
  exam:{id:'ceec-115-chinese',subject:'chinese',academic_year:115,exam:'學測',variant:'國綜',sourceType:'ceec_official',source_title:'115學年度學科能力測驗國語文綜合能力測驗',source_url:bank.meta.paperUrl,answer_url:bank.meta.answerUrl,expected_question_count:36,total_points:100,raw_layer:'official_pdf_reference'},
  groups:bank.groups.map(g=>({...g})),answer_manifest:MANIFEST,
  visual_review:{questions:Array.from({length:36},(_,i)=>i+1),paper_pages:Array.from({length:11},(_,i)=>i+1),answer_pages:[1],rubric_pages:[1,2,3],method:'downloaded_official_pdfs_text_extraction_and_rendered_page_review',reviewed_on:'2026-09-26'},
  questions
 };
}
export function buildGoldenArtifacts(){const raw=buildGoldenInput();return {raw,staging:prepareExamBatch(raw)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-115-chinese.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-115-chinese.batch-import-v1.json'));
 const {raw,staging}=buildGoldenArtifacts();
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
