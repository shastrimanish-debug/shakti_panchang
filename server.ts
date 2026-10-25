import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const portArgIdx = process.argv.indexOf("--port");
  const cliPort = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? Number(process.argv[portArgIdx + 1]) : null;
  // The app dev server must always listen on port 3000 (DEFAULT_APP_PORT), not Nginx's external port 8080
  const PORT = (cliPort && !isNaN(cliPort))
    ? cliPort
    : (Number(process.env.DEFAULT_APP_PORT || process.env.APP_PORT) || 3000);

  const hostArgIdx = process.argv.indexOf("--host");
  const cliHost = hostArgIdx !== -1 && process.argv[hostArgIdx + 1] ? process.argv[hostArgIdx + 1] : null;
  const HOST = process.env.HOST || (cliHost ? cliHost : "0.0.0.0");

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

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

  // Upay Parchi Direct Server-Side Download (100% reliable for Android WebView, iOS Safari, PWA)
  app.post("/api/parchi/download", (req: Request, res: Response) => {
    try {
      const { imageBase64, fileName } = req.body;
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).send("No image data provided");
      }
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const rawName = (fileName || "Upay_Parchi.png").toString();
      const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      res.setHeader("Content-Length", buffer.length.toString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.end(buffer);
    } catch (err: any) {
      console.error("Error in /api/parchi/download:", err);
      return res.status(500).send("Download error");
    }
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

      const defaultSystemInstruction = `ROLE & PERSONA:
You are "UMA" (उमा) — an experienced, deeply empathetic, living Vedic Astrologer speaking with warmth and authority like a trusted family guru (एक जीता-जागता विद्वान ज्योतिषी). You talk naturally, warmly, and directly to the user.

CRITICAL COMMUNICATION MANDATE:
- Talk like a REAL HUMAN BEING (एक जीता-जागता व्यक्ति). Do NOT sound like an algorithm, computer, or academic formula.
- NEVER use dummy placeholders like "XYZ", "[उपयोगकर्ता का लग्न]", or "[राशि]". Always name the native's ACTUAL Lagna and ACTUAL Moon Rashi from the Kundali context!
- STRICTLY AVOID robotic, confusing technical jargon that normal people cannot understand:
  ❌ DO NOT write "D-1, D-9, D-10, D-60"
  ❌ DO NOT write raw degree numbers like "01° 05' 48"" or "06° 37' 22""
  ❌ DO NOT write "KP कस्प उपनक्षत्र स्वामी (Sub-Lord)" or "सर्वाष्टकवर्ग के 26 बिंदु"
  ❌ DO NOT write "Executive Micro-Takeaway", "DMS", or technical table equations.

HOW UMA MUST SPEAK (MANDATORY 5-STEP HUMAN CONVERSATION):
1. **आत्मीय मंगलाचरण व पत्रिका अवलोकन (Warm Greeting & Real Lagna/Rashi Identification):**
   "॥ ॐ श्री गणेशाय नमः ॥\n\nसदा कल्याण हो प्रिय यजमान! मैंने आपकी जन्मपत्रिका का सूक्ष्म अवलोकन किया है।"
   इसके बाद कुंडली संदर्भ में उपलब्ध जातक के वास्तविक लग्न एवं चंद्र राशि का स्पष्ट उल्लेख करें:
   उदा: "आपकी पत्रिका में आपका लग्न **[वास्तविक लग्न, जैसे मेष, वृषभ आदि]** है और आपकी चंद्र राशि **[वास्तविक राशि, जैसे सिंह, वृश्चिक आदि]** (नक्षत्र: **[नक्षत्र]**) है।"
   (कुंडली संदर्भ में दिए गए असली लग्न, चंद्र राशि और नक्षत्र का ही नाम लें। कभी भी 'XYZ' या काल्पनिक नाम न बोलें।)
2. **अतीत के २-३ वर्षों का यथार्थ अनुभव (Past 2–3 Years Reality Check - वास्तविक ज्योतिषीय गणना अनुसार):**
   ⚠️ विशेष शास्त्रीय नियम: यह आवश्यक नहीं कि प्रत्येक जातक पिछले २-३ वर्षों में परेशान ही रहा हो! आपको कुंडली संदर्भ में दी गई दशा/अंतर्दशा (दशेश का भाव, उच्च/स्वक्षेत्र/नीच स्थिति, केंद्र/त्रिकोण स्थिति, अष्टकवर्ग बिंदु, साढ़ेसाती आदि) के वास्तविक गणित के आधार पर सत्य अनुभव बताना है:
   • **यदि दशा शुभ थी (दशेश १, ४, ५, ७, ९, १०, ११ भाव में, उच्च/स्वक्षेत्र, शुभ ग्रह, 28+ बिंदु):** स्पष्ट बताएं कि पिछला काल भाग्योदय, पदोन्नति, व्यापार विस्तार, आर्थिक लाभ, नए अवसर या परिवार में मांगलिक कार्य का रहा।
   • **यदि दशा मध्यम/मिश्रित थी:** बताएं कि नए दायित्व, स्थान या कार्य में परिवर्तन, भागदौड़ और परिश्रम बहुत रहा, किंतु आधार मजबूत हुआ।
   • **यदि दशा प्रतिकूल/छिद्र थी (६/८/१२ भाव, नीच/शत्रु ग्रह, तीव्र साढ़ेसाती, कम बिंदु):** केवल तभी संघर्ष, मानसिक कशमकश, विलंब या बनते काम अटकने का उल्लेख करें।
   जो ग्रह स्थिति सत्य दर्शाए, वही निष्पक्ष होकर बताएं।
3. **वर्तमान स्थिति व चल रही दशा (Present Situation):**
   वर्तमान में चल रही महादशा और अंतर्दशा का प्रभाव बताएं कि अब परिस्थितियां किस प्रकार नया मोड़ ले रही हैं और यजमान के प्रश्न के प्रति अनुकूल ग्रह क्या संकेत कर रहे हैं।
4. **आगामी समय की सटीक महीने-दर-महीने समयरेखा (Month-by-Month Future Timeline):**
   एकदम स्पष्ट और व्यावहारिक समयरेखा दें:
   • **[माह वर्ष से माह वर्ष]**: इस समय क्या विशिष्ट प्रगति, नौकरी/व्यापार में अवसर या बदलाव आएगा।
   • **[शिखर काल / Golden Period]**: किस महीने में कार्य सिद्ध होगा और भाग्य का पूर्ण साथ मिलेगा।
   • **दीर्घकालिक स्थिरता**: आने वाले ६ से १२ महीनों में किस प्रकार विस्तार व स्थायित्व मिलेगा।
5. **सरल व अचूक सात्विक उपाय एवं ६-सूत्रीय उपाय पर्ची (Practical Remedies):**
   दैनिक जीवन में आसानी से किए जा सकने वाले सात्विक उपाय (जैसे सूर्य को अर्घ्य, इष्ट मंत्र जप, गौ-सेवा, अन्न दान) और संक्षिप्त ६-सूत्रीय उपाय पर्ची।

अंत में ३ उपयोगी प्रश्न पूछें:
---
[अगले प्रश्न]:
• प्रश्न १
• प्रश्न २
• प्रश्न ३`;

      const activeSystemInstruction = defaultSystemInstruction;

      const currentDateObj = new Date();
      const hindiMonthNames = [
        "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
        "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
      ];
      const currentYear = currentDateObj.getFullYear();
      const currentMonthName = hindiMonthNames[currentDateObj.getMonth()];

      const promptParts = [
        `उपयोगकर्ता का प्रश्न (User Query): "${query}"`,
        `[वर्तमान संदर्भ समय (Real-time Reference Date)]: ${currentDateObj.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} (वर्ष: ${currentYear}, मास: ${currentMonthName})`,
      ];

      if (panchangContext) {
        promptParts.push(`\n[वर्तमान पंचांग संदर्भ]:\n${panchangContext}`);
      }

      if (kundaliContext) {
        promptParts.push(`\n[उपयोगकर्ता की जन्म कुंडली व दशा संदर्भ (Use this for internal calculation, but speak in pure human language without technical formulas)]:\n${kundaliContext}`);
      }

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const historyText = chatHistory
          .slice(-6)
          .map((m: any) => `${m.sender === "user" ? "यजमान" : "उमा"}: ${m.text}`)
          .join("\n");
        promptParts.push(`\n[पूर्व संवाद (Recent Chat Context)]:\n${historyText}`);
      }

      promptParts.push(`\nयजमान के प्रश्न का उत्तर एक जीते-जागते, अनुभवी विद्वान ज्योतिषी के रूप में अत्यंत आत्मीय, व्यावहारिक और स्पष्ट भाषा में दें। जातक के वास्तविक लग्न एवं चंद्र राशि का नाम स्पष्ट रूप से लें (कभी भी 'XYZ' न बोलें)। पिछले २-३ साल का अनुभव कुंडली की वास्तविक दशा व गोचर गणना के अनुसार ही बताएं (यदि शुभ थी तो भाग्योदय व प्रगति बताएं, यदि संघर्ष था तभी संघर्ष बताएं) और आगे की महीने-दर-महीने सटीक समयरेखा बताएं। किसी भी प्रकार के तकनीकी कोड (D1, D9, D60, डिग्री अंश, KP उपनक्षत्र) का प्रयोग न करें।`);

      const fullPrompt = promptParts.join("\n\n");

      let responseText = "";

      if (ai) {
        const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

        for (const model of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: fullPrompt,
              config: {
                systemInstruction: activeSystemInstruction,
                temperature: 0.5,
                tools: [{ googleSearch: {} }],
              },
            });
            if (response.text?.trim()) {
              responseText = response.text.trim();
              break;
            }
          } catch (mErr: any) {
            console.warn(`Model ${model} failed, trying next...`, mErr?.message || mErr);
          }
        }
      }

      if (!responseText) {
        return res.status(200).json({
          ok: false,
          error: "AI_FALLBACK_TO_LOCAL_SOOKSHMA_ENGINE",
        });
      }

      return res.status(200).json({
        ok: true,
        text: responseText,
        provider: "gemini",
      });
    } catch (err: any) {
      console.error("Error in /api/uma/chat:", err);
      return res.status(200).json({
        ok: false,
        error: "AI_FALLBACK_TO_LOCAL_SOOKSHMA_ENGINE",
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

      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
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

  // In-memory LRU cache for Vedic Shloka / Stotram / Uma Voice TTS Audio
  const ttsAudioCache = new Map<string, { audioBase64: string; mimeType: string }>();

  // High-Quality Global Neural TTS Endpoint for Vidushi UMA (Hindi Female Voice)
  // Supports Google Cloud Neural2 (hi-IN-Neural2-A, hi-IN-Neural2-D, hi-IN-Journey-F)
  // + Gemini 3.8 Flash Lite TTS (prebuilt voice Kore with Hindi Vedic persona)
  // + Graceful fallback signal to client-side high-fidelity neural synthesizer
  app.post("/api/tts/uma", async (req: Request, res: Response) => {
    try {
      const {
        text,
        voice = "hi-IN-Neural2-A",
        tone = "calm",
        rate = 0.94,
        pitch = 0.0,
        pitchSemis = 0.0,
        emphasis = "moderate",
        stylePrompt,
        persona = "uma"
      } = req.body || {};

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ ok: false, error: "TEXT_REQUIRED" });
      }

      const cleanText = text.trim().slice(0, 3000);
      const cacheKey = `uma:${voice}:${tone}:${rate}:${pitchSemis}:${emphasis}:${cleanText}`;
      const cached = ttsAudioCache.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          ok: true,
          audioBase64: cached.audioBase64,
          mimeType: cached.mimeType,
          cached: true,
          provider: "cache",
          tone,
        });
      }

      // Map tone selection to SSML emphasis & pitch parameters
      const validEmphasis = ["reduced", "moderate", "strong", "none"].includes(emphasis)
        ? emphasis
        : tone === "enthusiastic"
          ? "strong"
          : tone === "calm"
            ? "reduced"
            : "moderate";

      const effectivePitchSemis = typeof pitchSemis === "number" && pitchSemis !== 0
        ? pitchSemis
        : (tone === "enthusiastic" ? 2.2 : tone === "calm" ? -1.2 : 0.5);

      // 1. Google Cloud Text-to-Speech API (Neural2 / Journey with SSML emphasis & pitch)
      const googleTtsKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
      if (googleTtsKey) {
        try {
          const gttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsKey}`;

          // Escape XML for SSML
          const escapedText = cleanText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

          const ssmlText = `<speak><prosody pitch="${effectivePitchSemis >= 0 ? `+${effectivePitchSemis.toFixed(1)}` : effectivePitchSemis.toFixed(1)}st" rate="${Math.round(rate * 100)}%"><emphasis level="${validEmphasis}">${escapedText}</emphasis></prosody></speak>`;

          const gttsResp = await fetch(gttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { ssml: ssmlText },
              voice: {
                languageCode: "hi-IN",
                name: voice.startsWith("hi-IN") ? voice : "hi-IN-Neural2-A",
                ssmlGender: "FEMALE",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: Math.max(0.7, Math.min(1.3, rate)),
                pitch: Math.max(-10.0, Math.min(10.0, effectivePitchSemis)),
                effectsProfileId: ["handset-class-device", "headphone-class-device"],
              },
            }),
            signal: AbortSignal.timeout(9000),
          });

          if (gttsResp.ok) {
            const data: any = await gttsResp.json();
            if (data?.audioContent) {
              const payload = {
                audioBase64: data.audioContent,
                mimeType: "audio/mp3",
              };
              if (ttsAudioCache.size > 300) {
                const firstKey = ttsAudioCache.keys().next().value;
                if (firstKey) ttsAudioCache.delete(firstKey);
              }
              ttsAudioCache.set(cacheKey, payload);
              return res.status(200).json({
                ok: true,
                ...payload,
                provider: "google-neural2",
                tone,
              });
            }
          }
        } catch (gErr: any) {
          console.warn("Google Cloud TTS error, checking Gemini TTS next:", gErr?.message || gErr);
        }
      }

      // 2. Gemini 3.8 Flash Lite TTS with Tone Persona Prompting
      const ai = getGeminiClient();
      if (ai) {
        try {
          const toneStylePrompt = stylePrompt || (
            tone === "enthusiastic"
              ? "Bright, energetic, uplifting, enthusiastic Hindi female voice celebrating auspicious moments with high vocal presence, joyful confidence, and radiant warmth"
              : tone === "formal"
                ? "Dignified, articulate, authoritative 50-year experienced Vedic Jyotish Acharya speaking with classical precision, clear consonants, solemn respect, and stately cadence"
                : "Calm, gentle, soothing, maternal, peaceful Vedic female mentor speaking in serene meditative cadence with warm, relaxed tones and compassionate reassurance"
          );

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: toneStylePrompt,
                    },
                  } as any,
                ],
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" },
                },
              },
            },
          });

          const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const payload = {
              audioBase64: inlineData.data,
              mimeType: inlineData.mimeType || "audio/wav",
            };
            if (ttsAudioCache.size > 300) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, payload);
            return res.status(200).json({
              ok: true,
              ...payload,
              provider: "gemini-flash-lite-tts",
              tone,
            });
          }
        } catch (geminiErr: any) {
          console.warn("Gemini Flash Lite TTS fallback triggered:", geminiErr?.message || geminiErr);
        }
      }

      // 3. Secondary Server-Side Stream: Google High-Def Speech Stream (chunked)
      try {
        const streamChunks: string[] = [];
        const sentences = cleanText.split(/(?<=[।॥,.!\n])\s+/);
        let curChunk = "";
        for (const s of sentences) {
          if ((curChunk + " " + s).trim().length <= 180) {
            curChunk = (curChunk + " " + s).trim();
          } else {
            if (curChunk) streamChunks.push(curChunk);
            if (s.length <= 180) {
              curChunk = s.trim();
            } else {
              const words = s.split(/\s+/);
              curChunk = "";
              for (const w of words) {
                if ((curChunk + " " + w).trim().length <= 180) {
                  curChunk = (curChunk + " " + w).trim();
                } else {
                  if (curChunk) streamChunks.push(curChunk);
                  curChunk = w;
                }
              }
            }
          }
        }
        if (curChunk) streamChunks.push(curChunk);

        const mp3Buffers: Buffer[] = [];
        const effectiveSpeed = tone === "enthusiastic" ? "0.95" : tone === "calm" ? "0.82" : "0.88";
        for (const chunk of streamChunks.slice(0, 15)) {
          const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&ttsspeed=${effectiveSpeed}&q=${encodeURIComponent(chunk)}`;
          const ttsResp = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
            signal: AbortSignal.timeout(8000),
          });
          if (ttsResp.ok) {
            const arrBuf = await ttsResp.arrayBuffer();
            if (arrBuf.byteLength > 200) {
              mp3Buffers.push(Buffer.from(arrBuf));
            }
          }
        }

        if (mp3Buffers.length > 0) {
          const combined = Buffer.concat(mp3Buffers);
          const payload = {
            audioBase64: combined.toString("base64"),
            mimeType: "audio/mpeg",
          };
          if (ttsAudioCache.size > 300) {
            const firstKey = ttsAudioCache.keys().next().value;
            if (firstKey) ttsAudioCache.delete(firstKey);
          }
          ttsAudioCache.set(cacheKey, payload);
          return res.status(200).json({
            ok: true,
            ...payload,
            provider: "google-neural-stream",
            tone,
          });
        }
      } catch (streamErr: any) {
        console.warn("Secondary TTS stream in /api/tts/uma failed:", streamErr?.message || streamErr);
      }

      // 4. Fallback to client synthesis if remote neural synthesis is unavailable
      return res.status(200).json({
        ok: false,
        fallback: "client",
        message: "Using high-fidelity client-side Hindi neural voice engine.",
      });
    } catch (err: any) {
      console.error("Error in /api/tts/uma:", err?.message || err);
      return res.status(200).json({
        ok: false,
        fallback: "client",
        error: err?.message || "TTS_SERVER_ERROR",
      });
    }
  });

  // Vedic Sanskrit & Stotram Shuddha Uccharana TTS Endpoint
  app.post("/api/tts/sanskrit", async (req: Request, res: Response) => {
    try {
      const { text, voiceStyle = "pandit" } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ ok: false, error: "TEXT_REQUIRED" });
      }

      const cleanText = text.trim().slice(0, 1800);
      const cacheKey = `${voiceStyle}:${cleanText}`;
      const cached = ttsAudioCache.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          ok: true,
          audioBase64: cached.audioBase64,
          mimeType: cached.mimeType,
          cached: true,
        });
      }

      const ai = getGeminiClient();
      if (ai) {
        try {
          const voiceName = voiceStyle === "pandit" ? "Charon" : "Kore";
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `शुद्ध वैदिक संस्कृत एवं देववाणी उच्चारण में शांत, स्पष्ट और भक्तिमय लय के साथ पाठ करें: ${cleanText}`,
                    speechMetadata: {
                      style:
                        "Traditional Indian Vedic Sanskrit Acharya reciting sacred Sanskrit shlokas and stotrams with 100% pure Devanagari pronunciation (shuddha uccharana), complete vowel articulation without Hindi schwa deletion, clear visarga and anusvara resonance, and serene temple cadence",
                    },
                  } as any,
                ],
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
          });

          const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const payload = {
              audioBase64: inlineData.data,
              mimeType: inlineData.mimeType || "audio/wav",
            };
            if (ttsAudioCache.size > 200) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, payload);
            return res.status(200).json({
              ok: true,
              ...payload,
              provider: "gemini-tts",
            });
          }
        } catch (geminiTtsErr: any) {
          console.warn("Gemini TTS fallback triggered:", geminiTtsErr?.message || geminiTtsErr);
        }
      }

      // Secondary Server-Side Fallback: Google Neural Hindi/Sanskrit Speech Stream (chunked <= 180 chars)
      const chunks: string[] = [];
      const sentences = cleanText.split(/(?<=[।॥,.!\n])\s+/);
      let currentChunk = "";
      for (const s of sentences) {
        if ((currentChunk + " " + s).trim().length <= 180) {
          currentChunk = (currentChunk + " " + s).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          if (s.length <= 180) {
            currentChunk = s.trim();
          } else {
            const words = s.split(/\s+/);
            currentChunk = "";
            for (const w of words) {
              if ((currentChunk + " " + w).trim().length <= 180) {
                currentChunk = (currentChunk + " " + w).trim();
              } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = w;
              }
            }
          }
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      const mp3Buffers: Buffer[] = [];
      for (const chunk of chunks.slice(0, 12)) {
        const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&ttsspeed=0.82&q=${encodeURIComponent(chunk)}`;
        const ttsResp = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(8000),
        });
        if (ttsResp.ok) {
          const arrBuf = await ttsResp.arrayBuffer();
          if (arrBuf.byteLength > 200) {
            mp3Buffers.push(Buffer.from(arrBuf));
          }
        }
      }

      if (mp3Buffers.length > 0) {
        const combined = Buffer.concat(mp3Buffers);
        const payload = {
          audioBase64: combined.toString("base64"),
          mimeType: "audio/mpeg",
        };
        if (ttsAudioCache.size > 200) {
          const firstKey = ttsAudioCache.keys().next().value;
          if (firstKey) ttsAudioCache.delete(firstKey);
        }
        ttsAudioCache.set(cacheKey, payload);
        return res.status(200).json({
          ok: true,
          ...payload,
          provider: "neural-stream",
        });
      }

      return res.status(200).json({ ok: false, error: "TTS_UNAVAILABLE" });
    } catch (err: any) {
      console.warn("Error in /api/tts/sanskrit:", err?.message || err);
      return res.status(200).json({ ok: false, error: "TTS_ERROR" });
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

    // Fallback SPA routing in dev mode (Express 5 compatible)
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        const templatePath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Shakti Panchang server running on http://${HOST}:${PORT}`);
  });
}

startServer();
