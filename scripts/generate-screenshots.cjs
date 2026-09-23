const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Base template for 1080x1920 Screenshot SVG
function createScreenshotSvg(title, subtitle, innerContentSvg) {
  return `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgParchment" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#240706" />
      <stop offset="11%" stop-color="#3D1210" />
      <stop offset="18%" stop-color="#FAF2E4" />
      <stop offset="100%" stop-color="#F3E5CE" />
    </linearGradient>

    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D6" />
      <stop offset="30%" stop-color="#FFD88A" />
      <stop offset="70%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#8C6239" />
    </linearGradient>

    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bgParchment)" />

  <!-- Top Marketing Banner -->
  <text x="540" y="95" font-family="sans-serif" font-size="28" font-weight="bold" fill="#FFD88A" text-anchor="middle" letter-spacing="1">
    ${subtitle}
  </text>
  <text x="540" y="175" font-family="'Rozha One', 'Yatra One', 'Noto Serif Devanagari', serif" font-size="58" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ${title}
  </text>

  <!-- In-App Header Bar -->
  <rect x="50" y="240" width="980" height="96" rx="16" fill="#5C3A21" />
  <text x="95" y="300" font-family="'Rozha One', 'Yatra One', serif" font-size="34" font-weight="bold" fill="#FAF2E4">शक्ति पंचांग</text>
  <text x="520" y="300" font-family="sans-serif" font-size="22" font-weight="bold" fill="#FFD88A">उज्जैन (अवंतिका) • विक्रम संवत् 2083</text>

  <!-- Main Content Area -->
  ${innerContentSvg}
</svg>
`;
}

