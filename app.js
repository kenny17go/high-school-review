window.V500_BUILD="5.0-batch-chinese-115-2";

(function(){
"use strict";
const F=window.V42_FALLBACK;
const $=id=>document.getElementById(id);
const catalog=window.LearningCatalog;
const registry=window.SubjectRegistry,core=window.LearningCore,progress=window.LearningProgress;
const subjectId=()=>$("subject")?.value||"math";
const subjectInfo=()=>registry.get(subjectId());
const adapter=()=>subjectInfo().adapter;
let questionLoadSeq=0;
const cloudBankCache=new Map();
function subjectScopeSummary(s){return s.label+"｜"+(catalog.labels[s.sourceType]||"來源待核驗")+"｜"+subjectInfo().name+" "+s.academicYear+"學年度";}
function decorateQuestions(set){return set.map(q=>(q.grade===2||q.subject==="chinese")?catalog.shuffleOptions(q):q);}
function selectQuestions(pool,n){return adapter()?adapter().pick(pool,n):shuffle(pool).slice(0,n);}
function passageMarkup(q,seen){const p=q.chineseMetadata?.passage_id;if(!p||seen.has(p))return "";seen.add(p);return registry.get(q.subject)?.adapter?.passage(q)||"";}

F.schools["松山高中"]=F.schools["松山高中"]||{tone:"mid",status:"公開範圍待核驗",desc:"保留學校入口；模擬範圍不代表校方官方進度。",url:"https://www.sssh.tp.edu.tw/"};
const grade2Fallback=window.GRADE2_QUESTIONS||[];
let grade2Cloud=[],cloudSubjects=[],scopeOverrides=new Map(),scopeRequest=0,connectionRequest=0;
let practiceScope=null,mockScope=null;
let selectedPracticeTopics=new Set();
function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));}
function selectedGrade(){return Number($("grade")?.value||1);}
function learningSelection(){return {subjectId:subjectId(),courseId:adapter()?subjectInfo().courses.find(c=>c.grade===selectedGrade())?.id:`math-108-g2-${($("curriculumTrack")?.value||"A").toLowerCase()}`,grade:selectedGrade(),school:$("school").value,
  academic_year:Number($("year").value),academicYear:Number($("year").value),semester:termNumber(),exam:$("exam").value};}
function grade2CourseLabel(){return catalog.courses.find(c=>c.id===learningSelection().courseId)?.label||"高二數學";}
function currentScope(){const s=learningSelection();return adapter()?adapter().scope(s):catalog.resolve(s,scopeOverrides.get(catalog.key(s))||[]);}
function unifiedQuestions(){return window.UnifiedQuestionBank?.all?.()||[];}
function allQuestions(){return [...questions,...grade2Cloud,...grade2Fallback,...registry.enabled().flatMap(s=>s.adapter?.all()||[]),...unifiedQuestions()];}
function findQuestion(id,subject=subjectId()){return [...current,...mock,...allQuestions()].find(q=>q.id===id&&(q.subject||q.subjectId||'math')===subject);}
function scopeSummary(scope){if(adapter())return subjectScopeSummary(scope);return `${scope.label}｜${catalog.labels[scope.sourceType]}｜${catalog.courses.find(c=>c.id===scope.courseId)?.label||""}｜${scope.school} ${scope.academicYear} ${scope.semester===1?"上":"下"}學期 第${scope.exam}次段考`;}
function updateTopicFilters(){
 const topics=adapter()?adapter().topics():selectedGrade()===2?catalog.chapters.filter(c=>currentScope().chapterIds.includes(c.id)).map(c=>c.label):["實數","多項式","指數","對數","綜合"];
 selectedPracticeTopics=new Set([...selectedPracticeTopics].filter(t=>topics.includes(t)));
 const choices=$("topicChoices"),summary=$("topicFilterSummary");
 if(choices){choices.innerHTML=`<label><input type="checkbox" data-topic-all ${selectedPracticeTopics.size?'':'checked'}><span>全部章節</span></label>${topics.map(t=>`<label><input type="checkbox" data-topic-value="${escapeText(t)}" ${selectedPracticeTopics.has(t)?'checked':''}><span>${escapeText(t)}</span></label>`).join('')}`;}
 if(summary)summary.textContent=!selectedPracticeTopics.size?'全部章節':selectedPracticeTopics.size<=2?[...selectedPracticeTopics].join('、'):`已選 ${selectedPracticeTopics.size} 個章節`;
 const study=$("studyTopic"),old=study?.value;if(study){study.replaceChildren(new Option("全部章節","全部"),...topics.map(t=>new Option(t,t)));study.value=topics.includes(old)?old:"全部";}
 updatePracticeVariant();
}
function updatePracticeVariant(){
 const el=$("practiceVariant");if(!el)return;
 const old=el.value,variants=[...new Set(unifiedQuestions().filter(q=>q.subject===subjectId()).map(q=>q.variant).filter(Boolean))];
 el.replaceChildren(new Option("全部考科","全部"),...variants.map(v=>new Option(v,v)));
 el.value=variants.includes(old)?old:(variants.length===1?variants[0]:"全部");
}
function practiceTopics(){return [...selectedPracticeTopics];}
function renderLearningScope(){
 const box=$("currentScope");if(!box)return;
 if(adapter()){const s=currentScope();box.textContent="本次範圍："+subjectScopeSummary(s)+"。"+s.note;return;}
 if(selectedGrade()!==2){box.textContent="本次範圍：高一既有學校題池（維持原有練習方式）";return;}
 const scope=currentScope(),count=catalog.pool(scope,grade2Cloud,grade2Fallback).length;
 $("bankLoadChips").textContent=`目前範圍 ${count} 題`;
 box.textContent=`本次範圍：${scopeSummary(scope)}。${scope.note} 可用 ${count} 題。`;
 if(scope.sourceUrl){const a=document.createElement("a");a.href=scope.sourceUrl;a.target="_blank";a.rel="noopener";a.textContent=" 查看範圍依據";box.appendChild(a);}
}
async function loadGrade2Scope(){
 const s=learningSelection(),key=catalog.key(s),seq=++scopeRequest,client=db;
 renderLearningScope();updateTopicFilters();
 if(!client||dbMode!=="cloud"||scopeOverrides.has(key))return;
 let timer;
 try{
  const task=(async()=>{
   const {data:school,error:se}=await client.from("schools").select("id").eq("name",s.school).maybeSingle();
   if(se)throw se;if(!school)return [];
   const {data,error}=await client.from("exam_scope_profiles").select("*").eq("school_id",school.id)
    .eq("academic_year",s.academicYear).eq("term",s.semester).eq("exam_name",s.exam).eq("grade",s.grade).eq("subject","數學");
   if(error)throw error;
   return (data||[]).map(row=>catalog.adaptScope(row,s,cloudSubjects)).filter(Boolean);
  })();
  const rows=await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("範圍讀取逾時")),2500);})]);
  if(seq!==scopeRequest||client!==db||key!==catalog.key(learningSelection()))return;
  scopeOverrides.set(key,rows);renderLearningScope();updateTopicFilters();
 }catch(e){console.warn("高二範圍未能載入，保留平台模擬安排",e.message);}finally{clearTimeout(timer);}
}
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
function v494ScopeKey(){return [selectedGrade(),$("school").value,$("year").value,$("term").value,$("exam").value].join("|");}
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
 if(adapter()){++scopeRequest;renderLearningScope();updateTopicFilters();$("bankLoadTitle").textContent=subjectInfo().name+"題庫";$("bankLoadBadge").textContent="平台模擬範圍";$("bankLoadDetail").textContent=currentScope().note;$("bankLoadChips").textContent="本次 "+getSchoolPool().length+" 題";return;}
 if(selectedGrade()===2){
  const count=getSchoolPool().length;
  $("bankLoadTitle").textContent=grade2CourseLabel()+"範圍題池已就緒";
  $("bankLoadBadge").textContent="依範圍分流";
  $("bankLoadDetail").textContent="練習與模擬段考使用同一組章節映射；缺題只以相同範圍的模擬題補足。";
  $("bankLoadChips").textContent=`目前範圍 ${count} 題`;
  await loadGrade2Scope();return;
 }
 ++scopeRequest;renderLearningScope();
 const selectionKey=v494ScopeKey();
 const name=$("school").value;
 const pool=v494LocalSchoolPool(name);
 schoolBankIds=new Set(pool.map(q=>Number(q.id)));
 schoolProfile={profile_label:(V494_PROFILES[name]||{}).label||"平台模擬題池",official_style_verified:false};
 activeScopeV48=null;
 renderBankStatus({mode:"cloud",count:pool.length,scope:null,sources:0,profile:schoolProfile,fast:true});
 const meta=await v494FetchScopeOnly();
 if(meta&&!adapter()&&selectionKey===v494ScopeKey()){activeScopeV48=meta.scope;renderBankStatus({mode:"cloud",count:pool.length,scope:activeScopeV48,sources:meta.sources,profile:schoolProfile,fast:true});}
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
function getSchoolPool(){if(adapter())return adapter().pool(learningSelection());return selectedGrade()===2?catalog.pool(currentScope(),grade2Cloud,grade2Fallback):v494LocalSchoolPool($("school").value);}
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
  const request=++connectionRequest;
  ++scopeRequest;scopeOverrides.clear();++questionLoadSeq;cloudBankCache.clear();
  registry.enabled().forEach(s=>s.adapter?.clearCloud());questions=F.questions;grade2Cloud=[];
  const c=cfg();
  if(!c.url||!c.key){
    db=null;dbMode="local";setDbBadge(false,"⚡ 本機即用");
    if(showMessage) toast("尚未設定 Supabase，目前使用本機題庫。");
    refreshSchool();loadSchoolBankStatus(); return false;
  }
  try{
    const sdkOk=await ensureSupabaseSdkV496();
    if(request!==connectionRequest)return false;
    if(!sdkOk||!window.supabase) throw new Error("Supabase SDK 載入失敗");
    db=window.supabase.createClient(c.url,c.key);
    const remoteLoad=Promise.all([
      db.from("schools").select("*").order("id"),

      db.from("subjects").select("id,code,name,enabled").order("id")
    ]);
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error("Supabase 連線逾時")),3000));
    const [{data:s,error:se},subjectResult] = await Promise.race([remoteLoad,timeout]);
    if(request!==connectionRequest)return false;
    if(se) throw se;
    cloudSubjects=subjectResult.error?[]:(subjectResult.data||[]);
    grade2Cloud=[];
    sourceDocs=[];
    if(s&&s.length){
      schools={...F.schools};
      s.forEach(x=>schools[x.name]={tone:x.source_tone,status:x.source_status,desc:x.description,url:x.official_url});
    }
    verifyBankV49610();
    dbMode="cloud";setDbBadge(true,"Supabase 已連線");
    loadCurrentSubjectQuestions().catch(e=>console.warn("保留本機題庫",e.message));
    await refreshAuth();
    if(request!==connectionRequest)return false;
    populateSchools();
    loadSchoolBankStatus();
    if(!$("practice").classList.contains("active"))chooseSet();
    renderSources();
    refreshSchool();
    if(showMessage) toast("資料庫連線成功，共讀取 "+questions.length+" 題。");
    return true;
  }catch(err){
    if(request!==connectionRequest)return false;
    grade2Cloud=[];scopeOverrides.clear();++scopeRequest;
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
  const loginBox=$("authLoginBox"),logoutBox=$("authLogoutBox");
  if(loginBox)loginBox.style.display=user?"none":"block";
  if(logoutBox)logoutBox.style.display=user?"block":"none";
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
  if(adapter()){$("title").textContent=$("school").value+"｜高"+(selectedGrade()===1?"一":"二")+subjectInfo().name;$("curriculumTrackField").hidden=true;$("sub").textContent=$("year").value+"學年度｜"+$("term").value+"｜"+$("exam").value;$("desc").textContent=currentScope().note;$("status").textContent='平台模擬範圍';$("status").className='status midS';$("official").href=schools[$('school').value]?.url||'#';$("homeBankChip").textContent=subjectInfo().name+' '+getSchoolPool().length+' 題';renderLearningScope();adapter().stats();return;}
  const n=$("school").value,d=schools[n]||{};
  $("title").textContent=n+"｜"+(selectedGrade()===2?grade2CourseLabel():"高一數學");
  $("curriculumTrackField").hidden=selectedGrade()!==2;
  $("sub").textContent=$("year").value+"學年度｜"+$("term").value+"｜"+$("exam").value;
  $("desc").textContent=d.desc||"來源資料待補";
  $("official").href=d.url||"#";
  const s=$("status"); s.textContent=d.status||"待核驗";
  s.className="status "+(d.tone==="good"?"goodS":d.tone==="mid"?"midS":"lowS");
}

