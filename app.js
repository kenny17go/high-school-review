window.V4965_BUILD="4.9.6.5-persist-settings-20260911";

(function(){
"use strict";
const F=window.V42_FALLBACK;
const $=id=>document.getElementById(id);
let db=null, dbMode="local", schools=F.schools, questions=F.questions;
let current=[], answers={}, mock=[], mockAnswers={}, user=null;
let sourceDocs=[];
let schoolBankIds=null,schoolProfile=null,activeSchoolId=null,activeScopeV48=null;
let v494ScopeCache=new Map(),v494Seq=0,v494Timer=null;

const V494_PROFILES={
 "建國中學":{label:"建中模擬題池",allow:q=>q.level!=="基礎"||Number(q.id)%3===0},
 "北一女中":{label:"北一女模擬題池",allow:q=>q.level!=="基礎"||Number(q.id)%2===0},
 "師大附中":{label:"附中模擬題池",allow:q=>q.level!=="基礎"||Number(q.id)%3!==0},
 "成功高中":{label:"成功模擬題池",allow:q=>true},
 "中山女高":{label:"中山女高模擬題池",allow:q=>q.level!=="挑戰"||Number(q.id)%3!==0},
 "松山高中":{label:"松山高中模擬題池",allow:q=>true},
 "延平高中":{label:"延平模擬題池",allow:q=>q.level!=="基礎"||Number(q.id)%2===1},
 "薇閣高中":{label:"薇閣模擬題池",allow:q=>q.level!=="基礎"||Number(q.id)%2===1}
};

function v494LocalSchoolPool(name){
 const p=V494_PROFILES[name]||{label:"通用題池",allow:q=>true};
 return questions.filter(p.allow);
}
function v494ScopeKey(){return [$("school").value,$("year").value,$("term").value,$("exam").value].join("|");}
async function v494FetchScopeOnly(){
 if(dbMode!=="cloud"||!db)return null;
 const key=v494ScopeKey();
 if(v494ScopeCache.has(key))return v494ScopeCache.get(key);
 const seq=++v494Seq;
 try{
   const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),2200));
   const task=(async()=>{
     const {data:s}=await db.from("schools").select("id").eq("name",$("school").value).maybeSingle();
     if(!s)return {scope:null,sources:0};
     activeSchoolId=s.id;
     const term=$("term").value==="上學期"?1:2,year=+$("year").value,exam=$("exam").value;
     const [sp,sd]=await Promise.all([
       db.from("exam_scope_profiles").select("scope_label,topic_weights,difficulty_weights,source_url").eq("school_id",s.id).eq("academic_year",year).eq("term",term).eq("exam_name",exam).eq("grade",1).eq("subject","數學").maybeSingle(),
       db.from("source_documents").select("id").eq("school_id",s.id).eq("academic_year",year).eq("term",term).eq("exam_name",exam)
     ]);
     return {scope:sp.data||null,sources:(sd.data||[]).length};
   })();
   const meta=await Promise.race([task,timeout]);
   if(seq!==v494Seq)return null;
   v494ScopeCache.set(key,meta);return meta;
 }catch(e){
   console.warn("V4.9.4 scope background load skipped",e);
   return null;
 }
}
async function loadSchoolBankStatus(){
 const name=$("school").value;
 const pool=v494LocalSchoolPool(name);
 schoolBankIds=new Set(pool.map(q=>Number(q.id)));
 schoolProfile={profile_label:(V494_PROFILES[name]||{}).label||"平台模擬題池",official_style_verified:false};
 activeScopeV48=null;
 renderBankStatus({mode:"cloud",count:pool.length,scope:null,sources:0,profile:schoolProfile,fast:true});
 const meta=await v494FetchScopeOnly();
 if(meta){activeScopeV48=meta.scope;renderBankStatus({mode:"cloud",count:pool.length,scope:activeScopeV48,sources:meta.sources,profile:schoolProfile,fast:true});}
}
function renderBankStatus(x){
 const title=$("bankLoadTitle"),detail=$("bankLoadDetail"),badge=$("bankLoadBadge"),chips=$("bankLoadChips"),homeChip=$("homeBankChip");
 if(!title)return;
 if(x.mode==="local"){
   const c=v494LocalSchoolPool($("school").value).length;
   title.innerHTML=`<b>⚡ ${$("school").value} 題池已就緒</b>`;
   badge.textContent="本機極速";badge.className="status goodS";
   detail.textContent="目前使用本機題庫即時計算學校分流；Supabase 僅在背景補官方範圍。";
   chips.innerHTML=`<span class="chip">可用 ${c} 題</span><span class="chip">零等待切校</span>`;
   if(homeChip)homeChip.textContent=`${$("school").value} ${c} 題`;return;
 }
 const scopeText=x.scope?`已載入官方範圍：${x.scope.scope_label}`:"官方範圍背景讀取／尚未建立";
 title.innerHTML=`<b>⚡ ${$("school").value} 題池立即載入</b>`;
 badge.textContent="極速分流";badge.className="status goodS";
 detail.textContent=`${scopeText}。學校題池為平台模擬分流；不宣稱等同校方官方命題風格。`;
 chips.innerHTML=`<span class="chip">學校題池 ${x.count} 題</span><span class="chip">${x.scope?"官方範圍 ✓":"不等待範圍"}</span>${x.sources?`<span class="chip">官方來源 ${x.sources} 筆</span>`:""}`;
 if(homeChip)homeChip.textContent=`${$("school").value} ${x.count} 題`;
}
function getSchoolPool(){return v494LocalSchoolPool($("school").value);}
function getScopedSchoolPool(){
 let pool=getSchoolPool();
 if(activeScopeV48&&activeScopeV48.topic_weights){
   const topics=Object.keys(activeScopeV48.topic_weights);
   const scoped=pool.filter(q=>topics.includes(q.topic));
   if(scoped.length)pool=scoped;
 }
 return pool;
}


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

