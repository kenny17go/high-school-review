# 發布流程

本網站保留靜態 HTML/JS 架構，無編譯步驟。新增 JS 檔必須與 index.html 一同發布。

1. `git status`：確認所有異動皆屬已核對的工作，不覆蓋未提交檔案。
2. 核對 `version.json`、`package.json.displayVersion` 與頁面版本為 4.9.7.7。npm 僅接受三段 SemVer，因此 `package.json.version` 使用 4.9.7-7，畫面仍顯示 V4.9.7.7。
3. 有 lockfile 時執行 `npm ci`；初次建立相依套件可用 `npm install`。瀏覽器測試預設使用已安裝的 Edge；沒有 Edge 時用 Playwright 安裝 Chromium 並設定 `TEST_BROWSER_CHANNEL=chromium`。
4. `npm test`，接著 `git diff --check`。測試不得使用正式帳號或對正式 Supabase 寫入。
5. 用本機預覽檢查高一、高二 A/B/AB、112/113/114、不同行政條件、錯題、來源與資料完整度。需要正式 API 驗證時只用 Publishable key 發 GET 請求；不能把金鑰提交到版本庫。
6. 審查 diff 與 CHANGELOG，列出未能完成的實機／登入同步驗證；未經使用者明確確認不得 commit 或 push。
7. 得到明確指示後才提交並 push 到指定遠端／分支。不要假設 push 一定觸發部署；查明 repository 實際 GitHub Pages／Actions 設定，再核對線上版本及檔案載入。

## 設定與回復

- 不清除 `v42_url`、`v42_key`；不要把「使用本機」實作成 `localStorage.clear()`。
- 不修改資料庫 schema、RLS 或教材資料來配合測試。欄位差異先在前端相容層處理。
- 本機負數題目 ID 不送進雲端 questions 外鍵。
- PWA manifest/icon 需比對原檔；手機寬度測試不等於實機安裝驗證。
- 發布後若需回復，先確認使用者授權並以可審查的 revert 提交處理，不 force push、不丟棄本機工作。
