import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Deliberately no crawler or automatic publish. Inputs are saved candidate metadata.
const types=new Set(['ceec_official','school_official','school_exam_verified','platform_simulated','platform_generated','unknown']);
const schools=['建國中學','北一女中','師大附中','成功高中','中山女高','松山高中','延平高中','薇閣高中'];
export function prepare(candidates){
 const seen=new Set();return candidates.map(c=>{
  if(!c.id||seen.has(c.id))throw Error('Candidate id missing/duplicate');seen.add(c.id);
  const url=new URL(c.source_url);if(!['https:','http:'].includes(url.protocol))throw Error('Unsafe source URL');
  const sourceType=types.has(c.sourceType)?c.sourceType:'unknown';
  if(c.generated&&['ceec_official','school_official','school_exam_verified'].includes(sourceType))throw Error('Generated item cannot be a real examination');
  return {...c,sourceType,source_url:url.href,answer_available:c.answer_available===true,classification_status:c.stem?'needs_review':'unclassified',classification_method:'metadata',text_links:[],verified_at:null,published:false,pipeline_stage:'normalize',notes:[...(c.notes||[]),'篇名或搜尋命中不構成文本關聯證據。']};
 });
}
function validateCandidate(candidate){
 if(!types.has(candidate.sourceType)||candidate.sourceType==='unknown')throw Error('Unknown provenance cannot be verified');
 if(candidate.generated&&!candidate.sourceType.startsWith('platform_'))throw Error('Generated question cannot be official');
 if(!candidate.id||!candidate.source_title||!candidate.stem||!candidate.question_number||!candidate.academic_year||typeof candidate.answer_available!=='boolean')throw Error('Question metadata incomplete');
 if(!Number.isInteger(Number(candidate.academic_year))||Number(candidate.academic_year)<=0)throw Error('Academic year invalid');
 const url=new URL(candidate.source_url);if(!['https:','http:'].includes(url.protocol))throw Error('Unsafe source URL');
 const host=url.hostname;
 if(candidate.sourceType==='ceec_official'&&(candidate.academic_year<110||(host!=='ceec.edu.tw'&&!host.endsWith('.ceec.edu.tw'))))throw Error('CEEC provenance invalid');
 if(candidate.sourceType.startsWith('school_')&&!schools.includes(candidate.school))throw Error('School metadata missing');
 if(candidate.answer_available&&(!Array.isArray(candidate.options)||candidate.options.length<2||new Set(candidate.options).size!==candidate.options.length||!candidate.explanation||!Number.isInteger(candidate.answer)||candidate.answer<0||candidate.answer>=candidate.options.length))throw Error('Answer invalid');
}
export function verify(candidate,review){
 if(!review?.reviewer||!review.evidence||review.rights_confirmed!==true||review.source_confirmed!==true)throw Error('Explicit source, rights and reviewer evidence required');
 validateCandidate(candidate);
 const verifiedAt=new Date().toISOString();
 const links=(review.text_links||[]).map(l=>{if(!l.text_id||!['direct','indirect','comparison','extended'].includes(l.relationship_type)||!l.evidence)throw Error('Link needs independent evidence');return {...l,question_id:candidate.id,confidence:1,classification_status:'verified',classification_method:'manual',verified_at:verifiedAt};});
 return {...candidate,text_links:links,skills:review.skills||[],classification_status:'verified',classification_method:'manual',verified_at:verifiedAt,reviewer:review.reviewer,review_evidence:review.evidence,rights_confirmed:true,source_confirmed:true,pipeline_stage:'verify'};
}
export function publish(rows){
 if(rows.some(r=>r.classification_status!=='verified'||!r.verified_at||!r.reviewer||!r.review_evidence||r.rights_confirmed!==true||r.source_confirmed!==true))throw Error('Review gate: pending items cannot be published');
 return rows.map(r=>{
  validateCandidate(r);
  if((r.text_links||[]).some(l=>l.question_id!==r.id||l.classification_status!=='verified'||!l.verified_at||!l.evidence||!l.text_id||!['direct','indirect','comparison','extended'].includes(l.relationship_type)||!(l.confidence>=0.9&&l.confidence<=1)))throw Error('Review gate: text link incomplete');
  return {...r,published:true,pipeline_stage:'publish'};
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Usage: node scripts/import-sources.mjs candidates.json output-needs-review.json');
 if(path.resolve(input)===path.resolve(output))throw Error('Keep original candidates intact');
 fs.writeFileSync(output,JSON.stringify(prepare(JSON.parse(fs.readFileSync(input,'utf8'))),null,2)+'\n');
}
