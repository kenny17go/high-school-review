# V5.0 交付與驗證報告

日期：2026-09-19。工作 build：`5.0-acceptance-3`。Git 基準：`27431f880cc1c47b6fdb9c817a5fda4df866dd17`，分支 `main`。

依原「Codex Implementation Spec V2」續作。原任務因額度中斷，本次找回原始規格，完成缺口修正及交付核對。**尚未 commit / push / 部署；migration 尚未套用正式資料庫。**

## A–B. 修改與新增檔案

已追蹤檔案異動：`.gitignore`、`AGENTS.md`、`CHANGELOG.md`、`DEPLOY.md`、`README.md`、`app.js`、`index.html`、`package.json`、`package-lock.json`、`scripts/validate.mjs`、`tests/browser.test.cjs`、`version.json`。

新增檔案：`subject-registry.js`、`classical-texts.js`、`learning-core.js`、`learning-storage.js`、`subject-adapters.js`、`chinese-data.js`、`scripts/import-sources.mjs`、`supabase/migrations/20260914151605_v5_subject_core.sql`、`tests/v5-data.test.cjs`、`tests/v5-browser.cjs`、`tests/v5-cloud-browser.cjs`、`tests/migration.test.mjs`、`docs/architecture.md`、本報告。

`config.js`、`fallback-data.js`、既有高一／高二題庫、`learning-catalog.js`、`grade2-scopes.js`、manifest 與 PWA 圖示與 HEAD 相同。Supabase CLI 的 `.temp` 為產生檔，已列入忽略，不刪除原檔。

## C–G. 共用架構

Subject Registry 正式開放 math、chinese，預留物理、化學、生物、地科、英文、歷史、地理、公民；高三只預留。科目切換不 reload，國文透過 adapter 共用練習、模考與紀錄功能，數學維持 Frozen Core。

共用問題契約包含 subject、grade、course、semester、category、unit、chapter、skill、題型、題幹、選項、答案、詳解、難度、來源及科目 metadata；保留 q/o/a/e 相容欄位。範圍含科目／課程／年級／學校／學年度／學期／段考。國文目前有 **288 組平台模擬範圍**，不是官方教材映射。

Classical Text Registry 有 **30 個唯一永久 text_id**：核心 15 篇＋平台選編延伸 15 篇。延伸組不是舊推薦選文的完整差集。題目透過 question_text_links 多對多關聯，目前 **98 筆關聯**，含 direct、comparison、extended；間接關聯結構亦已預留。已驗證且 confidence ≥ 0.9 的關聯才供篩選與真題覆蓋統計。

14 種 skill 支援七層能力；沒題目的層級顯示待補。人物／思想目前 0 題，語譯 2 題、延伸閱讀 1 題、學測型模擬 1 題，仍需優先補強。

## H. 國文第一批模擬題

**總計 150 題，全部為 platform_simulated；沒有冒充真題。** 原規格建議 200–300 題但明定品質優先，本階段保留原已完成的 150 題，不為達建議數量灌題。這是架構驗證題庫，尚非完整教學題庫；未聲稱已由國文教師逐題審校。

| 分類 | 題數 |
|---|---:|
| 課內文本 | 30 |
| 國學常識 | 4 |
| 字音字形 | 4 |
| 字義／詞義 | 32 |
| 成語 | 4 |
| 修辭 | 4 |
| 文法／語法 | 2 |
| 文言文閱讀 | 32 |
| 白話文閱讀 | 20 |
| 古典詩詞 | 10 |
| 語文表達 | 4 |
| 綜合閱讀 | 4 |

## I–J. 精讀、熟練度與題組

core15 / extended15 / 全部可自由勾選，支援全選、清除、弱點篇目、能力多選、題源、指定學校及只練弱點。text AND skill AND source 共同限制題池，空選或缺題不跨範圍補足。

熟練度只由實際作答計算，支援科目、篇目、skill、category。重複交卷不重複計入 V5 熟練度。未作答不顯示假百分比。

**45 份 passage、45 組 question group**；共用文章不重複儲存，抽出的同文章題相鄰且文章只顯示一次。雲端文章由關聯取得；未公開或缺失文章不以 metadata 偷渡替代。

## K–M. 真題、八校及篇目覆蓋

以下是本機交付資料統計，**不是本次對正式資料庫的查詢結果**。測試 fixture 不計入題庫。

