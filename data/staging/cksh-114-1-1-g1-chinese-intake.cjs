// Review inventory only. PDF pages and group boundaries verified against the school's analysis paper.
// Question paraphrases remain unapproved and link back to the original PDF.
const source=require('../../school-exam-sources.js').forSchool('成功高中')[0];
const explanations=require('./cksh-114-1-1-g1-chinese-explanations.js');
const wording=require('./cksh-114-1-1-g1-chinese-question-drafts.cjs');

const groupRanges=[[10,11],[12,13],[14,15],[16,18],[19,20],[31,32],[33,34]];
const firstPages=[1,1,1,1,2,2,2,2,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,6,6,6,7,7,7,7,8,8,9,9];
const lastPages={8:3,19:6,30:8};
const groupFor=number=>{
 const range=groupRanges.find(([first,last])=>number>=first&&number<=last);
 return range?`${source.id}-q${range[0]}-${range[1]}`:null;
};
const questions=source.printed_answers.map((printed_answer,index)=>{
 const question_number=index+1;
 const review_reasons=['paraphrased_wording_needs_review','explanation_draft_needs_review'];
 if(groupFor(question_number))review_reasons.push('group_context_not_transcribed');
 if([4,5,24,27,28,29,30].includes(question_number))review_reasons.push('modern_text_rights_review_required');
 if([5,7,32,33].includes(question_number))review_reasons.push('visual_layout_review_required');
 if(question_number===23)review_reasons.push('printed_answer_semantic_conflict');
 if([5,25,29].includes(question_number))review_reasons.push('explanation_inference_needs_review');
 if(printed_answer===null)review_reasons.push('manual_grading_required');
 return Object.freeze({
  id:`${source.id}-q${String(question_number).padStart(2,'0')}`,
  question_number,source_id:source.id,source_url:source.source_url,
  source_page:firstPages[index],source_pages:Object.freeze(lastPages[question_number]?
   [firstPages[index],lastPages[question_number]]:[firstPages[index]]),
  group_id:groupFor(question_number),group_status:groupFor(question_number)?'boundary_verified':null,
  questionType:question_number>=21&&question_number<=30?'multiple_choice':
   printed_answer===null?'short_answer':'single_choice',
  printed_answer,answer_match:question_number===23?false:null,
  review_evidence_urls:question_number===2?Object.freeze([
   'https://dict.revised.moe.edu.tw/dictView.jsp?ID=159425&la=0&powerMode=0',
   'https://dict.revised.moe.edu.tw/dictView.jsp?ID=158807&la=0&powerMode=0'
  ]):question_number===23?Object.freeze(source.answer_review[0].reference_urls):Object.freeze([]),
  stem_summary:wording[question_number].stem_summary,
  option_summaries:wording[question_number].option_summaries,
  wording_status:wording[question_number].wording_status,
  context_delivery:wording[question_number].context_delivery,
  manual_reference:question_number===32?Object.freeze({
   cells:Object.freeze(['自覺力與反省力','馭劍術','提鍊平庸、廉價、無聊的日常語言，變造出閃閃發光的詩作']),
   source_page:8,grading:'manual_required'
  }):question_number===33?Object.freeze({
   cells:Object.freeze(['身體瘦弱、衣著單薄','不恤其寒飢而苦役之；夜則閉之戶外','接受教育','都為了自身錢財利益']),
   source_page:9,grading:'manual_required'
  }):null,
  explanation_draft_present:Boolean(explanations[question_number]),
  classification_status:'needs_review',published:false,
  review_reasons:Object.freeze(review_reasons)
 });
});
module.exports=Object.freeze({source_id:source.id,expected_question_count:source.expected_question_count,
 groups:Object.freeze(groupRanges.map(([first,last])=>Object.freeze({
  id:groupFor(first),question_numbers:Object.freeze(Array.from({length:last-first+1},(_,i)=>first+i)),
  status:'boundary_verified_context_not_transcribed'
 }))),questions:Object.freeze(questions),ready_for_publish:false});
