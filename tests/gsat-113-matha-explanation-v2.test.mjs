import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
for(const file of ['gsat-115-unified-bank.js','gsat-114-unified-bank.js','gsat-113-unified-bank.js','gsat-112-unified-bank.js','unified-question-bank.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const source=Array.from(context.window.GSAT_UNIFIED_BANK_113_MATHA.questions);
const mapped=Array.from(context.window.UnifiedQuestionBank.all()).filter(q=>q.subject==='math'&&q.academic_year===113);
const raw=JSON.parse(fs.readFileSync('data/raw/ceec-113-matha.json','utf8'));
const expanded=[2,3,4,5,6,8,9,10,11,12,13,17];

test('113 Math A preserves every original question, answer, group, and review flag',()=>{
 assert.equal(source.length,20);assert.equal(mapped.length,20);
 assert.deepEqual(source.map(q=>q.question_number),Array.from({length:20},(_,i)=>i+1));
 for(const q of source)assert.equal(JSON.stringify(q.answer),JSON.stringify(raw.answer_manifest[q.question_number]),`Q${q.question_number} answer`);
 assert.equal(new Set(source.map(q=>q.id)).size,20);
 assert.equal(source.filter(q=>q.group_id==='ceec-113-matha-g18-20').length,3);
 assert.deepEqual(Array.from(source.find(q=>q.question_number===7).review_flags),['official_answer_objection_resolved']);
 assert.equal(source.every(q=>q.classification_status==='needs_review'&&q.explanation_status==='draft_review_required'),true);
});

test('V2 additions include stepwise reasoning and option analysis',()=>{
 assert.deepEqual(source.filter(q=>q.explanation_v2).map(q=>q.question_number),expanded);
 for(const n of expanded){
  const q=source.find(x=>x.question_number===n),e=q.explanation_v2,r=mapped.find(x=>x.question_number===n);
  assert.equal(e.schema,'explanation-v2',`Q${n}`);
  for(const field of ['concept','key_insight','reasoning','common_errors','strategy','review'])assert.ok(e[field]?.trim(),`Q${n} ${field}`);
  if(q.options)assert.equal(e.option_analysis?.length,q.options.length,`Q${n} option analysis`);
  assert.equal(r.explanation_v2?.schema,'explanation-v2',`Q${n} mapped explanation`);
 }
 for(const q of source.filter(q=>!expanded.includes(q.question_number)))assert.equal(q.explanation_v2,null,`Q${q.question_number} original explanation remains without V2 replacement`);
});

test('Q2 shows the missing official-paper diagram as a disclosed platform redraw',()=>{
 const q=source.find(x=>x.question_number===2),r=mapped.find(x=>x.question_number===2);
 assert.match(q.stem,/如圖/);assert.equal(q.visual_stimulus.kind,'platform_redraw');
 assert.ok(fs.existsSync(q.visual_stimulus.asset));assert.equal(r.visual_stimulus.asset,q.visual_stimulus.asset);
 assert.match(fs.readFileSync('app.js','utf8'),/平台依官方題目重繪示意圖/);
});

console.log('GSAT 113 Math A targeted Explanation V2 and figure regression PASS');
