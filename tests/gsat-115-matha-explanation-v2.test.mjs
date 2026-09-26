import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const context={window:{}};vm.createContext(context);
for(const file of ['gsat-115-unified-bank.js','unified-question-bank.js'])vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),context,{filename:file});
const qs=Array.from(context.window.GSAT_UNIFIED_BANK_115_MATHA.questions);
const mapped=Array.from(context.window.UnifiedQuestionBank.all()).filter(q=>q.subject==='math'&&q.academic_year===115);
const golden=JSON.parse(fs.readFileSync(new URL('data/raw/ceec-115-matha.json',root),'utf8'));
test('115 Math A: all 20 answers retain independent saved manifest',()=>{
 assert.equal(qs.length,20);assert.equal(mapped.length,20);
 for(const q of qs){assert.equal(JSON.stringify(q.answer),JSON.stringify(golden.answer_manifest[q.question_number]),'Q'+q.question_number);}
});
test('all twenty V2 explanations are complete and flow into shared bank',()=>{
 for(const n of Array.from({length:20},(_,i)=>i+1)){
  const q=qs.find(x=>x.question_number===n),e=q.explanation_v2;
  assert.equal(e?.schema,'explanation-v2','Q'+n);
  for(const field of ['concept','key_insight','reasoning','common_errors','strategy','review'])assert.ok(e[field]?.trim(),'Q'+n+' '+field);
  assert.equal(e.option_analysis.length,(golden.questions.find(x=>x.question_number===n).options||[]).length,'Q'+n+' options');
  assert.equal(mapped.find(x=>x.question_number===n).explanation_v2?.schema,'explanation-v2');
  assert.ok(['draft_review_required','reviewed'].includes(q.explanation_status),'Q'+n+' explanation status');
 }
});
test('Q2 official radical stem and answer are verified; platform explanation remains draft',()=>{
 const q=qs.find(x=>x.question_number===2);
 assert.ok(q.review_flags.includes('normalized_stem_corrected_against_exam_reference'));
 assert.equal(q.classification_status,'verified');
 assert.equal(q.answer.index,0);
 assert.equal(q.explanation_status,'draft_review_required');
 assert.ok(mapped.find(x=>x.question_number===2).stem.includes('√(99−x)'));
});
