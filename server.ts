import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Shared Gemini client utility on the server
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return null;
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API health
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // UMA AI Vedic Astrologer Chat Endpoint
  app.post("/api/uma/chat", async (req: Request, res: Response) => {
    try {
      const { query, panchangContext, kundaliContext, chatHistory } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ ok: false, error: "Query is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          ok: false,
          error: "NO_API_KEY",
          message: "Gemini API key is not configured; using offline Vedic calculation engine.",
        });
      }

      const systemInstruction = `आप 'उमा' (UMA) हैं — 'शक्ति सनातन वैदिक पंचांग' (Shakti Panchang) की अत्यंत विद्वान, स्नेहमयी एवं प्रामाणिक AI वैदिक ज्योतिषाचार्य व पंचांग मार्गदर्शिका (Vedic Astrologer & Smart Voice Assistant)।

आपकी भूमिका:
1. आप इस ऐप की 'वैदिक एलेक्सा' (Vedic Alexa) हैं। उपयोगकर्ता बोलकर या लिखकर किसी भी विषय में ज्योतिषीय व पंचांग प्रश्न पूछ सकता है।
2. जब भी उपयोगकर्ता की जन्म कुंडली (Kundali Data) उपलब्ध हो:
   - लग्न (Ascendant), लग्नेश, चंद्र राशि, नक्षत्र, सूर्य राशि का सूक्ष्म विश्लेषण करें।
   - 12 भावों (Houses) में ग्रहों की स्थिति (उच्च, नीच, स्वक्षेत्र, युति, दृष्टि) की गणना करें।
   - वर्तमान महादशा, अंतर्दशा का प्रभाव स्पष्ट करें।
   - जीवन के विभिन्न क्षेत्रों (करियर/नौकरी/व्यवसाय, विवाह/संबंध, आर्थिक स्थिति/धन लाभ, स्वास्थ्य, विद्या/संतान) पर सटीक भविष्यवाणी (Predictions) करें।
   - कष्ट निवारण हेतु शास्त्रसम्मत सात्विक उपाय (Remedies) बताएं — जैसे: इष्टदेव उपासना, सिद्ध मंत्र जप (संख्या व माला सहित), दान (वार व वस्तु), व्रत, तथा रत्न परामर्श।
3. जब पंचांग/मुहूर्त/यात्रा का प्रश्न हो:
   - आज की तिथि, वार, नक्षत्र, योग, करण, सूर्योदय-सूर्यास्त, राहुकाल एवं चौघड़िया के वास्तविक समय का संदर्भ लें।
   - दिशाशूल होने पर वर्जित दिशा और उसका शास्त्रोक्त परिहार बताएं।
4. भाषा व शैली:
   - भाषा अत्यंत मधुर, श्रद्धापूर्ण, शुद्ध देवनागरी हिन्दी में हो।
   - आरम्भ "॥ श्री गणेशाय नमः ॥" या "॥ ॐ नमः शिवाय ॥" से करें।
   - उत्तर सुगठित, बिंदुवार (Bullet Points) एवं स्पष्ट हो ताकि मोबाइल स्क्रीन पर पढ़ने व ऑडियो में सुनने में अत्यंत सुखद लगे।
   - कभी भी निराशाजनक या डराने वाली बातें न कहें; सदैव पुरुषार्थ, धर्म, संयम और आशा का प्रकाश दें।`;

      const promptParts = [
        `उपयोगकर्ता का प्रश्न (User Query): "${query}"`,
      ];

      if (panchangContext) {
        promptParts.push(`\n[वर्तमान पंचांग संदर्भ (Current Panchang Context)]:\n${panchangContext}`);
      }

      if (kundaliContext) {
        promptParts.push(`\n[उपयोगकर्ता की जन्म कुंडली व ग्रह गणना डेटा (Active Kundali Analysis)]:\n${kundaliContext}`);
      } else {
        promptParts.push(`\n[कुंडली स्थिति]: उपयोगकर्ता की कोई जन्म कुंडली अभी लोड नहीं है। यदि प्रश्न व्यक्तिगत फल से संबंधित हो, तो ज्योतिषीय सिद्धांत बताएं और सुझाव दें कि वे कुंडली टैब में अपना जन्म विवरण भरें।`);
      }

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const historyText = chatHistory
          .slice(-6)
          .map((m: any) => `${m.sender === "user" ? "उपयोगकर्ता" : "उमा"}: ${m.text}`)
          .join("\n");
        promptParts.push(`\n[पूर्व संवाद (Recent Chat Context)]:\n${historyText}`);
      }

      promptParts.push(`\nकृपया उपरोक्त पंचांग व कुंडली गणनाओं के आधार पर उपयोगकर्ता के प्रश्न का सम्पूर्ण ज्योतिषीय उत्तर व शास्त्रोक्त उपाय प्रदान करें।`);

      const fullPrompt = promptParts.join("\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || "";

      if (!responseText) {
        return res.status(200).json({
          ok: false,
          error: "EMPTY_RESPONSE",
        });
      }

      return res.status(200).json({
        ok: true,
        text: responseText,
      });
    } catch (err: any) {
      console.error("Gemini API Error in /api/uma/chat:", err);
      return res.status(200).json({
        ok: false,
        error: err?.message || "SERVER_ERROR",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shakti Panchang server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
