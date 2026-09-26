import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceModule='gsat-111-unified-bank.js';
const source=fs.readFileSync(path.join(root,sourceModule),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context,{filename:sourceModule});
const bank=context.window.GSAT_UNIFIED_BANK_111_MATHA;
const PAPER_URL=bank.meta.paperUrl;
const ANSWER_URL=bank.meta.answerUrl;
const RUBRIC_URL=bank.meta.rubricUrl;
const MANIFEST={
 1:{index:3},2:{index:0},3:{index:4},4:{index:2},5:{index:1},6:{index:4},
 7:{indices:[1,3]},8:{indices:[0,3]},9:{indices:[2,3]},10:{indices:[0,1]},
 11:{indices:[1,2,3]},12:{indices:[0,1]},13:{cells:['4','2']},
 14:{cells:['2','1','2']},15:{cells:['1','9','2']},
 16:{cells:['-','3','-','2','5']},17:{cells:['2','1']},18:{index:3},
 19:{grading:'manual_required',reference:'cos∠OA′B′=0; A′=(√3,150°)=(√3,5π/6) in polar coordinates'},
 20:{grading:'manual_required',reference:'area(Ω)=√3/2−π/12; area(R)=5π/12'}
};
const sameAnswer=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function buildGoldenInput(){
 const questions=Array.from(bank.questions,q=>({...q,
  source_url:PAPER_URL,
  answer_url:ANSWER_URL,
  answer_match:sameAnswer(q.answer,MANIFEST[q.question_number]),
  parse_confidence:0.97,
  classification_confidence:0.92,
  review_flags:[...(q.review_flags||[])],
  input_classification_status:q.classification_status,
  content_capture_status:q.visual_stimulus?.asset?'rendered_visual_asset':q.visual_stimulus?'text_plus_visual_reference':'inline_normalized',
  grading_rubric:q.grading_rubric||([19,20].includes(q.question_number)?{url:RUBRIC_URL}:null),
  rubric_url:[19,20].includes(q.question_number)?RUBRIC_URL:null
 }));
 return {
  exam:{id:'ceec-111-matha',subject:'math',academic_year:111,exam:'學測',variant:'數學A',sourceType:'ceec_official',source_title:'111學年度學科能力測驗數學A考科',source_url:PAPER_URL,answer_url:ANSWER_URL,expected_question_count:20,total_points:100,raw_layer:'official_pdf_reference'},
  groups:bank.groups.map(group=>({...group,review_flags:[]})),
  answer_manifest:MANIFEST,
  visual_review:{questions:Array.from({length:20},(_,i)=>i+1),paper_pages:[1,2,3,4,5,6],answer_pages:[1],rubric_pages:[1,2,3],method:'downloaded_official_pdfs_and_rendered_question_pages',reviewed_on:'2026-09-26'},
  questions
 };
}

export function buildGoldenArtifacts(){
 const raw=buildGoldenInput();
 return {raw,staging:prepareExamBatch(raw)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-111-matha.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-111-matha.batch-import-v1.json'));
 if(rawPath===stagingPath)throw Error('Raw input and staging output must be different files');
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});
 fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 const {raw,staging}=buildGoldenArtifacts();
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
