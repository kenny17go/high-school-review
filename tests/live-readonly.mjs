import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
export async function runLiveAudit({url,key}){
 assert.ok(url&&key,'Provide a Supabase URL and publishable key; never use a service role key.');
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const ctx={window:{},URL};vm.createContext(ctx);
 for(const file of ['learning-catalog.js','grade2-questions.js','grade2-scopes.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 const data={};
 await Promise.all(['subjects','schools','questions','exam_scope_profiles'].map(async table=>{
  const response=await fetch(`${url}/rest/v1/${table}?select=*`,{method:'GET',headers:{apikey:key},signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,200,`${table} read failed`);data[table]=await response.json();
 }));
 const C=ctx.window.LearningCatalog;
 const raw=data.questions.filter(q=>q.grade===2&&C.isMath(q,data.subjects));
 const adapted=raw.map(q=>C.adaptQuestion(q,data.subjects)).filter(Boolean);
 assert.equal(adapted.length,raw.length,'Cloud questions rejected: inspect schema or unknown topic before release');
 const counts=rows=>rows.reduce((a,q)=>{const t=q.curriculumTrack||q.curriculum_track;a[t]=(a[t]||0)+1;return a;},{});
 const available={};
 for(const track of ['A','B','AB'])available[track]=adapted.filter(q=>C.trackAllows(track,q.curriculumTrack)).length;
 let combinations=0;
 for(const s of C.scopes){
  const scope=C.resolve(s),pool=C.pool(scope,adapted,ctx.window.GRADE2_QUESTIONS);
  assert.ok(pool.length);assert.ok(pool.every(q=>C.matchesQuestion(q,scope)));combinations++;
 }
 return {schools:data.schools.length,cloudGrade1:data.questions.filter(q=>C.isLegacyMath(q,data.subjects)).length,
  cloudGrade2:raw.length,accepted:adapted.length,cloudTracks:counts(adapted),available,
  localTracks:counts(ctx.window.GRADE2_QUESTIONS),grade2ScopeRows:data.exam_scope_profiles.filter(s=>s.grade===2).length,combinations,readOnly:true};
}
if(typeof process!=="undefined"&&process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 console.log(await runLiveAudit({url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY}));
}
