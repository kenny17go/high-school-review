# CODEX_PROGRESS.md

> 本檔案是 high-school-review 的開發交接紀錄。每次開始工作先讀 `AGENTS.md` 與本檔，再核對 Git HEAD、`version.json` 與實際程式；實際 repository 狀態優先。

## Current Task
持續擴充「高中全科段考複習平台」，以 V5 共用架構逐科加入內容與功能，同時保護既有數學穩定核心。

## Current Repository State
- Repository: `kenny17go/high-school-review`
- Branch: `main`
- GitHub 最新確認 commit: `64f24832c863f833259653eb4a077713060ceccb`
- Commit: `V5.0 全科目核心架構與國文第一階段`
- `version.json`: V5.0 / build `5.0-acceptance-3`
- Status: `unreleased`
- Base: V4.9.7.7
- 科目狀態：math = stable、chinese = phase1、physics = planned

## Completed
- 已建立 V5 全科目共用核心架構。
- 已加入 Subject Registry / adapter 架構，後續新科目應從此接入，不複製整套 app。
- 數學 V4.9.7.7 保持 Frozen Core。
- 國文第一階段已加入：高一／高二、核心15＋平台選編延伸15篇、150題平台原創題，以及題源／能力／弱點等功能。
- 已有 learning catalog/core/storage、subject adapters/registry 等共用模組。
- 已建立測試與發布規則；正式發布前需執行 `npm test`。
- 已建立並維護 `AGENTS.md`。

## Modified / Important Files
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
目前 repository 已配置 `npm test` 與 `tests/`。
每次實際修改後至少執行：
1. `npm test`
2. `git diff --check`
3. `git status`
4. 必要的手機／瀏覽器 smoke test
5. 涉及 Supabase 時，正式資料庫測試限唯讀，除非使用者另有明確指示。

本檔建立時未對網站程式進行功能修改，因此沒有新增一輪功能 regression test。

## Remaining
- V5.0 目前仍標示 unreleased。
- 國文仍為 phase1，後續內容與已驗證來源需持續補充。
- 物理目前為 planned，尚待依 Subject Registry / adapter 架構加入。
- 其他高中科目應依相同共用架構逐步加入，避免建立平行、重複的 app。
- 正式資料庫 migration 不應因 migration 檔存在就視為已套用；需另行確認。

## Known Issues / Risks
- 新增科目時最重要風險是破壞數學 Frozen Core、跨科 localStorage/Supabase 紀錄隔離、年級／分流與來源映射。
- 不可清除既有 Supabase 設定、登入、學習進度、錯題與收藏等資料。
- 真題／官方來源必須可追溯；AI 或平台原創題不得標示為官方真題。
- 未釐清著作權的文本不得直接複製全文。

## Next Step
下一次 Codex 工作開始時：
1. 先讀 `AGENTS.md` 與本檔。
2. 核對最新 Git HEAD、`version.json`、`CHANGELOG.md` 與實際工作目錄，不假設本檔一定最新。
3. 確認使用者本次指定要新增／修改的科目。
4. 若新增科目，先檢查 Subject Registry、adapter、learning catalog/core/storage 的既有接點，再做最小增量修改。
5. 每完成一個小階段即測試；不要一次加入大量未驗證內容。
6. 工作結束或額度即將用完前更新本檔的 Current Task、Completed、Tests、Remaining、Known Issues 與 Next Step。

## Limit / Handoff Rule
若 Codex 額度即將耗盡：
- 不開始新的大型修改。
- 先完成目前最小可完成單位並測試。
- 不為趕進度跳過測試或做高風險重構。
- 更新本檔，明確留下最後完成點與下一步。
