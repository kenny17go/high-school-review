// Review inventory only. No stem/options have been transcribed or approved for publication.
const source=require('../../school-exam-sources.js').forSchool('成功高中')[0];
const explanations=require('./cksh-114-1-1-g1-chinese-explanations.js');

// Shared-reading boundaries from the school paper; confirm exact context and pages on reinspection.
const proposedGroups=[[10,11],[12,13],[14,15],[16,18],[19,20],[31,32],[33,34]];
const groupFor=number=>{
 const range=proposedGroups.find(([first,last])=>number>=first&&number<=last);
 return range?`${source.id}-q${range[0]}-${range[1]}`:null;
};
const questions=source.printed_answers.map((printed_answer,index)=>{
 const question_number=index+1;
 const review_reasons=['question_stem_and_options_not_verified','source_page_not_verified','explanation_draft_needs_review'];
 if(groupFor(question_number))review_reasons.push('group_context_not_verified');
 if(question_number===23)review_reasons.push('printed_answer_semantic_conflict');
 if([5,25,29].includes(question_number))review_reasons.push('explanation_inference_needs_review');
 if(printed_answer===null)review_reasons.push('manual_grading_reference_not_transcribed');
 return Object.freeze({
  id:`${source.id}-q${String(question_number).padStart(2,'0')}`,
  question_number,source_id:source.id,source_url:source.source_url,
  source_page:null,group_id:groupFor(question_number),group_status:'proposed',
  questionType:question_number>=21&&question_number<=30?'multiple_choice':
   printed_answer===null?'short_answer':'single_choice',
  printed_answer,answer_match:question_number===23?false:null,
  explanation_draft_present:Boolean(explanations[question_number]),
  classification_status:'needs_review',published:false,
  review_reasons:Object.freeze(review_reasons)
 });
});
module.exports=Object.freeze({source_id:source.id,expected_question_count:source.expected_question_count,
 groups:Object.freeze(proposedGroups.map(([first,last])=>Object.freeze({
  id:groupFor(first),question_numbers:Object.freeze(Array.from({length:last-first+1},(_,i)=>first+i)),
  status:'proposed_needs_review'
 }))),questions:Object.freeze(questions),ready_for_publish:false});
