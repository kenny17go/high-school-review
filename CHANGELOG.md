## 5.0 — Batch Importer 114 數A跨年度批次（2026-09-25）

- 沿用同一 Batch Importer V1 與統一 Question Bank，完成114學測數學A 20題／100分的 Raw、Staging、Review Summary、Exception Queue及共用 runtime接線。
- 依官方試卷、答案與非選評分原則核對20題；Validation為error 0、warning 0、缺號0、Exception Queue 0，所有自動內容仍保持needs_review且不寫入正式Supabase。
- 大量題庫新增114學年度篩選；115與114合計40題共用同一renderer，並新增跨年度ID、題型分布、題組與完整20題回歸測試。

## 5.0 — 115 數A完整20題共用題庫接線修正（2026-09-25）

- 修正 Batch Importer 已有20題、但 `unified-question-bank.js` runtime bridge 只提供6題單選，導致「大量題庫」顯示6題的漏接問題。
- 115數A完整20題現在全部沿用同一個 Question Bank 與共用 mixed-type renderer；題型為7題單選、6題多選、5題選填、2題非選，Q18–20沿用共用題組 context。
- 選定學測年度且一次載入完整考卷時依官方原題號排序；抽取部分題目時仍保留原有隨機組題行為。
- 加入完整題數、原題號、題型分布、選項、答案格式與題組關係 regression assertions；題目仍標記 `sync_disabled`，不寫入正式 Supabase。

## 5.0 — 共用混合題型 Renderer（2026-09-25）
- 共用 Question Contract 擴充 single_choice / multiple_choice / fill_blank / numeric / short_answer / essay，不建立學測專用 renderer。
- 練習模式加入多選勾選、選填多格輸入、數值與非選文字作答；單選既有操作維持。
- 模考模式同步支援混合題型，答案與詳解維持交卷後才顯示；short_answer / essay 保留作答但不假裝自動判分。
- LearningStorage 改用共用答案判定，錯題紀錄可正確處理多選與選填。
- staging 的 CEEC runtime 題目標記 sync_disabled，避免正式 Supabase schema 尚未升級時誤寫 production。
- 新增 mixed question contract regression fixtures；本批未寫入 Supabase。

## 5.0 — 共用題組 Question Group（2026-09-25）
- 統一題庫加入 Question Group：Question 負責獨立作答／評分／詳解／錯題，Group 負責共用題幹／公式／圖片等閱讀情境。
- 115數A Q18–20 建立永久 group_id；Q18 不再把共用題幹複製進自己的 stem。
- 共用練習 renderer 遇到 group_id 自動帶出題組情境；同一批連續題只完整顯示一次，後續題標示延續題組。
- 加入 depends_on 設計規則：只有後題真的依賴前題作答結果時才整組抽題。
- 本批仍未寫入 Supabase。

## 5.0 — 統一題庫來源整合第一階段（2026-09-25）
- 「大量題庫」新增來源與年份篩選；學測不再只能走獨立展示頁。
- 新增 unified-question-bank.js runtime bridge，將115數A已完成題面核對的首批單選真題轉成共用 question contract，直接使用既有題庫卡、作答、我不會、問 ChatGPT、詳解看不懂與錯題流程。
- 第一批接入 Q1、Q2、Q3、Q4、Q6、Q18；其餘題目仍留在 staging/needs_review，避免公式或圖形未核對就發布。
- 未寫入 Supabase；正式資料庫仍維持不變。

## 5.0 — 115 學測數A統一真題題庫（2026-09-25）

- 將既有 115 數A成果整併為單一題庫資料：20題／100分共用於「依年份」與「依單元」瀏覽，不建立重複資料。
- 每題加入主要單元、次要觀念、技能標籤、題型、官方答案、官方頁碼與平台自製「觀念／破題／完整解法／常見錯誤」。
- Q5、Q8、Q10～Q12 保留 needs_review，不把公式／圖形題誤標為人工驗證完成；Q19/Q20 維持非選人工評閱。
- GSAT 頁面新增單元篩選與分層解析；整份瀏覽仍依題號順序顯示。未寫入正式 Supabase。
- build 更新為 `5.0-gsat-115-2`。

# 變更紀錄

## 5.0 — 國文內容檢查與補強（2026-09-20）

- 逐題檢查既有 150 題平台國文題；補強 124 題詳解，加入古文字義判斷、文本線索、推論界限與詩詞表達分析。
- 修正《岳陽樓記》推論措辭、《鴻門宴》僅依短句可判斷的範圍，區分「鍥」字義與成語義；活動延期題補明新日期已確定，修正繁體用字。
- 保留 150 題原題號、答案索引、45 份文章、45 組題組、98 筆文本關聯及原有科目／年級設定；不新增真題或官方範圍。
- build 與快取版本同步為 `5.0-content-review-1`；審閱依據與限制見 `docs/chinese-content-review.md`。本次為 AI 內容審閱，不等於教師審定或正式來源驗證。

