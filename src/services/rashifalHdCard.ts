import { RashiMetaItem, DailyRashifal } from './dailyRashifal';

/**
 * Generates an SVG string representation of the 12 Vedic Rashi emblems
 * for crisp rendering on high-resolution canvas.
 */
export function getRashiSvgMarkup(
  rashiId: string,
  strokeColor = '#FFE599',
  accentColor = '#FF9E44'
): string {
  const id = (rashiId || 'mesh').toLowerCase();

  let body = '';
  if (id === 'mesh') {
    body = `
      <path d="M32 50V26" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M32 28C32 17 20 12 13 19C7 25 9 36 17 38C22 39 25 35 23 30C22 27 18 27 17 30" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 28C32 17 44 12 51 19C57 25 55 36 47 38C42 39 39 35 41 30C42 27 46 27 47 30" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 44L32 51L38 44" stroke="${accentColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="32" cy="14" r="3" fill="${accentColor}"/>
    `;
  } else if (id === 'vrishabh') {
    body = `
      <path d="M14 15C14 25 22 30 32 30C42 30 50 25 50 15" stroke="${strokeColor}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M19 28L23 45C25 50 28 52 32 52C36 52 39 50 41 45L45 28" stroke="${strokeColor}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="39" r="9.5" stroke="${accentColor}" stroke-width="2.2"/>
      <circle cx="28" cy="37" r="1.6" fill="${strokeColor}"/>
      <circle cx="36" cy="37" r="1.6" fill="${strokeColor}"/>
      <path d="M28 45C30 47 34 47 36 45" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="20" r="2.6" fill="${accentColor}"/>
    `;
  } else if (id === 'mithun') {
    body = `
      <path d="M16 17C24 21 40 21 48 17" stroke="${strokeColor}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M16 47C24 43 40 43 48 47" stroke="${strokeColor}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M25 20V44M39 20V44" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="25" cy="14" r="2.5" fill="${accentColor}"/>
      <circle cx="39" cy="14" r="2.5" fill="${accentColor}"/>
      <path d="M32 25L35 32L32 39L29 32L32 25Z" fill="${accentColor}" fill-opacity="0.85"/>
    `;
  } else if (id === 'kark') {
    body = `
      <ellipse cx="32" cy="35" rx="11" ry="8.5" stroke="${strokeColor}" stroke-width="3"/>
      <path d="M23 29C17 25 16 17 22 14C25 13 27 16 25 19" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
      <path d="M41 29C47 25 48 17 42 14C39 13 37 16 39 19" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
      <path d="M21 34L13 32M21 38L13 40M23 41L16 47" stroke="${accentColor}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M43 34L51 32M43 38L51 40M41 41L48 47" stroke="${accentColor}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="29" cy="33" r="1.6" fill="${strokeColor}"/>
      <circle cx="35" cy="33" r="1.6" fill="${strokeColor}"/>
    `;
  } else if (id === 'simh') {
    body = `
      <path d="M32 11L36 16L42 13L43 19L49 19L47 25L52 29L48 34L51 40L45 42L44 48L38 47L32 52L26 47L20 48L19 42L13 40L16 34L12 29L17 25L15 19L21 19L22 13L28 16L32 11Z" stroke="${accentColor}" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="26" cy="35" r="6.5" stroke="${strokeColor}" stroke-width="3.2"/>
      <path d="M31 31C33 21 43 21 44 31C45 39 39 44 45 47" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round"/>
    `;
  } else if (id === 'kanya') {
    body = `
      <path d="M32 16C27 23 26 32 32 40C38 32 37 23 32 16Z" stroke="${strokeColor}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M32 40C23 38 17 31 18 23C24 25 28 31 32 40Z" stroke="${strokeColor}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M32 40C41 38 47 31 46 23C40 25 36 31 32 40Z" stroke="${strokeColor}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M16 44C23 50 41 50 48 44" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="12" r="2.2" fill="${accentColor}"/>
    `;
  } else if (id === 'tula') {
    body = `
      <path d="M32 13V49M23 49H41" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
      <path d="M14 23H50" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 23L12 35H22L18 23" stroke="${accentColor}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M11 35C11 39 23 39 23 35" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M46 23L42 35H52L48 23" stroke="${accentColor}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M41 35C41 39 53 39 53 35" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="32" cy="19" r="3" fill="${accentColor}"/>
    `;
  } else if (id === 'vrishchik') {
    body = `
      <path d="M15 22V39C15 43 18 45 21 45C24 45 26 43 26 39V22" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M26 25C26 21 29 20 32 22V39C32 43 35 45 38 45C41 45 44 43 44 38V30" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M44 38C44 45 51 44 51 35V18" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 23L51 16L56 23" stroke="${strokeColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (id === 'dhanu') {
    body = `
      <path d="M20 14C39 16 48 25 50 44" stroke="${strokeColor}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M20 14L16 32L50 44" stroke="${accentColor}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M15 49L49 15" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M39 15H49V25" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 44L20 50" stroke="${accentColor}" stroke-width="2.6" stroke-linecap="round"/>
    `;
  } else if (id === 'makar') {
    body = `
      <path d="M15 20L24 44L32 25L39 42C41 47 47 49 50 44C53 39 49 33 44 35C40 37 41 44 47 47" stroke="${strokeColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 20C19 14 26 14 29 19" stroke="${accentColor}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="32" cy="15" r="2.5" fill="${accentColor}"/>
    `;
  } else if (id === 'kumbh') {
    body = `
      <path d="M23 19H41M26 19L24 25H40L38 19" stroke="${strokeColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 25C17 29 17 41 25 45H39C47 41 47 29 40 25" stroke="${strokeColor}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="14" r="3.2" fill="${accentColor}"/>
      <path d="M15 51C20 48 24 54 29 51C34 48 38 54 43 51C46 49 48 50 50 51" stroke="${accentColor}" stroke-width="2.6" stroke-linecap="round"/>
    `;
  } else {
    // meen
    body = `
      <path d="M22 14C13 23 13 41 22 50" stroke="${strokeColor}" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M18 17L25 14L23 21" stroke="${accentColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M42 14C51 23 51 41 42 50" stroke="${strokeColor}" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M46 47L39 50L41 43" stroke="${accentColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 32H50" stroke="${strokeColor}" stroke-width="2.8" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="3.2" fill="${accentColor}"/>
    `;
  }

  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="3 2"/>
    ${body}
  </svg>`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generates a Royal 1080 x 1920 Full HD PNG Data URL of the selected Rashi's Daily Horoscope
 */
export async function generateHdRashifalCardDataUrl(
  rashiMeta: RashiMetaItem,
  rashifal: DailyRashifal,
  locationName = 'उज्जैन'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // 1. Royal Background Gradient (Deep Vedic Saffron & Rich Parchment)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#2D0A0A'); // Deep Royal Crimson
  bgGrad.addColorStop(0.24, '#4A110D'); // Vedic Maroon
  bgGrad.addColorStop(0.42, '#FAF2E4'); // Royal Gold Parchment
  bgGrad.addColorStop(0.85, '#F5E6CC');
  bgGrad.addColorStop(1, '#E6CFAB');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Ornate Golden Borders & Insets
  ctx.strokeStyle = '#D4A048';
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.strokeStyle = '#8B1E1E';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(42, 42, W - 84, H - 84);

  // Corner Accents
  const cornerSize = 44;
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.strokeStyle = '#E6A145';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, cornerSize);
    ctx.stroke();
    ctx.restore();
  };
  drawCorner(42, 42, 0);
  drawCorner(W - 42, 42, 90);
  drawCorner(W - 42, H - 42, 180);
  drawCorner(42, H - 42, 270);

  // 3. Sacred Top Kicker & Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD88A';
  ctx.font = 'bold 30px serif';
  ctx.fillText('॥ ॐ श्री गणेशाय नमः • शक्ति सनातन दैनिक राशिफल ॥', W / 2, 95);

  ctx.fillStyle = '#FFF8EB';
  ctx.font = '900 52px serif';
  ctx.fillText(`${rashiMeta.name} राशि (${rashiMeta.symbol}) दैनिक राशिफल`, W / 2, 160);

  ctx.fillStyle = '#FAD089';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(
    `📅 ${rashifal.dateLabel}  •  ${rashiMeta.element}  •  स्वामी: ${rashiMeta.lord}  •  📍 ${locationName}`,
    W / 2,
    205
  );

  // 4. Hero 3D Rashi Medallion with Custom SVG Emblem
  const medX = W / 2;
  const medY = 330;
  const medR = 86;

  // Medallion Glow
  const glow = ctx.createRadialGradient(medX, medY, medR * 0.4, medX, medY, medR * 1.4);
  glow.addColorStop(0, 'rgba(230, 161, 69, 0.55)');
  glow.addColorStop(1, 'rgba(230, 161, 69, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(medX, medY, medR * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Medallion Disc
  const medGrad = ctx.createLinearGradient(medX - medR, medY - medR, medX + medR, medY + medR);
  medGrad.addColorStop(0, '#7A1616');
  medGrad.addColorStop(0.5, '#A8281C');
  medGrad.addColorStop(1, '#4A0E0E');
  ctx.fillStyle = medGrad;
  ctx.beginPath();
  ctx.arc(medX, medY, medR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFD88A';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Draw SVG emblem into canvas
  try {
    const svgMarkup = getRashiSvgMarkup(rashiMeta.id, '#FFF3C4', '#FFB347');
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = svgUrl;
    });
    ctx.drawImage(img, medX - medR * 0.75, medY - medR * 0.75, medR * 1.5, medR * 1.5);
  } catch {
    // Fallback glyph
    ctx.fillStyle = '#FFE599';
    ctx.font = 'bold 74px serif';
    ctx.fillText(rashiMeta.symbol, medX, medY + 26);
  }

  // 5. Hero Badges Banner (Chandra Bal & Lord status)
  ctx.fillStyle = '#5C3A21';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`🌙 ${rashifal.chandraBal}  •  🪐 ${rashifal.rashiLordStatus}`, W / 2, 455);

  // Quick Lucky Ribbon (Lucky Color, Lucky Number, Ishta)
  ctx.fillStyle = '#8B1E1E';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(
    `🎨 शुभ रंग: ${rashifal.luckyColor}   |   🔢 शुभ अंक: ${rashifal.luckyNumber}   |   🕉️ इष्ट: ${rashiMeta.ishtaDevta}`,
    W / 2,
    495
  );

  // Helper to draw a Bento Box on canvas
  const drawCard = (
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    titleIcon: string,
    content: string,
    titleColor: string,
    borderColor: string,
    boxBg: string
  ) => {
    // Card background
    ctx.save();
    ctx.fillStyle = boxBg;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2.5;

    // Rounded rectangle
    const r = 20;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.textAlign = 'left';
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${titleIcon} ${title}`, x + 24, y + 42);

    // Divider
    ctx.strokeStyle = 'rgba(140, 98, 57, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 56);
    ctx.lineTo(x + w - 20, y + 56);
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#2D1606';
    ctx.font = '500 23px sans-serif';
    const lines = wrapText(ctx, content, w - 48);
    let curY = y + 92;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      ctx.fillText(lines[i], x + 24, curY);
      curY += 34;
    }
    ctx.restore();
  };

  // 6. Section 1: ग्रह गोचर सामान्य फलादेश (Full Width Card)
  drawCard(
    70,
    530,
    W - 140,
    270,
    'ग्रह गोचर सामान्य फलादेश (General Transit)',
    '🌟',
    rashifal.general,
    '#6E1409',
    '#C89D66',
    '#FFFDF9'
  );

  // 7. Section 2 & 3: कार्यक्षेत्र एवं धन (Two-Column Bento Grid)
  const colW = (W - 140 - 24) / 2;
  drawCard(
    70,
    825,
    colW,
    330,
    'कार्यक्षेत्र व आजीविका',
    '💼',
    rashifal.career,
    '#1B4D3E',
    '#81C784',
    '#F7FCF9'
  );
  drawCard(
    70 + colW + 24,
    825,
    colW,
    330,
    'धन, व्यापार व लाभ',
    '💰',
    rashifal.wealth,
    '#7A4E2D',
    '#E2A03F',
    '#FFFDF5'
  );

  // 8. Section 4 & 5: परिवार व स्वास्थ्य (Two-Column Bento Grid)
  drawCard(
    70,
    1180,
    colW,
    300,
    'परिवार, प्रेम व दांपत्य',
    '❤️',
    rashifal.love,
    '#9E1B32',
    '#E57373',
    '#FFF9F9'
  );
  drawCard(
    70 + colW + 24,
    1180,
    colW,
    300,
    'स्वास्थ्य एवं प्राण-ऊर्जा',
    '🌿',
    rashifal.health,
    '#1E3A5F',
    '#64B5F6',
    '#F6FAFF'
  );

  // 9. Section 6: अचूक दैनिक वैदिक उपाय (Special Remedy Card)
  drawCard(
    70,
    1505,
    W - 140,
    260,
    `${rashiMeta.name} राशि — आज का अचूक वैदिक उपाय`,
    '🪔',
    rashifal.remedy,
    '#6E1409',
    '#D4AF37',
    '#FFFDF6'
  );

  // 10. Bottom Blessing & Watermark Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6E4119';
  ctx.font = 'bold 24px serif';
  ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु • शक्ति सनातन वैदिक पंचांग ॥', W / 2, 1815);

  ctx.fillStyle = '#8C6239';
  ctx.font = '500 20px sans-serif';
  ctx.fillText(`चंद्र गोचर: ${rashifal.moonTransit}  •  प्रतिदिन प्रातःकाल नवीन गोचर अपडेट`, W / 2, 1850);

  return canvas.toDataURL('image/png', 0.98);
}
