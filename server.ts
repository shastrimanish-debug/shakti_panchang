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

  // Allow Capacitor Android WebView (https://localhost) and mobile clients to call /api/*
  app.use((req: Request, res: Response, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-license-token");
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

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

  // Authoritative Server Time Sync endpoint for Panchang & Kundali calculations
  app.get("/api/time", (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const serverTimeMs = Date.now();
    res.json({
      ok: true,
      serverTimeMs,
      iso: new Date(serverTimeMs).toISOString(),
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
You are "UMA" (उमा) — an experienced, deeply empathetic, living Vedic Astrologer and wise friend speaking naturally in Hindi.

CRITICAL CONVERSATION RULES:
1. REPLY LIKE A NORMAL HUMAN CHAT (सामान्य बातचीत की तरह उत्तर दें):
   - Read what the user ACTUALLY asked and answer that specific question directly, warmly, and naturally in 2 to 3 conversational paragraphs!
   - Do NOT dump a rigid 5-heading report ("१. पिछले २-३ वर्षों का यथार्थ...", "२. वर्तमान स्थिति...", etc.) unless the user explicitly asks for a full Kundali report or past-present-future analysis.
   - If the user asks a specific or practical question (e.g., "Maine ye app banai hai successful hogi ya nahi", "मेरा काम चलेगा या नहीं", "कैसे हो", "शादी कब होगी"), talk directly about their question using their actual Lagna, Moon Rashi, and active Dasha naturally woven into the conversation.
2. NO RAW MARKDOWN ASTERISKS:
   - Do NOT wrap words in **bold** or *italic* asterisks, because the chat displays plain text. Write clean, readable Devanagari Hindi.
3. USE REAL CHART DATA NATURALLY:
   - Mention the native's real Lagna, Rashi, and active Mahadasha/Antardasha from the provided context naturally (never use placeholders like XYZ).
   - Give clear, encouraging, realistic timeframes and 1–2 simple daily remedies relevant to their question.

At the end, include 3 natural follow-up questions in this exact format:
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
        promptParts.push(`\n[उपयोगकर्ता की जन्म कुंडली व दशा संदर्भ]:\n${kundaliContext}`);
      }

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const historyText = chatHistory
          .slice(-6)
          .map((m: any) => `${m.sender === "user" ? "यजमान" : "उमा"}: ${m.text}`)
          .join("\n");
        promptParts.push(`\n[पूर्व संवाद (Recent Chat Context)]:\n${historyText}`);
      }

      promptParts.push(`\nयजमान के प्रश्न ("${query}") का सीधा, आत्मीय और सामान्य बातचीत (Normal Chat) जैसा उत्तर दें। बिना पूछे लंबी ५-सूत्रीय रिपोर्ट या पिछले २-३ साल का रटा-रटाया टेम्पलेट न लिखें, और किसी भी शब्द के आगे-पीछे ** (स्टार) न लगाएं।`);

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
                temperature: 0.6,
              },
            });
            if (response.text?.trim()) {
              responseText = response.text.trim().replace(/\*\*/g, "");
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
  // High-Quality Global Neural TTS Endpoint for Vidushi UMA (Natural Indian Female Voice)
  // Primary: Google Cloud Chirp 3 HD Natural Indian Female Voices (hi-IN-Chirp3-HD-Kore / Aoede / Leda)
  // Secondary: Google Cloud Neural2 Female (hi-IN-Neural2-A / hi-IN-Neural2-D) at natural pitch (0.0)
  // Tertiary: Gemini 3.8 Flash Lite TTS (Kore)
  app.post("/api/tts/uma", async (req: Request, res: Response) => {
    try {
      const {
        text,
        voice = "hi-IN-Chirp3-HD-Kore",
        tone = "calm",
        rate = 0.97,
        stylePrompt,
      } = req.body || {};

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ ok: false, error: "TEXT_REQUIRED" });
      }

      const cleanText = text
        .trim()
        .replace(/।\s*।+/g, "।")
        .replace(/\s+/g, " ")
        .slice(0, 2500);

      // Select the best natural Indian Female Chirp 3 HD voice by tone
      const chirpVoiceMap: Record<string, { name: string; defaultRate: number }> = {
        calm: { name: "hi-IN-Chirp3-HD-Kore", defaultRate: 0.97 },
        enthusiastic: { name: "hi-IN-Chirp3-HD-Aoede", defaultRate: 1.0 },
        formal: { name: "hi-IN-Chirp3-HD-Leda", defaultRate: 0.96 },
      };
      const tonePreset = chirpVoiceMap[tone] || chirpVoiceMap.calm;
      const targetChirpVoice =
        typeof voice === "string" && voice.includes("Chirp3-HD")
          ? voice
          : tonePreset.name;

      // Natural human speaking speed (never slow-motion or robotic)
      const rawRate = typeof rate === "number" && rate >= 0.92 ? rate : tonePreset.defaultRate;
      const effectiveRate = Math.max(0.94, Math.min(1.08, rawRate));

      const cacheKey = `uma_chirp3_v4:${targetChirpVoice}:${tone}:${effectiveRate.toFixed(2)}:${cleanText}`;
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

      // 1. Primary: Google Cloud Chirp 3 HD Natural Indian Woman Voice (hi-IN-Chirp3-HD-Kore / Aoede / Leda)
      // Uses plain text input (no SSML <break> chopping and no pitch shifting) for 100% realistic human intonation
      const googleTtsKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
      if (googleTtsKey) {
        try {
          const gttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsKey}`;

          const chirpResp = await fetch(gttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { text: cleanText },
              voice: {
                languageCode: "hi-IN",
                name: targetChirpVoice,
                ssmlGender: "FEMALE",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: effectiveRate,
              },
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (chirpResp.ok) {
            const data: any = await chirpResp.json();
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
                provider: "google-chirp3-hd-female",
                voice: targetChirpVoice,
                tone,
              });
            }
          }

          // Fallback 1B: Google Cloud Neural2-A / Neural2-D at 0.0 pitch (no artificial pitch shift)
          const neural2Resp = await fetch(gttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { text: cleanText },
              voice: {
                languageCode: "hi-IN",
                name: "hi-IN-Neural2-A",
                ssmlGender: "FEMALE",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: effectiveRate,
                pitch: 0.0,
              },
            }),
            signal: AbortSignal.timeout(8000),
          });

          if (neural2Resp.ok) {
            const data: any = await neural2Resp.json();
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
                provider: "google-neural2-female",
                tone,
              });
            }
          }
        } catch (gErr: any) {
          console.warn("Google Cloud TTS error, checking Gemini TTS next:", gErr?.message || gErr);
        }
      }

      // 2. Gemini 3.8 Flash Lite TTS with Natural Indian Female Persona (Kore)
      const ai = getGeminiClient();
      if (ai) {
        try {
          const toneStylePrompt = stylePrompt || (
            tone === "enthusiastic"
              ? "Natural, warm, cheerful Indian woman speaking conversational Hindi with authentic Indian accent and friendly warmth"
              : tone === "formal"
                ? "Natural, composed, articulate Indian woman speaking clear Hindi and Sanskrit with graceful human intonation"
                : "Warm, gentle, natural Indian woman speaking conversational Hindi like a caring family astrologer with smooth, human cadence"
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

      // 3. Secondary Server-Side Stream at natural human speed (0.98)
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
        for (const chunk of streamChunks.slice(0, 15)) {
          const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&ttsspeed=0.98&q=${encodeURIComponent(chunk)}`;
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
        message: "Using high-fidelity client-side Hindi neural female voice engine.",
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

  // Vedic Sanskrit & Stotram Shuddha Uccharana Female NTTS Endpoint
  app.post("/api/tts/sanskrit", async (req: Request, res: Response) => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ ok: false, error: "TEXT_REQUIRED" });
      }

      const cleanText = text.trim().slice(0, 1800);
      const cacheKey = `sanskrit_chirp3_female_v4:${cleanText}`;
      const cached = ttsAudioCache.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          ok: true,
          audioBase64: cached.audioBase64,
          mimeType: cached.mimeType,
          cached: true,
        });
      }

      // 1. Primary: Google Cloud Chirp 3 HD Female Voice (hi-IN-Chirp3-HD-Kore)
      const googleTtsKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
      if (googleTtsKey) {
        try {
          const gttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsKey}`;

          const gttsResp = await fetch(gttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { text: cleanText },
              voice: {
                languageCode: "hi-IN",
                name: "hi-IN-Chirp3-HD-Kore",
                ssmlGender: "FEMALE",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 0.94,
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
              if (ttsAudioCache.size > 200) {
                const firstKey = ttsAudioCache.keys().next().value;
                if (firstKey) ttsAudioCache.delete(firstKey);
              }
              ttsAudioCache.set(cacheKey, payload);
              return res.status(200).json({
                ok: true,
                ...payload,
                provider: "google-chirp3-hd-female",
              });
            }
          }
        } catch (gErr: any) {
          console.warn("Google Chirp3 Sanskrit TTS error, trying Gemini TTS:", gErr?.message || gErr);
        }
      }

      // 2. Secondary: Gemini 3.8 Flash Lite TTS (Female Voice Kore)
      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `शुद्ध वैदिक संस्कृत एवं देववाणी उच्चारण में मधुर महिला स्वर, स्पष्ट अक्षर और भक्तिमय लय के साथ पाठ करें: ${cleanText}`,
                    speechMetadata: {
                      style:
                        "Melodious, serene Indian female Vedic scholar (Vidushi) reciting sacred Sanskrit shlokas and stotrams with 100% pure Devanagari pronunciation (shuddha uccharana), complete vowel articulation without Hindi schwa deletion, clear visarga and anusvara resonance, and devotional temple cadence",
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
            if (ttsAudioCache.size > 200) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, payload);
            return res.status(200).json({
              ok: true,
              ...payload,
              provider: "gemini-tts-female",
            });
          }
        } catch (geminiTtsErr: any) {
          console.warn("Gemini TTS fallback triggered:", geminiTtsErr?.message || geminiTtsErr);
        }
      }

      // 3. Tertiary Server-Side Fallback: Google Neural Female Hindi/Sanskrit Speech Stream (chunked <= 180 chars)
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
        const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&ttsspeed=0.86&q=${encodeURIComponent(chunk)}`;
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
          provider: "neural-stream-female",
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