## 5.0 — 未發布

- 接續 limit 中斷的 V5 實作，新增國文歷屆真題來源／篇目／年級篩選與學習分類統計。
- 修正雲端國文題組文章關聯、切年級舊題清理、來源頁延遲回應與同編號跨科錯題／待詢紀錄隔離。
- 匯入輸出補齊關聯驗證時間，發布輸出再驗證來源、人工審核證據與文本關聯；無答案來源仍保留 metadata。
- 增加國文雲端隔離瀏覽器測試與文章權利 RLS 測試，補齊 V5 驗證報告；build 為 5.0-acceptance-3。
- 修正 390px 下長標題擠壓資料庫設定按鈕的排版，維持設定按鈕橫向可操作。

- 匯入審核拒絕缺少或重複選項、缺少詳解、無效答案／學年度／來源類型／網址協定；前端真題驗證同步拒絕無效學年度，保留無答案來源資料流程。

- 修正 localStorage 遷移中斷後重試會覆蓋既有 V5 快照的問題；保留已遷移紀錄與統計，僅補入缺少項目，新增重試與設定保留測試。

- 增量加入 Subject Registry、共用題目／文本／能力關聯及版本化 localStorage migration。
- 國文高一／高二、核心15＋平台延伸15精讀、150題原創題、題源／能力／弱點篩選與實際作答熟練度。
- 288組國文平台範圍；真題目前0題，無資料處明確待補。
- 題庫按科目／年級分頁載入，保留數學 Frozen Core 與所有設定。
- 新增只產生待審候選資料的匯入流程、本機 PostgreSQL migration/RLS 測試；沒有執行正式 migration。


## 4.9.7.7 — 已核准發布

- 保留既有 250 題高一題庫、420 題高二原創模擬題及已修正的舊 bug。
- 高二恢復 A、B、AB 共通分流，沿用 Supabase `subjects`、`subject_id`、`curriculum_track`。
- 範圍明列 112/113/114 × 八校 × A/B/AB × 兩學期 × 三次段考，支援精確年度與官方來源覆蓋。
- 題組選項隨機化，正確答案及雲端原始選項索引一起轉換。
- 保留練習、模考、我不會、錯題、學習數據、分層詳解、歷屆來源、資料完整度與 Supabase 設定。
- 新增維護規則、版本檔、發布說明、npm 驗證入口與回歸測試。

基線說明：目前可核對的 HEAD 是 `4ae4232`，該提交頁面標示 4.9.7.1。使用者提及的 4.9.7.6 工作成果以目前未提交檔案完整保留，未據此虛構另一個 Git 提交或覆蓋現有工作。

## 遠端整合
- 合併 origin/main a7c69fe，保留 V4.9.7.6 提交歷史、額外題庫檔與歷版說明。
- 保留資料完整度「已搜尋但未公開」狀態。
- 舊 extra-questions-high2-v4973.js 原檔保留；因會直接混入高一 fallback，V4.9.7.7 改由獨立 420 題與雲端 adapter 載入。

## V4.9.7.6 — 2026-09-12
- 建立 Codex-ready 發布結構、維護規則與 npm test。
- 保護 config.js、fallback-data.js，核心功能延續 V4.9.7.5。
## 5.0 — Batch Importer 115 數A Golden Sample（2026-09-25）

- 將 115 學測數學A 20題／100分完整送入 Batch Importer V1，產生可重現的 Raw、Staging、Review Summary 與 Exception Queue；沒有寫入正式 Supabase。
- 新增整份考卷層級檢查：預期題數、缺號、題型分布、官方答案 manifest、答案來源 URL、頁碼、解析／分類信心與題目 review flags。
- 官方答案 1–20 全數吻合，Q18–20 共用題組關聯完整；所有自動資料仍維持 needs_review，不會自行升格 verified/published。
- Exception Queue 明確攔截既有 metadata 缺選項、公式／圖形視覺核對與非選評分規準，不以假內容通過發布閘門。
- 修正共用題庫 Q2 最大整數函數題幹的 `99-x` 符號錯誤，並補齊既有版本／快取一致性。
- 補齊 Q5、Q7–Q17、Q19–Q20 題面與 Q5、Q7–Q12 完整選項；以官方 PDF 渲染頁面視覺核對矩陣、向量、三角函數、多項式與題組附圖。
- 修正 Q10 面積選項為 `65/3`；依官方非選評分原則修正 Q20 體積由錯誤的30改為10、AP向量為(4,4,-2)，並加入 Q19／Q20 滿分與部分給分規準。
- 修正後 review summary 為 clean 20、blocking error 0、warning 0、Exception Queue 0；自動資料仍全部維持 needs_review，未發布或寫入 Supabase。
