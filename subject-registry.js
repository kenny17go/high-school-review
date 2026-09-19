/* Subject capabilities, not duplicated applications. Grade 3 is schema-only. */
(function(root){
"use strict";
const sourceTypes=['ceec_official','school_official','school_exam_verified','platform_simulated','platform_generated','unknown'];
const skillNames=['字音／字形','重要字義','古今異義','文言句型','文句語譯','修辭','文章結構','段旨／主旨','人物／思想','國學常識','閱讀推論','延伸閱讀','跨文本比較','學測型題目'];
const skillIds=['sound-form','meaning','historical-meaning','syntax','translation','rhetoric','structure','main-idea','thought','culture','inference','extension','comparison','gsat'];
const skills=skillIds.map((id,i)=>({id,name:skillNames[i],level:[1,1,1,3,2,3,4,4,5,1,5,6,6,7][i]}));
const categories=['課內文本','國學常識','字音字形','字義／詞義','成語','修辭','文法／語法','文言文閱讀','白話文閱讀','古典詩詞','語文表達','綜合閱讀'];
const registry={};
for(const [id,name,code] of [['math','數學','MATH'],['chinese','國文','CHIN'],['physics','物理','PHYS'],['chemistry','化學','CHEM'],['biology','生物','BIO'],['earth-science','地球科學','EARTH'],['english','英文','ENG'],['history','歷史','HIST'],['geography','地理','GEO'],['civics','公民','CIV']]){
 registry[id]={id,name,code,enabled:['math','chinese'].includes(id),grades:[1,2],plannedGrades:[3],courses:[],units:[],categories:[],topics:[],skills:[],questionTypes:['single_choice'],examMapping:null,sourceTypes:[...sourceTypes],specialFeatures:[],adapter:null};
}
Object.assign(registry.math,{courses:root.LearningCatalog.courses,units:root.LearningCatalog.chapters,examMapping:root.LearningCatalog.scopes,specialFeatures:['tracks','frozen-v4977']});
Object.assign(registry.chinese,{courses:[1,2].map(grade=>({id:'chinese-108-g'+grade,grade,track:null})),units:['classical','reading','language'],categories,skills,topics:categories,specialFeatures:['classical-texts','passages','text-skill-mastery']});
root.SubjectRegistry={subjects:registry,skills,categories,sourceTypes,get:id=>registry[id],enabled:()=>Object.values(registry).filter(s=>s.enabled),registerAdapter(id,adapter){if(!registry[id])throw Error('Unknown subject');registry[id].adapter=adapter;},subjectOf:row=>row.subjectId||row.subject||'math'};
})(typeof window!=='undefined'?window:globalThis);
