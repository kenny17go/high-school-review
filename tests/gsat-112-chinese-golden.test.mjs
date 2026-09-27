import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildGoldenArtifacts} from '../scripts/build-gsat-112-chinese-golden.mjs';

const {raw,staging}=buildGoldenArtifacts();
test('official 112 Chinese counts, answers, and nonchoice rubric',()=>{
 assert.equal(raw.questions.length,37);
 assert.deepEqual(raw.questions.map(q=>q.question_number),Array.from({length:37},(_,i)=>i+1));
 assert.equal(raw.questions.reduce((sum,q)=>sum+q.points,0),100);
 assert.deepEqual(raw.questions.reduce((counts,q)=>(counts[q.questionType]=(counts[q.questionType]||0)+1,counts),{}),{
  single_choice:27,multiple_choice:7,short_answer:3
 });
 assert.equal(raw.questions.every(q=>q.answer_match),true);
 for(const q of raw.questions.filter(q=>q.questionType!=='short_answer')){
  const official=q.questionType==='single_choice'?String.fromCharCode(65+q.answer.index):q.answer.indices.map(i=>String.fromCharCode(65+i)).join('');
  for(const match of q.explanation.solution.matchAll(/(?:故|選)([A-E]{1,5})(?=[。；，、\s]|$)/g))
   assert.equal(match[1],official,`Q${q.question_number} solution contradicts official answer`);
 }
 assert.equal(JSON.stringify(raw.questions[25].answer),JSON.stringify({indices:[0,1]}));
 assert.equal(JSON.stringify(raw.questions[26].answer),JSON.stringify({indices:[0,1,2]}));
 assert.equal(JSON.stringify(raw.questions[27].answer),JSON.stringify({indices:[1,2,3]}));
 assert.equal(JSON.stringify(raw.questions[31].answer),JSON.stringify({indices:[1,3,4]}));
 assert.equal(JSON.stringify(raw.questions[33].answer),JSON.stringify({index:0}));
 assert.deepEqual(raw.questions.filter(q=>q.questionType==='short_answer').map(q=>q.question_number),[33,35,37]);
 assert.deepEqual(raw.questions.filter(q=>q.questionType==='short_answer').map(q=>q.points),[6,6,6]);
 assert.ok(raw.questions.filter(q=>q.questionType==='short_answer').every(q=>q.answer.grading==='manual_required'&&q.grading_rubric.url.includes('ceec.edu.tw')));
});
test('groups preserve official contexts and flag visual pages for review',()=>{
 assert.equal(raw.groups.length,10);
 assert.deepEqual(Array.from(raw.groups.find(g=>g.question_numbers.includes(34)).question_numbers),[33,34,35]);
 assert.ok(raw.groups.every(g=>g.context_delivery==='official_pdf_reference'&&g.source_url.startsWith('https://www.ceec.edu.tw/')));
 assert.deepEqual(raw.questions.filter(q=>q.review_flags.includes('official_visual_context_manual_review')).map(q=>q.question_number),[4,10,11,12,35,37]);
 assert.deepEqual(raw.questions.filter(q=>q.review_flags.includes('official_answer_objection_resolved')).map(q=>q.question_number),[22,24,25,26,27,28,30,32]);
 assert.deepEqual(staging.review_summary.missing_question_numbers,[]);
 assert.deepEqual(staging.review_summary.exam_errors,[]);
 assert.equal(staging.review_summary.error_count,0);
 assert.equal(staging.review_summary.needs_review,14);
 assert.equal(staging.review_summary.group_needs_review,8);
 assert.equal(staging.review_summary.ready_for_publish,false);
});
test('112–115 Chinese coexist with five Math A years in the shared runtime',()=>{
 const context={window:{}};vm.createContext(context);
 for(const file of ['gsat-111-unified-bank.js','gsat-112-unified-bank.js','gsat-113-unified-bank.js','gsat-114-unified-bank.js','gsat-115-unified-bank.js','gsat-115-chinese-unified-bank.js','gsat-114-chinese-unified-bank.js','gsat-113-chinese-unified-bank.js','gsat-112-chinese-unified-bank.js','unified-question-bank.js'])
  vm.runInContext(fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),context,{filename:file});
 const bank=context.window.UnifiedQuestionBank;
 assert.equal(bank.questions.length,245);
 assert.equal(bank.filter({subject:'math'}).length,100);
 assert.equal(bank.filter({subject:'chinese',academic_year:112}).length,37);
 assert.equal(bank.filter({subject:'chinese',academic_year:115}).length,36);
 assert.equal(bank.filter({subject:'chinese',academic_year:114}).length,36);
 assert.equal(bank.filter({subject:'chinese',academic_year:113}).length,36);
 assert.equal(bank.filter({subject:'chinese',academic_year:112}).every(q=>q.sync_disabled&&q.classification_status==='needs_review'&&q.explanation_v2?.schema==='explanation-v2'),true);
 for(const q of raw.questions){
  const e=q.explanation_v2;
  for(const field of ['concept','key_insight','reasoning','common_errors','strategy','review'])assert.ok(e[field]?.trim(),`Q${q.question_number} missing ${field}`);
  assert.equal(e.option_analysis.length,(q.options||[]).length,`Q${q.question_number} option analysis`);
  assert.equal(bank.filter({subject:'chinese',academic_year:112})[q.question_number-1].group_id,q.group_id);
 }
});
test('practice and mock expose the official PDF for standalone Chinese questions',()=>{
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/function chineseStandalonePdfMarkup\(q\)/);
 assert.equal((app.match(/\$\{chineseStandalonePdfMarkup\(q\)\}/g)||[]).length,2);
 assert.match(app,/q\.group_id\|\|\(!isCeec&&!isSchool\)/);
});
