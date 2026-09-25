import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PAPER_URL='https://www.ceec.edu.tw/files/file_pool/1/0o051426180137211766/03-113%E5%AD%B8%E6%B8%AC%E6%95%B8a%E8%A9%A6%E9%A1%8C%E5%AE%9A%E7%A8%BF.pdf';
const ANSWER_URL='https://www.ceec.edu.tw/files/file_pool/1/0O021615939697483843/03-113%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf';
const RUBRIC_URL='https://www.ceec.edu.tw/files/file_pool/1/0o051426762594817766/04-113%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8a%E8%80%83%E7%A7%91%E9%9D%9E%E9%81%B8%E6%93%87%E9%A1%8C%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88%E8%88%87%E8%A9%95%E5%88%86%E5%8E%9F%E5%89%87.pdf';
const RESPONSE_URL='https://www.ceec.edu.tw/files/file_pool/1/0O037599020219134119/03-113%E5%AD%B8%E6%B8%AC%E8%A9%A6%E9%A1%8C%E6%88%96%E7%AD%94%E6%A1%88%E4%B9%8B%E5%8F%8D%E6%98%A0%E6%84%8F%E8%A6%8B%E5%9B%9E%E8%A6%86%EF%BC%88%E6%95%B8%E5%AD%B8A%EF%BC%89.pdf';
const MANIFEST={1:{index:1},2:{index:4},3:{index:0},4:{index:1},5:{index:3},6:{index:2},7:{indices:[2,3]},8:{indices:[1,2]},9:{indices:[2]},10:{indices:[2,4]},11:{indices:[1,2]},12:{indices:[1,3,4]},13:{cells:['2','3','5']},14:{cells:['-','3','3']},15:{cells:['2','5']},16:{cells:['2','5','5']},17:{cells:['1','3']},18:{index:3},19:{grading:'manual_required',reference:'a^2 >= 3(b^2+c^2)'},20:{grading:'manual_required',reference:'2-2sqrt(3) <= c <= 2+2sqrt(3); min OP=4(sqrt(3)-1)'}};
const RUBRICS={
 19:{url:RUBRIC_URL,full_score:['由θ≤π/6正確寫出 a/√(a²+b²+c²)≥√3/2','推導得到a²≥3(b²+c²)'],partial_score:['夾角公式與方向正確，但平方或代數整理未完成']},
 20:{url:RUBRIC_URL,full_score:['正確求得2-2√3≤c≤2+2√3','說明c=-2不在可行區間，並求得min OP=√(64-32√3)=4(√3-1)'],partial_score:['正確建立(c+4)²≥3c²或OP²=2(c+2)²+8，但範圍或最值未完成']}
};

function loadSource(){
 const context={window:{}};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'gsat-113-unified-bank.js'),'utf8'),context,{filename:'gsat-113-unified-bank.js'});
 return context.window.GSAT_UNIFIED_BANK_113_MATHA;
}

const sameAnswer=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function buildGoldenInput(){
 const source=loadSource();
 const questions=Array.from(source.questions,q=>({...q,
  source_url:PAPER_URL,
  answer_url:ANSWER_URL,
  answer_match:sameAnswer(q.answer,MANIFEST[q.question_number]),
  parse_confidence:0.98,
  classification_confidence:0.95,
  review_flags:q.question_number===7?['official_answer_objection_resolved']:[],
  review_evidence:q.question_number===7?RESPONSE_URL:null,
  input_classification_status:q.classification_status,
  content_capture_status:'inline_normalized',
  grading_rubric:RUBRICS[q.question_number]||null,
  rubric_url:RUBRICS[q.question_number]?.url||null
 }));
 return {
  exam:{id:'ceec-113-matha',subject:'math',academic_year:113,exam:'學測',variant:'數學A',sourceType:'ceec_official',source_title:'113學年度學科能力測驗數學A考科',source_url:PAPER_URL,answer_url:ANSWER_URL,expected_question_count:20,total_points:100,raw_layer:'official_pdf_reference'},
  groups:source.groups.map(group=>({...group,review_flags:[]})),
  answer_manifest:MANIFEST,
  official_responses:[{question_number:7,url:RESPONSE_URL,outcome:'official_answer_unchanged',answer:{indices:[2,3]},note:'坐標平面上的點集完全相同，不等同於平移後圖形全等。'}],
  visual_review:{questions:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],paper_pages:[1,2,3,4,5,6,7],rubric_pages:[1,2],response_pages:[1,2],method:'rendered_official_pdf',reviewed_on:'2026-09-25'},
  questions
 };
}

export function buildGoldenArtifacts(){
 const raw=buildGoldenInput();
 return {raw,staging:prepareExamBatch(raw)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-113-matha.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-113-matha.batch-import-v1.json'));
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});
 fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 const {raw,staging}=buildGoldenArtifacts();
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
