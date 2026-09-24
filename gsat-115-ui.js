(function(){"use strict";
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const answerText=q=>q.type==="manual"||q.questionType==="manual"?(q.answer.reference||"依作答過程人工評閱"):q.answer.index!=null?"選項 "+(q.answer.index+1):q.answer.indices?"選項 "+q.answer.indices.map(x=>x+1).join("、"):q.answer.cells?q.answer.cells.join(""):"";
function renderQuestion(q){
 const e=q.explanation||{},review=q.classification_status==="verified"?"已核對":"待公式／圖形複核";
 return '<article class="card qcard" data-gsat-unit="'+esc(q.primary_unit)+'"><div class="qtitle">第 '+q.question_number+' 題｜'+esc(q.primary_unit)+' <span class="tag">'+esc(q.questionType)+'</span> <span class="tag">'+q.points+' 分</span></div>'+
 '<div class="sourceMeta"><span>'+esc(q.secondary_concepts.join("・"))+'</span><span>'+review+'</span><span>官方試卷第 '+q.source_page+' 頁</span></div>'+
 '<div class="small">技能：'+esc(q.skill_tags.join("・"))+'</div>'+
 '<details><summary>查看答案與平台解析</summary><div class="explain show"><b>官方答案</b><br>'+esc(answerText(q))+
 '<br><br><b>觀念</b><br>'+esc(e.concept)+
 '<br><br><b>破題關鍵</b><br>'+esc(e.key_insight)+
 '<br><br><b>完整解法</b><br>'+esc(e.solution)+
 '<br><br><b>常見錯誤</b><br>'+esc(e.common_errors)+'</div></details></article>';
}
function render(){
 const host=$("gsat115Ready"),bank=window.GSAT_UNIFIED_BANK_115_MATHA;if(!host||!bank)return;
 const m=bank.meta,qs=bank.questions,units=[...new Set(qs.map(q=>q.primary_unit))];
 host.innerHTML='<div class="card" style="margin-top:10px"><div class="sourcehead"><div><h3 style="margin:0">115 學測・數學A｜統一真題題庫</h3><p class="small">同一份題庫可依年份整份瀏覽，也可依單元挑題練習。練習模式逐題看解析；整份模考才使用總分。</p></div><span class="sourcetype">CEEC</span></div>'+
 '<div class="chips"><span class="chip">20 題</span><span class="chip">100 分</span><span class="chip">平台分層解析</span></div>'+
 '<div class="filters"><label style="min-width:180px">單元<select id="gsat115Unit"><option value="">全部單元（115整份）</option>'+units.map(u=>'<option>'+esc(u)+'</option>').join("")+'</select></label></div>'+
 '<div class="sourceactions"><a class="linkbtn soft" target="_blank" rel="noopener" href="'+esc(m.paperUrl)+'">官方試卷</a><a class="linkbtn soft" target="_blank" rel="noopener" href="'+esc(m.answerUrl)+'">官方答案</a></div></div><div id="gsat115Questions"></div>';
 const list=$("gsat115Questions"),sel=$("gsat115Unit");
 const draw=()=>{const u=sel.value,items=u?qs.filter(q=>q.primary_unit===u):qs;list.innerHTML='<div class="small" style="margin:10px 2px">顯示 '+items.length+' 題'+(u?'｜'+esc(u):'｜115 全部題目')+'</div>'+items.map(renderQuestion).join("");};
 sel.onchange=draw;draw();
}
window.GSAT115UI={render};document.addEventListener("DOMContentLoaded",render);
})();