const V49617_SCHOOLS=["建國中學","北一女中","師大附中","成功高中","中山女高","松山高中","延平高中","薇閣高中"];
const V49617_YEARS=[110,111,112,113,114,115];
const V49617_EXAMS=["第一次段考","第二次段考","第三次段考／期末"];
function normExamV49617(x){
 const s=String(x||"");
 if(s.includes("第一"))return "第一次段考";
 if(s.includes("第二"))return "第二次段考";
 if(s.includes("第三")||s.includes("期末"))return "第三次段考／期末";
 return s;
}
let coverageLoadSeq=0,historicalLoadSeq=0,gsatLoadSeq=0;
async function loadCoverageV49617(){
 const seq=++coverageLoadSeq,subject=$("coverageSubject").value,grade=Number($("coverageGrade").value);
 if($("coverageSubject").value==="國文")renderTextCoverage();else $("textCoverage").textContent="";
 const status=$("coverageStatus"),matrix=$("coverageMatrix"),sum=$("coverageSummary");
 if(!status||!matrix)return;
 status.textContent="正在讀取資料完整度…";
 try{
   const hdb=($("coverageSubject").value==="國文"&&!db)?null:await getHistoricalDbV4963();
   const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error("資料完整度查詢逾時")),6000));
   const task=hdb?Promise.all([
     hdb.from("source_documents").select("academic_year,term,exam_name,grade,subject,document_type,schools(name)").gte("academic_year",110),
     hdb.from("exam_source_inventory").select("academic_year,term,exam_name,grade,subject,source_kind,schools(name)").gte("academic_year",110),
     hdb.from("exam_scope_profiles").select("academic_year,term,exam_name,grade,subject,schools(name)").gte("academic_year",110),
     hdb.from("exam_source_search_status").select("academic_year,term,exam_name,grade,subject,search_status,schools(name)").gte("academic_year",112)
   ]):Promise.resolve([]);
   const res=await Promise.race([task,timeout]);
   const rows=[];
   res.forEach((r,idx)=>{
     if(r.error)throw r.error;
     (r.data||[]).forEach(x=>{
       let kind="範";
       if(idx===0){
         const dt=String(x.document_type||"").toLowerCase();
         kind=dt.includes("answer")?"答":(dt.includes("scope")?"範":"題");
       }else if(idx===1){
         const sk=String(x.source_kind||"").toLowerCase();
         kind=sk==="answer"?"答":(sk==="question"?"題":(sk==="scope"?"範":"索"));
       }else if(idx===3){
         kind=x.search_status==="searched_no_public_source"?"未公開":"已找到";
       }
       rows.push({...x,_kind:kind});
     });
   });
   if(seq!==coverageLoadSeq||subject!==$("coverageSubject").value||grade!==Number($("coverageGrade").value))return;
   const years=subject==="國文"?[112,113,114]:V49617_YEARS;
   const filtered=rows.filter(x=>(x.subject||"數學")===subject&&Number(x.grade||1)===grade&&Number(x.academic_year)>=110);
   const map=new Map();
   filtered.forEach(x=>{
     const school=x.schools?.name;if(!school||!x.academic_year||!x.term||!x.exam_name)return;
     const exam=normExamV49617(x.exam_name);
     if(!V49617_EXAMS.includes(exam))return;
     const key=[school,Number(x.academic_year),Number(x.term),exam].join("|");
     if(!map.has(key))map.set(key,new Set());
     map.get(key).add(x._kind);
   });
   let h1='<thead><tr><th class="schoolCell" rowspan="3">學校</th>';
   years.forEach(y=>h1+=`<th colspan="6">${y} 學年度</th>`);h1+='</tr><tr>';
   years.forEach(()=>{h1+='<th colspan="3">上學期</th><th colspan="3">下學期</th>'});h1+='</tr><tr>';
   years.forEach(()=>{for(let t=0;t<2;t++){h1+='<th class="coverageSlot">一段</th><th class="coverageSlot">二段</th><th class="coverageSlot">三段</th>'}});h1+='</tr></thead>';
   let body='<tbody>',covered=0,total=V49617_SCHOOLS.length*years.length*6;
   V49617_SCHOOLS.forEach(school=>{
     body+=`<tr><td class="schoolCell">${school}</td>`;
     years.forEach(y=>{
       [1,2].forEach(term=>{
         V49617_EXAMS.forEach(exam=>{
           const kinds=map.get([school,y,term,exam].join("|"));
           if(kinds){
             covered++;
             const order=["題","答","範","索"];
             const real=order.filter(k=>kinds.has(k));
             const labels=real.map(k=>{
               const cls=k==="答"?"answer":(k==="範"?"range":(k==="索"?"index":""));
               return `<span class="coverageType ${cls}">${k}</span>`;
             }).join("");
             const missing=!real.length&&kinds.has("未公開")?'<span class="coverageType missing">未公開</span>':"";
             body+=`<td class="${real.length?"coverageYes":"coverageNo"}" title="${[...kinds].join("、")}">${labels||missing||"—"}</td>`;
           } else body+='<td class="coverageNo">'+(subject==='國文'?'未收集':'—')+'</td>';
         });
       });
     });
     body+='</tr>';
   });body+='</tbody>';
   matrix.innerHTML=h1+body;
   const pct=total?Math.round(covered/total*100):0,missing=total-covered;
   if(sum)sum.innerHTML=`<span class="chip">科目：${subject}</span><span class="chip">年級：高${["","一","二","三"][grade]}</span><span class="chip">已有 ${covered} 格</span><span class="chip">缺 ${missing} 格</span><span class="chip">完整度 ${pct}%</span>`;
   status.textContent=`目前以 ${subject}・高${["","一","二","三"][grade]}統計；格內「題／答／範／索」代表目前已核驗的資料類型。`;
 }catch(e){
   if(seq!==coverageLoadSeq)return;
   console.error(e);status.textContent="資料完整度讀取失敗："+(e.message||e);
   matrix.innerHTML="";
 }
}

function openPanel(id){
  if(id==="classicalPanel"){adapter()?.setMode("classical");adapter()?.render();}
  if(id==="learningAnalytics")renderSubjectAnalytics();
  if(id==="wrong"&&!$("wrong").classList.contains("active"))$("wrongSubject").value=subjectId();
  const panel=$(id);
  if(!panel){toast("此功能頁目前無法開啟。");return;}
  $("home").style.display="none";
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  panel.classList.add("active");
  try{
    if(id==="practice"&&(adapter()||selectedGrade()===2))chooseSet();
    if(id==="wrong")renderWrong();
    if(id==="weak")renderWeak();
    if(id==="gsat")Promise.resolve(loadGsatV4967()).catch(e=>console.error(e));
    if(id==="coverage")Promise.resolve(loadCoverageV49617()).catch(e=>console.error(e));
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
  const o=e.target.closest("[data-open]"); if(o){if(o.dataset.subjectMode)adapter()?.setMode(o.dataset.subjectMode);openPanel(o.dataset.open);return}
  const h=e.target.closest("[data-home]"); if(h)goHome();
});

