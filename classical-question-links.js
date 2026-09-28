/* Audited links to questions already in the unified bank. No duplicate question text or answers. */
(function(root){
"use strict";
const entries=[
 ['ceec-115-chinese-04',['shiji-hongmen','zuozhuan-zhuzhiwu','lisi-zhuke'],'comparison'],
 ['ceec-115-chinese-30',['zhugeliang-chushi'],'comparison'],
 ['ceec-115-chinese-31',['zhugeliang-chushi'],'comparison'],
 ['ceec-114-chinese-17',['su-chibi'],'direct'],
 ['ceec-114-chinese-18',['su-chibi'],'direct'],
 ['ceec-114-chinese-28',['tao-taohuayuan'],'extended'],
 ...[34,35,36].map(n=>[`ceec-114-chinese-${n}`,['du-qiuranke'],'comparison']),
 ...[13,14,15].map(n=>[`ceec-113-chinese-${n}`,['liu-shishuo'],'comparison']),
 ['ceec-112-chinese-05',['zuozhuan-zhuzhiwu'],'comparison'],
 ...[14,16].map(n=>[`ceec-111-chinese-${n}`,['zhang-huaju'],n===14?'direct':'comparison']),
 ...[18,19].map(n=>[`ceec-111-chinese-${n}`,['liu-yulizi'],'direct']),
 ...[33,34].map(n=>[`ceec-111-chinese-${n}`,['pu-laoshan'],'comparison']),
 ...[12,13,14,15].map(n=>[`cksh-114-1-1-g1-chinese-q${n}`,['hanyu-shishuo'],'direct']),
 ...[16,17,18].map(n=>[`cksh-114-1-1-g1-chinese-q${n}`,['liu-shishuo'],'direct']),
 ['cksh-114-1-2-g1-chinese-q17',['xunzi-quanxue'],'direct'],
 ['cksh-114-1-2-g1-chinese-q23',['tao-taohuayuan'],'comparison']
];
const links=entries.flatMap(([question_id,ids,relationship_type])=>ids.map(text_id=>({question_id,text_id,relationship_type,confidence:1,classification_status:'verified',classification_method:'source_text_audit',evidence:'現有真題題幹或共用題組明示本篇；題目與詳解仍保留原有待審狀態。'})));
function rows(bank){
 const byId=new Map(bank.filter(q=>q.subject==='chinese').map(q=>[q.id,q]));
 return entries.map(([id,ids,relation])=>{
  const q=byId.get(id);if(!q)return null;
  const skill=relation==='comparison'?'comparison':/字義|一詞多義/.test(q.primary_unit)?'meaning':'inference';
  return {...q,chineseMetadata:{...q.chineseMetadata,text_ids:ids,skills:[skill]}};
 }).filter(Boolean);
}
root.ClassicalQuestionLinks=Object.freeze({links,rows});
})(window);
