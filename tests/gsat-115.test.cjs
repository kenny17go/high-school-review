const fs=require("fs"),vm=require("vm"),assert=require("assert/strict");
const ctx={window:{}};vm.createContext(ctx);
for(const f of ["gsat-115-ready-data.js","gsat-115-unified-bank.js","gsat-115-engine.js"])vm.runInContext(fs.readFileSync(f,"utf8"),ctx,{filename:f});
const bank=ctx.window.GSAT115_READY,unified=ctx.window.GSAT_UNIFIED_BANK_115_MATHA,engine=ctx.window.GSAT115Engine,q=n=>bank.questions.find(x=>x.n===n);
assert.equal(bank.questions.length,20);assert.equal(bank.questions.reduce((s,x)=>s+x.points,0),100);
assert.equal(new Set(bank.questions.map(x=>x.n)).size,20);
assert.equal(engine.grade(q(1),1).score,5);assert.equal(engine.grade(q(7),[2,3]).score,5);assert.equal(engine.grade(q(7),[2]).score,3);
assert.equal(engine.grade(q(13),["9","1","0"]).score,5);assert.equal(engine.grade(q(18),2).score,3);assert.equal(engine.grade(q(19),"x-y-z=-1").status,"manual_required");
assert.equal(q(18).groupId,q(19).groupId);assert.equal(q(19).groupId,q(20).groupId);
assert.equal(unified.questions.length,20);assert.equal(unified.questions.reduce((s,x)=>s+x.points,0),100);
assert.equal(new Set(unified.questions.map(x=>x.question_number)).size,20);
for(const x of unified.questions){assert.ok(x.primary_unit);assert.ok(x.secondary_concepts.length);assert.ok(x.skill_tags.length);assert.ok(x.source_url.includes("ceec.edu.tw"));assert.ok(x.explanation.concept);assert.ok(x.explanation.key_insight);assert.ok(x.explanation.solution);assert.ok(x.explanation.common_errors);}
assert.deepEqual(Array.from(unified.questions.filter(x=>x.classification_status==="needs_review"),x=>x.question_number),[5,8,10,11,12]);
assert.equal(unified.questions.find(x=>x.question_number===20).answer.reference,"volume=30; maxDistance=sqrt(94)");
console.log("GSAT 115 Math A unified bank PASS");

// Unified runtime bridge: official questions must join the same question-bank contract.
context.window=context;
vm.runInContext(fs.readFileSync(path.join(root,'unified-question-bank.js'),'utf8'),context);
const runtime=context.UnifiedQuestionBank;
assert(runtime,'UnifiedQuestionBank runtime should exist');
assert(runtime.questions.length>=6,'first integration batch should expose playable CEEC questions');
assert(runtime.questions.every(q=>q.sourceType==='ceec_official'&&q.stem&&Array.isArray(q.options)&&q.explanation),'runtime questions need common renderer fields');
assert(runtime.filter({sourceType:'ceec_official',academic_year:115}).length===runtime.questions.length,'source/year filters should operate on the common bank');
