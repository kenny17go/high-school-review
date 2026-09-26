import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
for(const file of ['gsat-114-unified-bank.js','gsat-115-unified-bank.js','gsat-113-unified-bank.js','gsat-112-unified-bank.js','gsat-111-unified-bank.js','unified-question-bank.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const source=Array.from(context.window.GSAT_UNIFIED_BANK_114_MATHA.questions);
const mapped=Array.from(context.window.UnifiedQuestionBank.all()).filter(q=>q.subject==='math'&&q.academic_year===114);
const raw=JSON.parse(fs.readFileSync('data/raw/ceec-114-matha.json','utf8'));
const expanded=[4,5,7,8,9,10,11,12,14,15,16,17,20];
test('114 Math A keeps its existing 20 questions, answers and order',()=>{
 assert.equal(source.length,20);assert.equal(mapped.length,20);
 assert.deepEqual(source.map(q=>q.question_number),Array.from({length:20},(_,i)=>i+1));
 for(const q of source)assert.equal(JSON.stringify(q.answer),JSON.stringify(raw.answer_manifest[q.question_number]),`Q${q.question_number} answer`);
 assert.equal(new Set(source.map(q=>q.id)).size,20);
 assert.equal(source.filter(q=>q.group_id==='ceec-114-matha-g18-20').length,3);
});
test('targeted V2 additions are detailed and available through the shared renderer data',()=>{
 assert.deepEqual(source.filter(q=>q.explanation_v2).map(q=>q.question_number),expanded);
 for(const n of expanded){
  const q=source.find(x=>x.question_number===n),e=q.explanation_v2,r=mapped.find(x=>x.question_number===n);
  assert.equal(e.schema,'explanation-v2',`Q${n}`);
  for(const field of ['concept','key_insight','reasoning','common_errors','strategy','review'])assert.ok(e[field]?.trim(),`Q${n} ${field}`);
  if(q.options)assert.equal(e.option_analysis?.length,q.options.length,`Q${n} option analysis`);
  assert.equal(r.explanation_v2?.schema,'explanation-v2',`Q${n} mapped explanation`);
  assert.equal(q.explanation_status,'draft_review_required');
  assert.equal(q.classification_status,'needs_review');
 }
});
test('untouched questions retain their original explanations',()=>{
 for(const q of source.filter(q=>!expanded.includes(q.question_number))){
  assert.ok(q.explanation?.solution,`Q${q.question_number}`);
  assert.equal(q.explanation_v2,null,`Q${q.question_number} remains unchanged`);
 }
});
console.log('GSAT 114 Math A targeted Explanation V2 regression PASS');
