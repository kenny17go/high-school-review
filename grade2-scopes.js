/* Human-reviewed mappings from existing Supabase source inventory. No DB writes. */
(function(root){
"use strict";
const chapter=id=>`math-108-g2-a:${id}`;
const ck="https://www.ck.tp.edu.tw/uploads/1727875928107HJPgsjAy.pdf";
const hs="https://www.hs.ntnu.edu.tw/static/webroot/G162269205262988/application/NN174235765261262.pdf";
const zs="https://www.csghs.tp.edu.tw/wp-content/uploads/doc/zs260/114-2-3%E9%AB%98%E4%BA%8C%E6%97%A5%E7%A8%8B%E8%A1%A8%E8%88%87%E8%80%83%E7%A7%91%E7%AF%84%E5%9C%8D%28%E5%85%AC%E5%91%8A%E7%89%88%290605%E6%9B%B4%E6%96%B0.pdf";
function record(school,year,semester,exam,track,extra){return {subjectId:"math",grade:2,school,academic_year:year,academicYear:year,semester,exam,
 courseId:`math-108-g2-${track.toLowerCase()}`,curriculumTrack:track,reviewedAt:"2026-09-13",...extra};}
root.REVIEWED_GRADE2_SCOPES=[
 record("建國中學",113,1,1,"A",{sourceType:"official",sourceUrl:ck,chapterIds:[chapter("trig")],
  note:"適用 201–223 班數 A：學資第三冊第一章三角函數。225–228 班由任課老師另訂，請勿套用此範圍。"}),
 record("建國中學",113,1,1,"B",{sourceType:"official",sourceUrl:ck,chapterIds:[chapter("trig"),chapter("exp-log")],
  scopeLabel:"三角函數（弧度量、週期模型）、指數函數與圖形",
  allowedSubtopics:{[chapter("trig")]:["弧度量","週期模型","圖形平移","週期"],[chapter("exp-log")]:["指數函數平移"]},
  note:"僅適用 203 班選修數 B：1-1、1-2、2-1。依細項篩題，不包含整章對數或倍角內容。"})
];
root.GRADE2_SCOPE_REVIEWS=[
 ...root.REVIEWED_GRADE2_SCOPES.map(r=>({...r,status:"mapped"})),
 ...["A","B"].map(track=>record("師大附中",113,2,1,track,{status:"pending",sourceUrl:hs,
  rawScope:track==="A"?"第四冊 1-1 到 2-1（部分），P1–P77":"Ch1 全",
  note:"官方附件已核對，但教材版本／部分章節邊界尚不足以建立精確 mapping；仍採平台模擬。數資、科學班另有範圍。"})),
 ...["A","B"].map(track=>record("中山女高",114,2,3,track,{status:"pending",sourceUrl:zs,
  rawScope:track==="A"?"第四章":"第 6、7 單元",
  note:"官方附件已核對，但未列教材版本或章名，不能直接推定章節；仍採平台模擬範圍。"}))
];
})(typeof window!=="undefined"?window:globalThis);