function chooseSet(){sessionStorage.setItem("v471_session","practice-"+Date.now());
  const source=$("practiceSource")?.value||"all",sourceYear=$("practiceYear")?.value||"全部",variant=$("practiceVariant")?.value||"全部";
  practiceScope=source==="ceec"?null:(adapter()||selectedGrade()===2?currentScope():null);
  if(practiceScope)updateTopicFilters();
  const topics=practiceTopics(),l=$("levelFilter").value,qty=+$("qtyFilter").value;
  const localPool=getSchoolPool(),officialPool=unifiedQuestions().filter(q=>q.subject===subjectId());
  const basePool=source==="ceec"?officialPool:source==="platform"?localPool:[...new Map([...localPool,...officialPool].map(q=>[String(q.id),q])).values()];
  const pool=basePool.filter(q=>(sourceYear==="全部"||String(q.academic_year)===String(sourceYear))&&(variant==="全部"||q.variant===variant)&&(!topics.length||topics.includes(q.topic))&&(l==="全部"||q.level===l));
  const selected=source==="ceec"&&sourceYear!=="全部"&&qty>=pool.length
    ?pool.slice().sort((a,b)=>Number(a.question_number)-Number(b.question_number))
    :selectQuestions(pool,Math.min(qty,pool.length));
  current=decorateQuestions(selected);answers={};renderQuiz();
  const sourceLabel=source==="ceec"?"學測真題":source==="platform"?"學校／平台題":"全部來源";
  $("countText").textContent=`目前產生 ${current.length} 題（符合條件共 ${pool.length} 題）｜來源：${sourceLabel}${sourceYear!=="全部"?"｜"+sourceYear+"學年度":""}${variant!=="全部"?"｜"+variant:""}${topics.length?"｜"+topics.join("、"):""}`;
  if(practiceScope)$("countText").textContent=`本次範圍：${scopeSummary(practiceScope)}｜${current.length} 題（符合條件 ${pool.length} 題）${current.length<qty?"；題目不足，僅提供符合範圍的題目":""}。${practiceScope.note}`;
  $("result").textContent="";
}
function questionGroupMarkup(q,seen){
 const g=window.UnifiedQuestionBank?.context?.(q);if(!g)return"";
 if(seen?.has(g.id))return`<div class="questionGroupRef">↳ 延續「${escapeText(g.title||"共用題組")}」</div>`;
 seen?.add(g.id);
 const official=/^https:\/\/([^.]+\.)*ceec\.edu\.tw\//i.test(g.source_url||"")?`${g.source_url}#page=${Number(g.source_page||1)+1}`:"";
 const linked=g.context_delivery==="official_pdf_reference";
 const contextLabel=linked?"官方 PDF 連結模式":"共用題幹";
 const link=linked&&official?`<p class="small"><a href="${escapeText(official)}" target="_blank" rel="noopener noreferrer">開啟官方試卷第 ${escapeText(g.source_page||"?")} 頁查看完整文本（PDF）</a></p><p class="small">本站僅提供內容摘要；平台詳解與分類仍待人工審閱。</p>`:"";
 return `<section class="questionGroup" data-group="${escapeText(g.id)}"><div class="questionGroupHead"><b>📎 ${escapeText(g.title||"共用題組")}</b><span class="tag">${contextLabel}</span></div><div class="questionGroupStem">${escapeText(g.stem||"")}</div>${link}</section>`;
}
function questionSourceMarkup(q){if(q.sourceType==="ceec_official")return `<span class="tag">學測真題 ${escapeText(q.academic_year||"")} ${escapeText(q.variant||"")}</span>${q.explanation_status==="draft_review_required"?'<span class="tag">平台詳解待審閱</span>':''}`;return registry.get(q.subject)?.adapter?`<span class="tag">${escapeText(registry.get(q.subject).adapter.sourceName(q))}</span>`:"";}
function qAnswered(q,value){return window.LearningCore?.answered?.(value,q)??value!==undefined;}
function qCorrect(q,value){return window.LearningCore?.equalAnswer?.(q,value)??value===q.a;}
function qAnswerText(q){return window.LearningCore?.formatAnswer?.(q)??(Number.isInteger(q.a)?String.fromCharCode(65+q.a):String(q.a??"人工批改"));}
function questionInputMarkup(q,prefix=""){
 const id=escapeText(String(q.id)),cls=prefix?"mock":"practice";
 if(q.questionType==="multiple_choice")return `<div class="opts">${(q.o||[]).map((x,j)=>`<label class="multiOpt"><input type="checkbox" data-${cls}-multi="${id}" value="${j}"><span>${String.fromCharCode(65+j)}. ${escapeText(x)}</span></label>`).join("")}</div><button class="soft" data-${cls}-check="${id}">確認答案</button>`;
 if(q.questionType==="fill_blank")return `<div class="blankInputs">${(q.input_spec?.cells||q.a||[""]).map((_,j)=>`<input data-${cls}-blank="${id}" data-cell="${j}" inputmode="text" placeholder="第${j+1}格">`).join("")}</div><button class="soft" data-${cls}-check="${id}">確認答案</button>`;
 if(["numeric","short_answer","essay"].includes(q.questionType))return `<textarea class="answerText" data-${cls}-text="${id}" placeholder="${q.questionType==="numeric"?"輸入答案":"寫下你的作答"}"></textarea><button class="soft" data-${cls}-check="${id}">${["short_answer","essay"].includes(q.questionType)?"儲存作答":"確認答案"}</button>`;
 return `<div class="opts">${(q.o||[]).map((x,j)=>`<button class="opt ${prefix?"mockopt":""}" data-q="${id}" data-opt="${j}">${String.fromCharCode(65+j)}. ${escapeText(x)}</button>`).join("")}</div>`;
}
function readStructuredAnswer(q,root,prefix=""){
 const id=CSS.escape(String(q.id)),cls=prefix?"mock":"practice";
 if(q.questionType==="multiple_choice")return [...root.querySelectorAll(`[data-${cls}-multi="${id}"]:checked`)].map(x=>+x.value);
 if(q.questionType==="fill_blank")return [...root.querySelectorAll(`[data-${cls}-blank="${id}"]`)].sort((x,y)=>+x.dataset.cell-+y.dataset.cell).map(x=>x.value.trim());
 const t=root.querySelector(`[data-${cls}-text="${id}"]`);return t?t.value.trim():undefined;
}
function revealPractice(q,id,value){
 const ok=qCorrect(q,value),exp=$("exp"+id);if(exp)exp.classList.add("show");
 if(ok===false)markNeedHelp(q,`答錯：我的答案 ${Array.isArray(value)?value.join("、"):value}，正確答案是 ${qAnswerText(q)}`,"",value);
}
function questionVisualMarkup(q){
 const figure=q?.visual_stimulus,asset=figure?.asset;
 if(!figure||typeof asset!=="string"||!/^assets\/[\w./-]+\.(?:png|webp|jpe?g)$/i.test(asset)||asset.includes(".."))return"";
 return `<figure class="questionFigure" style="margin:10px 0;max-width:100%;text-align:center"><img src="${asset}" alt="${escapeText(figure.alt||"題目附圖")}" loading="lazy" style="display:block;max-width:100%;height:auto;max-height:360px;margin:auto"><figcaption class="small">官方試卷圖示（第${Number(figure.source_page)||"?"}頁）</figcaption></figure>`;
}
function renderQuiz(){
 const passageSeen=new Set(),groupSeen=new Set();
 $("quiz").innerHTML=current.map((q,i)=>`${passageMarkup(q,passageSeen)}${questionGroupMarkup(q,groupSeen)}<div class="card qcard"><div class="qtitle">${i+1}. ${escapeText(q.q)} <span class="tag">${q.topic}</span><span class="tag">${q.level}</span>${questionSourceMarkup(q)}</div>${questionVisualMarkup(q)}${questionInputMarkup(q)}<div class="inlineTools"><button class="soft dontKnowBtn" data-dontknow-q="${q.id}">🙋 我不會</button><button class="soft" data-ask-q="${q.id}">問 ChatGPT</button><button class="soft" data-explain-q="${q.id}">詳解看不懂</button></div><div class="explain" id="exp${q.id}"><b>答案：</b>${escapeText(qAnswerText(q))}<br><b>詳解：</b>${escapeText(q.e)}</div></div>`).join("");
}
$("quiz").addEventListener("click",e=>{
 const check=e.target.closest("[data-practice-check]");
 if(check){const id=check.dataset.practiceCheck,q=current.find(x=>String(x.id)===String(id));if(!q)return;const value=readStructuredAnswer(q,$("quiz"));if(!qAnswered(q,value)){toast("請先作答。");return;}answers[q.id]=value;revealPractice(q,id,value);return;}
 const b=e.target.closest(".opt");if(!b||b.classList.contains("mockopt"))return;
 const id=b.dataset.q,opt=+b.dataset.opt,q=current.find(x=>String(x.id)===String(id));if(!q)return;answers[q.id]=opt;
 document.querySelectorAll(`.opt[data-q="${CSS.escape(String(id))}"]:not(.mockopt)`).forEach(x=>x.classList.remove("selected","correct","wrong"));
 b.classList.add("selected",qCorrect(q,opt)?"correct":"wrong");
 if(!qCorrect(q,opt))markNeedHelp(q,`答錯：我選 ${String.fromCharCode(65+opt)}，正確答案是 ${qAnswerText(q)}`,"",opt);
 const key=window.LearningCore?.answerKey?.(q)??q.a,c=document.querySelector(`.opt[data-q="${CSS.escape(String(id))}"][data-opt="${key}"]:not(.mockopt)`);if(c)c.classList.add("correct");
 $("exp"+id)?.classList.add("show");
});
async function finishPractice(){
  let done=0,correct=0,wrong=[];
  current.forEach(q=>{if(qAnswered(q,answers[q.id])){done++;const ok=qCorrect(q,answers[q.id]);if(ok===true)correct++;else if(ok===false)wrong.push(q.id)}});
  const score=done?Math.round(correct/done*100):0;
  saveLocalSession(done,score,wrong,current,answers);
  if(db&&user) await syncAttempts(current,answers,"practice");
  $("result").innerHTML=`<h3>成績：${score} 分</h3><p>已作答 ${done} 題，答對 ${correct} 題。${practiceScope?"本機模擬題紀錄儲存在此裝置。":db&&user?" 已嘗試同步到 Supabase。":" 目前儲存在此裝置。"}</p>`;
  refreshStats();
}
function saveLocalSession(done,score,wrong,set,ans){
  progress.record(set,ans,sessionStorage.getItem("v471_session")||"session","practice-or-mock");
  if(adapter()){refreshStats();return;}
  localStorage.setItem("v42score",String(score));localStorage.setItem("v42done",String(done));
  const old=JSON.parse(localStorage.getItem("v42wrong")||"[]");
  localStorage.setItem("v42wrong",JSON.stringify(Array.from(new Set(old.concat(wrong)))));
  const hist=JSON.parse(localStorage.getItem("v42hist")||"{}");
  set.forEach(q=>{if(ans[q.id]!==undefined){if(!hist[q.topic])hist[q.topic]={ok:0,total:0};hist[q.topic].total++;if(ans[q.id]===q.a)hist[q.topic].ok++}});
  localStorage.setItem("v42hist",JSON.stringify(hist));
}
async function syncAttempts(set,ans,mode){
  if(!db||!user)return;
  set=set.filter(q=>q.origin!=="local"&&!q.sync_disabled&&q.questionType==="single_choice");
  const rows=set.filter(q=>ans[q.id]!==undefined).map(q=>({
    user_id:user.id,question_id:q.id,selected_index:q.optionOrder?.[ans[q.id]]??ans[q.id],is_correct:ans[q.id]===q.a,mode,
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
 mockScope=adapter()||selectedGrade()===2?currentScope():null;
 const qty=+$("mockQty").value,pool=getSchoolPool();mock=decorateQuestions(selectQuestions(pool,Math.min(qty,pool.length)));mockAnswers={};
 const passageSeen=new Set(),groupSeen=new Set();
 $("mockQuiz").innerHTML=mock.map((q,n)=>`${passageMarkup(q,passageSeen)}${questionGroupMarkup(q,groupSeen)}<div class="card qcard"><div class="qtitle">${n+1}. ${escapeText(q.q)}<span class="tag">${q.level}</span>${questionSourceMarkup(q)}</div>${questionVisualMarkup(q)}${questionInputMarkup(q,"mock")}<div class="inlineTools"><button class="soft" data-mock-dk="${q.id}">🙋 我不會</button><button class="soft" data-mock-ask="${q.id}">問 ChatGPT</button></div><div class="explain" id="mexp${q.id}"><b>答案：</b>${escapeText(qAnswerText(q))}<br><b>詳解：</b>${escapeText(q.e)}</div></div>`).join("");
 $("mockSubmitBox").style.display="block";$("mockResult").innerHTML="";
 $("mockScopeText").textContent=mockScope?`本次範圍：${scopeSummary(mockScope)}｜${mock.length} 題${mock.length<qty?"；題目不足，僅提供符合範圍的題目":""}。${mockScope.note}`:"高一既有學校模擬題池";
 if(!mock.length){$("mockSubmitBox").style.display="none";toast("目前範圍沒有符合條件的題目。");}
}
$("mockQuiz").addEventListener("click",e=>{
 const dk=e.target.closest("[data-mock-dk]"),ask=e.target.closest("[data-mock-ask]");
 if(dk||ask){const id=dk?.dataset.mockDk||ask?.dataset.mockAsk,q=mock.find(x=>String(x.id)===String(id));if(q){if(dk)markNeedHelp(q,"我不會");else queueForChatGPT(q,"我想請 ChatGPT 再解釋");}return;}
 const check=e.target.closest("[data-mock-check]");
 if(check){const id=check.dataset.mockCheck,q=mock.find(x=>String(x.id)===String(id));if(!q)return;const value=readStructuredAnswer(q,$("mockQuiz"),"mock");if(!qAnswered(q,value)){toast("請先作答。");return;}mockAnswers[q.id]=value;check.textContent="已儲存";return;}
 const opt=e.target.closest(".mockopt");if(!opt)return;const id=opt.dataset.q,q=mock.find(x=>String(x.id)===String(id));if(!q)return;mockAnswers[q.id]=+opt.dataset.opt;
 document.querySelectorAll(`.mockopt[data-q="${CSS.escape(String(id))}"]`).forEach(x=>x.classList.remove("selected"));opt.classList.add("selected");
});
async function submitMock(){
 if(!mock.length)return;
 let correct=0,wrong=[];
 mock.forEach(q=>{
  const value=mockAnswers[q.id],ok=qCorrect(q,value);
  if(ok===true)correct++;else if(qAnswered(q,value)&&ok===false){wrong.push(q.id);markNeedHelp(q,`答錯：我的答案 ${Array.isArray(value)?value.join("、"):value}，正確答案是 ${qAnswerText(q)}`,"",value);}
  if(q.questionType==="single_choice")document.querySelectorAll(`.mockopt[data-q="${CSS.escape(String(q.id))}"]`).forEach(x=>{const op=+x.dataset.opt,key=window.LearningCore?.answerKey?.(q)??q.a;if(op===key)x.classList.add("correct");if(value===op&&op!==key)x.classList.add("wrong")});
  $("mexp"+q.id)?.classList.add("show");
  const card=$("mexp"+q.id)?.parentElement;if(card&&!card.querySelector("[data-mock-explain]")){const bt=document.createElement("button");bt.className="soft";bt.dataset.mockExplain=q.id;bt.textContent="詳解看不懂";bt.onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");};card.appendChild(bt);}
 });
 const done=mock.filter(q=>qAnswered(q,mockAnswers[q.id])).length,gradable=mock.filter(q=>qAnswered(q,mockAnswers[q.id])&&qCorrect(q,mockAnswers[q.id])!==null).length,score=gradable?Math.round(correct/gradable*100):0;
 saveLocalSession(done,score,wrong,mock,mockAnswers);
 if(db&&user)await syncAttempts(mock,mockAnswers,"mock");
 $("mockResult").innerHTML=`<h3>模擬考：${score} 分</h3><p>已作答 ${done} 題；可自動評分 ${gradable} 題，答對 ${correct} 題。${done>gradable?" 非選題保留作答內容，需人工／規準批改。":""}</p>`;refreshStats();
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
 renderSubjectHistory();
 const s=$("histSchool")?.value||"全部",y=$("histYear")?.value||"全部",t=$("histTerm")?.value||"全部",e=$("histExam")?.value||"全部";
 const list=allHistoricalV4961.filter(x=>
   (s==="全部"||(x.schools?.name||"成功高中")===s)&&
   (y==="全部"||String(x.academic_year)===String(y))&&
   (t==="全部"||String(x.term)===String(t))&&
   (e==="全部"||x.exam_name===e)&&(!adapter()||!$('histGrade').value||Number(x.grade)===Number($('histGrade').value))
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
   if(x.grade!=null&&![1,2].includes(Number(x.grade))){toast("此年級尚未建立練習題池。");return;}
   $("grade").value=String(x.grade||1);updateTopicFilters();
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
 const seq=++gsatLoadSeq,requestedSubject=subjectId(),requestedName=subjectInfo().name;
 const status=$("gsatStatus"),list=$("gsatList");if(!status||!list)return;
 status.textContent="讀取大考中心官方學測來源中…";
 try{
  const hdb=await getHistoricalDbV4963();
  const {data,error}=await hdb.from("national_exam_sources").select("*").eq("subject",requestedName).order("academic_year",{ascending:false});
  if(error)throw error;if(seq!==gsatLoadSeq||requestedSubject!==subjectId())return;
  const rows=(data||[]).filter(x=>(x.subject||"數學")===requestedName&&Number(x.academic_year)>=110),ys=[...new Set(rows.map(x=>x.academic_year))],vs=[...new Set(rows.map(x=>x.subject_variant))];
  const ysel=$("gsatYear"),vsel=$("gsatVariant");
  if(ysel&&ysel.options.length<=1)ysel.innerHTML='<option value="全部">全部學年度</option>'+ys.map(y=>`<option value="${y}">${y} 學年度</option>`).join("");
  if(vsel&&vsel.options.length<=1)vsel.innerHTML='<option value="全部">全部'+escapeText(requestedName)+'類別</option>'+vs.filter(Boolean).map(v=>`<option value="${escapeText(v)}">${escapeText(v)}</option>`).join("");
  const y=ysel?.value||"全部",v=vsel?.value||"全部";
  const filtered=rows.filter(x=>(y==="全部"||String(x.academic_year)===String(y))&&(v==="全部"||x.subject_variant===v));
  status.textContent=`找到 ${filtered.length} 筆大考中心官方來源。`;
  list.innerHTML=filtered.length?filtered.map(x=>`<div class="item"><b>${x.academic_year} ${x.exam_type}・${x.subject_variant}</b><div class="small">${x.scope_note||""}</div><div style="margin-top:8px"><a class="btnLink" href="${x.source_url}" target="_blank" rel="noopener">開啟大考中心官方來源</a></div></div>`).join(""):'<div class="empty">目前沒有符合條件的學測來源。</div>';
 }catch(e){if(seq!==gsatLoadSeq||requestedSubject!==subjectId())return;console.error(e);status.textContent="學測官方來源讀取失敗："+(e.message||e);list.innerHTML="";}
}

async function loadHistorical(showAll=false){
  const seq=++historicalLoadSeq,requestedSubject=subjectId(),requestedName=subjectInfo().name;
  const status=$("historicalStatus");
  renderSubjectHistory();
  if(adapter()&&!db){allHistoricalV4961=[];fillHistoricalFiltersV4961([]);status.textContent='目前使用本機資料；國文官方來源索引尚未載入。';renderHistorical([]);return;}
  status.textContent="讀取歷屆來源中…";
  try{
    const hdb=await getHistoricalDbV4963();
    const query=hdb.from("source_documents").select("*,schools(name)").order("academic_year",{ascending:false});
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error("歷屆來源查詢逾時")),5000));
    const {data,error}=await Promise.race([query,timeout]);
    if(error)throw error;
    if(seq!==historicalLoadSeq||requestedSubject!==subjectId())return;
    allHistoricalV4961=(data||[]).filter(x=>(x.subject||"數學")===requestedName);
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
    if(seq!==historicalLoadSeq||requestedSubject!==subjectId())return;
    console.error(e);
    status.textContent="歷屆來源讀取失敗："+(e.message||e)+"。請按右上「資料庫設定」確認 Project URL / Publishable key。";
    renderHistorical([]);
  }
}


let autoPaper=[],autoAnswers={},activeScope=null;
async function getScopeProfile(){if(adapter())return null;if(selectedGrade()===2){const s=currentScope();return s.sourceType==="official"&&s.chapterIds.length?{...s,scope_label:s.label,source_url:s.sourceUrl,topic_weights:Object.fromEntries(s.chapterIds.map(id=>[catalog.chapters.find(c=>c.id===id).label,100/s.chapterIds.length]))}:null;}if(dbMode!=="cloud"||!db)return null;const {data:s}=await db.from("schools").select("id").eq("name",$("school").value).maybeSingle();if(!s)return null;const {data}=await db.from("exam_scope_profiles").select("*").eq("school_id",s.id).eq("academic_year",+$("year").value).eq("term",$("term").value==="上學期"?1:2).eq("exam_name",$("exam").value).eq("grade",1).eq("subject","數學").maybeSingle();return data||null;}
async function showScopeProfile(){activeScope=await getScopeProfile();const box=$("scopeProfile");if(!activeScope){box.innerHTML="目前這個學校／學年度／段考尚未建立已核驗範圍。你仍可使用「原創練習」。";return;}const tw=activeScope.topic_weights||{},dw=activeScope.difficulty_weights||{};box.innerHTML=`<b>已核驗範圍：</b>${activeScope.scope_label}<div class="chips">${Object.entries(tw).map(([k,v])=>`<span class="chip">${k} ${v}%</span>`).join("")}</div><div class="small">難度配置：${Object.entries(dw).map(([k,v])=>`${k} ${v}%`).join("／")}</div>${activeScope.source_url?`<p><a class="linkbtn soft" target="_blank" rel="noopener" href="${activeScope.source_url}">查看官方範圍來源</a></p>`:""}`;}
function weightedPick(pool,weights,key,n){let result=[],used=new Set();for(const [label,pct] of Object.entries(weights||{})){const want=Math.round(n*(+pct)/100),candidates=pool.filter(q=>q[key]===label&&!used.has(q.id));shuffle(candidates).slice(0,want).forEach(q=>{result.push(q);used.add(q.id)});}return result.concat(shuffle(pool.filter(q=>!used.has(q.id))).slice(0,Math.max(0,n-result.length))).slice(0,n);}
async function buildAutoPaper(){sessionStorage.setItem("v471_session","auto-"+Date.now());activeScope=await getScopeProfile();if(!activeScope){toast("這組條件尚無已核驗官方範圍");return;}const n=+$("autoQty").value,topics=Object.keys(activeScope.topic_weights||{}),pool=(selectedGrade()===2?getSchoolPool():questions).filter(q=>topics.includes(q.topic));autoPaper=weightedPick(pool,activeScope.topic_weights,"topic",n).map(q=>q.grade===2?catalog.shuffleOptions(q):q);autoAnswers={};renderAutoPaper();$("autoSubmitBox").style.display="block";}
function renderAutoPaper(){$("autoQuiz").innerHTML=autoPaper.map((q,i)=>`<div class="card qcard"><div class="small">第 ${i+1} 題 · ${q.topic} · ${q.level}</div><div class="qtitle">${escapeText(q.q)}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-ai="${i}" data-aj="${j}">${String.fromCharCode(65+j)}. ${escapeText(o)}</button>`).join("")}</div><div class="inlineTools"><button class="soft" data-auto-dk="${i}">🙋 我不會</button><button class="soft" data-auto-ask="${i}">問 ChatGPT</button></div><div class="explain" id="aexp${i}"><b>答案：</b>${String.fromCharCode(65+q.a)}<br><b>詳解：</b>${escapeText(q.e)}</div></div>`).join("");
 document.querySelectorAll("[data-ai]").forEach(b=>b.onclick=()=>{const i=+b.dataset.ai,j=+b.dataset.aj;autoAnswers[i]=j;b.parentElement.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
 document.querySelectorAll("[data-auto-dk]").forEach(b=>b.onclick=()=>{const q=autoPaper[+b.dataset.autoDk];markNeedHelp(q,"我不會");});
 document.querySelectorAll("[data-auto-ask]").forEach(b=>b.onclick=()=>{const q=autoPaper[+b.dataset.autoAsk];queueForChatGPT(q,"我想請 ChatGPT 再解釋");});
}

async function submitAutoPaper(){let correct=0;autoPaper.forEach((q,i)=>{const card=$("aexp"+i).parentElement,opts=card.querySelectorAll(".opt");opts[q.a].classList.add("correct");if(autoAnswers[i]===q.a)correct++;else if(autoAnswers[i]!=null){opts[autoAnswers[i]].classList.add("wrong");markNeedHelp(q,`答錯：我選 ${String.fromCharCode(65+autoAnswers[i])}，正確答案是 ${String.fromCharCode(65+q.a)}`,"",autoAnswers[i]);}$("aexp"+i).classList.add("show");if(!card.querySelector("[data-auto-explain]")){const bt=document.createElement("button");bt.className="soft";bt.dataset.autoExplain=i;bt.textContent="詳解看不懂";bt.onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");};card.appendChild(bt);}});const score=Math.round(correct/Math.max(1,autoPaper.length)*100);$("autoResult").innerHTML=`<h3>${$("school").value} ${$("year").value} ${$("term").value} ${$("exam").value} 模擬卷：${score} 分</h3><p class="small">${correct}/${autoPaper.length} 題正確 · 範圍：${activeScope.scope_label}</p>`;}

let studyPool=[],studyIndex=0,studyReveal=0;
function studyHint(q){
 if(registry.get(q.subject)?.adapter)return "先找出文本中的語境與關鍵線索，再排除超出文本的推論。";
 const hints={
  "實數":"先整理數的性質、根式或絕對值條件，再決定運算順序。",
  "多項式":"先觀察是否能因式分解、代入特殊值，或使用餘式／因式定理。",
  "指數":"先把底數統一，再比較指數；注意指數律的使用條件。",
  "對數":"先確認真數大於 0，再利用乘法、除法與次方的對數律。",
  "綜合":"先判斷題目主要考哪個觀念，把已知條件轉成代數式。"
 };return hints[q.topic]||"先圈出已知條件與要求的量，再選擇對應公式。";
}
function studyKey(q){
 if(registry.get(q.subject)?.adapter)return registry.skills.find(s=>s.id===q.skill)?.name||q.category;
 const map={"實數":"數與式的定義、運算性質與條件","多項式":"因式分解、餘式定理與代數運算","指數":"指數律、同底轉換與成長關係","對數":"對數定義、換底與對數律","綜合":"辨識核心觀念並串聯條件"};
 return map[q.topic]||q.topic;
}
function studyMistake(q){
 if(registry.get(q.subject)?.adapter)return "不要只憑篇名或單一字面作答；核對前後文，避免過度推論。";
 const map={"實數":"忽略根式、分母或絕對值造成的條件限制。","多項式":"展開或移項時符號錯誤，或把餘式定理的代入值弄反。","指數":"把加法誤套成指數律，或底數未統一就直接比較。","對數":"忘記真數必須大於 0，或把 log(a+b) 錯拆成兩個對數。","綜合":"太快計算，沒有先確認題目真正要求的量。"};
 return map[q.topic]||"計算前未檢查條件與符號。";
}
function startStudy(fromWrong=false){
 let pool=getSchoolPool();
 if(fromWrong){const ids=(JSON.parse(localStorage.getItem("wrong")||"[]")).map(x=>x.id);pool=pool.filter(q=>ids.includes(q.id));}
 else{const t=$("studyTopic").value,l=$("studyLevel").value;if(t!=="全部")pool=pool.filter(q=>q.topic===t);if(l!=="全部")pool=pool.filter(q=>q.level===l);}
 studyPool=shuffle(pool).map(q=>q.grade===2?catalog.shuffleOptions(q):q);studyIndex=0;studyReveal=0;
 if(!studyPool.length){$("studyCard").innerHTML='<div class="card">目前沒有符合條件的題目。</div>';return;}
 renderStudy();
}
function renderStudy(){
 const q=studyPool[studyIndex%studyPool.length];studyReveal=0;
 $("studyProgress").textContent=`第 ${studyIndex+1} 題 · ${q.topic} · ${q.level}`;
 $("studyCard").innerHTML=`<div class="card qcard"><div class="qtitle">${escapeText(q.q)}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-study-opt="${j}">${String.fromCharCode(65+j)}. ${escapeText(o)}</button>`).join("")}</div><div class="studyActions"><button class="soft" id="dontKnow">🙋 我不會</button><button class="soft" id="showHint">提示 1</button><button class="soft" id="askLater">加入待詢</button><button class="primary" id="checkStudy">確認答案</button></div><div id="studyExplain" class="studySteps"></div><div class="confidence"><span class="small">這題掌握度：</span><button data-conf="1">再學一次</button><button data-conf="2">有點懂</button><button data-conf="3">已掌握</button></div></div>`;
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
 if(studyReveal>=4)steps.push(`<div class="studyStep"><b>④ 完整詳解</b><br>正確答案：${String.fromCharCode(65+q.a)}<br>${escapeText(q.e)}</div><div class="studyStep"><b>⑤ 常見錯誤</b><br>${studyMistake(q)}</div><div class="studyActions"><button class="soft" id="studyExplainHelp">詳解看不懂</button></div>`);
 e.innerHTML=steps.join("");if(studyReveal>=4&&$("studyExplainHelp"))$("studyExplainHelp").onclick=()=>{const note=prompt("哪一段詳解看不懂？","");markNeedHelp(q,"詳解看不懂",note||"");};
 if(studyReveal<4){const btn=document.createElement("button");btn.className="soft";btn.textContent=studyReveal===1?"再給我破題關鍵":studyReveal===2?"顯示使用觀念": "看完整詳解";btn.onclick=()=>revealStudy(q,studyReveal+1);e.appendChild(btn);}
}
function saveStudyWrong(q,reason){
 if(q.subject&&q.subject!=="math"){progress.help(q,reason);refreshStats();return;}
 let arr=JSON.parse(localStorage.getItem("wrong")||"[]");if(!arr.some(x=>x.id===q.id))arr.push({...q,reason});localStorage.setItem("wrong",JSON.stringify(arr));addToLegacyWrong(q);refreshStats();
}
function saveConfidence(q,level){
 let m=JSON.parse(localStorage.getItem("studyConfidence")||"{}");m[q.id]={level,at:new Date().toISOString()};localStorage.setItem("studyConfidence",JSON.stringify(m));
}


function addToLegacyWrong(q){
 if(q.subject&&q.subject!=="math"){progress.help(q,"我不會／錯題");return;}
 const ids=JSON.parse(localStorage.getItem("v42wrong")||"[]");
 if(!ids.includes(q.id)){ids.push(q.id);localStorage.setItem("v42wrong",JSON.stringify(ids));}
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
 const recordSubject=q.subject||q.subjectId||'math';
 let a=getStudyQueue(),old=a.find(x=>x.id===q.id&&(x.subject||x.subjectId||'math')===recordSubject);
 const item={
   id:q.id,grade:q.grade||1,subject:recordSubject,text_ids:q.chineseMetadata?.text_ids||[],skill:q.skill||null,category:q.category||q.topic,subjectId:recordSubject,chapterId:q.chapterId||null,topic:q.topic,level:q.level,question:q.q,options:q.o,
   answer:q.a,explanation:q.e,reason,note,picked,
   school:$("school").value,year:$("year").value,term:$("term").value,exam:$("exam").value,
   sessionId:sessionStorage.getItem("v471_session")||"",at:new Date().toISOString()
 };
 if(old)Object.assign(old,item);else a.push(item);
 setStudyQueue(a);toast("已加入錯題本＋ChatGPT 待詢清單");
}
function promptForItem(x){
 const opts=(x.options||[]).map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join("\n");
 return `我是台灣${Number(x.grade)===2?"高二":"高一"}學生，正在準備 ${x.school} ${x.year} 學年度 ${x.term} ${x.exam}。\n\n【章節】${x.topic}（${x.level}）\n【題目】${x.question}\n【選項】\n${opts}\n【題庫答案】${String.fromCharCode(65+Number(x.answer))}\n【題庫原詳解】${x.explanation||"無"}\n【我的狀況】${x.reason}${x.picked!=null?`\n【我選的答案】${String.fromCharCode(65+Number(x.picked))}`:""}${x.note?`\n【我卡住的地方】${x.note}`:""}\n\n請用台灣高中${Number(x.grade)===2?"二":"一"}年級程度教我，不要只丟答案。請依序：\n1. 說明這題考什麼觀念\n2. 告訴我破題關鍵\n3. 用清楚、不跳步的方式解題\n4. 指出我最可能犯的錯誤\n5. 最後出一題同觀念、難度相近的題目讓我練習，先不要公布答案。`;
}
async function copyTextSafe(text){try{await navigator.clipboard.writeText(text);toast("已複製，可直接貼到 ChatGPT");}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("已複製，可直接貼到 ChatGPT");}}
function reasonClass(r){
 if(String(r).includes("答錯"))return "reason-wrong";
 if(String(r).includes("詳解"))return "reason-explain";
 return "reason-dontknow";
}
function renderHelper(){
 const a=getStudyQueue().filter(x=>(x.subject||x.subjectId||"math")===subjectId());
 const wrong=a.filter(x=>String(x.reason).includes("答錯")).length;
 const dont=a.filter(x=>String(x.reason).includes("不會")).length;
 const explain=a.filter(x=>String(x.reason).includes("詳解")||String(x.reason).includes("再解釋")).length;
 $("helperSummary").innerHTML=`目前 ${a.length} 題：<span class="reasonTag reason-wrong">答錯 ${wrong}</span> <span class="reasonTag reason-dontknow">我不會 ${dont}</span> <span class="reasonTag reason-explain">詳解看不懂 ${explain}</span>`;
 $("helperList").innerHTML=a.length?a.map((x,i)=>`<div class="card qcard"><div class="small">${x.school} · ${x.year} · ${x.term} · ${x.exam} · ${x.topic} · ${x.level}</div><div class="qtitle">${escapeText(x.question)}</div><p class="small"><span class="reasonTag ${reasonClass(x.reason)}">${x.reason}</span>${x.picked!=null?`｜我選 ${String.fromCharCode(65+Number(x.picked))}`:""}${x.note?`｜卡點：${x.note}`:""}</p><div class="filters"><button class="primary" data-copy-helper="${i}">複製這一題問 ChatGPT</button><button class="soft" data-note-helper="${i}">補充我卡住的地方</button><button class="warn" data-del-helper="${i}">移除</button></div></div>`).join(""):'<div class="card">目前沒有待詢問題。任何模式按「我不會」、答錯或「詳解看不懂」都會自動加入。</div>';
 document.querySelectorAll("[data-copy-helper]").forEach(b=>b.onclick=()=>copyTextSafe(promptForItem(a[+b.dataset.copyHelper])));
 document.querySelectorAll("[data-note-helper]").forEach(b=>b.onclick=()=>{const i=+b.dataset.noteHelper,n=prompt("你卡在哪裡？例如：看不懂第二步為什麼可以移項",a[i].note||"");if(n!==null){const all=getStudyQueue(),item=all.find(x=>x.id===a[i].id&&(x.subject||x.subjectId||"math")===subjectId());if(item)item.note=n;setStudyQueue(all);renderHelper();}});
 document.querySelectorAll("[data-del-helper]").forEach(b=>b.onclick=()=>{const item=a[+b.dataset.delHelper];setStudyQueue(getStudyQueue().filter(x=>!(x.id===item.id&&(x.subject||x.subjectId||"math")===subjectId())));renderHelper();});
}
function copyAllStudyQuestions(){
 const a=getStudyQueue().filter(x=>(x.subject||x.subjectId||"math")===subjectId());if(!a.length){toast("目前沒有待詢問題");return;}
 const head=`我正在準備台灣高中段考。以下是我目前不會、答錯或看不懂的題目。請一次先診斷我的共同弱點，再逐題教我。每題請用「觀念 → 破題 → 分步驟 → 常見錯誤」的方式，不要只給答案。最後請依我的弱點出 3 題新的練習題，先不要公布答案。\n\n`;
 copyTextSafe(head+a.map((x,i)=>`========== 第 ${i+1} 題 ==========\n${promptForItem(x)}`).join("\n\n"));
}

