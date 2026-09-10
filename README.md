# 高中段考複習平台 V4.2（Supabase 真資料庫版）

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
