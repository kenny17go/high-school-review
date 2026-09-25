# AGENTS.md — 高中全科段考複習平台 high-school-review

本檔案是本 repository 的主要長期開發規則。每次開始工作前先閱讀本檔，再閱讀 `CODEX_PROGRESS.md`，並核對 Git HEAD、`version.json`、`CHANGELOG.md` 與實際程式。若交接紀錄與 repository 實際狀態不同，以實際 repository 為準。

## 1. 專案目標與工作模式

本專案為可長期擴充的「高中全科段考複習平台」，持續新增科目、章節、題目、詳解、學習功能並修正 Bug。開發優先順序為：資料與學習紀錄安全 → 網站穩定 → 學習內容正確 → 不破壞既有功能 → 手機體驗 → 可維護性 → 開發速度 → 視覺美化。

採增量維護。不得 reset、clean、重寫網站或用舊版本覆蓋目前成果。不要為技術炫技加入不必要複雜度。

每次修改前先評估：
1. 是否符合使用者目前需求。
2. 是否有更簡單、穩定的方法。
3. 是否可能破壞正常功能或資料。
4. 技術難度是否合理。
5. 是否產生額外費用或長期維護成本。
6. 是否適合目前 GitHub Pages / PWA / Supabase 架構。

## 2. 事實來源與版本

- 實際版本以 `version.json`、Git HEAD 與實際工作目錄為準。
- `CODEX_PROGRESS.md` 是交接紀錄，不是最高事實來源；若與程式或 Git 不一致，先查明原因，不得依舊紀錄覆蓋新版程式。
- 不得把未核實的版本敘述當成提交紀錄。
- 同步維護 app.js build marker、JS cache-busting、`version.json` 與 `CHANGELOG.md`。

## 3. 既有資料與功能保護

- 版本更新不可清除 Supabase 設定；本機模式不得刪除 Project URL / publishable key。
- 保留 `v42_url`、`v42_key` 與其他既有 storage key；新增資料結構須向後相容。
- `config.js`、`fallback-data.js`、既有題庫與 PWA 圖示不得覆蓋或刪除，除非任務確實需要且已說明原因。
- 不得因版本更新清除 Supabase、localStorage、登入、學習進度、收藏、錯題或設定。
- 若必須改資料格式，需提供 migration / backward compatibility；缺 subject 的舊紀錄按 math 處理。
- 不得刪除「看似沒用」的 function、CSS、JS、JSON、資料檔或 fallback；先搜尋引用與相容用途。

## 4. 必須保留的學習功能

必須保留練習、模考、我不會、錯題、學習數據、歷屆來源、真實來源、資料完整度、分層詳解與學測來源入口。新增科目不得破壞這些共用功能。

## 5. V5 共用架構

- 數學 V4.9.7.7 為 Frozen Core；除共用架構接點、按科載入與紀錄相容外，不重寫數學分流與題庫。
- 新科目必須經 Subject Registry / adapter 接入，優先沿用 `subject-registry.js`、`subject-adapters.js`、learning catalog/core/storage 等既有共用架構。
- 禁止為每個新科目複製整套 app。
- 不同科目可有不同學習模式，但導航、基礎 UI、題目資料、進度、錯題、收藏與詳解等共通能力應盡量共用。

## 6. 新增科目的標準流程

收到新增科目要求時，不直接大量修改。依序：
1. 檢查 repository 與 `CODEX_PROGRESS.md`。
2. 確認現有 Subject Registry / adapter 接點。
3. 確認科目資料、章節、題目、詳解、導航與共用 UI 的現有格式。
4. 先設計最小接入範圍。
5. 分階段加入科目入口 → 資料/章節 → 題目 → 詳解 → 學習紀錄 → 手機 UI。
6. 每一階段完成立即測試，再進下一階段。
7. 不因新增一科而重寫首頁、設定、資料儲存或其他正常科目。

新增內容與新增核心功能分開處理。若使用者只要求新增內容，不順便做大型 refactor。

## 7. 數學專屬保護

- 高一、高二題庫不可混用。
- Supabase 科目須透過 `subjects.id/code` 解析，不可把未知 `subject_id` 當成數學。
- 高二數 A／數 B／AB 分流不可破壞：A 可用 A+AB；B 可用 B+AB；「全部（AB 共通）」只可用 AB。
- 每次產生高二題組須隨機排列選項並同步正確索引；送回雲端時要還原原始選項索引，不得污染題庫原始資料。

