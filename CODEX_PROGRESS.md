# CODEX_PROGRESS.md

> 本檔案是 high-school-review 的開發交接紀錄。每次開始工作先讀 `AGENTS.md` 與本檔，再核對 Git HEAD、`version.json` 與實際程式；實際 repository 狀態優先。

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

