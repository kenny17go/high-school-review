# 115 學測數學A Batch Importer V1 Golden Sample

## 結果

- 整份試卷：20 題、100 分，題號 1–20 無缺號或重複。
- 題型：單選 7、多選 6、選填 5、非選 2。
- 官方答案 manifest：20/20 與既有 normalized answer 相符。
- 題組：Q18–Q20 共用 `ceec-115-matha-g18-20`，沒有遺失 context。
- 狀態：20 題全部維持 `needs_review`；必要修正後 20 題均無 validation exception。
- 發布：`ready_for_publish=false`；沒有呼叫 Supabase，也沒有產生可發布 artifact。

## Exception Queue

必要修正後為空：blocking error 0、warning 0。這只代表結構、題面、答案、來源與已設定的規則檢查通過；平台分類及詳解仍須人工覆核，20 題都保持 `needs_review`，尚未轉為 verified。

## 已修正

- Golden Sample 使用大考中心目前可取得的官方試卷與答案 URL，取代舊的失效檔案識別碼。
- 修正共用 runtime Q2 題幹：`f(x)=[99-x]+[99+x]`，先前誤寫成 `[x-99]`。
- 補齊 Q5、Q7–Q17、Q19–Q20 題面及 Q5、Q7–Q12 的完整選項；視覺核對官方 PDF 的矩陣、向量、根式、三角函數、多項式與附圖。
- 修正 Q10 第四選項為 `65/3`，先前轉錄誤植為 `√65/3`。
- 依官方非選評分原則修正 Q20：`AP=(4,4,-2)`、體積 `10`、最長距離 `√94`；先前資料的 AP 與體積30均錯誤。
- Q19、Q20 已保存官方評分原則 URL、滿分要點與部分給分要點。
- Importer 增加整卷 expected count／缺號、答案來源、官方答案 mismatch、頁碼、信心與 review flags 驗證。
- Raw 與 Staging artifacts 可由 `node scripts/build-gsat-115-golden.mjs` 重建，不依賴正式資料庫。

## 下一步

由教師／內容審核者覆核20題的單元分類與平台四層詳解；確認後才可透過 `approveBatch()` 產生 verified／publish artifact。下一份資料批次建議沿用同一 schema 處理114學測數學A，不建立另一套 importer 或 renderer。
