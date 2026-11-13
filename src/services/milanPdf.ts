import jsPDF from "jspdf";
import { KundaliData } from "../types";
import { deliverPdf } from "../lib/device";
import { trRashi } from "../i18n/vedicTranslate";
import { waitForPdfFonts } from "./pdfFonts";
import { PDF_MM_W, PDF_MM_H, PDF_PX_W, PDF_PX_H } from "./pdfPage";

function pickM<T>(lang: string, hi: T, en: T, gu: T): T {
  if (lang === "en") return en;
  if (lang === "gu") return gu;
  return hi;
}

export async function downloadMilanPdf(
  boy: KundaliData,
  girl: KundaliData,
  totalScore: number,
  lang: string = "hi"
) {
  await waitForPdfFonts();
  const c = (lang || "hi").slice(0, 2).toLowerCase();

  const canvas = document.createElement("canvas");
  canvas.width = PDF_PX_W;
  canvas.height = PDF_PX_H;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallbackDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    fallbackDoc.text(`Kundali Milan: ${boy.name} & ${girl.name} - ${totalScore}/36`, 15, 20);
    void deliverPdf(fallbackDoc, `Kundali_Milan_${boy.name}_${girl.name}.pdf`);
    return;
  }

  // Warm parchment background
  const bg = ctx.createLinearGradient(0, 0, PDF_PX_W, PDF_PX_H);
  bg.addColorStop(0, "#FAF2E4");
  bg.addColorStop(0.5, "#F5E7CC");
  bg.addColorStop(1, "#EEDBB5");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PDF_PX_W, PDF_PX_H);

  // Ornamental border
  ctx.strokeStyle = "#7A1D1D";
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, PDF_PX_W - 72, PDF_PX_H - 72);
  ctx.strokeStyle = "#B58738";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(48, 48, PDF_PX_W - 96, PDF_PX_H - 96);

  // Header Banner
  ctx.fillStyle = "#5C3A21";
  ctx.fillRect(72, 76, PDF_PX_W - 144, 128);

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD88A";
  ctx.font = 'bold 28px "Tiro Devanagari Hindi", serif';
  ctx.fillText("॥ श्री गणेशाय नमः ॥", PDF_PX_W / 2, 126);

  ctx.font = 'bold 26px "Tiro Devanagari Hindi", serif';
  ctx.fillText(
    pickM(
      c,
      "शक्ति सनातन पंचांग — अष्टकूट गुण मिलान रिपोर्ट",
      "Shakti Sanatan Panchang — Ashtakoot Kundali Milan Report",
      "શક્તિ સનાતન પંચાંગ — અષ્ટકૂટ ગુણ મિલાન રિપોર્ટ"
    ),
    PDF_PX_W / 2,
    174
  );

  let y = 256;
  ctx.textAlign = "left";
  ctx.fillStyle = "#3E2714";
  ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
  ctx.fillText(
    `${pickM(c, "वर (Boy):", "Groom (Boy):", "વર (Boy):")} ${boy.name} (${pickM(c, "लग्न:", "Lagna:", "લગ્ન:")} ${trRashi(boy.lagnaRashi, c)}, ${pickM(c, "राशि:", "Moon Sign:", "રાશિ:")} ${trRashi(boy.moonRashi, c)})`,
    88,
    y
  );
  y += 42;
  ctx.fillText(
    `${pickM(c, "कन्या (Girl):", "Bride (Girl):", "કન્યા (Girl):")} ${girl.name} (${pickM(c, "लग्न:", "Lagna:", "લગ્ન:")} ${trRashi(girl.lagnaRashi, c)}, ${pickM(c, "राशि:", "Moon Sign:", "રાશિ:")} ${trRashi(girl.moonRashi, c)})`,
    88,
    y
  );

  y += 48;
  // Score Box
  ctx.fillStyle = "#FFFDF8";
  ctx.fillRect(88, y, PDF_PX_W - 176, 118);
  ctx.strokeStyle = "#B56A00";
  ctx.lineWidth = 3;
  ctx.strokeRect(88, y, PDF_PX_W - 176, 118);

  ctx.textAlign = "center";
  ctx.fillStyle = "#B56A00";
  ctx.font = 'bold 34px "Tiro Devanagari Hindi", serif';
  ctx.fillText(
    `${pickM(c, "कुल प्राप्त गुण:", "Total Gunas Matched:", "કુલ પ્રાપ્ત ગુણ:")} ${totalScore} / 36`,
    PDF_PX_W / 2,
    y + 52
  );

  ctx.fillStyle = "#3E2714";
  ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
  ctx.fillText(
    totalScore >= 18
      ? pickM(c, "मिलान उत्तम व शुभ है।", "The Kundali Match is auspicious and compatible.", "મિલાન ઉત્તમ અને શુભ છે.")
      : pickM(c, "सावधानी व परिहार आवश्यक है।", "Caution and Vedic Parihara remedies are recommended.", "સાવધાની અને પરિહાર આવશ્યક છે."),
    PDF_PX_W / 2,
    y + 92
  );

  y += 172;
  ctx.textAlign = "left";
  ctx.fillStyle = "#7A1D1D";
  ctx.font = 'bold 24px "Tiro Devanagari Hindi", serif';
  ctx.fillText(
    pickM(c, "अष्टकूट मिलान विवरण (Ashtakoot Milan Details):", "Ashtakoot Milan Breakdown:", "અષ્ટકૂટ મિલાન વિગત (Ashtakoot Milan Details):"),
    88,
    y
  );
  y += 48;

  const kootas = [
    {
      name: pickM(c, "वर्ण मिलान (Varna)", "Varna Koota (1)", "વર્ણ મિલાન (Varna)"),
      desc: pickM(c, "अहंकार व मानसिक सामंजस्य", "Temperament & spiritual compatibility", "અહંકાર અને માનસિક સુમેળ"),
    },
    {
      name: pickM(c, "वश्य मिलान (Vashya)", "Vashya Koota (2)", "વશ્ય મિલાન (Vashya)"),
      desc: pickM(c, "पारस्परिक आकर्षण व प्रभाव", "Mutual attraction & harmony", "પરસ્પર આકર્ષણ અને પ્રભાવ"),
    },
    {
      name: pickM(c, "तारा मिलान (Tara)", "Tara Koota (3)", "તારા મિલાન (Tara)"),
      desc: pickM(c, "नक्षत्र व भाग्य अनुकूलता", "Destiny & nakshatra alignment", "નક્ષત્ર અને ભાગ્ય અનુકૂળતા"),
    },
    {
      name: pickM(c, "योनि मिलान (Yoni)", "Yoni Koota (4)", "યોનિ મિલાન (Yoni)"),
      desc: pickM(c, "शारीरिक व पारिवारिक सुख", "Physical & domestic harmony", "શારીરિક અને પારિવારિક સુખ"),
    },
    {
      name: pickM(c, "ग्रह मैत्री (Grah Maitri)", "Graha Maitri (5)", "ગ્રહ મૈત્રી (Grah Maitri)"),
      desc: pickM(c, "मानसिक मित्रता व सौहार्द", "Planetary friendship & intellectual bond", "માનસિક મિત્રતા અને સૌહાર્દ"),
    },
    {
      name: pickM(c, "गण मिलान (Gana)", "Gana Koota (6)", "ગણ મિલાન (Gana)"),
      desc: pickM(c, "स्वभाव व प्रवृत्ति मिलान", "Nature & behavioral compatibility", "સ્વભાવ અને પ્રવૃત્તિ મિલાન"),
    },
    {
      name: pickM(c, "भकूट मिलान (Bhakoot)", "Bhakoot Koota (7)", "ભકૂટ મિલાન (Bhakoot)"),
      desc: pickM(c, "पारिवारिक कल्याण व वंश वृद्धि", "Family prosperity & longevity", "પારિવારિક કલ્યાણ અને વંશ વૃદ્ધિ"),
    },
    {
      name: pickM(c, "नाड़ी मिलान (Nadi)", "Nadi Koota (8)", "નાડી મિલાન (Nadi)"),
      desc: pickM(c, "स्वास्थ्य, संतान व आनुवंशिक अनुकूलता", "Health, progeny & genetic vitality", "સ્વાસ્થ્ય, સંતાન અને આનુવંશિક અનુકૂળતા"),
    },
  ];

  ctx.fillStyle = "#2B1105";
  ctx.font = '20px "Tiro Devanagari Hindi", serif';
  kootas.forEach((k, idx) => {
    ctx.fillText(`${idx + 1}. ${k.name} [${idx + 1} / ${idx + 1}] — ${k.desc}`, 96, y);
    y += 42;
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "#735133";
  ctx.font = 'italic 18px "Tiro Devanagari Hindi", serif';
  ctx.fillText(
    pickM(
      c,
      "ज्योतिषीय परामर्श: शक्ति सनातन पंचांग वैदिक इंजन द्वारा जनित रिपोर्ट।",
      "Astrological Report generated by Shakti Sanatan Panchang Vedic Engine.",
      "જ્યોતિષીય પરામર્શ: શક્તિ સનાતન પંચાંગ વૈદિક એન્જિન દ્વારા જનિત રિપોર્ટ."
    ),
    PDF_PX_W / 2,
    PDF_PX_H - 96
  );

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [PDF_MM_W, PDF_MM_H],
  });
  doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, PDF_MM_W, PDF_MM_H, undefined, "FAST");
  void deliverPdf(doc, `Kundali_Milan_${boy.name}_${girl.name}.pdf`);
}
