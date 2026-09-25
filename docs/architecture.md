# 共用學習架構

V5 工作基準為 V4.9.7.7 / 27431f8。Math Frozen Core 保留 `learning-catalog.js`、`grade2-questions.js`、`grade2-scopes.js` 與原始高一題庫；`app.js` 只增加科目接點、分頁載入與跨科紀錄隔離，不複製第二套 app。

## Subject Registry 與題目契約

`subject-registry.js` 是科目入口：id / name / code / enabled / grades / courses / units / categories / topics / skills / questionTypes / examMapping / sourceTypes / specialFeatures。只有 math、chinese 啟用；物理、化學、生物、地科、英文、歷史、地理、公民皆 planned。高三只預留 schema。

新增科目流程：登錄 registry → 提供 adapter 的 ensure / scope / pool / pick / adaptCloud / stats → 增加資料及測試。不要複製 app 的作答或模考 UI。

`learning-core.js` 提供共用 normalize / fromMath / errors / filter / pick / coverage / paged。

```text
subject → grade → course/track → school → academic_year → semester → exam
        → unit → chapter/text → topic/skill → question

question: id, subject, grade, course, semester, category, unit, chapter, topic,
          skill, questionType, stem, options, answer, explanation, difficulty,
          sourceType, sourceId, tags, mathMetadata/chineseMetadata

chineseMetadata: text_ids[], skills[], passage_id, level, classification_status
```

過渡相容層提供 q / o / a / e / level 舊欄位，既有 renderer 不需重寫。數學仍使用原有選題邏輯；國文使用 adapter。共享國文題以 `grades:[1,2]` 明示適用範圍；不是把數學高一題自動升格。

## 篇目與精讀

`classical-texts.js` 有永久 text_id、title、author、era、group、curriculum_status、public_domain_status、tags、source_reference、notes、aliases。

- core15：108 課綱推薦十五篇。
- extended15：依使用者 2026-09-14 確認，從舊推薦選文擇選的十五篇；不是舊30篇的完整差集。
- 臺灣近代文本權利未細查者只保留 metadata 及原創導讀，不抄全文。
- 《郁離子選》的示範是平台原創寓言，關聯為 extended，不宣稱原文。

