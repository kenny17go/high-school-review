(function(root){
"use strict";
const coreSource='https://www.naer.edu.tw/upload/1/24/doc/3512/表述清晰，精準論證--知性寫作教材示例_羅嘉雯.pdf';
const oldSource='https://learn.hshs.tyc.edu.tw/ischool/publish_page/242/?cid=11128';
const rows=[
 ['zuozhuan-zhuzhiwu','燭之武退秦師','左丘明（傳）／《左傳》','先秦','外交、說理'],
 ['liji-datong','大同與小康','《禮記》','先秦至漢','政治、理想'],
 ['lisi-zhuke','諫逐客書','李斯','秦','人才、議論'],
 ['shiji-hongmen','鴻門宴','司馬遷','漢','人物、敘事'],
 ['zhugeliang-chushi','出師表','諸葛亮','三國','忠誠、勸諫'],
 ['tao-taohuayuan','桃花源記','陶淵明','東晉','理想、敘事'],
 ['hanyu-shishuo','師說','韓愈','唐','學習、議論'],
 ['du-qiuranke','虯髯客傳','杜光庭（傳）','唐末五代','小說、人物'],
 ['su-chibi','赤壁賦','蘇軾','宋','人生、主客問答'],
 ['gui-xiangji','項脊軒志','歸有光','明','親情、記憶'],
 ['yuan-liuqiao','晚遊六橋待月記','袁宏道','明','遊記、審美'],
 ['pu-laoshan','勞山道士','蒲松齡','清','小說、諷刺'],
 ['zheng-quanhe','勸和論','鄭用錫','清','臺灣、勸和'],
 ['hong-lugang','鹿港乘桴記','洪繻（洪棄生）','臺灣日治時期','臺灣、見聞'],
 ['zhang-huaju','畫菊自序','張李德和','戰後臺灣','藝術、自序'],
 ['xunzi-quanxue','勸學','荀子','先秦','學習、譬喻'],
 ['chuci-yufu','漁父','屈原（傳）／《楚辭》','先秦至漢','出處、對話'],
 ['zhanguoce-fengxuan','馮諼客孟嘗君','《戰國策》','先秦至漢','人才、政治'],
 ['caopi-lunwen','典論・論文','曹丕','三國','文學、評論'],
 ['qiuchi-chenbozhi','與陳伯之書','丘遲','南朝梁','書信、勸說'],
 ['liu-shishuo','世說新語選','劉義慶主編','南朝宋','人物、志人'],
 ['wang-lanting','蘭亭集序','王羲之','東晉','聚會、生死'],
 ['liu-xishan','始得西山宴遊記','柳宗元','唐','遊記、心境'],
 ['wei-shisi','諫太宗十思疏','魏徵','唐','政治、勸諫'],
 ['fan-yueyang','岳陽樓記','范仲淹','宋','責任、憂樂'],
 ['ou-zuiweng','醉翁亭記','歐陽脩','宋','遊記、與民同樂'],
 ['liu-yulizi','郁離子選','劉基','明','寓言、政治'],
 ['huang-yuanjun','原君','黃宗羲','明清之際','政治、公私'],
 ['gu-lianchi','廉恥','顧炎武','明清之際','倫理、政治'],
 ['lian-taiwan','臺灣通史序','連橫','臺灣日治時期','史學、臺灣']
];
root.ClassicalTexts=rows.map(([text_id,title,author,era,tags],i)=>({text_id,title,author,era,group:i<15?'core15':'extended15',curriculum_status:i<15?'108_recommended':'platform_selected_from_legacy',public_domain_status:i<13||i>=15?'classical_original_only':'metadata_only_pending_rights_review',tags:tags.split('、'),source_reference:i<15?coreSource:oldSource,notes:i<15?'108課綱推薦選文；非各校固定段考範圍。':'經使用者確認，從舊推薦選文擇15篇作平台延伸選編；不代表舊30篇的完整差集。',aliases:({'su-chibi':['前赤壁賦'],'zhugeliang-chushi':['前出師表'],'pu-laoshan':['嶗山道士'],'du-qiuranke':['虬髯客傳'],'liji-datong':['大同小康']})[text_id]||[]}));
})(typeof window!=='undefined'?window:globalThis);
