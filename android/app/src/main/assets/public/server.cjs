"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const portArgIdx = process.argv.indexOf("--port");
  const cliPort = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? Number(process.argv[portArgIdx + 1]) : null;
  const PORT = cliPort && !isNaN(cliPort) ? cliPort : Number(process.env.DEFAULT_APP_PORT || process.env.APP_PORT) || 3e3;
  const hostArgIdx = process.argv.indexOf("--host");
  const cliHost = hostArgIdx !== -1 && process.argv[hostArgIdx + 1] ? process.argv[hostArgIdx + 1] : null;
  const HOST = process.env.HOST || (cliHost ? cliHost : "0.0.0.0");
  app.use(import_express.default.json({ limit: "20mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "20mb" }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-license-token");
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });
  let aiClient = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return null;
      aiClient = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    return aiClient;
  }
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/time", (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const serverTimeMs = Date.now();
    res.json({
      ok: true,
      serverTimeMs,
      iso: new Date(serverTimeMs).toISOString()
    });
  });
  app.post("/api/parchi/download", (req, res) => {
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
    } catch (err) {
      console.error("Error in /api/parchi/download:", err);
      return res.status(500).send("Download error");
    }
  });
  app.post("/api/uma/chat", async (req, res) => {
    try {
      const { query, panchangContext, kundaliContext, chatHistory, systemPrompt } = req.body;
      const licenseToken = req.headers["x-license-token"] || req.body.licenseToken;
      if (licenseToken === "expired") {
        return res.status(403).json({
          ok: false,
          error: "TRIAL_EXPIRED",
          message: "\u096D-\u0926\u093F\u0935\u0938\u0940\u092F \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u092A\u0942\u0930\u094D\u0923 \u0939\u094B \u091A\u0941\u0915\u093E \u0939\u0948\u0964 \u0909\u092E\u093E AI \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0915\u0947 \u0932\u093F\u090F \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0938\u0926\u0938\u094D\u092F\u0924\u093E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964"
        });
      }
      if (!query || typeof query !== "string") {
        return res.status(400).json({ ok: false, error: "Query is required" });
      }
      const ai = getGeminiClient();
      const defaultSystemInstruction = `ROLE & PERSONA:
You are "UMA" (\u0909\u092E\u093E) \u2014 an experienced, deeply empathetic, living Vedic Astrologer and wise friend speaking naturally in Hindi.

CRITICAL CONVERSATION RULES:
1. REPLY LIKE A NORMAL HUMAN CHAT (\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u092C\u093E\u0924\u091A\u0940\u0924 \u0915\u0940 \u0924\u0930\u0939 \u0909\u0924\u094D\u0924\u0930 \u0926\u0947\u0902):
   - Read what the user ACTUALLY asked and answer that specific question directly, warmly, and naturally in 2 to 3 conversational paragraphs!
   - Do NOT dump a rigid 5-heading report ("\u0967. \u092A\u093F\u091B\u0932\u0947 \u0968-\u0969 \u0935\u0930\u094D\u0937\u094B\u0902 \u0915\u093E \u092F\u0925\u093E\u0930\u094D\u0925...", "\u0968. \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u094D\u0925\u093F\u0924\u093F...", etc.) unless the user explicitly asks for a full Kundali report or past-present-future analysis.
   - If the user asks a specific or practical question (e.g., "Maine ye app banai hai successful hogi ya nahi", "\u092E\u0947\u0930\u093E \u0915\u093E\u092E \u091A\u0932\u0947\u0917\u093E \u092F\u093E \u0928\u0939\u0940\u0902", "\u0915\u0948\u0938\u0947 \u0939\u094B", "\u0936\u093E\u0926\u0940 \u0915\u092C \u0939\u094B\u0917\u0940"), talk directly about their question using their actual Lagna, Moon Rashi, and active Dasha naturally woven into the conversation.
2. NO RAW MARKDOWN ASTERISKS:
   - Do NOT wrap words in **bold** or *italic* asterisks, because the chat displays plain text. Write clean, readable Devanagari Hindi.
3. USE REAL CHART DATA NATURALLY:
   - Mention the native's real Lagna, Rashi, and active Mahadasha/Antardasha from the provided context naturally (never use placeholders like XYZ).
   - Give clear, encouraging, realistic timeframes and 1\u20132 simple daily remedies relevant to their question.

At the end, include 3 natural follow-up questions in this exact format:
---
[\u0905\u0917\u0932\u0947 \u092A\u094D\u0930\u0936\u094D\u0928]:
\u2022 \u092A\u094D\u0930\u0936\u094D\u0928 \u0967
\u2022 \u092A\u094D\u0930\u0936\u094D\u0928 \u0968
\u2022 \u092A\u094D\u0930\u0936\u094D\u0928 \u0969`;
      const activeSystemInstruction = defaultSystemInstruction;
      const currentDateObj = /* @__PURE__ */ new Date();
      const hindiMonthNames = [
        "\u091C\u0928\u0935\u0930\u0940",
        "\u092B\u093C\u0930\u0935\u0930\u0940",
        "\u092E\u093E\u0930\u094D\u091A",
        "\u0905\u092A\u094D\u0930\u0948\u0932",
        "\u092E\u0908",
        "\u091C\u0942\u0928",
        "\u091C\u0941\u0932\u093E\u0908",
        "\u0905\u0917\u0938\u094D\u0924",
        "\u0938\u093F\u0924\u0902\u092C\u0930",
        "\u0905\u0915\u094D\u091F\u0942\u092C\u0930",
        "\u0928\u0935\u0902\u092C\u0930",
        "\u0926\u093F\u0938\u0902\u092C\u0930"
      ];
      const currentYear = currentDateObj.getFullYear();
      const currentMonthName = hindiMonthNames[currentDateObj.getMonth()];
      const promptParts = [
        `\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0915\u093E \u092A\u094D\u0930\u0936\u094D\u0928 (User Query): "${query}"`,
        `[\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u0902\u0926\u0930\u094D\u092D \u0938\u092E\u092F (Real-time Reference Date)]: ${currentDateObj.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} (\u0935\u0930\u094D\u0937: ${currentYear}, \u092E\u093E\u0938: ${currentMonthName})`
      ];
      if (panchangContext) {
        promptParts.push(`
[\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092A\u0902\u091A\u093E\u0902\u0917 \u0938\u0902\u0926\u0930\u094D\u092D]:
${panchangContext}`);
      }
      if (kundaliContext) {
        promptParts.push(`
[\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0915\u0940 \u091C\u0928\u094D\u092E \u0915\u0941\u0902\u0921\u0932\u0940 \u0935 \u0926\u0936\u093E \u0938\u0902\u0926\u0930\u094D\u092D]:
${kundaliContext}`);
      }
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const historyText = chatHistory.slice(-6).map((m) => `${m.sender === "user" ? "\u092F\u091C\u092E\u093E\u0928" : "\u0909\u092E\u093E"}: ${m.text}`).join("\n");
        promptParts.push(`
[\u092A\u0942\u0930\u094D\u0935 \u0938\u0902\u0935\u093E\u0926 (Recent Chat Context)]:
${historyText}`);
      }
      promptParts.push(`
\u092F\u091C\u092E\u093E\u0928 \u0915\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 ("${query}") \u0915\u093E \u0938\u0940\u0927\u093E, \u0906\u0924\u094D\u092E\u0940\u092F \u0914\u0930 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u092C\u093E\u0924\u091A\u0940\u0924 (Normal Chat) \u091C\u0948\u0938\u093E \u0909\u0924\u094D\u0924\u0930 \u0926\u0947\u0902\u0964 \u092C\u093F\u0928\u093E \u092A\u0942\u091B\u0947 \u0932\u0902\u092C\u0940 \u096B-\u0938\u0942\u0924\u094D\u0930\u0940\u092F \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u092F\u093E \u092A\u093F\u091B\u0932\u0947 \u0968-\u0969 \u0938\u093E\u0932 \u0915\u093E \u0930\u091F\u093E-\u0930\u091F\u093E\u092F\u093E \u091F\u0947\u092E\u094D\u092A\u0932\u0947\u091F \u0928 \u0932\u093F\u0916\u0947\u0902, \u0914\u0930 \u0915\u093F\u0938\u0940 \u092D\u0940 \u0936\u092C\u094D\u0926 \u0915\u0947 \u0906\u0917\u0947-\u092A\u0940\u091B\u0947 ** (\u0938\u094D\u091F\u093E\u0930) \u0928 \u0932\u0917\u093E\u090F\u0902\u0964`);
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
                temperature: 0.6
              }
            });
            if (response.text?.trim()) {
              responseText = response.text.trim().replace(/\*\*/g, "");
              break;
            }
          } catch (mErr) {
            console.warn(`Model ${model} failed, trying next...`, mErr?.message || mErr);
          }
        }
      }
      if (!responseText) {
        return res.status(200).json({
          ok: false,
          error: "AI_FALLBACK_TO_LOCAL_SOOKSHMA_ENGINE"
        });
      }
      return res.status(200).json({
        ok: true,
        text: responseText,
        provider: "gemini"
      });
    } catch (err) {
      console.error("Error in /api/uma/chat:", err);
      return res.status(200).json({
        ok: false,
        error: "AI_FALLBACK_TO_LOCAL_SOOKSHMA_ENGINE"
      });
    }
  });
  app.post("/api/face-reading/analyze", async (req, res) => {
    try {
      const { imageBase64, imageMimeType } = req.body;
      const ai = getGeminiClient();
      if (!ai || !imageBase64) {
        return res.status(200).json({
          ok: false,
          error: "NO_AI_OR_IMAGE",
          message: "Gemini API key or face photo is missing; using offline Samudrik engine."
        });
      }
      const prompt = `Analyze this face photo according to authentic Vedic Samudrik Shastra (\u092E\u0939\u0930\u094D\u0937\u093F \u0917\u0930\u094D\u0917 \u0935 \u0935\u0930\u093E\u0939\u092E\u093F\u0939\u093F\u0930 \u0915\u0943\u0924 \u0938\u093E\u092E\u0941\u0926\u094D\u0930\u093F\u0915 \u0932\u0915\u094D\u0937\u0923 \u0936\u093E\u0938\u094D\u0924\u094D\u0930).
Return ONLY a valid JSON object with the following structure:
{
  "faceShape": "Oval / Round / Square / Heart / Diamond (in Hindi)",
  "faceShapeDesc": "3-4 sentence detailed Hindi personality and destiny prediction based on face shape",
  "vitalityScore": 92,
  "temperament": "\u0938\u093E\u0924\u094D\u0924\u094D\u0935\u093F\u0915 / \u0930\u093E\u091C\u0938\u093F\u0915 / \u0924\u093E\u092E\u0938\u093F\u0915",
  "features": [
    {
      "part": "\u0932\u0932\u093E\u091F (Forehead)",
      "type": "\u0909\u0928\u094D\u0928\u0924 \u0935 \u091A\u094C\u0921\u093C\u093E",
      "traits": "\u0924\u0940\u0915\u094D\u0937\u094D\u0923 \u092C\u0941\u0926\u094D\u0927\u093F\u092E\u0924\u094D\u0924\u093E, \u0928\u0947\u0924\u0943\u0924\u094D\u0935 \u0915\u094D\u0937\u092E\u0924\u093E \u0935 \u092D\u093E\u0917\u094D\u092F\u094B\u0926\u092F \u0915\u0947 \u0932\u0915\u094D\u0937\u0923",
      "wisdom": "\u0909\u0928\u094D\u0928\u0924 \u0932\u0932\u093E\u091F \u0938\u094C\u092E\u094D\u092F\u0924\u093E \u0935 \u092A\u094D\u0930\u0936\u093E\u0938\u0928\u093F\u0915 \u0938\u092B\u0932\u0924\u093E \u0915\u093E \u0938\u0942\u091A\u0915 \u0939\u0948\u0964"
    },
    {
      "part": "\u0928\u0947\u0924\u094D\u0930 (Eyes)",
      "type": "\u0924\u0947\u091C\u0938\u094D\u0935\u0940 \u0935 \u0938\u094C\u092E\u094D\u092F",
      "traits": "\u0917\u0939\u0930\u0940 \u0905\u0902\u0924\u0930\u094D\u0926\u0943\u0937\u094D\u091F\u093F, \u0938\u0924\u094D\u092F\u0928\u093F\u0937\u094D\u0920\u093E \u0935 \u090F\u0915\u093E\u0917\u094D\u0930\u0924\u093E",
      "wisdom": "\u0935\u093F\u0936\u093E\u0932 \u0935 \u0938\u094D\u0928\u093F\u0917\u094D\u0927 \u0928\u0947\u0924\u094D\u0930 \u0910\u0936\u094D\u0935\u0930\u094D\u092F \u0924\u0925\u093E \u0906\u0924\u094D\u092E\u0940\u092F\u0924\u093E \u0915\u093E \u0938\u0902\u0915\u0947\u0924 \u0926\u0947\u0924\u0947 \u0939\u0948\u0902\u0964"
    },
    {
      "part": "\u0928\u093E\u0938\u093F\u0915\u093E (Nose)",
      "type": "\u0938\u0930\u0932 \u0935 \u0909\u0928\u094D\u0928\u0924",
      "traits": "\u0938\u094D\u0935\u093E\u092D\u093F\u092E\u093E\u0928, \u0906\u0930\u094D\u0925\u093F\u0915 \u0938\u092E\u0943\u0926\u094D\u0927\u093F \u0935 \u0926\u0943\u0922 \u0938\u0902\u0915\u0932\u094D\u092A",
      "wisdom": "\u0938\u0940\u0927\u0940 \u0928\u093E\u0938\u093F\u0915\u093E \u0927\u0928-\u0927\u093E\u0928\u094D\u092F \u0924\u0925\u093E \u0938\u0941\u0926\u0943\u0922\u093C \u091A\u0930\u093F\u0924\u094D\u0930 \u0915\u093E \u092A\u094D\u0930\u0924\u0940\u0915 \u0939\u0948\u0964"
    },
    {
      "part": "\u0913\u0937\u094D\u0920 \u0935 \u0926\u0902\u0924 (Lips & Teeth)",
      "type": "\u0938\u0941\u0917\u0920\u093F\u0924 \u0935 \u0938\u092E\u094D\u092E\u094B\u0939\u0915",
      "traits": "\u092E\u0927\u0941\u0930 \u0935\u093E\u0923\u0940, \u0938\u092E\u094D\u092E\u094B\u0939\u0928 \u0915\u094D\u0937\u092E\u0924\u093E \u0935 \u0915\u0932\u093E\u092A\u094D\u0930\u093F\u092F\u0924\u093E",
      "wisdom": "\u0930\u0915\u094D\u0924\u0935\u0930\u094D\u0923 \u0913\u0937\u094D\u0920 \u0938\u092E\u094D\u092D\u093E\u0937\u0923 \u0915\u0932\u093E \u0935 \u0938\u094C\u092D\u093E\u0917\u094D\u092F\u0936\u093E\u0932\u0940 \u091C\u0940\u0935\u0928 \u0915\u0947 \u0932\u0915\u094D\u0937\u0923 \u0939\u0948\u0902\u0964"
    },
    {
      "part": "\u091A\u093F\u092C\u0941\u0915 (Chin)",
      "type": "\u0926\u0943\u0922\u093C \u0935 \u0938\u0941\u0921\u094C\u0932",
      "traits": "\u0926\u0943\u0922\u093C \u0907\u091A\u094D\u091B\u093E\u0936\u0915\u094D\u0924\u093F, \u0905\u0928\u0941\u0936\u093E\u0938\u0928 \u0935 \u0926\u0940\u0930\u094D\u0918\u093E\u092F\u0941",
      "wisdom": "\u0938\u0941\u0921\u094C\u0932 \u091A\u093F\u092C\u0941\u0915 \u0928\u093F\u0930\u094D\u0923\u092F \u0915\u094D\u0937\u092E\u0924\u093E \u0935 \u0938\u094D\u0925\u093E\u092F\u093F\u0924\u094D\u0935 \u0926\u0930\u094D\u0936\u093E\u0924\u0940 \u0939\u0948\u0964"
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
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
                }
              },
              prompt
            ],
            config: {
              responseMimeType: "application/json"
            }
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
        }
      }
      return res.status(200).json({ ok: false, error: "ANALYSIS_FAILED" });
    } catch (err) {
      console.error("Face Analysis API error:", err);
      return res.status(200).json({ ok: false, error: err?.message || "SERVER_ERROR" });
    }
  });
  const ttsAudioCache = /* @__PURE__ */ new Map();
  app.post("/api/tts/uma", async (req, res) => {
    try {
      const {
        text,
        voice = "hi-IN-Chirp3-HD-Kore",
        tone = "calm",
        rate = 0.97,
        stylePrompt
      } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ ok: false, error: "TEXT_REQUIRED" });
      }
      const cleanText = text.trim().replace(/।\s*।+/g, "\u0964").replace(/\s+/g, " ").slice(0, 2500);
      const chirpVoiceMap = {
        calm: { name: "hi-IN-Chirp3-HD-Kore", defaultRate: 0.97 },
        enthusiastic: { name: "hi-IN-Chirp3-HD-Aoede", defaultRate: 1 },
        formal: { name: "hi-IN-Chirp3-HD-Leda", defaultRate: 0.96 }
      };
      const tonePreset = chirpVoiceMap[tone] || chirpVoiceMap.calm;
      const targetChirpVoice = typeof voice === "string" && voice.includes("Chirp3-HD") ? voice : tonePreset.name;
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
          tone
        });
      }
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
                ssmlGender: "FEMALE"
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: effectiveRate
              }
            }),
            signal: AbortSignal.timeout(1e4)
          });
          if (chirpResp.ok) {
            const data = await chirpResp.json();
            if (data?.audioContent) {
              const payload = {
                audioBase64: data.audioContent,
                mimeType: "audio/mp3"
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
                tone
              });
            }
          }
          const neural2Resp = await fetch(gttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { text: cleanText },
              voice: {
                languageCode: "hi-IN",
                name: "hi-IN-Neural2-A",
                ssmlGender: "FEMALE"
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: effectiveRate,
                pitch: 0
              }
            }),
            signal: AbortSignal.timeout(8e3)
          });
          if (neural2Resp.ok) {
            const data = await neural2Resp.json();
            if (data?.audioContent) {
              const payload = {
                audioBase64: data.audioContent,
                mimeType: "audio/mp3"
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
                tone
              });
            }
          }
        } catch (gErr) {
          console.warn("Google Cloud TTS error, checking Gemini TTS next:", gErr?.message || gErr);
        }
      }
      const ai = getGeminiClient();
      if (ai) {
        try {
          const toneStylePrompt = stylePrompt || (tone === "enthusiastic" ? "Natural, warm, cheerful Indian woman speaking conversational Hindi with authentic Indian accent and friendly warmth" : tone === "formal" ? "Natural, composed, articulate Indian woman speaking clear Hindi and Sanskrit with graceful human intonation" : "Warm, gentle, natural Indian woman speaking conversational Hindi like a caring family astrologer with smooth, human cadence");
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: toneStylePrompt
                    }
                  }
                ]
              }
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" }
                }
              }
            }
          });
          const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const payload = {
              audioBase64: inlineData.data,
              mimeType: inlineData.mimeType || "audio/wav"
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
              tone
            });
          }
        } catch (geminiErr) {
          console.warn("Gemini Flash Lite TTS fallback triggered:", geminiErr?.message || geminiErr);
        }
      }
      try {
        const streamChunks = [];
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
        const mp3Buffers = [];
        for (const chunk of streamChunks.slice(0, 15)) {
          const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&ttsspeed=0.98&q=${encodeURIComponent(chunk)}`;
          const ttsResp = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            },
            signal: AbortSignal.timeout(8e3)
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
            mimeType: "audio/mpeg"
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
            tone
          });
        }
      } catch (streamErr) {
        console.warn("Secondary TTS stream in /api/tts/uma failed:", streamErr?.message || streamErr);
      }
      return res.status(200).json({
        ok: false,
        fallback: "client",
        message: "Using high-fidelity client-side Hindi neural female voice engine."
      });
    } catch (err) {
      console.error("Error in /api/tts/uma:", err?.message || err);
      return res.status(200).json({
        ok: false,
        fallback: "client",
        error: err?.message || "TTS_SERVER_ERROR"
      });
    }
  });
  app.post("/api/tts/sanskrit", async (req, res) => {
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
          cached: true
        });
      }
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
                ssmlGender: "FEMALE"
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 0.94
              }
            }),
            signal: AbortSignal.timeout(9e3)
          });
          if (gttsResp.ok) {
            const data = await gttsResp.json();
            if (data?.audioContent) {
              const payload = {
                audioBase64: data.audioContent,
                mimeType: "audio/mp3"
              };
              if (ttsAudioCache.size > 200) {
                const firstKey = ttsAudioCache.keys().next().value;
                if (firstKey) ttsAudioCache.delete(firstKey);
              }
              ttsAudioCache.set(cacheKey, payload);
              return res.status(200).json({
                ok: true,
                ...payload,
                provider: "google-chirp3-hd-female"
              });
            }
          }
        } catch (gErr) {
          console.warn("Google Chirp3 Sanskrit TTS error, trying Gemini TTS:", gErr?.message || gErr);
        }
      }
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
                    text: `\u0936\u0941\u0926\u094D\u0927 \u0935\u0948\u0926\u093F\u0915 \u0938\u0902\u0938\u094D\u0915\u0943\u0924 \u090F\u0935\u0902 \u0926\u0947\u0935\u0935\u093E\u0923\u0940 \u0909\u091A\u094D\u091A\u093E\u0930\u0923 \u092E\u0947\u0902 \u092E\u0927\u0941\u0930 \u092E\u0939\u093F\u0932\u093E \u0938\u094D\u0935\u0930, \u0938\u094D\u092A\u0937\u094D\u091F \u0905\u0915\u094D\u0937\u0930 \u0914\u0930 \u092D\u0915\u094D\u0924\u093F\u092E\u092F \u0932\u092F \u0915\u0947 \u0938\u093E\u0925 \u092A\u093E\u0920 \u0915\u0930\u0947\u0902: ${cleanText}`,
                    speechMetadata: {
                      style: "Melodious, serene Indian female Vedic scholar (Vidushi) reciting sacred Sanskrit shlokas and stotrams with 100% pure Devanagari pronunciation (shuddha uccharana), complete vowel articulation without Hindi schwa deletion, clear visarga and anusvara resonance, and devotional temple cadence"
                    }
                  }
                ]
              }
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" }
                }
              }
            }
          });
          const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const payload = {
              audioBase64: inlineData.data,
              mimeType: inlineData.mimeType || "audio/wav"
            };
            if (ttsAudioCache.size > 200) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, payload);
            return res.status(200).json({
              ok: true,
              ...payload,
              provider: "gemini-tts-female"
            });
          }
        } catch (geminiTtsErr) {
          console.warn("Gemini TTS fallback triggered:", geminiTtsErr?.message || geminiTtsErr);
        }
      }
      const chunks = [];
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
      const mp3Buffers = [];
      for (const chunk of chunks.slice(0, 12)) {
        const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&ttsspeed=0.86&q=${encodeURIComponent(chunk)}`;
        const ttsResp = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          },
          signal: AbortSignal.timeout(8e3)
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
          mimeType: "audio/mpeg"
        };
        if (ttsAudioCache.size > 200) {
          const firstKey = ttsAudioCache.keys().next().value;
          if (firstKey) ttsAudioCache.delete(firstKey);
        }
        ttsAudioCache.set(cacheKey, payload);
        return res.status(200).json({
          ok: true,
          ...payload,
          provider: "neural-stream-female"
        });
      }
      return res.status(200).json({ ok: false, error: "TTS_UNAVAILABLE" });
    } catch (err) {
      console.warn("Error in /api/tts/sanskrit:", err?.message || err);
      return res.status(200).json({ ok: false, error: "TTS_ERROR" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : void 0
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        const templatePath = import_path.default.resolve(process.cwd(), "index.html");
        let template = import_fs.default.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.use((_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, HOST, () => {
    console.log(`Shakti Panchang server running on http://${HOST}:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