let sourceInventoryV49=[],sourceCoverageV49=[];
const kindLabel={question:"試題",answer:"答案",scope:"考試範圍",schedule:"考程",index:"題庫索引",reference:"參考來源"};
const provLabel={official_school:"校方官方",official_department:"校內科別官方",secondary_archive:"民間考古題索引",third_party_reference:"第三方參考"};

let calibrationV49=[],examEvidenceV49=[];
async function loadCalibrationV49(){
 if(dbMode!=="cloud"||!db)return;
 const requestedSwitch=subjectSwitchSeq,client=db;
 const [c,e]=await Promise.all([
   db.from("school_calibration_status").select("*,schools(name)").order("school_id"),
   db.from("exam_structure_evidence").select("*,schools(name)").order("academic_year",{ascending:false})
 ]);
 if(requestedSwitch!==subjectSwitchSeq||client!==db||adapter())return;
 calibrationV49=(c.data||[]).filter(x=>(x.subject||'數學')==='數學');examEvidenceV49=(e.data||[]).filter(x=>(x.subject||'數學')==='數學');
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
 if(adapter()){renderSubjectSources();return;}
 if(dbMode!=="cloud"||!db){$("coverageCards").innerHTML='<div class="card">需先連線 Supabase 才能查看真實題源資料。</div>';$("sourceInventoryList").innerHTML="";return;}
 const requestedSwitch=subjectSwitchSeq,client=db;
 const [inv,cov]=await Promise.all([
   db.from("exam_source_inventory").select("*,schools(name)").order("verified_at",{ascending:false}),
   db.from("school_source_coverage").select("*,schools(name)")
 ]);
 if(requestedSwitch!==subjectSwitchSeq||client!==db||adapter())return;
 sourceInventoryV49=(inv.data||[]).filter(x=>(x.subject||'數學')==='數學');sourceCoverageV49=(cov.data||[]).filter(x=>(x.subject||'數學')==='數學');
 const f=$("sourceSchoolFilter");
  const fixedSourceSchools=["建國中學","北一女中","師大附中","成功高中","中山女高","松山高中","延平高中","薇閣高中"];
  const sourceNames=[...new Set([...fixedSourceSchools,...sourceCoverageV49.map(x=>x.schools?.name).filter(Boolean)])];
  f.innerHTML='<option value="全部">全部學校</option>'+sourceNames.map(x=>`<option>${x}</option>`).join("");
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
 if(adapter()){renderSubjectSources();return;}
 const s=$("sourceSchoolFilter").value,k=$("sourceKindFilter").value,p=$("sourceProvFilter").value;
 const arr=sourceInventoryV49.filter(x=>(s==="全部"||x.schools?.name===s)&&(k==="全部"||x.source_kind===k)&&(p==="全部"||x.provenance===p));
 $("sourceInventorySummary").textContent=`符合條件 ${arr.length} 筆來源｜僅建立索引與中繼資料，不直接複製完整考卷內容。`;
 $("sourceInventoryList").innerHTML=arr.length?arr.map(x=>`<div class="card sourcecard"><div class="sourcehead"><div><h3 style="margin:0">${x.title}</h3><div class="sourceMeta"><span>${x.schools?.name||""}</span><span>${x.academic_year||"跨年度"}學年度</span><span>${x.term?x.term===1?"上學期":"下學期":"學期未限定"}</span><span>${x.exam_name||"多次考試"}</span><span>${kindLabel[x.source_kind]||x.source_kind}</span><span>${provLabel[x.provenance]||x.provenance}</span></div></div><span class="${x.confidence==="high"?"trustHigh":x.confidence==="medium"?"trustMedium":"trustLow"}">${x.confidence==="high"?"高可信":x.confidence==="medium"?"中可信":"待核驗"}</span></div><p class="small">${x.notes||""}</p><div class="sourceactions"><a class="linkbtn primary" href="${x.source_url}" target="_blank" rel="noopener">開啟來源</a><span class="small">使用方式：${x.reuse_mode==="official_link"?"官方連結":x.reuse_mode==="link_only"?"只建立連結索引":x.reuse_mode==="metadata_only"?"只保留中繼資料":"需另取得授權"}</span></div></div>`).join(""):'<div class="card">目前沒有符合條件的來源。</div>';
}

