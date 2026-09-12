# 發布流程

## Codex 自動發布（未來預設）
1. 讀 `AGENTS.md`、`version.json`。
2. 修改最少必要檔案。
3. 執行 `npm test`。
4. 更新版本資訊。
5. Commit / push 到 `main`。
6. GitHub Pages 依現有設定發布。
7. 發布後做 smoke test。

## 手動備援
若 Codex 無法寫入 GitHub：
1. 下載 ChatGPT 提供的 ZIP。
2. 只覆蓋本次有修改的檔案。
3. `fallback-data.js`、`config.js` 若 ZIP 沒有提供，就保留 GitHub 原檔。
4. 不刪除 Supabase 設定與資料。
5. 等 GitHub Pages 自動更新。

## Smoke Test
- 首頁
- 資料庫設定
- 高一練習
- 高二練習
- 數A/數B
- 模考
- 我不會
- 錯題
- 學習數據
- 歷屆來源
- 資料完整度