篇目核對來源：[國教院推薦選文教材](https://www.naer.edu.tw/upload/1/24/doc/3512/表述清晰，精準論證--知性寫作教材示例_羅嘉雯.pdf)、[學校公開舊三十篇表](https://learn.hshs.tyc.edu.tw/ischool/publish_page/242/?cid=11128)。原文短摘、原創導讀、原創閱讀材料有不同 rights 標記，現代翻譯／補習題庫未複製。

精讀與段考是不同模式，但使用同一 question bank / renderer / progress：

- 段考：8校 × 112/113/114 × 高一/高二 × 上下學期 × 3段考 = 288 筆平台 mapping。每筆列 lessons / skills / publisher；publisher 未核驗。沒有官方版本資料就維持「平台模擬範圍」。
- 精讀：使用者選 text IDs AND skills AND source。空篇目或空能力選擇不抽題。支援 core15、extended15、全部、弱點選篇及單篇詳情。
- 同一題可有多筆 question_text_links，含 direct / indirect / comparison / extended、confidence、classification_status / method。
- 可用程度以實際題數顯示；七層未填滿時顯示待補，不自動生成學習成果。

## 來源與匯入

sourceType 嚴格限定 ceec_official / school_official / school_exam_verified / platform_simulated / platform_generated / unknown。真題需要來源網址、標題、年度、題號與 verified 分類；八校題另需 school。CEEC 要求官方網域與年度 >=110。

`scripts/import-sources.mjs` 讀入已保存的候選 JSON，產出 needs_review / unclassified；不含自行網路抓取與發布排程。

```text
Discover（人工提供 URL）→ Fetch metadata（人工保存來源）
→ Parse JSON → Normalize → Classify（候選）
→ Review：來源／權利／實際題意／text link evidence／skills
→ Verify → Publish（僅可輸出已驗證資料）
```

目前不含 OCR 或自動 PDF 題目解析。來源頁、無答案試卷保存 metadata；不能填入假答案以通過驗證。含篇名不自動建立 text link。程序化 verify 需要明確 reviewer、evidence、rights_confirmed、source_confirmed 與每筆關聯證據。

```sh
node scripts/import-sources.mjs candidates.json output-needs-review.json
```

pipeline 不會直接寫 Supabase 或 push GitHub，亦未新增 Actions workflow。匯入 CLI 只準備候選；publish API 不接納待審資料。實際資料與測試 fixture 分開，fixture 不掛入網站。

## Passage / Group

首批有45份 passage、45組 question_groups、98筆 question_text_links。資料只存一份 passage，題組引用 passage_id；UI 將同一 passage 的入選題相鄰呈現，文章只顯示一次。未來英文閱讀／理科題組可沿用。

## 學習資料與設定

`learning-storage.js` 使用版本1 additive migration，保留原始 localStorage key 與原字串；將舊紀錄映射到 v5_legacy_records / v5_legacy_math_analytics，成功才寫 v5_migration marker。重跑不清除既有資料。

遷移中斷後重試時，既有 V5 快照優先，只補入缺少的紀錄與統計項目；不將新舊統計相加，以免重複計數。

國文作答存 v5_attempts、錯題／我不會存 v5_wrong；同一 session/question 重複交卷不重複計入。熟練度為實際正確次數 / 作答次數，按 subject / text / skill 計算；未作答顯示尚未練習。弱點依錯題、我不會或正確率低於70%，不將未學過當成低熟練度。

分類統計使用同一批真實作答的 category；缺 subject 的舊作答讀取時視為 math，不改寫原始儲存字串。錯題查找與待詢清單以 subject＋question ID 隔離，即使舊本機題號相同也不覆蓋其他科目。

舊 math hist 的總數不逆造逐題紀錄，仍在原首頁／弱點分析使用。Supabase URL/key、auth token、其他資料不清除。課程選擇不 reload。

## Supabase 與效能

只使用既有 high-school-review project。實際 subjects 代碼為 MATH / CHIN，透過查詢 ID 使用，不硬編碼 ID。開啟首頁只取 subjects / schools 與選定科目、年級題目；range 每頁500，穩定 id 排序，timeout 與 selection token 防止舊回應覆蓋新科目。原本1000筆整庫上限已移除；國文本機檔只在首次切科載入。

Migration `supabase/migrations/20260914151605_v5_subject_core.sql` 由 CLI 建立，**未套用正式環境**：

- 沿用 subjects / questions，補 source_type、分類欄位及 learning_metadata。
- 新增 classical_texts、passages、question_groups、question_group_items、question_text_links、question_skills、source_candidates。
- 補 attempts / wrong_questions / national_exam_sources 的 subject_id；舊紀錄回填 math，觸發器從 question 取得新紀錄科目。
- 增加查詢索引；新增表啟用 RLS。候選資料不授權前端讀寫，已驗證關聯與合法 passage 才公開。數學既有權限保留，國文 questions 額外限制 verified。
- 不自動匯入150題或古文名錄到正式資料庫，不執行任何破壞性重建。

Migration 未套用時 CHIN disabled，國文使用本機資料；數學沿用舊欄位。套用後需經審查匯入資料，前端讀取多對多 relation，不使用未驗證 text links。

國文歷屆頁將「已驗證題目」與「官方來源索引」分開顯示。題目支援學測／八校、篇目、學校、學年度、學期、段考與年級篩選；選擇年級會按需載入該年級。顯示數量只代表目前載入的題庫，不冒稱整庫收錄總數。切換科目／年級會清理過期雲端題；來源請求亦有序號檢查，避免較舊的回應覆蓋新選擇。

雲端文章由 question_group_items → question_groups → passages 關聯取得 passage_id/body。關聯不存在或被 RLS 隱藏時，不使用 learning_metadata 中的文章替代，也不提供缺少必要文章的題目。匯入流程的 text links 含驗證時間與證據，publish 會再檢查候選資料及審核證據；輸出仍需人工對應 schema，並非正式資料庫寫入工具。

關聯回傳形式依 [Supabase joins 文件](https://supabase.com/docs/guides/database/joins-and-nesting) 核對；本次使用隔離 API fixture 與本機 PostgreSQL 測試，未連接正式 API。

參考：[Supabase 分頁範圍文件](https://supabase.com/docs/reference/javascript/using-modifiers-range)、[RLS 文件](https://supabase.com/docs/guides/database/postgres/row-level-security)。

## 統一 Question Bank：來源不是第二套題庫

平台只維護一個 Question Bank。CEEC 學測、學校段考／校內考題與平台題都遵守同一 question contract；sourceType 與來源 metadata 只負責追溯與篩選，不決定另一套 UI。

    Question Bank
      ├─ subject / grade / course
      ├─ unit / topic / skill / difficulty / questionType
      ├─ stem / passage / options / answer / explanation
      └─ source
           ├─ CEEC: exam + academic_year + variant + original_question_number
           ├─ School: school + academic_year + semester + exam + original_question_number
           └─ Platform: generated/simulated + version/provenance

前端的「大量題庫／學測／學校段考／依年份／依單元／弱點」全部是同一資料集合的 query/filter/view。選「115學測數A」就是把統一題庫過濾為 CEEC + 115 + 數A 並依原題號排序；選某校某次段考亦同。題目顯示與作答一律走共用 renderer，包含完整題面、作答、我不會、問 ChatGPT、詳解看不懂、分層詳解、錯題與進度。

115數A的 browser runtime 必須完整映射全卷20題，不得只接入單選子集；目前共用 renderer 的題型分布為單選7、多選6、選填5、非選2，Q18–Q20透過 Question Group 共用題幹。Batch Raw/Staging 的完整題數不等於前端已接線，回歸測試必須同時檢查 runtime 的20題與題型分布。

整份計分屬於 session/mode，不屬於 source：單元練習逐題回饋；整份模考／整份考卷才在交卷後統一計分。

現有 115 數A來源專用模組視為過渡資料／接線，不應成為長期第二套題庫架構；後續工作應把其題目資料匯入共用 Question Bank 並由既有 renderer 呈現，再移除重複顯示層。

## Batch Exam Import + Explanation Pipeline

115 學測數A是第一份 Golden Sample。目標不是用人工方式完成單一年度，而是驗證一條可重複使用的整份試卷生產線：

```text
Official PDF / answer key
  → Raw source archive + traceability
  → Parse / split questions + question groups
  → Detect question type
  → Match official answer
  → Classify unit / topic / skill
  → Batch Explanation Pipeline
  → Automated validation
  → Staging: needs_review
  → Exception review
  → verified
  → Batch publish to the unified Question Bank
```

### Data layers
- **Raw**：官方來源、PDF/答案來源、原題號／頁碼與未處理資料；不直接成為 production question。
- **Staging**：normalize 後的 JSON/JSONL、題組、分類、平台詳解、confidence、validation results；預設 needs_review。
- **Published**：人工確認後才進入統一 Question Bank。production 不另建 GSAT/school/source-specific bank。

Importer 的輸出應包含 review summary / exception queue，讓人工集中處理答案不一致、低信心公式／圖片、題組切割、來源缺漏等異常，而不是重新閱讀所有正常題。Importer 不直接寫正式 Supabase；正式 publish 是獨立、可審核的步驟。

### Explanation contract
每題平台詳解固定包含：**考什麼 → 破題關鍵 → 完整步驟 → 常見錯誤**。批次產生後以規則核對官方答案、answer type、必要 group context、基本數值／公式一致性與 source metadata。AI 產生內容永遠是 platform-authored，不是 CEEC／學校官方詳解；未經人工覆核保持 needs_review。

### Scaling rule
115 Golden Sample 端到端穩定後，先凍結 Unified Question Schema V1，再批次處理 114→111 數A；新科目先取20–50題 Golden Sample 驗證科目特有題型，再擴大量。擴充新來源原則上只增加資料、分類與 filter；只有真正的新題型才擴充共用 renderer。
