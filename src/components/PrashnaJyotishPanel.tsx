import React, { useState, useMemo } from 'react';
import { SavedLocation } from '../types';
import { generatePrashnaKundali } from '../services/kundali';
import { RASHIS } from '../services/astronomy';
import { RASHI_LORDS, GRAHA_MAITRI_MATRIX } from '../services/milan';
import { KundaliChart } from './KundaliChart';
import { ShlokaPosterModal, ShlokaPosterData } from './ShlokaPosterModal';
import {
  HelpCircle,
  Sparkles,
  Compass,
  Grid,
  Flame,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { trPlanet, trRashi, trVedic } from '../i18n/vedicTranslate';

function pickLang<T>(lang: string, hi: T, en: T, gu: T): T {
  if (lang === 'en') return en;
  if (lang === 'gu') return gu;
  return hi;
}

interface PrashnaJyotishPanelProps {
  currentLocation: SavedLocation;
}

interface QuestionCategory {
  id: string;
  label: string;
  house: number; // Karyesh Bhava
  houseName: string;
  defaultQuery: string;
  karakaPlanet: string;
}

function getQuestionCategories(lang: string): QuestionCategory[] {
  return [
    {
      id: 'mook',
      label: pickLang(lang, '🤫 मूक प्रश्न (बिना बताए मन का प्रश्न)', '🤫 Mook Prashna (Silent Mind Query)', '🤫 મૂક પ્રશ્ન (બિનકહ્યો મનનો પ્રશ્ન)'),
      house: 1,
      houseName: pickLang(lang, 'लग्न व चंद्र भाव', 'Lagna & Moon House', 'લગ્ન અને ચંદ્ર ભાવ'),
      defaultQuery: pickLang(lang, 'मूक प्रश्न — जातक के मन की गुप्त चिंता व समाधान', 'Mook Prashna — Silent worry in mind & Vedic solution', 'મૂક પ્રશ્ન — જાતકના મનની ગુપ્ત ચિંતા અને સમાધાન'),
      karakaPlanet: 'चंद्र',
    },
    {
      id: 'career',
      label: pickLang(lang, '💼 नौकरी, व्यापार व पदोन्नति', '💼 Career, Business & Promotion', '💼 નોકરી, વેપાર અને બઢતી'),
      house: 10,
      houseName: pickLang(lang, 'दशम भाव (कर्म भाव)', '10th House (Karma Bhava)', 'દશમ ભાવ (કર્મ ભાવ)'),
      defaultQuery: pickLang(lang, 'क्या मेरे व्यापार/नौकरी में अभी सफलता व उन्नति मिलेगी?', 'Will I achieve success and growth in my career or business now?', 'શું મારા વેપાર/નોકરીમાં અત્યારે સફળતા અને પ્રગતિ મળશે?'),
      karakaPlanet: 'सूर्य',
    },
    {
      id: 'wealth',
      label: pickLang(lang, '🪙 धन लाभ, रुका पैसा व निवेश', '🪙 Wealth, Stuck Money & Investment', '🪙 ધન લાભ, અટવાયેલા પૈસા અને રોકાણ'),
      house: 2,
      houseName: pickLang(lang, 'द्वितीय/एकादश भाव (धन-लाभ)', '2nd / 11th House (Wealth & Gains)', 'દ્વિતીય/એકાદશ ભાવ (ધન-લાભ)'),
      defaultQuery: pickLang(lang, 'क्या रुका हुआ धन वापस मिलेगा और आर्थिक लाभ होगा?', 'Will stuck money be recovered and will there be financial gain?', 'શું અટવાયેલા પૈસા પાછા મળશે અને આર્થિક લાભ થશે?'),
      karakaPlanet: 'गुरु',
    },
    {
      id: 'marriage',
      label: pickLang(lang, '💍 विवाह, प्रेम व रिश्ता', '💍 Marriage, Love & Match', '💍 લગ્ન, પ્રેમ અને સંબંધ'),
      house: 7,
      houseName: pickLang(lang, 'सप्तम भाव (कलत्र भाव)', '7th House (Kalatra Bhava)', 'સપ્તમ ભાવ (કલત્ર ભાવ)'),
      defaultQuery: pickLang(lang, 'क्या यह वैवाहिक रिश्ता शुभ रहेगा और विवाह कब तय होगा?', 'Will this marriage alliance be auspicious and when will it finalize?', 'શું આ વૈવાહિક સંબંધ શુભ રહેશે અને લગ્ન ક્યારે નક્કી થશે?'),
      karakaPlanet: 'शुक्र',
    },
    {
      id: 'health',
      label: pickLang(lang, '🌿 रोग मुक्ति व स्वास्थ्य सुधार', '🌿 Recovery & Health Healing', '🌿 રોગ મુક્તિ અને સ્વાસ્થ્ય સુધારો'),
      house: 6,
      houseName: pickLang(lang, 'षष्ठ व लग्न भाव (रोग विचार)', '6th & 1st House (Health Analysis)', 'ષષ્ઠ અને લગ્ન ભાવ (રોગ વિચાર)'),
      defaultQuery: pickLang(lang, 'रोगी के स्वास्थ्य में पूर्ण सुधार कब तक होगा?', 'By when will the patient achieve full health recovery?', 'રોગીના સ્વાસ્થ્યમાં સંપૂર્ણ સુધારો ક્યાં સુધીમાં થશે?'),
      karakaPlanet: 'सूर्य',
    },
    {
      id: 'lost',
      label: pickLang(lang, '🔍 खोई हुई वस्तु / चोरी विचार', '🔍 Lost Item / Theft Recovery', '🔍 ખોવાયેલી વસ્તુ / ચોરી વિચાર'),
      house: 4,
      houseName: pickLang(lang, 'चतुर्थ व सप्तम भाव (द्रव्य प्राप्ति)', '4th & 7th House (Lost Property)', 'ચતુર્થ અને સપ્તમ ભાવ (દ્રવ્ય પ્રાપ્તિ)'),
      defaultQuery: pickLang(lang, 'खोई हुई वस्तु किस दिशा में है और क्या वापस मिलेगी?', 'In which direction is the lost item and will it be recovered?', 'ખોવાયેલી વસ્તુ કઈ દિશામાં છે અને શું તે પાછી મળશે?'),
      karakaPlanet: 'चंद्र',
    },
    {
      id: 'travel',
      label: pickLang(lang, '✈️ यात्रा, विदेश गमन व स्थानांतरण', '✈️ Travel, Foreign Trip & Relocation', '✈️ યાત્રા, વિદેશ ગમન અને સ્થળાંતર'),
      house: 9,
      houseName: pickLang(lang, 'नवम व द्वादश भाव (प्रवास भाव)', '9th & 12th House (Travel & Foreign)', 'નવમ અને દ્વાદશ ભાવ (પ્રવાસ ભાવ)'),
      defaultQuery: pickLang(lang, 'क्या मेरी आगामी यात्रा अथवा विदेश कार्य सफल होगा?', 'Will my upcoming journey or foreign endeavor succeed?', 'શું મારી આગામી યાત્રા અથવા વિદેશ કાર્ય સફળ થશે?'),
      karakaPlanet: 'चंद्र',
    },
    {
      id: 'legal',
      label: pickLang(lang, '⚖️ मुकदमा, विवाद व शत्रु विजय', '⚖️ Legal Dispute & Victory', '⚖️ કોર્ટ કેસ, વિવાદ અને શત્રુ વિજય'),
      house: 6,
      houseName: pickLang(lang, 'षष्ठ व दशम भाव (विजय विचार)', '6th & 10th House (Victory Analysis)', 'ષષ્ઠ અને દશમ ભાવ (વિજય વિચાર)'),
      defaultQuery: pickLang(lang, 'क्या न्यायालय/विवाद के प्रकरण में मेरी विजय होगी?', 'Will I prevail in this legal matter or dispute?', 'શું ન્યાયાલય/વિવાદના કેસમાં મારો વિજય થશે?'),
      karakaPlanet: 'मंगल',
    },
    {
      id: 'child',
      label: pickLang(lang, '🎓 संतान सुख, परीक्षा व शिक्षा', '🎓 Children, Exams & Education', '🎓 સંતાન સુખ, પરીક્ષા અને શિક્ષણ'),
      house: 5,
      houseName: pickLang(lang, 'पंचम भाव (विद्या-संतान भाव)', '5th House (Education & Progeny)', 'પંચમ ભાવ (વિદ્યા-સંતાન ભાવ)'),
      defaultQuery: pickLang(lang, 'क्या परीक्षा/प्रतियोगिता अथवा संतान संबंधी मनोरथ सिद्ध होगा?', 'Will my wish regarding exams, competition, or progeny be fulfilled?', 'શું પરીક્ષા/સ્પર્ધા અથવા સંતાન સંબંધી મનોરથ સિદ્ધ થશે?'),
      karakaPlanet: 'गुरु',
    },
  ];
}

interface RamshalakaChaupai {
  id: number;
  chaupai: string;
  kanda: string;
  context: string;
  meaning: string;
  verdict: string;
  grade: 'excellent' | 'good' | 'caution' | 'bad';
}

function getRamshalakaChaupais(lang: string): RamshalakaChaupai[] {
  return [
    {
      id: 1,
      chaupai: 'सुनु सिय सत्य असीस हमारी। पूजिहि मन कामना तुम्हारी॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — बालकाण्ड (पुष्पवाटिका प्रसंग)', 'Shri Ramcharitmanas — Bala Kanda (Pushpavatika)', 'શ્રી રામચરિતમાનસ — બાલકાંડ (પુષ્પવાટિકા પ્રસંગ)'),
      context: pickLang(lang, 'माँ गौरी द्वारा जनकनंदिनी सीता जी को दिया गया अमोघ आशीर्वाद।', 'Maa Gauri’s infallible blessing bestowed upon Devi Sita.', 'મા ગૌરી દ્વારા જનકનંદિની સીતાજીને આપવામાં આવેલ અમોઘ આશીર્વાદ.'),
      meaning: pickLang(lang, 'हे सीते! हमारी सच्ची आशीष सुनो, तुम्हारी मनचाही कामना अवश्य पूर्ण होगी।', 'O Sita! Hear My true blessing: your cherished heart’s desire shall surely be fulfilled.', 'હે સીતા! અમારા સાચા આશીર્વાદ સાંભળો, તમારી મનની મનોકામના અવશ્ય પૂર્ણ થશે.'),
      verdict: pickLang(lang, 'परम शुभ (१००% कार्य सिद्धि): आपका प्रश्न एवं संकल्प अत्यंत उत्तम है। भगवती गौरी व श्री सीताराम की कृपा से मनोकामना पूर्ण होगी। निश्चिंत होकर कार्य आगे बढ़ाएँ।', 'Supremely Auspicious (100% Success): Your question and resolve are pure. By the grace of Maa Gauri and Shri Sitaram, your wish will be fulfilled. Proceed with confidence.', 'પરમ શુભ (૧૦૦% કાર્ય સિદ્ધિ): તમારો પ્રશ્ન અને સંકલ્પ અત્યંત ઉત્તમ છે. ભગવતી ગૌરી અને શ્રી સીતારામની કૃપાથી મનોકામના પૂર્ણ થશે. નિશ્ચિંત થઈને કાર્ય આગળ વધારો.'),
      grade: 'excellent',
    },
    {
      id: 2,
      chaupai: 'प्रबिसि नगर कीजे सब काजा। हृदयँ राखि कोसलपुर राजा॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — सुन्दरकाण्ड (लंका प्रवेश प्रसंग)', 'Shri Ramcharitmanas — Sundara Kanda (Entering Lanka)', 'શ્રી રામચરિતમાનસ — સુંદરકાંડ (લંકા પ્રવેશ પ્રસંગ)'),
      context: pickLang(lang, 'लंकिनी द्वारा श्री हनुमान जी को लंका प्रवेश के समय कहे गए मंगल वचन।', 'Auspicious words spoken to Shri Hanuman Ji while entering Lanka.', 'લંકિની દ્વારા શ્રી હનુમાનજીને લંકા પ્રવેશ સમયે કહેવાયેલા મંગળ વચનો.'),
      meaning: pickLang(lang, 'अयोध्यापुरी के राजा श्री रघुनाथजी को हृदय में धारण करके नगर में प्रवेश कर सब कार्य कीजिए।', 'Holding Shri Raghunatha, the Lord of Ayodhya, in your heart, enter and accomplish all tasks.', 'અયોધ્યાપુરીના રાજા શ્રી રઘુનાથજીને હૃદયમાં ધારણ કરીને નગરમાં પ્રવેશ કરી સર્વ કાર્ય કરો.'),
      verdict: pickLang(lang, 'अति शुभ (तुरंत कार्यारंभ करें): ईश्वर का स्मरण कर कार्य तुरंत प्रारंभ करें। आपके सभी कार्य निर्विघ्न संपन्न होंगे और विष भी अमृत समान हो जाएगा।', 'Highly Auspicious (Begin Immediately): Remembering the Lord, start this task without delay. Obstacles will turn into blessings and everything will conclude smoothly.', 'અતિ શુભ (તરત જ કાર્યારંભ કરો): ઈશ્વરનું સ્મરણ કરીને કાર્ય તરત શરૂ કરો. તમારા બધા કાર્યો નિર્વિઘ્ન પૂર્ણ થશે અને વિષ પણ અમૃત સમાન થઈ જશે.'),
      grade: 'excellent',
    },
    {
      id: 3,
      chaupai: 'उघरहिं अंत न होइ निबाहू। कालनेमि जिमि रावन राहू॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — बालकाण्ड (संत-असंत वंदना)', 'Shri Ramcharitmanas — Bala Kanda', 'શ્રી રામચરિતમાનસ — બાલકાંડ (સંત-અસંત વંદના)'),
      context: pickLang(lang, 'कपट व अधर्म से किए गए कार्यों के परिणाम का शास्त्रीय वर्णन।', 'Scriptural insight on the outcome of deceptive or unrighteous paths.', 'કપટ અને અધર્મથી કરેલા કાર્યોના પરિણામનું શાસ્ત્રીય વર્ણન.'),
      meaning: pickLang(lang, 'अंत में कपट खुल ही जाता है और उसका निर्वाह नहीं होता — जैसे कालनेमि, रावण और राहु का अंत हुआ।', 'Falsehood is eventually exposed and cannot endure, just as happened to Kalanemi, Ravana, and Rahu.', 'અંતમાં કપટ ખુલી જ જાય છે અને તેનો નિર્વાહ થતો નથી — જેમ કાલનેમિ, રાવણ અને રાહુનો અંત થયો.'),
      verdict: pickLang(lang, 'अशुभ संकेत (यह कार्य त्याज्य है): इस कार्य के पीछे किसी प्रकार का भ्रम, कपट या अहित छिपा है। अंततः इसमें सफलता नहीं मिलेगी, अतः यह विचार छोड़ देना ही हितकारी है।', 'Inauspicious Sign (Best Avoided): Some illusion, hidden risk, or deceit surrounds this matter. It will not succeed long-term; stepping back is in your best interest.', 'અશુભ સંકેત (આ કાર્ય ત્યાજ્ય છે): આ કાર્ય પાછળ કોઈ પ્રકારનો ભ્રમ, કપટ કે અહિત છુપાયેલું છે. અંતે સફળતા મળશે નહીં, તેથી આ વિચાર છોડી દેવો જ હિતકારી છે.'),
      grade: 'bad',
    },
    {
      id: 4,
      chaupai: 'बिधि बस सुजन कुसंगत परहीं। फनि मनि सम निज गुन अनुसरहीं॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — बालकाण्ड', 'Shri Ramcharitmanas — Bala Kanda', 'શ્રી રામચરિતમાનસ — બાલકાંડ'),
      context: pickLang(lang, 'सज्जन पुरुषों के संकट या कुसंग में पड़ने पर भी अपने सद्गुण न छोड़ने का प्रसंग।', 'Virtuous souls retaining their integrity even amidst adverse company.', 'સજ્જન પુરુષોના સંકટ કે કુસંગમાં પડવા છતાં પોતાના સદ્ગુણો ન છોડવાનો પ્રસંગ.'),
      meaning: pickLang(lang, 'दैवयोग से यदि सज्जन कुसंगति में पड़ भी जाएँ, तो वे साँप की मणि के समान अपने शुभ गुणों का ही अनुसरण करते हैं।', 'Even if destiny places the noble in harsh company, they keep their pure virtues intact like a serpent’s jewel.', 'દૈવયોગથી જો સજ્જન કુસંગતમાં પડી પણ જાય, તો તેઓ સાપની મણિ સમાન પોતાના શુભ ગુણોનું જ અનુસરણ કરે છે.'),
      verdict: pickLang(lang, 'मध्यम / सावधानी आवश्यक: कार्य में कुछ गलत लोगों या विपरीत परिस्थितियों से पाला पड़ सकता है। अपनी सत्यनिष्ठा और धैर्य न छोड़ें; धीरे-धीरे स्थिति सुधरेगी।', 'Moderate / Caution Needed: You may encounter unhelpful people or tricky conditions. Hold fast to ethics and patience; conditions will gradually improve.', 'મધ્યમ / સાવધાની આવશ્યક: કાર્યમાં કેટલાક ખોટા લોકો કે વિપરીત પરિસ્થિતિઓનો સામનો કરવો પડી શકે છે. તમારી સત્યનિષ્ઠા અને ધૈર્ય ન છોડશો; ધીરે ધીરે સ્થિતિ સુધરશે.'),
      grade: 'caution',
    },
    {
      id: 5,
      chaupai: 'होइहि सोइ जो राम रचि राखा। को करि तर्क बढ़ावै साखा॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — बालकाण्ड (शिव-पार्वती संवाद)', 'Shri Ramcharitmanas — Bala Kanda (Shiva–Parvati Samvad)', 'શ્રી રામચરિતમાનસ — બાલકાંડ (શિવ-પાર્વતી સંવાદ)'),
      context: pickLang(lang, 'भगवान भोलेनाथ द्वारा सती के मोह पर प्रारब्ध की सर्वोच्चता का उपदेश।', 'Lord Shiva explaining divine destiny over unnecessary debate.', 'ભગવાન ભોળાનાથ દ્વારા પ્રારબ્ધની સર્વોચ્ચતાનો ઉપદેશ.'),
      meaning: pickLang(lang, 'होगा वही जो श्री रामजी ने रच रखा है। व्यर्थ तर्क करके कौन शाखा (विस्तार) बढ़ावे।', 'Whatever Shri Rama has ordained shall come to pass; why multiply branches of futile argument?', 'થશે એ જ જે શ્રી રામજીએ રચી રાખ્યું છે. વ્યર્થ તર્ક કરીને કોણ વિસ્તાર વધારે.'),
      verdict: pickLang(lang, 'ईश्वर इच्छा पर निर्भर (संशय): इस कार्य के होने या न होने में अभी अनिश्चितता है। हठ या अत्यधिक चिंता छोड़ कर प्रभु श्री राम की इच्छा पर भरोसा रखें।', 'Uncertain / Surrender to Divine Will: The outcome remains undecided right now. Let go of stubbornness or over-worry and trust Shri Rama’s timing.', 'ઈશ્વર ઇચ્છા પર નિર્ભર (સંશય): આ કાર્ય થવા કે ન થવામાં અત્યારે અનિશ્ચિતતા છે. હઠ કે અતિશય ચિંતા છોડીને પ્રભુ શ્રી રામની ઇચ્છા પર ભરોસો રાખો.'),
      grade: 'caution',
    },
    {
      id: 6,
      chaupai: 'मुद मंगलमय संत समाजू। जो जग जंगम तीरथ राजू॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — बालकाण्ड', 'Shri Ramcharitmanas — Bala Kanda', 'શ્રી રામચરિતમાનસ — બાલકાંડ'),
      context: pickLang(lang, 'सत्संग व श्रेष्ठ जनों के सान्निध्य की महिमा।', 'The auspicious power of noble company and wise counsel.', 'સત્સંગ અને શ્રેષ્ઠ જનોના સાંનિધ્યનો મહિમા.'),
      meaning: pickLang(lang, 'संतों का समाज आनंद और कल्याणमय है, जो जगत में चलता-फिरता तीर्थराज प्रयाग है।', 'The fellowship of the wise is joyful and auspicious—a living pilgrimage site on earth.', 'સંતોનો સમાજ આનંદ અને કલ્યાણમય છે, જે જગતમાં હરતું-ફરતું તીર્થરાજ પ્રયાગ છે.'),
      verdict: pickLang(lang, 'शुभ व मंगलकारी: आपका कार्य सज्जनों, वरिष्ठों और परिवार के सहयोग से आनंदपूर्वक संपन्न होगा। धार्मिक आचरण और सत्संग से विशेष लाभ मिलेगा।', 'Auspicious & Harmonious: With support from elders, family, and noble mentors, this task will succeed joyfully. Spiritual conduct brings special blessings.', 'શુભ અને મંગળકારી: તમારું કાર્ય સજ્જનો, વડીલો અને પરિવારના સહયોગથી આનંદપૂર્વક પૂર્ણ થશે. ધાર્મિક આચરણ અને સત્સંગથી વિશેષ લાભ મળશે.'),
      grade: 'good',
    },
    {
      id: 7,
      chaupai: 'गरल सुधा रिपु करहिं मिताई। गोपद सिंधु अनल सितलाई॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — सुन्दरकाण्ड', 'Shri Ramcharitmanas — Sundara Kanda', 'શ્રી રામચરિતમાનસ — સુંદરકાંડ'),
      context: pickLang(lang, 'श्री राम नाम व हनुमान जी के प्रताप से असंभव कार्य भी सरल होने का प्रसंग।', 'By Shri Rama’s grace and Hanuman Ji’s power, even the impossible becomes effortless.', 'શ્રી રામ નામ અને હનુમાનજીના પ્રતાપથી અસંભવ કાર્ય પણ સરળ થવાનો પ્રસંગ.'),
      meaning: pickLang(lang, 'श्री राम कृपा से विष अमृत हो जाता है, शत्रु मित्रता करने लगते हैं, समुद्र गाय के खुर के बराबर हो जाता है और अग्नि में शीतलता आ जाती है।', 'By divine grace poison turns into nectar, rivals become friends, vast oceans shrink to a hoof-print, and fire grows cool.', 'શ્રી રામ કૃપાથી વિષ અમૃત થઈ જાય છે, શત્રુ મિત્રતા કરવા લાગે છે, સમુદ્ર ગાયની ખરી સમાન થઈ જાય છે અને અગ્નિમાં શીતળતા આવી જાય છે.'),
      verdict: pickLang(lang, 'परम विजय व संकट मोचन: चाहे कितनी भी बड़ी बाधा या शत्रुता क्यों न दिख रही हो, प्रभु कृपा से सब अनुकूल हो जाएगा। कार्य में निश्चित और ऐतिहासिक सफलता मिलेगी।', 'Supreme Victory & Protection: No matter how daunting the obstacles or opposition appear, divine grace will turn everything in your favor for a landmark success.', 'પરમ વિજય અને સંકટ મોચન: ગમે તેટલી મોટી બાધા કે શત્રુતા કેમ ન દેખાતી હોય, પ્રભુ કૃપાથી બધું અનુકૂળ થઈ જશે. કાર્યમાં નિશ્ચિત સફળતા મળશે.'),
      grade: 'excellent',
    },
    {
      id: 8,
      chaupai: 'बरुन कुबेर सुरेस समीरा। रन सन्मुख धरि काहुँ न धीरा॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — लंकाकाण्ड', 'Shri Ramcharitmanas — Lanka Kanda', 'શ્રી રામચરિતમાનસ — લંકાકાંડ'),
      context: pickLang(lang, 'रावण के प्रबल वेग के सामने लोकपालों के धैर्य खोने का वर्णन।', 'Even mighty guardians faltering before overwhelming opposing forces.', 'રાવણના પ્રબળ વેગ સામે લોકપાલોના ધૈર્ય ખૂટવાનું વર્ણન.'),
      meaning: pickLang(lang, 'वरुण, कुबेर, इंद्र और वायु — किसी ने भी रणभूमि में सामने टिकने का धैर्य नहीं धरा।', 'Varuna, Kubera, Indra, and Vayu—none could hold ground against that fierce onslaught.', 'વરુણ, કુબેર, ઇન્દ્ર અને વાયુ — કોઈએ પણ રણભૂમિમાં સામે ટકવાનું ધૈર્ય ન ધર્યું.'),
      verdict: pickLang(lang, 'प्रबल बाधा व विलंब: वर्तमान समय में परिस्थितियाँ आपके अनुकूल नहीं हैं और विरोधी पक्ष या विघ्न प्रबल हैं। अभी यह कार्य स्थगित रखें एवं हनुमान चालीसा का पाठ करें।', 'Strong Resistance & Delay: Current circumstances are unfavorable and opposition is strong. Postpone major moves for now and recite Hanuman Chalisa.', 'પ્રબળ બાધા અને વિલંબ: વર્તમાન સમયમાં પરિસ્થિતિઓ તમારા અનુકૂળ નથી અને વિરોધી પક્ષ કે વિઘ્નો પ્રબળ છે. અત્યારે આ કાર્ય સ્થગિત રાખો અને હનુમાન ચાલીસાનો પાઠ કરો.'),
      grade: 'bad',
    },
    {
      id: 9,
      chaupai: 'सुफल मनोरथ होहुँ तुम्हारे। राम लखन सुनि भए सुखारे॥',
      kanda: pickLang(lang, 'श्री रामचरितमानस — बालकाण्ड (विश्वामित्र आशीर्वाद)', 'Shri Ramcharitmanas — Bala Kanda (Vishwamitra’s Blessing)', 'શ્રી રામચરિતમાનસ — બાલકાંડ (વિશ્વામિત્ર આશીર્વાદ)'),
      context: pickLang(lang, 'महर्षि विश्वामित्र एवं जनकपुर में श्री राम-लक्ष्मण के प्रसन्न होने का शुभ प्रसंग।', 'Maharshi Vishwamitra’s joyful blessing upon Shri Rama and Lakshmana.', 'મહર્ષિ વિશ્વામિત્ર અને જનકપુરમાં શ્રી રામ-લક્ષ્મણના પ્રસન્ન થવાનો શુભ પ્રસંગ.'),
      meaning: pickLang(lang, 'तुम्हारे मनोरथ सफल हों — यह सुनकर श्री राम और लक्ष्मण अत्यंत सुखी हुए।', 'May all your heartfelt wishes be fruitful—hearing this, Shri Rama and Lakshmana rejoiced.', 'તમારા મનોરથ સફળ થાઓ — આ સાંભળી શ્રી રામ અને લક્ષ્મણ અત્યંત સુખી થયા.'),
      verdict: pickLang(lang, 'अति उत्तम व सुखद फल: आपका सोचा हुआ मनोरथ पूर्णतः सफल होगा। धन, सम्मान और पारिवारिक प्रसन्नता की प्राप्ति होगी।', 'Excellent & Joyful Outcome: Your contemplated wish will reach complete fulfillment, bringing prosperity, honor, and family happiness.', 'અતિ ઉત્તમ અને સુખદ ફળ: તમારો વિચારેલો મનોરથ પૂર્ણતઃ સફળ થશે. ધન, સન્માન અને પારિવારિક પ્રસન્નતાની પ્રાપ્તિ થશે.'),
      grade: 'excellent',
    },
  ];
}

