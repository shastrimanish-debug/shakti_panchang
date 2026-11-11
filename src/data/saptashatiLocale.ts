import type { DurgaAnga, DurgaChapter } from './durgaSaptashatiData';

export type SaptChapterText = {
  title: string;
  heading: string;
  charitra: string;
  summary: string;
  phala: string;
  details: string[];
};

export type SaptAngaText = {
  name: string;
  desc: string;
  significance: string;
  verses: string[];
};

export type SaptContent = {
  chapters: Record<string, SaptChapterText>;
  angas: Record<string, SaptAngaText>;
};

export type SaptUi = {
  title: string;
  badge: string;
  subtitle: string;
  zoomOut: string;
  zoomIn: string;
  tabChapters: string;
  tabAngas: string;
  tabKunjika: string;
  tabAarti: string;
  chapter: (n: number) => string;
  versesMeta: string;
  stop: string;
  listen: string;
  fruit: string;
  summaryHead: string;
  path: (page: number, pages: number) => string;
  recitePage: string;
  angaNote: string;
  copy: string;
  prevVerses: string;
  nextVerses: string;
  range: (from: number, to: number, total: number) => string;
  points: string;
  prevChapter: string;
  nextChapter: string;
  chapterOf: (n: number, total: number) => string;
  significance: string;
  meaning: string;
  copied: string;
  shareTitle: string;
};