## 8. 國文與文本規則

- 國文篇目使用 Classical Text Registry 永久 `text_id`；一題可連結多篇文本與多項 skill。
- 核心15篇為108課綱推薦選文；延伸15篇是從舊推薦選文擇選的「平台選編」，不得說成完整差集。
- 未釐清著作權的文本只留 metadata / URL，不複製現代文章全文。

## 9. 題庫、範圍與來源正確性

- 範圍須包含科目、課程／分流、年級、學校、academic_year、學期與段考；不同學年度不得誤用彼此官方映射。
- 官方／推定／平台範圍必須分開。來源只有附件編號、部分章節或版本不明時，不得假造完整章節映射；保留班群限制。
- 真題必須有可追溯來源；AI／平台題不得冒充 CEEC 或學校真題。
- `needs_review` 不計入已驗證統計。
- 不得重新將低於 110 學年度的學測資料放入顯示結果。
- 不確定的答案、公式、來源或教材內容不可猜測；標記待確認。
- 題目解析應適合台灣高中程度，說明觀念、破題方式、必要步驟與常見錯誤。

## 10. Bug 修正原則

遇到 Bug 先重現，再定位原因、確認影響範圍、選擇最小修改、修改、測試。禁止「猜原因後一次改很多地方」。

任何修正都不得以犧牲其他正常功能為代價。至少留意首頁、科目/章節切換、題目載入、答題、答案與詳解、上下題、進度、收藏、錯題、localStorage、Supabase、手機與桌面版。

## 11. UI / 手機原則

主要測試情境包含 iPhone Safari。新增或修改 UI 時檢查：
- 不左右溢出或被螢幕裁切。
- Safe Area / 底部導航正常。
- 按鈕容易點擊、文字與公式可讀。
- 題目與詳解不超出畫面。
- 手機修正不能破壞桌面版。

沿用現有設計語言、Card、Button、字體、間距、Header、Navigation、Modal 與題目版型；不要每增加一科就重新設計整套 UI。

## 12. GitHub Pages、外部服務與成本

優先維持目前 GitHub Pages 相容架構。不要因方便而加入不必要 backend 或付費服務。

若確實需要 API、Database、Serverless Function、AI API、Supabase、Firebase、Cloudflare 或其他服務，導入前先說明用途、必要性、免費額度、可能費用、未來維護成本與免費替代方案。

不得提交秘密金鑰。

## 13. 修改範圍控制

- 一次只修改完成目前任務所需的檔案。
- 若一個小需求突然需要改大量核心檔案，先重新評估。
- 大型任務拆成小階段，每階段可獨立驗證。
- 不要一次加入大量未測試內容。
- 目前正常功能不做無關 refactor。

## 14. 測試與完成條件

修改後才進行「完成」判定。至少：
1. 執行 `npm test`（靜態／資料／瀏覽器 regression tests）。
2. 執行 `git diff --check`。
3. 檢查 `git status`。
4. 確認網站可開啟、Console 無新增明顯 JavaScript error。
5. 測試本次功能與受影響的既有功能。
6. 必要時測試 iPhone/390px 等手機布局。
7. 涉及 Supabase 的正式資料庫驗證使用唯讀 API；除非使用者明確授權，測試不得寫入正式資料庫。
8. PostgreSQL migration 檔存在不代表已套用正式資料庫。

只有程式完成、測試通過、既有功能未被破壞、必要紀錄已更新，才能標示 DONE；否則標示 IN PROGRESS。

## 15. Git / Commit / Deploy

- 未取得明確指示不得 commit、push 或部署；完整流程見 `DEPLOY.md`。
- Commit 命名使用 `V<版本> <功能摘要>`，避免無意義的 update/fix stuff。
- 無法寫入 GitHub 時保留 ZIP 手動上傳備援。
- 開始大型修改前先核對 repository 狀態，避免覆蓋最新修改。
- V5 本次交付規則若仍要求停在未 commit / push 狀態，須遵守；除非使用者之後明確改變指示。

## 16. Codex 標準工作流程

每次工作採：

**Inspect → Plan → Modify → Test → Verify → Record**

開始時：
1. 閱讀 `AGENTS.md`。
2. 閱讀 `CODEX_PROGRESS.md`。
3. 核對 Git HEAD / status、`version.json`、`CHANGELOG.md` 與實際程式。
4. 確認使用者本次需求與目前未完成項目。
5. 不重做已完成且已驗證的工作。

