/* Original parameterized simulations: 7 chapters × 3 templates × 20 variants.
   Negative IDs are stable local-only IDs and must never be sent to the legacy SQL FK. */
(function(root){
"use strict";
const C=root.LearningCatalog,questions=[];
function add(chapter,template,n,sub,level,q,answer,e,extra={}){
  const id=-(200000+chapter*1000+template*100+n),a=0;
  const o=[answer,answer+1,answer-1,answer+2].map(String);
  [o[0],o[a]]=[o[a],o[0]];
  const c=C.chapters[chapter===3&&template===2?7:chapter];
  const curriculumTrack=(chapter===4||(chapter===3&&template!==2)||([0,2].includes(chapter)&&template===3))?"A":"AB";
  questions.push({id,grade:2,subjectId:c.subjectId,courseId:`math-108-g2-${curriculumTrack.toLowerCase()}`,curriculumTrack,semester:c.semester,chapterId:c.id,requiredChapterIds:[c.id],
    topic:c.label,sub,level,q,o,a,e,isOriginal:true,origin:"local",templateId:`g2:${chapter}:${template}`,parameters:{n},...extra});
}
for(let n=1;n<=20;n++){
  // Trigonometric functions: transformations, periodicity and double-angle identity.
  add(0,1,n,"圖形平移","基礎",`函數 y=${n+1}sin x+${n+3} 的最大值為何？`,2*n+4,
    `sin x 的最大值為 1，且振幅 ${n+1} 為正。最大值=(${n+1})×1+${n+3}=${2*n+4}。`);
  add(0,2,n,"週期","中等",`函數 y=sin(${n+1}x)+2 的最小正週期為 2π/k，則正數 k 為何？`,n+1,
    `sin(bx) 的最小正週期為 2π/|b|。垂直平移不影響週期，故 k=${n+1}。`);
  add(0,3,n,"倍角與極值","中等",`x 為實數，y=${2*n}sin x cos x+${n+2} 的最大值為何？`,2*n+2,
    `由 sin 2x=2sin x cos x，y=${n}sin 2x+${n+2}。sin 2x 最大為 1，故最大值=${2*n+2}。`);
  // Grade-2 function/application questions, separate from the legacy exponent exercises.
  add(1,1,n,"指數函數平移","基礎",`f(x)=2^(x−${n})+${n+2}，求 f(${n+3})。`,n+10,
    `代入 x=${n+3}，指數為 3，所以 f(${n+3})=2³+${n+2}=${n+10}。`);
  add(1,2,n,"對數函數定義域","中等",`f(x)=log₂(x−${n})+log₂(${n+8}−x) 的定義域為 a<x<b，求 a+b。`,2*n+8,
    `兩個真數皆須正：x>${n} 且 x<${n+8}，所以 a=${n}、b=${n+8}，a+b=${2*n+8}。`);
  add(1,3,n,"指數成長模型","中等",`某培養物每 3 小時倍增，數量模型 N(t)=${n+5}×2^(t/3)。當數量達 ${8*(n+5)} 時，經過幾小時？`,9,
    `兩邊除以初始數量 ${n+5}，得 2^(t/3)=8=2³，所以 t/3=3，t=9 小時。`);
  add(2,1,n,"向量內積","基礎",`平面向量 u=(${n},2)、v=(3,${n+1})，求 u·v。`,5*n+2,
    `對應分量相乘再相加：${n}×3+2×${n+1}=${5*n+2}。`);
  add(2,2,n,"垂直條件","中等",`平面向量 u=(${n},1)、v=(2,k) 互相垂直，求 k。`,-2*n,
    `非零向量垂直時內積為 0，所以 ${n}×2+k=0，得 k=${-2*n}。`);
  add(2,3,n,"面積與行列式","中等",`平面向量 u=(${n+2},1)、v=(1,2) 所張成的平行四邊形面積為何？`,2*n+3,
    `面積為行列式的絕對值：|${n+2}×2−1×1|=${2*n+3}。`);
  add(3,1,n,"空間向量內積","基礎",`空間向量 u=(${n},2,1)、v=(2,1,${n+1})，求 u·v。`,3*n+3,
    `三個分量乘積相加：${n}×2+2×1+1×${n+1}=${3*n+3}。`);
  add(3,2,n,"空間距離","中等",`空間中 A=(${n},0,1)、B=(${n+3},4,${n+1})，求距離 AB 的平方。`,25+n*n,
    `差向量為 (3,4,${n})，距離平方=3²+4²+${n}²=${25+n*n}。`);
  add(3,3,n,"空間垂直條件","中等",`空間向量 u=(1,2,${n})、v=(k,1,2) 互相垂直，求 k。`,-2-2*n,
    `內積為零：k+2+${2*n}=0，所以 k=${-2-2*n}。`);
  add(4,1,n,"平面方程式","基礎",`平面 2x+y−z=${n} 通過點 (${n},3,k)，求 k。`,n+3,
    `代入點座標得 ${2*n}+3−k=${n}，解得 k=${n+3}。`);
  add(4,2,n,"直線與平面交點","中等",`直線 (x,y,z)=(1,0,0)+t(1,1,1) 與平面 x+y+z=${3*n+1} 相交，交點的參數 t 為何？`,n,
    `代入 x=1+t、y=t、z=t，得 1+3t=${3*n+1}，故 t=${n}。`);
  add(4,3,n,"點到平面距離","中等",`空間點 P=(0,0,${n+5}) 到平面 z=2 的距離為何？`,n+3,
    `平面 z=2 平行 xy 平面，垂直距離為 |${n+5}−2|=${n+3}。`);
  add(5,1,n,"條件機率","基礎",`袋中有 ${n+2} 顆紅球、3 顆藍球，任取一球。已知不是藍球，抽到紅球的機率為百分之幾？`,100,
    `袋中只有紅、藍兩色。已知不是藍球，縮小後的樣本空間全是紅球，條件機率為 1，即 100%。`);
  add(5,2,n,"條件樣本空間","中等",`班上有 ${n+3} 位男生、${n+4} 位女生。已知抽中的人是女生，且女生中有 2 位戴眼鏡。戴眼鏡的條件機率為 2/k（不約分），求 k。`,n+4,
    `條件是女生，所以分母只計 ${n+4} 位女生，分子為其中 2 位戴眼鏡者。故 k=${n+4}。`);
  add(5,3,n,"不放回抽樣","中等",`袋中有 ${n+2} 顆紅球與 3 顆藍球，不放回連抽兩球。已知第一球是紅球，第二球為紅球的機率寫成 (${n+1})/k（不約分），求 k。`,n+4,
    `第一球紅球取走後，剩下 ${n+1} 紅球與 3 藍球，共 ${n+4} 球，故條件機率為 (${n+1})/(${n+4})，k=${n+4}。`);
  add(6,1,n,"矩陣加法","基礎",`A=[[${n},2],[1,3]]、B=[[4,1],[2,0]]，矩陣 A+B 的第 1 列第 1 行元素為何？`,n+4,
    `矩陣加法將對應位置相加，左上角元素=${n}+4=${n+4}。`);
  add(6,2,n,"矩陣乘法","中等",`A=[[${n},2],[1,3]]、B=[[2,1],[3,0]]，矩陣 AB 的左上角元素為何？`,2*n+6,
    `取 A 第一橫列 (${n},2) 與 B 第一縱行 (2,3) 做內積：${n}×2+2×3=${2*n+6}。`);
  add(6,3,n,"矩陣作用","中等",`矩陣 A=[[1,2],[0,1]] 作用於直行向量 (${n},3)ᵀ，所得向量的第一分量為何？`,n+6,
    `矩陣與向量相乘得 (${n}+2×3,3)ᵀ=(${n+6},3)ᵀ，所以第一分量=${n+6}。`);
}
root.GRADE2_QUESTIONS=questions;
})(typeof window!=="undefined"?window:globalThis);