function renderSources(){
 if(adapter()){$("sourceRows").innerHTML=catalog.schools.map(n=>`<tr><td>${escapeText(n)}</td><td>國文已驗證真題 ${adapter().all().filter(q=>core.isVerified(q)&&q.school===n).length} 題</td><td>尚未收錄可驗證題目；不沿用數學狀態</td><td>待收集</td></tr>`).join("");return;}
  $("sourceRows").innerHTML=Object.keys(schools).map(n=>{const d=schools[n];return `<tr><td><b>${n}</b></td><td><span class="status ${d.tone==="good"?"goodS":d.tone==="mid"?"midS":"lowS"}">${d.status}</span></td><td>${d.desc}</td><td><a class="linkbtn soft" target="_blank" href="${d.url}">官方入口</a></td></tr>`}).join("");
}
async function renderWrong(){
 if($("wrongSubject").value!=="math")return renderCombinedWrong();
  let ids=JSON.parse(localStorage.getItem("v42wrong")||"[]");
  if(db&&user){
    const {data}=await db.from("wrong_questions").select("question_id").eq("user_id",user.id).eq("mastered",false);
    if(data) ids=Array.from(new Set(ids.concat(data.map(x=>x.question_id))));
  }
  $("wrongList").innerHTML=ids.length?ids.map((id,i)=>{const q=findQuestion(id,'math');if(!q||(q.subject||q.subjectId||"math")!=="math")return"";return `<div class="card qcard"><div class="qtitle">${i+1}. ${escapeText(q.q)}<span class="tag">${q.topic}</span></div><div class="explain show"><b>答案：</b>${escapeText(q.o[q.a])}<br><b>詳解：</b>${escapeText(q.e)}</div></div>`}).join(""):'<div class="card">目前沒有錯題。</div>';
}
function renderWeak(){
 if(adapter()){return renderSubjectAnalytics("weakBars");}
  const hist=JSON.parse(localStorage.getItem("v42hist")||"{}"),topics=[...new Set(["實數","多項式","指數","對數","綜合",...catalog.chapters.map(c=>c.label)])];
  $("weakBars").innerHTML=topics.map(t=>{const h=hist[t],pct=h&&h.total?Math.round(h.ok/h.total*100):0;return `<div class="barrow"><b>${t}</b><div class="bar"><i style="width:${pct}%"></i></div><span>${h&&h.total?pct+"%":"-"}</span></div>`}).join("");
}