let supabaseSdkPromiseV496=null;
function ensureSupabaseSdkV496(){
  if(window.supabase)return Promise.resolve(true);
  if(supabaseSdkPromiseV496)return supabaseSdkPromiseV496;
  supabaseSdkPromiseV496=new Promise(resolve=>{
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.async=true;
    s.onload=()=>resolve(true);
    s.onerror=()=>resolve(false);
    document.head.appendChild(s);
  });
  return supabaseSdkPromiseV496;
}

async function connectDB(showMessage=false){
  const c=cfg();
  if(!c.url||!c.key){
    db=null;dbMode="local";setDbBadge(false,"⚡ 本機即用");
    if(showMessage) toast("尚未設定 Supabase，目前使用本機題庫。");
    refreshSchool();loadSchoolBankStatus(); return false;
  }
  try{
    const sdkOk=await ensureSupabaseSdkV496();
    if(!sdkOk||!window.supabase) throw new Error("Supabase SDK 載入失敗");
    db=window.supabase.createClient(c.url,c.key);
    const remoteLoad=Promise.all([
      db.from("schools").select("*").order("id"),
      db.from("questions").select("*").order("id").limit(1000)
    ]);
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error("Supabase 連線逾時")),3000));
    const [{data:s,error:se},{data:q,error:qe}] = await Promise.race([remoteLoad,timeout]);
    if(se||qe) throw (se||qe);
    sourceDocs=[];
    if(s&&s.length){
      schools={};
      s.forEach(x=>schools[x.name]={tone:x.source_tone,status:x.source_status,desc:x.description,url:x.official_url});
    }
    if(q&&q.length){
      questions=q.map(x=>({id:x.id,topic:x.topic,sub:x.subtopic,level:x.difficulty,q:x.question_text,o:x.options,a:x.correct_index,e:x.explanation}));
    }
    verifyBankV49610();
    dbMode="cloud";setDbBadge(true,"Supabase 已連線");
    await refreshAuth();
    populateSchools();
    loadSchoolBankStatus();
    chooseSet();
    renderSources();
    refreshSchool();
    if(showMessage) toast("資料庫連線成功，共讀取 "+questions.length+" 題。");
    return true;
  }catch(err){
    console.error(err);db=null;dbMode="local";schools=F.schools;questions=F.questions;
    setDbBadge(false,"連線失敗・本機備援");populateSchools();loadSchoolBankStatus();chooseSet();renderSources();refreshSchool();
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
  const panel=$(id);
  if(!panel){toast("此功能頁目前無法開啟。");return;}
  $("home").style.display="none";
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  panel.classList.add("active");
  try{
    if(id==="wrong")renderWrong();
    if(id==="weak")renderWeak();
    if(id==="historical")loadHistorical(false).catch(e=>{console.error(e);$("historicalStatus").textContent="來源暫時無法載入，基本題庫不受影響。";});
    if(id==="sourceengineering")Promise.resolve(loadSourceEngineering()).catch(e=>console.error(e));
    if(id==="autopaper")Promise.resolve(showScopeProfile()).catch(e=>console.error(e));
    if(id==="study")startStudy(false);
    if(id==="helper")renderHelper();
  }catch(e){console.error("panel init failed",id,e);toast("此頁部分資料載入失敗，但其他功能仍可使用。");}
  window.scrollTo(0,0);
}
function goHome(){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  $("home").style.display="block";refreshStats();window.scrollTo(0,0);
}
document.addEventListener("click",e=>{
  const ps=e.target.closest("[data-practice-source]"); if(ps){$("school").value=ps.dataset.school;$("year").value=ps.dataset.year;$("term").value=ps.dataset.term==="1"?"上學期":"下學期";$("exam").value=ps.dataset.exam;refreshSchool();loadSchoolBankStatus();openPanel("practice");chooseSet();return}
  const o=e.target.closest("[data-open]"); if(o){openPanel(o.dataset.open);return}
  const h=e.target.closest("[data-home]"); if(h)goHome();
});

