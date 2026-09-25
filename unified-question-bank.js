(function(root){"use strict";
const source=root.GSAT_UNIFIED_BANK_115_MATHA;
if(!source){root.UnifiedQuestionBank=root.UnifiedQuestionBank||{all:()=>[]};return;}
const groups={
"ceec-115-matha-g18-20":{id:"ceec-115-matha-g18-20",subject:"math",sourceType:"ceec_official",sourceId:"ceec-115-matha",academic_year:115,exam:"學測",variant:"數學A",question_numbers:[18,19,20],title:"第18～20題共用題組",stem:"坐標空間中有一平行六面體，已知 AB×AD=(-5,5,5)、AD×AP=(-2,0,-4)、AP×AB=(6,-10,-8)，且 |AP|=6。",source_page:6,display_mode:"shared_context",depends_on:[]}
};
const content={
"ceec-115-matha-01":{stem:"財神廟抽獎：參加者抽兩次籤，每次抽到「吉」與「祥」的機率都為 1/3。兩次皆「吉」得180元，兩次皆「祥」得90元，其餘0元。獎金期望值為何？",options:["20元","30元","45元","60元","90元"]},
"ceec-115-matha-02":{stem:"對任一實數 a，以 [a] 表示不大於 a 的最大整數。令 f(x)=[99-x]+[99+x]，-99≤x≤99。比較 f(-20)、f(0)、f(1) 的大小關係。",options:["f(-20)≤f(0)<f(1)","f(-20)<f(1)≤f(0)","f(1)<f(-20)≤f(0)","f(0)<f(-20)≤f(1)","f(0)≤f(1)<f(-20)"]},
"ceec-115-matha-03":{stem:"設 f(x)=a^x，a為正實數。c1,c2,c3為公差10/3的等差數列，且 f(c1),f(c2),f(c3) 為公比4的等比數列。求等比數列 f(10),f(8),f(6) 的公比。",options:["2^(-6/5)","2^(-3/5)","2^(3/5)","2^(6/5)","2^(5/3)"]},
"ceec-115-matha-04":{stem:"某網遊有16種材料，其中6種基本材料、10種進階材料。任選3種不同材料合成道具：三種皆基本材料時結果固定為同一種草藥；兩種基本加一種進階時，只由進階材料決定食物種類；其餘材料組合都得到彼此不同的藥水。總共可合成多少種道具？",options:["256","370","401","455","560"]},
"ceec-115-matha-05":{stem:"已知實數三階方陣 A 滿足 A(1,1,0)=(0,-1,1)、A(0,-1,1)=(1,1,0)、A(1,0,-1)=(0,0,0)。有多少個向量 v 滿足 Av=(1,0,1)，且 v 垂直於 (0,1,0)？",options:["1個","2個","3個","0個","無窮多個"]},
"ceec-115-matha-06":{stem:"坐標平面上 A=(2,-2)、B=(-1,2)。直線 y=-6 上有多少個點 C，使三角形 ABC 為等腰三角形？",options:["1","2","3","4","5"]},
"ceec-115-matha-07":{stem:"坐標平面上同時滿足 2x-y-3>0 與 x+2y+1<0 的點 P(x,y) 可能位在哪些位置？",options:["第一象限","第二象限","第三象限","第四象限","x軸"]},
"ceec-115-matha-08":{stem:"已知 A=[[2,1],[1,0]]，且 A^n=[[a_n,b_n],[c_n,d_n]]。選出正確敘述。",options:["b₂<c₂","A²=2A+I","c_(n+2)=c_(n+1)+2c_n","A^n(0,1)=(b_(n+1),d_(n+1))","d_(2n)-a_(2n)=d_n²-a_n²"]},
"ceec-115-matha-09":{stem:"某班數學、英文平均皆60，標準差分別為12、8；T分數定義為 T=50+10(S-μ)/σ。選出正確敘述。",options:["英文原始52分的T分數為40","各生數學T分數不會超過原始成績","兩科原始平均較高者，兩科T分數平均必較高","若及格標準皆為T≥40，數學及格原始門檻比英文低","原始數學對英文迴歸斜率與T分數數學對英文迴歸斜率相同"]},
"ceec-115-matha-10":{stem:"四邊形 ABCD 中 AB∥DC，AC與BD交於E。已知向量 AB=(2,-6)、AD=(1,5)，且三角形 ABE 面積為3。選出正確敘述。",options:["cos∠BAD=-7√65/65","三角形ABD面積為9","向量AE=(3/2,1/2)","四邊形ABCD面積為65/3","BC<8/3"]},
"ceec-115-matha-11":{stem:"令 Γ 為 y=cos(πx/2) 的圖形；對任一非零實數 m，令 L_m 為 y=mx+1。選出正確敘述。",options:["m>0時，所有交點x坐標皆為負","若(a,b)是L_m與Γ交點，則(-a,b)是L_-m與Γ交點","存在m≠0使L_m與Γ交於(20/3,1/2)","若交點在y=-1上，則1/m是奇數","若交點在x軸上，則L_m與Γ有偶數個交點"]},
"ceec-115-matha-12":{stem:"f、g為實係數三次多項式，f首項係數為1，且 f(x)-g(x)=2x³+2x。其圖形對稱中心分別為(a₁,b₁)、(a₂,b₂)。選出正確敘述。",options:["兩圖形恰交於三點","a₁+a₂可唯一確定","b₁+b₂可唯一確定","若a₁=a₂，則b₁=b₂","若b₁=b₂，則a₁=a₂"]},
"ceec-115-matha-13":{stem:"全體教師中1/4只有學士學位、3/4有碩士學位；兩群通過英聽檢定比例分別為1/5、3/5。隨機抽一位通過英聽檢定者，求其有碩士學位的條件機率。"},
"ceec-115-matha-14":{stem:"坐標平面上，向量(a,b)與直線 y=bx-1 垂直，求 a+b 的最大可能值。"},
"ceec-115-matha-15":{stem:"三正數a<b<c成等差數列，且(a,log₃a)、(b,log₄b)、(c,log₆c)共線，求b/a。"},
"ceec-115-matha-16":{stem:"二次函數圖形頂點P在y=1+2x上，且交x軸於A=(-1/2,0)、B=(1/2,0)。平移後頂點Q仍在該直線並通過B，P、Q相異，求PQ。"},
"ceec-115-matha-17":{stem:"直角三角形ABC中∠CAB=90°，D在AB上，∠BCD=2∠ACD，且BC=2BD。若向量AD=k向量AB，求k。"},
"ceec-115-matha-18":{stem:"平行四邊形 ABCD 的面積為何？",options:["2√5","5√2","5√3","6√3","10√2"],group_id:"ceec-115-matha-g18-20"},
"ceec-115-matha-19":{stem:"設B點坐標為(1,2,0)，求平面ABCD的平面方程式。",group_id:"ceec-115-matha-g18-20"},
"ceec-115-matha-20":{stem:"求平行六面體的體積，並求此平行六面體上（含邊界）距點A的最長距離。",group_id:"ceec-115-matha-g18-20"}
};
function detailed(q){
 const e=q.explanation||{};
 if(q.id==="ceec-115-matha-01")return "一次抽到吉的機率是1/3，所以兩次都吉的機率是(1/3)^2=1/9；兩次都祥同樣是1/9。其餘情況雖然有機率，但獎金是0元，因此期望值 E=180×1/9+90×1/9+0=20+10=30元，所以選②。常見錯誤是把『兩次都抽到』仍當成1/3，忘了兩次機率要相乘。";
 if(q.id==="ceec-115-matha-04")return "先算全部三材料組合 C(16,3)=560。三種皆基本材料共有 C(6,3)=20 組，但規則說全部只形成同一種草藥，所以20組要合併成1種。兩基本一進階共有 C(6,2)×10=150組，但結果只由10種進階材料決定，因此只有10種食物。其餘560-20-150=390組各自形成不同藥水。總數=1+10+390=401，所以選③。";
 if(q.id==="ceec-115-matha-06")return "令 C=(t,-6)。等腰三角形可能由 AB=AC、AB=BC 或 AC=BC 三種情況產生。分別把距離平方代入，可避免根號並逐一解 t；再排除退化或重複情形，最後得到2個符合條件的 C，因此選②。重點是不能只檢查其中一種等腰情形。";
 if(q.id==="ceec-115-matha-18")return "平行四邊形 ABCD 的兩鄰邊為 AB、AD，面積就是 |AB×AD|。已知 AB×AD=(-5,5,5)，所以面積=√[(-5)^2+5^2+5^2]=√75=5√3，因此選③。常見錯誤是把外積向量的某一個分量當成面積；面積要取外積向量的長度。";
 return e.solution||"依題目條件逐步整理並代入計算。";
}
const questions=source.questions.map(q=>{
 const c=content[q.id];if(!c)return null;
 const questionType=q.questionType==="manual"?"short_answer":q.questionType;
 const answer=questionType==="single_choice"?q.answer?.index:questionType==="multiple_choice"?q.answer?.indices:questionType==="fill_blank"?q.answer?.cells:q.answer;
 const options=c.options||[];
 const input_spec=questionType==="fill_blank"?{cells:(q.answer?.cells||[]).map((_,index)=>({index}))}:undefined;
 return {id:q.id,subject:"math",subjectId:"math",grade:3,course:"gsat-matha",category:q.primary_unit,unit:q.primary_unit,chapter:q.primary_unit,topic:q.primary_unit,skill:q.skill_tags?.[0]||q.primary_unit,questionType,stem:c.stem,options,answer,q:c.stem,o:options,a:answer,input_spec,answer_available:true,explanation:detailed(q),e:detailed(q),difficulty:"學測",level:"學測",sourceType:"ceec_official",sourceId:"ceec-115-matha",source_title:q.source_title,source_url:q.source_url,answer_url:q.answer_url,source_page:q.source_page,academic_year:115,exam:"學測",variant:"數學A",question_number:q.question_number,classification_status:q.classification_status,group_id:c.group_id||null,verified_at:q.classification_status==="verified"?"2026-09-25":null,origin:"local-official",sync_disabled:true,explanation_detail:q.explanation};
 }).filter(Boolean);
root.UnifiedQuestionBank=Object.freeze({version:"1.1",questions,groups,all(){return questions.slice();},group(id){return groups[id]||null;},context(q){return q?.group_id?groups[q.group_id]||null:null;},filter(f={}){return questions.filter(q=>(!f.subject||q.subject===f.subject)&&(!f.sourceType||q.sourceType===f.sourceType)&&(!f.academic_year||q.academic_year===Number(f.academic_year))&&(!f.unit||q.unit===f.unit));}});
})(window);
