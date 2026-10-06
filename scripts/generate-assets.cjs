const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// 1. GENERATE FEATURE GRAPHIC (1024x500 exact Play Store specification)
async function generateFeatureGraphic() {
  const svg = `
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#240706" />
      <stop offset="35%" stop-color="#420F0D" />
      <stop offset="70%" stop-color="#2B0A08" />
      <stop offset="100%" stop-color="#140303" />
    </linearGradient>

    <!-- Gold Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D6" />
      <stop offset="30%" stop-color="#FFD88A" />
      <stop offset="70%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#8C6239" />
    </linearGradient>

    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFDF0" stop-opacity="1" />
      <stop offset="40%" stop-color="#FFD88A" stop-opacity="0.9" />
      <stop offset="75%" stop-color="#B56A00" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#240706" stop-opacity="0" />
    </radialGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Base Solid Background -->
  <rect width="1024" height="500" fill="url(#bgGrad)" />

  <!-- Background Sacred Geometry Pattern -->
  <g opacity="0.08" stroke="#FFD88A" stroke-width="1.5" fill="none">
    <circle cx="512" cy="250" r="180" />
    <circle cx="512" cy="250" r="280" />
    <circle cx="512" cy="250" r="380" />
    <line x1="0" y1="0" x2="1024" y2="500" />
    <line x1="1024" y1="0" x2="0" y2="500" />
  </g>

  <!-- Outer Double Gold Borders -->
  <rect x="16" y="16" width="992" height="468" rx="8" fill="none" stroke="url(#goldGrad)" stroke-width="6" />
  <rect x="28" y="28" width="968" height="444" rx="4" fill="none" stroke="#8C6239" stroke-width="2" />

  <!-- Corner Accents -->
  <g fill="#FFD88A">
    <circle cx="38" cy="38" r="8" />
    <circle cx="986" cy="38" r="8" />
    <circle cx="38" cy="462" r="8" />
    <circle cx="986" cy="462" r="8" />
  </g>

  <!-- ================= RIGHT SIDE: RADIANT SURYA & RASHICHAKRA MANDALA ================= -->
  <g transform="translate(780, 250)">
    <!-- Radial Outer Aura -->
    <circle cx="0" cy="0" r="220" fill="url(#sunGlow)" />

    <!-- 12 Zodiac Wheel Rings -->
    <circle cx="0" cy="0" r="195" fill="none" stroke="#D4AF37" stroke-width="3" opacity="0.6" />
    <circle cx="0" cy="0" r="175" fill="none" stroke="#FFD88A" stroke-width="1.5" opacity="0.4" stroke-dasharray="6,4" />
    <circle cx="0" cy="0" r="135" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.5" />
    <circle cx="0" cy="0" r="95" fill="none" stroke="#FFD88A" stroke-width="2" opacity="0.7" />

    <!-- 16 Sun Rays -->
    <g stroke="url(#goldGrad)" stroke-width="3" opacity="0.85">
      <line x1="0" y1="-95" x2="0" y2="-175" />
      <line x1="0" y1="95" x2="0" y2="175" />
      <line x1="-95" y1="0" x2="-175" y2="0" />
      <line x1="95" y1="0" x2="175" y2="0" />
      <line x1="-67" y1="-67" x2="-124" y2="-124" />
      <line x1="67" y1="-67" x2="124" y2="-124" />
      <line x1="-67" y1="67" x2="-124" y2="124" />
      <line x1="67" y1="67" x2="124" y2="124" />
      <line x1="-36" y1="-88" x2="-66" y2="-161" />
      <line x1="36" y1="-88" x2="66" y2="-161" />
      <line x1="-88" y1="-36" x2="-161" y2="-66" />
      <line x1="88" y1="-36" x2="161" y2="-66" />
      <line x1="-36" y1="88" x2="-66" y2="161" />
      <line x1="36" y1="88" x2="66" y2="161" />
      <line x1="-88" y1="36" x2="-161" y2="66" />
      <line x1="88" y1="36" x2="161" y2="66" />
    </g>

    <!-- Star dots on outer ring -->
    <g fill="#FFF5D6">
      <circle cx="0" cy="-195" r="4" />
      <circle cx="0" cy="195" r="4" />
      <circle cx="-195" cy="0" r="4" />
      <circle cx="195" cy="0" r="4" />
      <circle cx="-138" cy="-138" r="4" />
      <circle cx="138" cy="-138" r="4" />
      <circle cx="-138" cy="138" r="4" />
      <circle cx="138" cy="138" r="4" />
    </g>

    <!-- Center Sun Disc -->
    <circle cx="0" cy="0" r="72" fill="url(#goldGrad)" filter="url(#shadow)" />
    <circle cx="0" cy="0" r="62" fill="#2E0A08" stroke="#FFF5D6" stroke-width="2" />

    <!-- Sacred Om / Trishul Symbol in Center -->
    <text x="0" y="16" font-family="'Yatra One', 'Rozha One', 'Noto Serif Devanagari', 'Laila', 'Georgia', serif" font-size="54" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle" filter="url(#glow)">ॐ</text>
  </g>

  <!-- ================= LEFT SIDE: BRANDING & FEATURES ================= -->
  <g transform="translate(68, 0)">
    <!-- Top Sacred Invocation Tag -->
    <text x="0" y="88" font-family="sans-serif" font-size="16" font-weight="bold" fill="#E69A33" letter-spacing="1">
      ✦ श्री गणेशाय नमः • सनातन वैदिक ज्योतिष ✦
    </text>

    <!-- Main App Title -->
    <text x="0" y="165" font-family="'Rozha One', 'Yatra One', 'Noto Serif Devanagari', 'Cinzel', serif" font-size="62" font-weight="bold" fill="#FFFFFF" filter="url(#shadow)">
      शक्ति पंचांग
    </text>
    <text x="325" y="145" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFD88A" background="#5C3A21">
      (SHAKTI PANCHANG)
    </text>

    <!-- Subtitle -->
    <text x="0" y="212" font-family="'Yatra One', 'Noto Serif Devanagari', 'Cinzel', serif" font-size="23" font-weight="bold" fill="#FFD88A">
      दैनिक वैदिक पंचांग • जन्म कुंडली • 36 गुण विवाह मिलान
    </text>

    <!-- Gold Divider Bar -->
    <rect x="0" y="232" width="480" height="3" fill="url(#goldGrad)" />

    <!-- 4 Key Highlights with Auspicious Checkmarks -->
    <g transform="translate(0, 268)" font-family="sans-serif" font-size="16" fill="#F4E8D1">
      <!-- Item 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="-18" width="26" height="26" rx="6" fill="#B56A00" />
        <text x="7" y="1" font-size="16" font-weight="bold" fill="#FFFFFF">✓</text>
        <text x="38" y="0" font-weight="600">प्रामाणिक सूर्य-सिद्धान्त व लाहिरी अयनांश गणना</text>
      </g>

      <!-- Item 2 -->
      <g transform="translate(0, 36)">
        <rect x="0" y="-18" width="26" height="26" rx="6" fill="#B56A00" />
        <text x="7" y="1" font-size="16" font-weight="bold" fill="#FFFFFF">✓</text>
        <text x="38" y="0" font-weight="600">उत्तर-भारतीय 12 भाव जन्म कुंडली, नवमांश व महादशा</text>
      </g>

      <!-- Item 3 -->
      <g transform="translate(0, 72)">
        <rect x="0" y="-18" width="26" height="26" rx="6" fill="#B56A00" />
        <text x="7" y="1" font-size="16" font-weight="bold" fill="#FFFFFF">✓</text>
        <text x="38" y="0" font-weight="600">अष्टकूट 36 गुण विवाह मेलापक व मांगलिक दोष विचार</text>
      </g>

      <!-- Item 4 -->
      <g transform="translate(0, 108)">
        <rect x="0" y="-18" width="26" height="26" rx="6" fill="#B56A00" />
        <text x="7" y="1" font-size="16" font-weight="bold" fill="#FFFFFF">✓</text>
        <text x="38" y="0" font-weight="600">शुभ चौघड़िया, राहुकाल, दिशाशूल व यात्रा विचार</text>
      </g>
    </g>

    <!-- Bottom Authority Badge -->
    <g transform="translate(0, 442)">
      <rect x="0" y="-22" width="500" height="34" rx="8" fill="#3D1210" stroke="#8C6239" stroke-width="1.5" />
      <text x="14" y="0" font-family="sans-serif" font-size="13.5" font-weight="bold" fill="#FFD88A">
        ★ 100% शुद्ध गणना • 150+ वैश्विक नगर व तीर्थ • विज्ञापन-मुक्त ★
      </text>
    </g>
  </g>
</svg>
`;

  const outputPath1 = path.join(publicDir, 'feature-graphic.png');
  const outputPath2 = path.join(publicDir, 'feature-graphic-1024x500.png');

  await sharp(Buffer.from(svg))
    .resize(1024, 500)
    .png({ quality: 100, compressionLevel: 8 })
    .toFile(outputPath1);

  await sharp(Buffer.from(svg))
    .resize(1024, 500)
    .png({ quality: 100, compressionLevel: 8 })
    .toFile(outputPath2);

  console.log('✓ Created feature-graphic.png (1024x500):', outputPath1);
  console.log('✓ Created feature-graphic-1024x500.png (1024x500):', outputPath2);
}

