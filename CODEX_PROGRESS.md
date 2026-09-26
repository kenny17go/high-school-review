# CODEX_PROGRESS.md

> 本檔案是 high-school-review 的開發交接紀錄。每次開始工作先讀 `AGENTS.md` 與本檔，再核對 Git HEAD、`version.json` 與實際程式；實際 repository 狀態優先。

## 2026-09-26 Repository Reality Check + 111 數A checkpoint

- Repository `kenny17go/high-school-review` 已從 GitHub 最新 `main` clone；工作開始時 branch 為 `main`、HEAD 與 `origin/main` 同為 `e44f0ba`（112數A跨年度批次），工作樹乾淨。最近四個資料里程碑 commit 為112／113／114／115，111資料尚未存在於 GitHub；沒有未提交的111檔案、builder、staging或 runtime 接線，故中斷點在111資料建置開始之前。
- 已核對 `AGENTS.md`、本檔、`docs/architecture.md`、`version.json`、`CHANGELOG.md`、最近 commits 與實際檔案；既有115／114／113／112 Golden artifacts、統一 Question Bank 與 Batch Importer 保留並回歸。
- 新增111數A官方來源：大考中心原卷（8頁）、選擇（填）題答案（1頁）、非選評分原則（3頁）。逐頁下載、文字抽取並渲染檢查原卷圖示；資料題數20、配分100、官方答案20/20、題號1–20無缺漏。原始來源網址寫入 Raw 與每題 provenance。
- 新增 `gsat-111-unified-bank.js`、兩個官方圖示 asset、`scripts/build-gsat-111-golden.mjs`，重建 `data/raw/ceec-111-matha.json` 與 `data/staging/ceec-111-matha.batch-import-v1.json`。Review Summary clean 20、validation needs_review 0、error 0、warning 0、Exception Queue 0；自動分類與平台詳解仍全數 `classification_status=needs_review`、`ready_for_publish=false`，不會把 AI／平台內容標成 verified。
- Q3散布圖與Q11立體圖以官方頁面裁切圖接入共用題面；`app.js` 的共用練習／模考 renderer 支援受限的本機 image asset。修正共用「我不會」按鈕把字串題目 ID 轉成數字的 bug，避免111學測記錄失效。
- 共用 runtime 接入111完整20題，Q18–Q20共用題組；練習年份新增111，111–115共100題。更新 build/cache `5.0-batch-111-1`、CHANGELOG、architecture 與 regression test。
- 驗證：`npm test` 除 Playwright browser step 外已通過 validate、V5 data、115 GSAT、Batch Importer、115/114/113/112/111 Golden、PostgreSQL migration，`git diff --check` PASS。Browser step因環境無 `/opt/microsoft/msedge/msedge`，嘗試下載 Chromium也被執行環境截成0 MiB非zip，未能啟動；已新增 browser assertions 檢查111完整20題、圖片載入及字串ID學習紀錄，需在有Chromium/Edge的環境執行。
- 本輪未連接或寫入正式 Supabase。使用者已明確授權111數A commit／push／部署；主里程碑提交 `6135f3d` 已推送 `main`，GitHub Pages 線上 `version.json` 為 `5.0-batch-111-1`，111題庫腳本回傳HTTP 200，部署完成。
- Next: 111里程碑已交付。後續若繼續歷屆批次，可從110學測數A開始，沿用同一 Batch Importer V1 與人工只處理 Exception Queue 的流程。

## 2026-09-25 112 數A完整20題跨年度 Batch milestone

