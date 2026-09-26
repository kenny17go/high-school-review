import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const context={window:{}};
vm.createContext(context);
for(const file of ['gsat-115-chinese-unified-bank.js','unified-question-bank.js'])
 vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),context,{filename:file});
const original=Array.from(context.window.GSAT_UNIFIED_BANK_115_CHINESE.questions);
const mapped=Array.from(context.window.UnifiedQuestionBank.all()).filter(q=>q.subject==='chinese');
test('all 36 Chinese questions have complete V2 fields and stay pending review',()=>{
 assert.equal(original.length,36);
 assert.equal(mapped.length,36);
 for(const q of original){
  const e=q.explanation_v2;
  assert.equal(e?.schema,'explanation-v2');
  for(const field of ['concept','key_insight','reasoning','common_errors','strategy','review'])
   assert.ok(typeof e[field]==='string'&&e[field].trim(),'Q'+q.question_number+' missing '+field);
  assert.equal(e.option_analysis.length,(q.options||[]).length,'Q'+q.question_number+' option count');
  assert.equal(q.explanation_status,'draft_review_required');
  assert.equal(q.classification_status,'needs_review');
  const m=mapped.find(x=>x.question_number===q.question_number);
  assert.ok(m,'Q'+q.question_number+' missing unified');
  assert.equal(m.explanation_v2?.schema,'explanation-v2');
  assert.equal(m.group_id,q.group_id);
  assert.equal(m.sync_disabled,true);
 }
});
test('answer indexes and option-analysis shapes are valid',()=>{
 for(const q of original){
  const n=(q.options||[]).length;
  if(q.questionType==='single_choice')assert.ok(Number.isInteger(q.answer.index)&&q.answer.index>=0&&q.answer.index<n);
  if(q.questionType==='multiple_choice'){
   assert.ok(q.answer.indices.length>0);
   assert.equal(new Set(q.answer.indices).size,q.answer.indices.length);
   for(const i of q.answer.indices)assert.ok(Number.isInteger(i)&&i>=0&&i<n);
  }
  if(q.questionType==='short_answer')assert.equal(n,0);
  for(const line of q.explanation_v2.option_analysis)assert.ok(typeof line==='string'&&line.trim());
 }
});
test('both practice and mock use the shared V2 renderer and mobile typography',()=>{
 const app=fs.readFileSync(new URL('app.js',root),'utf8');
 const html=fs.readFileSync(new URL('index.html',root),'utf8');
 assert.equal((app.match(/\$\{explanationMarkup\(q\)\}/g)||[]).length,2);
 assert.match(app,/q\.explanation_v2\|\|q\.explanation_detail\|\|q\.explanation/);
 assert.match(html,/\.qtitle\{font-size:22px;line-height:1\.7\}/);
 assert.match(html,/\.opt\{font-size:18px;line-height:1\.7/);
});