// 81 cells of Traditional Ramshalaka Grid mapped to the 9 Chaupais
const RAMSHALAKA_CELLS: { akshara: string; chaupaiId: number }[] = [
  { akshara: 'सु', chaupaiId: 1 }, { akshara: 'प्र', chaupaiId: 2 }, { akshara: 'उ', chaupaiId: 3 },
  { akshara: 'बि', chaupaiId: 4 }, { akshara: 'हो', chaupaiId: 5 }, { akshara: 'मु', chaupaiId: 6 },
  { akshara: 'ग', chaupaiId: 7 }, { akshara: 'ब', chaupaiId: 8 }, { akshara: 'सु', chaupaiId: 9 },

  { akshara: 'नु', chaupaiId: 1 }, { akshara: 'बि', chaupaiId: 2 }, { akshara: 'घ', chaupaiId: 3 },
  { akshara: 'धि', chaupaiId: 4 }, { akshara: 'इ', chaupaiId: 5 }, { akshara: 'द', chaupaiId: 6 },
  { akshara: 'र', chaupaiId: 7 }, { akshara: 'रु', chaupaiId: 8 }, { akshara: 'फ', chaupaiId: 9 },

  { akshara: 'सि', chaupaiId: 1 }, { akshara: 'सि', chaupaiId: 2 }, { akshara: 'र', chaupaiId: 3 },
  { akshara: 'ब', chaupaiId: 4 }, { akshara: 'हि', chaupaiId: 5 }, { akshara: 'मं', chaupaiId: 6 },
  { akshara: 'ल', chaupaiId: 7 }, { akshara: 'न', chaupaiId: 8 }, { akshara: 'ल', chaupaiId: 9 },

  { akshara: 'य', chaupaiId: 1 }, { akshara: 'न', chaupaiId: 2 }, { akshara: 'हिं', chaupaiId: 3 },
  { akshara: 'स', chaupaiId: 4 }, { akshara: 'सो', chaupaiId: 5 }, { akshara: 'ग', chaupaiId: 6 },
  { akshara: 'सु', chaupaiId: 7 }, { akshara: 'कु', chaupaiId: 8 }, { akshara: 'म', chaupaiId: 9 },

  { akshara: 'स', chaupaiId: 1 }, { akshara: 'ग', chaupaiId: 2 }, { akshara: 'अं', chaupaiId: 3 },
  { akshara: 'सु', chaupaiId: 4 }, { akshara: 'इ', chaupaiId: 5 }, { akshara: 'ल', chaupaiId: 6 },
  { akshara: 'धा', chaupaiId: 7 }, { akshara: 'बे', chaupaiId: 8 }, { akshara: 'नो', chaupaiId: 9 },

  { akshara: 'त्य', chaupaiId: 1 }, { akshara: 'र', chaupaiId: 2 }, { akshara: 'त', chaupaiId: 3 },
  { akshara: 'ज', chaupaiId: 4 }, { akshara: 'जो', chaupaiId: 5 }, { akshara: 'म', chaupaiId: 6 },
  { akshara: 'रि', chaupaiId: 7 }, { akshara: 'र', chaupaiId: 8 }, { akshara: 'र', chaupaiId: 9 },

  { akshara: 'अ', chaupaiId: 1 }, { akshara: 'की', chaupaiId: 2 }, { akshara: 'न', chaupaiId: 3 },
  { akshara: 'न', chaupaiId: 4 }, { akshara: 'रा', chaupaiId: 5 }, { akshara: 'य', chaupaiId: 6 },
  { akshara: 'पु', chaupaiId: 7 }, { akshara: 'सु', chaupaiId: 8 }, { akshara: 'थ', chaupaiId: 9 },

  { akshara: 'सी', chaupaiId: 1 }, { akshara: 'जे', chaupaiId: 2 }, { akshara: 'हो', chaupaiId: 3 },
  { akshara: 'कु', chaupaiId: 4 }, { akshara: 'म', chaupaiId: 5 }, { akshara: 'सं', chaupaiId: 6 },
  { akshara: 'क', chaupaiId: 7 }, { akshara: 'रे', chaupaiId: 8 }, { akshara: 'हो', chaupaiId: 9 },

  { akshara: 'स', chaupaiId: 1 }, { akshara: 'स', chaupaiId: 2 }, { akshara: 'इ', chaupaiId: 3 },
  { akshara: 'सं', chaupaiId: 4 }, { akshara: 'र', chaupaiId: 5 }, { akshara: 'त', chaupaiId: 6 },
  { akshara: 'र', chaupaiId: 7 }, { akshara: 'स', chaupaiId: 8 }, { akshara: 'हुँ', chaupaiId: 9 },
];