const UI: Record<string, SaptUi> = {
  hi: {
    title: 'श्री दुर्गा सप्तशती (चण्डी पाठ)',
    badge: 'मार्कण्डेय पुराण',
    subtitle: 'समस्त विपत्ति नाशक, विजय प्रदायक १३ अध्याय, कवच, अर्गला, कीलक व सिद्ध कुंजिका स्तोत्र',
    zoomOut: 'फ़ॉन्ट छोटा करें',
    zoomIn: 'फ़ॉन्ट बड़ा करें',
    tabChapters: '१३ सम्पूर्ण अध्याय',
    tabAngas: 'कवच, अर्गला व कीलक',
    tabKunjika: 'सिद्ध कुंजिका स्तोत्र',
    tabAarti: 'माँ अम्बे आरती',
    chapter: (n) => `अध्याय ${n}`,
    versesMeta: 'श्लोक • संपूर्ण पाठ',
    stop: 'रोकें',
    listen: 'पाठ सुनें',
    fruit: 'अध्याय पाठ का फल: ',
    summaryHead: 'अध्याय का सार संक्षेप',
    path: (p, n) => `संपूर्ण संस्कृत पाठ • पृष्ठ ${p}/${n}`,
    recitePage: 'यह पृष्ठ सुनाएँ',
    angaNote: 'कवच, अर्गला और कीलक अलग अंग हैं।',
    copy: 'प्रतिलिपि बनाएं',
    prevVerses: 'पिछले श्लोक',
    nextVerses: 'अगले श्लोक',
    range: (a, b, t) => `${t} में से ${a}–${b}`,
    points: 'अध्याय की विस्तृत कथा बिंदु',
    prevChapter: 'पिछला अध्याय',
    nextChapter: 'अगला अध्याय',
    chapterOf: (n, t) => `अध्याय ${n} / ${t}`,
    significance: 'माहात्म्य व फल: ',
    meaning: 'अर्थ: ',
    copied: 'श्लोक प्रतिलिपि हो गया!',
    shareTitle: 'श्री दुर्गा सप्तशती',
  },
  en: {
    title: 'Shri Durga Saptashati (Chandi Path)',
    badge: 'Markandeya Purana',
    subtitle: 'Thirteen chapters that end calamity and grant victory, with Kavach, Argala, Kilaka and the Siddha Kunjika stotra',
    zoomOut: 'Smaller text',
    zoomIn: 'Larger text',
    tabChapters: '13 Complete Chapters',
    tabAngas: 'Kavach, Argala & Kilaka',
    tabKunjika: 'Siddha Kunjika Stotra',
    tabAarti: 'Maa Ambe Aarti',
    chapter: (n) => `Chapter ${n}`,
    versesMeta: 'Verses • full recitation',
    stop: 'Stop',
    listen: 'Listen',
    fruit: 'Fruit of this chapter: ',
    summaryHead: 'Chapter summary',
    path: (p, n) => `Complete Sanskrit text • page ${p}/${n}`,
    recitePage: 'Recite this page',
    angaNote: 'Kavach, Argala and Kilaka are separate preparatory parts.',
    copy: 'Copy',
    prevVerses: 'Previous verses',
    nextVerses: 'Next verses',
    range: (a, b, t) => `${a}–${b} of ${t}`,
    points: 'Key points of the story',
    prevChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    chapterOf: (n, t) => `Chapter ${n} of ${t}`,
    significance: 'Glory and fruit: ',
    meaning: 'Meaning: ',
    copied: 'Verse copied!',
    shareTitle: 'Shri Durga Saptashati',
  },
  gu: {
    title: 'શ્રી દુર્ગા સપ્તશતી (ચંડી પાઠ)',
    badge: 'માર્કંડેય પુરાણ',
    subtitle: 'વિપત્તિ હરનાર, વિજય આપનાર ૧૩ અધ્યાય, કવચ, અર્ગલા, કીલક અને સિદ્ધ કુંજિકા સ્તોત્ર',
    zoomOut: 'ફોન્ટ નાના કરો',
    zoomIn: 'ફોન્ટ મોટા કરો',
    tabChapters: '૧૩ સંપૂર્ણ અધ્યાય',
    tabAngas: 'કવચ, અર્ગલા અને કીલક',
    tabKunjika: 'સિદ્ધ કુંજિકા સ્તોત્ર',
    tabAarti: 'મા અંબે આરતી',
    chapter: (n) => `અધ્યાય ${n}`,
    versesMeta: 'શ્લોકો • સંપૂર્ણ પાઠ',
    stop: 'રોકો',
    listen: 'પાઠ સાંભળો',
    fruit: 'અધ્યાય પાઠનું ફળ: ',
    summaryHead: 'અધ્યાયનો સંક્ષિપ્ત સાર',
    path: (p, n) => `સંપૂર્ણ સંસ્કૃત પાઠ • પૃષ્ઠ ${p}/${n}`,
    recitePage: 'આ પૃષ્ઠ સાંભળો',
    angaNote: 'કવચ, અર્ગલા અને કીલક અલગ અંગો છે.',
    copy: 'કોપી કરો',
    prevVerses: 'પાછલા શ્લોકો',
    nextVerses: 'આગળના શ્લોકો',
    range: (a, b, t) => `${t} માંથી ${a}–${b}`,
    points: 'અધ્યાયના મુખ્ય કથા બિંદુઓ',
    prevChapter: 'પાછલો અધ્યાય',
    nextChapter: 'આગળનો અધ્યાય',
    chapterOf: (n, t) => `અધ્યાય ${n} / ${t}`,
    significance: 'મહાત્મ્ય અને ફળ: ',
    meaning: 'અર્થ: ',
    copied: 'શ્લોક કોપી થઈ ગયો!',
    shareTitle: 'શ્રી દુર્ગા સપ્તશતી',
  },
  mr: {
    title: 'श्री दुर्गासप्तशती (चंडी पाठ)',
    badge: 'मार्कंडेय पुराण',
    subtitle: 'आपत्ती दूर करणारे, विजय देणारे १३ अध्याय, कवच, अर्गला, कीलक आणि सिद्ध कुंजिका स्तोत्र',
    zoomOut: 'अक्षर छोटे करा',
    zoomIn: 'अक्षर मोठे करा',
    tabChapters: '१३ संपूर्ण अध्याय',
    tabAngas: 'कवच, अर्गला आणि कीलक',
    tabKunjika: 'सिद्ध कुंजिका स्तोत्र',
    tabAarti: 'आई अंबेची आरती',
    chapter: (n) => `अध्याय ${n}`,
    versesMeta: 'श्लोक • संपूर्ण पाठ',
    stop: 'थांबवा',
    listen: 'पाठ ऐका',
    fruit: 'अध्याय पाठाचे फळ: ',
    summaryHead: 'अध्यायाचा थोडक्यात अर्थ',
    path: (p, n) => `संपूर्ण संस्कृत पाठ • पान ${p}/${n}`,
    recitePage: 'हे पान ऐका',
    angaNote: 'कवच, अर्गला आणि कीलक ही स्वतंत्र अंगे आहेत.',
    copy: 'प्रत करा',
    prevVerses: 'मागील श्लोक',
    nextVerses: 'पुढील श्लोक',
    range: (a, b, t) => `${t} पैकी ${a}–${b}`,
    points: 'अध्यायातील मुख्य कथाबिंदू',
    prevChapter: 'मागील अध्याय',
    nextChapter: 'पुढील अध्याय',
    chapterOf: (n, t) => `अध्याय ${n} / ${t}`,
    significance: 'महिमा आणि फळ: ',
    meaning: 'अर्थ: ',
    copied: 'श्लोक कॉपी झाला!',
    shareTitle: 'श्री दुर्गासप्तशती',
  },
  bn: {
    title: 'শ্রী দুর্গা সপ্তশতী (চণ্ডীপাঠ)',
    badge: 'মার্কণ্ডেয় পুরাণ',
    subtitle: 'বিপদনাশক, জয়প্রদ ১৩টি অধ্যায়, কবচ, অর্গলা, কীলক ও সিদ্ধ কুঞ্জিকা স্তোত্র',
    zoomOut: 'ফন্ট ছোট করুন',
    zoomIn: 'ফন্ট বড় করুন',
    tabChapters: '১৩টি সম্পূর্ণ অধ্যায়',
    tabAngas: 'কবচ, অর্গলা ও কীলক',
    tabKunjika: 'সিদ্ধ কুঞ্জিকা স্তোত্র',
    tabAarti: 'মা অম্বের আরতি',
    chapter: (n) => `অধ্যায় ${n}`,
    versesMeta: 'শ্লোক • সম্পূর্ণ পাঠ',
    stop: 'থামান',
    listen: 'পাঠ শুনুন',
    fruit: 'অধ্যায় পাঠের ফল: ',
    summaryHead: 'অধ্যায়ের সংক্ষিপ্ত সার',
    path: (p, n) => `সম্পূর্ণ সংস্কৃত পাঠ • পৃষ্ঠা ${p}/${n}`,
    recitePage: 'এই পৃষ্ঠা শুনুন',
    angaNote: 'কবচ, অর্গলা ও কীলক আলাদা অঙ্গ।',
    copy: 'কপি করুন',
    prevVerses: 'আগের শ্লোক',
    nextVerses: 'পরের শ্লোক',
    range: (a, b, t) => `${t}-এর মধ্যে ${a}–${b}`,
    points: 'অধ্যায়ের মূল কথা',
    prevChapter: 'আগের অধ্যায়',
    nextChapter: 'পরের অধ্যায়',
    chapterOf: (n, t) => `অধ্যায় ${n} / ${t}`,
    significance: 'মাহাত্ম্য ও ফল: ',
    meaning: 'অর্থ: ',
    copied: 'শ্লোক কপি হয়েছে!',
    shareTitle: 'শ্রী দুর্গা সপ্তশতী',
  },
  ta: {
    title: 'ஸ்ரீ துர்கா சப்தசதி (சண்டி பாடம்)',
    badge: 'மார்கண்டேய புராணம்',
    subtitle: 'துன்பத்தை நீக்கும், வெற்றி தரும் 13 அத்தியாயங்கள், கவசம், அர்கலா, கீலகம், சித்த குஞ்சிகா ஸ்தோத்திரம்',
    zoomOut: 'எழுத்தைச் சிறிதாக்கு',
    zoomIn: 'எழுத்தைப் பெரிதாக்கு',
    tabChapters: '13 முழு அத்தியாயங்கள்',
    tabAngas: 'கவசம், அர்கலா, கீலகம்',
    tabKunjika: 'சித்த குஞ்சிகா ஸ்தோத்திரம்',
    tabAarti: 'அம்பா ஆரத்தி',
    chapter: (n) => `அத்தியாயம் ${n}`,
    versesMeta: 'சுலோகங்கள் • முழு பாடம்',
    stop: 'நிறுத்து',
    listen: 'பாடம் கேள்',
    fruit: 'அத்தியாயப் பலன்: ',
    summaryHead: 'அத்தியாயச் சுருக்கம்',
    path: (p, n) => `முழு சமஸ்கிருத பாடம் • பக்கம் ${p}/${n}`,
    recitePage: 'இந்தப் பக்கத்தைக் கேள்',
    angaNote: 'கவசம், அர்கலா, கீலகம் தனி உறுப்புகள்.',
    copy: 'நகலெடு',
    prevVerses: 'முந்தைய சுலோகங்கள்',
    nextVerses: 'அடுத்த சுலோகங்கள்',
    range: (a, b, t) => `${t}-ல் ${a}–${b}`,
    points: 'கதையின் முக்கிய புள்ளிகள்',
    prevChapter: 'முந்தைய அத்தியாயம்',
    nextChapter: 'அடுத்த அத்தியாயம்',
    chapterOf: (n, t) => `அத்தியாயம் ${n} / ${t}`,
    significance: 'மகிமையும் பலனும்: ',
    meaning: 'பொருள்: ',
    copied: 'சுலோகம் நகலெடுக்கப்பட்டது!',
    shareTitle: 'ஸ்ரீ துர்கா சப்தசதி',
  },
  te: {
    title: 'శ్రీ దుర్గా సప్తశతి (చండీ పాఠం)',
    badge: 'మార్కండేయ పురాణం',
    subtitle: 'ఆపదలు తొలగించే, విజయం ఇచ్చే 13 అధ్యాయాలు, కవచం, అర్గల, కీలకం, సిద్ధ కుంజికా స్తోత్రం',
    zoomOut: 'అక్షరం చిన్నది',
    zoomIn: 'అక్షరం పెద్దది',
    tabChapters: '13 పూర్తి అధ్యాయాలు',
    tabAngas: 'కవచం, అర్గల, కీలకం',
    tabKunjika: 'సిద్ధ కుంజికా స్తోత్రం',
    tabAarti: 'అమ్మ ఆరతి',
    chapter: (n) => `అధ్యాయం ${n}`,
    versesMeta: 'శ్లోకాలు • పూర్తి పాఠం',
    stop: 'ఆపు',
    listen: 'పాఠం వినండి',
    fruit: 'అధ్యాయ పాఠ ఫలం: ',
    summaryHead: 'అధ్యాయ సారాంశం',
    path: (p, n) => `పూర్తి సంస్కృత పాఠం • పుట ${p}/${n}`,
    recitePage: 'ఈ పుట వినండి',
    angaNote: 'కవచం, అర్గల, కీలకం వేరు అంగాలు.',
    copy: 'కాపీ',
    prevVerses: 'మునుపటి శ్లోకాలు',
    nextVerses: 'తరువాతి శ్లోకాలు',
    range: (a, b, t) => `${t}లో ${a}–${b}`,
    points: 'కథ ముఖ్యాంశాలు',
    prevChapter: 'మునుపటి అధ్యాయం',
    nextChapter: 'తరువాతి అధ్యాయం',
    chapterOf: (n, t) => `అధ్యాయం ${n} / ${t}`,
    significance: 'మహిమ మరియు ఫలం: ',
    meaning: 'అర్థం: ',
    copied: 'శ్లోకం కాపీ అయింది!',
    shareTitle: 'శ్రీ దుర్గా సప్తశతి',
  },
  kn: {
    title: 'ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತಿ (ಚಂಡಿ ಪಾಠ)',
    badge: 'ಮಾರ್ಕಂಡೇಯ ಪುರಾಣ',
    subtitle: 'ಆಪತ್ತು ನಿವಾರಿಸುವ, ವಿಜಯ ನೀಡುವ ೧೩ ಅಧ್ಯಾಯಗಳು, ಕವಚ, ಅರ್ಗಲಾ, ಕೀಲಕ ಮತ್ತು ಸಿದ್ಧ ಕುಂಜಿಕಾ ಸ್ತೋತ್ರ',
    zoomOut: 'ಅಕ್ಷರ ಚಿಕ್ಕದು',
    zoomIn: 'ಅಕ್ಷರ ದೊಡ್ಡದು',
    tabChapters: '೧೩ ಪೂರ್ಣ ಅಧ್ಯಾಯಗಳು',
    tabAngas: 'ಕವಚ, ಅರ್ಗಲಾ ಮತ್ತು ಕೀಲಕ',
    tabKunjika: 'ಸಿದ್ಧ ಕುಂಜಿಕಾ ಸ್ತೋತ್ರ',
    tabAarti: 'ಅಂಬೆ ಆರತಿ',
    chapter: (n) => `ಅಧ್ಯಾಯ ${n}`,
    versesMeta: 'ಶ್ಲೋಕಗಳು • ಪೂರ್ಣ ಪಾಠ',
    stop: 'ನಿಲ್ಲಿಸಿ',
    listen: 'ಪಾಠ ಕೇಳಿ',
    fruit: 'ಅಧ್ಯಾಯ ಪಾಠದ ಫಲ: ',
    summaryHead: 'ಅಧ್ಯಾಯದ ಸಾರಾಂಶ',
    path: (p, n) => `ಪೂರ್ಣ ಸಂಸ್ಕೃತ ಪಾಠ • ಪುಟ ${p}/${n}`,
    recitePage: 'ಈ ಪುಟ ಕೇಳಿ',
    angaNote: 'ಕವಚ, ಅರ್ಗಲಾ ಮತ್ತು ಕೀಲಕ ಬೇರೆ ಅಂಗಗಳು.',
    copy: 'ನಕಲು',
    prevVerses: 'ಹಿಂದಿನ ಶ್ಲೋಕಗಳು',
    nextVerses: 'ಮುಂದಿನ ಶ್ಲೋಕಗಳು',
    range: (a, b, t) => `${t}ರಲ್ಲಿ ${a}–${b}`,
    points: 'ಕಥೆಯ ಮುಖ್ಯ ಅಂಶಗಳು',
    prevChapter: 'ಹಿಂದಿನ ಅಧ್ಯಾಯ',
    nextChapter: 'ಮುಂದಿನ ಅಧ್ಯಾಯ',
    chapterOf: (n, t) => `ಅಧ್ಯಾಯ ${n} / ${t}`,
    significance: 'ಮಹಿಮೆ ಮತ್ತು ಫಲ: ',
    meaning: 'ಅರ್ಥ: ',
    copied: 'ಶ್ಲೋಕ ನಕಲಾಗಿದೆ!',
    shareTitle: 'ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತಿ',
  },
  ml: {
    title: 'ശ്രീ ദുർഗ്ഗാ സപ്തശതി (ചണ്ഡീപാഠം)',
    badge: 'മാർക്കണ്ഡേയ പുരാണം',
    subtitle: 'ആപത്തകറ്റുന്ന, വിജയം നൽകുന്ന 13 അധ്യായങ്ങൾ, കവചം, അർഗല, കീലകം, സിദ്ധ കുഞ്ജികാ സ്തോത്രം',
    zoomOut: 'അക്ഷരം ചെറുതാക്കുക',
    zoomIn: 'അക്ഷരം വലുതാക്കുക',
    tabChapters: '13 പൂർണ അധ്യായങ്ങൾ',
    tabAngas: 'കവചം, അർഗല, കീലകം',
    tabKunjika: 'സിദ്ധ കുഞ്ജികാ സ്തോത്രം',
    tabAarti: 'അമ്പ ആരതി',
    chapter: (n) => `അധ്യായം ${n}`,
    versesMeta: 'ശ്ലോകങ്ങൾ • പൂർണ പാഠം',
    stop: 'നിർത്തുക',
    listen: 'പാഠം കേൾക്കുക',
    fruit: 'അധ്യായപാഠത്തിന്റെ ഫലം: ',
    summaryHead: 'അധ്യായ സംഗ്രഹം',
    path: (p, n) => `പൂർണ സംസ്കൃത പാഠം • പേജ് ${p}/${n}`,
    recitePage: 'ഈ പേജ് കേൾക്കുക',
    angaNote: 'കവചം, അർഗല, കീലകം വേറിട്ട അംഗങ്ങളാണ്.',
    copy: 'പകർത്തുക',
    prevVerses: 'മുൻ ശ്ലോകങ്ങൾ',
    nextVerses: 'അടുത്ത ശ്ലോകങ്ങൾ',
    range: (a, b, t) => `${t}-ൽ ${a}–${b}`,
    points: 'കഥയുടെ പ്രധാന കാര്യങ്ങൾ',
    prevChapter: 'മുൻ അധ്യായം',
    nextChapter: 'അടുത്ത അധ്യായം',
    chapterOf: (n, t) => `അധ്യായം ${n} / ${t}`,
    significance: 'മാഹാത്മ്യവും ഫലവും: ',
    meaning: 'അർത്ഥം: ',
    copied: 'ശ്ലോകം പകർത്തി!',
    shareTitle: 'ശ്രീ ദുർഗ്ഗാ സപ്തശതി',
  },
  pa: {
    title: 'ਸ਼੍ਰੀ ਦੁਰਗਾ ਸਪਤਸ਼ਤੀ (ਚੰਡੀ ਪਾਠ)',
    badge: 'ਮਾਰਕੰਡੇਯ ਪੁਰਾਣ',
    subtitle: 'ਬਿਪਤਾ ਹਰਨ ਵਾਲੇ, ਜਿੱਤ ਦੇਣ ਵਾਲੇ 13 ਅਧਿਆਇ, ਕਵਚ, ਅਰਗਲਾ, ਕੀਲਕ ਅਤੇ ਸਿਧ ਕੁੰਜਿਕਾ ਸਤੋਤਰ',
    zoomOut: 'ਅੱਖਰ ਛੋਟਾ',
    zoomIn: 'ਅੱਖਰ ਵੱਡਾ',
    tabChapters: '13 ਪੂਰੇ ਅਧਿਆਇ',
    tabAngas: 'ਕਵਚ, ਅਰਗਲਾ ਅਤੇ ਕੀਲਕ',
    tabKunjika: 'ਸਿਧ ਕੁੰਜਿਕਾ ਸਤੋਤਰ',
    tabAarti: 'ਅੰਬੇ ਦੀ ਆਰਤੀ',
    chapter: (n) => `ਅਧਿਆਇ ${n}`,
    versesMeta: 'ਸ਼ਲੋਕ • ਪੂਰਾ ਪਾਠ',
    stop: 'ਰੋਕੋ',
    listen: 'ਪਾਠ ਸੁਣੋ',
    fruit: 'ਅਧਿਆਇ ਪਾਠ ਦਾ ਫਲ: ',
    summaryHead: 'ਅਧਿਆਇ ਦਾ ਸਾਰ',
    path: (p, n) => `ਪੂਰਾ ਸੰਸਕ੍ਰਿਤ ਪਾਠ • ਸਫ਼ਾ ${p}/${n}`,
    recitePage: 'ਇਹ ਸਫ਼ਾ ਸੁਣੋ',
    angaNote: 'ਕਵਚ, ਅਰਗਲਾ ਅਤੇ ਕੀਲਕ ਵੱਖਰੇ ਅੰਗ ਹਨ।',
    copy: 'ਕਾਪੀ',
    prevVerses: 'ਪਿਛਲੇ ਸ਼ਲੋਕ',
    nextVerses: 'ਅਗਲੇ ਸ਼ਲੋਕ',
    range: (a, b, t) => `${t} ਵਿੱਚੋਂ ${a}–${b}`,
    points: 'ਕਥਾ ਦੇ ਮੁੱਖ ਨੁਕਤੇ',
    prevChapter: 'ਪਿਛਲਾ ਅਧਿਆਇ',
    nextChapter: 'ਅਗਲਾ ਅਧਿਆਇ',
    chapterOf: (n, t) => `ਅਧਿਆਇ ${n} / ${t}`,
    significance: 'ਮਹਿਮਾ ਅਤੇ ਫਲ: ',
    meaning: 'ਅਰਥ: ',
    copied: 'ਸ਼ਲੋਕ ਕਾਪੀ ਹੋ ਗਿਆ!',
    shareTitle: 'ਸ਼੍ਰੀ ਦੁਰਗਾ ਸਪਤਸ਼ਤੀ',
  },
  or: {
    title: 'ଶ୍ରୀ ଦୁର୍ଗା ସପ୍ତଶତୀ (ଚଣ୍ଡୀ ପାଠ)',
    badge: 'ମାର୍କଣ୍ଡେୟ ପୁରାଣ',
    subtitle: 'ବିପଦ ହରଣକାରୀ, ବିଜୟଦାୟୀ ୧୩ ଅଧ୍ୟାୟ, କବଚ, ଅର୍ଗଳା, କୀଳକ ଓ ସିଦ୍ଧ କୁଞ୍ଜିକା ସ୍ତୋତ୍ର',
    zoomOut: 'ଅକ୍ଷର ଛୋଟ',
    zoomIn: 'ଅକ୍ଷର ବଡ଼',
    tabChapters: '୧୩ ସମ୍ପୂର୍ଣ୍ଣ ଅଧ୍ୟାୟ',
    tabAngas: 'କବଚ, ଅର୍ଗଳା ଓ କୀଳକ',
    tabKunjika: 'ସିଦ୍ଧ କୁଞ୍ଜିକା ସ୍ତୋତ୍ର',
    tabAarti: 'ଅମ୍ବେ ଆରତୀ',
    chapter: (n) => `ଅଧ୍ୟାୟ ${n}`,
    versesMeta: 'ଶ୍ଳୋକ • ସମ୍ପୂର୍ଣ୍ଣ ପାଠ',
    stop: 'ବନ୍ଦ',
    listen: 'ପାଠ ଶୁଣନ୍ତୁ',
    fruit: 'ଅଧ୍ୟାୟ ପାଠର ଫଳ: ',
    summaryHead: 'ଅଧ୍ୟାୟର ସାର',
    path: (p, n) => `ସମ୍ପୂର୍ଣ୍ଣ ସଂସ୍କୃତ ପାଠ • ପୃଷ୍ଠା ${p}/${n}`,
    recitePage: 'ଏହି ପୃଷ୍ଠା ଶୁଣନ୍ତୁ',
    angaNote: 'କବଚ, ଅର୍ଗଳା ଓ କୀଳକ ଅଲଗା ଅଙ୍ଗ।',
    copy: 'କପି',
    prevVerses: 'ପୂର୍ବ ଶ୍ଳୋକ',
    nextVerses: 'ପର ଶ୍ଳୋକ',
    range: (a, b, t) => `${t} ମଧ୍ୟରୁ ${a}–${b}`,
    points: 'କାହାଣୀର ମୁଖ୍ୟ କଥା',
    prevChapter: 'ପୂର୍ବ ଅଧ୍ୟାୟ',
    nextChapter: 'ପର ଅଧ୍ୟାୟ',
    chapterOf: (n, t) => `ଅଧ୍ୟାୟ ${n} / ${t}`,
    significance: 'ମାହାତ୍ମ୍ୟ ଓ ଫଳ: ',
    meaning: 'ଅର୍ଥ: ',
    copied: 'ଶ୍ଳୋକ କପି ହେଲା!',
    shareTitle: 'ଶ୍ରୀ ଦୁର୍ଗା ସପ୍ତଶତୀ',
  },
};

