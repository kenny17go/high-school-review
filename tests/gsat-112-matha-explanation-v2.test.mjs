import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
for(const file of ['gsat-115-unified-bank.js','gsat-114-unified-bank.js','gsat-113-unified-bank.js','gsat-112-unified-bank.js','gsat-111-unified-bank.js','unified-question-bank.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const source=Array.from(context.window.GSAT_UNIFIED_BANK_112_MATHA.questions);
const mapped=Array.from(context.window.UnifiedQuestionBank.all()).filter(q=>q.subject==='math'&&q.academic_year===112);
const raw=JSON.parse(fs.readFileSync('data/raw/ceec-112-matha.json','utf8'));
const expanded=[2,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

test('112 Math A preserves every existing question, answer, group, and original explanation',()=>{
 assert.equal(source.length,20);assert.equal(mapped.length,20);
 assert.deepEqual(source.map(q=>q.question_number),Array.from({length:20},(_,i)=>i+1));
 for(const q of source){
  assert.equal(JSON.stringify(q.answer),JSON.stringify(raw.answer_manifest[q.question_number]),`Q${q.question_number} answer`);
  if(q.question_number!==17)assert.equal(JSON.stringify(q.explanation),JSON.stringify(raw.questions.find(r=>r.question_number===q.question_number).explanation),`Q${q.question_number} original explanation`);
 }
 assert.ok(!source.find(q=>q.question_number===17).explanation.solution.includes('題圖相對位置'));
 assert.equal(new Set(source.map(q=>q.id)).size,20);
 assert.equal(source.filter(q=>q.group_id==='ceec-112-matha-g18-20').length,3);
 assert.equal(source.every(q=>q.classification_status==='needs_review'&&q.explanation_status==='draft_review_required'),true);
});

test('targeted V2 explanations contain complete reasoning and choice analysis',()=>{
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
 assert.equal(source.find(q=>q.question_number===19).explanation_v2.answer_elements.length,3);
 assert.equal(source.find(q=>q.question_number===20).explanation_v2.answer_elements.length,2);
});

test('omitted official figures are restored for Q2 and the Q18–20 group',()=>{
 const q2=source.find(q=>q.question_number===2),group=Array.from(context.window.GSAT_UNIFIED_BANK_112_MATHA.groups).find(g=>g.id==='ceec-112-matha-g18-20');
 assert.match(q2.stem,/如圖/);assert.equal(q2.visual_stimulus.asset,'assets/gsat-112-q02.png');
 assert.ok(fs.existsSync(q2.visual_stimulus.asset));
 assert.match(group.stem,/如圖所示/);assert.equal(group.visual_stimulus.asset,'assets/gsat-112-q18-20.png');
 assert.ok(fs.existsSync(group.visual_stimulus.asset));
 assert.equal(context.window.UnifiedQuestionBank.group(group.id).visual_stimulus.asset,group.visual_stimulus.asset);
 const app=fs.readFileSync('app.js','utf8');assert.match(app,/questionVisualMarkup\(g\)/);
});

console.log('GSAT 112 Math A targeted Explanation V2 and figure regression PASS');
