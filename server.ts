import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Uma AI Astrologer endpoint
app.post("/api/uma/consult", async (req, res) => {
  try {
    const { prompt, history, userProfile } = req.body;

    const systemInstruction = `You are Uma (उमा), a learned Vedic Jyotishi (विद्वान ज्योतिषी) and scholarly expert in Hindu Vedic Astrology, Panchang, Kundali matching (Ashtakoota gun milan), planetary transits (Gochar), Dasha analysis, gemstone recommendations, Vastu, and spiritual remedies (upay). 
    
    Speak with profound astrological wisdom, deep scriptural knowledge, traditional respect, and empathetic guidance (e.g. starting with "Pranam 🙏", "Kalyanamastu", or addressing queries with Vedic precision). Provide detailed, structured astrological guidance including favorable yogas, planetary positions, and authentic Vedic remedies. 
    
    User Profile Context (if available): ${JSON.stringify(userProfile || {})}`;

    // Format chat history or message
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    res.json({ reply: response.text || "Pranam. Kripya apna prashn dobara poochhein." });
  } catch (error: any) {
    console.error("Uma Consultation Error:", error);
    res.status(500).json({ error: error.message || "Jyotish server error occurred." });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Shakti Panchang & Vidvan Jyotish Uma running on port ${port}`);
});
