window.GSAT_UNIFIED_BANK_115_MATHA=Object.freeze({
  "meta": {
    "academicYear": 115,
    "exam": "學測",
    "subject": "數學A",
    "questionCount": 20,
    "totalPoints": 100,
    "schema": "unified-gsat-bank-v1",
    "paperUrl": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
    "answerUrl": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf"
  },
  "questions": [
    {
      "id": "ceec-115-matha-01",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 1,
      "primary_unit": "機率與統計",
      "secondary_concepts": [
        "期望值",
        "獨立重複試驗"
      ],
      "skill_tags": [
        "辨識有獎事件",
        "期望值加權"
      ],
      "questionType": "single_choice",
      "points": 5,
      "answer": {
        "index": 1
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 1,
      "classification_status": "verified",
      "explanation": {
        "concept": "期望值；獨立重複試驗",
        "key_insight": "列出會拿到獎金的情況，再做期望值加權。",
        "solution": "兩次皆吉與皆祥機率各1/9，E=180/9+90/9=30，選②。",
        "common_errors": "把單次1/3誤當成兩次同時發生機率。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "reviewed",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "期望值與獨立事件",
        "key_insight": "先分別列出兩種得獎事件，兩次獨立抽籤的機率相乘，再以獎金加權。",
        "reasoning": "步驟1：兩次都抽到「吉」的機率為 (1/3)×(1/3)=1/9。步驟2：兩次都抽到「祥」的機率也為1/9。步驟3：其餘情況獎金為0，期望值 E=180×1/9+90×1/9+0×7/9=20+10=30（元），選②。",
        "option_analysis": [
          "① 20元：只計入兩次皆吉的獎金，漏算皆祥。",
          "② 30元：兩種得獎情況皆納入加權，正確。",
          "③ 45元：不是本題兩種得獎事件的加權期望。",
          "④ 60元：未按各事件發生機率正確加權。",
          "⑤ 90元：把獎金額度誤當期望值。"
        ],
        "common_errors": "把兩次皆吉的機率當作1/3；或把180元與90元直接取平均。",
        "strategy": "遇到抽獎期望值，先製作「事件／機率／獎金」表，再計算 Σ(機率×獎金)。",
        "review": "複習獨立事件乘法法則與離散隨機變數期望值。"
      }
    },
    {
      "id": "ceec-115-matha-02",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 2,
      "primary_unit": "函數",
      "secondary_concepts": [
        "最大整數函數",
        "分段函數"
      ],
      "skill_tags": [
        "代入比較",
        "負數取整"
      ],
      "questionType": "single_choice",
      "points": 5,
      "answer": {
        "index": 0
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 1,
      "classification_status": "needs_review",
      "explanation": {
        "concept": "最大整數函數；分段函數",
        "key_insight": "依最大整數函數定義分別代入比較。",
        "solution": "用 [a]≤a<[a]+1 求各指定值並比較，得到①。",
        "common_errors": "負數取整方向錯誤。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "review_flags": [
        "normalized_stem_answer_conflict"
      ]
    },
    {
      "id": "ceec-115-matha-03",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 3,
      "primary_unit": "數列與指數",
      "secondary_concepts": [
        "等差數列",
        "等比數列",
        "指數律"
      ],
      "skill_tags": [
        "由公比反推底數",
        "指數差"
      ],
      "questionType": "single_choice",
      "points": 5,
      "answer": {
        "index": 0
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 1,
      "classification_status": "verified",
      "explanation": {
        "concept": "等差數列；等比數列；指數律",
        "key_insight": "把等差數列的差轉成指數函數的比。",
        "solution": "由 a^(10/3)=4 推得所求比值 a^(-2)=4^(-3/5)=2^(-6/5)，選①。",
        "common_errors": "把等差公差與等比公比混淆。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "等差數列、等比數列與指數律",
        "key_insight": "指數函數把輸入的等差公差轉為輸出等比公比。",
        "reasoning": "步驟1：因 c₂−c₁=10/3，且 f(c₂)/f(c₁)=4，所以 a^(10/3)=4。步驟2：f(10),f(8),f(6) 的公比為 f(8)/f(10)=a^(-2)。步驟3：a^(-2)=(a^(10/3))^(-3/5)=4^(-3/5)=2^(-6/5)，選①。",
        "option_analysis": [
          "① 2^(-6/5)：由 a^(10/3)=4 推得，正確。",
          "② 2^(-3/5)：將4改寫為2²時漏掉平方。",
          "③ 2^(3/5)：指數符號及底數轉換不符。",
          "④ 2^(6/5)：將遞減公比誤作遞增。",
          "⑤ 2^(5/3)：把公差與公比的指數關係倒置。"
        ],
        "common_errors": "把 f(8)/f(10) 寫成 a²；或由4轉成2時漏乘指數2。",
        "strategy": "先由已知公比寫出 a^(公差)=公比，再將所求寫成 a 的冪次。",
        "review": "複習 a^(x+y)=a^x a^y、(a^x)^r=a^(xr)。"
      }
    },
    {
      "id": "ceec-115-matha-04",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 4,
      "primary_unit": "排列組合",
      "secondary_concepts": [
        "組合",
        "分類計數"
      ],
      "skill_tags": [
        "先算組合",
        "修正重複"
      ],
      "questionType": "single_choice",
      "points": 5,
      "answer": {
        "index": 2
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 1,
      "classification_status": "verified",
      "explanation": {
        "concept": "組合；分類計數",
        "key_insight": "不是所有 C(16,3) 都形成不同道具，要合併重複結果。",
        "solution": "總組合560；3基本的20組合成1種，2基本1進階的150組合成10種，其餘390種不同，合計401，選③。",
        "common_errors": "直接回答 C(16,3)=560。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "組合與重複結果的分類計數",
        "key_insight": "題目問的是不同『合成結果』，不是選材料的方法數；須依合成規則合併重複。",
        "reasoning": "步驟1：任選3種不同材料，共 C(16,3)=560 組。步驟2：三種皆基本的 C(6,3)=20 組，只產生1種草藥。步驟3：兩基本一進階的 C(6,2)×10=150 組，結果只由進階材料決定，因此僅10種食物。步驟4：其餘560−20−150=390組，各產生不同藥水。合計1+10+390=401種，選③。",
        "option_analysis": [
          "① 256：不符合三類結果的分類計數。",
          "② 370：漏計部分類別或錯誤合併。",
          "③ 401：草藥1種、食物10種、藥水390種，正確。",
          "④ 455：未正確處理重複合成結果。",
          "⑤ 560：把材料組合數直接當成道具種類數。"
        ],
        "common_errors": "把20組草藥、150組食物都算成不同道具；或扣除重複後忘記補回每類實際產物。",
        "strategy": "先計算原始組合，再將規則導致的重複結果分組合併。",
        "review": "複習組合數 C(n,r) 與分類加法原理。"
      }
    },
    {
      "id": "ceec-115-matha-05",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 5,
      "primary_unit": "矩陣",
      "secondary_concepts": [
        "矩陣運算",
        "向量線性組合",
        "垂直"
      ],
      "skill_tags": [
        "線性變換",
        "聯立條件"
      ],
      "questionType": "single_choice",
      "points": 5,
      "answer": {
        "index": 4
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 2,
      "classification_status": "needs_review",
      "explanation": {
        "concept": "矩陣運算；向量線性組合；垂直",
        "key_insight": "把矩陣作用視為線性變換，再聯立垂直條件。",
        "solution": "依題設建立 Av 與 v 的條件，可得符合條件的向量有無窮多組，故⑤。",
        "common_errors": "逐格硬算而漏掉線性關係。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "線性變換與向量垂直",
        "key_insight": "先用三個已知向量作為基底，將待求向量表示成線性組合。",
        "reasoning": "設 u=(1,1,0)、w=(0,-1,1)、z=(1,0,-1)。題設給 Au=w、Aw=u、Az=0。由 u+w=(1,0,1)，可取 v=u+w+tz，使 Av=u+w=(1,0,1)。而 v=(1+t,0,1-t)，第二分量恆為0，因此對所有實數 t 都垂直於(0,1,0)。u、w、z 線性獨立，這些 v 互不相同，故有無窮多個，選⑤。",
        "option_analysis": [
          "① 1個：忽略核空間中可任意加入的 tz。",
          "② 2個：線性方程不是只有兩組離散解。",
          "③ 3個：解集含連續自由參數。",
          "④ 0個：v=u+w 已是符合條件的解。",
          "⑤ 無窮多個：v=(1+t,0,1-t)，t 為任意實數，正確。"
        ],
        "common_errors": "找到一組特解就停止，沒有檢查 A 的零空間；或忽略 v 的第二分量必須為0。",
        "strategy": "若 A 的某個已知向量像為0，先找特解，再檢查加入核向量後是否仍滿足額外限制。",
        "review": "複習線性映射的線性性、核空間及向量內積垂直條件。"
      }
    },
    {
      "id": "ceec-115-matha-06",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 6,
      "primary_unit": "坐標幾何",
      "secondary_concepts": [
        "等腰三角形",
        "距離公式",
        "軌跡"
      ],
      "skill_tags": [
        "三種等腰情形"
      ],
      "questionType": "single_choice",
      "points": 5,
      "answer": {
        "index": 1
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 2,
      "classification_status": "verified",
      "explanation": {
        "concept": "等腰三角形；距離公式；軌跡",
        "key_insight": "AB=AC、AB=BC、AC=BC 三種都要檢查。",
        "solution": "令 C=(t,-6)，分三種邊長相等代距離公式並排除退化情形，共2點，選②。",
        "common_errors": "只檢查 AC=BC。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "距離公式與等腰三角形分類",
        "key_insight": "等腰三角形可能有三種相等邊；列方程後還要排除三點共線的退化情形。",
        "reasoning": "令 C=(t,-6)，AB²=(-3)²+4²=25，AC²=(t-2)²+16，BC²=(t+1)²+64。① AB=AC： (t-2)²+16=25，得 t=-1 或5；t=5時 B、A、C 共線，須排除，留下 t=-1。② AB=BC： (t+1)²+64=25，無實數解。③ AC=BC： (t-2)²+16=(t+1)²+64，得 t=-15/2，符合非退化條件。合計2點，選②。",
        "option_analysis": [
          "① 1點：可能只檢查一種等腰情形。",
          "② 2點：有效的 t 為 -1 與 -15/2，正確。",
          "③ 3點：把 t=5 的共線退化情形也算進去。",
          "④ 4點：未正確解三種距離方程。",
          "⑤ 5點：將無解或退化情形誤計。"
        ],
        "common_errors": "只檢查 AC=BC；或把共線三點也當作三角形。",
        "strategy": "用距離平方代替距離以避免根號；解完每種情形後檢查三點不共線。",
        "review": "複習兩點距離、等腰三角形與向量共線判定。"
      }
    },
    {
      "id": "ceec-115-matha-07",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 7,
      "primary_unit": "不等式",
      "secondary_concepts": [
        "二元一次不等式",
        "平面區域"
      ],
      "skill_tags": [
        "畫邊界",
        "測試象限"
      ],
      "questionType": "multiple_choice",
      "points": 5,
      "answer": {
        "indices": [
          2,
          3
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 2,
      "classification_status": "verified",
      "explanation": {
        "concept": "二元一次不等式；平面區域",
        "key_insight": "改寫兩不等式，判斷半平面交集。",
        "solution": "交集可落在第三、第四象限，故③④。",
        "common_errors": "用單一測試點代表整個象限。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "二元一次不等式與平面區域",
        "key_insight": "先化為 y 的上下界，再以象限中的具體點驗證存在性。",
        "reasoning": "由 2x-y-3>0 得 y<2x-3；由 x+2y+1<0 得 y<(-x-1)/2。兩者皆為 y 的上界，對任意固定 x 都可取足夠小的 y 同時成立。第三象限取 (-1,-10)：2(-1)-(-10)-3=5>0，-1+2(-10)+1=-20<0。第四象限取 (1,-5)：2-(-5)-3=4>0，1+2(-5)+1=-8<0。第一、第二象限 y>0 時，若 x>0，第二式可能成立須 x<-1-2y<0，矛盾；若 x<0，第一式要求 x>(y+3)/2>0，矛盾。x 軸 y=0 時需 x>3/2 且 x<-1，也不可能。因此選③④。",
        "option_analysis": [
          "① 第一象限：第二式要求 x<-1-2y<0，與 x>0 矛盾。",
          "② 第二象限：第一式要求 x>(y+3)/2>0，與 x<0 矛盾。",
          "③ 第三象限：例如 (-1,-10) 滿足兩式，正確。",
          "④ 第四象限：例如 (1,-5) 滿足兩式，正確。",
          "⑤ x軸：須同時 x>3/2 與 x<-1，無解。"
        ],
        "common_errors": "只檢查一條不等式；把『某象限存在可行點』誤認成『整個象限都符合』。",
        "strategy": "多選的象限存在性題：正確選項給出一個見證點，錯誤選項用不等式推出矛盾。",
        "review": "複習半平面交集、嚴格不等式與象限符號。"
      }
    },
    {
      "id": "ceec-115-matha-08",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 8,
      "primary_unit": "矩陣",
      "secondary_concepts": [
        "矩陣冪次",
        "遞迴數列",
        "行列式"
      ],
      "skill_tags": [
        "A²關係",
        "建立遞迴"
      ],
      "questionType": "multiple_choice",
      "points": 5,
      "answer": {
        "indices": [
          1,
          4
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 2,
      "classification_status": "needs_review",
      "explanation": {
        "concept": "矩陣冪次；遞迴數列；行列式",
        "key_insight": "先找 A² 的低次關係，不必一直乘高次。",
        "solution": "由 A²=2A+I 建立遞迴，再配合 det(A^n)=(-1)^n，正確②⑤。",
        "common_errors": "只看單一元素猜規律。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-09",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 9,
      "primary_unit": "機率與統計",
      "secondary_concepts": [
        "T分數",
        "標準化",
        "迴歸直線"
      ],
      "skill_tags": [
        "線性轉換"
      ],
      "questionType": "multiple_choice",
      "points": 5,
      "answer": {
        "indices": [
          0,
          1,
          3
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 3,
      "classification_status": "verified",
      "explanation": {
        "concept": "T分數；標準化；迴歸直線",
        "key_insight": "T=50+10(S-60)/σ，兩科標準差不同。",
        "solution": "逐項代入與比較門檻，可確認①②④。",
        "common_errors": "忽略兩科標準差不同。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-10",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 10,
      "primary_unit": "平面向量",
      "secondary_concepts": [
        "梯形",
        "相似形",
        "面積比",
        "向量"
      ],
      "skill_tags": [
        "對角線交點比例"
      ],
      "questionType": "multiple_choice",
      "points": 5,
      "answer": {
        "indices": [
          0,
          4
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 3,
      "classification_status": "needs_review",
      "explanation": {
        "concept": "梯形；相似形；面積比；向量",
        "key_insight": "利用梯形對角線交點的相似比例連結上下底。",
        "solution": "先由向量求角度/面積，再由相似與面積比逐項檢核，成立①⑤。",
        "common_errors": "只算向量而忽略梯形相似。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-11",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 11,
      "primary_unit": "三角函數",
      "secondary_concepts": [
        "餘弦圖形",
        "對稱",
        "直線交點"
      ],
      "skill_tags": [
        "偶函數",
        "週期"
      ],
      "questionType": "multiple_choice",
      "points": 5,
      "answer": {
        "indices": [
          1,
          3
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 4,
      "classification_status": "needs_review",
      "explanation": {
        "concept": "餘弦圖形；對稱；直線交點",
        "key_insight": "利用 cos 的偶對稱與週期性。",
        "solution": "x→-x 的對稱支持②；再由 cos(πx/2)=-1 的解與直線條件可得④，答案②④。",
        "common_errors": "只看圖猜交點數。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-12",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 12,
      "primary_unit": "多項式函數",
      "secondary_concepts": [
        "三次函數",
        "對稱中心",
        "係數比較"
      ],
      "skill_tags": [
        "二階導數",
        "係數關係"
      ],
      "questionType": "multiple_choice",
      "points": 5,
      "answer": {
        "indices": [
          1,
          3
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 4,
      "classification_status": "needs_review",
      "explanation": {
        "concept": "三次函數；對稱中心；係數比較",
        "key_insight": "三次函數對稱中心的 x 座標可由二階導數為0取得。",
        "solution": "比較 f、g 的三次與二次係數，逐項判斷可得②④。",
        "common_errors": "從差函數圖形直接猜兩中心。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-13",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 13,
      "primary_unit": "機率與統計",
      "secondary_concepts": [
        "條件機率",
        "全機率"
      ],
      "skill_tags": [
        "先算總通過率"
      ],
      "questionType": "fill_blank",
      "points": 5,
      "answer": {
        "cells": [
          "9",
          "1",
          "0"
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 5,
      "classification_status": "verified",
      "explanation": {
        "concept": "條件機率；全機率",
        "key_insight": "分母要用通過英聽的總機率。",
        "solution": "P(碩且通)=9/20，P(通)=1/2，所以 P(碩|通)=9/10。",
        "common_errors": "把 P(通|碩)=3/5 當成反向條件機率。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "貝氏定理與條件機率",
        "key_insight": "題目已知 P(通過|碩士)，要求 P(碩士|通過)，須用全機率公式換方向。",
        "reasoning": "設 M 表示有碩士學位，T 表示通過英聽。P(M)=3/4，P(T|M)=3/5，因此 P(M∩T)=3/4×3/5=9/20。只有學士者占1/4，其通過機率為1/5，所以 P(T)=9/20+1/4×1/5=10/20=1/2。故 P(M|T)=(9/20)/(1/2)=9/10；選填依題目格式填9、1、0。",
        "option_analysis": [],
        "common_errors": "直接填3/5；或把通過者的總機率錯當成3/5。",
        "strategy": "先畫兩分支樹狀圖，再算交集機率與條件機率。",
        "review": "複習 P(A|B)=P(A∩B)/P(B) 與全機率公式。"
      }
    },
    {
      "id": "ceec-115-matha-14",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 14,
      "primary_unit": "平面向量",
      "secondary_concepts": [
        "向量垂直",
        "二次函數極值"
      ],
      "skill_tags": [
        "內積為0"
      ],
      "questionType": "fill_blank",
      "points": 5,
      "answer": {
        "cells": [
          "1",
          "4"
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 5,
      "classification_status": "verified",
      "explanation": {
        "concept": "向量垂直；二次函數極值",
        "key_insight": "方向向量(1,b)與(a,b)垂直。",
        "solution": "a+b²=0，故 a+b=-b²+b=-(b-1/2)²+1/4，最大1/4。",
        "common_errors": "求到 b=1/2 卻忘記題目問 a+b。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "向量垂直與二次函數配方法",
        "key_insight": "直線 y=bx-1 的方向向量是(1,b)，與(a,b)垂直可建立 a=-b²。",
        "reasoning": "兩向量內積為0，得 (a,b)·(1,b)=a+b²=0，因此 a=-b²。所求 a+b=-b²+b=-(b-1/2)²+1/4。因平方項非負，當 b=1/2、a=-1/4 時取得最大值1/4；依選填格式填1、4。",
        "option_analysis": [],
        "common_errors": "把直線方向向量誤寫成(b,1)；或求出 b=1/2 後忘記代回 a+b。",
        "strategy": "將垂直條件轉成單變數二次式，再配方求最大值。",
        "review": "複習直線方向向量、內積與拋物線頂點。"
      }
    },
    {
      "id": "ceec-115-matha-15",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 15,
      "primary_unit": "對數",
      "secondary_concepts": [
        "等差數列",
        "對數運算",
        "三點共線"
      ],
      "skill_tags": [
        "斜率相等"
      ],
      "questionType": "fill_blank",
      "points": 5,
      "answer": {
        "cells": [
          "3",
          "2"
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 5,
      "classification_status": "verified",
      "explanation": {
        "concept": "等差數列；對數運算；三點共線",
        "key_insight": "三點共線先寫斜率相等，再用等差關係。",
        "solution": "令 r=b/a 並以 c/a=2r-1 代入斜率方程，化簡得 r=3/2。",
        "common_errors": "只用等差條件，漏掉共線。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-16",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 16,
      "primary_unit": "二次函數",
      "secondary_concepts": [
        "拋物線平移",
        "頂點",
        "距離"
      ],
      "skill_tags": [
        "根的中點",
        "平移"
      ],
      "questionType": "fill_blank",
      "points": 5,
      "answer": {
        "cells": [
          "3",
          "5",
          "2"
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 5,
      "classification_status": "verified",
      "explanation": {
        "concept": "拋物線平移；頂點；距離",
        "key_insight": "先由兩根中點找原拋物線對稱軸。",
        "solution": "原頂點 P=(0,1)，再由平移後頂點仍在指定直線且圖形通過B解另一頂點，得 PQ=3√5/2。",
        "common_errors": "只平移頂點，沒有同步考慮整條拋物線。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-17",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 17,
      "primary_unit": "三角比",
      "secondary_concepts": [
        "正弦定理",
        "二倍角",
        "線段比例"
      ],
      "skill_tags": [
        "設角",
        "消去邊長"
      ],
      "questionType": "fill_blank",
      "points": 5,
      "answer": {
        "cells": [
          "3",
          "1",
          "1"
        ]
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 6,
      "classification_status": "verified",
      "explanation": {
        "concept": "正弦定理；二倍角；線段比例",
        "key_insight": "設角後用正弦定理與 sin2θ 消去邊長。",
        "solution": "配合角度與 BC=2BD 化簡，得到 AD/AB=3/11。",
        "common_errors": "不同三角形套正弦定理時對錯邊。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    },
    {
      "id": "ceec-115-matha-18",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 18,
      "primary_unit": "空間向量",
      "secondary_concepts": [
        "外積",
        "平行四邊形面積"
      ],
      "skill_tags": [
        "外積長度"
      ],
      "questionType": "single_choice",
      "points": 3,
      "answer": {
        "index": 2
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 6,
      "classification_status": "verified",
      "explanation": {
        "concept": "外積；平行四邊形面積",
        "key_insight": "已知外積，直接取長度就是平行四邊形面積。",
        "solution": "√(25+25+25)=5√3，選③。",
        "common_errors": "多乘1/2誤當三角形。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "外積與平行四邊形面積",
        "key_insight": "相鄰兩邊的外積向量長度直接等於平行四邊形面積。",
        "reasoning": "已知 AB×AD=(-5,5,5)。平行四邊形 ABCD 面積為 |AB×AD|=√[(-5)²+5²+5²]=√75=5√3，選③。此處不必再求出 AB 與 AD 的各分量。",
        "option_analysis": [
          "① 2√5：不是已知外積向量的長度。",
          "② 5√2：只加了部分平方分量。",
          "③ 5√3：三個分量平方和為75，正確。",
          "④ 6√3：外積長度計算錯誤。",
          "⑤ 10√2：不符外積長度。"
        ],
        "common_errors": "漏掉外積的其中一個分量；或乘1/2誤算成三角形面積。",
        "strategy": "題目直接給外積時，優先取其模長，避免反求兩邊向量。",
        "review": "複習 |u×v|=|u||v|sinθ 與平行四邊形面積。"
      }
    },
    {
      "id": "ceec-115-matha-19",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 19,
      "primary_unit": "空間向量",
      "secondary_concepts": [
        "平面方程式",
        "法向量"
      ],
      "skill_tags": [
        "外積作法向量"
      ],
      "questionType": "manual",
      "points": 4,
      "answer": {
        "grading": "manual_required",
        "reference": "x-y-z=-1"
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 6,
      "classification_status": "verified",
      "explanation": {
        "concept": "平面方程式；法向量",
        "key_insight": "AB×AD 就是平面法向量。",
        "solution": "法向量約成(1,-1,-1)，代 B=(1,2,0)：(x-1)-(y-2)-z=0，所以 x-y-z=-1。",
        "common_errors": "忘記代入已知點求常數。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required",
      "explanation_v2": {
        "schema": "explanation-v2",
        "concept": "平面法向量與點法式",
        "key_insight": "AB×AD 垂直於平面 ABCD，故可直接作為法向量。",
        "reasoning": "題設 AB×AD=(-5,5,5)，可約成法向量 n=(1,-1,-1)。平面通過 B=(1,2,0)，故點法式為 (x-1)−(y-2)−(z-0)=0。整理得 x−y−z=−1。",
        "option_analysis": [],
        "answer_elements": [
          "法向量可取(1,-1,-1)",
          "將B=(1,2,0)代入點法式",
          "整理得平面方程式 x−y−z=−1"
        ],
        "common_errors": "法向量符號與平面常數未同步；只寫法向量，漏掉代入已知點。",
        "strategy": "已知兩邊外積與平面上一點，直接套點法式 n·(X−P)=0。",
        "review": "複習外積的垂直性與平面一般式。",
        "scoring_notice": "平台整理作答步驟，非官方逐項配分。"
      }
    },
    {
      "id": "ceec-115-matha-20",
      "academic_year": 115,
      "exam": "學測",
      "subject": "math",
      "variant": "數學A",
      "question_number": 20,
      "primary_unit": "空間向量",
      "secondary_concepts": [
        "外積",
        "混合積",
        "平行六面體體積",
        "空間最遠距離"
      ],
      "skill_tags": [
        "混合積",
        "比較頂點距離"
      ],
      "questionType": "manual",
      "points": 8,
      "answer": {
        "grading": "manual_required",
        "reference": "volume=10; maxDistance=sqrt(94)"
      },
      "sourceType": "ceec_official",
      "source_title": "115學年度學科能力測驗數學A考科",
      "source_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q026476137769263238/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E8%A9%A6%E5%8D%B7.pdf",
      "answer_url": "https://www.ceec.edu.tw/files/file_pool/1/0Q018623055943601950/03-115%E5%AD%B8%E6%B8%AC%E6%95%B8%E5%AD%B8A%E5%8F%83%E8%80%83%E7%AD%94%E6%A1%88.pdf",
      "source_page": 6,
      "classification_status": "verified",
      "explanation": {
        "concept": "外積；混合積；平行六面體體積；空間最遠距離",
        "key_insight": "體積用 |(AB×AD)·AP|；最遠距離比較各頂點。",
        "solution": "由題設可得 AP=(4,4,-2)、AD=(2,3,-1)、AB=(1,-1,2)。體積=|(AB×AD)·AP|=10；比較各頂點到A的距離，AS²=94最大，所以最長距離為√94。",
        "common_errors": "直接用底面積乘 |AP|；或只比較三條棱長。"
      },
      "explanation_source": "platform_authored",
      "explanation_status": "draft_review_required"
    }
  ]
});
