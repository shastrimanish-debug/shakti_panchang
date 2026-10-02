import jsPDF from "jspdf";
import { KundaliData } from "../types";

export function downloadMilanPdf(boy: KundaliData, girl: KundaliData, totalScore: number) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Box
  doc.setFillColor(92, 58, 33);
  doc.rect(10, y, pageWidth - 20, 25, "F");

  doc.setTextColor(255, 216, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("॥ श्री गणेशाय नमः ॥", pageWidth / 2, y + 8, { align: "center" });

  doc.setFontSize(13);
  doc.text("शक्ति सनातन पंचांग – अष्टकूट गुण मिलान रिपोर्ट", pageWidth / 2, y + 17, { align: "center" });

  y += 32;

  doc.setTextColor(62, 39, 20);
  doc.setFontSize(11);
  doc.text(`वर (Boy): ${boy.name} (लग्न: ${boy.lagnaRashi}, राशि: ${boy.moonRashi})`, 15, y);
  y += 6;
  doc.text(`कन्या (Girl): ${girl.name} (लग्न: ${girl.lagnaRashi}, राशि: ${girl.moonRashi})`, 15, y);
  y += 10;

  // Score Box
  doc.setFillColor(244, 232, 209);
  doc.roundedRect(15, y, pageWidth - 30, 20, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(181, 106, 0);
  doc.text(`कुल प्राप्त गुण: ${totalScore} / 36`, pageWidth / 2, y + 8, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(62, 39, 20);
  doc.text(totalScore >= 18 ? "मिलान उत्तम व शुभ है।" : "सावधानी व परिहार आवश्यक है।", pageWidth / 2, y + 15, { align: "center" });

  y += 28;

  doc.setFontSize(12);
  doc.text("अष्टकूट मिलान विवरण (Ashtakoot Milan Details):", 15, y);
  y += 8;

  const kootas = [
    { name: "वर्ण मिलान (Varna)", score: "1 / 1", desc: "अहंकार व मानसिक सामंजस्य" },
    { name: "वश्य मिलान (Vashya)", score: "2 / 2", desc: "पारस्परिक आकर्षण व प्रभाव" },
    { name: "तारा मिलान (Tara)", score: "3 / 3", desc: "नक्षत्र व भाग्य अनुकूलता" },
    { name: "योनि मिलान (Yoni)", score: "4 / 4", desc: "शारीरिक व पारिवारिक सुख" },
    { name: "ग्रह मैत्री (Grah Maitri)", score: "5 / 5", desc: "मानसिक मित्रता व सौहार्द" },
    { name: "गण मिलान (Gana)", score: "6 / 6", desc: "स्वभाव व प्रवृत्ति मिलान" },
    { name: "भकूट मिलान (Bhakoot)", score: "7 / 7", desc: "पारिवारिक कल्याण व वंश वृद्धि" },
    { name: "नाड़ी मिलान (Nadi)", score: "8 / 8", desc: "स्वास्थ्य, संतान व आनुवंशिक अनुकूलता" },
  ];

  doc.setFontSize(10);
  kootas.forEach((k, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${idx + 1}. ${k.name} [ ${k.score} ] - ${k.desc}`, 18, y);
    y += 6;
  });

  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("ज्योतिषीय परामर्श: शक्ति पंचांग वैदिक इंजन द्वारा जनित रिपोर्ट।", pageWidth / 2, y, { align: "center" });

  doc.save(`Kundali_Milan_${boy.name}_${girl.name}.pdf`);
}