學測國文：收錄 **0**、已驗證 **0**、needs_review **0**。來源 URL 索引不當成已收錄的逐題資料。

| 學校 | 收錄題數 | 有答案 | 無答案 | 已驗證 | needs_review |
|---|---:|---:|---:|---:|---:|
| 建國中學 | 0 | 0 | 0 | 0 | 0 |
| 北一女中 | 0 | 0 | 0 | 0 | 0 |
| 師大附中 | 0 | 0 | 0 | 0 | 0 |
| 成功高中 | 0 | 0 | 0 | 0 | 0 |
| 中山女高 | 0 | 0 | 0 | 0 | 0 |
| 松山高中 | 0 | 0 | 0 | 0 | 0 |
| 延平高中 | 0 | 0 | 0 | 0 | 0 |
| 薇閣高中 | 0 | 0 | 0 | 0 | 0 |

| 群組 | 篇目 | 平台關聯題 | 已驗證真題 |
|---|---|---:|---:|
| core15 | 燭之武退秦師 | 3 | 0 |
| core15 | 大同與小康 | 3 | 0 |
| core15 | 諫逐客書 | 3 | 0 |
| core15 | 鴻門宴 | 3 | 0 |
| core15 | 出師表 | 4 | 0 |
| core15 | 桃花源記 | 4 | 0 |
| core15 | 師說 | 4 | 0 |
| core15 | 虯髯客傳 | 3 | 0 |
| core15 | 赤壁賦 | 3 | 0 |
| core15 | 項脊軒志 | 3 | 0 |
| core15 | 晚遊六橋待月記 | 3 | 0 |
| core15 | 勞山道士 | 3 | 0 |
| core15 | 勸和論 | 3 | 0 |
| core15 | 鹿港乘桴記 | 3 | 0 |
| core15 | 畫菊自序 | 3 | 0 |
| extended15 | 勸學 | 5 | 0 |
| extended15 | 漁父 | 3 | 0 |
| extended15 | 馮諼客孟嘗君 | 3 | 0 |
| extended15 | 典論・論文 | 3 | 0 |
| extended15 | 與陳伯之書 | 3 | 0 |
| extended15 | 世說新語選 | 3 | 0 |
| extended15 | 蘭亭集序 | 3 | 0 |
| extended15 | 始得西山宴遊記 | 3 | 0 |
| extended15 | 諫太宗十思疏 | 3 | 0 |
| extended15 | 岳陽樓記 | 4 | 0 |
| extended15 | 醉翁亭記 | 5 | 0 |
| extended15 | 郁離子選 | 3 | 0 |
| extended15 | 原君 | 3 | 0 |
| extended15 | 廉恥 | 3 | 0 |
| extended15 | 臺灣通史序 | 3 | 0 |

已驗證真題覆蓋 **0/30＝0%**；平台練習關聯覆蓋 **30/30**，兩者不可混淆。國文歷屆頁已支援題源、篇目、年級、學校、學年度、學期、段考；明列目前載入的範圍。資料完整度保留題／答／範圍／已搜尋未公開／未收集狀態；無可靠資料不假造勾選。

## N–O. 遷移與資料工程

Supabase migration 為增量 SQL，沿用現有 project、subjects、questions，補科目關聯及文本／題組／候選表。候選資料不授權前端讀寫；文章與關聯受 RLS 審核及權利條件限制。僅在 **PGlite 本機 PostgreSQL** 重複執行並測試；不是完整 staging copy 演練，**沒有套用正式環境**。

localStorage migration 為版本化追加；原 key 與原始紀錄不刪除。中斷後可重試，已遷移快照優先，避免覆蓋或把統計重複相加。缺 subject 的舊作答視為 math，保持科目隔離；Supabase 設定及登入儲存內容不清除。

匯入流程接受人工保存的候選 JSON，輸出 needs_review / unclassified；需審核者、來源、權利及每項文本關聯證據才能 verify。輸出發布階段再驗證資料及證據。無答案來源可保存 metadata，不捏造答案。沒有 OCR、網路自動抓題或直接寫入正式資料庫的排程。

## P–T. 驗證範圍

本次完整測試結果及畫面核對於下方驗證紀錄更新。`npm test` 包含：

