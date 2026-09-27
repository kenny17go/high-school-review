import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=require('../school-exam-sources.js');
const intake=require('../data/staging/cksh-114-1-1-g1-chinese-intake.cjs');
const drafts=require('../data/staging/cksh-114-1-1-g1-chinese-explanations.js');
const paper=sources.forSchool('成功高中')[0];
const letters='ABCDE';

const contexts={
 '10-11':['父母婚姻的日常修行','改寫薛仁明的現代文章談父母磨合、放下執著、學習相互理解；全文見校方 PDF 第 3 頁。',3,true],
 '12-13':['師說：從師態度的對比','韓愈比較古今、父母對子女與自身、百工與士大夫的從師態度；原文見 PDF 第 4 頁。',4,false],
 '14-15':['師說：擇師標準','韓愈說人人皆有疑惑，聞道有先後，術業有專攻；甲乙段原文見 PDF 第 4 頁。',4,false],
 '16-18':['世說新語：王子猷兩事','王子猷託人請桓子野吹笛，雪夜乘興訪友卻到門而返；兩篇原文見 PDF 第 4–5 頁。',4,false],
 '19-20':['義鼠與鬼頭刀','甲寫小鼠以咬尾牽制蛇；乙寫一隻鬼頭刀陪伴上鉤的另一隻，漁人因此反思；乙現代原文見 PDF 第 5–6 頁。',5,true],
 '31-32':['現代詩創作：鍊金與馭劍','甲以鍊金喻詩的語言轉化，乙以馭劍喻意象與整體情境的融合；兩篇改寫現代文與表格見 PDF 第 8 頁。',8,true],
 '33-34':['傷仲永與逆旅小子','甲寫仲永失學而才情泯滅，乙寫被叔父虐待的孤兒無人救援而亡；文言原文及填表見 PDF 第 9 頁。',9,false]
};

export function buildInput(){
 const groups=intake.groups.map(g=>{
  const m=g.id.match(/-q(\d+)-(\d+)$/);
  const [title,stem,source_page,modern]=contexts[`${Number(m[1])}-${Number(m[2])}`];
  return {id:g.id,question_numbers:g.question_numbers,title,stem,source_page,
   source_url:paper.source_url,display_mode:'shared_context',depends_on:[],
   rights_status:modern?'metadata_only_pending_rights':'public_domain_official_layout',
   context_delivery:'school_pdf_reference',review_flags:['group_context_paraphrase_needs_review']};
 });
 const questions=intake.questions.map(q=>{
  const explanation=drafts[q.question_number];
  const answer=q.questionType==='short_answer'?{
   grading:'manual_required',reference:q.manual_reference.cells.join('；')
  }:q.questionType==='single_choice'?{
   index:letters.indexOf(q.printed_answer)
  }:{indices:[...q.printed_answer].map(letter=>letters.indexOf(letter))};
  return {
   id:q.id,subject:'chinese',variant:'國綜',school:paper.school,grade:paper.grade,
   academic_year:paper.academic_year,semester:paper.semester,exam:paper.exam,
   question_number:q.question_number,questionType:q.questionType,sourceType:'school_official',
   sourceId:paper.id,source_title:paper.title,source_url:paper.source_url,
   answer_url:paper.source_url,answer_source:paper.answer_source,
   review_evidence_urls:q.review_evidence_urls,
   source_page:q.source_page,source_pages:q.source_pages,group_id:q.group_id,
   stem:q.stem_summary,options:q.option_summaries,answer,printed_answer:q.printed_answer,
   // The 33 non-disputed answers are checked against the printed key, not independently certified.
   answer_match:q.question_number===23?false:true,
   primary_unit:explanation.concept,skill_tags:[explanation.concept],
   explanation,explanation_source:'platform_authored',explanation_status:'draft_review_required',
   review_flags:q.review_reasons,parse_confidence:0.8,classification_confidence:0.6,
   wording_status:q.wording_status,content_capture_status:'platform_paraphrase_and_school_pdf_reference',
   sync_status:'disabled_pending_review',published:false
  };
 });
 return {exam:{id:paper.id,subject:paper.subject,school:paper.school,grade:paper.grade,
   academic_year:paper.academic_year,semester:paper.semester,exam:paper.exam,
   variant:paper.variant,sourceType:'school_official',source_title:paper.title,
   source_url:paper.source_url,answer_url:paper.source_url,
   expected_question_count:paper.expected_question_count,raw_layer:'school_pdf_paraphrase_review_required'},
  groups,questions,answer_manifest:paper.printed_answers,
  rights_note:'現代作品全文留在校方 PDF；平台只有待審轉述，不表示學校授權全文轉載。'};
}

export function buildArtifacts(){const raw=buildInput();return {raw,staging:prepareExamBatch(raw)};}

// The school paper remains in Raw/Staging for auditing. The playable projection
// omits disputed answers and never changes the review status of platform drafts.
export function buildPlayableBank(raw=buildInput()){
 const questions=raw.questions.filter(q=>q.answer_match===true&&q.question_number!==23);
 return {meta:{...raw.exam,academicYear:raw.exam.academic_year,paperUrl:raw.exam.source_url},
  groups:raw.groups.filter(g=>g.question_numbers.some(n=>questions.some(q=>q.question_number===n))),
  questions};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {raw,staging}=buildArtifacts();
 const rawPath=path.join(root,'data/raw/cksh-114-1-1-g1-chinese.json');
 const stagePath=path.join(root,'data/staging/cksh-114-1-1-g1-chinese.batch-import-v1.json');
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagePath,JSON.stringify(staging,null,2)+'\n');
 fs.writeFileSync(path.join(root,'school-cksh-114-chinese-unified-bank.js'),
  '/* Generated from existing school Raw data; disputed Q23 is omitted. */\n'+
  '(function(root){root.CKSH_UNIFIED_BANK_114_CHINESE='+JSON.stringify(buildPlayableBank(raw))+';})(window);\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
