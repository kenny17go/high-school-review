const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');const storage=new Map([['v42_url','https://preserve.invalid'],['v42_key','test-key'],['wrong',JSON.stringify([{id:1,q:'old'}])],['studyQueue',JSON.stringify([{id:2,question:'old help'}])],['v42hist',JSON.stringify({實數:{ok:2,total:3}})]]);
const ls={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
const ctx={window:{localStorage:ls},URL,setTimeout,clearTimeout,console};vm.createContext(ctx);
for(const f of ['learning-catalog.js','subject-registry.js','classical-texts.js','learning-core.js','learning-storage.js','chinese-data.js','subject-adapters.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const W=ctx.window,C=W.LearningCore,D=W.ChineseData,A=W.ChineseLearning,R=W.SubjectRegistry,S=W.LearningProgress;
// Resume after a failed completion-marker write without replacing migrated progress.
const resumeRaw=new Map([
 ['wrong',JSON.stringify([{id:1,q:'old'},{id:2,q:'missing'}])],
 ['v42hist',JSON.stringify({algebra:{ok:1,total:2},geometry:{ok:1,total:1}})],
 ['v5_legacy_records',JSON.stringify({'math:1':{id:1,subject:'math',q:'preserved'}})],
 ['v5_legacy_math_analytics',JSON.stringify({algebra:{ok:4,total:5}})],
 ['v42_url','https://preserve.invalid'],['v42_key','test-key']
]);
const originals=new Map(resumeRaw);let interrupt=true;
const resume=W.LearningStorage.create({getItem:k=>resumeRaw.get(k)??null,setItem(k,v){if(k==='v5_migration'&&interrupt)throw Error('interrupted');resumeRaw.set(k,v);}});
assert.throws(()=>resume.migrate(),/interrupted/);assert.equal(resumeRaw.has('v5_migration'),false);
interrupt=false;resume.migrate();
assert.equal(resume.read('v5_legacy_records')['math:1'].q,'preserved');
assert.equal(resume.read('v5_legacy_records')['math:2'].q,'missing');
assert.equal(resume.read('v5_legacy_math_analytics').algebra.ok,4);
assert.equal(resume.read('v5_legacy_math_analytics').geometry.ok,1);
for(const k of ['wrong','v42hist','v42_url','v42_key'])assert.equal(resumeRaw.get(k),originals.get(k));
const completed=JSON.stringify([...resumeRaw]);resume.migrate();assert.equal(JSON.stringify([...resumeRaw]),completed);
const oldAttempts=JSON.stringify([{question_id:1,correct:true},{question_id:2,subjectId:'chinese',correct:false,category:'成語'}]);
const oldProgress=W.LearningStorage.create({getItem:k=>k==='v5_attempts'?oldAttempts:null,setItem(){throw Error('Reading progress must not rewrite storage');}});
assert.equal(oldProgress.summary('math').total,1);assert.equal(oldProgress.summary('chinese',null,null,'成語').total,1);
assert.equal(oldProgress.summary('chinese','missing-text','meaning').total,0);
assert.equal(W.ClassicalTexts.length,30);assert.equal(W.ClassicalTexts.filter(t=>t.group==='core15').length,15);assert.equal(new Set(W.ClassicalTexts.map(t=>t.text_id)).size,30);
assert.equal(R.enabled().length,2);assert.equal(R.get('physics').enabled,false);assert.equal(R.get('chinese').examMapping.length,288);
assert.equal(D.questions.length,150);assert.equal(new Set(D.questions.map(q=>q.id)).size,150);
for(const q of D.questions){assert.deepEqual(Array.from(C.errors(q)),[],String(q.id));assert.equal(q.sourceType,'platform_simulated');assert.equal(C.isVerified(q),false);assert.ok(q.explanation.length>12);assert.ok(q.chineseMetadata.text_ids.every(id=>W.ClassicalTexts.some(t=>t.text_id===id)));}
for(const g of D.question_groups){assert.ok(D.passages.some(p=>p.passage_id===g.passage_id));assert.ok(g.question_ids.every(id=>D.questions.find(q=>q.id===id).chineseMetadata.passage_id===g.passage_id));}
for(const s of R.get('chinese').examMapping){const pool=A.pool({...s,academicYear:s.academic_year});assert.ok(pool.length>0);assert.ok(pool.every(q=>q.subject==='chinese'));assert.ok(pool.filter(q=>q.unit==='classical').every(q=>C.textLinks(q,D.question_text_links).some(l=>s.lessons.includes(l.text_id))));}
for(const text of W.ClassicalTexts){assert.ok(C.filter(D.questions,{textIds:[text.text_id]},D.question_text_links).length>=3);assert.equal(C.coverage(D.questions,D.question_text_links,text.text_id).ceec,0);}
const q=D.questions[0],before=[...storage.entries()];S.migrate();assert.equal(storage.get('v42_key'),'test-key');assert.equal(storage.get('wrong'),before.find(([k])=>k==='wrong')[1]);assert.ok(S.wrong().every(q=>q.subject==='math'));
S.record([q],{[q.id]:q.a},'one','practice');S.record([q],{[q.id]:q.a},'one','practice');assert.equal(S.summary('chinese').total,1);assert.equal(S.summary('chinese').percent,100);assert.equal(S.summary('math').total,0);
S.help(q,'我不會');assert.ok(S.weak(q));assert.equal(C.filter(D.questions,{source:'ceec'},D.question_text_links).length,0);
const real=C.normalize({...q,id:500,sourceType:'ceec_official',source_url:'https://www.ceec.edu.tw/example',source_title:'test fixture',academic_year:114,question_number:'1',classification_status:'needs_review',verified_at:null});assert.equal(C.isVerified(real),false);assert.equal(C.filter([real],{source:'ceec'},D.question_text_links).length,0);
real.classification_status='verified';real.verified_at='2026-09-14';assert.ok(C.isVerified(real));assert.equal(real.sourceType,'ceec_official');
for(const academic_year of ['unknown',null,0,114.5])assert.equal(C.isVerified({...real,academic_year}),false);
assert.equal(C.isVerified({...real,academic_year:'114'}),true);
const mult=D.questions.find(q=>q.chineseMetadata.text_ids.length>1);assert.ok(mult);for(const id of mult.chineseMetadata.text_ids)assert.ok(C.filter([mult],{textIds:[id]},D.question_text_links).length);
const school={...real,sourceType:'school_exam_verified',school:null};assert.ok(C.errors(school).includes('school'));
// Common renderer contract supports all current answer families without source-specific schemas.
const fixtures=[
 C.normalize({...q,id:'fx-single',questionType:'single_choice',options:['A','B'],answer:1,explanation:'fixture',sourceType:'platform_simulated'}),
 C.normalize({...q,id:'fx-multi',questionType:'multiple_choice',options:['A','B','C'],answer:[0,2],explanation:'fixture',sourceType:'platform_simulated'}),
 C.normalize({...q,id:'fx-blank',questionType:'fill_blank',options:undefined,answer:['3','5','2'],explanation:'fixture',sourceType:'platform_simulated'}),
 C.normalize({...q,id:'fx-num',questionType:'numeric',options:undefined,answer:1.5,explanation:'fixture',sourceType:'platform_simulated'}),
 C.normalize({...q,id:'fx-short',questionType:'short_answer',options:undefined,answer:{reference:'x-y-z=-1'},explanation:'fixture',sourceType:'platform_simulated'})
];
for(const x of fixtures)assert.deepEqual(Array.from(C.errors(x)),[],x.id);
assert.equal(C.equalAnswer(fixtures[0],1),true);assert.equal(C.equalAnswer(fixtures[0],0),false);
assert.equal(C.equalAnswer(fixtures[1],[2,0]),true);assert.equal(C.equalAnswer(fixtures[1],[0,1]),false);
assert.equal(C.equalAnswer(fixtures[2],['3','5','2']),true);assert.equal(C.equalAnswer(fixtures[2],['3','5']),false);
assert.equal(C.equalAnswer(fixtures[3],'1.5'),true);
assert.equal(C.equalAnswer(fixtures[4],'student reasoning'),null);
assert.equal(C.formatAnswer(fixtures[1]),'A、C');assert.equal(C.formatAnswer(fixtures[2]),'3、5、2');
const mixedStore=W.LearningStorage.create({getItem(){return null},setItem(k,v){this[k]=v;}});
console.log('PASS: V5 30 texts, 150 original questions, 288 exam mappings, many-to-many, provenance, migration, isolated analytics.');
(async()=>{
 let calls=0;const rows=await C.paged(()=>({range(from,to){calls++;return Promise.resolve({data:Array.from({length:Math.min(500,1201-from)},(_,i)=>({id:from+i})),error:null});}}));assert.equal(rows.length,1201);assert.equal(calls,3);
 const {prepare,verify,publish}=await import('../scripts/import-sources.mjs');
 const prepared=prepare([{id:1,source_url:'https://www.ceec.edu.tw/test',source_title:'fixture only',sourceType:'ceec_official',stem:'fixture',academic_year:114,question_number:'1',answer_available:false}]);
 assert.equal(prepared[0].classification_status,'needs_review');assert.throws(()=>publish(prepared));assert.throws(()=>verify(prepared[0],{}));
 const verified=verify(prepared[0],{reviewer:'test only',evidence:'fixture review',rights_confirmed:true,source_confirmed:true,text_links:[{text_id:'a',relationship_type:'comparison',evidence:'fixture A'},{text_id:'b',relationship_type:'comparison',evidence:'fixture B'}]});assert.equal(publish([verified])[0].text_links.length,2);
 assert.throws(()=>prepare([{id:2,source_url:'https://www.ceec.edu.tw/test',sourceType:'ceec_official',generated:true}]));
 const review={reviewer:'test only',evidence:'fixture review',rights_confirmed:true,source_confirmed:true};
 assert.ok(verified.text_links.every(l=>l.verified_at===verified.verified_at));
 assert.throws(()=>publish([{...verified,reviewer:null}]));
 assert.throws(()=>publish([{...verified,sourceType:'unknown'}]));
 assert.throws(()=>publish([{...verified,text_links:[{...verified.text_links[0],verified_at:null}]}]));
 const answered={...prepared[0],answer_available:true,answer:0,options:['A','B'],explanation:'Fixture explanation'};
 assert.equal(verify(answered,review).classification_status,'verified');
 for(const invalid of [
  {...answered,options:undefined}, {...answered,options:'AB'},
  {...answered,options:['A','A']}, {...answered,options:['A']},
  {...answered,explanation:''}, {...answered,answer:2},
  {...answered,academic_year:'unknown'}, {...answered,academic_year:109},
  {...answered,source_url:'javascript:alert(1)'}, {...answered,sourceType:'invented'}
 ])assert.throws(()=>verify(invalid,review),'Invalid candidate must remain unverified');
 console.log('PASS: 1201-row pagination and review-gated source pipeline.');
})().catch(e=>{console.error(e);process.exitCode=1;});