- 數學：250 題高一保留、420 題高二答案／選項、112–114 × 八校 × A/B/AB × 上下學期 × 三段考，共 432 組；練習／模考評分、來源、設定與年級隔離。
- 國文：150 題契約、30 篇 registry、288 組平台範圍、多對多、精讀／能力／來源／弱點篩選、題組、作答熟練度與分類統計。
- 跨科：無 reload、不混題、不混紀錄；同編號 math/chinese 錯題與待詢清單隔離；舊統計保留。
- 雲端 fixture：只取選定科目＋年級、文章關聯、缺文章拒收、待審題排除、年級延遲回應、來源頁過期回應、原始選項索引還原與負數本機 ID 不送 SQL。
- 分頁：1201 筆分三頁；數學首頁不請求國文題庫；國文切換只載入一次本機檔。未做大型正式題庫效能壓測。
- PostgreSQL：migration 重跑、舊資料保留、subject 回填、多對多；anon/authenticated 不能讀未審文章或未確認權利文章，不能寫教材表。
- 390px：科目選擇、篇目／能力勾選、熟練度與來源篩選可操作、無水平溢出；桌面 Edge 的行動寬度不等於實機 iPhone/PWA 安裝驗證。

## U–V. Git 交付快照

完整工作目錄快照附於報告末尾。`git diff --stat` 不包含未追蹤的新檔，須與 `git status --short --untracked-files=all` 一起核對。沒有刪除原始題庫或重置未提交工作。

## W–X. 尚缺資料與後續

1. 國文學測／八校逐題真題與官方課次 mapping 仍未收錄；出版社、班群與版本需由可靠資料逐筆核驗。
2. 第一批 150 題屬架構驗證，需教師審校與能力分布補強；尤其人物／思想、語譯、延伸、學測型能力。
3. 正式資料庫 migration 前需對完整 staging copy 演練、核對既有權限與資料量；本次沒有執行正式 API 寫入或登入同步驗證。
4. iPhone 實機安裝／更新及正式登入信件流程待測；圖示原檔保留。
5. 原規格第一階段沒有要求自動 OCR／完整抓取；後續可建立人工候選資料批次與審查流程，再考慮經核准的發布自動化。

**本次停在可審查的本機成果；commit、push 與部署須另經使用者確認。**

## 最終驗證紀錄

- 完整 npm test：通過（exit code 0）。
- git diff --check：通過（exit code 0）；僅有既有 LF/CRLF 提示。
- 保護檔案與 HEAD 比對：無差異。
- 異動檔案常見秘密金鑰格式掃描：0 命中；此為基本格式掃描，不代表全面安全稽核。
- Edge 390px 手機畫面人工核對：標題、橫向設定按鈕、篇目／能力與歷屆篩選可操作。
- 測試日誌：test-results/v5-test.log；手機截圖：test-results/v5-*-mobile.png（本機忽略檔，不納入提交）。
- origin：https://github.com/kenny17go/high-school-review.git；分支：main。

### git diff --stat（已追蹤檔案）

```text
 .gitignore             |   1 +
 AGENTS.md              |  12 +++
 CHANGELOG.md           |  19 ++++
 DEPLOY.md              |   9 +-
 README.md              |  15 +++
 app.js                 | 244 ++++++++++++++++++++++++++++++++++++-------------
 index.html             |  24 +++--
 package-lock.json      |  12 ++-
 package.json           |   9 +-
 scripts/validate.mjs   |   7 +-
 tests/browser.test.cjs |  38 ++++----
 version.json           |  27 ++++--
 12 files changed, 315 insertions(+), 102 deletions(-)
```

### git status --short --untracked-files=all

```text
 M .gitignore
 M AGENTS.md
 M CHANGELOG.md
 M DEPLOY.md
 M README.md
 M app.js
 M index.html
 M package-lock.json
 M package.json
 M scripts/validate.mjs
 M tests/browser.test.cjs
 M version.json
?? chinese-data.js
?? classical-texts.js
?? docs/architecture.md
?? docs/verification.md
?? learning-core.js
?? learning-storage.js
?? scripts/import-sources.mjs
?? subject-adapters.js
?? subject-registry.js
?? supabase/migrations/20260914151605_v5_subject_core.sql
?? tests/migration.test.mjs
?? tests/v5-browser.cjs
?? tests/v5-cloud-browser.cjs
?? tests/v5-data.test.cjs
```

建議提交名稱：V5.0 全科目核心架構與國文第一階段。待使用者確認後才 commit / push。
