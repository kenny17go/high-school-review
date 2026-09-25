import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PAPER_URL='https://www.ceec.edu.tw/files/file_pool/1/0n045358375872115148/03-112%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8a%E8%A9%A6%E5%8D%B7.pdf';
const ANSWER_URL='https://www.ceec.edu.tw/files/file_pool/1/0N014509729103630585/03-112%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf';
const RUBRIC_URL='https://www.ceec.edu.tw/files/file_pool/1/0n049421028143125535/04-112%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8a%E9%9D%9E%E9%81%B8%E6%93%87%E9%A1%8C%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88%E8%88%87%E8%A9%95%E5%88%86%E5%8E%9F%E5%89%87.pdf';
const MANIFEST={1:{index:3},2:{index:4},3:{index:3},4:{index:0},5:{index:1},6:{index:2},7:{indices:[2,4]},8:{indices:[0,3]},9:{indices:[2,4]},10:{indices:[0,2,4]},11:{indices:[1,4]},12:{indices:[0,4]},13:{cells:['8','0']},14:{cells:['3','-','9']},15:{cells:['3','4']},16:{cells:['2','2']},17:{cells:['5','2']},18:{index:3},19:{grading:'manual_required',reference:'Q=(-36/25,48/25); vector BQ=2 vector AP'},20:{grading:'manual_required',reference:'distance(A,BQ)=72/25; area(PABQ)=108/25'}};
const RUBRICS={
 19:{url:RUBRIC_URL,full_score:['根據題意正確說明向量BQ=2向量AP，且理由正確','正確求得Q=(-36/25,48/25)，且過程正確'],partial_score:['平行、倍角或坐標方法正確，但向量關係或Q坐標未完成']},
 20:{url:RUBRIC_URL,full_score:['正確求得A到直線BQ的距離72/25，且過程正確','正確求得四邊形PABQ面積108/25，且過程正確'],partial_score:['正確建立直線BQ、點線距離或梯形面積式，但計算未完成']}
};

function loadSource(){
 const context={window:{}};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'gsat-112-unified-bank.js'),'utf8'),context,{filename:'gsat-112-unified-bank.js'});
 return context.window.GSAT_UNIFIED_BANK_112_MATHA;
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
  review_flags:[],
  input_classification_status:q.classification_status,
  content_capture_status:'inline_normalized',
  grading_rubric:RUBRICS[q.question_number]||null,
  rubric_url:RUBRICS[q.question_number]?.url||null
 }));
 return {
  exam:{id:'ceec-112-matha',subject:'math',academic_year:112,exam:'學測',variant:'數學A',sourceType:'ceec_official',source_title:'112學年度學科能力測驗數學A考科',source_url:PAPER_URL,answer_url:ANSWER_URL,expected_question_count:20,total_points:100,raw_layer:'official_pdf_reference'},
  groups:source.groups.map(group=>({...group,review_flags:[]})),
  answer_manifest:MANIFEST,
  visual_review:{questions:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],paper_pages:[1,2,3,4,5,6,7],answer_pages:[1],rubric_pages:[1,2,3],method:'rendered_official_pdf',reviewed_on:'2026-09-25'},
  questions
 };
}

export function buildGoldenArtifacts(){
 const raw=buildGoldenInput();
 return {raw,staging:prepareExamBatch(raw)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-112-matha.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-112-matha.batch-import-v1.json'));
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});
 fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 const {raw,staging}=buildGoldenArtifacts();
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