- 沿用現有 `batch-import-v1`、Unified Question Bank V1、Question Group 與共用 renderer；沒有新增112專用 importer、renderer或第二套題庫，也未連接或寫入正式 Supabase。
- 依大考中心官方試卷8頁、選擇（填）題參考答案1頁、非選擇題滿分參考答案與評分原則3頁逐頁渲染核驗112數A 20題／100分；題型為單選7、多選6、選填5、非選2，Q18–Q20共用題組。
- 新增 `gsat-112-unified-bank.js`、`scripts/build-gsat-112-golden.mjs`，產生 `data/raw/ceec-112-matha.json` 與 `data/staging/ceec-112-matha.batch-import-v1.json`。答案20/20與官方 manifest 一致，題號1–20無缺號。
- Review Summary：clean 20、needs_review 0（指額外驗證例外為0）、error 0、warning 0、Exception Queue 0；整批20題的 `classification_status` 仍固定為 `needs_review`，`ready_for_publish=false`，runtime `sync_disabled`，不把自動內容假裝成人工核准。
- Q19／Q20附官方評分原則；官方答案分別核對為 `Q=(-36/25,48/25)` 且 `BQ=2AP`，以及點線距離 `72/25`、四邊形面積 `108/25`。
- 共用 runtime 擴為112／113／114／115數A共80題；大量題庫年份篩選新增112，選定年度依原題號取得完整20題。build/cache更新為 `5.0-batch-112-1`，新增112 Golden與80題唯一ID、題型分布、題組回歸，113／114回歸同步提升為80題。
- `validate`、V5 data、115 GSAT、Batch Importer、115／114／113／112 Golden與PostgreSQL migration均PASS；`git diff --check` PASS。browser test已加入112／113／114各20題UI斷言，但本機仍缺少 `/opt/microsoft/msedge/msedge`，Playwright無法啟動，屬既知執行環境限制。
- 本紀錄撰寫時尚待授權；GitHub 實際狀態已由後續 commit `e44f0ba` 確認112里程碑已 commit／push。下一批111進度詳見本檔最前方最新 reality check。

## 2026-09-25 113 數A完整20題跨年度 Batch milestone

- 以最新已部署的114／115流程為基礎，沿用同一 `batch-import-v1`、Unified Question Bank V1、Question Group 與共用 renderer；未建立113專用 importer、renderer或第二套題庫，也未寫入正式 Supabase。
- 依大考中心官方試卷、選擇（填）題參考答案、非選擇題評分原則及第7題試題／答案反映意見回覆，逐頁渲染核驗113數A 20題／100分；題型為單選7、多選6、選填5、非選2，Q18–Q20共用題組。
- 新增 `gsat-113-unified-bank.js`、`scripts/build-gsat-113-golden.mjs`，產生 `data/raw/ceec-113-matha.json` 與 `data/staging/ceec-113-matha.batch-import-v1.json`。答案20/20與官方 manifest 一致，題號1–20無缺號、error 0。
- Review Summary：clean 19、needs_review 1、warning 1、Exception Queue 1。唯一例外為Q7 `official_answer_objection_resolved`：考後有人主張平移後圖形亦應算相同，但大考中心明確以坐標點集不同回覆並維持官方答案③④；資料保留官方回覆 URL 與原答案，不自行改答。
- 所有20題分類與平台詳解均保持 `needs_review`、`ready_for_publish=false`；runtime 使用 `sync_disabled`。Q19／Q20附官方評分原則，Q16填答經版面核對為 `2√5/5`。
- 共用 runtime 現含113／114／115數A共60題；大量題庫年份篩選新增113，選定年度依原題號取得完整20題。build/cache 更新為 `5.0-batch-113-1`，新增113 Golden／Exception Queue／60題唯一ID與題型分布回歸，114回歸同步提升為60題。
- Validate、V5 data、115 GSAT、Batch Importer、115／114／113 Golden與PostgreSQL migration均PASS。browser test已加入113與114各20題UI斷言；本機環境沒有Edge／Chromium，故本機 Playwright 無法啟動，但部署後已用線上瀏覽器實測113篩選可產生完整20題且題號01–20連續。
- 使用者已明確授權113數A commit／push／部署；主里程碑提交 `2e1fd45` 已推送 main，GitHub Pages `pages-build-deployment #104` 成功。線上 build 為 `5.0-batch-113-1`，實測113／114／115共用 runtime，113篩選顯示20題、來源與年度文字正確。下一建議批次為112學測數A。

## 2026-09-25 114 數A完整20題跨年度 Batch milestone

