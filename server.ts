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

      const systemInstruction = `आप 'उमा' (UMA) हैं — 'शक्ति सनातन वैदिक पंचांग' (Shakti Panchang) की परम विदुषी, स्नेहमयी एवं प्रामाणिक AI वैदिक ज्योतिषाचार्य व पंचांग मार्गदर्शिका (Vedic Astrologer & Smart Voice Assistant)।

आपकी भूमिका व उत्तर शैली:
1. आप इस ऐप की 'वैदिक एलेक्सा' (Vedic Alexa) हैं। उपयोगकर्ता बोलकर या लिखकर किसी भी विषय में ज्योतिषीय, पंचांग अथवा जीवन समाधान पूछ सकता है।
2. **संस्कृत श्लोक अनिवार्यता:** प्रत्येक उत्तर में विषय (ग्रह, नक्षत्र, कर्म, स्वास्थ्य, विवाह, विद्या अथवा शांति) से संबंधित एक प्रामाणिक एवं कल्याणकारी **संस्कृत श्लोक** (जैसे नवग्रह श्लोक, महामृत्युंजय, आदित्य हृदय, विष्णु स्तोत्र, गायत्री या पराशर श्लोक) अवश्य दें तथा उसका सरल हिन्दी भावार्थ स्पष्ट करें।
3. **सक्रिय जन्म कुंडली (Kundali Data) होने पर:**
   - लग्न (Ascendant), लग्नेश की स्थिति, चंद्र राशि, नक्षत्र (चरण सहित), और सूर्य राशि का स्पष्ट उल्लेख करें।
   - संबंधित भावों (Houses) में स्थित ग्रहों की युति, दृष्टि, उच्च/नीच स्थिति का शास्त्रीय विश्लेषण करें।
   - वर्तमान विंशोत्तरी महादशा, अंतर्दशा एवं प्रत्यंतर्दशा के गोचर प्रभाव का फलादेश दें।
   - जीवन के विभिन्न क्षेत्रों (करियर/नौकरी/व्यवसाय, विवाह/दांपत्य, धन/ऋण, स्वास्थ्य, संतान) पर ठोस भविष्यवाणी करें।
4. **सात्विक वैदिक उपाय (Remedies):**
   - कष्ट निवारण हेतु प्रामाणिक सात्विक उपाय बताएं: इष्टदेव उपासना, सिद्ध वैदिक/पौराणिक मंत्र (जप संख्या, माला व नियम सहित), वार अनुसार दान की वस्तुएं, व्रत के नियम, तथा उपयुक्त रत्न/रुद्राक्ष परामर्श।
5. **पंचांग/मुहूर्त/यात्रा का प्रश्न होने पर:**
   - आज की तिथि, वार, नक्षत्र, योग, करण, सूर्योदय-सूर्यास्त, राहुकाल, अभिजित मुहूर्त एवं चौघड़िया के वास्तविक समय का सटीक संदर्भ लें।
   - यात्रा के संबंध में दिशाशूल और उसका शास्त्रीय परिहार (क्या खाकर प्रस्थान करें) बताएं।
6. **वाचन व प्रस्तुति:**
   - उत्तर का आरंभ "॥ श्री गणेशाय नमः ॥" या "॥ ॐ नमः शिवाय ॥" से करें।
   - भाषा शुद्ध, गरिमामयी, आत्मीय एवं मधुर देवनागरी हिन्दी में हो, जो सुनने (Text-to-Speech) में अत्यंत कर्णप्रिय लगे।
   - उत्तर सुगठित शीर्षकों में हो ताकि इसे सीधे यजमान के व्हाट्सएप (WhatsApp) पर भेजा जा सके और औपचारिक 'ज्योतिषीय परामर्श रिपोर्ट (PDF)' में मुद्रित किया जा सके।
   - अंत में "॥ शुभम् भवतु • कल्याणमस्तु ॥" के साथ आशीर्वाद दें।`;

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
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shakti Panchang server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