// Classical Mook Prashna (Silent Question) inference based on Lagna / Moon house & Kendra planets
function getMookPrashnaByHouse(lang: string): Record<number, { topic: string; secretThought: string; solution: string }> {
  return {
    1: {
      topic: pickLang(lang, 'स्वास्थ्य, आत्म-सम्मान व व्यक्तिगत निर्णय', 'Health, Self-Esteem & Personal Decision', 'સ્વાસ્થ્ય, આત્મ-સન્માન અને વ્યક્તિગત નિર્ણય'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता के मन में अपने स्वयं के स्वास्थ्य, किसी बड़े व्यक्तिगत निर्णय अथवा मान-सम्मान को लेकर गहन विचार चल रहा है।', 'The querent is deeply contemplating personal health, dignity, or an important self-defining choice.', 'પ્રશ્નકર્તાના મનમાં પોતાના સ્વાસ્થ્ય, કોઈ મોટા વ્યક્તિગત નિર્ણય અથવા માન-સન્માન અંગે ઊંડો વિચાર ચાલી રહ્યો છે.'),
      solution: pickLang(lang, 'लग्न बलवान होने से आत्मबल द्वारा कार्य सिद्ध होगा। प्रातः सूर्य को अर्घ्य दें।', 'Strong Lagna grants willpower to succeed. Offer morning Arghya to Lord Surya.', 'લગ્ન બળવાન હોવાથી આત્મબળથી કાર્ય સિદ્ધ થશે. સવારે સૂર્યને અર્ઘ્ય અર્પણ કરો.'),
    },
    2: {
      topic: pickLang(lang, 'धन संचय, कुटुंब व रुका हुआ पैसा', 'Savings, Family Matters & Stuck Funds', 'ધન સંચય, કુટુંબ અને અટવાયેલા પૈસા'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता के मन में पारिवारिक सहमति, पैतृक धन अथवा किसी रुके हुए आर्थिक लेन-देन की चिंता है।', 'The mind is occupied with family harmony, ancestral wealth, or pending financial recovery.', 'પ્રશ્નકર્તાના મનમાં પારિવારિક સંમતિ, પૈતૃક ધન અથવા કોઈ અટવાયેલી આર્થિક લેવડદેવડની ચિંતા છે.'),
      solution: pickLang(lang, 'आगामी पक्ष में धन आगमन का योग बनेगा। वाणी में मधुरता रखें व लक्ष्मी-नारायण पूजन करें।', 'Financial inflow improves in the coming fortnight. Keep speech gentle and worship Lakshmi-Narayana.', 'આગામી પખવાડિયામાં ધન આગમનનો યોગ બનશે. વાણીમાં મધુરતા રાખો અને લક્ષ્મી-નારાયણ પૂજન કરો.'),
    },
    3: {
      topic: pickLang(lang, 'भाई-बहन, नया अनुबंध व साहसिक कदम', 'Siblings, New Agreement & Bold Initiative', 'ભાઈ-બહેન, નવો કરાર અને સાહસિક પગલું'),
      secretThought: pickLang(lang, 'जातक किसी नए समझौते, छोटी यात्रा, स्थानांतरण या भाई-बंधुओं से जुड़े विषय पर निर्णय लेना चाहता है।', 'You are weighing a new contract, short travel, relocation, or a matter concerning siblings.', 'જાતક કોઈ નવા કરાર, ટૂંકી યાત્રા, સ્થળાંતર કે ભાઈ-બહેનો સાથે જોડાયેલા વિષય પર નિર્ણય લેવા માંગે છે.'),
      solution: pickLang(lang, 'स्वयं के पराक्रम से कार्य सफल होगा। मंगलवार को हनुमान जी को सिंदूर अर्पित करें।', 'Personal courage will bring victory. Offer sindoor to Hanuman Ji on Tuesday.', 'પોતાના પરાક્રમથી કાર્ય સફળ થશે. મંગળવારે હનુમાનજીને સિંદૂર અર્પણ કરો.'),
    },
    4: {
      topic: pickLang(lang, 'भूमि, भवन, वाहन व पारिवारिक शांति', 'Property, Home, Vehicle & Domestic Peace', 'જમીન, મકાન, વાહન અને પારિવારિક શાંતિ'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता के हृदय में मकान, जमीन, वाहन खरीदने अथवा घर की सुख-शांति और माता के स्वास्थ्य का प्रश्न है।', 'At heart, the query centers on real estate, vehicle purchase, home peace, or mother’s wellbeing.', 'પ્રશ્નકર્તાના હૃદયમાં મકાન, જમીન, વાહન ખરીદવા અથવા ઘરની સુખ-શાંતિ અને માતાના સ્વાસ્થ્યનો પ્રશ્ન છે.'),
      solution: pickLang(lang, 'चतुर्थ भाव की शुद्धि से स्थाई संपत्ति व सुख प्राप्त होगा। शिव अभिषेक कल्याणकारी है।', '4th house clarity blesses lasting property and peace. Shiva Abhisheka is highly beneficial.', 'ચતુર્થ ભાવની શુદ્ધિથી સ્થાયી સંપત્તિ અને સુખ પ્રાપ્ત થશે. શિવ અભિષેક કલ્યાણકારી છે.'),
    },
    5: {
      topic: pickLang(lang, 'संतान, शिक्षा, परीक्षा व प्रेम संबंध', 'Children, Education, Exams & Affection', 'સંતાન, શિક્ષણ, પરીક્ષા અને પ્રેમ સંબંધ'),
      secretThought: pickLang(lang, 'जातक के मन में संतान के भविष्य, प्रतियोगी परीक्षा के परिणाम अथवा किसी भावनात्मक संबंध का प्रश्न है।', 'The hidden concern involves children’s future, competitive exam results, or an emotional bond.', 'જાતકના મનમાં સંતાનના ભવિષ્ય, સ્પર્ધાત્મક પરીક્ષાના પરિણામ અથવા કોઈ ભાવનાત્મક સંબંધનો પ્રશ્ન છે.'),
      solution: pickLang(lang, 'बुद्धि व इष्ट कृपा से शुभ समाचार प्राप्त होगा। गायत्री मंत्र अथवा विष्णु सहस्रनाम का पाठ करें।', 'Wisdom and Ishta grace will bring good news. Chant Gayatri Mantra or Vishnu Sahasranama.', 'બુદ્ધિ અને ઈષ્ટ કૃપાથી શુભ સમાચાર મળશે. ગાયત્રી મંત્ર અથવા વિષ્ણુ સહસ્રનામનો પાઠ કરો.'),
    },
    6: {
      topic: pickLang(lang, 'रोग मुक्ति, ऋण (कर्ज) व गुप्त शत्रु', 'Healing, Debt Relief & Hidden Rivals', 'રોગ મુક્તિ, દેવું (કર્જ) અને ગુપ્ત શત્રુ'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता किसी पुरानी बीमारी, कर्ज के बोझ अथवा कार्यक्षेत्र के विरोधियों/मुकदमे से मुक्ति का मार्ग खोज रहा है।', 'Seeking relief from a lingering ailment, debt burden, or workplace rivals/disputes.', 'પ્રશ્નકર્તા કોઈ જૂની બીમારી, દેવાના બોજ અથવા કાર્યક્ષેત્રના વિરોધીઓ/કેસમાંથી મુક્તિનો માર્ગ શોધી રહ્યો છે.'),
      solution: pickLang(lang, 'धैर्य रखें; षष्ठेश के शमन से शत्रु परास्त होंगे व ऋण घटेगा। बजरंग बाण का पाठ करें।', 'Stay steady; pacifying the 6th lord overcomes rivals and debts. Recite Bajrang Baan.', 'ધૈર્ય રાખો; ષષ્ઠેશના શમનથી શત્રુ પરાસ્ત થશે અને દેવું ઘટશે. બજરંગ બાણનો પાઠ કરો.'),
    },
    7: {
      topic: pickLang(lang, 'विवाह, जीवनसाथी, साझेदारी व खोई वस्तु', 'Marriage, Spouse, Partnership & Recovery', 'લગ્ન, જીવનસાથી, ભાગીદારી અને ખોવાયેલી વસ્તુ'),
      secretThought: pickLang(lang, 'जातक के मन में विवाह प्रस्ताव, जीवनसाथी के साथ सामंजस्य अथवा व्यापारिक साझेदारी का मुख्य प्रश्न है।', 'Focuses on marriage prospects, marital harmony, or a key business partnership.', 'જાતકના મનમાં લગ્ન પ્રસ્તાવ, જીવનસાથી સાથે સુમેળ અથવા વ્યાપારિક ભાગીદારીનો મુખ્ય પ્રશ્ન છે.'),
      solution: pickLang(lang, 'सप्तम भाव सक्रिय होने से शीघ्र समझौता या शुभ रिश्ता तय होगा। शिव-पार्वती पूजन करें।', 'Active 7th house brings swift agreement or auspicious union. Worship Shiva-Parvati.', 'સપ્તમ ભાવ સક્રિય હોવાથી જલ્દી સમજૂતી કે શુભ સંબંધ નક્કી થશે. શિવ-પાર્વતી પૂજન કરો.'),
    },
    8: {
      topic: pickLang(lang, 'गुप्त चिंता, आकस्मिक बाधा व अटका हुआ धन', 'Hidden Anxiety, Sudden Hurdle & Blocked Assets', 'ગુપ્ત ચિંતા, આકસ્મિક અવરોધ અને અટવાયેલું ધન'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता के मन में कोई ऐसी गुप्त आशंका या भय है जिसे वह खुलकर किसी से कह नहीं पा रहा है।', 'Carrying an unspoken apprehension or hidden worry difficult to share openly.', 'પ્રશ્નકર્તાના મનમાં કોઈ એવી ગુપ્ત આશંકા કે ભય છે જે તે ખુલીને કોઈને કહી શકતો નથી.'),
      solution: pickLang(lang, 'अनावश्यक भय त्यागें। महामृत्युंजय मंत्र या रुद्राष्टकम के पाठ से संकट टल जाएगा।', 'Release needless fear. Reciting Mahamrityunjaya Mantra or Rudrashtakam wards off crises.', 'બિનજરૂરી ભય ત્યાગો. મહામૃત્યુંજય મંત્ર કે રુદ્રાષ્ટકમના પાઠથી સંકટ ટળી જશે.'),
    },
    9: {
      topic: pickLang(lang, 'भाग्य उदय, दूर की यात्रा व धर्म कार्य', 'Fortune Rise, Long Travel & Dharma', 'ભાગ્ય ઉદય, લાંબી યાત્રા અને ધર્મ કાર્ય'),
      secretThought: pickLang(lang, 'जातक अपने भाग्योदय, विदेश/तीर्थ यात्रा अथवा किसी बड़े गुरु/वरिष्ठ के सहयोग के विषय में सोच रहा है।', 'Contemplating rising fortune, long/pilgrimage travel, or support from a mentor or elder.', 'જાતક પોતાના ભાગ્યોદય, વિદેશ/તીર્થ યાત્રા અથવા કોઈ મોટા ગુરુ/વડીલના સહયોગ વિશે વિચારી રહ્યો છે.'),
      solution: pickLang(lang, 'भाग्य भाव जागृत है — वरिष्ठों व देव कृपा से मनोरथ पूर्ण होगा। पीपल या केले के वृक्ष की सेवा करें।', '9th house of fortune is awakened—elders and divine grace fulfill your aim. Nurture a Peepal or Banana tree.', 'ભાગ્ય ભાવ જાગૃત છે — વડીલો અને દેવ કૃપાથી મનોરથ પૂર્ણ થશે. પીપળા કે કેળના વૃક્ષની સેવા કરો.'),
    },
    10: {
      topic: pickLang(lang, 'आजीविका, नौकरी, व्यापार व राजकीय कार्य', 'Livelihood, Job, Business & Authority', 'આજીવિકા, નોકરી, વેપાર અને સરકારી કાર્ય'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता के मन में मुख्य प्रश्न अपने करियर, नई नौकरी, व्यापार विस्तार या सरकारी कार्य की सफलता का है।', 'Mainly concerned with career direction, new job, business expansion, or official recognition.', 'પ્રશ્નકર્તાના મનમાં મુખ્ય પ્રશ્ન પોતાની કારકિર્દી, નવી નોકરી, વેપાર વિસ્તાર કે સરકારી કાર્યની સફળતાનો છે.'),
      solution: pickLang(lang, 'कर्म भाव की प्रबलता से पद-प्रतिष्ठा व कार्य में निश्चित उन्नति मिलेगी। आदित्य हृदय स्तोत्र पढ़ें।', 'Strong 10th house assures career elevation and respect. Recite Aditya Hridaya Stotra.', 'કર્મ ભાવની પ્રબળતાથી પદ-પ્રતિષ્ઠા અને કાર્યમાં નિશ્ચિત પ્રગતિ મળશે. આદિત્ય હૃદય સ્તોત્ર વાંચો.'),
    },
    11: {
      topic: pickLang(lang, 'मनोकामना पूर्ति, बड़ा लाभ व मित्र सहयोग', 'Wish Fulfillment, Major Gains & Allies', 'મનોકામના પૂર્તિ, મોટો લાભ અને મિત્ર સહયોગ'),
      secretThought: pickLang(lang, 'जातक किसी विशेष प्रोजेक्ट से होने वाले लाभ, रुके हुए मुनाफे या बड़ी इच्छा की पूर्ति जानना चाहता है।', 'Wondering about returns from a major project, pending profits, or a big goal coming true.', 'જાતક કોઈ ખાસ પ્રોજેક્ટથી થનારા લાભ, અટવાયેલા નફા કે મોટી ઇચ્છાની પૂર્તિ જાણવા માંગે છે.'),
      solution: pickLang(lang, 'लाभ भाव अनुकूल है; अल्प प्रयास से ही अभीष्ट लाभ की प्राप्ति होगी। गणेश अथर्वशीर्ष का पाठ करें।', '11th house of gains is favorable; desired rewards arrive with steady effort. Recite Ganapati Atharvashirsha.', 'લાભ ભાવ અનુકૂળ છે; ઓછા પ્રયાસથી જ ઈચ્છિત લાભની પ્રાપ્તિ થશે. ગણેશ અથર્વશીર્ષનો પાઠ કરો.'),
    },
    12: {
      topic: pickLang(lang, 'अत्यधिक खर्च, विदेश प्रवास व मानसिक शांति', 'Expenses, Foreign Stay & Peace of Mind', 'અતિશય ખર્ચ, વિદેશ પ્રવાસ અને માનસિક શાંતિ'),
      secretThought: pickLang(lang, 'प्रश्नकर्ता बढ़ते हुए खर्चों, बाहरी स्थान में बसने अथवा नींद व मानसिक तनाव को लेकर चिंतित है।', 'Worried about rising expenses, settling abroad, or restless sleep and mental strain.', 'પ્રશ્નકર્તા વધતા ખર્ચાઓ, બહારના સ્થળે વસવાટ અથવા ઊંઘ અને માનસિક તણાવને લઈને ચિંતિત છે.'),
      solution: pickLang(lang, 'व्यय पर नियंत्रण रखें; बाहरी संबंधों या दूरस्थ कार्यों से लाभ मिलेगा। संध्या समय दीपदान करें।', 'Curb excess spending; distant connections bring gains. Light an evening lamp (Deepdaan).', 'ખર્ચ પર નિયંત્રણ રાખો; બહારના સંબંધો કે દૂરના કાર્યોથી લાભ મળશે. સાંજે દીપદાન કરો.'),
    },
  };
}

function getHanumanPrashnaResult(num: number, lang: string): {
  title: string;
  prediction: string;
  timing: string;
  remedy: string;
  grade: 'excellent' | 'good' | 'caution';
} {
  const mod = num % 7;
  if (num === 1 || num === 7 || num === 11 || num === 21 || num === 27 || num === 31 || num === 41 || num === 49) {
    return {
      title: pickLang(lang, `अंक ${num} — श्री हनुमत् कृपा से १००% कार्य सिद्धि`, `Number ${num} — 100% Success by Shri Hanuman’s Grace`, `અંક ${num} — શ્રી હનુમંત કૃપાથી ૧૦૦% કાર્ય સિદ્ધિ`),
      prediction: pickLang(lang, 'आपका संकल्प अत्यंत सात्विक और प्रबल है। पवनपुत्र हनुमान जी की कृपा से आपके मार्ग की समस्त बाधाएँ भस्म होंगी और मनोरथ पूर्ण होगा।', 'Your resolve is pure and mighty. By Lord Hanuman’s grace, all hurdles dissolve and your wish reaches full completion.', 'તમારો સંકલ્પ અત્યંત સાત્વિક અને પ્રબળ છે. પવનપુત્ર હનુમાનજીની કૃપાથી તમારા માર્ગની સર્વ બાધાઓ દૂર થશે અને મનોરથ પૂર્ણ થશે.'),
      timing: pickLang(lang, '७ से २१ दिनों के भीतर शुभ समाचार।', 'Good news within 7 to 21 days.', '૭ થી ૨૧ દિવસની અંદર શુભ સમાચાર.'),
      remedy: pickLang(lang, 'मंगलवार को हनुमान जी को चोला अथवा लड्डू का भोग लगाएँ और सुंदरकांड की चौपाई पढ़ें।', 'Offer Chola or Boondi Laddoo to Hanuman Ji on Tuesday and recite Sundara Kanda verses.', 'મંગળવારે હનુમાનજીને ચોલા અથવા લાડુનો ભોગ ધરાવો અને સુંદરકાંડની ચોપાઈ વાંચો.'),
      grade: 'excellent',
    };
  }
  if (mod === 1 || mod === 3 || mod === 5) {
    return {
      title: pickLang(lang, `अंक ${num} — शुभ फल एवं क्रमिक उन्नति`, `Number ${num} — Auspicious Results & Steady Progress`, `અંક ${num} — શુભ ફળ અને ક્રમિક પ્રગતિ`),
      prediction: pickLang(lang, 'आप जिस कार्य के लिए प्रयासरत हैं, उसमें प्रारंभिक परिश्रम के बाद उत्तम सफलता प्राप्त होगी। मित्रों व परिवार का सहयोग मिलेगा।', 'After initial effort, the endeavor you are pursuing will yield fine success with support from friends and family.', 'તમે જે કાર્ય માટે પ્રયત્નશીલ છો, તેમાં પ્રારંભિક પરિશ્રમ બાદ ઉત્તમ સફળતા મળશે. મિત્રો અને પરિવારનો સહયોગ મળશે.'),
      timing: pickLang(lang, '१ से ३ माह के भीतर अनुकूल परिणाम।', 'Favorable results within 1 to 3 months.', '૧ થી ૩ મહિનાની અંદર અનુકૂળ પરિણામ.'),
      remedy: pickLang(lang, 'नित्य प्रातः हनुमान चालीसा का पाठ करें और लाल पुष्प अर्पित करें।', 'Recite Hanuman Chalisa daily in the morning and offer red flowers.', 'રોજ સવારે હનુમાન ચાલીસાનો પાઠ કરો અને લાલ પુષ્પ અર્પણ કરો.'),
      grade: 'good',
    };
  }
  if (mod === 2 || mod === 6) {
    return {
      title: pickLang(lang, `अंक ${num} — धैर्य रखें, परिश्रम से सफलता`, `Number ${num} — Stay Patient, Success Through Effort`, `અંક ${num} — ધૈર્ય રાખો, પરિશ્રમથી સફળતા`),
      prediction: pickLang(lang, 'कार्य में अभी कुछ अड़चनें या विलंब दिख रहा है। जल्दबाजी में कोई बड़ा आर्थिक जोखिम न लें, सोच-समझकर कदम बढ़ाएँ।', 'Temporary delays or hurdles are indicated. Avoid hasty financial risks and proceed thoughtfully.', 'કાર્યમાં અત્યારે થોડી અડચણો કે વિલંબ દેખાય છે. ઉતાવળમાં કોઈ મોટું આર્થિક જોખમ ન લેશો, સમજી-વિચારીને ડગલું ભરો.'),
      timing: pickLang(lang, '४० से ४५ दिनों के पश्चात स्थिति अनुकूल होगी।', 'Conditions turn favorable after 40 to 45 days.', '૪૦ થી ૪૫ દિવસ પછી સ્થિતિ અનુકૂળ થશે.'),
      remedy: pickLang(lang, 'शनिवार को पीपल के नीचे सरसों के तेल का दीपक जलाएँ और संकटमोचन हनुमानाष्टक पढ़ें।', 'Light a mustard-oil lamp under a Peepal tree on Saturday and recite Sankatmochan Hanumanashtak.', 'શનિવારે પીપળા નીચે સરસવના તેલનો દીવો પ્રગટાવો અને સંકટમોચન હનુમાનાષ્ટક વાંચો.'),
      grade: 'caution',
    };
  }
  return {
    title: pickLang(lang, `अंक ${num} — इष्ट कृपा व मनोरथ पूर्ति`, `Number ${num} — Divine Grace & Fulfillment`, `અંક ${num} — ઈષ્ટ કૃપા અને મનોરથ પૂર્તિ`),
    prediction: pickLang(lang, 'आपके रुके हुए कार्य पुनः गति पकड़ेंगे। धन व मान-सम्मान में वृद्धि का योग बन रहा है।', 'Stalled tasks will regain momentum. Gains in wealth and respect are strongly indicated.', 'તમારા અટકેલા કાર્યો ફરી ગતિ પકડશે. ધન અને માન-સન્માનમાં વૃદ્ધિનો યોગ બની રહ્યો છે.'),
    timing: pickLang(lang, '१५ से ३० दिनों में सकारात्मक परिवर्तन।', 'Positive shift within 15 to 30 days.', '૧૫ થી ૩૦ દિવસમાં સકારાત્મક પરિવર્તન.'),
    remedy: pickLang(lang, 'मंगलवार को गुड़-चने का प्रसाद बाँटें और "ॐ हं हनुमते नमः" की १ माला जपें।', 'Distribute jaggery & roasted gram on Tuesday and chant 1 mala of "ॐ हं हनुमते नमः".', 'મંગળવારે ગોળ-ચણાનો પ્રસાદ વહેંચો અને "ॐ हं हनुमते नमः" ની ૧ માળા જપો.'),
    grade: 'good',
  };
}

export const PrashnaJyotishPanel: React.FC<PrashnaJyotishPanelProps> = ({ currentLocation }) => {
  const { language } = useLanguage();
  const lang = (language || 'hi').slice(0, 2).toLowerCase();
  const [subTab, setSubTab] = useState<'horary' | 'ramshalaka' | 'hanuman'>('horary');

  const questionCategories = useMemo(() => getQuestionCategories(lang), [lang]);
  const ramshalakaChaupais = useMemo(() => getRamshalakaChaupais(lang), [lang]);
  const mookPrashnaByHouse = useMemo(() => getMookPrashnaByHouse(lang), [lang]);

  // Tab 1: Horary & Mook Prashna State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('mook');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isQueryEdited, setIsQueryEdited] = useState<boolean>(false);
  const [prashnaNumber, setPrashnaNumber] = useState<number>(() => ((new Date().getMinutes() * 7 + new Date().getSeconds()) % 108) + 1);
  const [castTimestamp, setCastTimestamp] = useState<number>(() => Date.now());

  // Tab 2: Ramshalaka State
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [ramQuestion, setRamQuestion] = useState<string>('');

  // Tab 3: Hanuman Prashnavali State
  const [selectedHanumanNum, setSelectedHanumanNum] = useState<number | null>(null);

  // HD Poster Modal State
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);

  const selectedCategory = useMemo(
    () => questionCategories.find((c) => c.id === selectedCategoryId) || questionCategories[0],
    [questionCategories, selectedCategoryId]
  );

  const displayQuery = isQueryEdited ? customQuery : selectedCategory.defaultQuery;

  const handleCategoryChange = (cat: QuestionCategory) => {
    setSelectedCategoryId(cat.id);
    setCustomQuery(cat.defaultQuery);
    setIsQueryEdited(false);
  };

  const handleRecastPrashna = () => {
    setCastTimestamp(Date.now());
  };

  // Compute Horary Chart & Detailed Vedic Analysis
  const horaryEvaluation = useMemo(() => {
    const pk = generatePrashnaKundali(
      displayQuery.trim() || selectedCategory.defaultQuery,
      currentLocation.latitude,
      currentLocation.longitude
    );

    const lagnaIdx = pk.lagnaRashiNumber - 1;
    const arudhaIdx = (lagnaIdx + ((prashnaNumber - 1) % 12)) % 12;
    const arudhaRashi = RASHIS[arudhaIdx];

    const lagnesh = RASHI_LORDS[lagnaIdx] || 'सूर्य';
    const karyeshRashiIdx = (lagnaIdx + selectedCategory.house - 1) % 12;
    const karyeshRashi = RASHIS[karyeshRashiIdx];
    const karyesh = RASHI_LORDS[karyeshRashiIdx] || 'गुरु';

    const lagneshPlanet = pk.planets.find((p) => p.planet === lagnesh) || pk.planets[0];
    const karyeshPlanet = pk.planets.find((p) => p.planet === karyesh) || pk.planets[1];
    const moonPlanet = pk.planets.find((p) => p.planet === 'चंद्र') || pk.planets[0];

    const kendraTrikona = [1, 4, 5, 7, 9, 10, 11];
    const lagneshStrong = kendraTrikona.includes(lagneshPlanet.house) && !lagneshPlanet.isRetrograde;
    const karyeshStrong = kendraTrikona.includes(karyeshPlanet.house) && !karyeshPlanet.isRetrograde;
    const moonStrong = [1, 2, 4, 5, 7, 9, 10, 11].includes(moonPlanet.house);

    const isSameLord = lagnesh === karyesh;
    const isFriendly =
      isSameLord ||
      GRAHA_MAITRI_MATRIX[lagnesh]?.friends.includes(karyesh) ||
      GRAHA_MAITRI_MATRIX[karyesh]?.friends.includes(lagnesh);

    let successScore = 52;
    if (lagneshStrong) successScore += 15;
    if (karyeshStrong) successScore += 16;
    if (moonStrong) successScore += 10;
    if (isFriendly) successScore += 7;
    if ([1, 5, 9, 11].includes(prashnaNumber % 12)) successScore += 5;
    successScore = Math.min(98, Math.max(28, successScore));

    const DIRECTIONS = pickLang(
      lang,
      ['पूर्व (East)', 'दक्षिण (South)', 'पश्चिम (West)', 'उत्तर (North)'],
      ['East', 'South', 'West', 'North'],
      ['પૂર્વ (East)', 'દક્ષિણ (South)', 'પશ્ચિમ (West)', 'ઉત્તર (North)']
    );
    const direction = DIRECTIONS[lagnaIdx % 4];

    const mookFocusHouse = ((moonPlanet.house + (prashnaNumber % 3) - 1) % 12) + 1;
    const mookInsight = mookPrashnaByHouse[mookFocusHouse] || mookPrashnaByHouse[1];

    const locLagnesh = trPlanet(lagnesh, lang);
    const locKaryesh = trPlanet(karyesh, lang);
    const locMoonRashi = trRashi(pk.moonRashi, lang);

    let verdictTitle = '';
    let verdictSummary = '';
    let timingText = '';
    if (successScore >= 75) {
      verdictTitle = pickLang(lang, 'प्रबल कार्य सिद्धि योग (अति शुभ)', 'Strong Success Yoga (Highly Auspicious)', 'પ્રબળ કાર્ય સિદ્ધિ યોગ (અતિ શુભ)');
      verdictSummary = pickLang(
        lang,
        `प्रश्न लग्नेश (${locLagnesh}) एवं कार्येश (${locKaryesh}) दोनों शुभ स्थान में हैं और चंद्र (${locMoonRashi}) अनुकूल है। आपका मनोरथ निश्चित रूप से सिद्ध होगा।`,
        `Prashna Lagna Lord (${locLagnesh}) and Karyesh (${locKaryesh}) are both well placed while Moon (${locMoonRashi}) is supportive. Your desire will surely be fulfilled.`,
        `પ્રશ્ન લગ્નેશ (${locLagnesh}) અને કાર્યેશ (${locKaryesh}) બંને શુભ સ્થાનમાં છે તથા ચંદ્ર (${locMoonRashi}) અનુકૂળ છે. તમારો મનોરથ નિશ્ચિત સિદ્ધ થશે.`
      );
      timingText = pickLang(lang, 'शीघ्र फल प्राप्ति (७ से २१ दिनों अथवा वर्तमान पक्ष में)', 'Swift fruition (within 7 to 21 days or current fortnight)', 'ઝડપી ફળ પ્રાપ્તિ (૭ થી ૨૧ દિવસમાં અથવા વર્તમાન પખવાડિયામાં)');
    } else if (successScore >= 58) {
      verdictTitle = pickLang(lang, 'मध्यम-शुभ (प्रयास से निश्चित सफलता)', 'Moderately Auspicious (Success with Effort)', 'મધ્યમ-શુભ (પ્રયાસથી નિશ્ચિત સફળતા)');
      verdictSummary = pickLang(
        lang,
        `लग्नेश (${locLagnesh}) और कार्येश (${locKaryesh}) का संबंध अनुकूल है, किंतु कुछ सूक्ष्म अवरोध के बाद कार्य सफल होगा। धैर्य और निरंतर प्रयास बनाए रखें।`,
        `The relationship between Lagnesh (${locLagnesh}) and Karyesh (${locKaryesh}) is harmonious, though minor hurdles precede completion. Maintain patience and steady effort.`,
        `લગ્નેશ (${locLagnesh}) અને કાર્યેશ (${locKaryesh}) નો સંબંધ અનુકૂળ છે, પરંતુ થોડા અવરોધો બાદ કાર્ય સફળ થશે. ધૈર્ય અને સતત પ્રયાસ જાળવી રાખો.`
      );
      timingText = pickLang(lang, 'मध्यम अवधि (१ से ३ माह के भीतर)', 'Medium term (within 1 to 3 months)', 'મધ્યમ અવધિ (૧ થી ૩ મહિનાની અંદર)');
    } else {
      verdictTitle = pickLang(lang, 'विलंब व बाधा योग (सावधानी आवश्यक)', 'Delay & Obstruction Yoga (Caution Advised)', 'વિલંબ અને બાધા યોગ (સાવધાની આવશ્યક)');
      verdictSummary = pickLang(
        lang,
        `वर्तमान प्रश्न कुंडली में कार्येश (${locKaryesh}) अथवा चंद्र बल कमजोर होने से अभी कार्य में रुकावट दिख रही है। आवश्यक वैदिक उपाय करने के पश्चात ही कदम बढ़ाएँ।`,
        `Weakness in Karyesh (${locKaryesh}) or Moon strength indicates temporary obstacles in the Prashna chart. Perform the suggested remedies before taking major steps.`,
        `વર્તમાન પ્રશ્ન કુંડળીમાં કાર્યેશ (${locKaryesh}) અથવા ચંદ્ર બળ નબળું હોવાથી અત્યારે કાર્યમાં અવરોધ દેખાય છે. જરૂરી વૈદિક ઉપાય કર્યા પછી જ આગળ વધો.`
      );
      timingText = pickLang(lang, 'विलंबित योग (३ माह पश्चात स्थिति सुधरेगी)', 'Delayed alignment (conditions improve after 3 months)', 'વિલંબિત યોગ (૩ મહિના પછી સ્થિતિ સુધરશે)');
    }

    return {
      kundali: pk,
      lagnesh,
      lagneshPlanet,
      karyesh,
      karyeshRashi,
      karyeshPlanet,
      moonPlanet,
      arudhaRashi,
      isFriendly,
      successScore,
      direction,
      mookFocusHouse,
      mookInsight,
      verdictTitle,
      verdictSummary,
      timingText,
    };
  }, [displayQuery, selectedCategory, currentLocation, prashnaNumber, castTimestamp, lang, mookPrashnaByHouse]);

  const activeRamChaupai = useMemo(() => {
    if (selectedCellIndex === null) return null;
    const cell = RAMSHALAKA_CELLS[selectedCellIndex];
    if (!cell) return null;
    return ramshalakaChaupais.find((c) => c.id === cell.chaupaiId) || ramshalakaChaupais[0];
  }, [selectedCellIndex, ramshalakaChaupais]);

  const activeHanumanResult = useMemo(() => {
    if (selectedHanumanNum === null) return null;
    return getHanumanPrashnaResult(selectedHanumanNum, lang);
  }, [selectedHanumanNum, lang]);

  return (
    <div className="space-y-4">
      {/* Top 3-in-1 Sub-Tab Selector */}
      <div
        className="p-1.5 rounded-2xl border-2 border-[#8C6239]/50 grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-xs"
        style={{ backgroundColor: '#FAF2E4' }}
      >
        {[
          {
            id: 'horary',
            label: pickLang(lang, '🔮 १. तात्कालिक प्रश्न व मूक प्रश्न', '🔮 1. Horary & Mook Prashna', '🔮 ૧. તાત્કાલિક પ્રશ્ન અને મૂક પ્રશ્ન'),
            sub: pickLang(lang, 'लग्नेश-कार्येश व गुप्त प्रश्न विचार', 'Lagnesh–Karyesh & silent thought chart', 'લગ્નેશ-કાર્યેશ અને ગુપ્ત પ્રશ્ન વિચાર'),
          },
          {
            id: 'ramshalaka',
            label: pickLang(lang, '🏹 २. श्री रामशलाका प्रश्नावली', '🏹 2. Shri Ramshalaka Grid', '🏹 ૨. શ્રી રામશલાકા પ્રશ્નાવલી'),
            sub: pickLang(lang, 'तुलसीदास कृत ९×९ अक्षर चक्र', 'Goswami Tulsidas 9×9 Sacred Grid', 'તુલસીદાસ કૃત ૯×૯ અક્ષર ચક્ર'),
          },
          {
            id: 'hanuman',
            label: pickLang(lang, '🔱 ३. श्री हनुमान प्रश्नावली (१-४९)', '🔱 3. Shri Hanuman Yantra (1–49)', '🔱 ૩. શ્રી હનુમાન પ્રશ્નાવલી (૧-૪૯)'),
            sub: pickLang(lang, 'संकटमोचन हनुमत् ज्योतिष यंत्र', 'Sankatmochan Hanumat Oracle Yantra', 'સંકટમોચન હનુમંત જ્યોતિષ યંત્ર'),
          },
        ].map((t) => {
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as 'horary' | 'ramshalaka' | 'hanuman')}
              className="p-2.5 rounded-xl text-left transition cursor-pointer border"
              style={{
                backgroundColor: isActive ? '#6E1409' : '#FFFDF8',
                color: isActive ? '#FFFFFF' : '#4A0E0E',
                borderColor: isActive ? '#6E1409' : 'rgba(140,98,57,0.35)',
              }}
            >
              <div className="text-xs sm:text-sm font-black">{t.label}</div>
              <div
                className="text-[10px] mt-0.5 font-semibold"
                style={{ color: isActive ? '#FFE5B4' : '#735133' }}
              >
                {t.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: HORARY PRASHNA KUNDALI & MOOK PRASHNA */}
      {/* =================================================================== */}
      {subTab === 'horary' && (
        <div className="space-y-4">
          {/* Input & Category Card */}
          <div
            className="rounded-2xl border-2 border-[#8C6239]/45 p-4 sm:p-5 space-y-4 shadow-xs"
            style={{ backgroundColor: '#FFFDF8', color: '#2B1105' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/25 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black font-granth flex items-center gap-2" style={{ color: '#4A0E0E' }}>
                  <HelpCircle className="w-5 h-5 text-[#B56A00]" />
                  <span>{pickLang(lang, 'तात्कालिक प्रश्न कुंडली एवं मूक प्रश्न रहस्य', 'Instant Horary Prashna & Mook Prashna Analysis', 'તાત્કાલિક પ્રશ્ન કુંડળી અને મૂક પ્રશ્ન રહસ્ય')}</span>
                </h3>
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#5C3A21' }}>
                  {pickLang(
                    lang,
                    'जन्म कुंडली न होने पर भी प्रश्न पूछने के क्षण के लग्न, चंद्र, कार्येश एवं १–१०८ प्रश्न संख्या से सटीक भविष्यवाणी',
                    'Accurate Vedic prediction even without a birth chart using moment-of-query Lagna, Moon, Karyesh & 1–108 Prashna number',
                    'જન્મ કુંડળી ન હોવા છતાં પ્રશ્ન પૂછવાના ક્ષણના લગ્ન, ચંદ્ર, કાર્યેશ અને ૧–૧૦૮ પ્રશ્ન સંખ્યાથી સચોટ ભવિષ્યવાણી'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecastPrashna}
                  className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
                  style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{pickLang(lang, 'तात्कालिक चक्र अपडेट करें', 'Refresh Instant Chart', 'તાત્કાલિક ચક્ર અપડેટ કરો')}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPosterData({
                      title: pickLang(lang, 'तात्कालिक प्रश्न कुंडली फलादेश', 'Horary Prashna Chart Prediction', 'તાત્કાલિક પ્રશ્ન કુંડળી ફળાદેશ'),
                      reference: `${pickLang(lang, 'प्रश्न लग्न:', 'Prashna Lagna:', 'પ્રશ્ન લગ્ન:')} ${trRashi(horaryEvaluation.kundali.lagnaRashi, lang)} • ${trPlanet('चंद्र', lang)}: ${trRashi(horaryEvaluation.kundali.moonRashi, lang)} (${trVedic(horaryEvaluation.kundali.nakshatra, lang)})`,
                      sanskrit: `${pickLang(lang, 'प्रश्न:', 'Query:', 'પ્રશ્ન:')} "${displayQuery}"\n${pickLang(lang, 'निर्णय:', 'Verdict:', 'નિર્ણય:')} ${horaryEvaluation.verdictTitle} (${horaryEvaluation.successScore}%)`,
                      meaning: `${horaryEvaluation.verdictSummary}\n\n${pickLang(lang, 'मूक प्रश्न संकेत:', 'Mook Prashna Insight:', 'મૂક પ્રશ્ન સંકેત:')} ${horaryEvaluation.mookInsight.secretThought}\n${pickLang(lang, 'समाधान:', 'Solution:', 'સમાધાન:')} ${horaryEvaluation.mookInsight.solution}`,
                      accentTag: pickLang(lang, '🔮 वैदिक प्रश्न ज्योतिष', '🔮 Vedic Prashna Jyotish', '🔮 વૈદિક પ્રશ્ન જ્યોતિષ'),
                    })
                  }
                  className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border border-[#B56A00] transition cursor-pointer active:scale-95"
                  style={{ backgroundColor: '#FAF2E4', color: '#4A0E0E' }}
                >
                  <Share2 className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>{pickLang(lang, '📸 स्टेटस कार्ड', '📸 Status Card', '📸 સ્ટેટસ કાર્ડ')}</span>
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-black block" style={{ color: '#5C3A21' }}>
                {pickLang(lang, '१. प्रश्न का विषय चुनें (अथवा "मूक प्रश्न" चुनें):', '1. Choose Query Topic (or select "Mook Prashna"):', '૧. પ્રશ્નનો વિષય પસંદ કરો (અથવા "મૂક પ્રશ્ન" પસંદ કરો):')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {questionCategories.map((cat) => {
                  const isSel = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border"
                      style={{
                        backgroundColor: isSel ? '#6E1409' : '#FAF2E4',
                        color: isSel ? '#FFFFFF' : '#4A0E0E',
                        borderColor: isSel ? '#6E1409' : 'rgba(140,98,57,0.4)',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Input + 1-108 Prashna Number */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              <div className="md:col-span-8">
                <label className="text-xs font-black block mb-1" style={{ color: '#5C3A21' }}>
                  {pickLang(lang, '२. आपका प्रश्न (मन में सोचें या यहाँ लिखें):', '2. Your Question (contemplate or type here):', '૨. તમારો પ્રશ્ન (મનમાં વિચારો અથવા અહીં લખો):')}
                </label>
                <input
                  type="text"
                  value={displayQuery}
                  onChange={(e) => {
                    setCustomQuery(e.target.value);
                    setIsQueryEdited(true);
                  }}
                  className="w-full rounded-xl p-2.5 text-xs sm:text-sm font-bold border border-[#8C6239]/50 outline-none"
                  style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
                  placeholder={pickLang(lang, 'अपना प्रश्न लिखें...', 'Type your question...', 'તમારો પ્રશ્ન લખો...')}
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-black flex items-center justify-between mb-1" style={{ color: '#5C3A21' }}>
                  <span>{pickLang(lang, '३. प्रश्न संख्या (1 से 108):', '3. Prashna Number (1 to 108):', '૩. પ્રશ્ન સંખ્યા (1 થી 108):')}</span>
                  <button
                    type="button"
                    onClick={() => setPrashnaNumber(Math.floor(Math.random() * 108) + 1)}
                    className="text-[11px] underline font-black cursor-pointer"
                    style={{ color: '#8B1E1E' }}
                  >
                    {pickLang(lang, 'दैवीय अंक चुनें 🎲', 'Pick Divine Number 🎲', 'દૈવી અંક પસંદ કરો 🎲')}
                  </button>
                </label>
                <input
                  type="number"
                  min={1}
                  max={108}
                  value={prashnaNumber}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(108, Number(e.target.value) || 1));
                    setPrashnaNumber(v);
                  }}
                  className="w-full rounded-xl p-2.5 text-xs sm:text-sm font-black border border-[#8C6239]/50 outline-none"
                  style={{ backgroundColor: '#FAF2E4', color: '#4A0E0E' }}
                />
              </div>
            </div>
          </div>

          {/* Mook Prashna (Silent Question) Special Card */}
          <div
            className="rounded-2xl border-2 border-[#B56A00] p-4 sm:p-5 space-y-2.5 shadow-sm"
            style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#8B1E1E]" />
                <h4 className="text-sm sm:text-base font-black font-granth" style={{ color: '#4A0E0E' }}>
                  {pickLang(lang, 'मूक प्रश्न रहस्य — बिना बताए जातक के मन की बात (षट्पंचाशिका नियम)', 'Mook Prashna Secret — Reading Unspoken Thoughts (Shatpanchashika Rule)', 'મૂક પ્રશ્ન રહસ્ય — કહ્યા વિના જાતકના મનની વાત (ષટ્પંચાશિકા નિયમ)')}
                </h4>
              </div>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-lg border border-[#8C6239]/40"
                style={{ backgroundColor: '#FFFDF8', color: '#6E1409' }}
              >
                {pickLang(lang, 'सक्रिय भाव:', 'Active House:', 'સક્રિય ભાવ:')} {horaryEvaluation.mookFocusHouse} | {pickLang(lang, 'आरूढ़ राशि:', 'Arudha Rashi:', 'આરૂઢ રાશિ:')} {trRashi(horaryEvaluation.arudhaRashi, lang)}
              </span>
            </div>

            <div
              className="p-3.5 rounded-xl border border-[#8C6239]/35 space-y-1.5"
              style={{ backgroundColor: '#FFFDF8', color: '#2B1105' }}
            >
              <div className="text-xs sm:text-sm font-black" style={{ color: '#8B1E1E' }}>
                {pickLang(lang, 'मन का मुख्य विषय:', 'Primary Focus of Mind:', 'મનનો મુખ્ય વિષય:')} {horaryEvaluation.mookInsight.topic}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-semibold" style={{ color: '#2B1105' }}>
                <strong>{pickLang(lang, 'गुप्त विचार:', 'Hidden Thought:', 'ગુપ્ત વિચાર:')}</strong> {horaryEvaluation.mookInsight.secretThought}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed font-bold pt-1" style={{ color: '#4A0E0E' }}>
                <strong>{pickLang(lang, 'दैवज्ञ समाधान:', 'Vedic Guidance:', 'દૈવજ્ઞ સમાધાન:')}</strong> {horaryEvaluation.mookInsight.solution}
              </p>
            </div>
          </div>

          {/* Main Horary Chart + Detailed Lagnesh/Karyesh Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5">
              <KundaliChart
                lagnaDegree={horaryEvaluation.kundali.lagnaDegree}
                planets={horaryEvaluation.kundali.planets}
                chartTitle={`${pickLang(lang, 'तात्कालिक प्रश्न कुंडली', 'Instant Horary Chart', 'તાત્કાલિક પ્રશ્ન કુંડળી')} (${horaryEvaluation.kundali.birthTime})`}
              />
            </div>

            <div
              className="lg:col-span-7 rounded-2xl border-2 border-[#8C6239]/45 p-4 sm:p-5 space-y-4"
              style={{ backgroundColor: '#FFFDF8', color: '#2B1105' }}
            >
              {/* Verdict Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/25 pb-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#8C6239' }}>
                    {pickLang(lang, 'तात्कालिक प्रश्न निर्णय', 'Horary Verdict', 'તાત્કાલિક પ્રશ્ન નિર્ણય')} ({selectedCategory.houseName})
                  </div>
                  <div className="text-lg sm:text-xl font-black font-granth mt-0.5" style={{ color: '#4A0E0E' }}>
                    {horaryEvaluation.verdictTitle}
                  </div>
                </div>
                <div
                  className="px-3.5 py-2 rounded-xl font-black text-sm border"
                  style={{
                    backgroundColor: horaryEvaluation.successScore >= 70 ? '#E6F4EA' : '#FEF3C7',
                    color: horaryEvaluation.successScore >= 70 ? '#137333' : '#92400E',
                    borderColor: horaryEvaluation.successScore >= 70 ? '#34A853' : '#F59E0B',
                  }}
                >
                  {pickLang(lang, 'सिद्धि बल:', 'Success Score:', 'સિદ્ધિ બળ:')} {horaryEvaluation.successScore}%
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed font-semibold" style={{ color: '#2B1105' }}>
                {horaryEvaluation.verdictSummary}
              </p>

              {/* 4 Key Horary Factors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>
                    {pickLang(lang, 'प्रश्न लग्न व स्वामी', 'Prashna Lagna & Lord', 'પ્રશ્ન લગ્ન અને સ્વામી')}
                  </div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {trRashi(horaryEvaluation.kundali.lagnaRashi, lang)} ({trPlanet(horaryEvaluation.lagnesh, lang)})
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    {pickLang(lang, 'भाव:', 'House:', 'ભાવ:')} {horaryEvaluation.lagneshPlanet.house} ({trRashi(horaryEvaluation.lagneshPlanet.rashi, lang)})
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>
                    {pickLang(lang, `कार्येश ग्रह (${selectedCategory.house} भाव)`, `Karyesh (${selectedCategory.house}th House)`, `કાર્યેશ ગ્રહ (${selectedCategory.house} ભાવ)`)}
                  </div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {trPlanet(horaryEvaluation.karyesh, lang)} ({trRashi(horaryEvaluation.karyeshRashi, lang)})
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    {pickLang(lang, `भाव: ${horaryEvaluation.karyeshPlanet.house} में स्थित`, `Placed in House ${horaryEvaluation.karyeshPlanet.house}`, `ભાવ ${horaryEvaluation.karyeshPlanet.house} માં સ્થિત`)}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>
                    {pickLang(lang, 'चंद्र एवं नक्षत्र बल', 'Moon & Nakshatra Strength', 'ચંદ્ર અને નક્ષત્ર બળ')}
                  </div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {trRashi(horaryEvaluation.kundali.moonRashi, lang)}
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    {trVedic(horaryEvaluation.kundali.nakshatra, lang)} ({pickLang(lang, `भाव ${horaryEvaluation.moonPlanet.house}`, `House ${horaryEvaluation.moonPlanet.house}`, `ભાવ ${horaryEvaluation.moonPlanet.house}`)})
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>
                    {pickLang(lang, 'शुभ दिशा व आरूढ़', 'Direction & Arudha', 'શુભ દિશા અને આરૂઢ')}
                  </div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {horaryEvaluation.direction}
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    {pickLang(lang, 'अंक', 'No.', 'અંક')} #{prashnaNumber} ({trRashi(horaryEvaluation.arudhaRashi, lang)})
                  </div>
                </div>
              </div>

              {/* Timing & Remedy */}
              <div
                className="p-3.5 rounded-xl border border-[#8C6239]/35 space-y-1.5"
                style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
              >
                <div className="flex items-center gap-1.5 text-xs font-black" style={{ color: '#6E1409' }}>
                  <Clock className="w-4 h-4 text-[#B56A00]" />
                  <span>{pickLang(lang, 'कार्य सिद्धि का संभावित समय:', 'Estimated Timing:', 'કાર્ય સિદ્ધિનો સંભવિત સમય:')} {horaryEvaluation.timingText}</span>
                </div>
                <p className="text-xs leading-relaxed font-semibold" style={{ color: '#3A1807' }}>
                  <strong>{pickLang(lang, 'तात्कालिक उपाय:', 'Instant Remedy:', 'તાત્કાલિક ઉપાય:')}</strong>{' '}
                  {pickLang(
                    lang,
                    <>कार्येश ग्रह <strong>{trPlanet(horaryEvaluation.karyesh, lang)}</strong> एवं लग्नेश <strong>{trPlanet(horaryEvaluation.lagnesh, lang)}</strong> की अनुकूलता हेतु इष्टदेव को पीले पुष्प अर्पित करें और घर से निकलते समय गुड़-धनिया या जल ग्रहण कर प्रस्थान करें।</>,
                    <>To harmonize Karyesh <strong>{trPlanet(horaryEvaluation.karyesh, lang)}</strong> and Lagnesh <strong>{trPlanet(horaryEvaluation.lagnesh, lang)}</strong>, offer yellow flowers to your Ishta Devata and take a sip of water or jaggery before stepping out.</>,
                    <>કાર્યેશ ગ્રહ <strong>{trPlanet(horaryEvaluation.karyesh, lang)}</strong> અને લગ્નેશ <strong>{trPlanet(horaryEvaluation.lagnesh, lang)}</strong> ની અનુકૂળતા માટે ઇષ્ટદેવને પીળા પુષ્પ અર્પણ કરો અને ઘરેથી નીકળતી વખતે ગોળ-ધાણા કે જળ ગ્રહણ કરીને પ્રસ્થાન કરો.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SHRI RAMSHALAKA PRASHNAVALI (9x9 TULSIDAS GRID) */}
      {/* =================================================================== */}
      {subTab === 'ramshalaka' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl border-2 border-[#8C6239]/45 p-4 sm:p-5 space-y-4"
            style={{ backgroundColor: '#FFFDF8', color: '#2B1105' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/25 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black font-granth" style={{ color: '#4A0E0E' }}>
                  {pickLang(lang, '॥ श्री रामशलाका प्रश्नावली (गोस्वामी तुलसीदास कृत) ॥', 'Shri Ramshalaka Prashnavali (Goswami Tulsidas)', '॥ શ્રી રામશલાકા પ્રશ્નાવલી (ગોસ્વામી તુલસીદાસ કૃત) ॥')}
                </h3>
                <p className="text-xs mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                  {pickLang(
                    lang,
                    'प्रभु श्री सीताराम का स्मरण कर अपने मन में प्रश्न सोचें और नीचे दिए गए ८१ अक्षरों में से किसी एक अक्षर पर श्रद्धापूर्वक स्पर्श करें।',
                    'Contemplate your question while remembering Shri Sitaram and respectfully tap any one of the 81 sacred syllables below.',
                    'પ્રભુ શ્રી સીતારામનું સ્મરણ કરી તમારા મનમાં પ્રશ્ન વિચારો અને નીચે આપેલા ૮૧ અક્ષરોમાંથી કોઈ એક અક્ષર પર શ્રદ્ધાપૂર્વક સ્પર્શ કરો.'
                  )}
                </p>
              </div>
              {selectedCellIndex !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedCellIndex(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black border border-[#8C6239]/40 cursor-pointer"
                  style={{ backgroundColor: '#FAF2E4', color: '#4A0E0E' }}
                >
                  {pickLang(lang, 'पुनः नया अक्षर चुनें ↻', 'Choose Another Syllable ↻', 'ફરી નવો અક્ષર પસંદ કરો ↻')}
                </button>
              )}
            </div>

            <input
              type="text"
              value={ramQuestion}
              onChange={(e) => setRamQuestion(e.target.value)}
              placeholder={pickLang(
                lang,
                'वैकल्पिक: अपना मनोरथ या प्रश्न यहाँ लिखें (जैसे: क्या यह कार्य शुभ होगा?)...',
                'Optional: write your wish or question here (e.g. Will this endeavor be auspicious?)...',
                'વૈકલ્પિક: તમારો મનોરથ કે પ્રશ્ન અહીં લખો (જેમ કે: શું આ કાર્ય શુભ થશે?)...'
              )}
              className="w-full rounded-xl p-2.5 text-xs sm:text-sm font-bold border border-[#8C6239]/45 outline-none"
              style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
            />

            {/* 9x9 Sacred Grid */}
            <div
              className="grid grid-cols-9 gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-2xl border-2 border-[#B56A00]"
              style={{ backgroundColor: '#FAF2E4' }}
            >
              {RAMSHALAKA_CELLS.map((cell, idx) => {
                const isSelected = selectedCellIndex === idx;
                const isSameChaupai =
                  activeRamChaupai !== null && cell.chaupaiId === activeRamChaupai.id;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCellIndex(idx)}
                    className="aspect-square rounded-lg sm:rounded-xl font-black text-xs sm:text-base flex items-center justify-center transition cursor-pointer select-none border shadow-2xs active:scale-90"
                    style={{
                      backgroundColor: isSelected
                        ? '#6E1409'
                        : isSameChaupai
                        ? '#FDE68A'
                        : '#FFFDF8',
                      color: isSelected ? '#FFFFFF' : '#4A0E0E',
                      borderColor: isSelected
                        ? '#FFD88A'
                        : isSameChaupai
                        ? '#B56A00'
                        : 'rgba(140,98,57,0.35)',
                    }}
                  >
                    {cell.akshara}
                  </button>
                );
              })}
            </div>

            {/* Result Chaupai Card */}
            {activeRamChaupai && (
              <div
                className="rounded-2xl border-2 border-[#6E1409] p-4 sm:p-5 space-y-3 animate-in fade-in duration-200"
                style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/30 pb-2.5">
                  <div>
                    <span
                      className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md"
                      style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                    >
                      {pickLang(lang, `प्राप्त चौपाई #${activeRamChaupai.id}`, `Received Chaupai #${activeRamChaupai.id}`, `પ્રાપ્ત ચોપાઈ #${activeRamChaupai.id}`)}
                    </span>
                    <div className="text-xs font-bold mt-1" style={{ color: '#5C3A21' }}>
                      {activeRamChaupai.kanda}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPosterData({
                        title: pickLang(lang, 'श्री रामशलाका प्रश्नावली निर्णय', 'Shri Ramshalaka Prashnavali Verdict', 'શ્રી રામશલાકા પ્રશ્નાવલી નિર્ણય'),
                        reference: activeRamChaupai.kanda,
                        sanskrit: activeRamChaupai.chaupai,
                        meaning: `${activeRamChaupai.meaning}\n\n${pickLang(lang, 'फलादेश:', 'Verdict:', 'ફળાદેશ:')} ${activeRamChaupai.verdict}`,
                        accentTag: pickLang(lang, '🏹 श्री रामचरितमानस प्रश्नावली', '🏹 Shri Ramcharitmanas Oracle', '🏹 શ્રી રામચરિતમાનસ પ્રશ્નાવલી'),
                      })
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{pickLang(lang, '📸 चौपाई स्टेटस कार्ड', '📸 Chaupai Status Card', '📸 ચોપાઈ સ્ટેટસ કાર્ડ')}</span>
                  </button>
                </div>

                <div
                  className="p-4 rounded-xl border border-[#B56A00]/50 text-center space-y-1.5"
                  style={{ backgroundColor: '#FFFDF8' }}
                >
                  <p className="text-base sm:text-xl font-black font-granth leading-relaxed" style={{ color: '#6E1409' }}>
                    ॥ {activeRamChaupai.chaupai} ॥
                  </p>
                  <p className="text-xs font-bold" style={{ color: '#5C3A21' }}>
                    {pickLang(lang, 'प्रसंग:', 'Context:', 'પ્રસંગ:')} {activeRamChaupai.context}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  <p style={{ color: '#2B1105' }}>
                    <strong>{pickLang(lang, 'चौपाई भावार्थ:', 'Meaning:', 'ચોપાઈ ભાવાર્થ:')}</strong> {activeRamChaupai.meaning}
                  </p>
                  <p className="font-bold leading-relaxed pt-1" style={{ color: '#4A0E0E' }}>
                    <strong>{pickLang(lang, 'प्रभु श्री राम का आदेश / फलादेश:', 'Oracle Verdict:', 'પ્રભુ શ્રી રામનો આદેશ / ફળાદેશ:')}</strong> {activeRamChaupai.verdict}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: SHRI HANUMAN PRASHNAVALI CHAKRA (1-49) */}
      {/* =================================================================== */}
      {subTab === 'hanuman' && (
        <div
          className="rounded-2xl border-2 border-[#8C6239]/45 p-4 sm:p-5 space-y-4"
          style={{ backgroundColor: '#FFFDF8', color: '#2B1105' }}
        >
          <div className="border-b border-[#8C6239]/25 pb-3">
            <h3 className="text-base sm:text-lg font-black font-granth flex items-center gap-2" style={{ color: '#4A0E0E' }}>
              <Flame className="w-5 h-5 text-[#B56A00]" />
              <span>{pickLang(lang, '॥ श्री हनुमान ज्योतिष यंत्र (१ से ४९ प्रश्नावली चक्र) ॥', 'Shri Hanuman Jyotish Yantra (1–49 Prashnavali Chakra)', '॥ શ્રી હનુમાન જ્યોતિષ યંત્ર (૧ થી ૪૯ પ્રશ્નાવલી ચક્ર) ॥')}</span>
            </h3>
            <p className="text-xs mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
              {pickLang(
                lang,
                '"ॐ हं हनुमते रुद्रात्मकाय हुं फट्" का मानसिक जप कर १ से ४९ के बीच किसी भी एक अंक पर स्पर्श करें।',
                'Mentally chant "ॐ हं हनुमते रुद्रात्मकाय हुं फट्" and tap any number from 1 to 49 below.',
                '"ॐ हं हनुमते रुद्रात्मकाय हुं फट्" નો માનસિક જપ કરી ૧ થી ૪૯ વચ્ચે કોઈ પણ એક અંક પર સ્પર્શ કરો.'
              )}
            </p>
          </div>

          <div
            className="grid grid-cols-7 gap-1.5 sm:gap-2 p-3 rounded-2xl border-2 border-[#B56A00]"
            style={{ backgroundColor: '#FAF2E4' }}
          >
            {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => {
              const isSel = selectedHanumanNum === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedHanumanNum(num)}
                  className="py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-base transition cursor-pointer border active:scale-95"
                  style={{
                    backgroundColor: isSel ? '#8B1E1E' : '#FFFDF8',
                    color: isSel ? '#FFFFFF' : '#4A0E0E',
                    borderColor: isSel ? '#FFD88A' : 'rgba(140,98,57,0.35)',
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {activeHanumanResult && selectedHanumanNum !== null && (
            <div
              className="rounded-2xl border-2 border-[#8B1E1E] p-4 sm:p-5 space-y-3 animate-in fade-in duration-200"
              style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/30 pb-2.5">
                <h4 className="text-sm sm:text-base font-black font-granth" style={{ color: '#6E1409' }}>
                  {activeHanumanResult.title}
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setPosterData({
                      title: pickLang(lang, 'श्री हनुमान प्रश्नावली फलादेश', 'Shri Hanuman Prashnavali Verdict', 'શ્રી હનુમાન પ્રશ્નાવલી ફળાદેશ'),
                      reference: `${pickLang(lang, 'हनुमत् प्रश्नावली यंत्र — चयनित अंक:', 'Hanuman Prashnavali Yantra — Number:', 'હનુમંત પ્રશ્નાવલી યંત્ર — પસંદ કરેલ અંક:')} ${selectedHanumanNum}`,
                      sanskrit: activeHanumanResult.title,
                      meaning: `${activeHanumanResult.prediction}\n\n${pickLang(lang, 'समय:', 'Timing:', 'સમય:')} ${activeHanumanResult.timing}\n${pickLang(lang, 'उपाय:', 'Remedy:', 'ઉપાય:')} ${activeHanumanResult.remedy}`,
                      accentTag: pickLang(lang, '🔱 जय बजरंगबली', '🔱 Jai Bajrangbali', '🔱 જય બજરંગબલી'),
                    })
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{pickLang(lang, '📸 स्टेटस कार्ड', '📸 Status Card', '📸 સ્ટેટસ કાર્ડ')}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: '#2B1105' }}>
                <strong>{pickLang(lang, 'फलादेश:', 'Prediction:', 'ફળાદેશ:')}</strong> {activeHanumanResult.prediction}
              </p>
              <p className="text-xs sm:text-sm font-bold" style={{ color: '#4A0E0E' }}>
                <strong>{pickLang(lang, 'फल प्राप्ति समय:', 'Expected Timing:', 'ફળ પ્રાપ્તિ સમય:')}</strong> {activeHanumanResult.timing}
              </p>
              <p className="text-xs sm:text-sm font-bold" style={{ color: '#6E1409' }}>
                <strong>{pickLang(lang, 'अमोघ हनुमत् उपाय:', 'Hanumat Remedy:', 'અમોઘ હનુમંત ઉપાય:')}</strong> {activeHanumanResult.remedy}
              </p>
            </div>
          )}
        </div>
      )}

      {/* HD Poster Modal */}
      <ShlokaPosterModal
        isOpen={posterData !== null}
        onClose={() => setPosterData(null)}
        data={posterData}
      />
    </div>
  );
};
