import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Check,
  Copy,
  Image as ImageIcon,
  Sparkles,
  Smartphone,
  Layers,
  FileText,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { ShaktiLogo } from "./ShaktiLogo";

interface PlayStoreAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "icon" | "feature" | "screenshots" | "description";

export const PlayStoreAssetsModal: React.FC<PlayStoreAssetsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("icon");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const iconCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const featureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screen1CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screen2CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screen3CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screen4CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screen5CanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Render 512x512 App Icon on Canvas
  const renderAppIcon = (canvas: HTMLCanvasElement) => {
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient (Deep sacred burgundy maroon to rich dark brown)
    const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
    bgGrad.addColorStop(0, "#4a1210");
    bgGrad.addColorStop(0.5, "#2a0a09");
    bgGrad.addColorStop(1, "#140404");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Outer Gold Filigree Border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, 480, 480);

    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 452, 452);

    // Corner decorative accents
    const corners = [
      [36, 36],
      [476, 36],
      [36, 476],
      [476, 476],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD88A";
      ctx.fill();
    });

    // Sun Rays (16 rays)
    ctx.save();
    ctx.translate(256, 256);
    for (let i = 0; i < 16; i++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.beginPath();
      ctx.moveTo(0, -110);
      ctx.lineTo(14, -185);
      ctx.lineTo(0, -195);
      ctx.lineTo(-14, -185);
      ctx.closePath();
      const rayGrad = ctx.createLinearGradient(0, -110, 0, -195);
      rayGrad.addColorStop(0, "rgba(255, 216, 138, 0.9)");
      rayGrad.addColorStop(1, "rgba(181, 106, 0, 0.2)");
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }
    ctx.restore();

    // Central Radiant Sun Disc
    const sunGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 125);
    sunGrad.addColorStop(0, "#FFF9E6");
    sunGrad.addColorStop(0.3, "#FFD88A");
    sunGrad.addColorStop(0.7, "#D4AF37");
    sunGrad.addColorStop(1, "#8C6239");

    ctx.beginPath();
    ctx.arc(256, 256, 115, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.shadowColor = "rgba(255, 200, 50, 0.6)";
    ctx.shadowBlur = 35;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer Disc Rings
    ctx.strokeStyle = "#FFD88A";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 124, 0, Math.PI * 2);
    ctx.stroke();

    // Golden Trishul & Sacred Om
    ctx.fillStyle = "#3B0D0B";
    ctx.font = "bold 96px 'Yatra One', 'Samarkan', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ॐ", 256, 245);

    // Sacred Devanagari text on bottom badge
    ctx.font = "bold 38px 'Rozha One', 'Yatra One', serif";
    ctx.fillStyle = "#FFD88A";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 8;
    ctx.fillText("शक्ति पंचांग", 256, 420);
    ctx.shadowBlur = 0;

    ctx.font = "600 18px sans-serif";
    ctx.fillStyle = "#EBD8BD";
    ctx.fillText("सूर्य सिद्धान्त • कुंडली • मुहूर्त", 256, 452);
  };

  // 2. Render 1024x500 Feature Graphic
  const renderFeatureGraphic = (canvas: HTMLCanvasElement) => {
    canvas.width = 1024;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Deep Maroon Velvet Gradient
    const bg = ctx.createLinearGradient(0, 0, 1024, 500);
    bg.addColorStop(0, "#1F0505");
    bg.addColorStop(0.4, "#3D0E0C");
    bg.addColorStop(0.8, "#260808");
    bg.addColorStop(1, "#120303");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 500);

    // Gold borders
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 992, 468);
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, 972, 448);

    // Right-side Zodiac Wheel / Mandala
    const cx = 780;
    const cy = 250;
    ctx.save();
    ctx.translate(cx, cy);

    // Glow
    const wheelGlow = ctx.createRadialGradient(0, 0, 30, 0, 0, 220);
    wheelGlow.addColorStop(0, "rgba(255, 216, 138, 0.25)");
    wheelGlow.addColorStop(0.7, "rgba(181, 106, 0, 0.1)");
    wheelGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = wheelGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 220, 0, Math.PI * 2);
    ctx.fill();

    // 12 spokes for 12 Rashis
    for (let i = 0; i < 12; i++) {
      ctx.rotate((Math.PI * 2) / 12);
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(0, 180);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 180, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD88A";
      ctx.fill();
    }
    ctx.restore();

    // Sun at center of wheel
    const sunG = ctx.createRadialGradient(cx, cy, 10, cx, cy, 70);
    sunG.addColorStop(0, "#FFFDF0");
    sunG.addColorStop(0.5, "#FFD88A");
    sunG.addColorStop(1, "#8C6239");
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fillStyle = sunG;
    ctx.shadowColor = "rgba(255, 216, 138, 0.8)";
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#3B0D0B";
    ctx.font = "bold 60px 'Yatra One', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ॐ", cx, cy - 3);

    // Left-side Branding & Copy
    ctx.textAlign = "left";

    // Top Tag
    ctx.fillStyle = "#E69A33";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("✦ श्री गणेशाय नमः • सनातन वैदिक ज्योतिष ✦", 65, 115);

    // Main App Title
    ctx.fillStyle = "#FFF7E6";
    ctx.font = "bold 58px 'Rozha One', 'Yatra One', serif";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 10;
    ctx.fillText("शक्ति पंचांग", 65, 185);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = "#FFD88A";
    ctx.font = "bold 24px 'Yatra One', serif";
    ctx.fillText("दैनिक वैदिक पंचांग, जन्म कुंडली एवं 36 गुण मिलान", 65, 230);

    // Feature Badges
    const features = [
      "✓ सूर्य सिद्धान्त एवं लाहिरी अयनांश गणना",
      "✓ संपूर्ण 12 भाव जन्म कुंडली व महादशा",
      "✓ अष्टकूट विवाह मिलान व मांगलिक विचार",
      "✓ शुभ चौघड़िया, राहुकाल एवं दिशाशूल",
      "✓ 150+ वैश्विक नगर एवं पवित्र तीर्थ स्थल",
    ];

    ctx.font = "500 16px sans-serif";
    ctx.fillStyle = "#EBD8BD";
    features.forEach((feat, idx) => {
      ctx.fillText(feat, 68, 280 + idx * 32);
    });

    // Bottom Authority Badge
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("100% शुद्ध गणना • विज्ञापन-मुक्त • सम्पूर्ण प्रामाणिक", 68, 445);
  };

  // Helper for drawing common screenshot frame (1080x1920)
  const setupPhoneCanvas = (
    canvas: HTMLCanvasElement,
    screenTitle: string,
    subBadge: string
  ) => {
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background Parchment Style
    const bg = ctx.createLinearGradient(0, 0, 0, 1920);
    bg.addColorStop(0, "#260908");
    bg.addColorStop(0.12, "#3E1210");
    bg.addColorStop(0.2, "#FAF2E4");
    bg.addColorStop(1, "#F3E6CE");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // Top Marketing Banner (Header for Play Store screenshot)
    ctx.fillStyle = "#FFD88A";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(subBadge, 540, 100);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 64px 'Rozha One', 'Yatra One', serif";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 12;
    ctx.fillText(screenTitle, 540, 185);
    ctx.shadowBlur = 0;

    // App Navigation Bar on screen
    ctx.fillStyle = "#5C3A21";
    ctx.fillRect(60, 250, 960, 110);

    ctx.fillStyle = "#FAF2E4";
    ctx.font = "bold 38px 'Rozha One', serif";
    ctx.textAlign = "left";
    ctx.fillText("शक्ति पंचांग", 110, 320);

    ctx.fillStyle = "#FFD88A";
    ctx.font = "500 24px sans-serif";
    ctx.fillText("उज्जैन (मध्य प्रदेश) • विक्रम संवत् 2083", 560, 320);

    return ctx;
  };

  // 3. Screenshot 1: Daily Panchang
  const renderScreenshotPanchang = (canvas: HTMLCanvasElement) => {
    const ctx = setupPhoneCanvas(
      canvas,
      "दैनिक वैदिक पंचांग एवं चौघड़िया",
      "✦ शुद्ध सूर्य-सिद्धान्त गणना ✦"
    );
    if (!ctx) return;

    // Main Card: Date & Tithi
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 390, 960, 420, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Card Header
    ctx.fillStyle = "#FAF2E4";
    ctx.roundRect?.(60, 390, 960, 90, [24, 24, 0, 0]);
    ctx.fill();

    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 36px 'Rozha One', serif";
    ctx.fillText("आज का दैनिक पंचांग", 100, 450);

    ctx.fillStyle = "#B56A00";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("शुक्ल पक्ष • दशमी तिथि", 660, 450);

    // 4 Key Pillars Grid
    const pillars = [
      ["तिथि", "शुक्ल दशमी (अहोरात्र)", "शुभ फलदायी"],
      ["नक्षत्र", "रोहिणी (चन्द्रमा स्वगृही)", "अत्यंत शुभ"],
      ["योग", "हर्षण (सूर्योदय से)", "कार्य सिद्धि"],
      ["करण", "गर / वणिज", "व्यापारिक शुभ"],
    ];

    pillars.forEach(([title, val, note], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 90 + col * 460;
      const y = 520 + row * 130;

      ctx.fillStyle = "#F8F1E3";
      ctx.roundRect?.(x, y, 430, 110, 16);
      ctx.fill();

      ctx.fillStyle = "#8C6239";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(title, x + 25, y + 40);

      ctx.fillStyle = "#3E2714";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(val, x + 25, y + 80);
    });

    // Sun / Moon Timings Card
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 840, 960, 280, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#B56A00";
    ctx.font = "bold 30px 'Rozha One', serif";
    ctx.fillText("सूर्योदय, सूर्यास्त व चन्द्र दर्शन", 100, 900);

    const sunMoon = [
      ["सूर्योदय", "06:18 AM", "#C05621"],
      ["सूर्यास्त", "06:42 PM", "#DD6B20"],
      ["चन्द्रोदय", "01:25 PM", "#2B6CB0"],
      ["राहुकाल", "04:30 - 06:00 PM", "#C53030"],
    ];
    sunMoon.forEach(([label, val, color], i) => {
      const x = 100 + i * 220;
      ctx.fillStyle = "#FAF2E4";
      ctx.roundRect?.(x, 930, 200, 150, 16);
      ctx.fill();

      ctx.fillStyle = "#5C3A21";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(label, x + 30, ySafe(975));

      ctx.fillStyle = color;
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(val, x + 20, ySafe(1030));
    });

    function ySafe(y: number) {
      return y;
    }

    // Shubh Choghadiya Table Card
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 1150, 960, 680, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 32px 'Rozha One', serif";
    ctx.fillText("दिन का शुभ चौघड़िया मुहूर्त", 100, 1220);

    const choghadiyas = [
      ["अमृत", "06:18 - 07:46 AM", "सर्वोत्तम (अत्यंत शुभ)", "#2E7D32"],
      ["शुभ", "07:46 - 09:14 AM", "शुभ (मांगलिक कार्य)", "#2E7D32"],
      ["रोग", "09:14 - 10:42 AM", "अशुभ (त्याज्य)", "#C62828"],
      ["उद्वेग", "10:42 - 12:10 PM", "अशुभ (राहु)", "#C62828"],
      ["चर", "12:10 - 01:38 PM", "सामान्य शुभ (यात्रा)", "#1565C0"],
      ["लाभ", "01:38 - 03:06 PM", "शुभ (व्यापार लाभ)", "#2E7D32"],
    ];

    choghadiyas.forEach(([name, time, effect, color], i) => {
      const y = 1270 + i * 85;
      ctx.fillStyle = i % 2 === 0 ? "#FBF7EF" : "#FFFFFF";
      ctx.fillRect(80, y, 920, 75);

      // Badge
      ctx.fillStyle = color;
      ctx.roundRect?.(100, y + 15, 110, 46, 12);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(name, 125, y + 47);

      ctx.fillStyle = "#3E2714";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(time, 250, y + 47);

      ctx.fillStyle = "#735133";
      ctx.font = "500 22px sans-serif";
      ctx.fillText(effect, 620, y + 47);
    });
  };

  // 4. Screenshot 2: Vedic Kundali & Lagna Chart
  const renderScreenshotKundali = (canvas: HTMLCanvasElement) => {
    const ctx = setupPhoneCanvas(
      canvas,
      "सम्पूर्ण जन्म कुंडली व लग्न चक्र",
      "✦ 12 भाव, नवमांश व महादशा ✦"
    );
    if (!ctx) return;

    // Outer Container
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 390, 960, 1440, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Chart Header
    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 34px 'Rozha One', serif";
    ctx.fillText("लग्न कुंडली (North Indian Diamond Chart)", 100, 460);

    // Draw Classical North Indian Diamond Kundali Chart (Size: 640x640)
    const kx = 220;
    const ky = 520;
    const kw = 640;
    const kh = 640;

    ctx.fillStyle = "#FBF6EC";
    ctx.fillRect(kx, ky, kw, kh);

    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 4;
    ctx.strokeRect(kx, ky, kw, kh);

    // Diagonals
    ctx.beginPath();
    ctx.moveTo(kx, ky);
    ctx.lineTo(kx + kw, ky + kh);
    ctx.moveTo(kx + kw, ky);
    ctx.lineTo(kx, ky + kh);

    // Inner Diamond
    ctx.moveTo(kx + kw / 2, ky);
    ctx.lineTo(kx + kw, ky + kh / 2);
    ctx.lineTo(kx + kw / 2, ky + kh);
    ctx.lineTo(kx, ky + kh / 2);
    ctx.closePath();
    ctx.stroke();

    // Planetary placements in Kundali
    ctx.fillStyle = "#B56A00";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("1 (लग्न) गुरु, चन्द्र", kx + 220, ky + 160);
    ctx.fillText("2 सूर्य, बुध", kx + 120, ky + 100);
    ctx.fillText("4 मंगल", kx + 70, ky + 280);
    ctx.fillText("7 शुक्र", kx + 260, ky + 440);
    ctx.fillText("10 शनि (स्वगृही)", kx + 460, ky + 280);
    ctx.fillText("11 राहु", kx + 480, ky + 120);
    ctx.fillText("5 केतु", kx + 120, ky + 460);

    // Planetary Degrees Table Below
    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 30px 'Rozha One', serif";
    ctx.fillText("ग्रह स्पष्ट स्थिति एवं नक्षत्र चरण", 100, 1240);

    const planets = [
      ["सूर्य", "मेष 14°22'", "अश्विनी (4)", "उच्च राशि", "#2E7D32"],
      ["चन्द्र", "कर्क 22°10'", "आश्लेषा (2)", "स्वगृही", "#2E7D32"],
      ["मंगल", "मकर 28°00'", "धनिष्ठा (2)", "उच्च राशि", "#2E7D32"],
      ["बुध", "मीन 08°45'", "उ.भाद्रपद (2)", "नीच", "#C62828"],
      ["गुरु", "कर्क 05°30'", "पुनर्वसु (4)", "उच्च राशि", "#2E7D32"],
      ["शुक्र", "मीन 27°15'", "रेवती (4)", "उच्च राशि", "#2E7D32"],
      ["शनि", "कुंभ 12°40'", "शतभिषा (2)", "मूलत्रिकोण", "#2E7D32"],
    ];

    planets.forEach(([p, deg, nak, state, col], i) => {
      const y = 1290 + i * 66;
      ctx.fillStyle = i % 2 === 0 ? "#FBF7EF" : "#FFFFFF";
      ctx.fillRect(90, y, 900, 58);

      ctx.fillStyle = "#5C3A21";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(p, 110, y + 38);

      ctx.fillStyle = "#3E2714";
      ctx.font = "500 22px sans-serif";
      ctx.fillText(deg, 260, y + 38);

      ctx.fillStyle = "#735133";
      ctx.fillText(nak, 500, y + 38);

      ctx.fillStyle = col;
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(state, 780, y + 38);
    });

    // Mahadasha Banner
    ctx.fillStyle = "#5C3A21";
    ctx.roundRect?.(90, 1750, 900, 60, 14);
    ctx.fill();

    ctx.fillStyle = "#FFD88A";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("वर्तमान विंशोत्तरी महादशा: गुरु में बुध का अंतर (2025 - 2028)", 130, 1788);
  };

  // 5. Screenshot 3: Kundali Milan (36 Guna Matchmaking)
  const renderScreenshotMilan = (canvas: HTMLCanvasElement) => {
    const ctx = setupPhoneCanvas(
      canvas,
      "विवाह हेतु 36 गुण अष्टकूट मिलान",
      "✦ शुद्ध मेलापक व मांगलिक विचार ✦"
    );
    if (!ctx) return;

    // Profiles Card
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 390, 960, 240, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Boy & Girl Cards
    ctx.fillStyle = "#EFF6FF";
    ctx.roundRect?.(90, 420, 420, 180, 16);
    ctx.fill();
    ctx.fillStyle = "#1E40AF";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("वर (Boy): राहुल शर्मा", 120, 480);
    ctx.fillStyle = "#4B5563";
    ctx.font = "500 22px sans-serif";
    ctx.fillText("रोहिणी नक्षत्र • वृषभ राशि", 120, 525);
    ctx.fillText("मांगलिक: आंशिक (सौम्य)", 120, 565);

    ctx.fillStyle = "#FDF2F8";
    ctx.roundRect?.(570, 420, 420, 180, 16);
    ctx.fill();
    ctx.fillStyle = "#9D174D";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("कन्या (Girl): प्रिया वर्मा", 600, 480);
    ctx.fillStyle = "#4B5563";
    ctx.font = "500 22px sans-serif";
    ctx.fillText("मृगशिरा नक्षत्र • मिथुन राशि", 600, 525);
    ctx.fillText("मांगलिक: नहीं (दोष मुक्त)", 600, 565);

    // Big Score Gauge Card
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 660, 960, 380, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Circular Score 29/36
    const cx = 540;
    const cy = 820;
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.fillStyle = "#F0FDF4";
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#16A34A";
    ctx.stroke();

    ctx.fillStyle = "#15803D";
    ctx.font = "bold 62px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("29", cx, cy + 5);

    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#4B5563";
    ctx.fillText("/ 36 गुण", cx, cy + 45);

    ctx.fillStyle = "#15803D";
    ctx.font = "bold 34px 'Rozha One', serif";
    ctx.fillText("उत्तम व शुभ विवाह मिलान (Excellent Match)", 540, 970);
    ctx.font = "500 22px sans-serif";
    ctx.fillStyle = "#4B5563";
    ctx.fillText("नाड़ी दोष मुक्त • भकूट शुभ • गृह मैत्री उत्तम", 540, 1010);

    // Ashtakoot 8 Kootas Table
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 1070, 960, 760, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 32px 'Rozha One', serif";
    ctx.fillText("अष्टकूट गुण तालिका (Ashtakoot Details)", 100, 1140);

    const koots = [
      ["वर्ण (Varna)", "1 / 1", "कार्य व स्वभाव अनुकूल", "#15803D"],
      ["वश्य (Vashya)", "2 / 2", "पारस्परिक आकर्षण व नियंत्रण", "#15803D"],
      ["तारा (Tara)", "3 / 3", "दीर्घायु व भाग्य वृद्धि", "#15803D"],
      ["योनि (Yoni)", "3 / 4", "शारीरिक व मानसिक सामंजस्य", "#15803D"],
      ["ग्रहमैत्री (Graha Maitri)", "5 / 5", "पारस्परिक मित्रता व स्नेह", "#15803D"],
      ["गण (Gana)", "5 / 6", "देव व मनुष्य गण उत्तम", "#15803D"],
      ["भकूट (Bhakoot)", "7 / 7", "वंश वृद्धि व सुख समृद्धि", "#15803D"],
      ["नाड़ी (Nadi)", "8 / 8", "आरोग्य व संतान सुख (सर्वोत्तम)", "#15803D"],
    ];

    koots.forEach(([koot, pts, desc, color], i) => {
      const y = 1180 + i * 78;
      ctx.fillStyle = i % 2 === 0 ? "#FBF7EF" : "#FFFFFF";
      ctx.fillRect(80, y, 920, 68);

      ctx.fillStyle = "#3E2714";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(koot, 110, y + 42);

      ctx.fillStyle = color;
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(pts, 460, y + 42);

      ctx.fillStyle = "#735133";
      ctx.font = "500 22px sans-serif";
      ctx.fillText(desc, 610, y + 42);
    });
  };

  // 6. Screenshot 4: Disha Shool & Yatra Vichar
  const renderScreenshotDisha = (canvas: HTMLCanvasElement) => {
    const ctx = setupPhoneCanvas(
      canvas,
      "यात्रा विचार, दिशाशूल व परिहार",
      "✦ शुभ मुहूर्त व विघ्न निवारण ✦"
    );
    if (!ctx) return;

    // Main Alert
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 390, 960, 420, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#FEF2F2";
    ctx.roundRect?.(90, 420, 900, 160, 18);
    ctx.fill();
    ctx.strokeStyle = "#DC2626";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#B91C1C";
    ctx.font = "bold 34px 'Rozha One', serif";
    ctx.fillText("आज का दिशाशूल: पश्चिम दिशा (West)", 130, 485);

    ctx.font = "500 24px sans-serif";
    ctx.fillStyle = "#7F1D1D";
    ctx.fillText("रविवार को पश्चिम दिशा में यात्रा टालनी चाहिए।", 130, 535);

    // Remedial Section (परिहार)
    ctx.fillStyle = "#F0FDF4";
    ctx.roundRect?.(90, 610, 900, 160, 18);
    ctx.fill();
    ctx.strokeStyle = "#16A34A";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#15803D";
    ctx.font = "bold 32px 'Rozha One', serif";
    ctx.fillText("अनिवार्य यात्रा हेतु सरल परिहार (Remedy)", 130, 670);

    ctx.font = "500 23px sans-serif";
    ctx.fillStyle = "#166534";
    ctx.fillText("दलिया या घी खाकर, पूर्व दिशा में 5 पग चलकर यात्रा प्रारंभ करें।", 130, 720);

    // Day-wise Disha Shool Guide
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 840, 960, 990, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 34px 'Rozha One', serif";
    ctx.fillText("सप्ताह के सातों दिनों का दिशाशूल चक्र", 100, 915);

    const weekShool = [
      ["रविवार", "पश्चिम", "दलिया या घी खाकर प्रस्थान करें"],
      ["सोमवार", "पूर्व", "दर्पण (शीशा) देखकर निकलें"],
      ["मंगलवार", "उत्तर", "गुड़ खाकर यात्रा करें"],
      ["बुधवार", "उत्तर", "तिल या धनिया खाकर प्रस्थान करें"],
      ["गुरुवार", "दक्षिण", "दही या जीरा खाकर यात्रा करें"],
      ["शुक्रवार", "पश्चिम", "जौ या राई खाकर निकलें"],
      ["शनिवार", "पूर्व", "अदरक या उड़द खाकर प्रस्थान करें"],
    ];

    weekShool.forEach(([day, dir, parihar], i) => {
      const y = 960 + i * 115;
      ctx.fillStyle = i % 2 === 0 ? "#FBF7EF" : "#FFFFFF";
      ctx.fillRect(80, y, 920, 100);

      ctx.fillStyle = "#5C3A21";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(day, 110, y + 60);

      ctx.fillStyle = "#DC2626";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(`${dir} दिशा`, 280, y + 60);

      ctx.fillStyle = "#15803D";
      ctx.font = "500 23px sans-serif";
      ctx.fillText(`उपाय: ${parihar}`, 460, y + 60);
    });
  };

  // 7. Screenshot 5: Global Cities & Pilgrimages
  const renderScreenshotGlobal = (canvas: HTMLCanvasElement) => {
    const ctx = setupPhoneCanvas(
      canvas,
      "विश्व नगर एवं पावन तीर्थ स्थल",
      "✦ 150+ वैश्विक नगर व सटीक समय-क्षेत्र ✦"
    );
    if (!ctx) return;

    // Intro Card
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 390, 960, 220, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 32px 'Rozha One', serif";
    ctx.fillText("विश्व के किसी भी कोने में शुद्ध वैदिक पंचांग", 100, 460);

    ctx.font = "500 23px sans-serif";
    ctx.fillStyle = "#735133";
    ctx.fillText(
      "USA, UK, कनाडा, दुबई, अफ्रीका, नेपाल, मॉरीशस से लेकर काशी, अयोध्या व उज्जैन तक",
      100,
      510
    );
    ctx.fillText("स्थानीय अक्षांश-देशांतर व टाइमज़ोन के अनुसार सटीक सूर्योदय व लग्न गणना।", 100, 555);

    // Global Cities Grid
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect?.(60, 640, 960, 1190, 24);
    ctx.fill();
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#5C3A21";
    ctx.font = "bold 34px 'Rozha One', serif";
    ctx.fillText("प्रमुख वैश्विक महानगर एवं पवित्र तीर्थ", 100, 715);

    const cities = [
      ["उज्जैन / अवंतिका", "भारत", "23.17° N, 75.78° E", "UTC +5:30 (महाकाल नगरी)", "🇮🇳"],
      ["काशी / वाराणसी", "भारत", "25.31° N, 82.97° E", "UTC +5:30 (विश्वनाथ ज्योतिर्लिंग)", "🇮🇳"],
      ["अयोध्या धाम", "भारत", "26.79° N, 82.19° E", "UTC +5:30 (श्री राम जन्मभूमि)", "🇮🇳"],
      ["न्यू यॉर्क (New York)", "USA", "40.71° N, 74.00° W", "UTC -5:00 (EST)", "🇺🇸"],
      ["सैन फ्रांसिस्को (Bay Area)", "USA", "37.77° N, 122.41° W", "UTC -8:00 (PST)", "🇺🇸"],
      ["लंदन (London)", "UK", "51.50° N, 0.12° W", "UTC 0:00 (GMT)", "🇬🇧"],
      ["टोरंटो (Toronto)", "कनाडा", "43.65° N, 79.38° W", "UTC -5:00 (EST)", "🇨🇦"],
      ["दुबई (Dubai)", "UAE", "25.20° N, 55.27° E", "UTC +4:00 (Gulf)", "🇦🇪"],
      ["नैरोबी (Nairobi)", "केन्या", "01.29° S, 36.82° E", "UTC +3:00 (EAT)", "🇰🇪"],
      ["जोहान्सबर्ग (Johannesburg)", "दक्षिण अफ्रीका", "26.20° S, 28.04° E", "UTC +2:00 (SAST)", "🇿🇦"],
    ];

    cities.forEach(([city, country, coords, tz, flag], i) => {
      const y = 755 + i * 102;
      ctx.fillStyle = i % 2 === 0 ? "#FBF7EF" : "#FFFFFF";
      ctx.fillRect(80, y, 920, 88);

      ctx.font = "32px sans-serif";
      ctx.fillText(flag, 100, y + 54);

      ctx.fillStyle = "#3E2714";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(city, 160, y + 42);

      ctx.fillStyle = "#735133";
      ctx.font = "500 20px sans-serif";
      ctx.fillText(`${country} • ${coords}`, 160, y + 72);

      ctx.fillStyle = "#B56A00";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(tz, 580, y + 54);
    });
  };

  // Render on canvas when tab loads
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure refs are attached
    const timer = setTimeout(() => {
      if (iconCanvasRef.current) renderAppIcon(iconCanvasRef.current);
      if (featureCanvasRef.current) renderFeatureGraphic(featureCanvasRef.current);
      if (screen1CanvasRef.current) renderScreenshotPanchang(screen1CanvasRef.current);
      if (screen2CanvasRef.current) renderScreenshotKundali(screen2CanvasRef.current);
      if (screen3CanvasRef.current) renderScreenshotMilan(screen3CanvasRef.current);
      if (screen4CanvasRef.current) renderScreenshotDisha(screen4CanvasRef.current);
      if (screen5CanvasRef.current) renderScreenshotGlobal(screen5CanvasRef.current);
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, activeTab]);

  // Download helper for canvas
  const downloadCanvas = (
    canvas: HTMLCanvasElement | null,
    filename: string,
    id: string
  ) => {
    if (!canvas) return;
    setDownloadingId(id);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  // Download all screenshots
  const downloadAllScreenshots = () => {
    const list = [
      { ref: screen1CanvasRef.current, name: "playstore-screenshot-1-panchang.png", id: "all-1" },
      { ref: screen2CanvasRef.current, name: "playstore-screenshot-2-kundali.png", id: "all-2" },
      { ref: screen3CanvasRef.current, name: "playstore-screenshot-3-milan.png", id: "all-3" },
      { ref: screen4CanvasRef.current, name: "playstore-screenshot-4-dishashool.png", id: "all-4" },
      { ref: screen5CanvasRef.current, name: "playstore-screenshot-5-global.png", id: "all-5" },
    ];

    list.forEach((item, idx) => {
      setTimeout(() => {
        downloadCanvas(item.ref, item.name, item.id);
      }, idx * 400);
    });
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] text-[#3E2714]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#8C6239] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShaktiLogo size={26} className="shrink-0" />
            <div>
              <h2 className="font-bold text-base sm:text-lg font-granth text-[#FAF2E4] flex items-center gap-2">
                गूगल प्ले स्टोर मीडिया किट (Logo & Screenshots)
                <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-sans font-bold">
                  HD Ready
                </span>
              </h2>
              <p className="text-xs text-[#D9C4A9]">
                Play Store पर ऐप पब्लिश करने के लिए 512×512 लोगो, 1024×500 बैनर व 1080×1920 स्क्रीनशॉट
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#D9C4A9] hover:text-[#FAF2E4] rounded-lg cursor-pointer transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#8C6239]/20 bg-[#F4E8D1] px-3 pt-2 gap-1.5 text-xs font-bold overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              ["icon", "ऐप लोगो (512x512)", ImageIcon],
              ["feature", "फीचर ग्राफिक (1024x500)", Layers],
              ["screenshots", "ऐप स्क्रीनशॉट्स (5 HD Screens)", Smartphone],
              ["description", "प्ले स्टोर विवरण (Listing Copy)", FileText],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-2.5 rounded-t-xl transition flex items-center gap-2 shrink-0 min-h-11 cursor-pointer font-bold ${
                activeTab === id
                  ? "bg-[#FAF2E4] text-[#5C3A21] border-t-2 border-[#B56A00] shadow-xs"
                  : "text-[#8C6239] hover:bg-[#FAF2E4]/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#FAF2E4]">
          {/* TAB 1: APP ICON (512x512) */}
          {activeTab === "icon" && (
            <div className="space-y-4">
              <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 text-xs text-[#5C3A21] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#B56A00] shrink-0 mt-0.5" />
                <div>
                  <strong>Google Play Store आवश्यकता:</strong> 512×512 पिक्सल, 32-बिट PNG, अधिकतम 15 MB। नीचे दिया गया आइकन पूरी तरह से Play Store मानकों के अनुकूल तैयार है।
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-[#8C6239]/30 shadow-md">
                  <div className="w-64 h-64 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#D4AF37] bg-[#240706]">
                    <img
                      src="/playstore-icon-512x512.png"
                      alt="Play Store App Icon 512x512"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-[#735133] mt-3 font-semibold">
                    पूर्वावलोकन: 512 × 512 पिक्सल (32-bit HD PNG)
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold font-granth text-[#5C3A21]">
                    शक्ति पंचांग आधिकारिक ऐप आइकन (512×512 px)
                  </h3>
                  <p className="text-xs text-[#735133] leading-relaxed">
                    यह लोगो सुनहरे सूर्य चक्र, पवित्र त्रिशूल, ॐ प्रतीक, 16 दिव्य किरणों तथा राजसी मैरून-गोल्डन बॉर्डर के साथ तैयार किया गया है। यह फोन की होम-स्क्रीन और प्ले स्टोर दोनों पर अत्यधिक आकर्षक दिखता है।
                  </p>

                  <div className="pt-2 space-y-2">
                    <a
                      href="/playstore-icon-512x512.png"
                      download="shakti-panchang-icon-512x512.png"
                      className="w-full py-3 px-4 bg-[#B56A00] hover:bg-[#965500] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Play Store आइकन डाउनलोड करें (512x512 PNG)
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="/playstore-icon-512x512.png"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-white border border-[#8C6239]/40 hover:bg-[#F4E8D1] rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#B56A00]" />
                        नया टैब में देखें
                      </a>
                      <a
                        href="/logo.svg"
                        download="shakti-logo.svg"
                        className="py-2 px-3 bg-white border border-[#8C6239]/40 hover:bg-[#F4E8D1] rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-[#B56A00]" />
                        वेक्टर SVG डाउनलोड
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURE GRAPHIC (1024x500) */}
          {activeTab === "feature" && (
            <div className="space-y-4">
              <div className="bg-[#F4E8D1] border-2 border-[#B56A00]/50 rounded-xl p-3.5 text-xs text-[#5C3A21] flex items-start gap-2.5 shadow-xs">
                <Info className="w-4 h-4 text-[#B56A00] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-[#8C2D19] text-sm">
                    ✓ Google Play Feature Graphic तैयार है (1024 px by 500 px)
                  </div>
                  <div>
                    <strong>Play Store नियम:</strong> आपकी Featured Graphic एक PNG या JPEG होनी चाहिए, 15 MB तक की, और <strong>1,024 px by 500 px</strong> आकार की। यह ग्राफिक तब उपयोग होता है जब आपकी ऐप को फीचर किया जाता है।
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border-2 border-[#8C6239]/40 shadow-lg space-y-4">
                {/* Feature Graphic Live Image Preview */}
                <div className="w-full aspect-[1024/500] rounded-xl overflow-hidden shadow-2xl border-2 border-[#8C6239]/50 bg-[#1F0505] relative group">
                  <img
                    src="/feature-graphic-1024x500.png"
                    alt="Play Store Feature Graphic (1024x500)"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-[#FFD88A] px-2.5 py-1 rounded-md text-[11px] font-bold border border-[#FFD88A]/30">
                    1024 × 500 px • PNG
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-[#735133]">
                    <strong>विशेषताएं:</strong> 1024 × 500 px • नो अल्फा • 12-राशि चक्र, ॐ प्रतीक, सूर्य सिद्धान्त व मुख्य फीचर्स
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href="/feature-graphic-1024x500.png"
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 bg-[#F4E8D1] hover:bg-[#EBD8BD] text-[#5C3A21] border border-[#8C6239]/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#B56A00]" />
                      फुल साइज़ देखें
                    </a>
                    <a
                      href="/feature-graphic-1024x500.png"
                      download="feature-graphic-1024x500.png"
                      className="flex-1 sm:flex-none py-2.5 px-6 bg-gradient-to-r from-[#B56A00] to-[#8C6239] hover:from-[#A25E00] hover:to-[#7A542F] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Feature Graphic डाउनलोड करें (1024x500 PNG)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCREENSHOTS (1080x1920) */}
          {activeTab === "screenshots" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 text-xs text-[#5C3A21]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#B56A00] shrink-0" />
                  <span>
                    <strong>5 उच्च-गुणवत्ता स्क्रीनशॉट्स (1080×1920 px):</strong> प्ले स्टोर पर कम से कम 4 स्क्रीनशॉट अनिवार्य हैं।
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadAllScreenshots}
                    className="py-1.5 px-3.5 bg-[#5C3A21] hover:bg-[#442814] text-[#FAF2E4] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FFD88A]" />
                    सभी 5 स्क्रीनशॉट डाउनलोड करें
                  </button>
                </div>
              </div>

              {/* 5 Screenshots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Screenshot 1 */}
                <div className="bg-white p-3 rounded-2xl border border-[#8C6239]/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-[#8C6239]/30 shadow-inner bg-[#FAF2E4]">
                      <img
                        src="/screenshot-1-panchang.png"
                        alt="Screenshot 1 Panchang"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-[#5C3A21] mt-2.5">
                      1. दैनिक पंचांग व चौघड़िया
                    </h4>
                    <p className="text-[11px] text-[#735133]">
                      तिथि, नक्षत्र, योग, करण, सूर्योदय-सूर्यास्त, राहुकाल व अमृत चौघड़िया
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/screenshot-1-panchang.png"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-lg text-[#5C3A21]"
                      title="फुल साइज़ देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/screenshot-1-panchang.png"
                      download="playstore-screenshot-1-panchang.png"
                      className="flex-1 py-2 px-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#B56A00]" />
                      डाउनलोड PNG (1080x1920)
                    </a>
                  </div>
                </div>

                {/* Screenshot 2 */}
                <div className="bg-white p-3 rounded-2xl border border-[#8C6239]/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-[#8C6239]/30 shadow-inner bg-[#FAF2E4]">
                      <img
                        src="/screenshot-2-kundali.png"
                        alt="Screenshot 2 Kundali"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-[#5C3A21] mt-2.5">
                      2. सम्पूर्ण जन्म कुंडली
                    </h4>
                    <p className="text-[11px] text-[#735133]">
                      उत्तर भारतीय लग्न चक्र, 12 भाव, ग्रह स्पष्ट स्थिति व महादशा
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/screenshot-2-kundali.png"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-lg text-[#5C3A21]"
                      title="फुल साइज़ देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/screenshot-2-kundali.png"
                      download="playstore-screenshot-2-kundali.png"
                      className="flex-1 py-2 px-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#B56A00]" />
                      डाउनलोड PNG (1080x1920)
                    </a>
                  </div>
                </div>

                {/* Screenshot 3 */}
                <div className="bg-white p-3 rounded-2xl border border-[#8C6239]/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-[#8C6239]/30 shadow-inner bg-[#FAF2E4]">
                      <img
                        src="/screenshot-3-milan.png"
                        alt="Screenshot 3 Milan"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-[#5C3A21] mt-2.5">
                      3. वर-वधू 36 गुण मिलान
                    </h4>
                    <p className="text-[11px] text-[#735133]">
                      अष्टकूट 36 गुण तालिका, नाड़ी दोष विचार व मांगलिक विश्लेषण
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/screenshot-3-milan.png"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-lg text-[#5C3A21]"
                      title="फुल साइज़ देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/screenshot-3-milan.png"
                      download="playstore-screenshot-3-milan.png"
                      className="flex-1 py-2 px-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#B56A00]" />
                      डाउनलोड PNG (1080x1920)
                    </a>
                  </div>
                </div>

                {/* Screenshot 4 */}
                <div className="bg-white p-3 rounded-2xl border border-[#8C6239]/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-[#8C6239]/30 shadow-inner bg-[#FAF2E4]">
                      <img
                        src="/screenshot-4-yatra.png"
                        alt="Screenshot 4 Disha Shool"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-[#5C3A21] mt-2.5">
                      4. यात्रा विचार व दिशाशूल
                    </h4>
                    <p className="text-[11px] text-[#735133]">
                      वार अनुसार दिशाशूल, यात्रा परिहार व शुभ समय उपाय
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/screenshot-4-yatra.png"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-lg text-[#5C3A21]"
                      title="फुल साइज़ देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/screenshot-4-yatra.png"
                      download="playstore-screenshot-4-dishashool.png"
                      className="flex-1 py-2 px-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#B56A00]" />
                      डाउनलोड PNG (1080x1920)
                    </a>
                  </div>
                </div>

                {/* Screenshot 5 */}
                <div className="bg-white p-3 rounded-2xl border border-[#8C6239]/30 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-[#8C6239]/30 shadow-inner bg-[#FAF2E4]">
                      <img
                        src="/screenshot-5-global.png"
                        alt="Screenshot 5 Global Cities"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-[#5C3A21] mt-2.5">
                      5. विश्व पंचांग व पावन तीर्थ
                    </h4>
                    <p className="text-[11px] text-[#735133]">
                      150+ वैश्विक नगर (USA, UK, दुबई, अफ्रीका) व चार धाम, ज्योतिर्लिंग
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/screenshot-5-global.png"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-lg text-[#5C3A21]"
                      title="फुल साइज़ देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/screenshot-5-global.png"
                      download="playstore-screenshot-5-global.png"
                      className="flex-1 py-2 px-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#B56A00]" />
                      डाउनलोड PNG (1080x1920)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLAY STORE LISTING COPY */}
          {activeTab === "description" && (
            <div className="space-y-4">
              <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 text-xs text-[#5C3A21]">
                Google Play Console में डालने के लिए तैयार नाम, संक्षिप्त विवरण एवं संपूर्ण विवरण:
              </div>

              {/* App Name */}
              <div className="p-3 bg-white rounded-xl border border-[#8C6239]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5C3A21]">
                    ऐप का नाम (App Title - Max 30 chars)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard("शक्ति पंचांग: वैदिक पंचांग व कुंडली", "title")
                    }
                    className="text-xs text-[#B56A00] font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedField === "title" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" /> कॉपी हो गया!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> कॉपी करें
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-[#FAF2E4] rounded-lg text-sm font-semibold text-[#3E2714]">
                  शक्ति पंचांग: वैदिक पंचांग व कुंडली
                </div>
              </div>

              {/* Short Description */}
              <div className="p-3 bg-white rounded-xl border border-[#8C6239]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5C3A21]">
                    संक्षिप्त विवरण (Short Description - Max 80 chars)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "दैनिक वैदिक पंचांग, शुभ मुहूर्त, संपूर्ण कुंडली एवं 36 गुण विवाह मिलान।",
                        "short"
                      )
                    }
                    className="text-xs text-[#B56A00] font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedField === "short" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" /> कॉपी हो गया!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> कॉपी करें
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-[#FAF2E4] rounded-lg text-sm font-semibold text-[#3E2714]">
                  दैनिक वैदिक पंचांग, शुभ मुहूर्त, संपूर्ण कुंडली एवं 36 गुण विवाह मिलान।
                </div>
              </div>

              {/* Full Description */}
              <div className="p-3 bg-white rounded-xl border border-[#8C6239]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5C3A21]">
                    संपूर्ण विवरण (Full Description - Up to 4000 chars)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `॥ श्री गणेशाय नमः ॥
शक्ति पंचांग (Shakti Vedic Panchang) — सनातन वैदिक ज्योतिष, प्रामाणिक सूर्य-सिद्धान्त एवं लाहिरी अयनांश पर आधारित एक सम्पूर्ण, शुद्ध एवं आधुनिक पंचांग व ज्योतिषीय ऐप है।

प्रमुख विशेषताएँ:

1. दैनिक वैदिक पंचांग (Daily Panchang):
• सटीक तिथि, वार, नक्षत्र, योग एवं करण (अहोरात्र समाप्ति समय सहित)।
• शुद्ध सूर्योदय, सूर्यास्त, चन्द्रोदय व चन्द्रास्त समय।
• विक्रम संवत् 2083, शक संवत्, ऋतु, अयन (उत्तरायण/दक्षिणायन)।
• राहुकाल, यमगण्ड, गुलिक काल व अभिजित मुहूर्त।

2. शुभ-अशुभ चौघड़िया मुहूर्त (Choghadiya Muhurat):
• दिन एवं रात्रि के समस्त चौघड़िया (अमृत, शुभ, लाभ, चर, रोग, उद्वेग, काल)।
• प्रत्येक चौघड़िया की सटीक समय अवधि एवं शुभता सूचक।

3. सम्पूर्ण जन्म कुंडली व फलित ज्योतिष (Vedic Kundali):
• उत्तर भारतीय लग्न कुंडली (Lagna Chart) एवं नवमांश (Navamsha D9) चक्र।
• समस्त 9 ग्रहों की सटीक अंश, कला, राशि व नक्षत्र स्थिति।
• विंशोत्तरी महादशा एवं अंतर्दशा समय-चक्र।
• मांगलिक विचार व साढ़ेसाती का प्रभाव।

4. वर-वधू 36 गुण अष्टकूट मिलान (Kundali Milan):
• विवाह हेतु 36 गुणों का प्रामाणिक अष्टकूट मिलान (वर्ण, वश्य, तारा, योनि, ग्रहमैत्री, गण, भकूट, नाड़ी)।
• नाड़ी दोष एवं मांगलिक दोष का विस्तृत विश्लेषण।

5. यात्रा विचार एवं दिशाशूल (Disha Shool & Remedies):
• वार अनुसार दिशाशूल विचार एवं अनिवार्य यात्रा हेतु पारंपरिक शास्त्रीय परिहार।

6. वैश्विक नगर एवं पवित्र तीर्थ (Global Cities & Pilgrimages):
• भारत के समस्त राज्यों एवं प्रमुख तीर्थों (काशी, उज्जैन, अयोध्या, द्वारका, पुरी) के साथ-साथ विश्व के 150+ नगरों (USA, UK, कनाडा, दुबई, ऑस्ट्रेलिया, केन्या, दक्षिण अफ्रीका) के सटीक समय-क्षेत्र (Timezone) पर आधारित।

100% शुद्ध गणना • विज्ञापन-मुक्त • भारतीय सनातन संस्कृति को समर्पित।`,
                        "full"
                      )
                    }
                    className="text-xs text-[#B56A00] font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedField === "full" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" /> संपूर्ण विवरण कॉपी हो गया!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> संपूर्ण विवरण कॉपी करें
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-[#FAF2E4] rounded-lg text-xs font-mono text-[#3E2714] whitespace-pre-wrap max-h-60 overflow-y-auto border border-[#8C6239]/20">
                  {`॥ श्री गणेशाय नमः ॥
शक्ति पंचांग (Shakti Vedic Panchang) — सनातन वैदिक ज्योतिष, प्रामाणिक सूर्य-सिद्धान्त एवं लाहिरी अयनांश पर आधारित एक सम्पूर्ण, शुद्ध एवं आधुनिक पंचांग व ज्योतिषीय ऐप है।

प्रमुख विशेषताएँ:
1. दैनिक वैदिक पंचांग (तिथि, नक्षत्र, योग, करण)
2. शुभ-अशुभ चौघड़िया मुहूर्त व राहुकाल
3. सम्पूर्ण जन्म कुंडली (12 भाव, नवमांश, महादशा)
4. वर-वधू 36 गुण अष्टकूट विवाह मिलान
5. यात्रा दिशाशूल व निवारण
6. 150+ वैश्विक नगर व पवित्र तीर्थ`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F4E8D1] border-t border-[#8C6239]/30 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-[#735133] font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#B56A00]" />
            सभी एसेट्स Google Play Store Console (512x512, 1024x500, 1080x1920) मानकों के अनुरूप हैं।
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-[#5C3A21] hover:bg-[#442814] text-[#FAF2E4] rounded-lg text-xs font-bold transition cursor-pointer"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
