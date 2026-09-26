import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
for(const file of ['gsat-115-unified-bank.js','gsat-114-unified-bank.js','gsat-113-unified-bank.js','gsat-112-unified-bank.js','gsat-111-unified-bank.js','unified-question-bank.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const source=Array.from(context.window.GSAT_UNIFIED_BANK_111_MATHA.questions);
const mapped=Array.from(context.window.UnifiedQuestionBank.all()).filter(q=>q.subject==='math'&&q.academic_year===111);
const raw=JSON.parse(fs.readFileSync('data/raw/ceec-111-matha.json','utf8'));
const expanded=[3,6,7,8,9,10,11,12,14,16,20];

test('111 Math A preserves the existing 20 questions, official answers, original explanations, group and figures',()=>{
 assert.equal(source.length,20);assert.equal(mapped.length,20);
 assert.deepEqual(source.map(q=>q.question_number),Array.from({length:20},(_,i)=>i+1));
 for(const q of source){
  const original=raw.questions.find(r=>r.question_number===q.question_number);
  assert.equal(JSON.stringify(q.answer),JSON.stringify(raw.answer_manifest[q.question_number]),`Q${q.question_number} answer`);
  assert.equal(JSON.stringify(q.explanation),JSON.stringify(original.explanation),`Q${q.question_number} original explanation`);
 }
 assert.equal(new Set(source.map(q=>q.id)).size,20);
 assert.equal(source.filter(q=>q.group_id==='ceec-111-matha-g18-20').length,3);
 assert.equal(source.every(q=>q.classification_status==='needs_review'&&q.explanation_status==='draft_review_required'),true);
 for(const [n,asset] of [[3,'assets/gsat-111-q03.png'],[11,'assets/gsat-111-q11.png']]){
  const q=source.find(x=>x.question_number===n),png=fs.readFileSync(asset);
  assert.equal(q.visual_stimulus.asset,asset);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.ok(png.length>1000);
 }
});

test('targeted V2 explanations provide complete steps and every multiple-choice option',()=>{
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
 const q20=source.find(q=>q.question_number===20).explanation_v2;
 assert.equal(q20.answer_elements.length,2);
 assert.match(q20.reasoning,/√3\/2−π\/12/);
 assert.match(q20.reasoning,/5π\/12/);
});

test('Q18–20 remain one question group and shared renderer exposes the existing figures',()=>{
 const group=Array.from(context.window.GSAT_UNIFIED_BANK_111_MATHA.groups).find(g=>g.id==='ceec-111-matha-g18-20');
 assert.deepEqual(Array.from(group.question_numbers),[18,19,20]);
 assert.equal(context.window.UnifiedQuestionBank.group(group.id).id,group.id);
 const app=fs.readFileSync('app.js','utf8');assert.match(app,/questionVisualMarkup\(g\)/);
});