// 1. Screenshot 1: Panchang (Daily Vedic Panchang & Choghadiya)
async function generateScreenshot1() {
  const content = `
    <!-- Card 1: Daily Panchang 4 Pillars -->
    <g transform="translate(50, 360)" filter="url(#shadow)">
      <rect width="980" height="420" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <path d="M0,20 Q0,0 20,0 L960,0 Q980,0 980,20 L980,80 L0,80 Z" fill="#FAF2E4" />
      <text x="40" y="52" font-family="'Rozha One', serif" font-size="32" font-weight="bold" fill="#5C3A21">आज का दैनिक पंचांग</text>
      <text x="640" y="52" font-family="sans-serif" font-size="24" font-weight="bold" fill="#B56A00">शुक्ल पक्ष • दशमी तिथि</text>

      <!-- 4 Badges -->
      <g transform="translate(30, 110)">
        <!-- Tithi -->
        <rect x="0" y="0" width="440" height="125" rx="14" fill="#FBF7EF" stroke="#E6D3B3" stroke-width="1.5" />
        <text x="25" y="40" font-family="sans-serif" font-size="20" font-weight="bold" fill="#8C6239">तिथि</text>
        <text x="25" y="85" font-family="sans-serif" font-size="28" font-weight="bold" fill="#3E2714">शुक्ल दशमी</text>
        <text x="25" y="112" font-family="sans-serif" font-size="17" fill="#735133">अहोरात्र समाप्ति समय सहित</text>

        <!-- Nakshatra -->
        <rect x="480" y="0" width="440" height="125" rx="14" fill="#FBF7EF" stroke="#E6D3B3" stroke-width="1.5" />
        <text x="505" y="40" font-family="sans-serif" font-size="20" font-weight="bold" fill="#8C6239">नक्षत्र</text>
        <text x="505" y="85" font-family="sans-serif" font-size="28" font-weight="bold" fill="#3E2714">रोहिणी (चन्द्र स्वगृही)</text>
        <text x="505" y="112" font-family="sans-serif" font-size="17" fill="#16A34A">शुभ व कार्य सिद्धिदायक</text>

        <!-- Yoga -->
        <rect x="0" y="150" width="440" height="125" rx="14" fill="#FBF7EF" stroke="#E6D3B3" stroke-width="1.5" />
        <text x="25" y="190" font-family="sans-serif" font-size="20" font-weight="bold" fill="#8C6239">योग</text>
        <text x="25" y="235" font-family="sans-serif" font-size="28" font-weight="bold" fill="#3E2714">हर्षण योग</text>
        <text x="25" y="262" font-family="sans-serif" font-size="17" fill="#16A34A">मांगलिक कार्यों हेतु उत्तम</text>

        <!-- Karana -->
        <rect x="480" y="150" width="440" height="125" rx="14" fill="#FBF7EF" stroke="#E6D3B3" stroke-width="1.5" />
        <text x="505" y="190" font-family="sans-serif" font-size="20" font-weight="bold" fill="#8C6239">करण</text>
        <text x="505" y="235" font-family="sans-serif" font-size="28" font-weight="bold" fill="#3E2714">गर / वणिज</text>
        <text x="505" y="262" font-family="sans-serif" font-size="17" fill="#735133">व्यापार व क्रय-विक्रय शुभ</text>
      </g>
    </g>

    <!-- Card 2: Sun & Moon Timings -->
    <g transform="translate(50, 810)" filter="url(#shadow)">
      <rect width="980" height="270" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="28" font-weight="bold" fill="#B56A00">सूर्योदय, सूर्यास्त व राहुकाल</text>

      <g transform="translate(30, 80)">
        <rect x="0" y="0" width="210" height="150" rx="14" fill="#FAF2E4" />
        <text x="25" y="45" font-family="sans-serif" font-size="20" font-weight="bold" fill="#5C3A21">सूर्योदय</text>
        <text x="25" y="100" font-family="sans-serif" font-size="28" font-weight="bold" fill="#C05621">06:18 AM</text>

        <rect x="235" y="0" width="210" height="150" rx="14" fill="#FAF2E4" />
        <text x="260" y="45" font-family="sans-serif" font-size="20" font-weight="bold" fill="#5C3A21">सूर्यास्त</text>
        <text x="260" y="100" font-family="sans-serif" font-size="28" font-weight="bold" fill="#DD6B20">06:42 PM</text>

        <rect x="470" y="0" width="210" height="150" rx="14" fill="#FAF2E4" />
        <text x="495" y="45" font-family="sans-serif" font-size="20" font-weight="bold" fill="#5C3A21">चन्द्रोदय</text>
        <text x="495" y="100" font-family="sans-serif" font-size="28" font-weight="bold" fill="#2B6CB0">01:25 PM</text>

        <rect x="705" y="0" width="210" height="150" rx="14" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5" />
        <text x="730" y="45" font-family="sans-serif" font-size="20" font-weight="bold" fill="#991B1B">राहुकाल</text>
        <text x="715" y="100" font-family="sans-serif" font-size="24" font-weight="bold" fill="#DC2626">04:30 - 06:00</text>
      </g>
    </g>

    <!-- Card 3: Shubh Choghadiya Table -->
    <g transform="translate(50, 1110)" filter="url(#shadow)">
      <rect width="980" height="740" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="30" font-weight="bold" fill="#5C3A21">दिन का शुभ चौघड़िया मुहूर्त</text>

      <g transform="translate(30, 80)" font-family="sans-serif">
        <!-- Amrit -->
        <rect x="0" y="0" width="920" height="85" rx="12" fill="#F0FDF4" />
        <rect x="20" y="18" width="100" height="48" rx="8" fill="#16A34A" />
        <text x="42" y="50" font-size="22" font-weight="bold" fill="#FFFFFF">अमृत</text>
        <text x="150" y="52" font-size="26" font-weight="bold" fill="#3E2714">06:18 AM – 07:46 AM</text>
        <text x="560" y="52" font-size="22" font-weight="600" fill="#15803D">सर्वोत्तम (अत्यंत शुभ मुहूर्त)</text>

        <!-- Shubh -->
        <rect x="0" y="100" width="920" height="85" rx="12" fill="#F0FDF4" />
        <rect x="20" y="118" width="100" height="48" rx="8" fill="#16A34A" />
        <text x="45" y="150" font-size="22" font-weight="bold" fill="#FFFFFF">शुभ</text>
        <text x="150" y="152" font-size="26" font-weight="bold" fill="#3E2714">07:46 AM – 09:14 AM</text>
        <text x="560" y="152" font-size="22" font-weight="600" fill="#15803D">शुभ (मांगलिक व नवीन कार्य)</text>

        <!-- Rog -->
        <rect x="0" y="200" width="920" height="85" rx="12" fill="#FEF2F2" />
        <rect x="20" y="218" width="100" height="48" rx="8" fill="#DC2626" />
        <text x="48" y="250" font-size="22" font-weight="bold" fill="#FFFFFF">रोग</text>
        <text x="150" y="252" font-size="26" font-weight="bold" fill="#3E2714">09:14 AM – 10:42 AM</text>
        <text x="560" y="252" font-size="22" font-weight="600" fill="#B91C1C">अशुभ (त्याज्य समय)</text>

        <!-- Udveg -->
        <rect x="0" y="300" width="920" height="85" rx="12" fill="#FEF2F2" />
        <rect x="20" y="318" width="100" height="48" rx="8" fill="#DC2626" />
        <text x="38" y="350" font-size="22" font-weight="bold" fill="#FFFFFF">उद्वेग</text>
        <text x="150" y="352" font-size="26" font-weight="bold" fill="#3E2714">10:42 AM – 12:10 PM</text>
        <text x="560" y="352" font-size="22" font-weight="600" fill="#B91C1C">अशुभ (राहु का प्रभाव)</text>

        <!-- Char -->
        <rect x="0" y="400" width="920" height="85" rx="12" fill="#EFF6FF" />
        <rect x="20" y="418" width="100" height="48" rx="8" fill="#2563EB" />
        <text x="50" y="450" font-size="22" font-weight="bold" fill="#FFFFFF">चर</text>
        <text x="150" y="452" font-size="26" font-weight="bold" fill="#3E2714">12:10 PM – 01:38 PM</text>
        <text x="560" y="452" font-size="22" font-weight="600" fill="#1D4ED8">सामान्य शुभ (यात्रा व गतिशीलता)</text>

        <!-- Labh -->
        <rect x="0" y="500" width="920" height="85" rx="12" fill="#F0FDF4" />
        <rect x="20" y="518" width="100" height="48" rx="8" fill="#16A34A" />
        <text x="45" y="550" font-size="22" font-weight="bold" fill="#FFFFFF">लाभ</text>
        <text x="150" y="552" font-size="26" font-weight="bold" fill="#3E2714">01:38 PM – 03:06 PM</text>
        <text x="560" y="552" font-size="22" font-weight="600" fill="#15803D">शुभ (व्यापार व धन लाभ)</text>
      </g>
    </g>
  `;

  const svg = createScreenshotSvg(
    'दैनिक वैदिक पंचांग एवं चौघड़िया',
    '✦ शुद्ध सूर्य-सिद्धान्त गणना ✦',
    content
  );

  const out = path.join(publicDir, 'screenshot-1-panchang.png');
  await sharp(Buffer.from(svg)).resize(1080, 1920).png().toFile(out);
  console.log('✓ Created screenshot-1-panchang.png');
}