function chooseSet(){sessionStorage.setItem("v471_session","practice-"+Date.now());
  const t=$("topicFilter").value,l=$("levelFilter").value,qty=+$("qtyFilter").value;
  const basePool=getSchoolPool();const pool=basePool.filter(q=>(t==="全部"||q.topic===t)&&(l==="全部"||q.level===l));
  current=shuffle(pool).slice(0,Math.min(qty,pool.length));answers={};renderQuiz();
  $("countText").textContent=`目前產生 ${current.length} 題（${$("school").value} 題池符合條件共 ${pool.length} 題）｜資料來源：${dbMode==="cloud"?"Supabase 學校分流":"本機備援"}`;
}
function renderQuiz(){
  $("quiz").innerHTML=current.map((q,i)=>`<div class="card qcard"><div class="qtitle">${i+1}. ${q.q} <span class="tag">${q.topic}</span><span class="tag">${q.level}</span></div><div class="opts">${q.o.map((x,j)=>`<button class="opt" data-q="${q.id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${x}</button>`).join("")}</div><div class="inlineTools"><button class="soft dontKnowBtn" data-dontknow-q="${q.id}">🙋 我不會</button><button class="soft" data-ask-q="${q.id}">問 ChatGPT</button><button class="soft" data-explain-q="${q.id}">詳解看不懂</button></div><div class="explain" id="exp${q.id}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
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
  const qty=+$("mockQty").value,pool=getSchoolPool();mock=shuffle(pool).slice(0,Math.min(qty,pool.length));mockAnswers={};
  $("mockQuiz").innerHTML=mock.map((q,i)=>`<div class="card qcard"><div class="qtitle">${i+1}. ${q.q}<span class="tag">${q.level}</span></div><div class="opts">${q.o.map((x,j)=>`<button class="opt mockopt" data-q="${q.id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${x}</button>`).join("")}</div><div class="inlineTools"><button class="soft" data-mock-dk="${q.id}">🙋 我不會</button><button class="soft" data-mock-ask="${q.id}">問 ChatGPT</button></div><div class="explain" id="mexp${q.id}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
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
let allHistoricalV4961=[];
function uniqSorted(a,desc=false){
  const v=[...new Set(a.filter(x=>x!==null&&x!==undefined&&x!==""))];
  return v.sort((a,b)=>desc?Number(b)-Number(a):String(a).localeCompare(String(b),"zh-Hant"));
}
function fillHistoricalFiltersV4961(list){
 const schoolSel=$("histSchool"),yearSel=$("histYear"),examSel=$("histExam");
 const keepS=schoolSel?.value||"全部",keepY=yearSel?.value||"全部",keepE=examSel?.value||"全部";
 if(schoolSel){
   const dbNames=uniqSorted(list.map(x=>x.schools?.name||"成功高中"));
   const fixed=["建國中學","北一女中","師大附中","成功高中","中山女高","松山高中","延平高中","薇閣高中"];
   const vals=[...new Set([...fixed,...dbNames])];
   schoolSel.innerHTML='<option value="全部">全部學校</option>'+vals.map(x=>`<option>${x}</option>`).join("");
   if(vals.includes(keepS))schoolSel.value=keepS;
 }
 if(yearSel){
   const dbYears=uniqSorted(list.map(x=>x.academic_year),true).map(Number);
   const fixedYears=[];
   for(let y=115;y>=110;y--)fixedYears.push(y);
   const vals=[...new Set([...fixedYears,...dbYears.filter(y=>Number(y)>=110)])].sort((a,b)=>b-a);
   yearSel.innerHTML='<option value="全部">全部學年度</option>'+vals.map(x=>`<option value="${x}">${x} 學年度</option>`).join("");
   if(vals.map(String).includes(String(keepY)))yearSel.value=keepY;
 }
 if(examSel){
   const vals=uniqSorted(list.map(x=>x.exam_name));
   const fixed=["第一次段考","第二次段考","第三次段考／期末"];
   const all=[...new Set([...fixed,...vals])];
   examSel.innerHTML='<option value="全部">全部考試</option>'+all.map(x=>`<option>${x}</option>`).join("");
   if(all.includes(keepE))examSel.value=keepE;
 }
}
function filterHistoricalV4961(){
 const s=$("histSchool")?.value||"全部",y=$("histYear")?.value||"全部",t=$("histTerm")?.value||"全部",e=$("histExam")?.value||"全部";
 const list=allHistoricalV4961.filter(x=>
   (s==="全部"||(x.schools?.name||"成功高中")===s)&&
   (y==="全部"||String(x.academic_year)===String(y))&&
   (t==="全部"||String(x.term)===String(t))&&
   (e==="全部"||x.exam_name===e)
 );
 renderHistorical(list);
}
function renderHistorical(list){
 const box=$("historicalList");
 if(!list.length){
   box.innerHTML='<div class="card sourcecard">目前沒有符合條件的歷屆來源。請改選「全部學年度」或「全部考試」。</div>';
   return;
 }
 const typeMap={exam_index:"官方考卷／索引",scope:"官方考試範圍",answer:"官方答案"};
 box.innerHTML=list.map((x,i)=>{
   const school=x.schools?.name||"成功高中";
   const url=String(x.source_url||"");
   return `<div class="card sourcecard historicalPick" data-hist-card="${i}">
     <div class="sourcehead"><div><h3 style="margin:0">${x.title}</h3>
     <div class="sourcemeta"><span>${school}</span><span>${x.academic_year}學年度</span><span>${x.term===1?"上學期":"下學期"}</span><span>${x.exam_name}</span></div></div>
     <span class="sourcetype">${typeMap[x.document_type]||x.document_type}</span></div>
     <p class="small">${x.scope_text||""}</p>
     <div class="historicalActions">
       <button class="primary" data-hist-open="${i}" ${url?"":"disabled"}>🔗 開啟官方來源</button>
       <button class="soft" data-hist-practice="${i}">✏️ 用此範圍練習</button>
     </div></div>`;
 }).join("");

 document.querySelectorAll("[data-hist-open]").forEach(b=>b.onclick=()=>{
   const x=list[+b.dataset.histOpen],url=x?.source_url;
   if(!url){toast("這筆資料目前沒有可開啟的來源網址。");return;}
   const w=window.open(url,"_blank");
   if(!w) location.href=url;
 });
 document.querySelectorAll("[data-hist-practice]").forEach(b=>b.onclick=()=>{
   const x=list[+b.dataset.histPractice]; if(!x)return;
   const school=x.schools?.name||"成功高中";
   $("school").value=school;
   // Older years may not exist on home dropdown. Add it dynamically.
   if(!$("year").querySelector(`option[value="${x.academic_year}"]`)){
     const op=document.createElement("option");op.value=String(x.academic_year);op.textContent=String(x.academic_year);$("year").appendChild(op);
   }
   $("year").value=String(x.academic_year);
   $("term").value=x.term===1?"上學期":"下學期";
   if(!$("exam").querySelector(`option[value="${CSS.escape(x.exam_name)}"]`)){
     const op=document.createElement("option");op.value=x.exam_name;op.textContent=x.exam_name;$("exam").appendChild(op);
   }
   $("exam").value=x.exam_name;
   refreshSchool();loadSchoolBankStatus();openPanel("practice");chooseSet();
 });
}
let historicalDbV4963=null;
async function getHistoricalDbV4963(){
  const c=cfg();
  if(!c.url||!c.key)throw new Error("尚未設定 Project URL / Publishable key");
  const sdkOk=await ensureSupabaseSdkV496();
  if(!sdkOk||!window.supabase)throw new Error("Supabase SDK 載入失敗");
  if(!historicalDbV4963)historicalDbV4963=window.supabase.createClient(c.url,c.key);
  return historicalDbV4963;
}


const V4967_HISTORICAL_SCHOOLS=["建國中學","北一女中","師大附中","成功高中","中山女高","松山高中","延平高中","薇閣高中"];
function fillHistoricalSchoolsV4967(){
 const sel=$("histSchool");if(!sel)return;
 const current=sel.value||"全部";
 const dbNames=[...new Set((allHistoricalV4961||[]).map(x=>x.schools?.name).filter(Boolean))];
 const names=[...new Set([...V4967_HISTORICAL_SCHOOLS,...dbNames])];
 sel.innerHTML='<option value="全部">全部學校</option>'+names.map(n=>`<option value="${n}">${n}</option>`).join("");
 sel.value=names.includes(current)?current:"全部";
}
async function loadGsatV4967(){
 const status=$("gsatStatus"),list=$("gsatList");if(!status||!list)return;
 status.textContent="讀取大考中心官方學測來源中…";
 try{
  const hdb=await getHistoricalDbV4963();
  const {data,error}=await hdb.from("national_exam_sources").select("*").eq("subject","數學").order("academic_year",{ascending:false});
  if(error)throw error;
  const rows=(data||[]).filter(x=>Number(x.academic_year)>=110),ys=[...new Set(rows.map(x=>x.academic_year))],vs=[...new Set(rows.map(x=>x.subject_variant))];
  const ysel=$("gsatYear"),vsel=$("gsatVariant");
  if(ysel&&ysel.options.length<=1)ysel.innerHTML='<option value="全部">全部學年度</option>'+ys.map(y=>`<option value="${y}">${y} 學年度</option>`).join("");
  if(vsel&&vsel.options.length<=1)vsel.innerHTML='<option value="全部">全部數學類別</option>'+vs.map(v=>`<option value="${v}">${v}</option>`).join("");
  const y=ysel?.value||"全部",v=vsel?.value||"全部";
  const filtered=rows.filter(x=>(y==="全部"||String(x.academic_year)===String(y))&&(v==="全部"||x.subject_variant===v));
  status.textContent=`找到 ${filtered.length} 筆大考中心官方來源。`;
  list.innerHTML=filtered.length?filtered.map(x=>`<div class="item"><b>${x.academic_year} ${x.exam_type}・${x.subject_variant}</b><div class="small">${x.scope_note||""}</div><div style="margin-top:8px"><a class="btnLink" href="${x.source_url}" target="_blank" rel="noopener">開啟大考中心官方來源</a></div></div>`).join(""):'<div class="empty">目前沒有符合條件的學測來源。</div>';
 }catch(e){console.error(e);status.textContent="學測官方來源讀取失敗："+(e.message||e);list.innerHTML="";}
}

async function loadHistorical(showAll=false){
  const status=$("historicalStatus");
  status.textContent="讀取歷屆來源中…";
  try{
    const hdb=await getHistoricalDbV4963();
    const query=hdb.from("source_documents").select("*,schools(name)").order("academic_year",{ascending:false});
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error("歷屆來源查詢逾時")),5000));
    const {data,error}=await Promise.race([query,timeout]);
    if(error)throw error;
    allHistoricalV4961=data||[];
    fillHistoricalFiltersV4961(allHistoricalV4961); fillHistoricalSchoolsV4967();
    if(showAll){
      if($("histSchool"))$("histSchool").value="全部";
      if($("histYear"))$("histYear").value="全部";
      if($("histTerm"))$("histTerm").value="全部";
      if($("histExam"))$("histExam").value="全部";
    }
    status.textContent=`資料庫共收錄 ${allHistoricalV4961.length} 筆歷屆官方來源；可直接用上方四個選單篩選。`;
    filterHistoricalV4961();
  }catch(e){
    console.error(e);
    status.textContent="歷屆來源讀取失敗："+(e.message||e)+"。請按右上「資料庫設定」確認 Project URL / Publishable key。";
    renderHistorical([]);
  }
}