const modules = import.meta.glob('./saptashati/*.json', { eager: true }) as Record<
  string,
  { default: SaptContent }
>;

function pack(lang: string): SaptContent | undefined {
  const key = Object.keys(modules).find((k) => k.endsWith(`/${lang}.json`));
  return key ? modules[key].default : undefined;
}

export function saptUi(lang: string): SaptUi {
  return UI[lang] || UI.en;
}

function chapterText(ch: DurgaChapter, block?: SaptChapterText): SaptChapterText {
  if (!block) {
    return {
      title: ch.title,
      heading: ch.hindiTitle,
      charitra: ch.charitra,
      summary: ch.summary,
      phala: ch.phala,
      details: ch.detailedDescription,
    };
  }
  return {
    title: block.title || ch.title,
    heading: block.heading || ch.hindiTitle,
    charitra: block.charitra || ch.charitra,
    summary: block.summary || ch.summary,
    phala: block.phala || ch.phala,
    details: block.details?.length === ch.detailedDescription.length ? block.details : ch.detailedDescription,
  };
}

export function localizeChapter(ch: DurgaChapter, lang: string): SaptChapterText {
  if (lang === 'hi') return chapterText(ch);
  const own = pack(lang)?.chapters?.[String(ch.id)];
  const en = pack('en')?.chapters?.[String(ch.id)];
  return chapterText(ch, own || en);
}

export function localizeAnga(anga: DurgaAnga, lang: string): {
  name: string;
  desc: string;
  significance: string;
  verses: { sanskrit: string; meaning: string }[];
} {
  const sourceMeanings = anga.verses.map((v) => v.hindi);
  const pick = (block?: SaptAngaText) => {
    if (!block) return undefined;
    if (block.verses?.length !== anga.verses.length) return undefined;
    return block;
  };
  const block = lang === 'hi' ? undefined : pick(pack(lang)?.angas?.[anga.id]) || pick(pack('en')?.angas?.[anga.id]);
  const meanings = block?.verses || sourceMeanings;
  return {
    name: block?.name || anga.name,
    desc: block?.desc || anga.desc,
    significance: block?.significance || anga.significance,
    verses: anga.verses.map((v, i) => ({ sanskrit: v.sanskrit, meaning: meanings[i] || v.hindi })),
  };
}
