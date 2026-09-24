(function(){"use strict";
const bank=window.GSAT115_READY;
function multi(correct,selected,points){if(!selected||!selected.length)return 0;const a=new Set(correct),b=new Set(selected);let wrong=0;for(let i=0;i<5;i++)if(a.has(i)!==b.has(i))wrong++;return wrong===0?points:wrong===1?points*3/5:wrong===2?points/5:0;}
function grade(q,response){if(q.type==="single_choice")return {score:response===q.answer.index?q.points:0,max:q.points,status:"graded"};if(q.type==="multiple_choice")return {score:multi(q.answer.indices,response,q.points),max:q.points,status:"graded"};if(q.type==="fill_blank")return {score:JSON.stringify(response||[])===JSON.stringify(q.answer.cells)?q.points:0,max:q.points,status:"graded"};return {score:null,max:q.points,status:"manual_required"};}
window.GSAT115Engine=Object.freeze({bank,grade,multi});
})();
