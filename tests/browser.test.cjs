// Run with Playwright installed/resolvable (NODE_PATH may point to a bundled runtime).
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
let playwright;
try{playwright=require('playwright');}catch{playwright=require(path.resolve(path.dirname(process.execPath),'../node_modules/playwright'));}
const {chromium}=playwright;
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,channel:process.env.TEST_BROWSER_CHANNEL||'msedge'});
 try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**',route=>route.abort());
 await page.goto(url);await page.waitForTimeout(500);
 assert.deepEqual(errors,[],'startup errors');
 assert.equal(await page.locator('#school option').count(),8);
 assert.equal(await page.locator('#bankTotalN').innerText(),'250');
 assert.equal(await page.locator('#curriculumTrackField').isVisible(),false);
 const duplicateIds=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);});
 assert.deepEqual(duplicateIds,[]);
 assert.equal(await page.locator('#home #learningDataCard').count(),1);
 await page.locator('#home button[data-open="practice"]:not([data-subject-mode])').click();
 assert.equal(await page.locator('#quiz .qcard').count(),20);
 await page.locator('#quiz .opt').filter({visible:true}).first().click();
 await page.locator('#finishBtn').click();
 assert.match(await page.locator('#result').innerText(),/已作答 1 題/);
 await page.locator('#quiz [data-dontknow-q]').filter({visible:true}).first().click();
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.studyQueue).length)>0);
 await page.locator('#practice [data-home]').click();
 assert.equal(await page.locator('#doneN').innerText(),'1');
 await page.locator('#home button[data-open="mock"]:not([data-subject-mode])').click();await page.locator('#startMock').click();
 assert.equal(await page.locator('#mockQuiz .qcard').count(),20);
 await page.locator('#mockQuiz .opt').filter({visible:true}).first().click();await page.locator('#submitMock').click();
 assert.match(await page.locator('#mockResult').innerText(),/已作答 1 題/);
 await page.locator('#mock [data-home]').click();
 // Exercise actual DOM listeners across all years and tracks.
 await page.selectOption('#grade','2');
 for(const year of [112,113,114]){
  const checked=await page.evaluate(year=>{
   const C=window.LearningCatalog,$=id=>document.getElementById(id);
   const change=(id,value)=>{$(id).value=String(value);$(id).dispatchEvent(new Event('change',{bubbles:true}));};
   let count=0;
   for(const s of C.scopes.filter(s=>s.academic_year===year)){
    change('year',year);change('curriculumTrack',s.curriculumTrack);change('school',s.school);
    change('term',s.semester===1?'上學期':'下學期');change('exam',['第一次段考','第二次段考','第三次段考／期末'][s.exam-1]);
    const scope=C.resolve(s),expected=Math.min(20,C.pool(scope,[],window.GRADE2_QUESTIONS).length);
    if(!$('currentScope').textContent.includes(scope.label))throw Error('Displayed scope mismatch');
    for(const mode of ['practice','mock']){
     document.querySelector('#home [data-open="'+mode+'"]').click();
     if(mode==='mock')$('startMock').click();
     const cards=[...document.querySelectorAll(mode==='practice'?'#quiz .qcard':'#mockQuiz .qcard')];
     if(cards.length!==expected||!expected)throw Error('Question count '+C.key(s));
     for(const card of cards){
      const opt=card.querySelector('.opt'),q=window.GRADE2_QUESTIONS.find(q=>q.id===+opt.dataset.q);
      if(!C.matchesQuestion(q,scope))throw Error('Out of scope '+C.key(s));
      const correct=[...card.querySelectorAll('.opt')].find(e=>e.textContent.slice(3)===q.o[q.a]);
      if(!correct)throw Error('Shuffled correct text missing');
      if(mode==='practice'){correct.click();if(!correct.classList.contains('correct'))throw Error('Shuffled answer index mismatch');}
     }
     document.querySelector('#'+mode+' [data-home]').click();
    }
    count++;
   }
   return count;
  },year);
  assert.equal(checked,144);console.log('PASS: '+year+', 144 browser practice/mock combinations and shuffled grading.');
 }
 await page.locator('#home button[data-open="practice"]:not([data-subject-mode])').click();
 await page.locator('#quiz .opt').filter({visible:true}).first().click();await page.locator('#quiz [data-dontknow-q]').filter({visible:true}).first().click();await page.locator('#finishBtn').click();
 assert.match(await page.locator('#result').innerText(),/已作答 1 題/);
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.studyQueue).some(x=>x.grade===2)));
 await page.locator('#practice [data-home]').click();
 await page.locator('#home button[data-open="mock"]:not([data-subject-mode])').click();await page.locator('#startMock').click();
 await page.locator('#mockQuiz .opt').filter({visible:true}).first().click();await page.locator('#mockQuiz [data-mock-dk]').filter({visible:true}).first().click();await page.locator('#submitMock').click();
 assert.match(await page.locator('#mockResult').innerText(),/已作答 1 題/);
 assert.equal(await page.locator('#mockQuiz .explain.show').count(),20);
 await page.locator('#mock [data-home]').click();
 await page.locator('#home [data-open="study"]').click();await page.locator('#dontKnow').click();
 assert.match(await page.locator('#studyExplain').innerText(),/完整詳解/);
 await page.locator('#study [data-home]').click();
 for(const panel of ['sources','sourceengineering','historical','gsat','weak','coverage']){
  await page.locator(`#home [data-open="${panel}"]`).filter({visible:true}).first().click();
  assert.ok(await page.locator(`#${panel}`).evaluate(e=>e.classList.contains('active')));
  await page.locator(`#${panel} [data-home]`).click();
 }
 await page.locator('footer [data-open="wrong"]').click();assert.ok(await page.locator('#wrongList .qcard').count()>0);await page.locator('#wrong [data-home]').click();
 await page.evaluate(()=>{localStorage.setItem('v42_url','https://test.invalid');localStorage.setItem('v42_key','test-publishable-key');});
 await page.locator('#settingsBtn').click();assert.equal(await page.inputValue('#urlInput'),'https://test.invalid');await page.locator('#localBtn').click();
 assert.deepEqual(await page.evaluate(()=>[localStorage.v42_url,localStorage.v42_key]),['https://test.invalid','test-publishable-key']);
 await page.selectOption('#year','111');
 await page.locator('#home button[data-open="practice"]:not([data-subject-mode])').click();assert.equal(await page.locator('#quiz .qcard').count(),0);
 assert.match(await page.locator('#countText').innerText(),/尚未建立範圍/);
 await page.locator('#practice [data-home]').click();
 await page.locator('#home button[data-open="mock"]:not([data-subject-mode])').click();await page.locator('#startMock').click();
 assert.equal(await page.locator('#mockQuiz .qcard').count(),0);
 await page.locator('#mock [data-home]').click();await page.selectOption('#year','114');
 await page.selectOption('#grade','1');assert.equal(await page.locator('#bankTotalN').innerText(),'250');
 assert.deepEqual(errors,[],'interaction errors');
 // Phone layout without touching existing icons or manifest.
 await page.setViewportSize({width:390,height:844});await page.selectOption('#grade','2');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 console.log('PASS: browser offline, 432×practice/mock, grading, help, study, source panels, stats, settings, 390px layout.');
 await page.close();
 // Controlled Supabase double: validates real app query filters, not real credentials/RLS.
 const cloud=await browser.newPage();const cloudErrors=[];
 cloud.on('pageerror',e=>cloudErrors.push(e.message));
 await cloud.addInitScript(()=>{
  localStorage.setItem('v42_url','https://test.invalid');localStorage.setItem('v42_key','fake-key');
  window.testQueries=[];window.testWrites=[];
  window.supabase={createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'test-user',email:'test@example.invalid'}}}),signOut:async()=>({}),signInWithOtp:async()=>({})},from:table=>{
   const filters={};let mode='select';let write;
   const query={select(){return this;},order(){return this;},limit(){return this;},range(from,to){filters.range=[from,to];return this;},or(value){filters.or=value;return this;},eq(k,v){filters[k]=v;return this;},gte(){return this;},maybeSingle(){return this;},insert(v){mode='insert';write=v;return this;},update(v){mode='update';write=v;return this;},then(resolve,reject){
    const run=async()=>{
     window.testQueries.push({table,filters:{...filters},mode});
     if(mode!=='select'){window.testWrites.push({table,write});return {data:null,error:null};}
     if(table==='schools')return {data:filters.name?{id:1}:[{id:1,name:'成功高中',official_url:'https://school.example'}],error:null};
     if(table==='subjects')return {data:[{id:77,code:'MATH',name:'數學',enabled:true}],error:null};
     if(table==='questions')return {data:[{id:99001,grade:2,subject_id:77,curriculum_track:'A',question_type:'single_choice',topic:'指數與對數函數',difficulty:'基礎',is_original:true,question_text:'雲端模擬函數題',options:['0','1','2','3'],correct_index:0,explanation:'測試雲端題適配。'}],error:null};
     if(table==='exam_scope_profiles'){
      const first=filters.exam_name==='第一次段考';
      await new Promise(r=>setTimeout(r,first?220:20));
      return {data:[{grade:filters.grade,subject:'數學',course_id:'math-108-g2-a',academic_year:filters.academic_year,term:filters.term,exam_name:filters.exam_name,source_type:first?'official':'inferred',source_url:'https://school.example/scope',topic_weights:{[first?'指數與對數函數':'平面向量']:100}}],error:null};
     }
     if(table==='national_exam_sources')return {data:[{academic_year:109,exam_type:'GSAT',subject_variant:'數學',source_url:'https://old.example'},{academic_year:114,exam_type:'GSAT',subject_variant:'數學A',source_url:'https://new.example'}],error:null};
     return {data:[],error:null};
    };return run().then(resolve,reject);
   }};return query;
  }})};
 });
 await cloud.goto(url);await cloud.waitForFunction(()=>document.getElementById('dbBadge').textContent==='Supabase 已連線');
 assert.equal(await cloud.locator('#school option').count(),8,'cloud must not remove local schools');
 assert.equal(await cloud.locator('#bankTotalN').innerText(),'250','cloud grade 2 must not enter grade 1');
 await cloud.selectOption('#grade','2');
 await cloud.waitForFunction(()=>document.getElementById('bankTotalN').textContent==='421');
 await cloud.waitForFunction(()=>document.getElementById('currentScope').textContent.includes('官方範圍 ✓'));
 assert.match(await cloud.locator('#currentScope').innerText(),/指數與對數函數/);
 await cloud.locator('#home button[data-open="practice"]:not([data-subject-mode])').click();
 assert.equal(await cloud.locator('#quiz .qcard').count(),20);
 assert.ok((await cloud.locator('#quiz .qtitle .tag:first-child').allTextContents()).every(t=>t==='指數與對數函數'));
 await cloud.evaluate(()=>document.getElementById('qtyFilter').add(new Option('測試全部','100')));await cloud.selectOption('#qtyFilter','100');await cloud.locator('#applyFilter').click();
 const cloudAnswer=cloud.locator('#quiz .opt[data-q="99001"]').filter({hasText:/^[A-D]\. 0$/});
 await cloudAnswer.click();await cloud.locator('#finishBtn').click();
 await cloud.waitForFunction(()=>window.testWrites.some(w=>w.table==='attempts'));
 assert.ok(await cloud.evaluate(()=>window.testWrites.some(w=>w.table==='attempts'&&w.write.some(r=>r.question_id===99001&&r.selected_index===0&&r.is_correct))), 'Cloud writes must use original answer index');
 assert.ok(await cloud.evaluate(()=>window.testWrites.every(w=>!JSON.stringify(w.write).includes('"question_id":-'))),'no local IDs sent to SQL');
 await cloud.locator('#practice [data-home]').click();
 // Request A then request B: delayed A must not replace B.
 await cloud.selectOption('#school','松山高中');await cloud.selectOption('#exam','第二次段考');
 await cloud.waitForFunction(()=>document.getElementById('currentScope').textContent.includes('歷屆題目推定'));
 await cloud.waitForTimeout(350);
 assert.match(await cloud.locator('#currentScope').innerText(),/平面向量/);
 assert.doesNotMatch(await cloud.locator('#currentScope').innerText(),/官方範圍 ✓/);
 await cloud.locator('#home button[data-open="mock"]:not([data-subject-mode])').click();await cloud.locator('#startMock').click();
 const mockInferred=await cloud.evaluate(()=>[...document.querySelectorAll('#mockQuiz [data-mock-dk]')].every(e=>window.GRADE2_QUESTIONS.find(q=>q.id===+e.dataset.mockDk)?.topic==='平面向量'));
 assert.ok(mockInferred);await cloud.locator('#mock [data-home]').click();
 await cloud.locator('#home [data-open="gsat"]').filter({visible:true}).first().click();await cloud.waitForFunction(()=>document.getElementById('gsatStatus').textContent.includes('找到'));
 assert.match(await cloud.locator('#gsatList').innerText(),/114/);assert.doesNotMatch(await cloud.locator('#gsatList').innerText(),/109/);
 await cloud.locator('#gsat [data-home]').click();
 // Local mode invalidates an in-flight remote scope and preserves credentials.
 await cloud.selectOption('#school','北一女中');await cloud.selectOption('#exam','第一次段考');
 await cloud.locator('#settingsBtn').click();await cloud.locator('#localBtn').click();await cloud.waitForTimeout(350);
 assert.match(await cloud.locator('#currentScope').innerText(),/平台模擬範圍/);
 assert.match(await cloud.locator('#currentScope').innerText(),/三角函數/);
 assert.deepEqual(await cloud.evaluate(()=>[localStorage.v42_url,localStorage.v42_key]),['https://test.invalid','fake-key']);
 const queries=await cloud.evaluate(()=>window.testQueries.filter(q=>q.table==='exam_scope_profiles'&&q.filters.grade===2));
 assert.ok(queries.length>=3);assert.ok(queries.every(q=>q.filters.subject==='數學'&&q.filters.academic_year===114&&q.filters.school_id===1&&q.filters.term===1&&q.filters.exam_name));
 const questionQueries=await cloud.evaluate(()=>window.testQueries.filter(q=>q.table==='questions'));
 assert.ok(questionQueries.length>=2);
 assert.ok(questionQueries.every(q=>[1,2].includes(q.filters.grade)&&q.filters.range&&(q.filters.subject_id===77||q.filters.or?.includes('subject_id.eq.77'))),'Only selected subject and grade may be paged');
 assert.deepEqual(cloudErrors,[]);
 console.log('PASS: simulated Supabase filters, official/inferred override, school preservation, grade separation, stale responses, local settings, GSAT cutoff.');
 await cloud.close();
 await require('./v5-browser.cjs')({browser,url});
 await require('./v5-cloud-browser.cjs')({browser,url});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
