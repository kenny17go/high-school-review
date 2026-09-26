# 高中全科段考複習平台

目前工作版本：V5.0「全科目核心架構＋國文第一階段」（未發布）。正式開發基準：V4.9.7.7，commit 27431f8。

數學保留250題高一、420題高二與A/B/AB智慧分流；國文首批150題平台原創、核心15＋平台選編延伸15篇。科目切換不重新載入網頁。115國綜36題已進Raw／Staging並接入本機共用runtime；現代共用文章採摘要＋官方PDF指定頁面連結，不複製全文。平台分類／詳解仍為`needs_review`，尚未commit、部署或標為Published。

安裝測試相依：npm ci；執行全部測試：npm test。瀏覽器測試預設使用 Edge；詳見 DEPLOY.md。

- 共用資料結構與資料工程：docs/architecture.md
- 本次交付與驗證結果：docs/verification.md
- 國文資料：chinese-data.js；篇目：classical-texts.js
- 資料庫 migration 尚未套用正式環境。

以下保留早期版本的歷史使用说明；舊的題數／版本敘述不代表目前正式狀態。

# 高中段考複習平台 V4.3（Supabase 真資料庫版）

## 檔案
- `index.html`：網站首頁
- `app.js`：互動與 Supabase 讀寫
- `config.js`：可選擇預先填入 Project URL / publishable key
- `fallback-data.js`：160 題離線備援
- `01_schema.sql`：資料表、索引、RLS、權限
- `02_seed.sql`：7 校來源資料＋160 題原創題庫
- `manifest.webmanifest`：PWA 基礎設定

## 最短設定流程
1. 建立 Supabase Project。
2. 到 SQL Editor 執行 `01_schema.sql`。
3. 再執行 `02_seed.sql`。
4. 把本資料夾所有檔案放到 GitHub Pages。
5. 打開網站 →「資料庫設定」→ 填 Project URL 與 publishable/anon key →「儲存並測試連線」。
6. 顯示「Supabase 已連線」即代表 questions / schools 已改從雲端讀取。

## 登入與同步
網站使用 Supabase Email OTP / Magic Link。要儲存 `attempts` 與 `wrong_questions`，使用者需登入。
未登入時仍可完整練習，資料存於瀏覽器 localStorage。

## 安全
前端只能使用 publishable/anon key；絕對不要把 `service_role` key 放入 HTML、JavaScript 或 GitHub。
RLS 已設定：
- schools / exams / questions：公開唯讀。
- attempts / wrong_questions：只有登入者能讀寫自己的資料。

## 關於「真實題庫」
目前 160 題為原創題；七校部分為已核驗公開來源的索引與狀態資料。
之後可把合法可使用的歷屆題逐題加入 `questions`，並設定 `is_original=false` 與 `source_url`。


## V4.3 新增
- 歷屆真題／原創練習分流。
- 新增 source_documents 真實官方來源索引。
- 第一批匯入成功高中106、114學年度公開來源。
- 每筆來源顯示學校、學年度、學期、段考、文件類型與官方連結。
- 完整考卷維持連回校方原始來源，不直接重製整份內容。

## 升級
1. Supabase SQL Editor 執行 03_v43_migration.sql（iPhone 可用 txt 版）。
2. GitHub repository 用本包 index.html、app.js 覆蓋原檔；其餘檔案建議一併覆蓋。
3. GitHub Pages 更新後重新整理。
