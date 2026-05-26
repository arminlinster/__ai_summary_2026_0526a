import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy-loaded Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 未設定，請在 Settings > Secrets 面板中設定金鑰。");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

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

app.post("/api/generate", async (req, res) => {
  try {
    const { transcript, option, language, customContext } = req.body;

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "會議內容或逐字稿不能為空！" });
    }

    const ai = getGeminiClient();

    // Construct user prompt based on parameters
    let userPrompt = `【待處理素材】\n${transcript}\n\n`;
    userPrompt += `【設定參數】\n`;
    userPrompt += `- 整理與摘要模式: ${option || "完整會議記錄 (精細)"}\n`;
    userPrompt += `- 翻譯與目標輸出語系: ${language || "繁體中文"}\n`;
    if (customContext && customContext.trim() !== "") {
      userPrompt += `- 額外說明與自訂要求: ${customContext}\n`;
    }
    userPrompt += `\n請依據上述的素材與參數，以及你的 System Instructions 替我生成最完美的會議記錄與翻譯！`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        temperature: 0.3, // Lower temperature for higher focus and structured layout
      },
    });

    const resultText = response.text || "無法生成記錄。請檢查 AI 回傳結果。";
    res.json({ result: resultText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "伺服器內部錯誤" });
  }
});

// Configure Vite middleware for development or fallback static files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