- 以115數A已完成流程為基礎，沿用同一 `batch-import-v1`、Unified Question Bank V1、Question Group 與共用 renderer；沒有新增114專用 importer、renderer或第二套題庫。
- 依大考中心官方試卷、參考答案及非選擇題評分原則，建立114數A 20題／100分完整資料與獨立答案 manifest；題型為單選7、多選6、選填5、非選2，Q18–Q20共用題組。
- 產生 `data/raw/ceec-114-matha.json` 與 `data/staging/ceec-114-matha.batch-import-v1.json`；Review Summary 為 clean 20、error 0、warning 0、Exception Queue 0、缺號0、答案20/20一致。
- 所有自動分類與平台詳解仍保持 `needs_review`，`ready_for_publish=false`；runtime 使用 `sync_disabled`，沒有寫入正式 Supabase，也沒有假造人工 verified/published。
- 共用 runtime 現含115與114數A共40題；大量題庫年份篩選新增114，選定年度可依原題號取完整20題。新增114 Golden/regression test並保留115回歸。
- build 更新為 `5.0-batch-114-1`。Validate、V5 data、115 GSAT、Batch Importer、115/114 Golden與PostgreSQL migration均PASS；browser test已加入114完整20題UI斷言，但執行環境缺少Edge/Chromium，且Playwright下載被截斷，故瀏覽器回歸未實際完成。
- 使用者已明確授權114數A commit／push／部署；主里程碑提交 `169908d` 已推送 main，GitHub Pages run #102 成功。線上 `version.json` 為 `5.0-batch-114-1`，實際載入線上114／115／runtime腳本驗證為40題（114與115各20題），114題號01–20與Q18–Q20題組完整。下一建議批次為113學測數A。

## 2026-09-25 115 數A完整20題 runtime 接線修正

- 使用者回報「大量題庫」篩選學測真題／115學年度只顯示6題。實際核對確認 Raw 與 Staging 均為完整20題，問題位於 `unified-question-bank.js`：content map 只有 Q1、Q2、Q3、Q4、Q6、Q18，且最後只保留整數單選答案，因而排除所有多選、選填、非選題。
- runtime bridge 已補齊 Q1–Q20 題面，並依既有共用 question contract 映射7題單選、6題多選、5題選填、2題非選；沒有建立 GSAT 專用 renderer。Q18–Q20保留同一 Question Group。
- 選定學測年度並載入完整考卷時改依 `question_number` 顯示1–20；少量抽題仍維持原本隨機行為。
- 全20題仍為本機官方來源資料，保留 `sync_disabled`；本次沒有寫入正式 Supabase，也沒有變更 Supabase schema。
- regression 改為要求 runtime 恰好20題、題號1–20連續、題型分布／選項／答案 shape／題組關係正確，避免再退回6題。
- 實際重建 Golden artifacts：20題、clean 20、Exception Queue 0、error 0、warning 0；20題仍全為 staging `needs_review`，所以 `ready_for_publish=false`，沒有藉本次前端修正偽造人工核准。
- `validate`、V5 data、GSAT、Batch Importer、Golden Sample、PostgreSQL migration 與 `git diff --check` 全部 PASS。完整 `npm test` 只在既知環境限制中止：系統缺少 `/opt/microsoft/msedge/msedge`，產品 assertions 在此之前均通過。
- build/cache 更新為 `5.0-batch-golden-3`。本節的 commit、push、Pages 與線上驗證結果須以本輪完成後的 Git/GitHub 實際狀態為準。

## 2026-09-25 Batch Importer V1 — 115 數A Golden Sample milestone

