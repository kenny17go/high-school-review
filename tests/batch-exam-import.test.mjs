import assert from 'node:assert/strict';
import {prepareExamBatch,approveBatch,publishArtifact} from '../scripts/batch-exam-import.mjs';

const base={
 exam:{id:'ceec-115-matha',subject:'math',academic_year:115,exam:'學測',variant:'數學A',sourceType:'ceec_official',source_title:'115學測數學A',source_url:'https://www.ceec.edu.tw/test.pdf',answer_url:'https://www.ceec.edu.tw/answer.pdf',source_page:1},
 groups:[{id:'g18-20',stem:'共用題幹'}],
 questions:[
  {id:'q1',question_number:1,questionType:'single_choice',stem:'單選題幹',options:['A','B'],answer:{index:1},primary_unit:'機率',skill_tags:['期望值'],explanation:{concept:'機率',key_insight:'列出事件',solution:'計算後得B',common_errors:'漏算'}},
  {id:'q7',question_number:7,questionType:'multiple_choice',stem:'多選題幹',options:['A','B','C','D','E'],answer:{indices:[2,3]},primary_unit:'不等式',skill_tags:['圖形判讀'],explanation:{concept:'不等式',key_insight:'畫邊界',solution:'判斷區域',common_errors:'不等號方向'}},
  {id:'q13',question_number:13,questionType:'fill_blank',stem:'選填題幹',answer:{cells:['9','1','0']},primary_unit:'機率',skill_tags:['條件機率'],explanation:{concept:'條件機率',key_insight:'先算分母',solution:'得到9/10',common_errors:'條件顛倒'}},
  {id:'q19',question_number:19,questionType:'short_answer',stem:'非選題幹',answer:{grading:'manual_required',reference:'x-y-z=-1'},grading_rubric:{full_score:['正確方程式']},group_id:'g18-20',primary_unit:'空間向量',skill_tags:['平面方程式'],explanation:{concept:'法向量',key_insight:'用外積',solution:'代點求常數',common_errors:'漏常數'}}
 ]};
const staged=prepareExamBatch(base);
assert.equal(staged.schema_version,'batch-import-v1');
assert.equal(staged.review_summary.total,4);
assert.equal(staged.review_summary.clean,4);
assert.equal(staged.review_summary.needs_review,0);
assert.equal(staged.review_summary.ready_for_publish,false);
assert.equal(staged.questions.every(q=>q.classification_status==='needs_review'),true,'automation never self-verifies');

const broken=prepareExamBatch({...base,questions:[{...base.questions[0],id:'bad',skill_tags:[],explanation:null}]});
assert.equal(broken.review_summary.needs_review,1);
assert.deepEqual(broken.exception_queue[0].reasons.sort(),['missing_explanation','missing_skill_tags']);

const invalid=prepareExamBatch({...base,questions:[{...base.questions[0],id:'bad2',source_url:'https://example.com/x.pdf'}]});
assert.equal(invalid.review_summary.error_count,1);
assert(invalid.exception_queue[0].reasons.includes('invalid_ceec_domain'));
assert.throws(()=>approveBatch(invalid,{reviewer:'tester',evidence:'visual check',approved_question_ids:['bad2']}),/Blocking/);

const approved=approveBatch(staged,{reviewer:'tester',evidence:'official paper and answer checked',approved_question_ids:[]});
assert.equal(approved.review_summary.ready_for_publish,true);
assert.equal(approved.questions.every(q=>q.classification_status==='verified'),true);
const artifact=publishArtifact(approved);
assert.equal(artifact.questions.every(q=>q.published&&q.pipeline_stage==='publish_artifact'),true);
assert.equal(artifact.review_summary.published_artifact,true);
console.log('Batch exam importer V1 PASS');
