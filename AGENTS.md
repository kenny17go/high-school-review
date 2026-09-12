# AGENTS.md — 高中段考複習平台

## 發布目標
未來使用 Codex 修改此 repository 時，採「最小修改＋自動驗證＋可手動回退」。

## 必守規則
1. 先讀 `version.json`。
2. 不要重建整個網站，只改任務需要的檔案。
3. 不得清除瀏覽器 localStorage 裡的 Supabase Project URL / publishable key。
4. 「暫時使用本機題庫」不得等於刪除 Supabase 設定。
5. 保留練習、模考、我不會、錯題、ChatGPT 待詢、學習數據、歷屆來源、資料完整度。
6. 高一、高二題庫必須分流；高二維持數A / 數B / AB 共通分流。
7. 無法核驗的來源不可標成官方真題。
8. `fallback-data.js` 與 `config.js` 預設視為既有保留檔；除非任務明確要求，否則不要覆蓋或刪除。
9. 不可把 `service_role` key、PAT、密碼或任何秘密金鑰寫入 repository。
10. 每次版本更新同步更新：
   - `version.json`
   - `index.html` 顯示版本
   - `app.js` build marker
   - JS cache-busting query string
   - `CHANGELOG.md`
11. 發布前執行 `npm test`。
12. 測試成功後才 commit / push 到 `main`。
13. 若 Codex/GitHub 寫入失敗，保留 ZIP 手動上傳方式。

## Commit 命名
`V<版本> <功能摘要>`
例如：`V4.9.7.7 add high2 topic filter`
