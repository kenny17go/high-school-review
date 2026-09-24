(function(){"use strict";
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){
 const host=$("gsat115Ready");if(!host||!window.GSAT115_READY)return;
 const m=window.GSAT115_READY.meta,qs=window.GSAT115_READY.questions;
 host.innerHTML='<div class="card" style="margin-top:10px"><div class="sourcehead"><div><h3 style="margin:0">115 學測・數學A｜站內題庫</h3><p class="small">20 題、100 分的題型／配分／官方答案已建檔。公式密集題仍以大考中心原始試卷為題面依據，避免 HTML 重打公式失真。</p></div><span class="sourcetype">CEEC</span></div><div class="chips"><span class="chip">20 題</span><span class="chip">100 分</span><span class="chip">單選＋多選＋選填＋非選</span></div><div class="sourceactions"><a class="linkbtn soft" target="_blank" rel="noopener" href="'+esc(m.paperUrl)+'">開啟官方試卷</a><a class="linkbtn soft" target="_blank" rel="noopener" href="'+esc(m.answerUrl)+'">官方答案</a><button class="primary" id="gsat115IndexBtn" type="button">查看 20 題建檔狀態</button></div></div><div id="gsat115Index"></div>';
 $("gsat115IndexBtn").onclick=()=>{$("gsat115Index").innerHTML=qs.map(q=>'<div class="card qcard"><div class="qtitle">第 '+q.n+' 題 <span class="tag">'+esc(q.type)+'</span> <span class="tag">'+q.points+' 分</span></div><div class="small">答案與計分規則已建檔'+(q.type==="manual"?'｜非選擇題需依作答過程評閱':'')+'</div></div>').join("");};
}
window.GSAT115UI={render};document.addEventListener("DOMContentLoaded",render);
})();
