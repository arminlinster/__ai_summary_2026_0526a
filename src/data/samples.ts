export interface SampleTranscript {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    id: "product-planning",
    title: "AI 智能客服產品規劃會議",
    category: "產品開發",
    content: `時間：2026年5月25日 14:00 - 15:30
主席：Product Manager Leo
紀錄：Amy
出席人員：Leo (PM), Kevin (Backend Lead), Sarah (UX Designer), Jerry (Marketing)

Leo: 大家好，我們今天主要討論第三季 AIOps 客服助手的產品規劃。目前的痛點是人工客服在面對常見問題時耗時過高，我們希望結合全新的 Gemini 模型來自動回答常見客戶問題。

Sarah: 我這邊做過用戶調查，大家最希望能在 3 秒內得到回覆，而且介面需要乾淨，不要有太多與無關的系統資訊。最好有預設範例按鈕能快速點擊。

Leo: 對，介面一定要極簡。Jerry，行銷端對於這個功能有什麼宣傳想法？

Jerry: 我們打「一秒總結、精準對答」這個訴求，但前提是 AI 答覆的準確率要足夠高。目前測試的準確度大概是多少？

Kevin: 根據我們用 Gemini-3.5-flash 做內部測試，在常見 Q&A 的準確率達到了 93%。如果再搭配精煉的 System Instruction 做限制，基本不會有幻覺。我的預估是我們可以在 6 月初完成 API 的對接。

Leo: 很好。那我們來分配工作：
Sarah：在 5/30 之前提供最終版的高保真 UI/UX 設計圖，包含 Loading 狀態頁面。
Kevin：在 6/5 之前建立後端 Express 與 API 代理路由，確保 API Key 不會暴露在瀏覽器端，並進行安全對接。
Jerry：這兩週開始擬定行銷文案，預計 6/15 準備開線上發佈會。
Amy：協助記錄這些決議，會後生成會議記錄並翻譯成英文發給海外投資人。

Kevin: 沒問題，我會使用 CJS 格式打包服務端來保證運行的穩定性。

Leo: 好的，今天的會議就到這邊，謝謝大家。`
  },
  {
    id: "marketing-weekly",
    title: "跨國行銷宣傳與網紅合作策略例會",
    category: "行銷推廣",
    content: `林總 (CEO): 大家早安。我們這次夏季主打的「隨身智能助理」在歐美市場的推廣速度偏慢。陳經理，目前的進度如何？

陳經理 (Marketing Manager): 林總早。歐美市場主要遇到在地化文案不夠生動的問題。我們目前的翻譯稍微有點生硬。

David (English Content Director): Yes, indeed. The current descriptions are a literal translation from Chinese, which doesn't appeal to local US customers. We need native English copywriters to rewrite the core value propositions and tagline.

陳經理: 另外，我們也想跟當地的 5 位中型科技網紅（KOL）合作，預算大概在 15,000 美元左右，由他們製作短影音開箱。

林總: David 提的在地化非常重要，不要做死板的逐字翻譯，要融入在地文化。宣傳文字必須在下週三前全部重寫完畢。陳經理，網紅合作的部分，名單先整理出來，週五下班前傳給我審核。

陳經理: 好的，名單我週四就會整理完，包括他們的互動率跟受眾分析。

林總: 另外，行銷記錄與摘要也需要同步成中英文兩版，方便台灣總部與美國辦事處同步對接。這次就麻煩行銷小組了。`
  },
  {
    id: "post-mortem",
    title: "系統伺服器斷線故障檢討會議",
    category: "技術支持",
    content: `時間：2026年5月24日 22:30緊急會議
人員：阿強（SRE）、小明（資料庫工程師）、老張（技術總監）

老張: 今天晚上八點，首頁出現了近 20 分鐘的 502 錯誤，客戶投訴電話都被打爆了。阿強，到底是哪裡出了問題？

阿強: 我們在晚上 20:05 監控到 CPU 使用率突然飆升到 100%。一開始以為是遭到了 DDoS 攻擊，但深入排查後，發現是資料庫（Database）連線數瞬間滿載。

小明: 對，我這邊查了 LOG。20:03 出現了一個非常複雜的 SQL 巢狀查詢（Nested Query），這個查詢是由新上線的推廣活動頁面觸發的。因為該欄位沒有建立 Index，導致全表掃描（Full Table Scan），造成鎖表（Table Lock）。

老張: 這個推廣活動頁面上線前沒有做壓力測試（Load Test）嗎？

小明: 部署比較趕，確實漏掉了這一段的索引優化與壓測。

阿強: 我們的臨時處置是：在 20:23 強行重啟了資料庫叢集，並阻斷了該查詢來源。20:25 服務已全面恢復運作。

老張: 很好，恢復速度給予肯定，但這不應該發生。會後的 Action Items 處理如下：
1. 小明：在今晚 24:00 之前，為受影響欄位加上 Index，並優化該條 SQL 語法，提交 PR。
2. 阿強：建立資料庫連線超時機制，如果單一查詢超過 3 秒自動終止，避免卡死。這在週五前上線跑測試。
3. 全體：技術部從下週起，所有包含複雜查詢的新功能必須通過 Staging 環境的慢查詢稽核才能部署到 Production。

阿強 & 小明: 收到，我們會立刻辦理。`
  }
];
