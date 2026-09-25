import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareExamBatch} from './batch-exam-import.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PAPER_URL='https://www.ceec.edu.tw/files/file_pool/1/0q054344158947111283/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8a%E8%A9%A6%E5%8D%B7.pdf';
const ANSWER_URL='https://www.ceec.edu.tw/files/file_pool/1/0Q019602555648697608/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf';
const MANIFEST={1:{index:1},2:{index:0},3:{index:0},4:{index:2},5:{index:4},6:{index:1},7:{indices:[2,3]},8:{indices:[1,4]},9:{indices:[0,1,3]},10:{indices:[0,4]},11:{indices:[1,3]},12:{indices:[1,3]},13:{cells:['9','1','0']},14:{cells:['1','4']},15:{cells:['3','2']},16:{cells:['3','5','2']},17:{cells:['3','1','1']},18:{index:2},19:{grading:'manual_required',reference:'x-y-z=-1'},20:{grading:'manual_required',reference:'volume=10; maxDistance=sqrt(94)'}};
const REVIEW_FLAGS={};
const VISUAL_REVIEW={questions:[5,8,10,11,12,17,18,19,20],paper_pages:[2,3,4,6],method:'rendered_official_pdf',reviewed_on:'2026-09-25'};
const RUBRIC_URL='https://www.ceec.edu.tw/files/file_pool/1/0q054335289912664889/115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8a%E8%80%83%E7%A7%91%E9%9D%9E%E9%81%B8%E6%93%87%E9%A1%8C%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88%E8%88%87%E8%A9%95%E5%88%86%E5%8E%9F%E5%89%87.pdf';
const CONTENT={
 5:{stem:'已知實數三階方陣 A 滿足 A(1,1,0)=(0,-1,1)、A(0,-1,1)=(1,1,0)、A(1,0,-1)=(0,0,0)。有多少個行向量 v 滿足 Av=(1,0,1)，且 v 垂直於 (0,1,0)？',options:['1個','2個','3個','0個','無窮多個']},
 7:{stem:'坐標平面上同時滿足 2x-y-3>0 與 x+2y+1<0 的點 P(x,y) 可能位在哪些位置？',options:['第一象限','第二象限','第三象限','第四象限','x軸']},
 8:{stem:'已知 A=[[2,1],[1,0]]，且 A^n=[[a_n,b_n],[c_n,d_n]]。選出正確敘述。',options:['b₂<c₂','A²=2A+I','c_(n+2)=c_(n+1)+2c_n','A^n(0,1)=(b_(n+1),d_(n+1))','d_(2n)-a_(2n)=d_n²-a_n²']},
 9:{stem:'某班數學、英文平均皆60，標準差分別為12、8；T分數定義為 T=50+10(S-μ)/σ。選出正確敘述。',options:['英文原始52分的T分數為40','各生數學T分數不會超過原始成績','兩科原始平均較高者，兩科T分數平均必較高','若及格標準皆為T≥40，數學及格原始門檻比英文低','原始數學對英文迴歸斜率與T分數數學對英文迴歸斜率相同']},
 10:{stem:'四邊形 ABCD 中 AB∥DC，AC與BD交於E。已知向量 AB=(2,-6)、AD=(1,5)，且三角形 ABE 面積為3。選出正確敘述。',options:['cos∠BAD=-7√65/65','三角形ABD面積為9','向量AE=(3/2,1/2)','四邊形ABCD面積為65/3','BC<8/3']},
 11:{stem:'令 Γ 為 y=cos(πx/2) 的圖形；對任一非零實數 m，令 L_m 為 y=mx+1。選出正確敘述。',options:['m>0時，所有交點x坐標皆為負','若(a,b)是L_m與Γ交點，則(-a,b)是L_-m與Γ交點','存在m≠0使L_m與Γ交於(20/3,1/2)','若交點在y=-1上，則1/m是奇數','若交點在x軸上，則L_m與Γ有偶數個交點']},
 12:{stem:'f、g為實係數三次多項式，f首項係數為1，且 f(x)-g(x)=2x³+2x。其圖形對稱中心分別為(a₁,b₁)、(a₂,b₂)。選出正確敘述。',options:['兩圖形恰交於三點','a₁+a₂可唯一確定','b₁+b₂可唯一確定','若a₁=a₂，則b₁=b₂','若b₁=b₂，則a₁=a₂']},
 13:{stem:'全體教師中1/4只有學士學位、3/4有碩士學位；兩群通過英聽檢定比例分別為1/5、3/5。隨機抽一位通過英聽檢定者，求其有碩士學位的條件機率。'},
 14:{stem:'坐標平面上，向量(a,b)與直線 y=bx-1 垂直，求 a+b 的最大可能值。'},
 15:{stem:'三正數a<b<c成等差數列，且(a,log₃a)、(b,log₄b)、(c,log₆c)共線，求b/a。'},
 16:{stem:'二次函數圖形頂點P在y=1+2x上，且交x軸於A=(-1/2,0)、B=(1/2,0)。平移後頂點Q仍在該直線並通過B，P、Q相異，求PQ。'},
 17:{stem:'直角三角形ABC中∠CAB=90°，D在AB上，∠BCD=2∠ACD，且BC=2BD。若向量AD=k向量AB，求k。'},
 19:{stem:'設B點坐標為(1,2,0)，求平面ABCD的平面方程式。'},
 20:{stem:'求平行六面體的體積，並求此平行六面體上（含邊界）距點A的最長距離。'}
};
const RUBRICS={
 19:{url:RUBRIC_URL,full_score:['指出平面ABCD的法向量平行於(-5,5,5)','代入B=(1,2,0)得到x-y-z=-1'],partial_score:['正確指出法向量，但未完整得到平面方程式']},
 20:{url:RUBRIC_URL,full_score:['正確求得AP=(4,4,-2)或反向等價向量','正確求得體積10','正確求得AB與AD','比較各頂點距離並得到最長距離√94'],partial_score:['方法正確求AP但未正確求AB、AD','正確求AP與體積但未正確求AB、AD','正確求體積但未完整求AP、AB、AD','正確求AP、AB、AD與體積，但未完成最長距離']}
};

