// CKSH 113-1-1 Grade 10 Chinese intake metadata.
// Official source: school teacher-copy PDF with printed answers.
// Long copyrighted passages stay on the cited school PDF; platform stores paraphrases only.
const exam=Object.freeze({
 id:'cksh-113-1-1-g1-chinese', school:'成功高中', grade:1, subject:'chinese', variant:'國綜',
 academic_year:113, semester:1, exam:1, expected_question_count:34,
 sourceType:'school_official',
 source_url:'https://www.cksh.tp.edu.tw/wp-content/uploads/doc/cg501/113-1-1%E9%AB%98%E4%B8%80%E5%9C%8B%E7%B6%9C%E8%A9%A6%E9%A1%8C.pdf',
 source_page_count:8,
 sections:Object.freeze([
  {from:1,to:18,type:'single_choice'},
  {from:19,to:28,type:'multiple_choice'},
  {from:29,to:34,type:'mixed'}
 ]),
 scope:Object.freeze(['現代詩選','師說','鬼頭刀','左忠毅公逸事','親情人倫','思鄉情懷']),
 policy:Object.freeze({
  preserve_original_option_order:true,
  unreadable:'pass',
  disputed:'exclude',
  modern_long_context:'school_pdf_reference',
  production_write:false
 })
});
module.exports=exam;