// 2. Screenshot 2: Kundali & Lagna Chart
async function generateScreenshot2() {
  const content = `
    <!-- Card 1: Lagna Kundali Chart -->
    <g transform="translate(50, 360)" filter="url(#shadow)">
      <rect width="980" height="1470" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="34" font-weight="bold" fill="#5C3A21">लग्न कुंडली (North Indian Diamond Chart)</text>

      <!-- North Indian Diamond Kundali (640x640) -->
      <g transform="translate(170, 90)">
        <rect width="640" height="640" fill="#FDFBF7" stroke="#8C6239" stroke-width="4" />
        <!-- Diagonals -->
        <line x1="0" y1="0" x2="640" y2="640" stroke="#8C6239" stroke-width="3" />
        <line x1="640" y1="0" x2="0" y2="640" stroke="#8C6239" stroke-width="3" />
        <!-- Inner Diamond -->
        <polygon points="320,0 640,320 320,640 0,320" fill="none" stroke="#8C6239" stroke-width="3" />

        <!-- Planets Text in Houses -->
        <g font-family="sans-serif" font-size="26" font-weight="bold" fill="#B56A00">
          <text x="240" y="170">1 (लग्न) गुरु, चन्द्र</text>
          <text x="110" y="90">2 सूर्य, बुध</text>
          <text x="60" y="270">4 मंगल</text>
          <text x="110" y="470">5 केतु</text>
          <text x="280" y="450">7 शुक्र</text>
          <text x="450" y="270">10 शनि</text>
          <text x="460" y="110">11 राहु</text>
        </g>
      </g>

      <!-- Planetary Degrees Table Below -->
      <g transform="translate(40, 780)">
        <text x="0" y="35" font-family="'Rozha One', serif" font-size="30" font-weight="bold" fill="#5C3A21">ग्रह स्पष्ट स्थिति एवं नक्षत्र चरण</text>

        <g transform="translate(0, 60)" font-family="sans-serif" font-size="22">
          ${[
            ['सूर्य', 'मेष 14°22\'', 'अश्विनी (4)', 'उच्च राशि', '#16A34A'],
            ['चन्द्र', 'कर्क 22°10\'', 'आश्लेषा (2)', 'स्वगृही', '#16A34A'],
            ['मंगल', 'मकर 28°00\'', 'धनिष्ठा (2)', 'उच्च राशि', '#16A34A'],
            ['बुध', 'मीन 08°45\'', 'उ.भाद्रपद (2)', 'नीच', '#DC2626'],
            ['गुरु', 'कर्क 05°30\'', 'पुनर्वसु (4)', 'उच्च राशि', '#16A34A'],
            ['शुक्र', 'मीन 27°15\'', 'रेवती (4)', 'उच्च राशि', '#16A34A'],
            ['शनि', 'कुंभ 12°40\'', 'शतभिषा (2)', 'मूलत्रिकोण', '#16A34A'],
          ]
            .map(([p, deg, nak, state, col], i) => `
              <rect x="0" y="${i * 70}" width="900" height="60" rx="8" fill="${i % 2 === 0 ? '#FAF2E4' : '#FFFFFF'}" />
              <text x="30" y="${i * 70 + 40}" font-weight="bold" fill="#5C3A21">${p}</text>
              <text x="180" y="${i * 70 + 40}" fill="#3E2714">${deg}</text>
              <text x="420" y="${i * 70 + 40}" fill="#735133">${nak}</text>
              <text x="700" y="${i * 70 + 40}" font-weight="bold" fill="${col}">${state}</text>
            `)
            .join('\n')}
        </g>

        <!-- Mahadasha Strip -->
        <rect x="0" y="580" width="900" height="65" rx="12" fill="#5C3A21" />
        <text x="40" y="622" font-family="sans-serif" font-size="24" font-weight="bold" fill="#FFD88A">
          वर्तमान विंशोत्तरी महादशा: गुरु में बुध का अंतर (2025 - 2028)
        </text>
      </g>
    </g>
  `;

  const svg = createScreenshotSvg(
    'सम्पूर्ण जन्म कुंडली व लग्न चक्र',
    '✦ 12 भाव, नवमांश व महादशा ✦',
    content
  );

  const out = path.join(publicDir, 'screenshot-2-kundali.png');
  await sharp(Buffer.from(svg)).resize(1080, 1920).png().toFile(out);
  console.log('✓ Created screenshot-2-kundali.png');
}