let autoPaper=[],autoAnswers={},activeScope=null;
async function getScopeProfile(){if(dbMode!=="cloud"||!db)return null;const {data:s}=await db.from("schools").select("id").eq("name",$("school").value).maybeSingle();if(!s)return null;const {data}=await db.from("exam_scope_profiles").select("*").eq("school_id",s.id).eq("academic_year",+$("year").value).eq("term",$("term").value==="上學期"?1:2).eq("exam_name",$("exam").value).eq("grade",1).eq("subject","數學").maybeSingle();return data||null;}
async function showScopeProfile(){activeScope=await getScopeProfile();const box=$("scopeProfile");if(!activeScope){box.innerHTML="目前這個學校／學年度／段考尚未建立已核驗範圍。你仍可使用「原創練習」。";return;}const tw=activeScope.topic_weights||{},dw=activeScope.difficulty_weights||{};box.innerHTML=`<b>已核驗範圍：</b>${activeScope.scope_label}<div class="chips">${Object.entries(tw).map(([k,v])=>`<span class="chip">${k} ${v}%</span>`).join("")}</div><div class="small">難度配置：${Object.entries(dw).map(([k,v])=>`${k} ${v}%`).join("／")}</div>${activeScope.source_url?`<p><a class="linkbtn soft" target="_blank" rel="noopener" href="${activeScope.source_url}">查看官方範圍來源</a></p>`:""}`;}
function weightedPick(pool,weights,key,n){let result=[],used=new Set();for(const [label,pct] of Object.entries(weights||{})){const want=Math.round(n*(+pct)/100),candidates=pool.filter(q=>q[key]===label&&!used.has(q.id));shuffle(candidates).slice(0,want).forEach(q=>{result.push(q);used.add(q.id)});}return result.concat(shuffle(pool.filter(q=>!used.has(q.id))).slice(0,Math.max(0,n-result.length))).slice(0,n);}
async function buildAutoPaper(){sessionStorage.setItem("v471_session","auto-"+Date.now());activeScope=await getScopeProfile();if(!activeScope){toast("這組條件尚無已核驗官方範圍");return;}const n=+$("autoQty").value,topics=Object.keys(activeScope.topic_weights||{}),pool=questions.filter(q=>topics.includes(q.topic));autoPaper=weightedPick(pool,activeScope.topic_weights,"topic",n);autoAnswers={};renderAutoPaper();$("autoSubmitBox").style.display="block";}
function renderAutoPaper(){$("autoQuiz").innerHTML=autoPaper.map((q,i)=>`<div class="card qcard"><div class="small">第 ${i+1} 題 · ${q.topic} · ${q.level}</div><div class="qtitle">${q.q}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-ai="${i}" data-aj="${j}">${String.fromCharCode(65+j)}. ${o}</button>`).join("")}</div><div class="inlineTools"><button class="soft" data-auto-dk="${i}">🙋 我不會</button><button class="soft" data-auto-ask="${i}">問 ChatGPT</button></div><div class="explain" id="aexp${i}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${q.e}</div></div>`).join("");
 document.querySelectorAll("[data-ai]").forEach(b=>b.onclick=()=>{const i=+b.dataset.ai,j=+b.dataset.aj;autoAnswers[i]=j;b.parentElement.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
 document.querySelectorAll("[data-auto-dk]").forEach(b=>b.onclick=()=>{const q=autoPaper[+b.dataset.autoDk];markNeedHelp(q,"我不會");});
 document.querySelectorAll("[data-auto-ask]").forEach(b=>b.onclick=()=>{const q=autoPaper[+b.dataset.autoAsk];queueForChatGPT(q,"我想請 ChatGPT 再解釋");});
}

async function submitAutoPaper(){let correct=0;autoPaper.forEach((q,i)=>{const card=$("aexp"+i).parentElement,opts=card.querySelectorAll(".opt");opts[q.a].classList.add("correct");if(autoAnswers[i]===q.a)correct++;else if(autoAnswers[i]!=null){opts[autoAnswers[i]].classList.add("wrong");markNeedHelp(q,`答錯：我選 ${String.fromCharCode(65+autoAnswers[i])}，正確答案是 ${String.fromCharCode(65+q.a)}`,"",autoAnswers[i]);}$("aexp"+i).classList.add("show");if(!card.querySelector("[data-auto-explain]")){const bt=document.createElement("button");bt.className="soft";bt.dataset.autoExplain=i;bt.textContent="詳解看不懂";bt.onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");};card.appendChild(bt);}});const score=Math.round(correct/Math.max(1,autoPaper.length)*100);$("autoResult").innerHTML=`<h3>${$("school").value} ${$("year").value} ${$("term").value} ${$("exam").value} 模擬卷：${score} 分</h3><p class="small">${correct}/${autoPaper.length} 題正確 · 範圍：${activeScope.scope_label}</p>`;}

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
 let pool=getSchoolPool();
 if(fromWrong){const ids=(JSON.parse(localStorage.getItem("wrong")||"[]")).map(x=>x.id);pool=pool.filter(q=>ids.includes(q.id));}
 else{const t=$("studyTopic").value,l=$("studyLevel").value;if(t!=="全部")pool=pool.filter(q=>q.topic===t);if(l!=="全部")pool=pool.filter(q=>q.level===l);}
 studyPool=shuffle(pool);studyIndex=0;studyReveal=0;
 if(!studyPool.length){$("studyCard").innerHTML='<div class="card">目前沒有符合條件的題目。</div>';return;}
 renderStudy();
}
function renderStudy(){
 const q=studyPool[studyIndex%studyPool.length];studyReveal=0;
 $("studyProgress").textContent=`第 ${studyIndex+1} 題 · ${q.topic} · ${q.level}`;
 $("studyCard").innerHTML=`<div class="card qcard"><div class="qtitle">${q.q}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-study-opt="${j}">${String.fromCharCode(65+j)}. ${o}</button>`).join("")}</div><div class="studyActions"><button class="soft" id="dontKnow">🙋 我不會</button><button class="soft" id="showHint">提示 1</button><button class="soft" id="askLater">加入待詢</button><button class="primary" id="checkStudy">確認答案</button></div><div id="studyExplain" class="studySteps"></div><div class="confidence"><span class="small">這題掌握度：</span><button data-conf="1">再學一次</button><button data-conf="2">有點懂</button><button data-conf="3">已掌握</button></div></div>`;
 let picked=null;
 document.querySelectorAll("[data-study-opt]").forEach(b=>b.onclick=()=>{picked=+b.dataset.studyOpt;b.parentElement.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
 $("showHint").onclick=()=>revealStudy(q,1);$("askLater").onclick=()=>queueForChatGPT(q,"我想請 ChatGPT 再解釋");
 $("dontKnow").onclick=()=>{revealStudy(q,4);saveStudyWrong(q,"不會");queueForChatGPT(q,"我不會")};
 $("checkStudy").onclick=()=>{if(picked==null){toast("先選一個答案，或按「我不會」");return;}const opts=document.querySelectorAll("[data-study-opt]");opts[q.a].classList.add("correct");if(picked!==q.a){opts[picked].classList.add("wrong");saveStudyWrong(q,"答錯");queueForChatGPT(q,`我答錯了，我選 ${String.fromCharCode(65+picked)}`);}revealStudy(q,4);};
 document.querySelectorAll("[data-conf]").forEach(b=>b.onclick=()=>{saveConfidence(q,+b.dataset.conf);studyIndex++;renderStudy();});
}
function revealStudy(q,to){
 studyReveal=Math.max(studyReveal,to);const e=$("studyExplain"),steps=[];
 if(studyReveal>=1)steps.push(`<div class="studyStep"><b>① 提示</b><br>${studyHint(q)}</div>`);
 if(studyReveal>=2)steps.push(`<div class="studyStep"><b>② 破題關鍵</b><br>先辨識本題屬於「${q.topic}」，核心是：${studyKey(q)}。</div>`);
 if(studyReveal>=3)steps.push(`<div class="studyStep"><b>③ 使用觀念／公式</b><br>${studyKey(q)}。把題目條件逐一代入，不要跳步。</div>`);
 if(studyReveal>=4)steps.push(`<div class="studyStep"><b>④ 完整詳解</b><br>正確答案：${String.fromCharCode(65+q.a)}<br>${q.e}</div><div class="studyStep"><b>⑤ 常見錯誤</b><br>${studyMistake(q)}</div><div class="studyActions"><button class="soft" id="studyExplainHelp">詳解看不懂</button></div>`);
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
   id:q.id,topic:q.topic,level:q.level,question:q.q,options:q.o,
   answer:q.a,explanation:q.e,reason,note,picked,
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

let sourceInventoryV49=[],sourceCoverageV49=[];
const kindLabel={question:"試題",answer:"答案",scope:"考試範圍",schedule:"考程",index:"題庫索引",reference:"參考來源"};
const provLabel={official_school:"校方官方",official_department:"校內科別官方",secondary_archive:"民間考古題索引",third_party_reference:"第三方參考"};

let calibrationV49=[],examEvidenceV49=[];
async function loadCalibrationV49(){
 if(dbMode!=="cloud"||!db)return;
 const [c,e]=await Promise.all([
   db.from("school_calibration_status").select("*,schools(name)").order("school_id"),
   db.from("exam_structure_evidence").select("*,schools(name)").order("academic_year",{ascending:false})
 ]);
 calibrationV49=c.data||[];examEvidenceV49=e.data||[];
 renderCalibrationV49();renderExamEvidenceV49();
}
function statusTextV49(s){
 return {calibrating:"官方考卷校正中",archive_confirmed:"官方題庫已確認",scope_only:"僅官方範圍",not_started:"尚未開始"}[s]||s;
}
function renderCalibrationV49(){
 const box=$("calibrationCards");if(!box)return;
 box.innerHTML=calibrationV49.map(x=>{
  const conf=x.current_confidence||"low",cls=conf==="high"?"calibHigh":conf==="medium"?"calibMedium":"calibLow";
  const findings=Array.isArray(x.key_findings)?x.key_findings:[];
  return `<div class="card ${cls}"><div style="display:flex;justify-content:space-between;gap:8px"><h3 style="margin:0">${x.schools?.name||""}</h3><span class="status ${conf==="high"?"goodS":conf==="medium"?"midS":"lowS"}">${statusTextV49(x.structure_model_status)}</span></div>
  <div class="chips"><span class="chip">官方題庫 ${x.official_archive_confirmed?"✓":"—"}</span><span class="chip">已分析 ${x.official_papers_analyzed} 份</span><span class="chip">槽位 ${x.archive_slots||0}</span></div>
  ${x.archive_year_from?`<div class="small">已確認年度：約 ${x.archive_year_from}～${x.archive_year_to}</div>`:""}
  <p class="small">${x.model_note||""}</p>${findings.length?`<ul class="small">${findings.map(f=>`<li>${f}</li>`).join("")}</ul>`:""}</div>`;
 }).join("");
}
function renderExamEvidenceV49(){
 const box=$("examEvidenceList");if(!box)return;
 const analyzed=examEvidenceV49.filter(x=>x.analysis_status==="structure_verified");
 $("examEvidenceSummary").textContent=`目前已完成 ${analyzed.length} 份官方考卷的結構化分析；archive_verified 僅代表官方題庫存在，尚未推論命題風格。`;
 box.innerHTML=examEvidenceV49.map(x=>{
   if(x.analysis_status!=="structure_verified")return `<div class="card sourcecard"><h3 style="margin:0">${x.schools?.name||""}｜${x.term===1?"上":"下"}學期｜${x.exam_name}</h3><p class="small">${x.format_summary||""}</p><div class="chips"><span class="chip">官方題庫已確認</span><span class="chip">尚未逐卷分析</span></div><a class="linkbtn soft" target="_blank" rel="noopener" href="${x.source_url}">開啟官方資料夾</a></div>`;
   const vals=[["單選",x.single_select_count||0],["多選",x.multi_select_count||0],["是非",x.true_false_count||0],["填充",x.fill_blank_count||0],["計算/證明",x.written_count||0]];
   return `<div class="card sourcecard"><div class="sourcehead"><div><h3 style="margin:0">${x.schools?.name||""}｜${x.academic_year}｜${x.term===1?"上":"下"}｜${x.exam_name}</h3><p class="small">${x.format_summary||""}</p></div><span class="trustHigh">結構已核驗</span></div>
   <div class="evidenceGrid">${vals.map(v=>`<div class="evMetric"><b>${v[1]}</b>${v[0]}</div>`).join("")}</div>
   <p class="small">${x.evidence_note||""}</p>
   ${x.topic_summary?`<div class="chips">${Object.entries(x.topic_summary).map(([k,v])=>`<span class="chip">${k} ${v}%</span>`).join("")}</div>`:""}
   <a class="linkbtn primary" target="_blank" rel="noopener" href="${x.source_url}">查看官方考卷</a></div>`;
 }).join("");
}

async function loadSourceEngineering(){
 if(dbMode!=="cloud"||!db){$("coverageCards").innerHTML='<div class="card">需先連線 Supabase 才能查看 V4.9 真實題源資料。</div>';$("sourceInventoryList").innerHTML="";return;}
 const [inv,cov]=await Promise.all([
   db.from("exam_source_inventory").select("*,schools(name)").order("verified_at",{ascending:false}),
   db.from("school_source_coverage").select("*,schools(name)")
 ]);
 sourceInventoryV49=inv.data||[];sourceCoverageV49=cov.data||[];
 const f=$("sourceSchoolFilter");f.innerHTML='<option value="全部">全部學校</option>'+sourceCoverageV49.map(x=>`<option>${x.schools?.name||""}</option>`).join("");
 renderCoverageV49();renderSourceInventoryV49();await loadCalibrationV49();
}
function renderCoverageV49(){
 $("coverageCards").innerHTML=sourceCoverageV49.map(x=>{
  const name=x.schools?.name||"",st=x.coverage_status,cls=st==="strong"?"coverageGood":st==="limited"?"coverageLow":"coverageMixed";
  const badges=[
   x.official_question_source?"官方試題 ✓":"官方試題 —",
   x.official_answer_source?"官方答案 ✓":"官方答案 —",
   x.official_scope_source?"官方範圍 ✓":"官方範圍 —",
   x.secondary_question_source?"民間考古題 ✓":"民間考古題 —"
  ];
  return `<div class="card ${cls}"><h3 style="margin:0">${name}</h3><div class="chips">${badges.map(b=>`<span class="chip">${b}</span>`).join("")}</div><p class="small">${x.notes||""}</p><div class="small">最新核驗學年度：${x.latest_verified_year||"—"}</div></div>`;
 }).join("");
}
function renderSourceInventoryV49(){
 const s=$("sourceSchoolFilter").value,k=$("sourceKindFilter").value,p=$("sourceProvFilter").value;
 const arr=sourceInventoryV49.filter(x=>(s==="全部"||x.schools?.name===s)&&(k==="全部"||x.source_kind===k)&&(p==="全部"||x.provenance===p));
 $("sourceInventorySummary").textContent=`符合條件 ${arr.length} 筆來源｜V4.9 僅建立索引與中繼資料，不直接複製完整考卷內容。`;
 $("sourceInventoryList").innerHTML=arr.length?arr.map(x=>`<div class="card sourcecard"><div class="sourcehead"><div><h3 style="margin:0">${x.title}</h3><div class="sourceMeta"><span>${x.schools?.name||""}</span><span>${x.academic_year||"跨年度"}學年度</span><span>${x.term?x.term===1?"上學期":"下學期":"學期未限定"}</span><span>${x.exam_name||"多次考試"}</span><span>${kindLabel[x.source_kind]||x.source_kind}</span><span>${provLabel[x.provenance]||x.provenance}</span></div></div><span class="${x.confidence==="high"?"trustHigh":x.confidence==="medium"?"trustMedium":"trustLow"}">${x.confidence==="high"?"高可信":x.confidence==="medium"?"中可信":"待核驗"}</span></div><p class="small">${x.notes||""}</p><div class="sourceactions"><a class="linkbtn primary" href="${x.source_url}" target="_blank" rel="noopener">開啟來源</a><span class="small">使用方式：${x.reuse_mode==="official_link"?"官方連結":x.reuse_mode==="link_only"?"只建立連結索引":x.reuse_mode==="metadata_only"?"只保留中繼資料":"需另取得授權"}</span></div></div>`).join(""):'<div class="card">目前沒有符合條件的來源。</div>';
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

function verifyBankV49610(){
  const total=Array.isArray(questions)?questions.length:0;
  const extra=Array.isArray(questions)?questions.filter(q=>Number(q.id)>160).length:0;
  const pool=(typeof getSchoolPool==="function")?getSchoolPool():questions;
  const poolExtra=Array.isArray(pool)?pool.filter(q=>Number(q.id)>160).length:0;
  const totalEl=$("bankTotalN"), verifyEl=$("bankVerifyText"), chip=$("homeBankChip");
  if(totalEl)totalEl.textContent=total;
  if(chip)chip.textContent=`目前題庫 ${total} 題`;
  if(verifyEl){
    const topicCount={};
    (questions||[]).forEach(q=>topicCount[q.topic]=(topicCount[q.topic]||0)+1);
    const five=["實數","多項式","指數","對數","綜合"];
    const balanced=five.every(t=>topicCount[t]===50);
    verifyEl.textContent=`題庫驗證：總計 ${total} 題｜新增題 ${extra} 題｜${$("school")?.value||"目前學校"}可抽 ${pool.length} 題（其中新增題 ${poolExtra} 題）${balanced?"｜5 主題各 50 題 ✓":""}`;
  }
  return {total,extra,pool:pool.length,poolExtra};
}

function refreshStats(){
  const s=localStorage.getItem("v42score"),d=+(localStorage.getItem("v42done")||0),w=JSON.parse(localStorage.getItem("v42wrong")||"[]").length;
  $("score").textContent=s===null?"-":s;$("doneN").textContent=d;$("wrongN").textContent=w;$("prog").style.width=Math.min(100,Math.round(d/50*100))+"%";
  verifyBankV49610();
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("showToast");setTimeout(()=>t.classList.remove("showToast"),3200)}
function openSettings(){
  const c=cfg(), modal=$("settingsModal");
  if(!modal){toast("找不到資料庫設定視窗。");return;}
  $("urlInput").value=c.url||"";
  $("keyInput").value=c.key||"";
  const st=$("settingsStatus");
  if(st)st.textContent=(c.url&&c.key)?"✅ 已偵測到已儲存的 Project URL / Key。":"⚠️ 尚未偵測到已儲存的 Project URL / Key。";
  modal.classList.add("modalShow");
}
function closeSettings(){const modal=$("settingsModal");if(modal)modal.classList.remove("modalShow")}
async function saveSettings(){
  const u=$("urlInput")?.value.trim()||"", k=$("keyInput")?.value.trim()||"";
  if(!u||!k){toast("請先填入 Project URL 與 Publishable / anon key。");return;}
  localStorage.setItem("v42_url",u);localStorage.setItem("v42_key",k);
  const st=$("settingsStatus");if(st)st.textContent="正在測試 Supabase 連線…";
  const ok=await connectDB(true);
  if(st)st.textContent=ok?"✅ Supabase 連線成功。":"❌ Supabase 連線失敗，請檢查 URL / Key。";
  if(ok)setTimeout(closeSettings,450);
}
function useLocal(){
  // 只切換目前執行模式；保留 Supabase 設定。
  db=null;dbMode="local";schools=F.schools;questions=F.questions;
  populateSchools();chooseSet();renderSources();refreshSchool();loadSchoolBankStatus();
  setDbBadge(false,"⚡ 本機即用");closeSettings();
  toast("已暫時使用本機題庫；Supabase 設定仍保留。");
}




function copyCurrentSessionQuestions(){
  try{
    const sid=sessionStorage.getItem("v471_session")||"";
    const all=typeof getStudyQueue==="function" ? getStudyQueue() : [];
    const list=sid ? all.filter(x=>x.sessionId===sid) : all;
    if(!list.length){toast("本次測驗目前沒有待詢問題。");return;}
    const head="以下是我這一次測驗遇到的不會／答錯／看不懂的題目。請先找出共同弱點，再逐題用「觀念 → 破題 → 分步驟 → 常見錯誤」教我，最後出 3 題同觀念練習題，先不要公布答案。\\n\\n";
    const body=list.map((x,i)=>`========== 第 ${i+1} 題 ==========\\n${typeof promptForItem==="function"?promptForItem(x):(x.question||"")}`).join("\\n\\n");
    if(typeof copyTextSafe==="function")copyTextSafe(head+body);
    else navigator.clipboard.writeText(head+body).then(()=>toast("已複製本次測驗問題"));
  }catch(e){
    console.error("copyCurrentSessionQuestions",e);
    toast("本次問題整理暫時無法使用。");
  }
}

function onV496(id,event,handler){
  const el=$(id);
  if(!el){console.warn("V4.9.6 missing optional element:",id);return;}
  el.addEventListener(event,handler);
}

// ---- Stable core startup FIRST ----
try{
  db=null;dbMode="local";schools=F.schools;questions=F.questions;
  populateSchools();
  refreshSchool();
  renderSources();
  chooseSet();          // 先生成練習題
  refreshStats();
  loadSchoolBankStatus();
  verifyBankV49610();
  setDbBadge(false,"⚡ 本機即用");
}catch(e){
  console.error("V4.9.6 core startup failed",e);
}

// Critical UI bindings: bind before any optional feature.
const settingsBtnEl=$("settingsBtn");if(settingsBtnEl)settingsBtnEl.onclick=openSettings;
const closeSettingsEl=$("closeSettings");if(closeSettingsEl)closeSettingsEl.onclick=closeSettings;
const saveSettingsEl=$("saveSettings");if(saveSettingsEl)saveSettingsEl.onclick=()=>saveSettings();
const localBtnEl=$("localBtn");if(localBtnEl)localBtnEl.onclick=useLocal;

// ---- Core interactions ----
onV496("applyFilter","click",chooseSet);
onV496("resetBtn","click",chooseSet);
onV496("finishBtn","click",finishPractice);
onV496("startMock","click",startMock);
onV496("submitMock","click",submitMock);
onV496("clearWrong","click",()=>{localStorage.removeItem("v42wrong");renderWrong();refreshStats();});

onV496("quiz","click",e=>{
 const dk=e.target.closest("[data-dontknow-q]"),ask=e.target.closest("[data-ask-q]"),ex=e.target.closest("[data-explain-q]");
 if(!dk&&!ask&&!ex)return;
 const id=+(dk?.dataset.dontknowQ||ask?.dataset.askQ||ex?.dataset.explainQ),q=questions.find(x=>x.id===id);if(!q)return;
 if(dk)markNeedHelp(q,"我不會");
 if(ask)queueForChatGPT(q,"我想請 ChatGPT 再解釋");
 if(ex){const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");}
});

// ---- Optional / cloud features: failure cannot stop core ----
onV496("loadHistorical","click",()=>{if(allHistoricalV4961.length)filterHistoricalV4961();else loadHistorical(false).catch(console.error);});
onV496("showAllHistorical","click",()=>loadHistorical(true).catch(console.error));
onV496("buildAutoPaper","click",()=>Promise.resolve(buildAutoPaper()).catch(console.error));
onV496("submitAuto","click",()=>Promise.resolve(submitAutoPaper()).catch(console.error));
onV496("newStudy","click",()=>startStudy(false));
onV496("reviewWeak","click",()=>startStudy(true));
onV496("copyAllQuestions","click",copyAllStudyQuestions);
onV496("clearStudyQueue","click",()=>{if(confirm("確定清除全部待詢問題？")){setStudyQueue([]);renderHelper();}});

try{
 if($("copyAllQuestions")&&!$("copySessionQuestions")){
  const b=document.createElement("button");
  b.id="copySessionQuestions";b.className="soft";b.textContent="複製本次測驗問題";
  $("copyAllQuestions").parentElement.insertBefore(b,$("copyAllQuestions").nextSibling);
  if(typeof copyCurrentSessionQuestions==="function"){
    b.addEventListener("click",copyCurrentSessionQuestions);
  }
 }
}catch(e){console.warn("optional session-copy control skipped",e);}

["histSchool","histYear","histTerm","histExam"].forEach(id=>onV496(id,"change",()=>{if(allHistoricalV4961.length)filterHistoricalV4961();}));
// settings/auth




onV496("magicBtn","click",sendMagicLink);
onV496("signOutBtn","click",signOut);




const gsatBtnV4967=$("loadGsat");if(gsatBtnV4967)gsatBtnV4967.onclick=loadGsatV4967;
const gsatYearV4967=$("gsatYear");if(gsatYearV4967)gsatYearV4967.onchange=loadGsatV4967;
const gsatVariantV4967=$("gsatVariant");if(gsatVariantV4967)gsatVariantV4967.onchange=loadGsatV4967;
// selection changes: instant local re-render
onV496("school","change",()=>{
  refreshSchool();
  loadSchoolBankStatus();
  verifyBankV49610();
  chooseSet();
});
["year","term","exam"].forEach(id=>onV496(id,"change",()=>{
  refreshSchool();
  activeScopeV48=null;
  clearTimeout(v494Timer);
  v494Timer=setTimeout(()=>loadSchoolBankStatus(),180);
}));

// background cloud sync, never blocks practice/mock
setTimeout(()=>connectDB(false).catch(e=>console.warn("background DB skipped",e)),120);



document.addEventListener("click",e=>{
 const h=e.target.closest('[data-open="historical"]');
 if(h)setTimeout(()=>{if(typeof loadGsatV4967==="function")loadGsatV4967();},250);
});
})();
