
(function(){
"use strict";
const F=window.V42_FALLBACK;
const $=id=>document.getElementById(id);
let db=null, dbMode="local", schools=F.schools, questions=F.questions;
let current=[], answers={}, mock=[], mockAnswers={}, user=null;

function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function cfg(){
  return {
    url: localStorage.getItem("v42_url") || (window.V42_CONFIG&&window.V42_CONFIG.supabaseUrl) || "",
    key: localStorage.getItem("v42_key") || (window.V42_CONFIG&&window.V42_CONFIG.supabaseKey) || ""
  }
}
function setDbBadge(ok,text){
  const b=$("dbBadge");
  b.textContent=text;
  b.className="dbbadge "+(ok?"online":"offline");
}
async function connectDB(showMessage=false){
  const c=cfg();
  if(!c.url||!c.key||!window.supabase){
    db=null;dbMode="local";setDbBadge(false,"本機備援");
    if(showMessage) toast("尚未設定 Supabase，已使用本機 160 題。");
    refreshSchool(); return false;
  }
  try{
    db=window.supabase.createClient(c.url,c.key);
    const {data:s,error:se}=await db.from("schools").select("*").order("id");
    const {data:q,error:qe}=await db.from("questions").select("*").order("id").limit(1000);
    if(se||qe) throw (se||qe);
    if(s&&s.length){
      schools={};
      s.forEach(x=>schools[x.name]={tone:x.source_tone,status:x.source_status,desc:x.description,url:x.official_url});
    }
    if(q&&q.length){
      questions=q.map(x=>({id:x.id,topic:x.topic,sub:x.subtopic,level:x.difficulty,q:x.question_text,o:x.options,a:x.correct_index,e:x.explanation}));
    }
    dbMode="cloud";setDbBadge(true,"Supabase 已連線");
    await refreshAuth();
    populateSchools();
    chooseSet();
    renderSources();
    refreshSchool();
    if(showMessage) toast("資料庫連線成功，共讀取 "+questions.length+" 題。");
    return true;
  }catch(err){
    console.error(err);db=null;dbMode="local";schools=F.schools;questions=F.questions;
    setDbBadge(false,"連線失敗・本機備援");populateSchools();chooseSet();renderSources();refreshSchool();
    if(showMessage) toast("Supabase 連線失敗，已自動切回本機題庫。");
    return false;
  }
}
async function refreshAuth(){
  if(!db){user=null;updateAuthUI();return}
  const {data}=await db.auth.getUser();user=data&&data.user?data.user:null;updateAuthUI();
}
function updateAuthUI(){
  $("authStatus").textContent=user ? ("已登入："+(user.email||"匿名使用者")) : "尚未登入";
  $("signOutBtn").style.display=user?"inline-block":"none";
}
async function sendMagicLink(){
  if(!db){toast("請先連線 Supabase。");return}
  const email=$("emailInput").value.trim();
  if(!email){toast("請輸入 Email。");return}
  const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.href}});
  if(error) toast("寄送失敗："+error.message); else toast("登入連結已寄出，請到信箱點開。");
}
async function signOut(){if(db)await db.auth.signOut();user=null;updateAuthUI();toast("已登出。")}

function populateSchools(){
  const sel=$("school"), old=sel.value || "成功高中";
  sel.innerHTML=Object.keys(schools).map(n=>`<option${n===old?" selected":""}>${n}</option>`).join("");
  if(!sel.value) sel.value=Object.keys(schools)[0];
}
function refreshSchool(){
  const n=$("school").value,d=schools[n]||{};
  $("title").textContent=n+"｜高一數學";
  $("sub").textContent=$("year").value+"學年度｜"+$("term").value+"｜"+$("exam").value;
  $("desc").textContent=d.desc||"來源資料待補";
  $("official").href=d.url||"#";
  const s=$("status"); s.textContent=d.status||"待核驗";
  s.className="status "+(d.tone==="good"?"goodS":d.tone==="mid"?"midS":"lowS");
}
function openPanel(id){
  $("home").style.display="none";
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  $(id).classList.add("active");
  if(id==="wrong")renderWrong();
  if(id==="weak")renderWeak();
  window.scrollTo(0,0);
}
function goHome(){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  $("home").style.display="block";refreshStats();window.scrollTo(0,0);
}
document.addEventListener("click",e=>{
  const o=e.target.closest("[data-open]"); if(o){openPanel(o.dataset.open);return}
  const h=e.target.closest("[data-home]"); if(h)goHome();
});