// 3. Screenshot 3: Kundali Milan (36 Gunas)
async function generateScreenshot3() {
  const content = `
    <!-- Boy & Girl Card -->
    <g transform="translate(50, 360)" filter="url(#shadow)">
      <rect width="980" height="230" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <rect x="30" y="30" width="440" height="170" rx="14" fill="#EFF6FF" />
      <text x="55" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#1E40AF">वर (Boy): राहुल शर्मा</text>
      <text x="55" y="125" font-family="sans-serif" font-size="22" fill="#4B5563">रोहिणी नक्षत्र • वृषभ राशि</text>
      <text x="55" y="165" font-family="sans-serif" font-size="20" font-weight="bold" fill="#16A34A">मांगलिक: आंशिक (सौम्य)</text>

      <rect x="510" y="30" width="440" height="170" rx="14" fill="#FDF2F8" />
      <text x="535" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#9D174D">कन्या (Girl): प्रिया वर्मा</text>
      <text x="535" y="125" font-family="sans-serif" font-size="22" fill="#4B5563">मृगशिरा नक्षत्र • मिथुन राशि</text>
      <text x="535" y="165" font-family="sans-serif" font-size="20" font-weight="bold" fill="#16A34A">मांगलिक: नहीं (दोष मुक्त)</text>
    </g>

    <!-- Score Card 29 / 36 Gunas -->
    <g transform="translate(50, 620)" filter="url(#shadow)">
      <rect width="980" height="380" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <circle cx="490" cy="160" r="95" fill="#F0FDF4" stroke="#16A34A" stroke-width="12" />
      <text x="490" y="165" font-family="sans-serif" font-size="64" font-weight="bold" fill="#15803D" text-anchor="middle">29</text>
      <text x="490" y="210" font-family="sans-serif" font-size="24" font-weight="bold" fill="#4B5563" text-anchor="middle">/ 36 गुण</text>

      <text x="490" y="305" font-family="'Rozha One', serif" font-size="34" font-weight="bold" fill="#15803D" text-anchor="middle">
        उत्तम व शुभ विवाह मिलान (Excellent Match)
      </text>
      <text x="490" y="345" font-family="sans-serif" font-size="22" font-weight="600" fill="#4B5563" text-anchor="middle">
        नाड़ी दोष मुक्त • भकूट शुभ • गृह मैत्री उत्तम
      </text>
    </g>

    <!-- Ashtakoot Table -->
    <g transform="translate(50, 1030)" filter="url(#shadow)">
      <rect width="980" height="800" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="32" font-weight="bold" fill="#5C3A21">अष्टकूट गुण तालिका (Ashtakoot Details)</text>

      <g transform="translate(30, 80)" font-family="sans-serif">
        ${[
          ['वर्ण (Varna)', '1 / 1', 'कार्य व स्वभाव अनुकूल', '#15803D'],
          ['वश्य (Vashya)', '2 / 2', 'पारस्परिक आकर्षण व नियंत्रण', '#15803D'],
          ['तारा (Tara)', '3 / 3', 'दीर्घायु व भाग्य वृद्धि', '#15803D'],
          ['योनि (Yoni)', '3 / 4', 'शारीरिक व मानसिक सामंजस्य', '#15803D'],
          ['ग्रहमैत्री (Graha Maitri)', '5 / 5', 'पारस्परिक मित्रता व स्नेह', '#15803D'],
          ['गण (Gana)', '5 / 6', 'देव व मनुष्य गण उत्तम', '#15803D'],
          ['भकूट (Bhakoot)', '7 / 7', 'वंश वृद्धि व सुख समृद्धि', '#15803D'],
          ['नाड़ी (Nadi)', '8 / 8', 'आरोग्य व संतान सुख (सर्वोत्तम)', '#15803D'],
        ]
          .map(([koot, pts, desc, col], i) => `
            <rect x="0" y="${i * 85}" width="920" height="74" rx="10" fill="${i % 2 === 0 ? '#FAF2E4' : '#FFFFFF'}" />
            <text x="30" y="${i * 85 + 46}" font-size="24" font-weight="bold" fill="#3E2714">${koot}</text>
            <text x="360" y="${i * 85 + 46}" font-size="26" font-weight="bold" fill="${col}">${pts}</text>
            <text x="520" y="${i * 85 + 46}" font-size="22" fill="#735133">${desc}</text>
          `)
          .join('\n')}
      </g>
    </g>
  `;

  const svg = createScreenshotSvg(
    'विवाह हेतु 36 गुण अष्टकूट मिलान',
    '✦ शुद्ध मेलापक व मांगलिक विचार ✦',
    content
  );

  const out = path.join(publicDir, 'screenshot-3-milan.png');
  await sharp(Buffer.from(svg)).resize(1080, 1920).png().toFile(out);
  console.log('✓ Created screenshot-3-milan.png');
}

