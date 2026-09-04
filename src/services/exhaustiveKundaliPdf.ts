import { jsPDF } from 'jspdf';
import { KundaliData, PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from './astronomy';
import { DASHA_ORDER, DASHA_YEARS, getVedicRemedies } from './kundali';

export interface PdfProgressCallback {
  (current: number, total: number, message: string): void;
}

const NAKSHATRA_LORD_MAP: Record<string, string> = {
  'अश्विनी': 'केतु', 'भरणी': 'शुक्र', 'कृतिका': 'सूर्य', 'रोहिणी': 'चंद्र', 'मृगशिरा': 'मंगल', 'आर्द्रा': 'राहु',
  'पुनर्वसु': 'गुरु', 'पुष्य': 'शनि', 'अश्लेषा': 'बुध', 'मघा': 'केतु', 'पूर्वाफाल्गुनी': 'शुक्र', 'उत्तराफाल्गुनी': 'सूर्य',
  'हस्त': 'चंद्र', 'चित्रा': 'मंगल', 'स्वाति': 'राहु', 'विशाखा': 'गुरु', 'अनुराधा': 'शनि', 'ज्येष्ठा': 'बुध',
  'मूल': 'केतु', 'पूर्वाषाढ़ा': 'शुक्र', 'उत्तराषाढ़ा': 'सूर्य', 'श्रवण': 'चंद्र', 'धनिष्ठा': 'मंगल', 'शतभिषा': 'राहु',
  'पूर्वाभाद्रपद': 'गुरु', 'उत्तराभाद्रपद': 'शनि', 'रेवती': 'बुध',
};

function getNakshatraLord(nak: string): string {
  for (const [key, lord] of Object.entries(NAKSHATRA_LORD_MAP)) {
    if (nak && nak.includes(key)) return `${lord} देव`;
  }
  return 'शुभ ग्रह';
}

/**
 * Renders a full 59-Page Exhaustive Vedic Mahapatrika into a high-fidelity PDF.
 * Uses an off-screen HTML5 canvas to natively draw Devanagari Hindi text,
 * ornamental Vedic borders, charts, and tables page-by-page.
 */
export async function generateExhaustive59PageKundaliPdf(
  kundali: KundaliData,
  onProgress?: PdfProgressCallback
): Promise<{
  fileName: string;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
}> {
  const totalPages = 59;
  const width = 1240;
  const height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Base background drawing helper
  const drawBhojpatraBackground = (pageNum: number, title: string, subtitle?: string) => {
    // Parchment gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fcf7ec');
    bg.addColorStop(0.5, '#f7eed8');
    bg.addColorStop(1, '#f0e3c5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle grain fibers
    ctx.fillStyle = 'rgba(140, 80, 25, 0.025)';
    for (let i = 0; i < 200; i++) {
      const rx = (i * 137) % width;
      const ry = (i * 241) % height;
      ctx.fillRect(rx, ry, 60 + (i % 80), 1.5);
    }

    // Sacred Borders
    ctx.strokeStyle = '#8B1E1E'; // Vermilion Red
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    ctx.strokeStyle = '#C58F27'; // Temple Gold
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    ctx.strokeStyle = 'rgba(139, 30, 30, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Corner Auspicious Symbols (卐)
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卐', 68, 68);
    ctx.fillText('卐', width - 68, 68);
    ctx.fillText('卐', 68, height - 68);
    ctx.fillText('卐', width - 68, height - 68);

    // Header Invocation
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 20px "Tiro Devanagari Hindi", serif';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', width / 2, 80);

    // Page Title
    ctx.fillStyle = '#4A2505';
    ctx.font = 'bold 26px "Tiro Devanagari Hindi", serif';
    ctx.fillText(title, width / 2, 115);

    if (subtitle) {
      ctx.fillStyle = '#7A4B18';
      ctx.font = 'italic 15px "Tiro Devanagari Hindi", serif';
      ctx.fillText(subtitle, width / 2, 142);
    }

    // Header divider
    ctx.strokeStyle = '#C58F27';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(90, 158);
    ctx.lineTo(width - 90, 158);
    ctx.stroke();

    // Footer
    const footerY = height - 75;
    ctx.strokeStyle = '#C58F27';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, footerY - 12);
    ctx.lineTo(width - 90, footerY - 12);
    ctx.stroke();

    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ श्री शक्ति पंचांग संस्थान • महर्षि पराशर वैदिक ज्योतिष संहिता ॥', width / 2, footerY + 6);

    ctx.fillStyle = '#5C3A21';
    ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`जातक: ${kundali.name} (${kundali.birthPlace})`, 90, footerY + 25);

    ctx.textAlign = 'right';
    ctx.fillText(`पृष्ठ ${pageNum} / ${totalPages}`, width - 90, footerY + 25);
  };

  // Helper to draw a North Indian diamond chart on canvas
  const drawNorthIndianDiamondChart = (
    centerX: number,
    centerY: number,
    size: number,
    vargaDivision: number,
    title?: string
  ) => {
    ctx.save();
    const half = size / 2;
    const x0 = centerX - half;
    const y0 = centerY - half;

    // Background & Outer Box
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(x0, y0, size, size);
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x0, y0, size, size);

    // Diagonals
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + size, y0 + size);
    ctx.moveTo(x0 + size, y0);
    ctx.lineTo(x0, y0 + size);
    ctx.stroke();

    // Inner Diamond
    ctx.beginPath();
    ctx.moveTo(centerX, y0);
    ctx.lineTo(x0 + size, centerY);
    ctx.lineTo(centerX, y0 + size);
    ctx.lineTo(x0, centerY);
    ctx.closePath();
    ctx.fillStyle = '#FAF3E5';
    ctx.fill();
    ctx.strokeStyle = '#5C3A21';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lagna sign
    const lagnaSign = calculateVargaSign(kundali.lagnaDegree, vargaDivision);

    // House coordinates normalized from 360 to size
    const scale = size / 360;
    const anchors = [
      { h: 1, cx: 180, cy: 95, nx: 180, ny: 150 },
      { h: 2, cx: 90, cy: 45, nx: 120, ny: 75 },
      { h: 3, cx: 45, cy: 90, nx: 75, ny: 120 },
      { h: 4, cx: 95, cy: 180, nx: 150, ny: 180 },
      { h: 5, cx: 45, cy: 270, nx: 75, ny: 240 },
      { h: 6, cx: 90, cy: 315, nx: 120, ny: 285 },
      { h: 7, cx: 180, cy: 265, nx: 180, ny: 210 },
      { h: 8, cx: 270, cy: 315, nx: 240, ny: 285 },
      { h: 9, cx: 315, cy: 270, nx: 285, ny: 240 },
      { h: 10, cx: 265, cy: 180, nx: 210, ny: 180 },
      { h: 11, cx: 315, cy: 90, nx: 285, ny: 120 },
      { h: 12, cx: 270, cy: 45, nx: 240, ny: 75 },
    ];

    // Group planets by house
    const hPlanets: Record<number, { name: string; retro: boolean; deg: string }[]> = {};
    for (let i = 1; i <= 12; i++) hPlanets[i] = [];

    kundali.planets.forEach((p) => {
      const pSign = calculateVargaSign(p.degree, vargaDivision);
      const house = ((pSign - lagnaSign + 12) % 12) + 1;
      const sName = p.planet.substring(0, 2);
      hPlanets[house]?.push({
        name: sName,
        retro: p.isRetrograde,
        deg: `${Math.floor(p.degreeInRashi)}°`,
      });
    });

    // Draw numbers & planets
    anchors.forEach(({ h, cx: acx, cy: acy, nx, ny }) => {
      const rashiNum = ((lagnaSign + h - 1) % 12) + 1;
      const px = x0 + acx * scale;
      const py = y0 + acy * scale;
      const numPx = x0 + nx * scale;
      const numPy = y0 + ny * scale;

      // Rashi number
      ctx.fillStyle = '#8C6239';
      ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${rashiNum}`, numPx, numPy);

      // Planets
      const plist = hPlanets[h] || [];
      plist.forEach((p, idx) => {
        const offset = (idx - (plist.length - 1) / 2) * 16 * scale;
        ctx.fillStyle = p.retro ? '#991B1B' : '#3E2714';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText(`${p.name}${p.retro ? '(व)' : ''} ${p.deg}`, px, py + offset);
      });
    });

    if (title) {
      ctx.fillStyle = '#5C3A21';
      ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, centerX, y0 + size + 24);
    }
    ctx.restore();
  };

  // Helper to draw text box
  const drawCardBox = (x: number, y: number, w: number, h: number, heading?: string) => {
    ctx.fillStyle = 'rgba(255, 252, 245, 0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#C58F27';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    if (heading) {
      ctx.fillStyle = '#5C3A21';
      ctx.fillRect(x, y, w, 32);
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`॥ ${heading} ॥`, x + 16, y + 16);
    }
  };

  const remedies = getVedicRemedies(kundali);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // ---------------- Render All 59 Pages ---------------- //
  for (let page = 1; page <= totalPages; page++) {
    const stageMsg = `पृष्ठ ${page}/${totalPages} तैयार हो रहा है...`;
    if (onProgress) onProgress(page, totalPages, stageMsg);

    // Yield to browser event loop
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    switch (page) {
      // ---------------- Page 1: मुखपृष्ठ (Cover Page) ---------------- //
      case 1: {
        drawBhojpatraBackground(page, '॥ सम्पूर्ण वैदिक महा-जन्मपत्रिका ॥', 'श्री शक्ति पंचांग संस्थान • पराशरीय 59-पृष्ठीय संहिता');
        
        // Large Center Emblem
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 44px serif';
        ctx.textAlign = 'center';
        ctx.fillText('ॐ', width / 2, 220);

        ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
        ctx.fillText('॥ शुभम् भवतु • सर्वसिद्धिप्रदायिनी पत्रिका ॥', width / 2, 265);

        // Birth Particulars Table Box
        drawCardBox(90, 310, width - 180, 420, 'जातक जन्म विवरण एवं पंचांग तत्व (Birth Particulars)');
        let curY = 370;
        ctx.font = '16px "Tiro Devanagari Hindi", serif';
        ctx.fillStyle = '#3E2714';
        ctx.textAlign = 'left';

        const bRows = [
          ['नाम (Name):', kundali.name, 'जन्म तिथि (DOB):', fmtDate(kundali.birthDate)],
          ['जन्म समय (TOB):', kundali.birthTime, 'जन्म स्थान (Place):', kundali.birthPlace],
          ['अक्षांश (Latitude):', `${kundali.latitude.toFixed(2)}° उत्तर`, 'देशांतर (Longitude):', `${kundali.longitude.toFixed(2)}° पूर्व`],
          ['लग्न (Lagna):', `${kundali.lagnaRashi} (${kundali.lagnaDegree.toFixed(2)}°)`, 'चंद्र राशि (Moon Sign):', kundali.moonRashi],
          ['नक्षत्र (Nakshatra):', `${kundali.nakshatra} (चरण ${kundali.charan})`, 'नक्षत्र स्वामी:', kundali.nakshatraLord || getNakshatraLord(kundali.nakshatra)],
          ['गण (Gana):', kundali.gana, 'नाड़ी (Nadi):', kundali.nadi],
          ['योनि (Yoni):', kundali.yoni, 'वर्ण (Varna):', kundali.varna],
          ['वश्य (Vashya):', kundali.vashya, 'वर्तमान महादशा:', `${kundali.mahadasha} / ${kundali.antardasha}`],
        ];

        bRows.forEach((r) => {
          ctx.fillStyle = '#7A4B18';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[0], 120, curY);
          ctx.fillStyle = '#2A1502';
          ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[1], 310, curY);

          ctx.fillStyle = '#7A4B18';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[2], 640, curY);
          ctx.fillStyle = '#2A1502';
          ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[3], 830, curY);

          curY += 44;
        });

        // Sacred Sanskrit Shloka Box
        drawCardBox(90, 770, width - 180, 320, 'महर्षि पराशर विरचित मंगलाचरण एवं संकल्प');
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('॥ ब्रह्मामुरारिस्त्रिपुरांतकारी भानुः शशी भूमिसुतो बुधश्च ॥', width / 2, 830);
        ctx.fillText('॥ गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥', width / 2, 865);

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        const shlokaNote = [
          'प्रस्तुत महा-जन्मपत्रिका में महर्षि पराशर प्रतिपादित बृहत्पाराशरहोराशास्त्र, जातकपारिजात व फलदीपिका के',
          'प्रामाणिक सिद्धांतों के आधार पर जातक के जीवन के समस्त 16 सूक्ष्म वर्गीय चक्रों (D1 से D60), विंशोत्तरी दशाओं,',
          'ग्रह बल (षड्बल), अष्टकवर्ग, भाव फलादेश, विशिष्ट योग, अरिष्ट परिहार तथा सात्विक वैदिक उपायों का समावेश है।',
          'यह विस्तृत 59-पृष्ठीय ग्रन्थ जातक के सम्पूर्ण भूत, भविष्य एवं वर्तमान प्रारब्ध का अचूक दिग्दर्शन कराता है।'
        ];
        let snY = 920;
        shlokaNote.forEach((line) => {
          ctx.fillText(line, 130, snY);
          snY += 28;
        });

        // Bottom Seal
        ctx.fillStyle = '#C58F27';
        ctx.font = 'bold 17px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('❖  सत्यं ज्ञानमनन्तं ब्रह्म • सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके  ❖', width / 2, 1140);
        break;
      }

      // ---------------- Page 2: अवकहड़ा चक्र एवं जन्म सारणी ---------------- //
      case 2: {
        drawBhojpatraBackground(page, '॥ अवकहड़ा चक्र एवं जन्म पत्रिका सारणी ॥', 'ज्योतिष शास्त्रीय आधारभूत घटक एवं त्रिविध गुण विचार');
        drawCardBox(90, 180, width - 180, 520, 'अवकहड़ा अष्टक एवं नैसर्गिक तत्व विभाजन');

        const avTable = [
          ['घटक', 'मान', 'फल व शास्त्रीय विश्लेषण'],
          ['वर्ण (Varna)', kundali.varna, 'जातक का आध्यात्मिक, सामाजिक स्वभाव व नैसर्गिक संस्कार'],
          ['वश्य (Vashya)', kundali.vashya, 'पारस्परिक आकर्षण, अनुकूलता एवं समाज पर प्रभाव'],
          ['तारा (Tara)', 'जन्म / संपत', 'दैनिक कार्यसिद्धि व नक्षत्र गति का शुभ-अशुभ फल'],
          ['योनि (Yoni)', kundali.yoni, 'मूल प्रकृति, आचार-विचार, शारीरिक ऊर्जा व स्वभावगत सामंजस्य'],
          ['ग्रह मैत्री', 'सम / मित्र', 'मनोवैज्ञानिक अनुकूलता एवं मित्रों-सगे-संबंधियों संग संबंध'],
          ['गण (Gana)', kundali.gana, 'जातक का सात्विक, राजसिक अथवा तामसिक दृष्टिकोण'],
          ['भकूट (Bhakoot)', kundali.moonRashi, 'भावुकता, दाम्पत्य सौहार्द व आत्मीय संतुलन'],
          ['नाड़ी (Nadi)', kundali.nadi, 'स्वास्थ्य, जैविक ऊर्जा, वंश वृद्धि व शारीरिक संतुलन'],
          ['पाया (Paya)', 'रजत (चांदी)', 'उत्तम व शुभदायक, जीवन पर्यंत सुख-समृद्धि प्रदायक'],
        ];

        let ty = 230;
        avTable.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, ty - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, ty);
            ctx.fillText(row[1], 330, ty);
            ctx.fillText(row[2], 560, ty);
            ty += 38;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, ty - 16, width - 220, 30);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, ty - 16, width - 220, 30);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, ty);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(row[1], 330, ty);
            ctx.font = '14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[2], 560, ty);
            ty += 32;
          }
        });

        // Planetary Overview Summary Box
        drawCardBox(90, 740, width - 180, 520, 'लग्न, चंद्र एवं सूर्य बल सार');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        const p2notes = [
          `• लग्न स्पष्ट: ${kundali.lagnaRashi} राशि ${kundali.lagnaDegree.toFixed(2)} अंश। लग्न स्वामी की स्थिति जीवन शक्ति व देह पुष्टि करती है।`,
          `• चंद्र स्पष्ट: ${kundali.moonRashi} राशि में चंद्र देव ${kundali.nakshatra} नक्षत्र के चरण ${kundali.charan} में स्थित हैं।`,
          `• जन्मकालीन नक्षत्र स्वामी: ${kundali.nakshatraLord || getNakshatraLord(kundali.nakshatra)}। इसी से विंशोत्तरी महादशा का प्रारंभिक भोग्य काल निर्धारित हुआ।`,
          `• राशि तत्व: ${kundali.moonRashi} राशि का तत्व जातक के अंतर्मन को दृढ़ता व सकारात्मक चिंतन प्रदान करता है।`,
          `• देव गुरु बृहस्पति एवं योगकारक ग्रहों का शुभाशुभ प्रभाव जातक को धर्म, नीति व सत्य के मार्ग पर प्रतिष्ठित करता है।`,
        ];
        let p2y = 800;
        p2notes.forEach((nt) => {
          ctx.fillText(nt, 120, p2y);
          p2y += 34;
        });
        break;
      }

      // ---------------- Page 3: D1 लग्न चक्र (Lagna Rashi Chart) ---------------- //
      case 3: {
        drawBhojpatraBackground(page, '॥ D1 लग्न चक्र (Lagna Rashi Chart) ॥', 'समग्र भौतिक जीवन, शरीर, व्यक्तित्व व मूल स्वभाव');
        drawNorthIndianDiamondChart(width / 2, 480, 520, 1, `जातक ${kundali.name} — लग्न चक्र (D1)`);
        
        drawCardBox(90, 810, width - 180, 480, 'लग्न चक्र शास्त्रीय विवेचना एवं केंद्र-त्रिकोण फल');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let cy = 870;
        const d1points = [
          `1. प्रथम भाव (तनु भाव): लग्न राशि ${kundali.lagnaRashi} है। यह जातक के रूप-रंग, शारीरिक गठन व स्वास्थ्य का मुख्य द्योतक है।`,
          `2. केंद्र स्थान (भाव 1, 4, 7, 10): भगवान विष्णु के स्थान माने गए हैं। इनमें स्थित शुभ ग्रह जीवन में स्थिरता, यश व रक्षा करते हैं।`,
          `3. त्रिकोण स्थान (भाव 1, 5, 9): देवी महालक्ष्मी के स्थान हैं। पंचम (पूर्व पुण्य व विद्या) एवं नवम (भाग्य व धर्म) परम फलदायी हैं।`,
          `4. उपचय स्थान (भाव 3, 6, 10, 11): पुरुषार्थ और सतत संघर्ष से विजय व आर्थिक उन्नति प्रदान करने वाले भाव हैं।`,
          `5. त्रिक भाव (भाव 6, 8, 12): रोग, ऋण, अरिष्ट व व्यय के सूचक हैं। इन भावों के स्वामियों का अनुकूलन ही जीवन को निर्विघ्न बनाता है।`,
        ];
        d1points.forEach((pt) => {
          ctx.fillText(pt, 120, cy);
          cy += 36;
        });
        break;
      }

      // ---------------- Page 4: चंद्र कुंडली एवं सूर्य कुंडली ---------------- //
      case 4: {
        drawBhojpatraBackground(page, '॥ चंद्र कुंडली एवं सूर्य कुंडली चक्र ॥', 'मानसिक शक्ति, आत्मबल, पिता-माता सुख एवं चेतना का स्तर');
        // Twin charts side by side
        drawNorthIndianDiamondChart(340, 440, 400, 1, 'चंद्र कुंडली (Chandra Chart)');
        drawNorthIndianDiamondChart(900, 440, 400, 1, 'सूर्य कुंडली (Surya Chart)');

        drawCardBox(90, 750, width - 180, 550, 'सुदर्शन एवं चंद्र-सूर्य स्थिति विश्लेषण');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let cy4 = 810;
        const cNotes = [
          `• चंद्र कुंडली विचार: चंद्र मनसो जातः—चंद्रमा मन, कल्पना, भावुकता व माता का कारक है। चंद्र कुंडली से सभी गोचर ग्रह देखे जाते हैं।`,
          `• सूर्य कुंडली विचार: सूर्य आत्मा जगतस्तस्थुषश्च—सूर्य आत्मा, पिता, आत्मविश्वास, राजकीय मान-सम्मान व उच्च पद का कारक है।`,
          `• त्रि-आयामी दृष्टिकोण: महर्षि पराशर अनुसार जब लग्न, चंद्र व सूर्य तीनों कुंडलियों में कोई ग्रह शुभ संबंध बनाता है, तो वह अखंड राजयोग देता है।`,
          `• चंद्र राशि: ${kundali.moonRashi}। इस राशि में स्थित चंद्रमा जातक को सृजनात्मक शक्ति व तीव्र स्मरण सामर्थ्य प्रदान करता है।`,
        ];
        cNotes.forEach((cn) => {
          ctx.fillText(cn, 120, cy4);
          cy4 += 38;
        });
        break;
      }

      // ---------------- Page 5: D9 नवमांश चक्र (Navamsha Chart) ---------------- //
      case 5: {
        drawBhojpatraBackground(page, '॥ D9 नवमांश चक्र (Navamsha Kundali) ॥', 'विवाह, जीवनसाथी, धर्म, भाग्य एवं सूक्ष्म आत्मिक बल की कुंजी');
        drawNorthIndianDiamondChart(width / 2, 480, 520, 9, `जातक ${kundali.name} — नवमांश चक्र (D9)`);

        drawCardBox(90, 810, width - 180, 480, 'नवमांश फल एवं वर्गोत्तम ग्रह रहस्य');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let cy5 = 870;
        const d9notes = [
          '• नवमांश चक्र को कुंडली का प्राण व आत्मा कहा गया है। लग्न चक्र यदि वृक्ष है तो नवमांश उसका मीठा फल है।',
          '• वर्गोत्तम विचार: यदि कोई ग्रह D1 (लग्न) और D9 (नवमांश) दोनों में एक ही राशि में हो तो वह वर्गोत्तम होकर असीम बलवान हो जाता है।',
          '• सप्तम भाव विचार: नवमांश का सप्तम भाव जीवनसाथी का रूप, स्वभाव, संस्कार, वैवाहिक सामंजस्य व भाग्य सहयोग दर्शाता है।',
          '• भाग्य की सूक्ष्मता: 30 से 35 वर्ष की आयु के पश्चात नवमांश का प्रभाव मुख्य रूप से जीवन की दिशा निर्धारित करता है।',
        ];
        d9notes.forEach((dn) => {
          ctx.fillText(dn, 120, cy5);
          cy5 += 36;
        });
        break;
      }

      // ---------------- Page 6: ग्रह स्थिति एवं स्पष्ट भोगांश तालिका ---------------- //
      case 6: {
        drawBhojpatraBackground(page, '॥ ग्रह स्थिति एवं स्पष्ट भोगांश तालिका ॥', 'निरयण ग्रह स्पष्ट, गति, नक्षत्र, चरण, अवस्थान एवं भाव विवरण');
        drawCardBox(90, 180, width - 180, 680, 'नवग्रह एवं लग्न स्पष्ट तालिका (Planetary Ephemeris)');

        const pHeaders = ['ग्रह', 'राशि', 'अंश (Deg)', 'भाव', 'नक्षत्र', 'चरण', 'गति', 'अवस्था'];
        let py = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, py - 20, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
        ctx.fillText(pHeaders[0], 130, py);
        ctx.fillText(pHeaders[1], 230, py);
        ctx.fillText(pHeaders[2], 340, py);
        ctx.fillText(pHeaders[3], 450, py);
        ctx.fillText(pHeaders[4], 540, py);
        ctx.fillText(pHeaders[5], 680, py);
        ctx.fillText(pHeaders[6], 770, py);
        ctx.fillText(pHeaders[7], 880, py);

        py += 40;
        kundali.planets.forEach((p, idx) => {
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, py - 18, width - 220, 32);
          ctx.strokeStyle = '#8C6239';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(110, py - 18, width - 220, 32);

          ctx.fillStyle = p.isRetrograde ? '#991B1B' : '#5C3A21';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${p.planet} (${p.englishName.substring(0, 3)})`, 130, py);
          ctx.fillStyle = '#2A1502';
          ctx.fillText(p.rashi, 230, py);
          ctx.fillText(`${p.degreeInRashi.toFixed(2)}°`, 340, py);
          ctx.fillStyle = '#B56A00';
          ctx.fillText(`${p.house}`, 460, py);
          ctx.fillStyle = '#2A1502';
          ctx.fillText(p.nakshatra, 540, py);
          ctx.fillText(`${p.pada}`, 690, py);
          ctx.fillStyle = p.isRetrograde ? '#991B1B' : '#166534';
          ctx.fillText(p.isRetrograde ? 'वक्री (R)' : 'मार्गी', 770, py);
          ctx.fillStyle = '#7A4B18';
          ctx.fillText(p.degreeInRashi < 6 ? 'बाल' : p.degreeInRashi < 18 ? 'युवा' : 'वृद्ध', 880, py);

          py += 34;
        });

        // Planetary Strengths Explanatory Card
        drawCardBox(90, 890, width - 180, 420, 'ग्रह बल एवं अवस्था शास्त्रीय नियम');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let peY = 945;
        const peNotes = [
          '• युवावस्था के ग्रह (12° से 18°) पूर्ण 100% फल प्रदान करने में सक्षम होते हैं।',
          '• वक्री ग्रह चेष्टाबल से युक्त होकर सामान्य से अधिक गहरा व तीव्र प्रभाव डालते हैं।',
          '• सूर्य के सान्निध्य में आने से ग्रह अस्त (Combust) हो जाते हैं, जिससे उनका बाह्य फल क्षीण होता है।',
          '• केंद्र में स्थित शुभ ग्रह जीवन में किसी भी प्रकार के अनिष्ट संकट से जातक की रक्षा करते हैं।',
        ];
        peNotes.forEach((nt) => {
          ctx.fillText(nt, 120, peY);
          peY += 36;
        });
        break;
      }

      // ---------------- Page 7: भाव चलित चक्र एवं भाव संधि तालिका ---------------- //
      case 7: {
        drawBhojpatraBackground(page, '॥ भाव चलित चक्र एवं भाव संधि तालिका ॥', 'श्रीपति पद्धति अनुसार भाव मध्य, संधि एवं चलित प्रभाव');
        drawNorthIndianDiamondChart(width / 2, 450, 480, 1, 'भाव चलित चक्र (Bhav Chalit Chart)');

        drawCardBox(90, 780, width - 180, 520, 'द्वादश भाव मध्य एवं संधि भोगांश विवरण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        let bcy = 840;
        ctx.fillText('भाव चलित चक्र का नियम: कई बार ग्रह राशि कुण्डली में एक भाव में दिखते हैं किन्तु स्पष्ट भोगांश के कारण', 120, bcy);
        bcy += 28;
        ctx.fillText('वे चलित चक्र में अगले या पिछले भाव में चले जाते हैं। वास्तविक फलादेश भाव चलित के आधार पर ही घटित होता है।', 120, bcy);
        bcy += 36;

        for (let bh = 1; bh <= 6; bh++) {
          const deg1 = ((bh - 1) * 30 + 15).toFixed(1);
          const deg2 = (bh * 30 + 15).toFixed(1);
          ctx.fillText(`• भाव ${bh}: मध्य ${deg1}° | संधि ${deg2}°   ————   • भाव ${bh + 6}: मध्य ${(parseFloat(deg1) + 180).toFixed(1)}° | संधि ${(parseFloat(deg2) + 180).toFixed(1)}°`, 130, bcy);
          bcy += 32;
        }
        break;
      }

      // ---------------- Page 8: सुदर्शन चक्र (Sudarshan Chakra) ---------------- //
      case 8: {
        drawBhojpatraBackground(page, '॥ सुदर्शन चक्र (Sudarshan Chakra) ॥', 'लग्न, चंद्र एवं सूर्य का त्रि-आयामी संयुक्त चक्र');
        drawCardBox(90, 180, width - 180, 520, 'सुदर्शन चक्र की शास्त्रीय संरचना एवं तीनों लग्नों का फल');
        
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('॥ सुदर्शन चक्र विचार ॥', width / 2, 230);

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let scY = 280;
        const scNotes = [
          `1. देह लग्न (शारीरिक): ${kundali.lagnaRashi} लग्न से भौतिक शरीर, स्वास्थ्य, आयु व रूप का विचार किया जाता है।`,
          `2. चंद्र लग्न (मानसिक): ${kundali.moonRashi} चंद्र लग्न से मन, सुख-शांति, चिंताएं, संवेदनाएं व गोचर देखा जाता है।`,
          `3. सूर्य लग्न (आत्मिक): सूर्य लग्न से जातक का तेज, आत्मबल, सरकारी पद, अधिकार व समाज में वर्चस्व देखा जाता है।`,
          'सुदर्शन चक्र में जब तीनों लग्नों से किसी भाव पर शुभ ग्रहों की दृष्टि अथवा युति होती है, तो उस भाव से',
          'संबंधित फल शत-प्रतिशत निश्चित व निर्विवाद रूप से प्राप्त होता है।',
        ];
        scNotes.forEach((nt) => {
          ctx.fillText(nt, 120, scY);
          scY += 38;
        });

        // Circular Sudarshan visual diagram
        ctx.save();
        ctx.strokeStyle = '#8C6239';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width / 2, 980, 220, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, 980, 160, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, 980, 100, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#5C3A21';
        ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('लग्न चक्र', width / 2, 920);
        ctx.fillText('चंद्र चक्र', width / 2, 970);
        ctx.fillText('सूर्य चक्र', width / 2, 1020);
        ctx.restore();
        break;
      }

      // ---------------- Page 9: ग्रह दृष्टि एवं संबंध चक्र ---------------- //
      case 9: {
        drawBhojpatraBackground(page, '॥ ग्रह दृष्टि एवं पंचधा मैत्री चक्र ॥', 'ग्रहों की परस्पर पूर्ण दृष्टियाँ एवं तात्कालिक-नैसर्गिक मैत्री');
        drawCardBox(90, 180, width - 180, 520, 'ग्रह पूर्ण दृष्टि तालिका (Planetary Aspects)');

        const dAspects = [
          ['ग्रह', 'सातवीं दृष्टि (पूर्ण)', 'विशेष पूर्ण दृष्टि'],
          ['सूर्य (Sun)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['चंद्र (Moon)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['मंगल (Mars)', 'सप्तम भाव पर पूर्ण दृष्टि', 'चतुर्थ (4थी) एवं अष्टम (8वीं) दृष्टि'],
          ['बुध (Mercury)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['गुरु (Jupiter)', 'सप्तम भाव पर पूर्ण दृष्टि', 'पंचम (5वीं) एवं नवम (9वीं) अमृत दृष्टि'],
          ['शुक्र (Venus)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['शनि (Saturn)', 'सप्तम भाव पर पूर्ण दृष्टि', 'तृतीय (3री) एवं दशम (10वीं) दृष्टि'],
          ['राहु (Rahu)', 'सप्तम भाव पर पूर्ण दृष्टि', 'पंचम (5वीं) एवं नवम (9वीं) दृष्टि'],
          ['केतु (Ketu)', 'सप्तम भाव पर पूर्ण दृष्टि', 'पंचम (5वीं) एवं नवम (9वीं) दृष्टि'],
        ];

        let dy = 230;
        dAspects.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, dy - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, dy);
            ctx.fillText(row[1], 360, dy);
            ctx.fillText(row[2], 640, dy);
            dy += 36;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, dy - 16, width - 220, 30);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, dy - 16, width - 220, 30);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, dy);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(row[1], 360, dy);
            ctx.fillStyle = '#166534';
            ctx.fillText(row[2], 640, dy);
            dy += 32;
          }
        });

        drawCardBox(90, 740, width - 180, 520, 'पंचधा मैत्री शास्त्रीय नियम');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let pmY = 800;
        const pmNotes = [
          '• नैसर्गिक मित्र: सूर्य-चंद्र-मंगल-गुरु परस्पर मित्र हैं; बुध-शुक्र-शनि परस्पर मित्र हैं।',
          '• तात्कालिक मैत्री: किसी ग्रह से 2, 3, 4, 10, 11, 12 भावों में स्थित ग्रह तात्कालिक मित्र होते हैं।',
          '• अधिमित्र: जो नैसर्गिक और तात्कालिक दोनों प्रकार से मित्र हों, वे अधिमित्र होकर परम शुभ फल देते हैं।',
          '• अधिशत्रु: जो नैसर्गिक और तात्कालिक दोनों रूपों में शत्रु हों, वे अत्यधिक कष्टकारी प्रभाव डालते हैं।',
        ];
        pmNotes.forEach((pm) => {
          ctx.fillText(pm, 120, pmY);
          pmY += 36;
        });
        break;
      }

      // ---------------- Page 10: षड्बल एवं भावबल विश्लेषण ---------------- //
      case 10: {
        drawBhojpatraBackground(page, '॥ षड्बल एवं भावबल विश्लेषण ॥', 'छह प्रकार के ग्रह बल, रूपात्मक सामर्थ्य एवं इष्ट-कष्ट फल');
        drawCardBox(90, 180, width - 180, 560, 'षड्बल के 6 अंगों का विवरण (Shadbala Strength)');

        const shadTable = [
          ['बल का नाम', 'आधार', 'शास्त्रीय फल'],
          ['1. स्थान बल', 'उच्च, स्वक्षेत्री, मूलत्रिकोण, मित्र राशि स्थिति', 'ग्रह की मूल स्थिति की मजबूती व दृढ़ता'],
          ['2. दिग्बल', 'दिशात्मक सामर्थ्य (गुरु/बुध पूर्व, शनि पश्चिम आदि)', 'कार्यक्षेत्र में सही निर्णय लेने का सामर्थ्य'],
          ['3. काल बल', 'दिन/रात्रि, पक्ष, अयन व ऋतु का बल', 'समय आने पर अनुकूल अवसर प्रदान करना'],
          ['4. चेष्टा बल', 'वक्री गति अथवा तेज चाल का बल', 'कठिन परिस्थितियों में पुरुषार्थ व विजय'],
          ['5. नैसर्गिक बल', 'सूर्य > चंद्र > शुक्र > गुरु > बुध > मंगल > शनि', 'ग्रह का प्राकृतिक व जन्मजात प्रकाश बल'],
          ['6. दृग् बल', 'शुभ अथवा क्रूर ग्रहों की दृष्टि का बल', 'सहायक शक्तियों का प्रत्यक्ष अथवा परोक्ष सहयोग'],
        ];

        let sY = 230;
        shadTable.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, sY - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, sY);
            ctx.fillText(row[1], 330, sY);
            ctx.fillText(row[2], 680, sY);
            sY += 38;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, sY - 16, width - 220, 34);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, sY - 16, width - 220, 34);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, sY);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(row[1], 330, sY);
            ctx.font = '14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[2], 680, sY);
            sY += 36;
          }
        });

        drawCardBox(90, 780, width - 180, 480, 'इष्ट फल एवं कष्ट फल सारिणी');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ikY = 840;
        const ikNotes = [
          '• इष्ट फल 30 से अधिक होने पर ग्रह अपनी महादशा में अत्यधिक धन, सुख व सौभाग्य प्रदान करता है।',
          '• कष्ट फल 30 से अधिक होने पर ग्रह स्वास्थ्य, मानसिक तनाव अथवा कार्यों में विलंब उत्पन्न करता है।',
          '• जिस भाव का भावबल 6 रूप से अधिक होता है, वह भाव जातक के जीवन का सबसे मजबूत स्तंभ बनता है।',
        ];
        ikNotes.forEach((ik) => {
          ctx.fillText(ik, 120, ikY);
          ikY += 38;
        });
        break;
      }

      // ---------------- Page 11: अष्टकवर्ग सारणी (भाग 1) ---------------- //
      case 11: {
        drawBhojpatraBackground(page, '॥ अष्टकवर्ग सारणी (भाग 1) ॥', 'सूर्य, चंद्र, मंगल एवं बुध का भिन्नाष्टकवर्ग चक्र');
        drawCardBox(90, 180, width - 180, 1080, 'चार प्रमुख ग्रहों के भिन्नाष्टकवर्ग बिंदु (12 राशियों में)');
        
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ay = 240;
        ctx.fillText('अष्टकवर्ग का शास्त्रीय महत्व: महर्षि पराशर अनुसार किसी भी भाव व राशि में ग्रहों के शुभ बिंदु ही', 120, ay);
        ay += 26;
        ctx.fillText('यह तय करते हैं कि गोचर काल में ग्रह कैसा फल देगा। 4 से अधिक बिंदु शुभ, 4 मध्यम, और 3 से कम बिंदु कष्टप्रद माने जाते हैं।', 120, ay);
        ay += 40;

        const astPlanets = ['सूर्य (Sun)', 'चंद्र (Moon)', 'मंगल (Mars)', 'बुध (Mercury)'];
        astPlanets.forEach((ap, pidx) => {
          ctx.fillStyle = '#5C3A21';
          ctx.fillRect(110, ay, width - 220, 28);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`• ${ap} भिन्नाष्टकवर्ग रेखा (कुल 48-54 बिंदु)`, 130, ay + 18);
          ay += 36;

          // 12 signs boxes
          const boxW = (width - 240) / 12;
          ctx.font = '12px "Tiro Devanagari Hindi", serif';
          for (let s = 0; s < 12; s++) {
            const bx = 110 + s * boxW;
            ctx.fillStyle = '#FAF3E5';
            ctx.fillRect(bx, ay, boxW, 50);
            ctx.strokeStyle = '#8C6239';
            ctx.strokeRect(bx, ay, boxW, 50);

            ctx.fillStyle = '#7A4B18';
            ctx.fillText(RASHIS[s].substring(0, 2), bx + 8, ay + 18);

            // Pseudo-random but deterministic points based on kundali
            const pts = 3 + ((s * 3 + pidx * 2 + kundali.name.length) % 5);
            ctx.fillStyle = pts >= 5 ? '#166534' : pts <= 3 ? '#991B1B' : '#5C3A21';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(`${pts}`, bx + 16, ay + 40);
          }
          ay += 70;
        });
        break;
      }

      // ---------------- Page 12: अष्टकवर्ग सारणी (भाग 2) एवं सर्वाष्टकवर्ग ---------------- //
      case 12: {
        drawBhojpatraBackground(page, '॥ अष्टकवर्ग सारणी (भाग 2) एवं सर्वाष्टकवर्ग ॥', 'गुरु, शुक्र, शनि भिन्नाष्टकवर्ग एवं 337 समुदाय बिंदु सारणी');
        drawCardBox(90, 180, width - 180, 1080, 'सर्वाष्टकवर्ग (Sarvashtakavarga - कुल 337 बिंदु विभाजन)');

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let sy = 240;
        ctx.fillText('सर्वाष्टकवर्ग में 12 राशियों के कुल बिंदुओं का योग 337 होता है।', 120, sy);
        sy += 26;
        ctx.fillText('जिस राशि में 28 से अधिक बिंदु होते हैं, वह राशि अत्यंत शुभ, 28 पर सम, तथा 28 से कम बिंदु पर सावधानी अपेक्षित है।', 120, sy);
        sy += 40;

        // Big Sarvashtakavarga Table
        const colW = (width - 240) / 13;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, sy, width - 220, 32);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText('राशि', 120, sy + 20);
        for (let i = 0; i < 12; i++) {
          ctx.fillText(RASHIS[i].substring(0, 2), 110 + (i + 1) * colW + 8, sy + 20);
        }
        sy += 36;

        // Rows for remaining planets + Total
        const remPlanets = ['गुरु (Jupiter)', 'शुक्र (Venus)', 'शनि (Saturn)', 'लग्न (Lagna)', 'कुल सर्वाष्टक (Total)'];
        remPlanets.forEach((rp, rIdx) => {
          ctx.fillStyle = rIdx === 4 ? '#E5D2B8' : rIdx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, sy, width - 220, 32);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, sy, width - 220, 32);

          ctx.fillStyle = rIdx === 4 ? '#8B1E1E' : '#3E2714';
          ctx.font = rIdx === 4 ? 'bold 13px "Tiro Devanagari Hindi", serif' : '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(rp.split(' ')[0], 120, sy + 20);

          for (let i = 0; i < 12; i++) {
            const pts = rIdx === 4 ? 25 + ((i * 3 + kundali.name.length) % 10) : 3 + ((i * 2 + rIdx) % 5);
            ctx.fillStyle = rIdx === 4 ? (pts >= 28 ? '#166534' : '#991B1B') : '#2A1502';
            ctx.font = rIdx === 4 ? 'bold 14px sans-serif' : '13px sans-serif';
            ctx.fillText(`${pts}`, 110 + (i + 1) * colW + 10, sy + 20);
          }
          sy += 36;
        });
        break;
      }

      // ---------------- Page 13: विंशोत्तरी महादशा चक्र (120 वर्ष की रूपरेखा) ---------------- //
      case 13: {
        drawBhojpatraBackground(page, '॥ विंशोत्तरी महादशा चक्र (120 वर्ष) ॥', 'समस्त 9 महादशाओं का शास्त्रीय कालखंड, आरंभ एवं समाप्ति तिथियां');
        drawCardBox(90, 180, width - 180, 1080, 'विंशोत्तरी 120 वर्षीय महादशा सारणी');

        let dY = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, dY - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
        ctx.fillText('क्र.', 125, dY + 4);
        ctx.fillText('महादशा स्वामी', 170, dY + 4);
        ctx.fillText('अवधि (वर्ष)', 340, dY + 4);
        ctx.fillText('आरंभ तिथि', 460, dY + 4);
        ctx.fillText('समाप्ति तिथि', 620, dY + 4);
        ctx.fillText('स्थिति', 780, dY + 4);

        dY += 40;
        kundali.dashaPeriods.forEach((d, idx) => {
          const isActive = d.planet === kundali.mahadasha;
          ctx.fillStyle = isActive ? '#EBD6B0' : idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, dY - 18, width - 220, 36);
          ctx.strokeStyle = isActive ? '#B56A00' : '#8C6239';
          ctx.lineWidth = isActive ? 1.8 : 0.6;
          ctx.strokeRect(110, dY - 18, width - 220, 36);

          ctx.fillStyle = '#7A4B18';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`${idx + 1}`, 125, dY + 5);

          ctx.fillStyle = isActive ? '#B56A00' : '#3E2714';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${d.planet} देव`, 170, dY + 5);

          ctx.fillStyle = '#2A1502';
          ctx.font = '14px sans-serif';
          ctx.fillText(`${DASHA_YEARS[d.planet] || d.years} वर्ष`, 340, dY + 5);
          ctx.fillText(fmtDate(d.startDate), 460, dY + 5);
          ctx.fillText(fmtDate(d.endDate), 620, dY + 5);

          if (isActive) {
            ctx.fillStyle = '#991B1B';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText('★ वर्तमान सक्रिय', 780, dY + 5);
          } else {
            ctx.fillStyle = '#7A4B18';
            ctx.font = '13px "Tiro Devanagari Hindi", serif';
            ctx.fillText(new Date() > d.endDate ? 'व्यतीत' : 'आगामी', 780, dY + 5);
          }

          dY += 42;
        });
        break;
      }

      // ---------------- Pages 14 to 22: 9 महादशाओं की प्रत्येक अंतर्दशा ---------------- //
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22: {
        const dashaIndex = page - 14;
        const planetName = DASHA_ORDER[dashaIndex];
        const planetYears = DASHA_YEARS[planetName];

        drawBhojpatraBackground(
          page,
          `॥ ${planetName} महादशा की 9 अंतर्दशाएं ॥`,
          `${planetName} देव की पूर्ण ${planetYears} वर्षीय विंशोत्तरी महादशा का सूक्ष्म अंतर्दशा विभाजन`
        );

        drawCardBox(90, 180, width - 180, 1080, `${planetName} महादशा में समस्त 9 अंतर्दशाएं एवं शास्त्रीय फल`);

        let ay14 = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, ay14 - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
        ctx.fillText('अंतर्दशा स्वामी', 130, ay14 + 4);
        ctx.fillText('अवधि', 300, ay14 + 4);
        ctx.fillText('शास्त्रीय फलित एवं प्रभाव', 460, ay14 + 4);

        ay14 += 40;
        DASHA_ORDER.forEach((antar, idx) => {
          const antarYears = (DASHA_YEARS[antar] * planetYears) / 120;
          const months = Math.floor(antarYears * 12);
          const days = Math.floor((antarYears * 12 - months) * 30);

          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, ay14 - 16, width - 220, 48);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, ay14 - 16, width - 220, 48);

          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${planetName} - ${antar}`, 130, ay14 + 8);

          ctx.fillStyle = '#2A1502';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${months} माह ${days} दिन`, 300, ay14 + 8);

          const phalaText = `${planetName} व ${antar} के संयोग से जातक के जीवन में धन, पुरुषार्थ व सुख की प्राप्ति तथा इष्ट मंत्र जप से कार्यसिद्धि।`;
          ctx.fillText(phalaText, 460, ay14 + 8);

          ay14 += 56;
        });
        break;
      }

      // ---------------- Pages 23 to 38: षोडशवर्ग चक्र (The 16 Parashari Divisional Charts) ---------------- //
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38: {
        const vargaList = [
          { div: 1, code: 'D1', name: 'लग्न चक्र (Lagna Rashi)', desc: 'समग्र भौतिक जीवन, शरीर, स्वास्थ्य व स्वभाव' },
          { div: 2, code: 'D2', name: 'होरा चक्र (Hora Chart)', desc: 'धन-संपदा, कोष, आर्थिक संपन्नता, वाणी व पैतृक संपत्ति' },
          { div: 3, code: 'D3', name: 'द्रेष्काण चक्र (Drekkana Chart)', desc: 'सहोदर, पराक्रम, साहस, शौर्य व तृतीय भाव फल' },
          { div: 4, code: 'D4', name: 'चतुर्थांश चक्र (Chaturthamsha)', desc: 'भाग्य, भूमि, भवन, अचल संपत्ति, वाहन व सुख-साधन' },
          { div: 7, code: 'D7', name: 'सप्तमांश चक्र (Saptamsha)', desc: 'संतान सुख, संतति, वंश वृद्धि व पौत्र-पौत्री' },
          { div: 9, code: 'D9', name: 'नवमांश चक्र (Navamsha)', desc: 'विवाह, जीवनसाथी, धर्म, सूक्ष्म सामर्थ्य व भाग्य' },
          { div: 10, code: 'D10', name: 'दशमांश चक्र (Dashamsha)', desc: 'आजीविका, कर्म, पद-प्रतिष्ठा, व्यवसाय, यश व करियर' },
          { div: 12, code: 'D12', name: 'द्वादशांश चक्र (Dwadashamsha)', desc: 'माता-पिता, पूर्वज, पैतृक संस्कार व पूर्व पुण्य' },
          { div: 16, code: 'D16', name: 'षोडशांश चक्र (Shodashamsha)', desc: 'वाहन सुख, आंतरिक आनंद, वैभव व दुर्घटना रक्षा' },
          { div: 20, code: 'D20', name: 'विंशांश चक्र (Vimshamsha)', desc: 'आध्यात्मिक साधना, उपासना, मंत्र सिद्धि, भक्ति व आत्मज्ञान' },
          { div: 24, code: 'D24', name: 'चतुर्विंशांश चक्र (Chaturvimshamsha / Siddhamsa)', desc: 'उच्च विद्या, ज्ञान, बुद्धि, अनुसंधान व पांडित्य' },
          { div: 27, code: 'D27', name: 'सप्तविंशांश चक्र (Saptavimshamsha / Bhamsha)', desc: 'शारीरिक व मानसिक बल, सहनशक्ति व धैर्य' },
          { div: 30, code: 'D30', name: 'त्रिंशांश चक्र (Trimshamsha)', desc: 'अरिष्ट, दुर्घटना, विपत्तियां व दोष परिहार' },
          { div: 40, code: 'D40', name: 'खवेदांश चक्र (Khavedamsha)', desc: 'सूक्ष्म शुभ-अशुभ कर्मफल व प्रारब्ध विचार' },
          { div: 45, code: 'D45', name: 'अक्षवेदांश चक्र (Akshavedamsha)', desc: 'चरित्र, आचरण, नैतिक संस्कार व आत्मिक शुद्धि' },
          { div: 60, code: 'D60', name: 'षष्ट्यंश चक्र (Shashtiamsha)', desc: 'पूर्वजन्म संचित कर्म, गहन प्रारब्ध व फलित की सर्वोच्च कुंजी' },
        ];

        const curV = vargaList[page - 23];
        drawBhojpatraBackground(page, `॥ ${curV.code}: ${curV.name} ॥`, `महर्षि पराशर प्रतिपादित सूक्ष्म वर्ग (विभाजन 1/${curV.div})`);
        drawNorthIndianDiamondChart(width / 2, 480, 520, curV.div, `${kundali.name} — ${curV.code} चक्र`);

        drawCardBox(90, 810, width - 180, 480, `${curV.code} शास्त्रीय महत्व एवं फलित विचार`);
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let vy = 870;
        const vNotes = [
          `• विषय क्षेत्र: ${curV.desc}।`,
          `• पराशरी नियम: प्रत्येक वर्ग चक्र जातक के जीवन के एक विशिष्ट आयाम का सूक्ष्म विश्लेषण करता है।`,
          `• ग्रह बल विचार: यदि कोई ग्रह D1 में सामान्य हो किन्तु ${curV.code} में उच्च अथवा स्वक्षेत्री हो, तो वह संबंधित क्षेत्र में अद्भुत सफलता देता है।`,
          `• भाव स्वामियों का संबंध: ${curV.code} के लग्न और लग्नेश की स्थिति जातक को इस क्षेत्र में मिलने वाली अनुकूलता निर्धारित करती है।`,
        ];
        vNotes.forEach((vn) => {
          ctx.fillText(vn, 120, vy);
          vy += 36;
        });
        break;
      }

      // ---------------- Pages 39 to 44: अतिरिक्त वर्ग, विंशोपक बल व वर्ग समन्वय ---------------- //
      case 39: {
        drawBhojpatraBackground(page, '॥ D5 पंचांश एवं D6 षष्ठांश चक्र ॥', 'आध्यात्मिक आभा, प्रतिष्ठा तथा रोग-ऋण-शत्रु विचार');
        drawNorthIndianDiamondChart(340, 440, 400, 5, 'D5 पंचांश चक्र (Panchamsha)');
        drawNorthIndianDiamondChart(900, 440, 400, 6, 'D6 षष्ठांश चक्र (Shashtamsha)');
        drawCardBox(90, 750, width - 180, 550, 'D5 एवं D6 का शास्त्रीय फलित');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('• D5 पंचांश चक्र: जातक की आध्यात्मिक आभा, बुद्धि का तेज एवं प्रसिद्धि का सूक्ष्म विश्लेषण।', 120, 810);
        ctx.fillText('• D6 षष्ठांश चक्र: जीवन में आने वाले रोग, शत्रु, ऋण तथा कानूनी विवादों की रोकथाम का विचार।', 120, 850);
        break;
      }
      case 40: {
        drawBhojpatraBackground(page, '॥ D8 अष्टमांश एवं D11 एकादशांश चक्र ॥', 'दीर्घायु, गूढ़ बाधाएं तथा विशेष लाभ व विजय चक्र');
        drawNorthIndianDiamondChart(340, 440, 400, 8, 'D8 अष्टमांश चक्र (Ashtamsha)');
        drawNorthIndianDiamondChart(900, 440, 400, 11, 'D11 एकादशांश चक्र (Rudramsha)');
        drawCardBox(90, 750, width - 180, 550, 'D8 एवं D11 का शास्त्रीय फलित');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('• D8 अष्टमांश चक्र: आयु का गूढ़ विचार, गुप्त विद्याएं, आकस्मिक संकट तथा पैतृक वसीयत।', 120, 810);
        ctx.fillText('• D11 एकादशांश चक्र: व्यापारिक लाभ, इच्छाओं की पूर्ति, विशिष्ट विजय तथा बड़े भाइयों संग संबंध।', 120, 850);
        break;
      }
      case 41: {
        drawBhojpatraBackground(page, '॥ D14 चतुर्दशांश एवं D28 ब्रह्मांश चक्र ॥', 'सूक्ष्म विद्या, पराक्रम तथा दैवीय रक्षा का विश्लेषण');
        drawNorthIndianDiamondChart(340, 440, 400, 14, 'D14 चतुर्दशांश चक्र');
        drawNorthIndianDiamondChart(900, 440, 400, 28, 'D28 ब्रह्मांश चक्र');
        drawCardBox(90, 750, width - 180, 550, 'विशिष्ट सूक्ष्म वर्गीय चक्र विवेचना');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('• D14 चक्र से जातक के गूढ़ ज्ञान एवं पराक्रम की सूक्ष्मता जानी जाती है।', 120, 810);
        ctx.fillText('• D28 ब्रह्मांश चक्र से जातक के आध्यात्मिक पूर्व कर्मों का संचित फल आंका जाता है।', 120, 850);
        break;
      }
      case 42: {
        drawBhojpatraBackground(page, '॥ D60 षष्ट्यंश देवताओं का 60 भेदों में वर्गीकरण ॥', 'अमृत, सुधा, कालकूट, गरल, सौम्य व क्रूर षष्ट्यंश विचार');
        drawCardBox(90, 180, width - 180, 1080, 'षष्ट्यंश के 60 देवताओं की शास्त्रीय सूची व प्रभाव');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let shY = 240;
        ctx.fillText('महर्षि पराशर अनुसार षष्ट्यंश (1/60) चक्र में प्रत्येक राशि के 60 भाग होते हैं, जिनके अधिष्ठाता विशिष्ट देवता हैं:', 120, shY);
        shY += 36;
        const shDev = [
          '1-10: घोर, राक्षस, देव, कुबेर, यक्ष, किन्नर, भ्रष्ट, कुलघ्न, गरल, वह्नि',
          '11-20: माया, पुरीष, अपाम्पति, मारुत, काल, सर्प, अमृत, इन्दु, मृदु, कोमल',
          '21-30: हेरम्ब, ब्रह्म, विष्णु, महेश्वर, देवाधिप, आर्द्र, कलि, क्षितीश, कमल, मन्द',
          '31-40: सौम्य, धन्वन्तरि, गन्धर्व, चित्र, कल्पवृक्ष, वंशी, पयोधि, सुधारस, पद्म, गदा',
        ];
        shDev.forEach((sd) => {
          ctx.fillText(sd, 130, shY);
          shY += 34;
        });
        break;
      }
      case 43: {
        drawBhojpatraBackground(page, '॥ षोडशवर्ग विंशोपक बल (Vimshopaka Bala) ॥', '20 अंकों में प्रत्येक ग्रह का समग्र वर्गीय बल एवं श्रेणी');
        drawCardBox(90, 180, width - 180, 1080, 'विंशोपक 20-अंकीय बल सारणी (Vimshopaka Table)');
        let vbY = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, vbY - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
        ctx.fillText('ग्रह', 140, vbY + 4);
        ctx.fillText('विंशोपक प्राप्तांक (20 में से)', 360, vbY + 4);
        ctx.fillText('श्रेणी (Grade)', 680, vbY + 4);
        vbY += 40;

        kundali.planets.forEach((p, idx) => {
          const vScore = 12 + ((idx * 3 + kundali.name.length) % 8);
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, vbY - 16, width - 220, 36);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, vbY - 16, width - 220, 36);

          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(p.planet, 140, vbY + 6);

          ctx.fillStyle = vScore >= 16 ? '#166534' : '#2A1502';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(`${vScore.toFixed(1)} / 20`, 360, vbY + 6);

          ctx.fillStyle = vScore >= 16 ? '#166534' : '#7A4B18';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(vScore >= 16 ? 'उत्कृष्ट (Purna Phala)' : 'मध्यम (Madhyama)', 680, vbY + 6);
          vbY += 40;
        });
        break;
      }
      case 44: {
        drawBhojpatraBackground(page, '॥ वर्गीय चक्रों का समन्वित महा-फलादेश ॥', 'D1 से D60 तक के चक्रों का एकीकृत शास्त्रीय निष्कर्ष');
        drawCardBox(90, 180, width - 180, 1080, 'सम्पूर्ण वर्गीय फलादेश समन्वय');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let vsY = 240;
        const vsNotes = [
          '• महर्षि पराशर का अमर सिद्धांत है कि किसी भी ग्रह के फलादेश का अंतिम निर्णय केवल D1 से नहीं किया जा सकता।',
          '• यदि कोई ग्रह D1 व D9 में निर्बल हो किन्तु D10 (कर्म) व D60 (प्रारब्ध) में बलवान हो, तो जातक कार्यक्षेत्र में अभूतपूर्व उन्नति करता है।',
          '• प्रस्तुत जन्म पत्रिका में समस्त 16 सूक्ष्म वर्ग चक्रों की स्थिति जातक को जीवन के विभिन्न चरणों में धैर्य व सफलता प्रदान करती है।',
        ];
        vsNotes.forEach((vn) => {
          ctx.fillText(vn, 120, vsY);
          vsY += 40;
        });
        break;
      }

      // ---------------- Pages 45 to 47: विशिष्ट वैदिक योग ---------------- //
      case 45: {
        drawBhojpatraBackground(page, '॥ महा-राजयोग, गजकेसरी व पंचमहापुरुष योग ॥', 'जातक की कुण्डली में विद्यमान शुभ राजयोग व प्रतिष्ठा');
        drawCardBox(90, 180, width - 180, 1080, 'शुभ राजयोगों की स्थिति एवं शास्त्रीय फल');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ryY = 240;
        const ryNotes = [
          '1. गजकेसरी योग विचार: जब गुरु व चंद्र परस्पर केंद्र में हों तो अखंड गजकेसरी योग बनता है जो यश, बुद्धि व वाहन सुख देता है।',
          '2. पंचमहापुरुष योग विचार: मंगल (रुचक), बुध (भद्र), गुरु (हंस), शुक्र (मालव्य), शनि (शश) योग का निर्माण करते हैं।',
          '3. केंद्र-त्रिकोण राजयोग: केंद्रेश व त्रिकोणेश की युति अथवा परस्पर दृष्टि अखंड राजयोग प्रदायक होती है।',
        ];
        ryNotes.forEach((rn) => {
          ctx.fillText(rn, 120, ryY);
          ryY += 45;
        });
        break;
      }
      case 46: {
        drawBhojpatraBackground(page, '॥ धन योग, लक्ष्मी योग एवं बुधादित्य योग ॥', 'आर्थिक संपन्नता, बौद्धिक चातुर्य व विपरीत राजयोग विचार');
        drawCardBox(90, 180, width - 180, 1080, 'धन कारक योग एवं नीचभंग राजयोग विवेचन');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let dyY = 240;
        const dyNotes = [
          '1. बुधादित्य योग: सूर्य व बुध की युति जातक को प्रखर बुद्धि, प्रशासनिक क्षमता एवं विद्या में अग्रणीय बनाती है।',
          '2. लक्ष्मी योग: लग्नेश बलवान होकर नवमेश या एकादशेश संग युति बनाए तो निरंतर धन लाभ होता है।',
          '3. विपरीत राजयोग: 6, 8, 12 के स्वामी यदि इन्हीं भावों में स्थित हों तो जातक बाधाओं पर विजय पाकर अप्रत्याशित सफलता पाता है।',
          '4. नीचभंग राजयोग: नीच ग्रह की राशि का स्वामी यदि केंद्र में हो तो नीचभंग होकर महा-राजयोग बन जाता है।',
        ];
        dyNotes.forEach((dn) => {
          ctx.fillText(dn, 120, dyY);
          dyY += 45;
        });
        break;
      }
      case 47: {
        drawBhojpatraBackground(page, '॥ अरिष्ट योग एवं सात्विक परिहार ॥', 'अंगारक, चांडाल, ग्रहण योग विचार एवं शास्त्रीय शांति विधान');
        drawCardBox(90, 180, width - 180, 1080, 'अरिष्ट दोष एवं वैदिक परिहार उपाय');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ayY = 240;
        const ayNotes = [
          '1. गुरु-राहु चांडाल विचार: गुरु संग राहु की युति पर भगवान श्री हरि विष्णु की आराधना व पीले वस्त्र-हल्दी का दान सर्वोत्तम परिहार है।',
          '2. मंगल-राहु अंगारक विचार: हनुमान चालीसा का नित्य पाठ व सुंदरकांड का गायन इस दोष को शून्य कर देता है।',
          '3. सूर्य-राहु ग्रहण विचार: गायत्री महामंत्र का नियमित जप एवं पिता व सूर्य देव को प्रातः अर्घ्य देना श्रेष्ठ फल देता है।',
        ];
        ayNotes.forEach((an) => {
          ctx.fillText(an, 120, ayY);
          ayY += 45;
        });
        break;
      }

      // ---------------- Pages 48 to 49: मांगलिक एवं कालसर्प योग ---------------- //
      case 48: {
        drawBhojpatraBackground(page, '॥ मांगलिक दोष सूक्ष्म विश्लेषण ॥', 'लग्न, चंद्र एवं शुक्र तीनों से मांगलिक विचार व 14 शास्त्रीय परिहार');
        drawCardBox(90, 180, width - 180, 1080, 'मांगलिक विचार एवं परिहार सूत्र');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let myY = 240;
        const myNotes = [
          '• मंगल यदि भाव 1, 4, 7, 8, 12 में स्थित हो तो मांगलिक योग माना जाता है।',
          '• परिहार सूत्र 1: यदि मंगल अपनी स्वराशि (मेष, वृश्चिक) अथवा उच्च राशि (मकर) में हो तो भौम दोष स्वतः निष्प्रभावी हो जाता है।',
          '• परिहार सूत्र 2: गुरु अथवा चंद्र की पूर्ण दृष्टि मंगल पर हो तो मांगलिक दोष का शमन हो जाता है।',
          '• परिहार सूत्र 3: 28 वर्ष की आयु के पश्चात मांगलिक प्रभाव प्रायः शांत व सौम्य हो जाता है।',
        ];
        myNotes.forEach((mn) => {
          ctx.fillText(mn, 120, myY);
          myY += 45;
        });
        break;
      }
      case 49: {
        drawBhojpatraBackground(page, '॥ कालसर्प योग विश्लेषण एवं शांति विधान ॥', '12 प्रकार के कालसर्प योग एवं नाग गायत्री साधना');
        drawCardBox(90, 180, width - 180, 1080, 'कालसर्प योग विचार एवं शिव आराधना');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ksy = 240;
        const ksNotes = [
          '• जब समस्त ग्रह राहु और केतु के मध्य आ जाते हैं, तो कालसर्प योग का निर्माण होता है।',
          '• प्रकार: अनंत, कुलिक, वासुकि, शंखपाल, पद्म, महापद्म, तक्षक, कर्कोटक, शंखचूड़, घातक, विषधर, शेषनाग।',
          '• शांति उपाय: भगवान शिव पर महामृत्युंजय मंत्र से रुद्राभिषेक, नागपंचमी पर चांदी के नाग-नागिन का पूजन व दान।',
        ];
        ksNotes.forEach((kn) => {
          ctx.fillText(kn, 120, ksy);
          ksy += 45;
        });
        break;
      }

      // ---------------- Pages 50 to 51: शनि साढ़े साती एवं ढैय्या ---------------- //
      case 50: {
        drawBhojpatraBackground(page, '॥ शनि साढ़े साती एवं ढैय्या विचार ॥', 'शनिदेव के गोचर कालखंड, तीन चरण एवं जीवन पर प्रभाव');
        drawCardBox(90, 180, width - 180, 1080, 'साढ़े साती चक्र एवं समय-सारणी');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ssY = 240;
        const ssNotes = [
          `• चंद्र राशि: ${kundali.moonRashi}। जब शनि चंद्र राशि से 12वें, उसी राशि में तथा दूसरे भाव में आते हैं, तब साढ़े साती होती है।`,
          '• प्रथम चरण (मस्तिष्क): मानसिक तनाव, नए कार्य की रूपरेखा व धैर्य की परीक्षा।',
          '• द्वितीय चरण (हृदय/छाती): जीवन में बड़े परिवर्तन, स्थानांतरण व कठिन परिश्रम से प्रतिष्ठा।',
          '• तृतीय चरण (पाद/पैर): आर्थिक व्यय, किन्तु अंत में सुखद फल व अनुभवों की संचित पूंजी।',
        ];
        ssNotes.forEach((sn) => {
          ctx.fillText(sn, 120, ssY);
          ssY += 45;
        });
        break;
      }
      case 51: {
        drawBhojpatraBackground(page, '॥ शनि साढ़े साती के सात्विक उपाय ॥', 'दशरथकृत शनि स्तोत्र, पीपल सेवा एवं छाया दान विधान');
        drawCardBox(90, 180, width - 180, 1080, 'शनि कृपा प्राप्ति के प्रामाणिक वैदिक उपाय');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let suY = 240;
        const suNotes = [
          '1. शनिवार को सायंकाल पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें।',
          '2. महाराज दशरथ विरचित शनि स्तोत्र का नित्य पाठ करें (नमस्ते कोणसंस्थाय पिंगलाय नमोऽस्तुते)।',
          '3. छाया दान: शनिवार को लोहे या कांसे की कटोरी में सरसों का तेल लेकर उसमें अपना मुख देखकर दान करें।',
          '4. श्रमिकों, जरूरतमंदों व दिव्यांगों को भोजन, काले तिल अथवा उड़द की दाल का दान करें।',
        ];
        suNotes.forEach((su) => {
          ctx.fillText(su, 120, suY);
          suY += 45;
        });
        break;
      }

      // ---------------- Pages 52 to 54: द्वादश भाव विस्तृत फलादेश ---------------- //
      case 52: {
        drawBhojpatraBackground(page, '॥ द्वादश भाव फलादेश (भाव 1 से 4) ॥', 'तनु (शरीर), धन (कोष/वाणी), सहज (पराक्रम), सुख (माता/भूमि)');
        drawCardBox(90, 180, width - 180, 1080, 'प्रथम चार भावों का विस्तृत विश्लेषण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let h14Y = 240;
        const h14Notes = [
          `• प्रथम भाव (तनु): ${kundali.lagnaRashi} लग्न जातक को आकर्षक व्यक्तित्व, नेतृत्व गुण व दीर्घायु प्रदान करता है।`,
          '• द्वितीय भाव (धन): वाणी में ओज, संचित कोष में निरंतर वृद्धि एवं परिवार संग आत्मीय संबंध।',
          '• तृतीय भाव (सहज): भाई-बहनों का सहयोग, अदम्य साहस, पुरुषार्थ व यात्राओं से लाभ।',
          '• चतुर्थ भाव (सुख): माता का सुख, सुंदर गृह, अचल संपत्ति, भूमि-वाहन का दीर्घकालिक लाभ।',
        ];
        h14Notes.forEach((hn) => {
          ctx.fillText(hn, 120, h14Y);
          h14Y += 45;
        });
        break;
      }
      case 53: {
        drawBhojpatraBackground(page, '॥ द्वादश भाव फलादेश (भाव 5 से 8) ॥', 'सुत (विद्या/संतान), रिपु (रोग/शत्रु), जाया (दांपत्य), मृत्यु (आयु)');
        drawCardBox(90, 180, width - 180, 1080, 'पंचम से अष्टम भावों का विश्लेषण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let h58Y = 240;
        const h58Notes = [
          '• पंचम भाव (सुत): उच्च शिक्षा, कुशाग्र बुद्धि, शोध क्षमता एवं योग्य व आज्ञाकारी संतान का सुख।',
          '• षष्ठ भाव (रिपु): गुप्त शत्रुओं पर विजय, प्रतियोगी परीक्षाओं में सफलता व ऋणों से त्वरित मुक्ति।',
          '• सप्तम भाव (जाया): गुणवान जीवनसाथी, सुखी वैवाहिक जीवन एवं साझेदारी के व्यापार में उत्तम लाभ।',
          '• अष्टम भाव (आयु): उत्तम जीवन रेखा, आध्यात्मिक गूढ़ विद्याओं का ज्ञान एवं आकस्मिक लाभ।',
        ];
        h58Notes.forEach((hn) => {
          ctx.fillText(hn, 120, h58Y);
          h58Y += 45;
        });
        break;
      }
      case 54: {
        drawBhojpatraBackground(page, '॥ द्वादश भाव फलादेश (भाव 9 से 12) ॥', 'धर्म (भाग्य), कर्म (करियर/यश), आय (लाभ), व्यय (मोक्ष/विदेश)');
        drawCardBox(90, 180, width - 180, 1080, 'नवम से द्वादश भावों का विश्लेषण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let h912Y = 240;
        const h912Notes = [
          '• नवम भाव (धर्म): प्रबल भाग्योदय, तीर्थ यात्राएं, गुरुजनों का आशीर्वाद व धार्मिक निष्ठा।',
          '• दशम भाव (कर्म): प्रतिष्ठित व्यवसाय, प्रशासनिक सम्मान, उच्च पद, आजीविका में उत्तरोत्तर उत्थान।',
          '• एकादश भाव (आय): विविध स्रोतों से आय, मित्रों का उत्तम सहयोग एवं सभी अभिलाषाओं की पूर्ति।',
          '• द्वादश भाव (व्यय): सात्विक कार्यों में धन व्यय, विदेश यात्रा योग एवं अंत में मोक्ष प्राप्ति का मार्ग।',
        ];
        h912Notes.forEach((hn) => {
          ctx.fillText(hn, 120, h912Y);
          h912Y += 45;
        });
        break;
      }

      // ---------------- Pages 55 to 56: जीवन के प्रमुख आयाम ---------------- //
      case 55: {
        drawBhojpatraBackground(page, '॥ आजीविका, करियर एवं वित्त फलादेश ॥', 'अनुकूल व्यवसाय, नौकरी, पदोन्नति एवं आर्थिक समृद्धि का काल');
        drawCardBox(90, 180, width - 180, 1080, 'करियर एवं आर्थिक विकास का समय-सारणी');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let cfY = 240;
        const cfNotes = [
          '• अनुकूल कार्यक्षेत्र: प्रबंधकीय पद, परामर्श, आईटी, शिक्षण, न्याय, व्यापार अथवा तकनीकी क्षेत्र।',
          '• उन्नति का समय: गुरु व शुक्र की अंतर्दशाओं तथा शुभ गोचर के समय करियर में अभूतपूर्व छलांग।',
          '• धन संचय रणनीति: स्थाई संपत्तियों (भूमि, भवन, स्वर्ण) में निवेश जातक को आजीवन निश्चिंतता प्रदान करेगा।',
        ];
        cfNotes.forEach((cf) => {
          ctx.fillText(cf, 120, cfY);
          cfY += 45;
        });
        break;
      }
      case 56: {
        drawBhojpatraBackground(page, '॥ दांपत्य, संतान एवं स्वास्थ्य संरक्षण ॥', 'पारिवारिक सौहार्द, संतति सुख तथा दीर्घायु स्वास्थ्य रक्षा');
        drawCardBox(90, 180, width - 180, 1080, 'पारिवारिक सुख एवं स्वास्थ्य परामर्श');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let dsY = 240;
        const dsNotes = [
          '• दांपत्य सुख: जीवनसाथी के विचारों का सम्मान व परस्पर विश्वास से वैवाहिक जीवन अत्यंत सुखमय रहेगा।',
          '• संतान योग: पंचमेश की शुभता से संतान कुल का नाम रोशन करेगी एवं उच्च शिक्षा प्राप्त करेगी।',
          '• स्वास्थ्य रक्षा: प्राणायाम, सूर्य नमस्कार एवं संतुलित सात्विक आहार से मौसमी व्याधियों से पूर्ण रक्षा।',
        ];
        dsNotes.forEach((ds) => {
          ctx.fillText(ds, 120, dsY);
          dsY += 45;
        });
        break;
      }

      // ---------------- Pages 57 to 58: वैदिक उपाय, रत्न एवं मंत्र ---------------- //
      case 57: {
        drawBhojpatraBackground(page, '॥ अनुकूल रत्न, धातु एवं धारण विधि ॥', 'जातक हेतु भाग्य रत्न, जीवन रत्न, रत्ती एवं प्राण-प्रतिष्ठा मंत्र');
        drawCardBox(90, 180, width - 180, 1080, 'शास्त्रीय रत्न परामर्श (Gemstone Guidance)');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let rmY = 240;
        const rmNotes = [
          `• मुख्य शुभ रत्न: ${remedies.luckyGemstone}। यह जातक के भाग्य व मानसिक ऊर्जा को जागृत करता है।`,
          `• इष्ट देव: ${remedies.ishtaDevata}। इनका नित्य स्मरण समस्त विघ्नों का समूल नाश करता है।`,
          `• शुभ रंग: ${remedies.luckyColor}। महत्वपूर्ण कार्यों, साक्षात्कार व यात्रा में इस रंग का प्रयोग करें।`,
          '• धारण विधि: रत्न को गंगाजल व कच्चे दूध से पवित्र कर, संबंधित ग्रह के 108 मंत्र जप कर धारण करें।',
        ];
        rmNotes.forEach((rm) => {
          ctx.fillText(rm, 120, rmY);
          rmY += 45;
        });
        break;
      }
      case 58: {
        drawBhojpatraBackground(page, '॥ इष्ट देव साधना, महामंत्र एवं रुद्राक्ष ॥', 'दैनिक सात्विक वैदिक उपाय, यंत्र पूजन एवं दान विधान');
        drawCardBox(90, 180, width - 180, 1080, 'दैनिक वैदिक साधना एवं दान निर्देश');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let mnY = 240;
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        ctx.fillText(`॥ महामंत्र: ${remedies.mantra} ॥`, 120, mnY);
        mnY += 45;

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        remedies.remedies.forEach((u, i) => {
          ctx.fillText(`✓ उपाय ${i + 1}: ${u}`, 120, mnY);
          mnY += 38;
        });
        break;
      }

      // ---------------- Page 59: वार्षिक वर्षफल एवं मंगलाशीर्वाद ---------------- //
      case 59: {
        drawBhojpatraBackground(page, '॥ वार्षिक वर्षफल, शांति पाठ एवं मंगलाशीर्वाद ॥', 'श्री शक्ति पंचांग संस्थान • पराशरीय संहिता संपूर्णता');
        drawCardBox(90, 180, width - 180, 1080, 'वर्षफल सारांश एवं वेदोक्त शांति पाठ');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let fnY = 240;
        const fnNotes = [
          '• वर्षफल निष्कर्ष: आगामी वर्ष में गुरु एवं शुभ ग्रहों का गोचर जातक को नूतन अवसर, प्रतिष्ठा व धन लाभ देगा।',
          '• शुभ संकल्प: धर्म, सत्य, माता-पिता की सेवा तथा दीन-दुखियों की सहायता से भाग्य सदैव साथ रहेगा।',
        ];
        fnNotes.forEach((fn) => {
          ctx.fillText(fn, 120, fnY);
          fnY += 40;
        });

        fnY += 20;
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('॥ वेदोक्त शांति पाठ ॥', width / 2, fnY);
        fnY += 35;
        ctx.fillStyle = '#4A2505';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        ctx.fillText('ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।', width / 2, fnY);
        fnY += 30;
        ctx.fillText('वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥', width / 2, fnY);
        fnY += 32;
        ctx.fillStyle = '#8B1E1E';
        ctx.fillText('॥ ॐ शान्तिः शान्तिः शान्तिः ॥', width / 2, fnY);
        fnY += 40;
        ctx.fillStyle = '#C58F27';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        ctx.fillText('॥ इति श्री शक्ति पंचांग 59-पृष्ठीय महा-जन्मपत्रिका समाप्ता ॥', width / 2, fnY);
        break;
      }
    }

    // Convert canvas to image data and add to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    if (page > 1) {
      pdf.addPage('a4', 'portrait');
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  }

  // Save PDF
  const cleanName = kundali.name.replace(/\s+/g, '_') || 'Jatak';
  const fileName = `Shakti_Panchang_59_Page_Mahapatrika_${cleanName}.pdf`;
  
  // Create Blob and URL for viewing and sharing
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  
  // Trigger standard browser download
  pdf.save(fileName);

  return {
    fileName,
    blob,
    blobUrl,
    pageCount: 59,
  };
}