function chooseSet(){
  const t=$("topicFilter").value,l=$("levelFilter").value,qty=+$("qtyFilter").value;
  const pool=questions.filter(q=>(t==="全部"||q.topic===t)&&(l==="全部"||q.level===l));
  current=shuffle(pool).slice(0,Math.min(qty,pool.length));answers={};renderQuiz();
  $("countText").textContent=`目前產生 ${current.length} 題（符合條件共 ${pool.length} 題）｜資料來源：${dbMode==="cloud"?"Supabase":"本機備援"}`;
}
function renderQuiz(){
  $("quiz").innerHTML=current.map((q,i)=>`<div class="card qcard"><div class="qtitle">${i+1}. ${q.q} <span class="tag">${q.topic}</span><span class="tag">${q.level}</span></div><div class="opts">${q.o.map((x,j)=>`<button class="opt" data-q="${q.id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${x}</button>`).join("")}</div><div class="explain" id="exp${q.id}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
}
$("quiz").addEventListener("click",e=>{
  const b=e.target.closest(".opt"); if(!b)return;
  const id=+b.dataset.q,opt=+b.dataset.opt,q=questions.find(x=>x.id===id);answers[id]=opt;
  document.querySelectorAll(`.opt[data-q="${id}"]`).forEach(x=>x.classList.remove("selected","correct","wrong"));
  b.classList.add("selected",opt===q.a?"correct":"wrong");
  const c=document.querySelector(`.opt[data-q="${id}"][data-opt="${q.a}"]`); if(c)c.classList.add("correct");
  $("exp"+id).classList.add("show");
});
async function finishPractice(){
  let done=0,correct=0,wrong=[];
  current.forEach(q=>{if(answers[q.id]!==undefined){done++;if(answers[q.id]===q.a)correct++;else wrong.push(q.id)}});
  const score=done?Math.round(correct/done*100):0;
  saveLocalSession(done,score,wrong,current,answers);
  if(db&&user) await syncAttempts(current,answers,"practice");
  $("result").innerHTML=`<h3>成績：${score} 分</h3><p>已作答 ${done} 題，答對 ${correct} 題。${db&&user?" 已同步到 Supabase。":" 目前儲存在此裝置。"}</p>`;
  refreshStats();
}
function saveLocalSession(done,score,wrong,set,ans){
  localStorage.setItem("v42score",String(score));localStorage.setItem("v42done",String(done));
  const old=JSON.parse(localStorage.getItem("v42wrong")||"[]");
  localStorage.setItem("v42wrong",JSON.stringify(Array.from(new Set(old.concat(wrong)))));
  const hist=JSON.parse(localStorage.getItem("v42hist")||"{}");
  set.forEach(q=>{if(ans[q.id]!==undefined){if(!hist[q.topic])hist[q.topic]={ok:0,total:0};hist[q.topic].total++;if(ans[q.id]===q.a)hist[q.topic].ok++}});
  localStorage.setItem("v42hist",JSON.stringify(hist));
}
async function syncAttempts(set,ans,mode){
  if(!db||!user)return;
  const rows=set.filter(q=>ans[q.id]!==undefined).map(q=>({
    user_id:user.id,question_id:q.id,selected_index:ans[q.id],is_correct:ans[q.id]===q.a,mode,
    school_name:$("school").value,academic_year:+$("year").value,exam_name:$("exam").value
  }));
  if(rows.length){const {error}=await db.from("attempts").insert(rows);if(error)console.error(error)}
  const wrong=set.filter(q=>ans[q.id]!==undefined&&ans[q.id]!==q.a);
  for(const q of wrong){
    const {data:old}=await db.from("wrong_questions").select("id,wrong_count").eq("user_id",user.id).eq("question_id",q.id).maybeSingle();
    if(old) await db.from("wrong_questions").update({wrong_count:(old.wrong_count||0)+1,last_wrong_at:new Date().toISOString(),mastered:false}).eq("id",old.id);
    else await db.from("wrong_questions").insert({user_id:user.id,question_id:q.id,wrong_count:1});
  }
}
function startMock(){
  const qty=+$("mockQty").value;mock=shuffle(questions).slice(0,qty);mockAnswers={};
  $("mockQuiz").innerHTML=mock.map((q,i)=>`<div class="card qcard"><div class="qtitle">${i+1}. ${q.q}<span class="tag">${q.level}</span></div><div class="opts">${q.o.map((x,j)=>`<button class="opt mockopt" data-q="${q.id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${x}</button>`).join("")}</div><div class="explain" id="mexp${q.id}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
  $("mockSubmitBox").style.display="block";$("mockResult").innerHTML="";
}
$("mockQuiz").addEventListener("click",e=>{
  const b=e.target.closest(".mockopt");if(!b)return;const id=+b.dataset.q;mockAnswers[id]=+b.dataset.opt;
  document.querySelectorAll(`.mockopt[data-q="${id}"]`).forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
});
async function submitMock(){
  if(!mock.length)return;
  let correct=0,wrong=[];
  mock.forEach(q=>{
    if(mockAnswers[q.id]===q.a)correct++;else if(mockAnswers[q.id]!==undefined)wrong.push(q.id);
    document.querySelectorAll(`.mockopt[data-q="${q.id}"]`).forEach(x=>{const op=+x.dataset.opt;if(op===q.a)x.classList.add("correct");if(mockAnswers[q.id]===op&&op!==q.a)x.classList.add("wrong")});
    $("mexp"+q.id).classList.add("show");
  });
  const done=mock.filter(q=>mockAnswers[q.id]!==undefined).length,score=done?Math.round(correct/done*100):0;
  saveLocalSession(done,score,wrong,mock,mockAnswers);
  if(db&&user)await syncAttempts(mock,mockAnswers,"mock");
  $("mockResult").innerHTML=`<h3>模擬考：${score} 分</h3><p>已作答 ${done} 題，答對 ${correct} 題。</p>`;refreshStats();
}
function renderSources(){
  $("sourceRows").innerHTML=Object.keys(schools).map(n=>{const d=schools[n];return `<tr><td><b>${n}</b></td><td><span class="status ${d.tone==="good"?"goodS":d.tone==="mid"?"midS":"lowS"}">${d.status}</span></td><td>${d.desc}</td><td><a class="linkbtn soft" target="_blank" href="${d.url}">官方入口</a></td></tr>`}).join("");
}
async function renderWrong(){
  let ids=JSON.parse(localStorage.getItem("v42wrong")||"[]");
  if(db&&user){
    const {data}=await db.from("wrong_questions").select("question_id").eq("user_id",user.id).eq("mastered",false);
    if(data) ids=Array.from(new Set(ids.concat(data.map(x=>x.question_id))));
  }
  $("wrongList").innerHTML=ids.length?ids.map((id,i)=>{const q=questions.find(x=>x.id===id);if(!q)return"";return `<div class="card qcard"><div class="qtitle">${i+1}. ${q.q}<span class="tag">${q.topic}</span></div><div class="explain show"><b>答案：</b>${q.o[q.a]}<br><b>詳解：</b>${q.e}</div></div>`}).join(""):'<div class="card">目前沒有錯題。</div>';
}
function renderWeak(){
  const hist=JSON.parse(localStorage.getItem("v42hist")||"{}"),topics=["實數","多項式","指數","對數","綜合"];
  $("weakBars").innerHTML=topics.map(t=>{const h=hist[t],pct=h&&h.total?Math.round(h.ok/h.total*100):0;return `<div class="barrow"><b>${t}</b><div class="bar"><i style="width:${pct}%"></i></div><span>${h&&h.total?pct+"%":"-"}</span></div>`}).join("");
}
function refreshStats(){
  const s=localStorage.getItem("v42score"),d=+(localStorage.getItem("v42done")||0),w=JSON.parse(localStorage.getItem("v42wrong")||"[]").length;
  $("score").textContent=s===null?"-":s;$("doneN").textContent=d;$("wrongN").textContent=w;$("prog").style.width=Math.min(100,Math.round(d/50*100))+"%";
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("showToast");setTimeout(()=>t.classList.remove("showToast"),3200)}
function openSettings(){const c=cfg();$("urlInput").value=c.url;$("keyInput").value=c.key;$("settingsModal").classList.add("modalShow")}
function closeSettings(){$("settingsModal").classList.remove("modalShow")}
async function saveSettings(){localStorage.setItem("v42_url",$("urlInput").value.trim());localStorage.setItem("v42_key",$("keyInput").value.trim());closeSettings();await connectDB(true)}
function useLocal(){localStorage.removeItem("v42_url");localStorage.removeItem("v42_key");db=null;dbMode="local";schools=F.schools;questions=F.questions;populateSchools();chooseSet();renderSources();refreshSchool();setDbBadge(false,"本機備援");closeSettings();toast("已切換成本機題庫。")}

["school","year","term","exam"].forEach(id=>$(id).addEventListener("change",refreshSchool));
$("applyFilter").addEventListener("click",chooseSet);$("resetBtn").addEventListener("click",chooseSet);$("finishBtn").addEventListener("click",finishPractice);
$("startMock").addEventListener("click",startMock);$("submitMock").addEventListener("click",submitMock);
$("clearWrong").addEventListener("click",()=>{localStorage.removeItem("v42wrong");renderWrong();refreshStats()});
$("settingsBtn").addEventListener("click",openSettings);$("closeSettings").addEventListener("click",closeSettings);$("saveSettings").addEventListener("click",saveSettings);$("localBtn").addEventListener("click",useLocal);
$("magicBtn").addEventListener("click",sendMagicLink);$("signOutBtn").addEventListener("click",signOut);

populateSchools();refreshSchool();renderSources();chooseSet();refreshStats();connectDB(false);
})();