function refreshAuthBoxV49614(){
 const logged=!!user;
 const a=$("authLoginBox"),b=$("authLogoutBox");
 if(a)a.style.display=logged?"none":"block";
 if(b)b.style.display=logged?"block":"none";
}
function verifyBankV49610(){
 if(adapter()){adapter().stats();return {total:adapter().all().length,pool:getSchoolPool().length};}
  const track=$("curriculumTrack")?.value||"A";
  const total=selectedGrade()===2?[...grade2Fallback,...grade2Cloud].filter(q=>catalog.trackAllows(track,q.curriculumTrack)).length:(Array.isArray(questions)?questions.length:0);
  const extra=Array.isArray(questions)?questions.filter(q=>Number(q.id)>160).length:0;
  const pool=(typeof getSchoolPool==="function")?getSchoolPool():questions;
  const poolExtra=Array.isArray(pool)?pool.filter(q=>Number(q.id)>160).length:0;
  const totalEl=$("bankTotalN"), verifyEl=$("bankVerifyText"), chip=$("homeBankChip");
  if(totalEl)totalEl.textContent=total;
  if(chip)chip.textContent=`目前題庫 ${total} 題`;
  if(verifyEl){
    if(selectedGrade()===2){
      verifyEl.textContent=`${grade2CourseLabel()}：${total} 題｜本次範圍可抽 ${pool.length} 題｜本機模擬題作答保留於此裝置`;
      return {total,extra:grade2Fallback.length,pool:pool.length,poolExtra:pool.filter(q=>q.origin==="local").length};
    }
    const topicCount={};
    (questions||[]).forEach(q=>topicCount[q.topic]=(topicCount[q.topic]||0)+1);
    const five=["實數","多項式","指數","對數","綜合"];
    const balanced=five.every(t=>topicCount[t]===50);
    verifyEl.textContent=`題庫驗證：總計 ${total} 題｜新增題 ${extra} 題｜${$("school")?.value||"目前學校"}可抽 ${pool.length} 題（其中新增題 ${poolExtra} 題）${balanced?"｜5 主題各 50 題 ✓":""}`;
  }
  return {total,extra,pool:pool.length,poolExtra};
}

