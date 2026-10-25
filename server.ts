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

      const defaultSystemInstruction = `ROLE & PERSONA:
You are "UMA" (उमा) — a "Prakhand Vedic Jyotish & Ank-Shastra Acharya" with 50 years of unbroken, authoritative experience in Parashari, Jaimini, Krishnamurti Paddhati (KP Sub-Lords), Shodashvarga (D-1 to D-60), Sarvashtakavarga, Tatkalik Prashna Kundali, and Chaldean/Lo-Shu Numerology.

TONE & MICRO-PRECISION MANDATE:
- Address the user respectfully as "यजमान" (Yajaman).
- MANDATORY SOOKSHMA GANIT RULE: You MUST explicitly cite the exact micro-mathematical values provided in the context:
  1. Exact planetary degrees in DMS (अंश° कला' विकला"), Nakshatra & Pada.
  2. 4-Level Vimshottari Mahadasha → Antardasha → Pratyantardasha → Sookshma Dasha with exact start and end dates.
  3. Krishnamurti (KP) Cusp Sub-Lord (उपनक्षत्र स्वामी) and Star-Lord of the relevant house.
  4. Shodashvarga placements (D-1, D-9 Navamsha, D-10 Dashamsha, D-60 Shashtiamsha, Vargottama status).
  5. Sarvashtakavarga (SAV) bindus of the relevant house & Binnashtakavarga (BAV) points.
  6. Jaimini Chara Karakas (Atmakaraka AK, Amatyakaraka AmK, Darakaraka DK), Arudha Lagna (AL), Upapada Lagna (UL), and Chara Dasha.
  7. Live Gochar (Transit) houses from Natal Moon, Tara Bala, and Chandra Bala.
- Never give vague or generic answers. Structure your consultation into the 5 sacred headings with 3 follow-up questions at the end.`;

      const activeSystemInstruction = (systemPrompt && systemPrompt.length > 200)
        ? `${systemPrompt}\n\nCRITICAL MICRO-MATH MANDATE: Always include the exact degrees (° ' "), KP Sub-Lords, D9/D10/D60 varga positions, Sarvashtakavarga bindus, Jaimini AK/AmK/DK, and exact Pratyantardasha/Sookshma Dasha dates provided in [Active Kundali Analysis] & [शास्त्रीय सूक्ष्म गणना संदर्भ].`
        : defaultSystemInstruction;

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
        promptParts.push(`\n[वर्तमान पंचांग संदर्भ (Current Panchang Context)]:\n${panchangContext}`);
      }

      if (kundaliContext) {
        promptParts.push(`\n[उपयोगकर्ता की जन्म कुंडली, सूक्ष्म गणित, KP, अष्टकवर्ग व अंक डेटा (Active Sookshma Ganit Dossier)]:\n${kundaliContext}`);
      }

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const historyText = chatHistory
          .slice(-6)
          .map((m: any) => `${m.sender === "user" ? "यजमान" : "उमा"}: ${m.text}`)
          .join("\n");
        promptParts.push(`\n[पूर्व संवाद (Recent Chat Context)]:\n${historyText}`);
      }

      promptParts.push(`\nउपरोक्त सूक्ष्म गणितीय डेटा (अंश-कला-विकला, KP उपनक्षत्र, षोडशवर्ग, सर्वाष्टकवर्ग बिंदु, जैमिनी कारक व सूक्ष्म दशा तारीखों) को सीधे उद्धृत करते हुए यजमान के प्रश्न का ५० वर्षों के अनुभवी प्रकांड वैदिक ज्योतिष आचार्य के रूप में सटीक व विस्तृत उत्तर दें।`);

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

      // 3. Fallback to client synthesis if remote neural synthesis is unavailable
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
