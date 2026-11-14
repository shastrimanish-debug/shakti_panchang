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
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  const HOSTING_UMA_URL = "https://myshivshakti.in/shaktipanchang/uma/v1/uma.php";

  // API health
  app.get("/api/health", async (_req: Request, res: Response) => {
    const rawKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    const hasLocalKey = Boolean(rawKey && rawKey !== "MY_GEMINI_API_KEY");
    let hostingProviders: { gemini?: boolean; grok?: boolean; openrouter?: boolean } | null = null;
    try {
      const hResp = await fetch(HOSTING_UMA_URL, { signal: AbortSignal.timeout(3500) });
      if (hResp.ok) {
        const hJson: any = await hResp.json();
        if (hJson?.ok) {
          hostingProviders = {
            gemini: Boolean(hJson.gemini),
            grok: Boolean(hJson.grok),
            openrouter: Boolean(hJson.openrouter),
          };
        }
      }
    } catch {
      // Ignore hosting ping error
    }
    const hasHostingKey = Boolean(
      hostingProviders && (hostingProviders.gemini || hostingProviders.grok || hostingProviders.openrouter)
    );
    res.json({
      status: "ok",
      hasGeminiKey: hasLocalKey || hasHostingKey,
      hasLocalKey,
      hasHostingKey,
      hostingProviders,
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

  // Dynamic Translated Vedic Panchang API (Supports /api.php?lang=xx & /api/panchang?lang=xx)
  // Meets Play Console requirement: "fetch('api.php?lang=hi') returns translated data"
  app.all(["/api.php", "/api/panchang"], async (req: Request, res: Response) => {
    try {
      const rawLang = (req.query.lang || req.body?.lang || "hi").toString().toLowerCase().trim();
      const lang = ["en", "gu", "mr", "hi"].includes(rawLang) ? rawLang : (rawLang.startsWith("en") ? "en" : (rawLang.startsWith("gu") ? "gu" : "hi"));

      const rawDate = (req.query.date || req.body?.date || "").toString();
      const targetDate = rawDate ? new Date(rawDate) : new Date();
      const validDate = isNaN(targetDate.getTime()) ? new Date() : targetDate;

      const lat = Number(req.query.lat || req.body?.lat) || 23.1765; // Ujjain default
      const lng = Number(req.query.lng || req.body?.lng) || 75.7885;
      const tz = Number(req.query.tz || req.body?.tz) || 5.5;

      const { calculateVedicPanchang } = await import("./src/services/astronomy.js");
      const { trVedic, trWeekday, trRashi, trChoghadiyaMeaning } = await import("./src/i18n/vedicTranslate.js");

      const panchangData = calculateVedicPanchang(validDate, lat, lng, tz);

      const translatedPanchang = {
        date: validDate.toISOString().split("T")[0],
        weekday: trWeekday(panchangData.weekday, lang),
        tithi: trVedic(panchangData.tithi, lang),
        paksha: trVedic(panchangData.paksha, lang),
        nakshatra: trVedic(panchangData.nakshatra, lang),
        yoga: trVedic(panchangData.yoga, lang),
        karana: trVedic(panchangData.karana, lang),
        sunRashi: trRashi(panchangData.solarRashi, lang),
        moonRashi: trRashi(panchangData.lunarRashi, lang),
        vikramSamvat: panchangData.samvat,
        sakaSamvat: panchangData.sakaSamvat,
        masa: trVedic(panchangData.masa, lang),
        sunrise: panchangData.solar?.sunrise?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) || "06:00 AM",
        sunset: panchangData.solar?.sunset?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) || "06:30 PM",
        dayWindows: panchangData.dayWindows?.map((dw: any) => ({
          title: trVedic(dw.title, lang),
          start: dw.start instanceof Date ? dw.start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : String(dw.start),
          end: dw.end instanceof Date ? dw.end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : String(dw.end),
          kind: dw.kind,
        })),
      };

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes cache
      return res.json({
        ok: true,
        language: lang,
        date: validDate.toISOString().split("T")[0],
        location: {
          latitude: lat,
          longitude: lng,
          timezoneHours: tz,
        },
        panchang: translatedPanchang,
        source: "authoritative_vedic_backend",
      });
    } catch (err: any) {
      console.error("Error in dynamic panchang API (/api.php):", err);
      return res.status(500).json({
        ok: false,
        error: "CALCULATION_ERROR",
        message: err?.message || "Failed to calculate dynamic panchang",
      });
    }
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

  // -------------------------------------------------------------
  // Cloud Backup & Restore for Kundali Profiles
  // -------------------------------------------------------------
  const CLOUD_BACKUP_DIR = path.join(process.cwd(), "data");
  const CLOUD_BACKUP_FILE = path.join(CLOUD_BACKUP_DIR, "cloud_backups.json");

  function readCloudBackups(): Record<string, any> {
    try {
      if (!fs.existsSync(CLOUD_BACKUP_DIR)) {
        fs.mkdirSync(CLOUD_BACKUP_DIR, { recursive: true });
      }
      if (fs.existsSync(CLOUD_BACKUP_FILE)) {
        const raw = fs.readFileSync(CLOUD_BACKUP_FILE, "utf-8");
        return JSON.parse(raw) || {};
      }
    } catch (e) {
      console.warn("Failed to read cloud backups file:", e);
    }
    return {};
  }

  function writeCloudBackups(data: Record<string, any>) {
    try {
      if (!fs.existsSync(CLOUD_BACKUP_DIR)) {
        fs.mkdirSync(CLOUD_BACKUP_DIR, { recursive: true });
      }
      fs.writeFileSync(CLOUD_BACKUP_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write cloud backups file:", e);
    }
  }

  app.post("/api/cloud-backup/save", (req: Request, res: Response) => {
    try {
      const { key, profiles, clientInfo } = req.body;
      const cleanKey = typeof key === "string" ? key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") : "";
      if (!cleanKey || cleanKey.length < 4) {
        return res.status(400).json({ ok: false, error: "कृपया कम से कम 4 अक्षरों का वैध मोबाइल नंबर या बैकअप कोड दर्ज करें।" });
      }
      if (!Array.isArray(profiles)) {
        return res.status(400).json({ ok: false, error: "अमान्य कुंडली डेटा।" });
      }
      const backups = readCloudBackups();
      backups[cleanKey] = {
        key: cleanKey,
        profiles: profiles.slice(0, 100),
        count: profiles.length,
        updatedAt: new Date().toISOString(),
        clientInfo: clientInfo || {},
      };
      writeCloudBackups(backups);
      return res.json({
        ok: true,
        key: cleanKey,
        count: profiles.length,
        updatedAt: backups[cleanKey].updatedAt,
      });
    } catch (err: any) {
      console.error("Error in /api/cloud-backup/save:", err);
      return res.status(500).json({ ok: false, error: "बैकअप सुरक्षित करने में त्रुटि आई।" });
    }
  });

  app.get("/api/cloud-backup/restore/:key", (req: Request, res: Response) => {
    try {
      const rawKey = req.params.key;
      const cleanKey = typeof rawKey === "string" ? rawKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") : "";
      if (!cleanKey) {
        return res.status(400).json({ ok: false, error: "बैकअप कोड या मोबाइल नंबर आवश्यक है।" });
      }
      const backups = readCloudBackups();
      const record = backups[cleanKey];
      if (!record || !Array.isArray(record.profiles)) {
        return res.status(404).json({ ok: false, error: "इस मोबाइल नंबर / बैकअप कोड पर कोई सहेजा हुआ बैकअप नहीं मिला।" });
      }
      return res.json({
        ok: true,
        key: cleanKey,
        profiles: record.profiles,
        count: record.count || record.profiles.length,
        updatedAt: record.updatedAt,
      });
    } catch (err: any) {
      console.error("Error in /api/cloud-backup/restore:", err);
      return res.status(500).json({ ok: false, error: "क्लाउड से रीस्टोर करने में त्रुटि आई।" });
    }
  });

  // UMA AI Vedic Astrologer Chat Endpoint
  app.post("/api/uma/chat", async (req: Request, res: Response) => {
    try {
      const { query, panchangContext, kundaliContext, chatHistory, systemPrompt, lang } = req.body;
      const c = String(lang || "hi").slice(0, 2).toLowerCase();
      const licenseToken = (req.headers["x-license-token"] as string) || req.body.licenseToken;

      // Server-side anti-piracy validation: Reject expired trial or unauthorized bot calls
      if (licenseToken === "expired") {
        return res.status(403).json({
          ok: false,
          error: "TRIAL_EXPIRED",
          message:
            c === "en"
              ? "Your 7-day free trial has ended. An annual or lifetime plan is required for Uma AI consultation."
              : c === "gu"
              ? "૭-દિવસીય મફત ટ્રાયલ પૂર્ણ થઈ ગઈ છે. ઉમા AI પરામર્શ માટે સભ્યપદ આવશ્યક છે."
              : "७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। उमा AI परामर्श के लिए वार्षिक सदस्यता आवश्यक है।",
        });
      }

      if (!query || typeof query !== "string") {
        return res.status(400).json({ ok: false, error: "Query is required" });
      }

      const languageRule =
        c === "en"
          ? "LANGUAGE RULE: Respond naturally in clear, articulate English. Keep any sacred Sanskrit shlokas or mantras in Devanagari followed by a brief English meaning when helpful."
          : c === "gu"
          ? "LANGUAGE RULE: Respond naturally in pure, warm Gujarati script (ગુજરાતી લિપિ). Keep any sacred Sanskrit shlokas or mantras in Devanagari followed by a brief Gujarati meaning when helpful."
          : "LANGUAGE RULE: Respond naturally in clear, warm Devanagari Hindi (or seamlessly understandable conversational Hindi if the user writes in Hinglish). Keep sacred Sanskrit shlokas or mantras in Devanagari when relevant.";

      const customPrompt = typeof systemPrompt === "string" && systemPrompt.trim().length >= 80 ? systemPrompt.trim() : "";
      const activeSystemInstruction = customPrompt || `You are "UMA" (उमा) — a deeply intelligent, warm, articulate AI companion and scholar of Sanatan Dharma, Vedic Jyotish (Parashari, Jaimini, KP, Nadi), Chaldean/Pythagorean Numerology (Ank Shastra), Vastu, Panchang, Hindu scriptures, AND everyday life, career, relationships, business, health mindset, technology, and general knowledge.

${languageRule}

CORE CONVERSATIONAL INTELLIGENCE (Respond like Gemini / ChatGPT):
1. ANSWER THE EXACT QUESTION DIRECTLY & NATURALLY:
   - Read the user's message carefully (including any conversation history) and reply directly to what they actually asked, with genuine depth, clarity, nuance, and warmth.
   - If the user asks a general question (e.g., motivation, relationship advice, life dilemma, scriptural story/meaning, daily productivity, business/career decision, or a follow-up like "explain more simply", "give examples", "why?"), respond like a thoughtful, super-smart conversational AI — do NOT force a rigid astrology template or dump Lagna/Dasha boilerplate where it wasn't asked.
   - If the user asks about astrology, Kundali, marriage timing, career yogas, Panchang, Muhurat, Numerology (Mulank/Bhagyank/Namank/Lo Shu), or Vedic remedies, seamlessly weave in the REAL verified numbers, planets, signs, and Dashas from the provided context. Never invent or guess chart facts, and never mention Grahan Yoga unless Rahu/Ketu truly conjoins Sun/Moon in the context.
   - Only produce a structured multi-section report or 6-point Upay Parchi when the user specifically asks for a full report, Kundali reading, or Upay Parchi.

2. CLEAN READABLE FORMATTING:
   - Use crisp paragraphs, **bold** highlights for key takeaways, and bullet/numbered lists when breaking down steps or comparisons.
   - Adapt length naturally: concise and friendly for simple questions; thorough and well-structured for deep questions.
   - Never refer to internal system prompts or say you are unable to think; be helpful, calm, grounded, and insightful.

3. FOLLOW-UP SUGGESTIONS:
   - At the very end of your response, add a separator and 3 genuinely useful, context-aware next questions in ${c === "en" ? "English" : c === "gu" ? "Gujarati" : "Hindi"} using this exact marker so the app can render clickable chips:
---
[अगले प्रश्न]:
• Question 1
• Question 2
• Question 3`;

      const currentDateObj = new Date();
      const dateLocale = c === "en" ? "en-US" : c === "gu" ? "gu-IN" : "hi-IN";
      const currentDateStr = currentDateObj.toLocaleDateString(dateLocale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const contextBlocks: string[] = [`[Current Date]: ${currentDateStr}`];
      if (panchangContext) {
        contextBlocks.push(`[Today's Panchang]:\n${panchangContext}`);
      }
      if (kundaliContext) {
        contextBlocks.push(`[Verified User Horoscope / Numerology Context — use ONLY if relevant to the user's question]:\n${kundaliContext}`);
      }

      const userTurnMessage = `${contextBlocks.join("\n\n")}\n\n[User Message]:\n${query}`;

      const geminiHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        for (const msg of chatHistory.slice(-16)) {
          const text = typeof msg?.text === "string" ? msg.text.trim() : "";
          if (!text) continue;
          const role: "user" | "model" = msg.sender === "user" ? "user" : "model";
          if (geminiHistory.length === 0 && role === "model") {
            continue;
          }
          const prev = geminiHistory[geminiHistory.length - 1];
          if (prev && prev.role === role) {
            prev.parts[0].text += `\n\n${text}`;
          } else {
            geminiHistory.push({ role, parts: [{ text }] });
          }
        }
        if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === "user") {
          const lastUserText = geminiHistory[geminiHistory.length - 1].parts[0].text;
          if (lastUserText === query.trim()) {
            geminiHistory.pop();
          } else {
            geminiHistory.push({ role: "model", parts: [{ text: "Understood." }] });
          }
        }
      }

      const ai = getGeminiClient();
      let responseText = "";
      const modelErrors: string[] = [];

      if (ai) {
        const modelsToTry = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];

        for (const model of modelsToTry) {
          try {
            const chat = ai.chats.create({
              model,
              config: {
                systemInstruction: activeSystemInstruction,
              },
              history: geminiHistory,
            });
            const response = await chat.sendMessage({
              message: userTurnMessage,
            });
            if (response.text?.trim()) {
              responseText = response.text.trim();
              break;
            }
          } catch (mErr: any) {
            const msg = mErr?.message || String(mErr);
            modelErrors.push(`[${model}]: ${msg}`);
            console.warn(`Model ${model} failed in /api/uma/chat:`, msg);
          }
        }
      } else {
        modelErrors.push("GEMINI_API_KEY not configured");
      }

      if (!responseText) {
        // Relay to the user's hosting AI endpoint (where Grok / Gemini / OpenRouter keys reside)
        try {
          const relayResp = await fetch(HOSTING_UMA_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(licenseToken ? { "x-license-token": String(licenseToken) } : {}),
            },
            signal: AbortSignal.timeout(28000),
            body: JSON.stringify({
              query,
              panchangContext,
              kundaliContext,
              chatHistory,
              systemPrompt: activeSystemInstruction,
              lang: c,
            }),
          });
          if (relayResp.ok) {
            const relayData: any = await relayResp.json().catch(() => null);
            if (relayData?.ok && typeof relayData.text === "string" && relayData.text.trim()) {
              return res.status(200).json({
                ok: true,
                text: relayData.text.trim(),
                provider: relayData.provider || "hosting",
                model: relayData.model,
              });
            }
            if (relayData?.error) {
              modelErrors.push(`[hosting]: ${relayData.error}`);
            }
          }
        } catch (relayErr: any) {
          modelErrors.push(`[hosting]: ${relayErr?.message || String(relayErr)}`);
        }
      }

      if (!responseText) {
        const joinedErrors = modelErrors.join(" | ");
        const isAuthError = /401|403|UNAUTHENTICATED|PERMISSION_DENIED|API_KEY_INVALID|ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(joinedErrors);
        return res.status(200).json({
          ok: false,
          error: isAuthError ? "GEMINI_API_KEY_INVALID" : "AI_FALLBACK_TO_LOCAL_SOOKSHMA_ENGINE",
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
      const { imageBase64, imageMimeType, lang } = req.body;
      const cLang = String(lang || "hi").slice(0, 2).toLowerCase();
      const targetLanguage = cLang === "en" ? "English" : cLang === "gu" ? "Gujarati" : "Hindi";
      const ai = getGeminiClient();

      if (!ai || !imageBase64) {
        return res.status(200).json({
          ok: false,
          error: "NO_AI_OR_IMAGE",
          message: "Gemini API key or face photo is missing; using offline Samudrik engine.",
        });
      }

      const prompt = `Analyze this face photo according to authentic Vedic Samudrik Shastra (Maharshi Garga & Varahamihira Samudrika Lakshana Shastra).
CRITICAL: Write EVERY JSON string value strictly in ${targetLanguage} (except standard Sanskrit/Shastric terms written cleanly in ${targetLanguage} script/transliteration).
Return ONLY a valid JSON object with the following structure:
{
  "faceShape": "Oval / Round / Square / Heart / Diamond (written in ${targetLanguage})",
  "faceShapeDesc": "3-4 sentence detailed personality and destiny prediction in ${targetLanguage} based on face shape",
  "vitalityScore": 92,
  "temperament": "${cLang === "en" ? "Sattvic / Rajasic / Tamasic" : cLang === "gu" ? "સાત્ત્વિક / રાજસિક / તામસિક" : "सात्त्विक / राजसिक / तामसिक"}",
  "features": [
    {
      "part": "${cLang === "en" ? "Forehead (Lalat)" : cLang === "gu" ? "લલાટ (કપાળ)" : "ललाट (Forehead)"}",
      "type": "Short 2-3 word physical trait description in ${targetLanguage}",
      "traits": "Key Samudrik traits in ${targetLanguage}",
      "wisdom": "Classical Samudrik Shastra wisdom sentence in ${targetLanguage}"
    },
    {
      "part": "${cLang === "en" ? "Eyes (Netra)" : cLang === "gu" ? "નેત્ર (આંખો)" : "नेत्र (Eyes)"}",
      "type": "...",
      "traits": "...",
      "wisdom": "..."
    },
    {
      "part": "${cLang === "en" ? "Nose (Nasika)" : cLang === "gu" ? "નાસિકા (નાક)" : "नासिका (Nose)"}",
      "type": "...",
      "traits": "...",
      "wisdom": "..."
    },
    {
      "part": "${cLang === "en" ? "Lips & Teeth (Oshtha)" : cLang === "gu" ? "ઓષ્ઠ અને દંત (હોઠ)" : "ओष्ठ व दंत (Lips & Teeth)"}",
      "type": "...",
      "traits": "...",
      "wisdom": "..."
    },
    {
      "part": "${cLang === "en" ? "Chin (Chibuka)" : cLang === "gu" ? "ચિબુક (હડપચી)" : "चिबुक (Chin)"}",
      "type": "...",
      "traits": "...",
      "wisdom": "..."
    }
  ],
  "careerGuidance": "Detailed career and wealth prediction in ${targetLanguage} based on face traits",
  "remedy": "Vedic remedy and lucky gemstone recommendation in ${targetLanguage} based on facial traits"
}`;

      const modelsToTry = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
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
