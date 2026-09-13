const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx={window:{},URL};vm.createContext(ctx);
for(const file of ['fallback-data.js','extra-questions-v4966.js','learning-catalog.js','grade2-questions.js','grade2-scopes.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const C=ctx.window.LearningCatalog,Q=ctx.window.GRADE2_QUESTIONS,F=ctx.window.V42_FALLBACK;
assert.equal(F.questions.length,250);
assert.equal(Q.length,420);
assert.equal(new Set(Q.map(q=>q.id)).size,420);
assert.equal(new Set(Q.map(q=>q.q)).size,420);
for(const q of Q){assert.equal(q.grade,2);assert.equal(new Set(q.o).size,4);assert.ok(q.a>=0&&q.a<4);assert.ok(q.id<0);assert.ok(q.e);}
let combinations=0;
for(const academicYear of [112,113,114])for(const course of C.courses)for(const school of C.schools)for(const semester of [1,2])for(const exam of [1,2,3]){
 const s={subjectId:'math',courseId:course.id,grade:2,school,academicYear,semester,exam};
 const scope=C.resolve(s),pool=C.pool(scope,[],Q);
 assert.ok(pool.length>=20,JSON.stringify(s));assert.equal(scope.academic_year,academicYear);
 for(const q of pool){assert.equal(q.semester,semester);assert.ok(scope.chapterIds.includes(q.chapterId));}
 // Reject another grade, semester, course, subject and cross-chapter dependencies.
 const q=pool[0];
 for(const bad of [{...q,grade:1},{...q,semester:3-semester},{...q,subjectId:'physics'},{...q,courseId:'math-b'},{...q,requiredChapterIds:['unknown']},{...q,isOriginal:false}])assert.equal(C.matchesQuestion(bad,scope),false);
 const other=C.resolve({...s,exam:exam===3?1:exam+1});
 if(scope.sourceType==='platform'&&other.sourceType==='platform')assert.equal(C.pool(other,[],pool).length,0);
 assert.equal(C.pool(scope,[q],pool).length,pool.length);
 combinations++;
}
const s={subjectId:'math',courseId:'math-108-g2-a',grade:2,school:'成功高中',academicYear:114,semester:1,exam:1};
const official={grade:2,subject:'數學',course_id:s.courseId,academic_year:114,term:1,exam_name:'第一次段考',source_type:'official',source_url:'https://school.example/scope',topic_weights:{'指數與對數函數':100}};
const adapted=C.adaptScope(official,s);
assert.equal(C.resolve(s,[adapted]).sourceType,'official');
assert.equal(C.pool(C.resolve(s,[adapted]),[],Q)[0].topic,'指數與對數函數');
for(const change of [{grade:1},{academic_year:113},{term:2},{course_id:'math-b'},{source_type:null},{source_url:'javascript:alert(1)'}])assert.equal(C.adaptScope({...official,...change},s),null);
const unknown=C.adaptScope({...official,topic_weights:{'指數':100}},s);
assert.equal(C.pool(C.resolve(s,[unknown]),[],Q).length,0,'partial chapter labels must not broaden scope');
assert.equal(C.adaptScope({...official,source_type:'inferred'},s).sourceType,'inferred');
const remote={id:99001,grade:2,subject:'數學',course_id:s.courseId,term:1,topic:'三角函數',is_original:true,question_text:'remote',options:['1','2','3','4'],correct_index:1,explanation:'test',difficulty:'基礎'};
assert.ok(C.adaptQuestion(remote));
assert.equal(C.adaptQuestion({...remote,grade:undefined}),null);
assert.equal(C.adaptQuestion({...remote,is_original:false}),null);
const subjects=[{id:77,code:'MATH',enabled:true},{id:2,code:'PHYS',enabled:true}];
const legacyCloud={...remote,subject:undefined,course_id:undefined,term:undefined,subject_id:77,curriculum_track:'AB'};
assert.ok(C.adaptQuestion(legacyCloud,subjects));
assert.equal(C.adaptQuestion({...legacyCloud,subject_id:2},subjects),null);
assert.equal(C.adaptQuestion({...legacyCloud,subject_id:99},subjects),null);
assert.equal(C.isLegacyMath({...legacyCloud,grade:1,subject_id:2},subjects),false);
assert.equal(C.adaptQuestion({...legacyCloud,topic:'空間與矩陣',subtopic:'不明'},subjects),null);
for(const [sub,key] of [['空間坐標','space-coordinates'],['空間向量','space-vector'],['矩陣運算','matrix']]){
 assert.equal(C.adaptQuestion({...legacyCloud,topic:'空間與矩陣',subtopic:sub},subjects).chapterId,`math-108-g2-a:${key}`);
}
assert.equal(C.scopes.length,432);
assert.equal(new Set(C.scopes.map(C.key)).size,432);
assert.ok(C.scopes.every(s=>[112,113,114].includes(s.academic_year)));
assert.equal(C.resolve({...s,academic_year:111}).chapterIds.length,0);
assert.equal(C.resolve({...s,school:'建國中學',academicYear:113}).sourceType,'official');
assert.equal(C.resolve({...s,school:'建國中學',academicYear:112}).sourceType,'platform');
assert.equal(C.resolve({...s,school:'建國中學',academicYear:114}).sourceType,'platform');
const counts=Q.reduce((a,q)=>{a[q.curriculumTrack]=(a[q.curriculumTrack]||0)+1;return a;},{});
assert.equal(counts.A,140);assert.equal(counts.AB,280);
for(const track of ['A','B','AB'])for(const q of Q)assert.equal(C.trackAllows(track,q.curriculumTrack),track==='A'||q.curriculumTrack==='AB');
for(const q of Q){
 const original=JSON.stringify(q);const positions=new Set();
 for(const random of [()=>0,()=>0.3,()=>0.6,()=>0.99]){
  const shuffled=C.shuffleOptions(q,random);positions.add(shuffled.a);
  assert.equal(shuffled.o[shuffled.a],q.o[q.a]);assert.equal(shuffled.optionOrder[shuffled.a],q.a);
  shuffled.o.forEach((o,i)=>assert.equal(o,q.o[shuffled.optionOrder[i]]));
 }
 assert.ok(positions.size>1);assert.equal(JSON.stringify(q),original);
}
// Independent numeric oracles check every generated correct answer (not answer-position assumptions).
for(const q of Q){
 const [_,chapter,template]=q.templateId.split(':').map((v,i)=>i?Number(v):v),n=q.parameters.n;
 const oracles=[
  [()=>Math.max(...[0,Math.PI/2,Math.PI,3*Math.PI/2].map(x=>(n+1)*Math.sin(x)+n+3)),()=>n+1,()=>n+n+2],
  [()=>2**3+n+2,()=>n+(n+8),()=>3*Math.log2((8*(n+5))/(n+5))],
  [()=>[n,2].reduce((sum,v,i)=>sum+v*[3,n+1][i],0),()=>-n*2,()=>Math.abs((n+2)*2-1)],
  [()=>[n,2,1].reduce((sum,v,i)=>sum+v*[2,1,n+1][i],0),()=>[3,4,n].reduce((sum,v)=>sum+v*v,0),()=>-(2+n*2)],
  [()=>2*n+3-n,()=>(3*n+1-1)/3,()=>Math.abs(n+5-2)],
  [()=>100,()=>n+4,()=>(n+2+3)-1],
  [()=>n+4,()=>[n,2].reduce((sum,v,i)=>sum+v*[2,3][i],0),()=>n+2*3]
 ];
 assert.ok(Math.abs(Number(q.o[q.a])-oracles[chapter][template-1]())<1e-9,q.templateId+':'+n);
}
console.log(`PASS: ${combinations} combinations, 420 answer/ID/options checks, isolation, provenance, fail-closed, cloud adapter, legacy 250.`);