function loadBrowserData(){
 const context={window:{}};
 vm.createContext(context);
 for(const file of ['gsat-115-unified-bank.js','unified-question-bank.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 return {source:context.window.GSAT_UNIFIED_BANK_115_MATHA,runtime:context.window.UnifiedQuestionBank};
}

const sameAnswer=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function buildGoldenInput(){
 const {source,runtime}=loadBrowserData();
 const playable=new Map(runtime.all().map(q=>[q.id,q]));
 const groupId='ceec-115-matha-g18-20';
 const questions=Array.from(source.questions,original=>{
  const n=original.question_number;
  const content={...(playable.get(original.id)||{}),...(CONTENT[n]||{})};
  const type=original.questionType==='manual'?'short_answer':original.questionType;
  return {...original,
   questionType:type,
   source_url:PAPER_URL,
   answer_url:ANSWER_URL,
   stem:content.stem||null,
   options:content.options?.length?content.options:original.options,
   group_id:n>=18?groupId:null,
   answer_match:sameAnswer(original.answer,MANIFEST[n]),
   parse_confidence:0.98,
   classification_confidence:0.95,
   review_flags:REVIEW_FLAGS[n]||[],
   input_classification_status:original.classification_status,
   content_capture_status:content.stem?'inline_normalized':'official_pdf_reference',
   grading_rubric:RUBRICS[n]||null,
   rubric_url:RUBRICS[n]?.url||null
  };
 });
 return {
  exam:{id:'ceec-115-matha',subject:'math',academic_year:115,exam:'學測',variant:'數學A',sourceType:'ceec_official',source_title:'115學年度學科能力測驗數學A考科',source_url:PAPER_URL,answer_url:ANSWER_URL,expected_question_count:20,total_points:100,raw_layer:'official_pdf_reference'},
  groups:[{id:groupId,question_numbers:[18,19,20],title:'第18～20題共用題組',stem:'坐標空間中有一平行六面體 PQRS-ABCD。已知 AB×AD=(-5,5,5)、AD×AP=(-2,0,-4)、AP×AB=(6,-10,-8)，且 |AP|=6。附圖僅為示意圖。',source_page:6,review_flags:[]}],
  answer_manifest:MANIFEST,
  visual_review:VISUAL_REVIEW,
  questions
 };
}

export function buildGoldenArtifacts(){
 const raw=buildGoldenInput();
 return {raw,staging:prepareExamBatch(raw)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rawPath=path.resolve(process.argv[2]||path.join(root,'data/raw/ceec-115-matha.json'));
 const stagingPath=path.resolve(process.argv[3]||path.join(root,'data/staging/ceec-115-matha.batch-import-v1.json'));
 fs.mkdirSync(path.dirname(rawPath),{recursive:true});
 fs.mkdirSync(path.dirname(stagingPath),{recursive:true});
 const {raw,staging}=buildGoldenArtifacts();
 fs.writeFileSync(rawPath,JSON.stringify(raw,null,2)+'\n');
 fs.writeFileSync(stagingPath,JSON.stringify(staging,null,2)+'\n');
 console.log(JSON.stringify(staging.review_summary,null,2));
}