- 以最新 HEAD `9ce30d7` 為基準，在本機完整執行 Batch Importer V1；沒有重做既有架構，也沒有寫入正式 Supabase。
- 新增 `scripts/build-gsat-115-golden.mjs`，將既有 115 數A 20題 metadata、共用 runtime 題面與獨立官方答案 manifest 組成可重現 Raw input，再輸出 Staging artifact。
- 產物：`data/raw/ceec-115-matha.json`、`data/staging/ceec-115-matha.batch-import-v1.json`；20題／100分、1–20無缺號、答案20/20一致、Q18–20題組完整。
- Importer 加入整卷題數／缺號、答案 URL、官方答案 mismatch、頁碼、解析／分類 confidence、review flags 與題型／狀態統計；所有自動題仍固定 needs_review。
- 初次 Review Summary：clean 9、Exception Queue 11、blocking error 7、warning 9。接續補齊題面／選項並以官方 PDF 渲染視覺核對後，最新結果為 clean 20、Exception Queue 0、blocking error 0、warning 0；仍因全卷保持 needs_review 而 `ready_for_publish=false`。
- 找到並納入大考中心 Q19／Q20 官方非選評分原則。修正重大內容錯誤：Q20 `AP=(4,4,-2)`、體積10、最長距離√94；原資料錯寫 AP=(3,4,-3)、體積30。另修正 Q10 第四選項為65/3。
- 修正共用 runtime Q2 題幹符號為 `f(x)=[99-x]+[99+x]`；同步 build/cache 為 `5.0-batch-golden-2`，並修復本輪開始即存在的 version name/cache validation 不一致。
- 新增 `tests/gsat-115-golden.test.mjs` 並納入 `npm test`。validate、V5、GSAT、Batch Importer、Golden、PostgreSQL migration 全部 PASS。
- Browser regression 尚未在本環境完成：repository 預設 Edge 不存在；Playwright Chromium 下載因執行環境回傳 0 MiB 非 zip 而失敗。既有 browser test 未因產品 assertion 失敗，需由 GitHub Actions 或具瀏覽器環境重跑。
- 使用者已於 2026-09-25 明確授權本里程碑 commit、push、部署；提交與 Pages 結果須以 Git/GitHub 實際狀態核對。
- Next：由教師／內容審核者覆核20題分類與平台四層詳解，才可 approve/publish artifact；下一資料批次建議沿用相同 pipeline 處理114學測數學A。不可建立 GSAT 專用題庫或 renderer。

## Current Task
2026-09-20：DONE（內容與測試）— 國文既有150題內容檢查，補強124題詳解、修正語意與用字，完成回歸與相容性比對。未新增科目或真題。

使用者本輪明確要求「國文內容檢查與補強：檢查現有題目、答案與詳解，沒問題就將已完成的交接紀錄 commit、push」。測試已通過，將本次內容修正、審閱報告與交接紀錄一併交付；不用再詢問相同授權。本檔為提交前驗證快照，實際提交／推送／部署結果須以 Git 與 Pages 查核。

### 中斷點與核對依據
- 回顧前一任務「繼續專案工作」（01a0ba04-ebbd-7971-b7a2-f647f4f6cc77）：使用者要求提交／推送前詢問，之後明確回覆「同意」。該輪已成功 commit 及 push `64f2483`，才因額度中斷；不要再次提交同一批 V5 功能。
- 本次開始時本機 HEAD 與過期的 origin/main 均為 `64f2483`，工作目錄乾淨；本機只有舊 AGENTS.md，CODEX_PROGRESS.md 不存在。
- fetch 後確認遠端另有 `384a3a5`（新增交接）與 `f06aa8f`（整理維護規則），差異只有 AGENTS.md、CODEX_PROGRESS.md。已以 fast-forward 同步，沒有建立新提交。
- 已完整閱讀新舊規則、原始交接、CHANGELOG、驗證／架構／發布文件，核對程式 build marker、HTML script query、測試入口與 Git 歷史。
- docs/verification.md 的「待確認 commit / push」及工作目錄清單是上次提交前的歷史快照，不是現在狀態。

## Current Repository State
- Repository: `kenny17go/high-school-review`
- Branch: `main`
- 本輪修改基準／提交前 fetch 確認 HEAD 與 origin/main: `f06aa8f1cf4a30a060c78fbc9ac6c06f37c29e27`
- 基準 Commit: `docs: consolidate project and Codex development rules`
- 本輪交付提交名稱：`V5.0 國文題目詳解補強與交接紀錄`。完整 SHA 請由 `git log -1` 取得，不在提交內容中虛構自身 SHA。
- V5 功能提交: `64f24832c863f833259653eb4a077713060ceccb`，`V5.0 全科目核心架構與國文第一階段`
- `version.json`: V5.0 / build `5.0-content-review-1`
- Status: `unreleased`
- Base: V4.9.7.7
- 科目狀態：math = stable、chinese = phase1、physics = planned
- 前輪 GitHub Pages 已成功部署 f06aa8f；run https://github.com/kenny17go/high-school-review/actions/runs/35451525827 。這不是本輪新版的部署證據。
- 網站 https://kenny17go.github.io/high-school-review/ 。本輪推送後應核對版本為 `5.0-content-review-1`、app marker、HTML cache query 與延遲國文題庫內容；`unreleased` 是原有發布標記，不代表網站離線。
- 提交範圍僅下列8個檔案。正式資料庫、本機設定與學習紀錄沒有變更。

