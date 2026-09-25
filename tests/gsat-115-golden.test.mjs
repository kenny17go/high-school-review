import assert from 'node:assert/strict';
import {buildGoldenArtifacts} from '../scripts/build-gsat-115-golden.mjs';

const {raw,staging}=buildGoldenArtifacts();
assert.equal(raw.questions.length,20);
assert.equal(raw.questions.reduce((sum,q)=>sum+q.points,0),100);
assert.deepEqual(raw.questions.map(q=>q.question_number),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
assert.equal(raw.questions.every(q=>q.answer_match),true,'all normalized answers must match the independent official-answer manifest');
assert.equal(raw.questions.every(q=>q.stem),true,'all 20 questions need normalized question content');
assert.equal(raw.questions.filter(q=>['single_choice','multiple_choice'].includes(q.questionType)).every(q=>q.options?.length===5),true,'all choice questions need five official options');
assert.equal(raw.questions.filter(q=>q.group_id).length,3);
assert.equal(raw.questions.find(q=>q.question_number===20).answer.reference,'volume=10; maxDistance=sqrt(94)');
assert.equal(raw.questions.filter(q=>[19,20].includes(q.question_number)).every(q=>q.grading_rubric&&q.rubric_url),true);

assert.equal(staging.review_summary.total,20);
assert.equal(staging.review_summary.expected_question_count,20);
assert.deepEqual(staging.review_summary.missing_question_numbers,[]);
assert.deepEqual(staging.review_summary.exam_errors,[]);
assert.deepEqual(staging.review_summary.by_type,{fill_blank:5,multiple_choice:6,short_answer:2,single_choice:7});
assert.equal(staging.questions.every(q=>q.classification_status==='needs_review'&&q.pipeline_stage==='staging'&&!q.published),true);
assert.equal(staging.review_summary.ready_for_publish,false);
assert.equal(staging.review_summary.error_count,0);
assert.equal(staging.review_summary.needs_review,0);
assert.equal(staging.review_summary.clean,20);
assert.equal(staging.exception_queue.some(x=>x.reasons.includes('missing_options')),false);
assert.deepEqual(staging.exception_queue,[]);
assert.equal(staging.review_summary.by_reason.official_answer_mismatch,undefined);
assert.equal(staging.review_summary.by_reason.missing_group_context,undefined);
console.log('GSAT 115 Math A Golden Sample PASS');
