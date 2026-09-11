
(function(){
"use strict";
const F=window.V42_FALLBACK;
const $=id=>document.getElementById(id);
let db=null, dbMode="local", schools=F.schools, questions=F.questions;
let current=[], answers={}, mock=[], mockAnswers={}, user=null;
let sourceDocs=[];

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
    const {data:sd,error:sde}=await db.from("source_documents").select("*,schools(name)").order("academic_year",{ascending:false});
    if(se||qe) throw (se||qe);
    sourceDocs = (!sde && sd) ? sd : [];
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
  if(id==="historical")loadHistorical(false);
  if(id==="autopaper")showScopeProfile();
  if(id==="study")startStudy(false);
  if(id==="helper")renderHelper();
  window.scrollTo(0,0);
}
function goHome(){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  $("home").style.display="block";refreshStats();window.scrollTo(0,0);
}
document.addEventListener("click",e=>{
  const ps=e.target.closest("[data-practice-source]"); if(ps){$("school").value=ps.dataset.school;$("year").value=ps.dataset.year;$("term").value=ps.dataset.term==="1"?"上學期":"下學期";$("exam").value=ps.dataset.exam;refreshSchool();openPanel("practice");chooseSet();return}
  const o=e.target.closest("[data-open]"); if(o){openPanel(o.dataset.open);return}
  const h=e.target.closest("[data-home]"); if(h)goHome();
});

function chooseSet(){sessionStorage.setItem("v471_session","practice-"+Date.now());
  const t=$("topicFilter").value,l=$("levelFilter").value,qty=+$("qtyFilter").value;
  const pool=questions.filter(q=>(t==="全部"||q.topic===t)&&(l==="全部"||q.level===l));
  current=shuffle(pool).slice(0,Math.min(qty,pool.length));answers={};renderQuiz();
  $("countText").textContent=`目前產生 ${current.length} 題（符合條件共 ${pool.length} 題）｜資料來源：${dbMode==="cloud"?"Supabase":"本機備援"}`;
}
function renderQuiz(){
  $("quiz").innerHTML=current.map((q,i)=>`<div class="card qcard"><div class="qtitle">${i+1}. ${q.q} <span class="tag">${q.topic}</span><span class="tag">${q.level}</span></div><div class="opts">${q.o.map((x,j)=>`<button class="opt" data-q="${q.id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${x}</button>`).join("")}</div><div class="inlineTools"><button class="soft" data-dontknow-q="${q.id}">我不會</button><button class="soft" data-ask-q="${q.id}">問 ChatGPT</button><button class="soft" data-explain-q="${q.id}">詳解看不懂</button></div><div class="explain" id="exp${q.id}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
}
$("quiz").addEventListener("click",e=>{
  const b=e.target.closest(".opt"); if(!b)return;
  const id=+b.dataset.q,opt=+b.dataset.opt,q=questions.find(x=>x.id===id);answers[id]=opt;
  document.querySelectorAll(`.opt[data-q="${id}"]`).forEach(x=>x.classList.remove("selected","correct","wrong"));
  b.classList.add("selected",opt===q.a?"correct":"wrong");
  if(opt!==q.a)markNeedHelp(q,`答錯：我選 ${String.fromCharCode(65+opt)}，正確答案是 ${String.fromCharCode(65+q.a)}`,"",opt);
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
function startMock(){sessionStorage.setItem("v471_session","mock-"+Date.now());
  const qty=+$("mockQty").value;mock=shuffle(questions).slice(0,qty);mockAnswers={};
  $("mockQuiz").innerHTML=mock.map((q,i)=>`<div class="card qcard"><div class="qtitle">${i+1}. ${q.q}<span class="tag">${q.level}</span></div><div class="opts">${q.o.map((x,j)=>`<button class="opt mockopt" data-q="${q.id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${x}</button>`).join("")}</div><div class="inlineTools"><button class="soft" data-mock-dk="${q.id}">我不會</button><button class="soft" data-mock-ask="${q.id}">問 ChatGPT</button></div><div class="explain" id="mexp${q.id}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
  $("mockSubmitBox").style.display="block";$("mockResult").innerHTML="";
}
$("mockQuiz").addEventListener("click",e=>{
 const dk=e.target.closest("[data-mock-dk]"),ask=e.target.closest("[data-mock-ask]");
 if(dk||ask){const id=+(dk?.dataset.mockDk||ask?.dataset.mockAsk),q=questions.find(x=>x.id===id);if(q){if(dk)markNeedHelp(q,"我不會");else queueForChatGPT(q,"我想請 ChatGPT 再解釋");}return;}

  const b=e.target.closest(".mockopt");if(!b)return;const id=+b.dataset.q;mockAnswers[id]=+b.dataset.opt;
  document.querySelectorAll(`.mockopt[data-q="${id}"]`).forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
});
async function submitMock(){
  if(!mock.length)return;
  let correct=0,wrong=[];
  mock.forEach(q=>{
    if(mockAnswers[q.id]===q.a)correct++;else if(mockAnswers[q.id]!==undefined){wrong.push(q.id);markNeedHelp(q,`答錯：我選 ${String.fromCharCode(65+mockAnswers[q.id])}，正確答案是 ${String.fromCharCode(65+q.a)}`,"",mockAnswers[q.id]);}
    document.querySelectorAll(`.mockopt[data-q="${q.id}"]`).forEach(x=>{const op=+x.dataset.opt;if(op===q.a)x.classList.add("correct");if(mockAnswers[q.id]===op&&op!==q.a)x.classList.add("wrong")});
    $("mexp"+q.id).classList.add("show");
    const card=$("mexp"+q.id).parentElement;if(!card.querySelector("[data-mock-explain]")){const bt=document.createElement("button");bt.className="soft";bt.dataset.mockExplain=q.id;bt.textContent="詳解看不懂";bt.onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");};card.appendChild(bt);}
  });
  const done=mock.filter(q=>mockAnswers[q.id]!==undefined).length,score=done?Math.round(correct/done*100):0;
  saveLocalSession(done,score,wrong,mock,mockAnswers);
  if(db&&user)await syncAttempts(mock,mockAnswers,"mock");
  $("mockResult").innerHTML=`<h3>模擬考：${score} 分</h3><p>已作答 ${done} 題，答對 ${correct} 題。</p>`;refreshStats();
}
function termNumber(){ return $("term").value==="上學期"?1:2; }
function renderHistorical(list){
  const box=$("historicalList");
  if(!list.length){box.innerHTML='<div class="card sourcecard">目前選擇條件尚未建立官方歷屆來源索引。可切換到「成功高中」，或按「顯示成功高中全部來源」。</div>';return;}
  const typeMap={exam_index:"官方考卷索引",scope:"官方考試範圍",answer:"官方答案"};
  box.innerHTML=list.map(x=>{
    const school=(x.schools&&x.schools.name)?x.schools.name:"成功高中";
    return `<div class="card sourcecard"><div class="sourcehead"><div><h3 style="margin:0">${x.title}</h3><div class="sourcemeta"><span>${school}</span><span>${x.academic_year}學年度</span><span>${x.term===1?"上學期":"下學期"}</span><span>${x.exam_name}</span></div></div><span class="sourcetype">${typeMap[x.document_type]||x.document_type}</span></div><p class="small">${x.scope_text||""}</p><div class="sourceactions"><a class="linkbtn primary" href="${x.source_url}" target="_blank" rel="noopener">開啟校方官方來源</a><button class="soft" data-practice-source="1" data-school="${school}" data-year="${x.academic_year}" data-term="${x.term}" data-exam="${x.exam_name}">練同範圍原創題</button></div></div>`;
  }).join("");
}
async function loadHistorical(showAll=false){
  $("historicalStatus").textContent="讀取來源中…";
  if(dbMode!=="cloud" || !db){$("historicalStatus").textContent="歷屆真題索引需連線 Supabase V4.3 資料庫。請先執行 03_v43_migration.sql。";renderHistorical([]);return;}
  let query=db.from("source_documents").select("*,schools(name)").order("academic_year",{ascending:false});
  if(!showAll){
    const {data:schoolData}=await db.from("schools").select("id").eq("name",$("school").value).maybeSingle();
    if(schoolData) query=query.eq("school_id",schoolData.id);
    query=query.eq("academic_year",+$("year").value).eq("term",termNumber()).eq("exam_name",$("exam").value);
  } else {
    const {data:schoolData}=await db.from("schools").select("id").eq("name","成功高中").maybeSingle();
    if(schoolData) query=query.eq("school_id",schoolData.id);
  }
  const {data,error}=await query;
  if(error){console.error(error);$("historicalStatus").textContent="來源讀取失敗："+error.message;renderHistorical([]);return;}
  sourceDocs=data||[];$("historicalStatus").textContent=`找到 ${sourceDocs.length} 筆官方來源資料。`;renderHistorical(sourceDocs);
}

let autoPaper=[],autoAnswers={},activeScope=null;
async function getScopeProfile(){if(dbMode!=="cloud"||!db)return null;const {data:s}=await db.from("schools").select("id").eq("name",$("school").value).maybeSingle();if(!s)return null;const {data}=await db.from("exam_scope_profiles").select("*").eq("school_id",s.id).eq("academic_year",+$("year").value).eq("term",$("term").value==="上學期"?1:2).eq("exam_name",$("exam").value).eq("grade",1).eq("subject","數學").maybeSingle();return data||null;}
async function showScopeProfile(){activeScope=await getScopeProfile();const box=$("scopeProfile");if(!activeScope){box.innerHTML="目前這個學校／學年度／段考尚未建立已核驗範圍。你仍可使用「原創練習」。";return;}const tw=activeScope.topic_weights||{},dw=activeScope.difficulty_weights||{};box.innerHTML=`<b>已核驗範圍：</b>${activeScope.scope_label}<div class="chips">${Object.entries(tw).map(([k,v])=>`<span class="chip">${k} ${v}%</span>`).join("")}</div><div class="small">難度配置：${Object.entries(dw).map(([k,v])=>`${k} ${v}%`).join("／")}</div>${activeScope.source_url?`<p><a class="linkbtn soft" target="_blank" rel="noopener" href="${activeScope.source_url}">查看官方範圍來源</a></p>`:""}`;}
function weightedPick(pool,weights,key,n){let result=[],used=new Set();for(const [label,pct] of Object.entries(weights||{})){const want=Math.round(n*(+pct)/100),candidates=pool.filter(q=>q[key]===label&&!used.has(q.id));shuffle(candidates).slice(0,want).forEach(q=>{result.push(q);used.add(q.id)});}return result.concat(shuffle(pool.filter(q=>!used.has(q.id))).slice(0,Math.max(0,n-result.length))).slice(0,n);}
async function buildAutoPaper(){sessionStorage.setItem("v471_session","auto-"+Date.now());activeScope=await getScopeProfile();if(!activeScope){toast("這組條件尚無已核驗官方範圍");return;}const n=+$("autoQty").value,topics=Object.keys(activeScope.topic_weights||{}),pool=questions.filter(q=>topics.includes(q.topic));autoPaper=weightedPick(pool,activeScope.topic_weights,"topic",n);autoAnswers={};renderAutoPaper();$("autoSubmitBox").style.display="block";}
function renderAutoPaper(){$("autoQuiz").innerHTML=autoPaper.map((q,i)=>`<div class="card qcard"><div class="small">第 ${i+1} 題 · ${q.topic} · ${q.level}</div><div class="qtitle">${q.question}</div><div class="opts">${q.options.map((o,j)=>`<button class="opt" data-ai="${i}" data-aj="${j}">${String.fromCharCode(65+j)}. ${o}</button>`).join("")}</div><div class="inlineTools"><button class="soft" data-auto-dk="${i}">我不會</button><button class="soft" data-auto-ask="${i}">問 ChatGPT</button></div><div class="explain" id="aexp${i}"><b>答案：</b>${String.fromCharCode(65+q.answer)}<br><b>詳解：</b>${q.explanation}</div></div>`).join("");document.querySelectorAll("[data-ai]").forEach(b=>b.onclick=()=>{const i=+b.dataset.ai,j=+b.dataset.aj;autoAnswers[i]=j;b.parentElement.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});}
 document.querySelectorAll("[data-auto-dk]").forEach(b=>b.onclick=()=>{const q=autoPaper[+b.dataset.autoDk];markNeedHelp({id:q.id,topic:q.topic,level:q.level,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation},"我不會");});
 document.querySelectorAll("[data-auto-ask]").forEach(b=>b.onclick=()=>{const q=autoPaper[+b.dataset.autoAsk];queueForChatGPT({id:q.id,topic:q.topic,level:q.level,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation},"我想請 ChatGPT 再解釋");});

async function submitAutoPaper(){let correct=0;autoPaper.forEach((q,i)=>{const card=$("aexp"+i).parentElement,opts=card.querySelectorAll(".opt");opts[q.answer].classList.add("correct");if(autoAnswers[i]===q.answer)correct++;else if(autoAnswers[i]!=null){opts[autoAnswers[i]].classList.add("wrong");markNeedHelp({id:q.id,topic:q.topic,level:q.level,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation},`答錯：我選 ${String.fromCharCode(65+autoAnswers[i])}，正確答案是 ${String.fromCharCode(65+q.answer)}`,"",autoAnswers[i]);}$("aexp"+i).classList.add("show");const card=$("aexp"+i).parentElement;if(!card.querySelector("[data-auto-explain]")){const bt=document.createElement("button");bt.className="soft";bt.dataset.autoExplain=i;bt.textContent="詳解看不懂";bt.onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp({id:q.id,topic:q.topic,level:q.level,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation},"詳解看不懂",note||"");};card.appendChild(bt);}});const score=Math.round(correct/Math.max(1,autoPaper.length)*100);$("autoResult").innerHTML=`<h3>${$("school").value} ${$("year").value} ${$("term").value} ${$("exam").value} 模擬卷：${score} 分</h3><p class="small">${correct}/${autoPaper.length} 題正確 · 範圍：${activeScope.scope_label}</p>`;}

let studyPool=[],studyIndex=0,studyReveal=0;
function studyHint(q){
 const hints={
  "實數":"先整理數的性質、根式或絕對值條件，再決定運算順序。",
  "多項式":"先觀察是否能因式分解、代入特殊值，或使用餘式／因式定理。",
  "指數":"先把底數統一，再比較指數；注意指數律的使用條件。",
  "對數":"先確認真數大於 0，再利用乘法、除法與次方的對數律。",
  "綜合":"先判斷題目主要考哪個觀念，把已知條件轉成代數式。"
 };return hints[q.topic]||"先圈出已知條件與要求的量，再選擇對應公式。";
}
function studyKey(q){
 const map={"實數":"數與式的定義、運算性質與條件","多項式":"因式分解、餘式定理與代數運算","指數":"指數律、同底轉換與成長關係","對數":"對數定義、換底與對數律","綜合":"辨識核心觀念並串聯條件"};
 return map[q.topic]||q.topic;
}
function studyMistake(q){
 const map={"實數":"忽略根式、分母或絕對值造成的條件限制。","多項式":"展開或移項時符號錯誤，或把餘式定理的代入值弄反。","指數":"把加法誤套成指數律，或底數未統一就直接比較。","對數":"忘記真數必須大於 0，或把 log(a+b) 錯拆成兩個對數。","綜合":"太快計算，沒有先確認題目真正要求的量。"};
 return map[q.topic]||"計算前未檢查條件與符號。";
}
function startStudy(fromWrong=false){
 let pool=questions.slice();
 if(fromWrong){const ids=(JSON.parse(localStorage.getItem("wrong")||"[]")).map(x=>x.id);pool=pool.filter(q=>ids.includes(q.id));}
 else{const t=$("studyTopic").value,l=$("studyLevel").value;if(t!=="全部")pool=pool.filter(q=>q.topic===t);if(l!=="全部")pool=pool.filter(q=>q.level===l);}
 studyPool=shuffle(pool);studyIndex=0;studyReveal=0;
 if(!studyPool.length){$("studyCard").innerHTML='<div class="card">目前沒有符合條件的題目。</div>';return;}
 renderStudy();
}
function renderStudy(){
 const q=studyPool[studyIndex%studyPool.length];studyReveal=0;
 $("studyProgress").textContent=`第 ${studyIndex+1} 題 · ${q.topic} · ${q.level}`;
 $("studyCard").innerHTML=`<div class="card qcard"><div class="qtitle">${q.question}</div><div class="opts">${q.options.map((o,j)=>`<button class="opt" data-study-opt="${j}">${String.fromCharCode(65+j)}. ${o}</button>`).join("")}</div><div class="studyActions"><button class="soft" id="dontKnow">我不會</button><button class="soft" id="showHint">提示 1</button><button class="soft" id="askLater">加入待詢</button><button class="primary" id="checkStudy">確認答案</button></div><div id="studyExplain" class="studySteps"></div><div class="confidence"><span class="small">這題掌握度：</span><button data-conf="1">再學一次</button><button data-conf="2">有點懂</button><button data-conf="3">已掌握</button></div></div>`;
 let picked=null;
 document.querySelectorAll("[data-study-opt]").forEach(b=>b.onclick=()=>{picked=+b.dataset.studyOpt;b.parentElement.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
 $("showHint").onclick=()=>revealStudy(q,1);$("askLater").onclick=()=>queueForChatGPT(q,"我想請 ChatGPT 再解釋");
 $("dontKnow").onclick=()=>{revealStudy(q,4);saveStudyWrong(q,"不會");queueForChatGPT(q,"我不會")};
 $("checkStudy").onclick=()=>{if(picked==null){toast("先選一個答案，或按「我不會」");return;}const opts=document.querySelectorAll("[data-study-opt]");opts[q.answer].classList.add("correct");if(picked!==q.answer){opts[picked].classList.add("wrong");saveStudyWrong(q,"答錯");queueForChatGPT(q,`我答錯了，我選 ${String.fromCharCode(65+picked)}`);}revealStudy(q,4);};
 document.querySelectorAll("[data-conf]").forEach(b=>b.onclick=()=>{saveConfidence(q,+b.dataset.conf);studyIndex++;renderStudy();});
}
function revealStudy(q,to){
 studyReveal=Math.max(studyReveal,to);const e=$("studyExplain"),steps=[];
 if(studyReveal>=1)steps.push(`<div class="studyStep"><b>① 提示</b><br>${studyHint(q)}</div>`);
 if(studyReveal>=2)steps.push(`<div class="studyStep"><b>② 破題關鍵</b><br>先辨識本題屬於「${q.topic}」，核心是：${studyKey(q)}。</div>`);
 if(studyReveal>=3)steps.push(`<div class="studyStep"><b>③ 使用觀念／公式</b><br>${studyKey(q)}。把題目條件逐一代入，不要跳步。</div>`);
 if(studyReveal>=4)steps.push(`<div class="studyStep"><b>④ 完整詳解</b><br>正確答案：${String.fromCharCode(65+q.answer)}<br>${q.explanation}</div><div class="studyStep"><b>⑤ 常見錯誤</b><br>${studyMistake(q)}</div><div class="studyActions"><button class="soft" id="studyExplainHelp">詳解看不懂</button></div>`);
 e.innerHTML=steps.join("");if(studyReveal>=4&&$("studyExplainHelp"))$("studyExplainHelp").onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");};
 if(studyReveal<4){const btn=document.createElement("button");btn.className="soft";btn.textContent=studyReveal===1?"再給我破題關鍵":studyReveal===2?"顯示使用觀念": "看完整詳解";btn.onclick=()=>revealStudy(q,studyReveal+1);e.appendChild(btn);}
}
function saveStudyWrong(q,reason){
 let arr=JSON.parse(localStorage.getItem("wrong")||"[]");if(!arr.some(x=>x.id===q.id))arr.push({...q,reason});localStorage.setItem("wrong",JSON.stringify(arr));updateStats();
}
function saveConfidence(q,level){
 let m=JSON.parse(localStorage.getItem("studyConfidence")||"{}");m[q.id]={level,at:new Date().toISOString()};localStorage.setItem("studyConfidence",JSON.stringify(m));
}


function addToLegacyWrong(q){
 let arr=JSON.parse(localStorage.getItem("wrong")||"[]");
 if(!arr.some(x=>x.id===q.id))arr.push(q);
 localStorage.setItem("wrong",JSON.stringify(arr));
}
function markNeedHelp(q,reason,note="",picked=null){
 addToLegacyWrong(q);
 queueForChatGPT(q,reason,note,picked);
}
function getStudyQueue(){return JSON.parse(localStorage.getItem("studyQueue")||"[]");}
function setStudyQueue(a){localStorage.setItem("studyQueue",JSON.stringify(a));}
function queueForChatGPT(q,reason="我不會",note="",picked=null){
 let a=getStudyQueue(),old=a.find(x=>x.id===q.id);
 const item={
   id:q.id,topic:q.topic,level:q.level,question:q.question,options:q.options,
   answer:q.answer,explanation:q.explanation,reason,note,picked,
   school:$("school").value,year:$("year").value,term:$("term").value,exam:$("exam").value,
   sessionId:sessionStorage.getItem("v471_session")||"",at:new Date().toISOString()
 };
 if(old)Object.assign(old,item);else a.push(item);
 setStudyQueue(a);toast("已加入錯題本＋ChatGPT 待詢清單");
}
function promptForItem(x){
 const opts=(x.options||[]).map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join("\n");
 return `我是台灣高一學生，正在準備 ${x.school} ${x.year} 學年度 ${x.term} ${x.exam}。\n\n【章節】${x.topic}（${x.level}）\n【題目】${x.question}\n【選項】\n${opts}\n【題庫答案】${String.fromCharCode(65+Number(x.answer))}\n【題庫原詳解】${x.explanation||"無"}\n【我的狀況】${x.reason}${x.picked!=null?`\n【我選的答案】${String.fromCharCode(65+Number(x.picked))}`:""}${x.note?`\n【我卡住的地方】${x.note}`:""}\n\n請用台灣高中一年級程度教我，不要只丟答案。請依序：\n1. 說明這題考什麼觀念\n2. 告訴我破題關鍵\n3. 用清楚、不跳步的方式解題\n4. 指出我最可能犯的錯誤\n5. 最後出一題同觀念、難度相近的題目讓我練習，先不要公布答案。`;
}
async function copyTextSafe(text){try{await navigator.clipboard.writeText(text);toast("已複製，可直接貼到 ChatGPT");}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("已複製，可直接貼到 ChatGPT");}}
function reasonClass(r){
 if(String(r).includes("答錯"))return "reason-wrong";
 if(String(r).includes("詳解"))return "reason-explain";
 return "reason-dontknow";
}
function renderHelper(){
 const a=getStudyQueue();
 const wrong=a.filter(x=>String(x.reason).includes("答錯")).length;
 const dont=a.filter(x=>String(x.reason).includes("不會")).length;
 const explain=a.filter(x=>String(x.reason).includes("詳解")||String(x.reason).includes("再解釋")).length;
 $("helperSummary").innerHTML=`目前 ${a.length} 題：<span class="reasonTag reason-wrong">答錯 ${wrong}</span> <span class="reasonTag reason-dontknow">我不會 ${dont}</span> <span class="reasonTag reason-explain">詳解看不懂 ${explain}</span>`;
 $("helperList").innerHTML=a.length?a.map((x,i)=>`<div class="card qcard"><div class="small">${x.school} · ${x.year} · ${x.term} · ${x.exam} · ${x.topic} · ${x.level}</div><div class="qtitle">${x.question}</div><p class="small"><span class="reasonTag ${reasonClass(x.reason)}">${x.reason}</span>${x.picked!=null?`｜我選 ${String.fromCharCode(65+Number(x.picked))}`:""}${x.note?`｜卡點：${x.note}`:""}</p><div class="filters"><button class="primary" data-copy-helper="${i}">複製這一題問 ChatGPT</button><button class="soft" data-note-helper="${i}">補充我卡住的地方</button><button class="warn" data-del-helper="${i}">移除</button></div></div>`).join(""):'<div class="card">目前沒有待詢問題。任何模式按「我不會」、答錯或「詳解看不懂」都會自動加入。</div>';
 document.querySelectorAll("[data-copy-helper]").forEach(b=>b.onclick=()=>copyTextSafe(promptForItem(a[+b.dataset.copyHelper])));
 document.querySelectorAll("[data-note-helper]").forEach(b=>b.onclick=()=>{const i=+b.dataset.noteHelper,n=prompt("你卡在哪裡？例如：看不懂第二步為什麼可以移項",a[i].note||"");if(n!==null){a[i].note=n;setStudyQueue(a);renderHelper();}});
 document.querySelectorAll("[data-del-helper]").forEach(b=>b.onclick=()=>{a.splice(+b.dataset.delHelper,1);setStudyQueue(a);renderHelper();});
}
function copyAllStudyQuestions(){
 const a=getStudyQueue();if(!a.length){toast("目前沒有待詢問題");return;}
 const head=`我正在準備台灣高中數學段考。以下是我目前不會、答錯或看不懂的題目。請一次先診斷我的共同弱點，再逐題教我。每題請用「觀念 → 破題 → 分步驟 → 常見錯誤」的方式，不要只給答案。最後請依我的弱點出 3 題新的練習題，先不要公布答案。\n\n`;
 copyTextSafe(head+a.map((x,i)=>`========== 第 ${i+1} 題 ==========\n${promptForItem(x)}`).join("\n\n"));
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
$("loadHistorical").addEventListener("click",()=>loadHistorical(false));
$("buildAutoPaper").addEventListener("click",buildAutoPaper);
$("newStudy").addEventListener("click",()=>startStudy(false));
$("copyAllQuestions").addEventListener("click",copyAllStudyQuestions);
if($("copyAllQuestions")&&!$("copySessionQuestions")){
 const b=document.createElement("button");b.id="copySessionQuestions";b.className="soft";b.textContent="複製本次測驗問題";
 $("copyAllQuestions").parentElement.insertBefore(b,$("copyAllQuestions").nextSibling);
 b.addEventListener("click",copyCurrentSessionQuestions);
}
$("clearStudyQueue").addEventListener("click",()=>{if(confirm("確定清除全部待詢問題？")){setStudyQueue([]);renderHelper();}});
$("reviewWeak").addEventListener("click",()=>startStudy(true));
$("submitAuto").addEventListener("click",submitAutoPaper);
$("showAllHistorical").addEventListener("click",()=>loadHistorical(true));
$("applyFilter").addEventListener("click",chooseSet);$("resetBtn").addEventListener("click",chooseSet);$("quiz").addEventListener("click",e=>{
 const dk=e.target.closest("[data-dontknow-q]"),ask=e.target.closest("[data-ask-q]"),ex=e.target.closest("[data-explain-q]");
 if(!dk&&!ask&&!ex)return;
 const id=+(dk?.dataset.dontknowQ||ask?.dataset.askQ||ex?.dataset.explainQ),q=questions.find(x=>x.id===id);if(!q)return;
 if(dk)markNeedHelp(q,"我不會");
 if(ask)queueForChatGPT(q,"我想請 ChatGPT 再解釋");
 if(ex){const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");}
});
$("finishBtn").addEventListener("click",finishPractice);
$("startMock").addEventListener("click",startMock);$("submitMock").addEventListener("click",submitMock);
$("clearWrong").addEventListener("click",()=>{localStorage.removeItem("v42wrong");renderWrong();refreshStats()});
$("settingsBtn").addEventListener("click",openSettings);$("closeSettings").addEventListener("click",closeSettings);$("saveSettings").addEventListener("click",saveSettings);$("localBtn").addEventListener("click",useLocal);
$("magicBtn").addEventListener("click",sendMagicLink);$("signOutBtn").addEventListener("click",signOut);

populateSchools();refreshSchool();renderSources();chooseSet();refreshStats();connectDB(false);
})();