// 4. Screenshot 4: Disha Shool
async function generateScreenshot4() {
  const content = `
    <!-- Warning Card -->
    <g transform="translate(50, 360)" filter="url(#shadow)">
      <rect width="980" height="420" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <rect x="30" y="30" width="920" height="160" rx="16" fill="#FEF2F2" stroke="#DC2626" stroke-width="2" />
      <text x="70" y="95" font-family="'Rozha One', serif" font-size="34" font-weight="bold" fill="#B91C1C">आज का दिशाशूल: पश्चिम दिशा (West)</text>
      <text x="70" y="145" font-family="sans-serif" font-size="24" fill="#7F1D1D">रविवार को पश्चिम दिशा में यात्रा टालनी चाहिए।</text>

      <rect x="30" y="220" width="920" height="160" rx="16" fill="#F0FDF4" stroke="#16A34A" stroke-width="2" />
      <text x="70" y="285" font-family="'Rozha One', serif" font-size="32" font-weight="bold" fill="#15803D">अनिवार्य यात्रा हेतु सरल परिहार (Remedy)</text>
      <text x="70" y="335" font-family="sans-serif" font-size="23" fill="#166534">दलिया या घी खाकर, पूर्व दिशा में 5 पग चलकर यात्रा प्रारंभ करें।</text>
    </g>

    <!-- Week Cycle Card -->
    <g transform="translate(50, 810)" filter="url(#shadow)">
      <rect width="980" height="1020" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="34" font-weight="bold" fill="#5C3A21">सप्ताह के सातों दिनों का दिशाशूल चक्र</text>

      <g transform="translate(30, 80)" font-family="sans-serif">
        ${[
          ['रविवार', 'पश्चिम दिशा', 'दलिया या घी खाकर प्रस्थान करें'],
          ['सोमवार', 'पूर्व दिशा', 'दर्पण (शीशा) देखकर निकलें'],
          ['मंगलवार', 'उत्तर दिशा', 'गुड़ खाकर यात्रा करें'],
          ['बुधवार', 'उत्तर दिशा', 'तिल या धनिया खाकर प्रस्थान करें'],
          ['गुरुवार', 'दक्षिण दिशा', 'दही या जीरा खाकर यात्रा करें'],
          ['शुक्रवार', 'पश्चिम दिशा', 'जौ या राई खाकर निकलें'],
          ['शनिवार', 'पूर्व दिशा', 'अदरक या उड़द खाकर प्रस्थान करें'],
        ]
          .map(([day, dir, parihar], i) => `
            <rect x="0" y="${i * 125}" width="920" height="105" rx="12" fill="${i % 2 === 0 ? '#FAF2E4' : '#FFFFFF'}" />
            <text x="30" y="${i * 125 + 62}" font-size="28" font-weight="bold" fill="#5C3A21">${day}</text>
            <text x="210" y="${i * 125 + 62}" font-size="28" font-weight="bold" fill="#DC2626">${dir}</text>
            <text x="430" y="${i * 125 + 62}" font-size="23" font-weight="600" fill="#15803D">उपाय: ${parihar}</text>
          `)
          .join('\n')}
      </g>
    </g>
  `;

  const svg = createScreenshotSvg(
    'यात्रा विचार, दिशाशूल व परिहार',
    '✦ शुभ मुहूर्त व विघ्न निवारण ✦',
    content
  );

  const out = path.join(publicDir, 'screenshot-4-yatra.png');
  await sharp(Buffer.from(svg)).resize(1080, 1920).png().toFile(out);
  console.log('✓ Created screenshot-4-yatra.png');
}

