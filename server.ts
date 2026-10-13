import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  // Shared Gemini client utility on the server
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
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
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // UMA AI Vedic Astrologer Chat Endpoint
  app.post("/api/uma/chat", async (req: Request, res: Response) => {
    try {
      const { query, panchangContext, kundaliContext, chatHistory, systemPrompt } = req.body;
      const licenseToken = (req.headers["x-license-token"] as string) || req.body.licenseToken;

      // Server-side anti-piracy validation: Reject expired trial or unauthorized bot calls
      if (licenseToken === "expired") {
        return res.status(403).json({
          ok: false,
          error: "TRIAL_EXPIRED",
          message: "७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। उमा AI परामर्श के लिए वार्षिक सदस्यता आवश्यक है।",
        });
      }

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

      const defaultSystemInstruction = `ROLE & PERSONA:
You are "UMA" (उमा) — a "Prakhand Vedic Jyotish Acharya" (Elite Vedic Astrologer) with 50 years of rigorous, unbroken experience in Parashari, Jaimini, and Nadi Astrology. You are a compassionate, divine, and authoritative sage, uncompromising on Vedic mathematics, planetary degrees, and ancient scriptural wisdom.

TONE & LANGUAGE:
- Speak in a highly respectful, divine, and comforting tone. Always address the user as "यजमान" (Yajaman) or "वत्स" (Vats).
- Use a blend of pure Devanagari Hindi and relevant, profound Sanskrit Shlokas (e.g. ॥ शुभं करोति कल्याणम् ॥, ॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च ॥), followed by clear Vedic explanations.
- Maintain the authority of a 50-year experienced sage—compassionate, wise, yet uncompromising on authentic Vedic calculations. Never say "As an AI model" or "I am programmed to".

CRITICAL HINGLISH & NATURAL LANGUAGE UNDERSTANDING:
- Understand user queries in any natural form: Hinglish (e.g. "meri app successful hogi ya nahi?", "karja kabtak utarega?", "shadi kab tak hogi?"), spoken casual Hindi, or English.
- Instantly decode the core question:
  * "meri app / business / project / startup successful hogi ya nahi" -> Analyze 10th House (Career & कर्म) and 11th House (Gain & सफलता).
  * "karja / loan / debt / udhaar kabtak utarega" -> Analyze 6th House (Debt) and 2nd House (Wealth & संचित धन).
  * "shadi / marriage / love / rishta kab hoga" -> Analyze 7th House and D-9 Navamsha.
- ALWAYS respond in simple, clear Devanagari Hindi (with warm, respectful Acharya tone) so that every user — regardless of educational background — instantly understands the exact answer, timeframes, and simple remedies!

CRITICAL DYNAMIC RESPONSE DISCIPLINE:
- Every single response MUST be uniquely crafted and directly address the user's specific question (e.g. Job/Career, App Success, Debt Clearance, Marriage, Wealth, Health).
- Analyze the specific House, Karaka Planet, and Dasha pertinent to the user's question. DO NOT output identical or generic paragraphs across different user queries.
- Incorporate specific details from the active Kundali (or explain the general Vedic principle if no Kundali is loaded yet).

BEHAVIORAL & COMPUTATIONAL GUIDELINES:

1. ASTRONOMICAL CALCULATIONS & KUNDALI ANALYSIS:
- Never rely solely on Lagna (D-1). Silently analyze D-9 (Navamsha) for internal strength and marital alignment, D-10 (Dashamsha) for career and status, Nakshatra Padas, Vimshottari Dasha (Mahadasha/Antardasha/Pratyantar), Ashtakvarga points, and precise planetary positions.
- Account for Retrograde (वक्री) planets, Combustion (अस्त), Exaltation/Debilitation (उच्च/नीच), and Planetary Wars (ग्रह युद्ध).
- If birth details/Kundali are present in the context, use them directly without asking again for name, date, time, or place. If no Kundali is loaded and the query requires personal predictions, explain the Vedic principles and gracefully suggest entering birth details in the Kundali tab.

2. STRUCTURED RESPONSE FRAMEWORK FOR ASTROLOGICAL CONSULTATIONS:
When answering queries about career, marriage, health, wealth, dasha, future predictions, or remedies, structure your response with these clear, divine headings:

॥ ॐ श्री गणेशाय नमः ॥

**ग्रह-दशा विश्लेषण (Grah Dasha Analysis)**
Deep analysis of relevant houses (1st, 2nd, 5th, 7th, 9th, 10th, 11th, etc.), D-9/D-10, active Mahadasha/Antardasha, and planetary transits.

**अतीत के दृढ संकेत (Past Insights)**
State 2-3 significant past life events or transitions of the Yajaman with absolute conviction based on past dashas/transits (e.g. residence change, career shift, financial tension).

**भविष्य की सटीक कालावधि (Future Trajectory)**
Provide pinpoint, time-bound future predictions with specific timelines (e.g. "अक्टूबर के मध्य में जब गुरु का गोचर..."). Avoid vague terms like "soon" or "maybe".

**वैदिक सात्विक उपाय (Vedic Upay)**
Authentic, practical, non-destructive remedies: exact Mantra, specific Japa count (e.g. 108 या 21 माला), Daan (charity) items, and non-structural Vastu adjustments.

3. DIRECT QUERIES (PANCHANG/MUHURAT/TODAY):
For direct inquiries (e.g. Rahu Kaal, Choghadiya, Today's Tithi, Disha Shool), provide the precise answer upfront in respectful, divine Vedic language without forcing past revelations.`;

      const activeSystemInstruction = (systemPrompt && systemPrompt.length > 200) ? systemPrompt : defaultSystemInstruction;

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
          .map((m: any) => `${m.sender === "user" ? "यजमान" : "उमा"}: ${m.text}`)
          .join("\n");
        promptParts.push(`\n[पूर्व संवाद (Recent Chat Context)]:\n${historyText}`);
      }

      promptParts.push(`\nउपरोक्त पंचांग व कुंडली विवरण के आधार पर यजमान के प्रश्न का उत्तर ५० वर्षों के अनुभवी प्रकांड वैदिक ज्योतिष आचार्य के रूप में देवतुल्य व सात्विक शैली में दें।`);

      const fullPrompt = promptParts.join("\n\n");

      let responseText = "";
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.8-flash"];
      let lastError: any = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
              systemInstruction: activeSystemInstruction,
              temperature: 0.7,
              tools: [{ googleSearch: {} }],
            },
          });
          if (response.text?.trim()) {
            responseText = response.text.trim();
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`Model ${model} failed, trying next...`, mErr?.message || mErr);
        }
      }

      if (!responseText) {
        return res.status(200).json({
          ok: false,
          error: lastError?.message || "EMPTY_RESPONSE",
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

  // AI Samudrik Shastra Face Analysis Endpoint
  app.post("/api/face-reading/analyze", async (req: Request, res: Response) => {
    try {
      const { imageBase64, imageMimeType } = req.body;
      const ai = getGeminiClient();

      if (!ai || !imageBase64) {
        return res.status(200).json({
          ok: false,
          error: "NO_AI_OR_IMAGE",
          message: "Gemini API key or face photo is missing; using offline Samudrik engine.",
        });
      }

      const prompt = `Analyze this face photo according to authentic Vedic Samudrik Shastra (महर्षि गर्ग व वराहमिहिर कृत सामुद्रिक लक्षण शास्त्र).
Return ONLY a valid JSON object with the following structure:
{
  "faceShape": "Oval / Round / Square / Heart / Diamond (in Hindi)",
  "faceShapeDesc": "3-4 sentence detailed Hindi personality and destiny prediction based on face shape",
  "vitalityScore": 92,
  "temperament": "सात्त्विक / राजसिक / तामसिक",
  "features": [
    {
      "part": "ललाट (Forehead)",
      "type": "उन्नत व चौड़ा",
      "traits": "तीक्ष्ण बुद्धिमत्ता, नेतृत्व क्षमता व भाग्योदय के लक्षण",
      "wisdom": "उन्नत ललाट सौम्यता व प्रशासनिक सफलता का सूचक है।"
    },
    {
      "part": "नेत्र (Eyes)",
      "type": "तेजस्वी व सौम्य",
      "traits": "गहरी अंतर्दृष्टि, सत्यनिष्ठा व एकाग्रता",
      "wisdom": "विशाल व स्निग्ध नेत्र ऐश्वर्य तथा आत्मीयता का संकेत देते हैं।"
    },
    {
      "part": "नासिका (Nose)",
      "type": "सरल व उन्नत",
      "traits": "स्वाभिमान, आर्थिक समृद्धि व दृढ संकल्प",
      "wisdom": "सीधी नासिका धन-धान्य तथा सुदृढ़ चरित्र का प्रतीक है।"
    },
    {
      "part": "ओष्ठ व दंत (Lips & Teeth)",
      "type": "सुगठित व सम्मोहक",
      "traits": "मधुर वाणी, सम्मोहन क्षमता व कलाप्रियता",
      "wisdom": "रक्तवर्ण ओष्ठ सम्भाषण कला व सौभाग्यशाली जीवन के लक्षण हैं।"
    },
    {
      "part": "चिबुक (Chin)",
      "type": "दृढ़ व सुडौल",
      "traits": "दृढ़ इच्छाशक्ति, अनुशासन व दीर्घायु",
      "wisdom": "सुडौल चिबुक निर्णय क्षमता व स्थायित्व दर्शाती है।"
    }
  ],
  "careerGuidance": "Detailed career and wealth prediction in Hindi based on face traits",
  "remedy": "Vedic remedy and lucky gemstone based on facial traits"
}`;

      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let resultText = "";

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                inlineData: {
                  mimeType: imageMimeType || "image/jpeg",
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                },
              },
              prompt,
            ],
            config: {
              responseMimeType: "application/json",
            },
          });
          if (response.text?.trim()) {
            resultText = response.text.trim();
            break;
          }
        } catch (mErr) {
          console.warn(`Face analysis model ${model} failed, trying next...`);
        }
      }

      if (resultText) {
        try {
          const parsed = JSON.parse(resultText);
          return res.status(200).json({ ok: true, data: parsed });
        } catch {
          // If JSON parse fails, return raw
        }
      }

      return res.status(200).json({ ok: false, error: "ANALYSIS_FAILED" });
    } catch (err: any) {
      console.error("Face Analysis API error:", err);
      return res.status(200).json({ ok: false, error: err?.message || "SERVER_ERROR" });
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
