import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const version=JSON.parse(read('version.json'));
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.displayVersion,version.version);
assert.equal(pkg.version,version.version==='5.0'?'5.0.0':version.version.replace(/\.(\d+)$/, '-$1'));
const html=read('index.html');
assert.ok(html.includes(`V${version.version} ${version.name}`));
assert.ok(read('app.js').includes(`window.V500_BUILD="${version.build}"`),'build marker');
for(const file of ['subject-registry.js','classical-texts.js','learning-core.js','learning-storage.js','subject-adapters.js','app.js'])assert.ok(html.includes(`${file}?v=${version.build}"`),`${file} cache version`);
assert.ok(read('subject-adapters.js').includes(`chinese-data.js?v=${version.build}'`),'lazy bank cache version');
assert.ok(html.includes(`gsat-115-chinese-unified-bank.js?v=${version.build}`),'115 Chinese runtime cache version');
assert.ok(read('app.js').includes('官方 PDF 連結模式')&&read('app.js').includes('平台詳解待審閱'),'Chinese PDF-link disclosure');
assert.ok(html.includes('id="practiceVariant"')&&html.includes('id="topicChoices"')&&!html.includes('<select id="topicFilter"'),'exam variant and multi-topic filters');
for(const file of ['AGENTS.md','DEPLOY.md','CHANGELOG.md','config.js','fallback-data.js','grade2-questions.js','learning-catalog.js','grade2-scopes.js'])assert.ok(fs.existsSync(path.join(root,file)),file);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'duplicate HTML IDs');
for(const id of ['grade','curriculumTrack','school','year','term','exam','quiz','mockQuiz','currentScope','historical','coverage','sourceengineering','gsat'])assert.ok(ids.includes(id),id);
const stack=[],voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const markup=html.replace(/<!--[^]*?-->/g,'').replace(/(<style[^>]*>)[^]*?(<\/style>)/gi,'$1$2').replace(/(<script[^>]*>)[^]*?(<\/script>)/gi,'$1$2');
for(const match of markup.matchAll(/<(\/?)\s*([a-z][a-z0-9]*)\b[^>]*>/gi)){
 const tag=match[2].toLowerCase();if(voids.has(tag))continue;
 if(match[1])assert.equal(stack.pop(),tag,`HTML nesting: ${tag}`);else stack.push(tag);
}
assert.equal(stack.length,0,'unclosed HTML');
const scripts=[...html.matchAll(/<script\s+src="([^"?]+)(?:\?[^"]*)?"/g)].map(m=>m[1]);
for(const file of [...scripts,'chinese-data.js','tests/routing.test.cjs','tests/browser.test.cjs','tests/live-readonly.mjs','tests/v5-data.test.cjs','tests/v5-browser.cjs','tests/v5-cloud-browser.cjs','tests/migration.test.mjs','scripts/import-sources.mjs','scripts/validate.mjs']){
 const r=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});
 if(r.error)throw r.error;assert.equal(r.status,0,r.stderr);
}
const app=read('app.js');
assert.ok(!/localStorage\.clear\s*\(/.test(app));
assert.ok(!/removeItem\(["']v42_(url|key)["']\)/.test(app));
assert.ok(app.includes('catalog.shuffleOptions'));
assert.ok(app.includes('q.optionOrder?.[ans[q.id]]'));
const r=spawnSync(process.execPath,[path.join(root,'tests/routing.test.cjs')],{encoding:'utf8'});
if(r.error)throw r.error;process.stdout.write(r.stdout);assert.equal(r.status,0,r.stderr);
console.log(`PASS: ${scripts.length} browser scripts, HTML structure/${ids.length} unique IDs, version consistency and settings guards.`);