// 5. Screenshot 5: Global Cities & Sacred Pilgrimages
async function generateScreenshot5() {
  const content = `
    <!-- Intro Card -->
    <g transform="translate(50, 360)" filter="url(#shadow)">
      <rect width="980" height="230" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="32" font-weight="bold" fill="#5C3A21">विश्व के किसी भी कोने में शुद्ध वैदिक पंचांग</text>
      <text x="40" y="110" font-family="sans-serif" font-size="23" fill="#735133">USA, UK, कनाडा, दुबई, अफ्रीका, नेपाल, मॉरीशस से लेकर काशी, अयोध्या व उज्जैन तक</text>
      <text x="40" y="160" font-family="sans-serif" font-size="23" fill="#735133">स्थानीय अक्षांश-देशांतर व टाइमज़ोन के अनुसार सटीक सूर्योदय व लग्न गणना।</text>
    </g>

    <!-- Global Cities List Card -->
    <g transform="translate(50, 620)" filter="url(#shadow)">
      <rect width="980" height="1210" rx="20" fill="#FFFFFF" stroke="#8C6239" stroke-width="2" />
      <text x="40" y="55" font-family="'Rozha One', serif" font-size="34" font-weight="bold" fill="#5C3A21">प्रमुख वैश्विक महानगर एवं पवित्र तीर्थ</text>

      <g transform="translate(30, 80)" font-family="sans-serif">
        ${[
          ['🇮🇳', 'उज्जैन / अवंतिका', 'भारत', '23.17° N, 75.78° E', 'UTC +5:30 (महाकाल नगरी)'],
          ['🇮🇳', 'काशी / वाराणसी', 'भारत', '25.31° N, 82.97° E', 'UTC +5:30 (विश्वनाथ धाम)'],
          ['🇮🇳', 'अयोध्या धाम', 'भारत', '26.79° N, 82.19° E', 'UTC +5:30 (श्री राम जन्मभूमि)'],
          ['🇺🇸', 'न्यू यॉर्क (New York)', 'USA', '40.71° N, 74.00° W', 'UTC -5:00 (EST)'],
          ['🇺🇸', 'सैन फ्रांसिस्को (Bay Area)', 'USA', '37.77° N, 122.41° W', 'UTC -8:00 (PST)'],
          ['🇬🇧', 'लंदन (London)', 'UK', '51.50° N, 0.12° W', 'UTC 0:00 (GMT)'],
          ['🇨🇦', 'टोरंटो (Toronto)', 'कनाडा', '43.65° N, 79.38° W', 'UTC -5:00 (EST)'],
          ['🇦🇪', 'दुबई (Dubai)', 'UAE', '25.20° N, 55.27° E', 'UTC +4:00 (Gulf)'],
          ['🇰🇪', 'नैरोबी (Nairobi)', 'केन्या', '01.29° S, 36.82° E', 'UTC +3:00 (EAT)'],
          ['🇿🇦', 'जोहान्सबर्ग (Johannesburg)', 'दक्षिण अफ्रीका', '26.20° S, 28.04° E', 'UTC +2:00 (SAST)'],
        ]
          .map(([flag, city, country, coords, tz], i) => `
            <rect x="0" y="${i * 105}" width="920" height="92" rx="12" fill="${i % 2 === 0 ? '#FAF2E4' : '#FFFFFF'}" />
            <text x="25" y="${i * 105 + 56}" font-size="32">${flag}</text>
            <text x="85" y="${i * 105 + 44}" font-size="26" font-weight="bold" fill="#3E2714">${city}</text>
            <text x="85" y="${i * 105 + 74}" font-size="20" fill="#735133">${country} • ${coords}</text>
            <text x="560" y="${i * 105 + 56}" font-size="22" font-weight="bold" fill="#B56A00">${tz}</text>
          `)
          .join('\n')}
      </g>
    </g>
  `;

  const svg = createScreenshotSvg(
    'विश्व नगर एवं पावन तीर्थ स्थल',
    '✦ 150+ वैश्विक नगर व सटीक समय-क्षेत्र ✦',
    content
  );

  const out = path.join(publicDir, 'screenshot-5-global.png');
  await sharp(Buffer.from(svg)).resize(1080, 1920).png().toFile(out);
  console.log('✓ Created screenshot-5-global.png');
}

async function run() {
  await generateScreenshot1();
  await generateScreenshot2();
  await generateScreenshot3();
  await generateScreenshot4();
  await generateScreenshot5();
  console.log('All 5 HD screenshots generated!');
}

run();