// 2. GENERATE 512x512 APP ICON
async function generateAppIcon512() {
  const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="iconBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4A1210" />
      <stop offset="60%" stop-color="#2A0A09" />
      <stop offset="100%" stop-color="#140404" />
    </radialGradient>

    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D6" />
      <stop offset="35%" stop-color="#FFD88A" />
      <stop offset="75%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#8C6239" />
    </linearGradient>

    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFDF2" />
      <stop offset="40%" stop-color="#FFD88A" />
      <stop offset="85%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#8C6239" />
    </radialGradient>

    <filter id="glow512">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="512" height="512" rx="90" fill="url(#iconBg)" />
  <rect x="16" y="16" width="480" height="480" rx="76" fill="none" stroke="url(#gold)" stroke-width="12" />
  <rect x="30" y="30" width="452" height="452" rx="64" fill="none" stroke="#8C6239" stroke-width="3" />

  <!-- 16 Radiating Rays -->
  <g transform="translate(256, 230)">
    ${Array.from({ length: 16 })
      .map((_, i) => {
        const deg = i * (360 / 16);
        return `<path d="M-10,-95 L0,-165 L10,-95 Z" transform="rotate(${deg})" fill="url(#gold)" opacity="0.85" />`;
      })
      .join('\n')}
  </g>

  <!-- Sun Disc -->
  <circle cx="256" cy="230" r="105" fill="url(#sun)" filter="url(#glow512)" />
  <circle cx="256" cy="230" r="114" fill="none" stroke="#FFF5D6" stroke-width="4" />
  <circle cx="256" cy="230" r="88" fill="#380C0A" stroke="#FFD88A" stroke-width="2" />

  <!-- Sacred ॐ Symbol -->
  <text x="256" y="258" font-family="'Yatra One', 'Rozha One', serif" font-size="88" font-weight="bold" fill="url(#gold)" text-anchor="middle">ॐ</text>

  <!-- Bottom App Name Badge -->
  <text x="256" y="415" font-family="'Rozha One', 'Yatra One', serif" font-size="38" font-weight="bold" fill="#FFF5D6" text-anchor="middle">शक्ति पंचांग</text>
  <text x="256" y="450" font-family="sans-serif" font-size="17" font-weight="bold" fill="#FFD88A" text-anchor="middle">वैदिक पंचांग • कुंडली</text>
</svg>
`;

  const outputPath = path.join(publicDir, 'playstore-icon-512x512.png');
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log('✓ Created playstore-icon-512x512.png (512x512):', outputPath);
}

async function run() {
  try {
    await generateFeatureGraphic();
    await generateAppIcon512();
    console.log('All Play Store graphics generated successfully!');
  } catch (err) {
    console.error('Error generating graphics:', err);
  }
}

run();