## Completed
- 已建立 V5 全科目共用核心架構。
- 已加入 Subject Registry / adapter 架構，後續新科目應從此接入，不複製整套 app。
- 數學 V4.9.7.7 保持 Frozen Core。
- 國文第一階段已加入：高一／高二、核心15＋平台選編延伸15篇、150題平台原創題，以及題源／能力／弱點等功能。
- 已有 learning catalog/core/storage、subject adapters/registry 等共用模組。
- 已建立測試與發布規則；正式發布前需執行 `npm test`。
- 已建立並維護 `AGENTS.md`。
- 上次已補齊國文歷屆來源／篇目／年級篩選、分類統計、雲端文章關聯、過期回應保護、跨科同 ID 隔離與 localStorage 遷移重試保護；本次測試通過，不重做。
- 已完成推送後 Pages 狀態及線上靜態檔核對。
- 本輪逐題審閱150題：未發現必須更換正確答案索引的問題；修正題幹前提／措辭，補強古文90題、白話20題、詩詞10題及語文4題的詳解。
- 《岳陽樓記》補互文與語意界限；《鴻門宴》限定短句所能支持的推論；區分「鍥」字義與成語義；延期通知先明定日期已確定；統計與閱讀題補足過度推論辨識。
- 保留全部題號、答案索引、科目／年級／技能及45文章／45題組／98文本關聯，已實際比較修改前後資料。
- 新增 `docs/chinese-content-review.md`，逐組列出全部題目覆蓋與外部核對來源；明示 AI 審閱不等於教師審定。

## Modified / Important Files
本輪修改8個檔案：
- `chinese-data.js`：124題詳解及必要題幹／選項文字修正；不重建原題庫，不改 ID 與答案位置。
- `app.js`、`index.html`、`subject-adapters.js`、`version.json`：只同步 build／快取 `5.0-content-review-1`，確保延遲載入的新題庫生效。
- `CHANGELOG.md`：本輪內容補強紀錄。
- `docs/chinese-content-review.md`：完整審閱覆蓋與來源。
- `CODEX_PROGRESS.md`：保留首次交接核對結果，更新本輪狀態與 Next Step。

數學題庫、config.js、fallback-data.js、圖示、localStorage與雲端相容層均未修改。

目前核心檔案包含：
- `index.html`
- `app.js`
- `learning-catalog.js`
- `learning-core.js`
- `learning-storage.js`
- `subject-registry.js`
- `subject-adapters.js`
- `chinese-data.js`
- `classical-texts.js`
- `version.json`
- `CHANGELOG.md`
- `AGENTS.md`

保護檔案與既有資料規則請以 `AGENTS.md`、`DEPLOY.md`、`version.json` 為準。

## Tests
2026-09-20 本輪實際執行結果：
- 階段一（古文90題）`node tests/v5-data.test.cjs`：PASS。
- 階段二（白話／詩詞／語文補強）相同國文資料測試：PASS。
- 修改前後實際載入比對：150題的 ID、答案與 metadata 一致；45文章、45題組、98文本關聯逐項一致；124題詳解有變更。暫存快照位於忽略的 `test-results/chinese-review-before.json`、`chinese-review-after.json`，不提交。
- 完整 `npm test`：PASS，exit 0。含靜態／版本一致性、432 組數學路由與練習／模考、420 題高二及250題高一保護、國文30篇／150題／288範圍、1201筆分頁、審核匯入、localStorage、跨科、390px、雲端隔離 fixture。
- PostgreSQL migration 在本機 PGlite 重跑兩次、RLS 及禁止寫入測試：PASS；沒有對正式資料庫執行 migration 或測試寫入。
- 測試包含瀏覽器 pageerror 檢查與國文高一／高二、詳解、390px 畫面；不等於 iPhone 實機測試。
- `git diff --check`：PASS；僅LF/CRLF提示。提交前 status 僅上述8檔，保護檔案 diff 無變更。
- 前輪線上檔案比對驗證的是 acceptance-3；本輪以 push 後查核結果為準，不沿用舊結果冒充新版驗證。
- 本機 npm 不在 PATH，沿用已存在的臨時 npm 11.6.0。PowerShell 重跑方式：

