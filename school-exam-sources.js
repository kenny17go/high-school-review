/* School paper intake. Source links are not playable questions until reviewed. */
(function(root){
"use strict";
const paper={
 id:"cksh-114-1-1-g1-chinese",school:"成功高中",subject:"chinese",grade:1,
 academic_year:114,semester:1,exam:1,variant:"國綜",expected_question_count:34,
 title:"114 學年度上學期高一國文第一次期中考解析卷",
 source_url:"https://www.cksh.tp.edu.tw/wp-content/uploads/doc/cg501/114-1-1%E9%AB%98%E4%B8%80%E5%9C%8B%E7%B6%9C%E8%A9%A6%E9%A1%8C.pdf",
 source_index_url:"https://www.cksh.tp.edu.tw/teaching/chinese/%E8%A9%A6%E9%A1%8C%E9%9B%86%E6%88%90/",
 answer_url:"https://www.cksh.tp.edu.tw/news/114%E5%AD%B8%E5%B9%B4%E5%BA%A6%E7%AC%AC1%E5%AD%B8%E6%9C%9F%E5%85%A8%E6%A0%A1%E7%AC%AC%E4%B8%80%E6%AC%A1%E6%9C%9F%E4%B8%AD%E8%80%83%E8%A7%A3%E7%AD%94/",
 answer_source:"試卷逐題印出的答案；另行公布的高一解答壓縮檔未含國文科",
 status:"needs_review",published:false,
 // These are a transcription of the printed key, not grading data. Q23 is disputed.
 printed_answers:["D","B","A","C","C","D","D","A","A","A","C","B","C","B","B","D","B","A","C","D","AB","AC","ABD","BDE","ABCD","ABC","BDE","ACD","ACDE","AD","D",null,null,"C"],
 answer_review:[{question_number:23,status:"needs_review",printed_answer:"ABD",reason:"校方解析卷印 A、B、D，但成語語義與該組選項不符；不得自動計分，待校方更正或人工複核。",reference_urls:["https://dict.revised.moe.edu.tw/dictView.jsp?ID=126250&la=0&powerMode=0","https://dict.revised.moe.edu.tw/dictView.jsp?ID=76319&la=0&powerMode=0","https://dict.revised.moe.edu.tw/dictView.jsp?ID=32858&la=0&powerMode=0"]}],
 notes:"保留原卷題號及印出答案以利查核；題幹、選項、圖表和平台詳解尚未逐題審定，暫不計入可作答真題。"
};
const api=Object.freeze({papers:Object.freeze([paper]),forSchool(name){return this.papers.filter(p=>p.school===name);},published(){return this.papers.filter(p=>p.published&&p.status==="verified");}});
root.SchoolExamSources=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