結束時更新 `CODEX_PROGRESS.md` 的 Current Task、Completed、Modified/Important Files、Tests、Remaining、Known Issues、Next Step。

## 17. Codex 額度 / 中斷交接

若額度即將用完或工作可能中斷：
- 不開始新的大型功能。
- 先完成目前最小可完成單位。
- 跑必要測試，不為趕時間省略驗證。
- 不做高風險重構。
- 更新 `CODEX_PROGRESS.md`，明確記錄完成項目、修改檔案、測試結果、未完成項目、問題與下一個精確步驟。
- 下一次工作先核對實際 repository，再從未完成點接續，禁止盲目重做或回退。

## 18. 規則衝突優先順序

若規則互相衝突，依序採用：
1. 使用者在目前對話中的最新明確指示。
2. 防止資料遺失、秘密外洩或正式資料庫誤寫。
3. 本檔中的專案專屬 Frozen Core / 科目 / 題庫 / 資料相容規則。
4. repository 的實際最新狀態與已驗證行為。
5. `CODEX_PROGRESS.md` 交接紀錄。
6. 一般開發便利性。

不確定時停止高風險修改，先調查或向使用者確認，不自行猜測。

## 19. 長期原則

今天新增一科，不應讓明天新增下一科更困難。

所有開發都應讓 high-school-review 保持：**穩定、可擴充、可維護、資料安全、內容正確、適合學生使用。**

## 20. 統一題庫與來源模型（永久核心規則）

**所有考題只有一個 Question Bank。學測、分科／其他官方考試、學校段考、校內考題、平台自製題，都只是題庫的不同來源（source），不得各自建立平行題庫、平行作答 UI 或不同學習流程。**

### 20.1 題目是核心，來源是 metadata
每一題都使用同一份共用題目契約與 renderer：題幹／題組 → 選項或輸入 → 作答 → 我不會 → 問 ChatGPT → 詳解看不懂 → 作答結果 → 分層詳解 → 錯題／學習紀錄。來源不得改變這套基本互動。

題目至少可掛下列來源資訊：
- sourceType: ceec_official / school_official / school_exam_verified / platform_generated / platform_simulated / unknown
- sourceId / source title / source URL / source page / original question number
- 官方考試：exam type、academic_year、subject/variant
- 學校考題：school、academic_year、semester、grade、exam/段考次別
- 驗證狀態與官方答案來源

### 20.2 所有入口都只是同一題庫的篩選器
- 「大量題庫」：可依科目、年級、單元、難度、題型、來源等篩選。
- 「學測」：不是另一套題庫；等價於 sourceType=ceec_official 再依年份／考科篩選。選某一年時應能按原題號列出該年全部已收錄題目。
- 「學校／段考」：不是另一套題庫；依 school → academic_year → semester → exam 篩選。選定一份考卷時按原題號列出全部已收錄題目。
- 「依單元練習」：可以跨來源混合抽題；例如同一單元可同時包含平台題、學測題、建中段考題。
- 「錯題／弱點」：同樣從統一題庫依作答紀錄回查，不建立來源專用錯題庫。

### 20.3 顯示與作答規則必須一致
不論題目來自學測、學校或平台，前端使用相同題目卡、相同作答元件、相同「我不會／問 ChatGPT／詳解看不懂」、相同分層詳解、相同錯題與學習紀錄。不得出現「學測只顯示題號與答案、一般題庫才顯示完整題目」等分裂體驗。

依單元／弱點練習以逐題學習為主，不強調總分；只有使用者進入「整份模擬考／整份考卷」模式時，才隱藏答案與詳解至交卷後並進行整份計分。

### 20.4 匯入規則
新增 115、114、113… 學測或任何學校考卷時，流程都是：**匯入同一 Question Bank → 標記來源 metadata → 單元／能力分類 → 驗證 → 由既有共用 UI 顯示。** 不得因新來源新增 gsat-only、school-only 等獨立 renderer/app；若舊程式已有來源專用 UI，後續應逐步收斂成共用篩選器，而不是繼續擴張。

### 20.5 開發判斷
任何新題源需求先問：「能否只新增資料與 filter，而完全沿用既有 Question Bank / renderer / progress？」答案若是可以，就禁止建立新頁面邏輯。只有題型本身需要新 renderer（例如非選、作圖、實驗題）時，才擴充共用 renderer，而且擴充後所有來源都能使用。