```powershell
$npmTestRoot = Join-Path $env:TEMP 'high-school-review-npm-11.6.0'
$env:PATH = $npmTestRoot + ';' + $env:PATH
node (Join-Path $npmTestRoot 'node_modules/npm/bin/npm-cli.js') test
```

此路徑是本機暫存工具，未來若不存在需重新檢查工具環境，不把環境問題當成產品測試失敗。

## Remaining
- V5.0 版本檔仍標示 unreleased，但 Pages 已上線；若後續正式整理發布 metadata，需一併核對版本與變更紀錄，不能重做部署來「修復」此文字差異。
- 國文仍為 phase1，後續內容與已驗證來源需持續補充。
- 物理目前為 planned，尚待依 Subject Registry / adapter 架構加入。
- 其他高中科目應依相同共用架構逐步加入，避免建立平行、重複的 app。
- 正式資料庫 migration 不應因 migration 檔存在就視為已套用；需另行確認。
- 完整 staging copy migration 演練、正式登入／同步及 iPhone 實機 PWA 安裝／更新仍未驗證。
- 國文真題及官方課次 mapping 仍待可靠來源；150題已完成本輪 AI 審閱，但仍需教師審校。部分干擾選項偏易、能力分布不均，未將本次補詳解宣稱為完整進階題庫。

## Known Issues / Risks
- 新增科目時最重要風險是破壞數學 Frozen Core、跨科 localStorage/Supabase 紀錄隔離、年級／分流與來源映射。
- 不可清除既有 Supabase 設定、登入、學習進度、錯題與收藏等資料。
- 真題／官方來源必須可追溯；AI 或平台原創題不得標示為官方真題。
- 未釐清著作權的文本不得直接複製全文。

## Next Step
1. 讀 AGENTS.md、本檔；核對 HEAD、工作目錄、遠端與 `version.json`。本輪應可由提交名 `V5.0 國文題目詳解補強與交接紀錄` 找到交付，不以本檔提交前的基準 SHA 當最新 HEAD。
2. 若 commit／push 被中斷，先核對該提交是否已在遠端，避免重複提交；若尚未完成且測試／檔案無新變更，本輪使用者已授權繼續完成 commit／push。
3. 若推送已完成，確認 Pages 最新成功 run 對應該提交，線上 build 為 `5.0-content-review-1`，並比對 chinese-data.js。已有確認結果時不要重做功能。
4. 本輪150題審閱與124題補強已完成。後續建議由教師檢視 `docs/chinese-content-review.md`，或由使用者指定進階干擾選項／能力補強或真題來源的下一批範圍；不自行新增物理或寫入正式資料庫。
5. 新任務依最小增量實作、階段測試、更新本檔。這次 commit／push 授權只適用本輪交付，不延伸為未來所有修改。

## Limit / Handoff Rule
若 Codex 額度即將耗盡：
- 不開始新的大型修改。
- 先完成目前最小可完成單位並測試。
- 不為趕進度跳過測試或做高風險重構。
- 更新本檔，明確留下最後完成點與下一步。
\n## 2026-09-25 GSAT 115 Math A integration\n- 使用者明確授權「更新 GitHub」。\n- 已以 additive module 整合 115 學測數A：20題／100分題型、配分與官方答案結構，新增 `gsat-115-ready-data.js`、`gsat-115-engine.js`、`gsat-115-ui.js`。\n- `index.html` 的 GSAT panel 已加入 `#gsat115Ready`，保留既有 `gsatList` 與 `loadGsatV4967()`。\n- build 更新為 `5.0-gsat-115-1`；沒有修改 Frozen Core practice/mock，也沒有寫入 Supabase。\n- 新增 `tests/gsat-115.test.cjs` 並納入 npm test。\n- Q19/Q20 維持 manual_required；公式密集題題面仍以 CEEC 官方 PDF 為準。\n- Remaining：需以 GitHub Actions / Pages 實際結果驗證完整 npm test 與線上部署；未取得成功結果前不可宣稱完整 regression DONE。\n
## 2026-09-25 GSAT 115 Math A unified bank
- 使用者明確授權「更新 GitHub」。
- 新增 `gsat-115-unified-bank.js`：115數A 20題統一 metadata，包含單元、次要觀念、技能、官方答案/頁碼、平台分層解析與驗證狀態。
- `gsat-115-ui.js` 改讀統一題庫，支援 115 全題依序瀏覽與依單元篩選；逐題展開官方答案及平台「觀念／破題／完整解法／常見錯誤」。
- Q5/Q8/Q10/Q11/Q12 保留 needs_review；Q19/Q20 保留人工評閱。未寫入 Supabase，未改 Frozen Core。
- build: `5.0-gsat-115-2`；新增 unified-bank regression assertions。
- 驗證限制：本輪透過 GitHub connector 修改，未在本機 clone 執行完整 npm test；需以 GitHub Actions/Pages 實際結果確認部署與 regression，不能把未執行測試寫成 PASS。
- Next: 先驗證 Pages；之後 114–111 數A沿用同一 unified schema 批次匯入，不重建另一套題庫。

