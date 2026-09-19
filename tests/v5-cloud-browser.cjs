const assert=require('node:assert/strict');
module.exports=async function({browser,url}){
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**',r=>r.abort());
 await page.addInitScript(()=>{
  localStorage.setItem('v42_url','https://fixture.invalid');localStorage.setItem('v42_key','fixture-key');
  localStorage.setItem('v42wrong','[1]');localStorage.setItem('studyQueue','[{"id":1,"question":"legacy math preserved"}]');
  window.fixtureQueries=[];
  window.supabase={createClient:()=>({auth:{getUser:async()=>({data:{user:null}})},from(table){
   const filters={};let columns='';
   return {select(value){columns=value;return this;},order(){return this;},eq(k,v){filters[k]=v;return this;},or(v){filters.or=v;return this;},gte(){return this;},range(a,b){filters.range=[a,b];return this;},maybeSingle(){return this;},then(resolve,reject){
    return (async()=>{
     window.fixtureQueries.push({table,filters:{...filters},columns});
     if(table==='subjects')return {data:[{id:77,code:'MATH',enabled:true},{id:88,code:'CHIN',enabled:true}]};
     if(table==='schools')return {data:filters.name?{id:1}:[{id:1,name:'成功高中',official_url:'https://school.example'}]};
     if(table==='exam_source_inventory'){await new Promise(r=>setTimeout(r,220));return {data:[{subject:'數學',title:'delayed math source',source_kind:'question',schools:{name:'成功高中'}}]};}
     if(table==='national_exam_sources'){
      const subject=filters.subject;await new Promise(r=>setTimeout(r,subject==='國文'?200:10));
      return {data:[{subject,academic_year:114,exam_type:'GSAT',subject_variant:subject,source_url:'https://www.ceec.edu.tw/fixture'}]};
     }
     if(table!=='questions'||filters.subject_id!==88)return {data:[]};
     const grade=filters.grade;await new Promise(r=>setTimeout(r,grade===2?250:20));
     const make=(id,type='ceec_official')=>({id,grade,subject_id:88,question_text:'隔離測試國文題 '+id,options:['fixture answer','wrong A','wrong B','wrong C'],correct_index:0,explanation:'隔離測試詳解',source_type:type,source_url:'https://www.ceec.edu.tw/fixture',classification_status:'verified',verified_at:'2026-09-19',
      learning_metadata:{grade,grades:[1,2],category:'文言文閱讀',unit:'classical',source_title:'隔離測試來源',academic_year:114,question_number:String(id),school:type==='school_exam_verified'?'成功高中':null,semester:1,exam:1,chineseMetadata:{}},
      question_text_links:[{text_id:'tao-taohuayuan',confidence:1,classification_status:'verified',relationship_type:'direct'},{text_id:'xunzi-quanxue',confidence:0.5,classification_status:'verified',relationship_type:'indirect'}],
      question_skills:[{skill:'meaning'}],question_group_items:[{question_groups:{group_id:'cloud-group',passage_id:'cloud-passage',passages:{passage_id:'cloud-passage',title:'隔離測試文章',body:'fixture shared passage',rights_status:'original',publication_status:'verified'}}}]});
     if(grade===2)return {data:[make(2001)]};
     const pending={...make(4),classification_status:'needs_review'};
     const hidden=make(5);hidden.question_group_items=[{question_groups:{group_id:'hidden',passage_id:'hidden',passages:null}}];
     hidden.learning_metadata.chineseMetadata={passage_id:'hidden',passage:{body:'must not bypass review'}};
     return {data:[make(1),make(2),make(3,'school_exam_verified'),pending,hidden]};
    })().then(resolve,reject);
   }};
  }})};
 });
 try{
  await page.goto(url);await page.waitForFunction(()=>document.getElementById('dbBadge').textContent==='Supabase 已連線');
  await page.selectOption('#subject','chinese');await page.waitForFunction(()=>document.getElementById('bankTotalN').textContent==='153');
  assert.equal(await page.evaluate(()=>window.ChineseLearning.all().filter(q=>q.origin==='cloud').length),3);
  assert.ok(await page.evaluate(()=>window.ChineseLearning.all().filter(q=>q.origin==='cloud').every(q=>q.chineseMetadata.passage_id==='cloud-passage'&&q.chineseMetadata.text_ids.length===1)));
  await page.locator('#subjectEntrances [data-open="historical"]').click();
  assert.match(await page.locator('#subjectHistorical h3').innerText(),/3 題/);
  await page.selectOption('#histSource','ceec');assert.equal(await page.locator('#subjectHistorical .card').count(),2);
  await page.selectOption('#histText','xunzi-quanxue');assert.equal(await page.locator('#subjectHistorical .card').count(),0);
  await page.selectOption('#histText','tao-taohuayuan');assert.equal(await page.locator('#subjectHistorical .card').count(),2);
  await page.selectOption('#histSource','school');assert.equal(await page.locator('#subjectHistorical .card').count(),1);
  await page.selectOption('#histSchool','建國中學');assert.equal(await page.locator('#subjectHistorical .card').count(),0);
  await page.selectOption('#histSchool','全部');await page.selectOption('#histSource','all');
  await page.selectOption('#histGrade','2');await page.waitForFunction(()=>document.getElementById('bankTotalN').textContent==='151');
  assert.equal(await page.locator('#subjectHistorical .card').count(),1);
  await page.locator('#historical [data-home]').click();
  await page.selectOption('#grade','1');await page.waitForFunction(()=>document.getElementById('bankTotalN').textContent==='153');
  // Clear old cloud rows synchronously, before the next grade's async result can arrive.
  assert.equal(await page.evaluate(()=>{const e=document.getElementById('grade');e.value='2';e.dispatchEvent(new Event('change',{bubbles:true}));return window.ChineseLearning.all().some(q=>q.origin==='cloud'&&q.grade===1);}),false);
  await page.selectOption('#grade','1');await page.waitForFunction(()=>document.getElementById('bankTotalN').textContent==='153');
  await page.locator('#subjectEntrances [data-open="classicalPanel"]').click();
  await page.locator('[data-text-id="tao-taohuayuan"]').check();await page.selectOption('#classicalSource','ceec');
  await page.locator('#startClassical').click();assert.equal(await page.locator('#quiz .qcard').count(),2);
  assert.equal(await page.locator('#quiz .readingPassage').count(),1);
  assert.match(await page.locator('#quiz .readingPassage').innerText(),/fixture shared passage/);
  await page.locator('#quiz .opt[data-q="1"]').filter({hasText:'fixture answer'}).click();
  await page.locator('#finishBtn').click();await page.locator('#finishBtn').click();
  assert.equal(await page.evaluate(()=>window.LearningProgress.summary('chinese').total),1);
  await page.locator('#quiz [data-dontknow-q="1"]').click();
  const queue=await page.evaluate(()=>JSON.parse(localStorage.studyQueue));
  assert.equal(queue.length,2);assert.equal(queue[0].question,'legacy math preserved');assert.equal(queue[1].subject,'chinese');
  await page.locator('#practice [data-home]').click();await page.locator('#subjectEntrances [data-open="wrong"]').click();
  await page.selectOption('#wrongSubject','all');assert.match(await page.locator('#wrongList').innerText(),/數學/);assert.match(await page.locator('#wrongList').innerText(),/國文/);
  await page.selectOption('#wrongSubject','math');assert.doesNotMatch(await page.locator('#wrongList').innerText(),/隔離測試國文題/);
  await page.locator('#wrong [data-home]').click();await page.locator('#subjectEntrances [data-open="learningAnalytics"]').click();
  assert.match(await page.locator('#subjectAnalytics').innerText(),/分類表現/);assert.match(await page.locator('#subjectAnalytics').innerText(),/文言文閱讀：100%（1次作答）/);
  await page.locator('#learningAnalytics [data-home]').click();
  await page.locator('#subjectEntrances [data-open="gsat"]').click();await page.locator('#gsat [data-home]').click();await page.selectOption('#subject','math');
  await page.locator('#home [data-open="gsat"]').filter({visible:true}).first().click();await page.waitForFunction(()=>document.getElementById('gsatList').textContent.includes('數學'));
  await page.waitForTimeout(300);assert.doesNotMatch(await page.locator('#gsatList').innerText(),/國文/);
  await page.locator('#gsat [data-home]').click();await page.locator('#home [data-open="sourceengineering"]').click();
  await page.locator('#sourceengineering [data-home]').click();await page.selectOption('#subject','chinese');
  await page.waitForFunction(()=>document.getElementById('bankTotalN').textContent==='153');
  await page.locator('#home [data-open="sourceengineering"]').click();await page.waitForTimeout(300);
  assert.match(await page.locator('#sourceInventorySummary').innerText(),/國文已驗證真題 3 題/);
  assert.doesNotMatch(await page.locator('#sourceInventoryList').innerText(),/delayed math source/);
  const requests=await page.evaluate(()=>window.fixtureQueries.filter(q=>q.table==='questions'&&q.filters.subject_id===88));
  assert.ok(requests.length>=2);assert.ok(requests.every(q=>[1,2].includes(q.filters.grade)&&q.filters.range));
  assert.deepEqual(errors,[]);
  console.log('PASS: V5 cloud fixture: reviewed passages, Chinese grade cache, source/text/school/grade history, same-ID subject isolation, idempotent mastery and stale source responses.');
 }finally{await page.close();}
};