function refreshStats(){
 if(adapter()){adapter().stats();return;}
  const s=localStorage.getItem("v42score");
  const d=+(localStorage.getItem("v42done")||0);
  const w=JSON.parse(localStorage.getItem("v42wrong")||"[]").length;
  if($("score"))$("score").textContent=s===null?"-":s;
  if($("doneN"))$("doneN").textContent=d;
  if($("wrongN"))$("wrongN").textContent=w;
  if($("prog"))$("prog").style.width=Math.min(100,Math.round(d/50*100))+"%";
  if(typeof verifyBankV49610==="function")verifyBankV49610();
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
  historicalDbV4963=null;v494ScopeCache.clear();
  const st=$("settingsStatus");if(st)st.textContent="正在測試 Supabase 連線…";
  const ok=await connectDB(true);
  if(st)st.textContent=ok?"✅ Supabase 連線成功。":"❌ Supabase 連線失敗，請檢查 URL / Key。";
  if(ok)setTimeout(closeSettings,450);
}
function useLocal(){
 ++historicalLoadSeq;++gsatLoadSeq;++coverageLoadSeq;
 ++questionLoadSeq;cloudBankCache.clear();registry.enabled().forEach(s=>s.adapter?.clearCloud());
  // 只切換目前執行模式；保留 Supabase 設定。
  ++connectionRequest;++scopeRequest;++v494Seq;scopeOverrides.clear();v494ScopeCache.clear();grade2Cloud=[];
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

// V5 shared transport: only the selected subject/grade, with bounded pages and stale guards.
async function loadCurrentSubjectQuestions(){
 const seq=++questionLoadSeq,client=db,subject=subjectId(),grade=selectedGrade(),info=subjectInfo(),key=subject+":"+grade;
 if(!client||dbMode!=="cloud")return;
 const descriptor=cloudSubjects.find(s=>s.code===info.code&&s.enabled!==false);
 if(!descriptor)return;
 const isCurrent=()=>seq===questionLoadSeq&&client===db&&subjectId()===subject&&selectedGrade()===grade;
 function apply(rows){
  if(!isCurrent())return;
  if(info.adapter){info.adapter.receive(rows);}
  else if(grade===2){grade2Cloud=rows.map(q=>catalog.adaptQuestion(q,cloudSubjects)).filter(Boolean);}
  else {const merged=new Map(F.questions.map(q=>[q.id,q]));rows.filter(q=>catalog.isLegacyMath(q,cloudSubjects)).forEach(x=>merged.set(x.id,{id:x.id,topic:x.topic,sub:x.subtopic,level:x.difficulty,q:x.question_text,o:x.options,a:x.correct_index,e:x.explanation}));questions=[...merged.values()];}
  refreshSchool();renderLearningScope();verifyBankV49610();renderSubjectHistory();
 }
 if(cloudBankCache.has(key)){apply(cloudBankCache.get(key));return;}
 try{
  const rows=await core.paged(()=>{let q=client.from("questions").select(info.adapter?"*,question_text_links(*),question_skills(*),question_group_items(question_groups(group_id,passage_id,passages(*)))":"*").order("id").eq("grade",grade);return subject==="math"&&grade===1?q.or(`subject_id.eq.${descriptor.id},subject_id.is.null`):q.eq("subject_id",descriptor.id);},{isCurrent,onPage:apply});
  if(rows&&isCurrent())cloudBankCache.set(key,rows);
 }catch(e){if(isCurrent()){$("bankLoadDetail").textContent="雲端題庫暫未完成載入，保留本機題目。";}console.warn(e.message);}
}
function renderCombinedWrong(){
 const wanted=$("wrongSubject").value,text=$("wrongText").value,skill=$("wrongSkill").value,category=$("wrongCategory").value;
 const rows=progress.wrong().filter(q=>wanted==="all"||q.subject===wanted).map(q=>({...q,...(findQuestion(q.id,q.subject||q.subjectId||'math')||{})})).filter(q=>(!text||q.chineseMetadata?.text_ids?.includes(text))&&(!skill||q.chineseMetadata?.skills?.includes(skill))&&(!category||q.category===category));
 $("wrongList").innerHTML=rows.length?rows.map(q=>`<div class="card qcard"><span class="tag">${escapeText(registry.get(q.subject||q.subjectId||"math")?.name||"數學")}</span><div class="qtitle">${escapeText(q.q||q.question||"題目 "+q.id+"（待載入原題）")}</div><p>${escapeText(q.e||q.explanation||"")}</p></div>`).join(""):'<div class="card">目前沒有符合條件的錯題。</div>';
}
function renderSubjectAnalytics(target="subjectAnalytics"){
 const subject=subjectId(),info=subjectInfo(),summary=progress.summary(subject),rows=info.skills.length?info.skills.map(skill=>{const s=progress.summary(subject,null,skill.id);return `<li>${escapeText(skill.name)}：${s.percent===null?"尚未練習":s.percent+"%（"+s.total+"次作答）"}</li>`;}).join(""):"";
 $(target).innerHTML=`<h3>${escapeText(info.name)}學習數據</h3><p>V5 作答 ${summary.total} 次，${summary.percent===null?"尚未練習":summary.percent+"% 正確"}。熟練度依實際作答計算。</p><ul>${rows}</ul>`;
 if(subject==="math"){$(target).innerHTML+='<p>升級前的數學統計保留於原有首頁與弱點分析；未從舊總數虛構逐題作答。</p>';}
 if(info.categories.length)$(target).innerHTML+='<h4>分類表現</h4><ul>'+info.categories.map(category=>{const s=progress.summary(subject,null,null,category);return `<li>${escapeText(category)}：${s.percent===null?'尚未練習':s.percent+'%（'+s.total+'次作答）'}</li>`;}).join('')+'</ul>';
 if(info.specialFeatures.includes("classical-texts"))$(target).innerHTML+=window.ClassicalTexts.map(t=>{const s=progress.summary(subject,t.text_id);return `<p>${escapeText(t.title)}：${s.percent===null?"尚未練習":s.percent+"%（"+s.total+"次）"}</p>`;}).join("");
}
function renderSubjectHistory(){
 const service=adapter(),box=$('subjectHistorical');box.hidden=!service?.history;
 if(!service?.history){box.textContent='';return;}
 const rows=service.history({source:$('histSource').value,school:$('histSchool').value,year:$('histYear').value,term:$('histTerm').value,exam:$('histExam').value,grade:$('histGrade').value,textId:$('histText').value});
 box.innerHTML=`<h3>目前載入的國文已驗證真題：${rows.length} 題</h3><p class="small">依首頁年級載入題庫；來源索引與可作答真題分開計算。待審題不列入。</p>`+(rows.length?rows.map(q=>`<div class="card"><b>${escapeText(q.source_title)}</b><p>${escapeText(q.academic_year)} 學年度｜${escapeText(q.school||'大考中心')}｜第 ${escapeText(q.question_number)} 題</p><p>${escapeText(q.q)}</p><a class="linkbtn soft" href="${escapeText(core.safeUrl(q.source_url))}" target="_blank" rel="noopener">查看原始來源</a></div>`).join(''):'<p>目前沒有符合条件的已驗證真題；平台題不算入真題。</p>');
}
function renderTextCoverage(){
 const service=registry.get("chinese").adapter,bank=service.all(),links=service.allLinks();
 $("textCoverage").innerHTML='<h3>古文30篇 × 已驗證真題來源</h3><div class="choiceGrid">'+window.ClassicalTexts.map(t=>{const c=core.coverage(bank,links,t.text_id);return '<div class="card"><b>'+escapeText(t.title)+'</b><p>學測 '+c.ceec+' 題｜八校 '+Object.values(c.schools).reduce((a,b)=>a+b,0)+' 題</p></div>';}).join('')+'</div>';
}
function renderSubjectSources(){
 const rows=adapter()?.all()||[],verified=rows.filter(core.isVerified);
 $("coverageCards").innerHTML=catalog.schools.map(s=>`<div class="card">${escapeText(s)}：已驗證 ${verified.filter(q=>q.school===s).length} 題；待收集／核驗。</div>`).join("");
 $("calibrationCards").textContent="國文尚無已校正的官方試卷資料。";$("examEvidenceList").textContent="尚未收錄。";$("examEvidenceSummary").textContent="";
 $("sourceInventorySummary").textContent=`${subjectInfo().name}已驗證真題 ${verified.length} 題；不使用數學來源冒充。`;$("sourceInventoryList").textContent="候選來源需經資料工程驗證後才發布。";
}
let subjectSwitchSeq=0;
async function switchSubject(){
 const seq=++subjectSwitchSeq; ++questionLoadSeq;++scopeRequest;++v494Seq;++historicalLoadSeq;++gsatLoadSeq;++coverageLoadSeq;
 selectedPracticeTopics.clear();
 adapter()?.clearCloud();
 current=[];mock=[];answers={};mockAnswers={};studyPool=[];
 $("quiz").textContent="";$("mockQuiz").textContent="";$("studyCard").textContent="";
 allHistoricalV4961=[];sourceInventoryV49=[];sourceDocs=[];
 for(const id of ['historicalList','gsatList','helperList','wrongList','weakBars'])$(id).textContent="";
 for(const id of ['gsatYear','gsatVariant'])$(id).replaceChildren(new Option('全部','全部'));
 $("subjectEntrances").hidden=!adapter();$("curriculumTrackField").hidden=!!adapter()||selectedGrade()!==2;
 $("subjectHistoryFilters").hidden=!adapter()?.history;renderSubjectHistory();
 $("coverageSubject").value=subjectInfo().name;
 Array.from($("grade").options).forEach(o=>o.textContent=(o.value==='1'?'高一':'高二')+subjectInfo().name);
 $("gsatHomeCard").querySelector('p').textContent='110學年度起'+subjectInfo().name+'官方來源；實際收錄數依資料庫顯示。';
 $("gsat").querySelector('p').textContent=subjectInfo().name+'學測官方來源；來源連結不等同已完成逐題分類。';
 goHome();
 try{await adapter()?.ensure();if(seq!==subjectSwitchSeq)return;adapter()?.setMode('exam');selectionChanged();renderSources();refreshStats();await loadCurrentSubjectQuestions();}
 catch(e){if(seq===subjectSwitchSeq)toast(e.message);}
}
registry.enabled().forEach(s=>s.adapter?.init({selection:learningSelection,startPractice:()=>openPanel('practice'),open:openPanel,refreshStats}));
$("wrongText").replaceChildren(new Option('全部篇目',''),...window.ClassicalTexts.map(t=>new Option(t.title,t.text_id)));
$("wrongSkill").replaceChildren(new Option('全部能力',''),...registry.skills.map(s=>new Option(s.name,s.id)));
$("wrongCategory").replaceChildren(new Option('全部分類',''),...registry.categories.map(c=>new Option(c,c)));
['wrongSubject','wrongText','wrongSkill','wrongCategory'].forEach(id=>$(id).addEventListener('change',renderWrong));
$('histText').replaceChildren(new Option('全部篇目',''),...window.ClassicalTexts.map(t=>new Option(t.title,t.text_id)));
['histSource','histText','histGrade'].forEach(id=>$(id).addEventListener('change',()=>{if(id==='histGrade'&&$('histGrade').value){$('grade').value=$('histGrade').value;adapter()?.clearCloud();selectionChanged();loadCurrentSubjectQuestions().catch(console.warn);}filterHistoricalV4961();}));
$("subject").addEventListener('change',switchSubject);
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
onV496("topicChoices","change",e=>{
 const all=e.target.closest('[data-topic-all]'),topic=e.target.dataset.topicValue;
 if(all){selectedPracticeTopics.clear();}
 else if(topic){e.target.checked?selectedPracticeTopics.add(topic):selectedPracticeTopics.delete(topic);}
 updateTopicFilters();
 if($("topicFilter"))$("topicFilter").open=true;
});
onV496("resetBtn","click",chooseSet);
onV496("finishBtn","click",finishPractice);
onV496("startMock","click",startMock);
onV496("submitMock","click",submitMock);
onV496("clearWrong","click",()=>{if($("wrongSubject").value!=="math"){toast("國文紀錄保留；請依弱點繼續練習。");return;}localStorage.removeItem("v42wrong");renderWrong();refreshStats();});

onV496("quiz","click",e=>{
 const dk=e.target.closest("[data-dontknow-q]"),ask=e.target.closest("[data-ask-q]"),ex=e.target.closest("[data-explain-q]");
 if(!dk&&!ask&&!ex)return;
 const id=dk?.dataset.dontknowQ||ask?.dataset.askQ||ex?.dataset.explainQ,q=current.find(x=>String(x.id)===String(id));if(!q)return;
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
onV496("clearStudyQueue","click",()=>{if(confirm("確定清除此科目的待詢問題？")){setStudyQueue(getStudyQueue().filter(q=>(q.subject||q.subjectId||"math")!==subjectId()));renderHelper();}});

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

["histSchool","histYear","histTerm","histExam"].forEach(id=>onV496(id,"change",filterHistoricalV4961));
// settings/auth




onV496("magicBtn","click",sendMagicLink);
onV496("signOutBtn","click",signOut);




const gsatBtnV4967=$("loadGsat");if(gsatBtnV4967)gsatBtnV4967.onclick=loadGsatV4967;
const gsatYearV4967=$("gsatYear");if(gsatYearV4967)gsatYearV4967.onchange=loadGsatV4967;
const gsatVariantV4967=$("gsatVariant");if(gsatVariantV4967)gsatVariantV4967.onchange=loadGsatV4967;
const refreshCoverageV49617=$("refreshCoverage");if(refreshCoverageV49617)refreshCoverageV49617.onclick=loadCoverageV49617;
const coverageSubjectV49617=$("coverageSubject");if(coverageSubjectV49617)coverageSubjectV49617.onchange=loadCoverageV49617;
const coverageGradeV49618=$("coverageGrade");if(coverageGradeV49618)coverageGradeV49618.onchange=loadCoverageV49617;
// selection changes: instant local re-render
function selectionChanged(){
  ++scopeRequest;++v494Seq;
  activeScopeV48=null;updateTopicFilters();
  refreshSchool();
  loadSchoolBankStatus();
  verifyBankV49610();
  chooseSet();
  mock=[];mockAnswers={};$("mockQuiz").textContent="";$("mockSubmitBox").style.display="none";$("mockScopeText").textContent="";
}
["grade","curriculumTrack","school","year","term","exam"].forEach(id=>onV496(id,"change",()=>{if(id==='grade')adapter()?.clearCloud();selectionChanged();if(id==="grade")loadCurrentSubjectQuestions().catch(console.warn);}));
onV496("applySourceFilters","click",renderSourceInventoryV49);

// background cloud sync, never blocks practice/mock
setTimeout(()=>connectDB(false).catch(e=>console.warn("background DB skipped",e)),120);



document.addEventListener("click",e=>{
 const h=e.target.closest('[data-open="historical"]');
 if(h)setTimeout(()=>{if(typeof loadGsatV4967==="function")loadGsatV4967();},250);
});

setTimeout(refreshAuthBoxV49614,400);

const magicBtnV49614=$("sendMagicBtn");if(magicBtnV49614)magicBtnV49614.onclick=sendMagicLink;
const signOutBtnV49614=$("signOutBtn");if(signOutBtnV49614)signOutBtnV49614.onclick=signOut;
})();