## 2026-09-25 Unified Question Bank architecture locked
- 使用者明確要求寫入 GitHub，避免後續開發走偏。
- 永久核心：所有題目只存在一個 Question Bank；學測、學校段考／校內考題、平台題只是 source metadata，不得建立來源專用平行題庫或不同 renderer。
- 「學測／學校／年份／段考／單元／弱點」全部是同一題庫的 filter/view。選定一份考卷時依 original question number 顯示全部已收錄題目。
- 所有來源共用完整題面、作答、「我不會／問 ChatGPT／詳解看不懂」、分層詳解、錯題與學習紀錄。
- 整份計分是 session/mode：單元練習逐題回饋；整份模考／整份考卷才交卷後計分。
- 現有 115 數A來源專用 UI 為過渡實作，後續應收斂進共用 Question Bank/renderer，不再擴張獨立 GSAT UI。

## 2026-09-25 Unified Question Bank implementation batch 1
- 使用者明確授權「開始進行更新」。
- 新增 unified-question-bank.js runtime bridge；115數A首批已確認可安全轉成既有單選 renderer 的 Q1/Q2/Q3/Q4/Q6/Q18 直接併入共用題庫流程。
- 「大量題庫」新增來源（全部／學測真題／學校與平台題）及年份 filter；CEEC 題使用既有題目卡、作答、我不會、問 ChatGPT、詳解看不懂、錯題／紀錄流程，不再只依賴獨立 GSAT 卡片。
- app.js 已支援字串 question id，避免 ceec-115-matha-* 與舊數字 id 衝突。
- build 更新為 5.0-unified-bank-1。
- 本批未寫 Supabase；正式資料庫完全未變更。
- 為避免未核對公式／圖形就發布，目前只接入首批單選 Golden Sample；Q5/Q8/Q10/Q11/Q12 等公式／圖形題仍保留 staging/needs_review。多選、選填、非選共用 renderer 尚待下一批擴充。
- 已新增 regression assertions，但本輪透過 GitHub connector 修改，未在本機執行完整 npm test；不得把完整 regression 宣稱為 PASS。
## 2026-09-25 Question Group architecture implemented
- 使用者同意題組方案並要求繼續。
- Question = 最小作答／評分／學習紀錄單位；Question Group = 共用閱讀情境單位，已寫入 AGENTS 永久規則。
- unified-question-bank.js schema 升為 1.1，新增 groups/group()/context()；115數A Q18–20 已建立 ceec-115-matha-g18-20。
- 共用 practice renderer 已能在單題被抽出時自動帶出 group context；同組連續題避免重複完整題幹。
- build 5.0-unified-bank-2；未寫 Supabase。
- regression assertions 已加入 tests/gsat-115.test.cjs；本輪 GitHub connector 無本機工作樹，因此尚未執行完整 npm test / 390px browser regression，狀態仍 IN PROGRESS。

