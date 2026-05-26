import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import path from "path";

// Load environment variables for local testing
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// System instructions for the meeting generator & translation AI
const SYSTEM_INSTRUCTIONS = `你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。
請務必遵守以下輸出格式與架構要求：

1. **會議主題與時間**：擷取會議的主記與代表時間段。
2. **與會者**：列出參與會議的所有代表與關鍵人員。
3. **會議重點總結**：用 3 到 5 個具深度且結構化的重點來總結會議的核心討論內容。
4. **Action Items (待辦事項)**：明確使用表格（含：項目、負責人、截止日期等）或條列清單列出接下來的所有待辦事項與指派負責人。
5. **英文翻譯版**：將上述 1~4 點的精緻內容完整並極度專業地翻譯成英文，形成優雅的中英對照。

請嚴格遵守以下準則：
- 全部採用最正式、精簡的「繁體中文（台灣地區用語）」與專業商務英文來撰寫。
- 不要包含任何額外的自我介紹、客套問候語或結語（例如：「好的，以下是為您整理的...」或「希望這對您有幫助」），直接輸出 Markdown 會議記錄主角。
- 以高質感的 Markdown 格式輸出，善用粗體、表格與適當的清單符號使其易讀高雅。`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "不支援的請求方法，請使用 POST 請求。" });
  }

  try {
    const { transcript, option, language, customContext, provider } = req.body || {};

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "會議內容或逐字稿不能為空！" });
    }

    const targetProvider = provider || "gemini";

    // Construct user prompt based on parameters
    let userPrompt = `【待處理素材】\n${transcript}\n\n`;
    userPrompt += `【設定參數】\n`;
    userPrompt += `- 整理與摘要模式: ${option || "完整會議記錄 (精細)"}\n`;
    userPrompt += `- 翻譯與目標輸出語系: ${language || "繁體中文"}\n`;
    if (customContext && customContext.trim() !== "") {
      userPrompt += `- 額外說明與自訂要求: ${customContext}\n`;
    }
    userPrompt += `\n請依據上述的素材與參數，以及你的 System Instructions 替我生成最完美的會議記錄與翻譯！`;

    if (targetProvider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "你的_Gemini_API_Key" || apiKey.trim() === "" || apiKey === "AIzaSyCSBrgSQgd9FBpMqwRNtA6Ob5ojK1_e0W") {
        return res.status(400).json({
          error: "偵測到您在 .env.local 中使用的是範例預設的 Gemini API 金鑰 (AIzaSyCSBrgSQgd9FBpMqwRNtA6Ob5ojK1_e0W)。請將其替換為您在 Google AI Studio 申請的真實 API 金鑰，或切換至 NVIDIA 服務進行測試。"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.3,
        },
      });

      const resultText = response.text || "無法生成記錄。請檢查 AI 回傳結果。";
      return res.status(200).json({ result: resultText });

    } else if (targetProvider === "nvidia") {
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey || apiKey === "你的_NVIDIA_API_Key" || apiKey.trim() === "") {
        return res.status(400).json({
          error: "NVIDIA_API_KEY 未設定，請在專案根目錄的 .env.local 檔案中設定，或在 Vercel 後台配置環境變數。"
        });
      }

      // NVIDIA API Call
      const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-mini-4b-instruct",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTIONS },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3
        })
      });

      if (!nvidiaResponse.ok) {
        const errorData = await nvidiaResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `NVIDIA API 呼叫失敗，狀態碼：${nvidiaResponse.status}`);
      }

      const data = await nvidiaResponse.json();
      const resultText = data.choices?.[0]?.message?.content || "無法生成記錄。請檢查 NVIDIA AI 回傳結果。";
      return res.status(200).json({ result: resultText });

    } else {
      return res.status(400).json({ error: "不支援的 AI 服務提供商類型" });
    }

  } catch (error: any) {
    console.error("AI API Error:", error);
    return res.status(500).json({ error: error.message || "伺服器內部錯誤，請檢查後台日誌。" });
  }
}
