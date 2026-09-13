# 專案維護規則

- 本專案採增量維護。保留未提交工作，不得 reset、clean、重寫網站或以舊版本覆蓋。
- 實際版本以 `version.json`、Git HEAD 與工作目錄為準；不得把未核實的版本敘述當成提交紀錄。
- 版本更新不可清除 Supabase 設定；本機模式不得刪除 Project URL / publishable key。保留 `v42_url`、`v42_key` 與其他既有儲存 key；新增結構須向後相容。
- `config.js`、`fallback-data.js`、既有題庫與 PWA 圖示不得覆蓋或刪除，除非任務確實需要並說明原因。
- 高一、高二題庫不可混用。Supabase 科目須透過 `subjects.id/code` 解析，不可把未知 `subject_id` 當成數學。
- 高二數 A／數 B／AB 分流不可破壞：A 可用 A+AB；B 可用 B+AB；「全部（AB 共通）」只可用 AB。
- 每次產生高二題組須隨機排列選項並同步正確索引；送回雲端時要還原原始選項索引，不得污染題庫原始資料。
- 範圍須包含科目、課程／分流、年級、學校、academic_year、學期與段考。不同學年度不得誤用彼此的官方映射。
- 官方／推定／平台範圍必須分開。來源僅有附件編號、部分章節或不明版本時不得假造完整章節映射；需保留班群限制。
- 必須保留練習、模考、我不會、錯題、學習數據、歷屆來源、真實來源、資料完整度、分層詳解與學測來源入口。
- 不得重新將低於 110 學年度的學測資料放入顯示結果。
- 發布前必須跑 `npm test`（靜態／資料與瀏覽器測試），並檢查 `git diff --check`、`git status`。必要的 Supabase 驗證使用唯讀 API；測試不得對正式資料庫寫入。
- 未取得明確指示不得 commit、push 或部署；完整流程見 `DEPLOY.md`。

- 同步維護 app.js build marker、JS cache-busting、version.json 與 CHANGELOG。不得提交秘密金鑰。
- Commit 命名使用 V<版本> <功能摘要>。無法寫入 GitHub 時保留 ZIP 手動上傳備援方式。