## 2026-09-25 Common mixed-type renderer implemented
- 使用者明確授權「更新 GitHub」。
- LearningCore canonical contract 已擴充 single_choice / multiple_choice / fill_blank / numeric / short_answer / essay，新增 answerKey / answered / equalAnswer / formatAnswer。
- 練習與模考共用 renderer 已支援單選、多選、選填、數值、非選文字；題組 context 繼續共用同一 renderer。
- 模考仍遵守交卷前不顯示答案／詳解；short_answer / essay 不虛構自動正誤，交卷後標示需人工／規準批改。
- LearningStorage 改用共用答案判定；多選順序不影響正確性，選填逐格精確比對。
- staging CEEC runtime 加 sync_disabled；正式 Supabase schema 尚未升級前，不同步這些新題型／字串 ID 到 production。
- build 更新 5.0-unified-bank-3；新增 mixed-type regression fixtures。
- 本批未寫 Supabase。GitHub connector 無本機工作樹，尚未實際執行 npm test / git diff --check / 390px browser regression；在這些驗證完成前狀態仍 IN PROGRESS。
- 下一個資料批次：依官方題面逐題補入115數A多選 Q7–Q12、選填 Q13–Q17、非選 Q19–Q20；公式／圖形題維持 needs_review 直到視覺核對。

## 2026-09-25 Batch exam production pipeline locked
- 使用者明確授權「更新 GitHub」。
- 已把「整份試卷」而非「逐題人工」定為長期題庫生產單位；115 數A是第一份 Golden Sample。
- 固定流程：官方整份試卷/PDF → 自動拆題與題組 → 辨識題型 → 對官方答案 → 自動分類單元/技能 → 批次平台詳解 → 自動檢查 → needs_review → exception review → verified → 一次發布整份試卷。
- Explanation Pipeline 固定四層：考什麼 → 破題關鍵 → 完整步驟 → 常見錯誤；不得逐題手工呼叫 AI 作為長期流程。
- AI／平台產生的分類與詳解即使通過自動檢查仍維持 needs_review；不得冒充官方詳解，人工覆核後才能 verified/published。
- 人工審查以 exception queue 為主，正常題不逐題重做；Importer 需產出 review summary 與異常原因。
- Raw / Staging / Published 分層；Importer 不直接寫 production Supabase。本批只有文件／架構規則更新，沒有 Supabase 寫入、沒有題庫資料改動。
- 115 Golden Sample 端到端穩定後凍結 Unified Question Schema V1，再批次跑 114→111 數A；新科目先以20–50題 Golden Sample 驗證特殊題型後擴大量。

## 2026-09-25 Batch Importer V1 implemented
- 使用者明確授權「更新 GitHub」。
- 新增 `scripts/batch-exam-import.mjs`，把已鎖定的整份試卷流程落成可執行 staging importer；輸入是一整份 exam + groups + questions JSON，輸出統一 staging artifact、review_summary、exception_queue。
- Importer V1 統一 normalize source/year/exam/variant/question number/type/group/unit/skill/explanation metadata；支援 single_choice / multiple_choice / fill_blank / numeric / short_answer / essay。
- 自動 validation 會攔截：缺來源／題號、未知題型、CEEC 非官方網域、110前學測、答案 shape/index 錯誤、缺題組 context；缺單元／skill／四層詳解則進 warning/exception queue。
- 所有自動處理題即使零 warning 仍固定 `classification_status=needs_review`；只有 `approveBatch()` 接到 reviewer + evidence 才能 verified。Blocking error 不可人工強行 approve。
- `publishArtifact()` 只產生已驗證的發布 artifact，不連線、不寫入 Supabase，維持 Raw / Staging / Published 分層。
- 新增 `tests/batch-exam-import.test.mjs`：涵蓋單選、多選、選填、非選題組、exception queue、CEEC provenance blocking、人工 review gate、publish gate。
- `package.json` 新增 `test:batch-import` 並納入完整 npm test。
- 本輪 GitHub connector 無本機工作樹，因此測試程式已加入但尚未實際執行；不得宣稱 PASS。沒有 Supabase 寫入，沒有修改既有題庫或 renderer。
- 下一步：用115數A現有20題 metadata 建第一份 importer fixture/staging artifact；先修正/驗證公式圖形與完整題面 exceptions，再讓整份115數A通過同一 review summary。之後凍結 Unified Question Schema V1，批次跑114→111。
