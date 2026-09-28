import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=require('../data/staging/cksh-114-1-2-g1-chinese.json');
const explanations=require('../data/staging/cksh-114-1-2-g1-chinese-explanations.cjs');

export function buildSecondPaper(){
 const excluded=new Set(input.excluded_questions.map(q=>q.number));
 if(input.questions.length+excluded.size!==input.meta.expected_question_count)throw Error('School question count mismatch');
 const questions=input.questions.map(q=>{
  const detail=explanations[q.question_number];
  if(!detail||detail.option_analysis.length!==q.options.length)throw Error(`Explanation/option mismatch Q${q.question_number}`);
  if(excluded.has(q.question_number))throw Error(`Disputed Q${q.question_number} must not enter the bank`);
  const reference=q.question_number===32?'①因尋找橡果子而巧遇小、中龍貓；②隱士；③不問世事，返璞歸真；④專注當下，取得通往異世界的邀請函':q.question_number===34?'①又髒又破的長衫；②人的感情；③將鑼丟出去；④發洩被社會淘汰的憤恨':null;
  return {...q,answer:reference?{grading:'manual_required',reference}:q.answer,
   answer_source:'原卷解析卷印答；手寫題依卷面表格參考作答',
   answer_match:true,explanation:detail,explanation_source:'platform_authored',
   wording_status:[4,8,10,28,29,32,34].includes(q.question_number)?'platform_context_with_original_options':'source_question_transcribed',
   content_capture_status:'inline_question_original_option_order'};
 });
 return {...input,questions};
}

export function generatedSecondPaper(){return '/* Generated from the school analysis PDF staging; disputed items excluded. */\n'+
 '(function(root){root.CKSH_UNIFIED_BANK_114_CHINESE_SECOND='+JSON.stringify(buildSecondPaper())+';})(window);\n';}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 fs.writeFileSync(path.join(root,'school-cksh-114-chinese-second-unified-bank.js'),generatedSecondPaper());
 console.log(`Generated ${buildSecondPaper().questions.length} usable items`);
}
