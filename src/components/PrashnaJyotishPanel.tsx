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

const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: 'mook',
    label: '🤫 मूक प्रश्न (बिना बताए मन का प्रश्न)',
    house: 1,
    houseName: 'लग्न व चंद्र भाव',
    defaultQuery: 'मूक प्रश्न — जातक के मन की गुप्त चिंता व समाधान',
    karakaPlanet: 'चंद्र',
  },
  {
    id: 'career',
    label: '💼 नौकरी, व्यापार व पदोन्नति',
    house: 10,
    houseName: 'दशम भाव (कर्म भाव)',
    defaultQuery: 'क्या मेरे व्यापार/नौकरी में अभी सफलता व उन्नति मिलेगी?',
    karakaPlanet: 'सूर्य',
  },
  {
    id: 'wealth',
    label: '🪙 धन लाभ, रुका पैसा व निवेश',
    house: 2,
    houseName: 'द्वितीय/एकादश भाव (धन-लाभ)',
    defaultQuery: 'क्या रुका हुआ धन वापस मिलेगा और आर्थिक लाभ होगा?',
    karakaPlanet: 'गुरु',
  },
  {
    id: 'marriage',
    label: '💍 विवाह, प्रेम व रिश्ता',
    house: 7,
    houseName: 'सप्तम भाव (कलत्र भाव)',
    defaultQuery: 'क्या यह वैवाहिक रिश्ता शुभ रहेगा और विवाह कब तय होगा?',
    karakaPlanet: 'शुक्र',
  },
  {
    id: 'health',
    label: '🌿 रोग मुक्ति व स्वास्थ्य सुधार',
    house: 6,
    houseName: 'षष्ठ व लग्न भाव (रोग विचार)',
    defaultQuery: 'रोगी के स्वास्थ्य में पूर्ण सुधार कब तक होगा?',
    karakaPlanet: 'सूर्य',
  },
  {
    id: 'lost',
    label: '🔍 खोई हुई वस्तु / चोरी विचार',
    house: 4,
    houseName: 'चतुर्थ व सप्तम भाव (द्रव्य प्राप्ति)',
    defaultQuery: 'खोई हुई वस्तु किस दिशा में है और क्या वापस मिलेगी?',
    karakaPlanet: 'चंद्र',
  },
  {
    id: 'travel',
    label: '✈️ यात्रा, विदेश गमन व स्थानांतरण',
    house: 9,
    houseName: 'नवम व द्वादश भाव (प्रवास भाव)',
    defaultQuery: 'क्या मेरी आगामी यात्रा अथवा विदेश कार्य सफल होगा?',
    karakaPlanet: 'चंद्र',
  },
  {
    id: 'legal',
    label: '⚖️ मुकदमा, विवाद व शत्रु विजय',
    house: 6,
    houseName: 'षष्ठ व दशम भाव (विजय विचार)',
    defaultQuery: 'क्या न्यायालय/विवाद के प्रकरण में मेरी विजय होगी?',
    karakaPlanet: 'मंगल',
  },
  {
    id: 'child',
    label: '🎓 संतान सुख, परीक्षा व शिक्षा',
    house: 5,
    houseName: 'पंचम भाव (विद्या-संतान भाव)',
    defaultQuery: 'क्या परीक्षा/प्रतियोगिता अथवा संतान संबंधी मनोरथ सिद्ध होगा?',
    karakaPlanet: 'गुरु',
  },
];

interface RamshalakaChaupai {
  id: number;
  chaupai: string;
  kanda: string;
  context: string;
  meaning: string;
  verdict: string;
  grade: 'excellent' | 'good' | 'caution' | 'bad';
}

const RAMSHALAKA_CHAUPAIS: RamshalakaChaupai[] = [
  {
    id: 1,
    chaupai: 'सुनु सिय सत्य असीस हमारी। पूजिहि मन कामना तुम्हारी॥',
    kanda: 'श्री रामचरितमानस — बालकाण्ड (पुष्पवाटिका प्रसंग)',
    context: 'माँ गौरी द्वारा जनकनंदिनी सीता जी को दिया गया अमोघ आशीर्वाद।',
    meaning: 'हे सीते! हमारी सच्ची आशीष सुनो, तुम्हारी मनचाही कामना अवश्य पूर्ण होगी।',
    verdict: 'परम शुभ (१००% कार्य सिद्धि): आपका प्रश्न एवं संकल्प अत्यंत उत्तम है। भगवती गौरी व श्री सीताराम की कृपा से मनोकामना पूर्ण होगी। निश्चिंत होकर कार्य आगे बढ़ाएँ।',
    grade: 'excellent',
  },
  {
    id: 2,
    chaupai: 'प्रबिसि नगर कीजे सब काजा। हृदयँ राखि कोसलपुर राजा॥',
    kanda: 'श्री रामचरितमानस — सुन्दरकाण्ड (लंका प्रवेश प्रसंग)',
    context: 'लंकिनी द्वारा श्री हनुमान जी को लंका प्रवेश के समय कहे गए मंगल वचन।',
    meaning: 'अयोध्यापुरी के राजा श्री रघुनाथजी को हृदय में धारण करके नगर में प्रवेश कर सब कार्य कीजिए।',
    verdict: 'अति शुभ (तुरंत कार्यारंभ करें): ईश्वर का स्मरण कर कार्य तुरंत प्रारंभ करें। आपके सभी कार्य निर्विघ्न संपन्न होंगे और विष भी अमृत समान हो जाएगा।',
    grade: 'excellent',
  },
  {
    id: 3,
    chaupai: 'उघरहिं अंत न होइ निबाहू। कालनेमि जिमि रावन राहू॥',
    kanda: 'श्री रामचरितमानस — बालकाण्ड (संत-असंत वंदना)',
    context: 'कपट व अधर्म से किए गए कार्यों के परिणाम का शास्त्रीय वर्णन।',
    meaning: 'अंत में कपट खुल ही जाता है और उसका निर्वाह नहीं होता — जैसे कालनेमि, रावण और राहु का अंत हुआ।',
    verdict: 'अशुभ संकेत (यह कार्य त्याज्य है): इस कार्य के पीछे किसी प्रकार का भ्रम, कपट या अहित छिपा है। अंततः इसमें सफलता नहीं मिलेगी, अतः यह विचार छोड़ देना ही हितकारी है।',
    grade: 'bad',
  },
  {
    id: 4,
    chaupai: 'बिधि बस सुजन कुसंगत परहीं। फनि मनि सम निज गुन अनुसरहीं॥',
    kanda: 'श्री रामचरितमानस — बालकाण्ड',
    context: 'सज्जन पुरुषों के संकट या कुसंग में पड़ने पर भी अपने सद्गुण न छोड़ने का प्रसंग।',
    meaning: 'दैवयोग से यदि सज्जन कुसंगति में पड़ भी जाएँ, तो वे साँप की मणि के समान अपने शुभ गुणों का ही अनुसरण करते हैं।',
    verdict: 'मध्यम / सावधानी आवश्यक: कार्य में कुछ गलत लोगों या विपरीत परिस्थितियों से पाला पड़ सकता है। अपनी सत्यनिष्ठा और धैर्य न छोड़ें; धीरे-धीरे स्थिति सुधरेगी।',
    grade: 'caution',
  },
  {
    id: 5,
    chaupai: 'होइहि सोइ जो राम रचि राखा। को करि तर्क बढ़ावै साखा॥',
    kanda: 'श्री रामचरितमानस — बालकाण्ड (शिव-पार्वती संवाद)',
    context: 'भगवान भोलेनाथ द्वारा सती के मोह पर प्रारब्ध की सर्वोच्चता का उपदेश।',
    meaning: 'होगा वही जो श्री रामजी ने रच रखा है। व्यर्थ तर्क करके कौन शाखा (विस्तार) बढ़ावे।',
    verdict: 'ईश्वर इच्छा पर निर्भर (संशय): इस कार्य के होने या न होने में अभी अनिश्चितता है। हठ या अत्यधिक चिंता छोड़ कर प्रभु श्री राम की इच्छा पर भरोसा रखें।',
    grade: 'caution',
  },
  {
    id: 6,
    chaupai: 'मुद मंगलमय संत समाजू। जो जग जंगम तीरथ राजू॥',
    kanda: 'श्री रामचरितमानस — बालकाण्ड',
    context: 'सत्संग व श्रेष्ठ जनों के सान्निध्य की महिमा।',
    meaning: 'संतों का समाज आनंद और कल्याणमय है, जो जगत में चलता-फिरता तीर्थराज प्रयाग है।',
    verdict: 'शुभ व मंगलकारी: आपका कार्य सज्जनों, वरिष्ठों और परिवार के सहयोग से आनंदपूर्वक संपन्न होगा। धार्मिक आचरण और सत्संग से विशेष लाभ मिलेगा।',
    grade: 'good',
  },
  {
    id: 7,
    chaupai: 'गरल सुधा रिपु करहिं मिताई। गोपद सिंधु अनल सितलाई॥',
    kanda: 'श्री रामचरितमानस — सुन्दरकाण्ड',
    context: 'श्री राम नाम व हनुमान जी के प्रताप से असंभव कार्य भी सरल होने का प्रसंग।',
    meaning: 'श्री राम कृपा से विष अमृत हो जाता है, शत्रु मित्रता करने लगते हैं, समुद्र गाय के खुर के बराबर हो जाता है और अग्नि में शीतलता आ जाती है।',
    verdict: 'परम विजय व संकट मोचन: चाहे कितनी भी बड़ी बाधा या शत्रुता क्यों न दिख रही हो, प्रभु कृपा से सब अनुकूल हो जाएगा। कार्य में निश्चित और ऐतिहासिक सफलता मिलेगी।',
    grade: 'excellent',
  },
  {
    id: 8,
    chaupai: 'बरुन कुबेर सुरेस समीरा। रन सन्मुख धरि काहुँ न धीरा॥',
    kanda: 'श्री रामचरितमानस — लंकाकाण्ड',
    context: 'रावण के प्रबल वेग के सामने लोकपालों के धैर्य खोने का वर्णन।',
    meaning: 'वरुण, कुबेर, इंद्र और वायु — किसी ने भी रणभूमि में सामने टिकने का धैर्य नहीं धरा।',
    verdict: 'प्रबल बाधा व विलंब: वर्तमान समय में परिस्थितियाँ आपके अनुकूल नहीं हैं और विरोधी पक्ष या विघ्न प्रबल हैं। अभी यह कार्य स्थगित रखें एवं हनुमान चालीसा का पाठ करें।',
    grade: 'bad',
  },
  {
    id: 9,
    chaupai: 'सुफल मनोरथ होहुँ तुम्हारे। राम लखन सुनि भए सुखारे॥',
    kanda: 'श्री रामचरितमानस — बालकाण्ड (विश्वामित्र आशीर्वाद)',
    context: 'महर्षि विश्वामित्र एवं जनकपुर में श्री राम-लक्ष्मण के प्रसन्न होने का शुभ प्रसंग।',
    meaning: 'तुम्हारे मनोरथ सफल हों — यह सुनकर श्री राम और लक्ष्मण अत्यंत सुखी हुए।',
    verdict: 'अति उत्तम व सुखद फल: आपका सोचा हुआ मनोरथ पूर्णतः सफल होगा। धन, सम्मान और पारिवारिक प्रसन्नता की प्राप्ति होगी।',
    grade: 'excellent',
  },
];

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
const MOOK_PRASHNA_BY_HOUSE: Record<number, { topic: string; secretThought: string; solution: string }> = {
  1: {
    topic: 'स्वास्थ्य, आत्म-सम्मान व व्यक्तिगत निर्णय',
    secretThought: 'प्रश्नकर्ता के मन में अपने स्वयं के स्वास्थ्य, किसी बड़े व्यक्तिगत निर्णय अथवा मान-सम्मान को लेकर गहन विचार चल रहा है।',
    solution: 'लग्न बलवान होने से आत्मबल द्वारा कार्य सिद्ध होगा। प्रातः सूर्य को अर्घ्य दें।',
  },
  2: {
    topic: 'धन संचय, कुटुंब व रुका हुआ पैसा',
    secretThought: 'प्रश्नकर्ता के मन में पारिवारिक सहमति, पैतृक धन अथवा किसी रुके हुए आर्थिक लेन-देन की चिंता है।',
    solution: 'आगामी पक्ष में धन आगमन का योग बनेगा। वाणी में मधुरता रखें व लक्ष्मी-नारायण पूजन करें।',
  },
  3: {
    topic: 'भाई-बहन, नया अनुबंध व साहसिक कदम',
    secretThought: 'जातक किसी नए समझौते, छोटी यात्रा, स्थानांतरण या भाई-बंधुओं से जुड़े विषय पर निर्णय लेना चाहता है।',
    solution: 'स्वयं के पराक्रम से कार्य सफल होगा। मंगलवार को हनुमान जी को सिंदूर अर्पित करें।',
  },
  4: {
    topic: 'भूमि, भवन, वाहन व पारिवारिक शांति',
    secretThought: 'प्रश्नकर्ता के हृदय में मकान, जमीन, वाहन खरीदने अथवा घर की सुख-शांति और माता के स्वास्थ्य का प्रश्न है।',
    solution: 'चतुर्थ भाव की शुद्धि से स्थाई संपत्ति व सुख प्राप्त होगा। शिव अभिषेक कल्याणकारी है।',
  },
  5: {
    topic: 'संतान, शिक्षा, परीक्षा व प्रेम संबंध',
    secretThought: 'जातक के मन में संतान के भविष्य, प्रतियोगी परीक्षा के परिणाम अथवा किसी भावनात्मक संबंध का प्रश्न है।',
    solution: 'बुद्धि व इष्ट कृपा से शुभ समाचार प्राप्त होगा। गायत्री मंत्र अथवा विष्णु सहस्रनाम का पाठ करें।',
  },
  6: {
    topic: 'रोग मुक्ति, ऋण (कर्ज) व गुप्त शत्रु',
    secretThought: 'प्रश्नकर्ता किसी पुरानी बीमारी, कर्ज के बोझ अथवा कार्यक्षेत्र के विरोधियों/मुकदमे से मुक्ति का मार्ग खोज रहा है।',
    solution: 'धैर्य रखें; षष्ठेश के शमन से शत्रु परास्त होंगे व ऋण घटेगा। बजरंग बाण का पाठ करें।',
  },
  7: {
    topic: 'विवाह, जीवनसाथी, साझेदारी व खोई वस्तु',
    secretThought: 'जातक के मन में विवाह प्रस्ताव, जीवनसाथी के साथ सामंजस्य अथवा व्यापारिक साझेदारी का मुख्य प्रश्न है।',
    solution: 'सप्तम भाव सक्रिय होने से शीघ्र समझौता या शुभ रिश्ता तय होगा। शिव-पार्वती पूजन करें।',
  },
  8: {
    topic: 'गुप्त चिंता, आकस्मिक बाधा व अटका हुआ धन',
    secretThought: 'प्रश्नकर्ता के मन में कोई ऐसी गुप्त आशंका या भय है जिसे वह खुलकर किसी से कह नहीं पा रहा है।',
    solution: 'अनावश्यक भय त्यागें। महामृत्युंजय मंत्र या रुद्राष्टकम के पाठ से संकट टल जाएगा।',
  },
  9: {
    topic: 'भाग्य उदय, दूर की यात्रा व धर्म कार्य',
    secretThought: 'जातक अपने भाग्योदय, विदेश/तीर्थ यात्रा अथवा किसी बड़े गुरु/वरिष्ठ के सहयोग के विषय में सोच रहा है।',
    solution: 'भाग्य भाव जागृत है — वरिष्ठों व देव कृपा से मनोरथ पूर्ण होगा। पीपल या केले के वृक्ष की सेवा करें।',
  },
  10: {
    topic: 'आजीविका, नौकरी, व्यापार व राजकीय कार्य',
    secretThought: 'प्रश्नकर्ता के मन में मुख्य प्रश्न अपने करियर, नई नौकरी, व्यापार विस्तार या सरकारी कार्य की सफलता का है।',
    solution: 'कर्म भाव की प्रबलता से पद-प्रतिष्ठा व कार्य में निश्चित उन्नति मिलेगी। आदित्य हृदय स्तोत्र पढ़ें।',
  },
  11: {
    topic: 'मनोकामना पूर्ति, बड़ा लाभ व मित्र सहयोग',
    secretThought: 'जातक किसी विशेष प्रोजेक्ट से होने वाले लाभ, रुके हुए मुनाफे या बड़ी इच्छा की पूर्ति जानना चाहता है।',
    solution: 'लाभ भाव अनुकूल है; अल्प प्रयास से ही अभीष्ट लाभ की प्राप्ति होगी। गणेश अथर्वशीर्ष का पाठ करें।',
  },
  12: {
    topic: 'अत्यधिक खर्च, विदेश प्रवास व मानसिक शांति',
    secretThought: 'प्रश्नकर्ता बढ़ते हुए खर्चों, बाहरी स्थान में बसने अथवा नींद व मानसिक तनाव को लेकर चिंतित है।',
    solution: 'व्यय पर नियंत्रण रखें; बाहरी संबंधों या दूरस्थ कार्यों से लाभ मिलेगा। संध्या समय दीपदान करें।',
  },
};

function getHanumanPrashnaResult(num: number): {
  title: string;
  prediction: string;
  timing: string;
  remedy: string;
  grade: 'excellent' | 'good' | 'caution';
} {
  const mod = num % 7;
  if (num === 1 || num === 7 || num === 11 || num === 21 || num === 27 || num === 31 || num === 41 || num === 49) {
    return {
      title: `अंक ${num} — श्री हनुमत् कृपा से १००% कार्य सिद्धि`,
      prediction: 'आपका संकल्प अत्यंत सात्विक और प्रबल है। पवनपुत्र हनुमान जी की कृपा से आपके मार्ग की समस्त बाधाएँ भस्म होंगी और मनोरथ पूर्ण होगा।',
      timing: '७ से २१ दिनों के भीतर शुभ समाचार।',
      remedy: 'मंगलवार को हनुमान जी को चोला अथवा लड्डू का भोग लगाएँ और सुंदरकांड की चौपाई पढ़ें।',
      grade: 'excellent',
    };
  }
  if (mod === 1 || mod === 3 || mod === 5) {
    return {
      title: `अंक ${num} — शुभ फल एवं क्रमिक उन्नति`,
      prediction: 'आप जिस कार्य के लिए प्रयासरत हैं, उसमें प्रारंभिक परिश्रम के बाद उत्तम सफलता प्राप्त होगी। मित्रों व परिवार का सहयोग मिलेगा।',
      timing: '१ से ३ माह के भीतर अनुकूल परिणाम।',
      remedy: 'नित्य प्रातः हनुमान चालीसा का पाठ करें और लाल पुष्प अर्पित करें।',
      grade: 'good',
    };
  }
  if (mod === 2 || mod === 6) {
    return {
      title: `अंक ${num} — धैर्य रखें, परिश्रम से सफलता`,
      prediction: 'कार्य में अभी कुछ अड़चनें या विलंब दिख रहा है। जल्दबाजी में कोई बड़ा आर्थिक जोखिम न लें, सोच-समझकर कदम बढ़ाएँ।',
      timing: '४० से ४५ दिनों के पश्चात स्थिति अनुकूल होगी।',
      remedy: 'शनिवार को पीपल के नीचे सरसों के तेल का दीपक जलाएँ और संकटमोचन हनुमानाष्टक पढ़ें।',
      grade: 'caution',
    };
  }
  return {
    title: `अंक ${num} — इष्ट कृपा व मनोरथ पूर्ति`,
    prediction: 'आपके रुके हुए कार्य पुनः गति पकड़ेंगे। धन व मान-सम्मान में वृद्धि का योग बन रहा है।',
    timing: '१५ से ३० दिनों में सकारात्मक परिवर्तन।',
    remedy: 'मंगलवार को गुड़-चने का प्रसाद बाँटें और "ॐ हं हनुमते नमः" की १ माला जपें।',
    grade: 'good',
  };
}

export const PrashnaJyotishPanel: React.FC<PrashnaJyotishPanelProps> = ({ currentLocation }) => {
  const [subTab, setSubTab] = useState<'horary' | 'ramshalaka' | 'hanuman'>('horary');

  // Tab 1: Horary & Mook Prashna State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('mook');
  const [customQuery, setCustomQuery] = useState<string>(QUESTION_CATEGORIES[0].defaultQuery);
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
    () => QUESTION_CATEGORIES.find((c) => c.id === selectedCategoryId) || QUESTION_CATEGORIES[0],
    [selectedCategoryId]
  );

  const handleCategoryChange = (cat: QuestionCategory) => {
    setSelectedCategoryId(cat.id);
    setCustomQuery(cat.defaultQuery);
  };

  const handleRecastPrashna = () => {
    setCastTimestamp(Date.now());
  };

  // Compute Horary Chart & Detailed Vedic Analysis
  const horaryEvaluation = useMemo(() => {
    const pk = generatePrashnaKundali(
      customQuery.trim() || selectedCategory.defaultQuery,
      currentLocation.latitude,
      currentLocation.longitude
    );

    const lagnaIdx = pk.lagnaRashiNumber - 1;
    // Apply 1-108 Prashna Sankhya Arudha / Navamsha shift if user uses Prashna Sankhya
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

    // Check friendship between Lagnesh and Karyesh
    const isSameLord = lagnesh === karyesh;
    const isFriendly =
      isSameLord ||
      GRAHA_MAITRI_MATRIX[lagnesh]?.friends.includes(karyesh) ||
      GRAHA_MAITRI_MATRIX[karyesh]?.friends.includes(lagnesh);

    // Score out of 100
    let successScore = 52;
    if (lagneshStrong) successScore += 15;
    if (karyeshStrong) successScore += 16;
    if (moonStrong) successScore += 10;
    if (isFriendly) successScore += 7;
    if ([1, 5, 9, 11].includes(prashnaNumber % 12)) successScore += 5;
    successScore = Math.min(98, Math.max(28, successScore));

    // Direction from Lagna
    const DIRECTIONS = ['पूर्व (East)', 'दक्षिण (South)', 'पश्चिम (West)', 'उत्तर (North)'];
    const direction = DIRECTIONS[lagnaIdx % 4];

    // Mook Prashna deduction from Moon House & Arudha
    const mookFocusHouse = ((moonPlanet.house + (prashnaNumber % 3) - 1) % 12) + 1;
    const mookInsight = MOOK_PRASHNA_BY_HOUSE[mookFocusHouse] || MOOK_PRASHNA_BY_HOUSE[1];

    let verdictTitle = '';
    let verdictSummary = '';
    let timingText = '';
    if (successScore >= 75) {
      verdictTitle = 'प्रबल कार्य सिद्धि योग (अति शुभ)';
      verdictSummary = `प्रश्न लग्नेश (${lagnesh}) एवं कार्येश (${karyesh}) दोनों शुभ स्थान में हैं और चंद्र (${pk.moonRashi}) अनुकूल है। आपका मनोरथ निश्चित रूप से सिद्ध होगा।`;
      timingText = 'शीघ्र फल प्राप्ति (७ से २१ दिनों अथवा वर्तमान पक्ष में)';
    } else if (successScore >= 58) {
      verdictTitle = 'मध्यम-शुभ (प्रयास से निश्चित सफलता)';
      verdictSummary = `लग्नेश (${lagnesh}) और कार्येश (${karyesh}) का संबंध अनुकूल है, किंतु कुछ सूक्ष्म अवरोध के बाद कार्य सफल होगा। धैर्य और निरंतर प्रयास बनाए रखें।`;
      timingText = 'मध्यम अवधि (१ से ३ माह के भीतर)';
    } else {
      verdictTitle = 'विलंब व बाधा योग (सावधानी आवश्यक)';
      verdictSummary = `वर्तमान प्रश्न कुंडली में कार्येश (${karyesh}) अथवा चंद्र बल कमजोर होने से अभी कार्य में रुकावट दिख रही है। आवश्यक वैदिक उपाय करने के पश्चात ही कदम बढ़ाएँ।`;
      timingText = 'विलंबित योग (३ माह पश्चात स्थिति सुधरेगी)';
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
  }, [customQuery, selectedCategory, currentLocation, prashnaNumber, castTimestamp]);

  const activeRamChaupai = useMemo(() => {
    if (selectedCellIndex === null) return null;
    const cell = RAMSHALAKA_CELLS[selectedCellIndex];
    if (!cell) return null;
    return RAMSHALAKA_CHAUPAIS.find((c) => c.id === cell.chaupaiId) || RAMSHALAKA_CHAUPAIS[0];
  }, [selectedCellIndex]);

  const activeHanumanResult = useMemo(() => {
    if (selectedHanumanNum === null) return null;
    return getHanumanPrashnaResult(selectedHanumanNum);
  }, [selectedHanumanNum]);

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
            label: '🔮 १. तात्कालिक प्रश्न व मूक प्रश्न',
            sub: 'लग्नेश-कार्येश व गुप्त प्रश्न विचार',
          },
          {
            id: 'ramshalaka',
            label: '🏹 २. श्री रामशलाका प्रश्नावली',
            sub: 'तुलसीदास कृत ९×९ अक्षर चक्र',
          },
          {
            id: 'hanuman',
            label: '🔱 ३. श्री हनुमान प्रश्नावली (१-४९)',
            sub: 'संकटमोचन हनुमत् ज्योतिष यंत्र',
          },
        ].map((t) => {
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
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
                  <span>तात्कालिक प्रश्न कुंडली एवं मूक प्रश्न रहस्य</span>
                </h3>
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#5C3A21' }}>
                  जन्म कुंडली न होने पर भी प्रश्न पूछने के क्षण के लग्न, चंद्र, कार्येश एवं १–१०८ प्रश्न संख्या से सटीक भविष्यवाणी
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
                  <span>तात्कालिक चक्र अपडेट करें</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPosterData({
                      title: 'तात्कालिक प्रश्न कुंडली फलादेश',
                      reference: `प्रश्न लग्न: ${horaryEvaluation.kundali.lagnaRashi} • चंद्र: ${horaryEvaluation.kundali.moonRashi} (${horaryEvaluation.kundali.nakshatra})`,
                      sanskrit: `प्रश्न: "${customQuery}"\nनिर्णय: ${horaryEvaluation.verdictTitle} (${horaryEvaluation.successScore}% अनुकूलता)`,
                      meaning: `${horaryEvaluation.verdictSummary}\n\nमूक प्रश्न संकेत: ${horaryEvaluation.mookInsight.secretThought}\nसमाधान: ${horaryEvaluation.mookInsight.solution}`,
                      accentTag: '🔮 वैदिक प्रश्न ज्योतिष',
                    })
                  }
                  className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border border-[#B56A00] transition cursor-pointer active:scale-95"
                  style={{ backgroundColor: '#FAF2E4', color: '#4A0E0E' }}
                >
                  <Share2 className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>📸 स्टेटस कार्ड</span>
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-black block" style={{ color: '#5C3A21' }}>
                १. प्रश्न का विषय चुनें (अथवा "मूक प्रश्न" चुनें):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUESTION_CATEGORIES.map((cat) => {
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
                  २. आपका प्रश्न (मन में सोचें या यहाँ लिखें):
                </label>
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-xs sm:text-sm font-bold border border-[#8C6239]/50 outline-none"
                  style={{ backgroundColor: '#FAF2E4', color: '#2B1105' }}
                  placeholder="अपना प्रश्न लिखें..."
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-black flex items-center justify-between mb-1" style={{ color: '#5C3A21' }}>
                  <span>३. प्रश्न संख्या (1 से 108):</span>
                  <button
                    type="button"
                    onClick={() => setPrashnaNumber(Math.floor(Math.random() * 108) + 1)}
                    className="text-[11px] underline font-black cursor-pointer"
                    style={{ color: '#8B1E1E' }}
                  >
                    दैवीय अंक चुनें 🎲
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
                  मूक प्रश्न रहस्य — बिना बताए जातक के मन की बात (षट्पंचाशिका नियम)
                </h4>
              </div>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-lg border border-[#8C6239]/40"
                style={{ backgroundColor: '#FFFDF8', color: '#6E1409' }}
              >
                सक्रिय भाव: {horaryEvaluation.mookFocusHouse} | आरूढ़ राशि: {horaryEvaluation.arudhaRashi}
              </span>
            </div>

            <div
              className="p-3.5 rounded-xl border border-[#8C6239]/35 space-y-1.5"
              style={{ backgroundColor: '#FFFDF8', color: '#2B1105' }}
            >
              <div className="text-xs sm:text-sm font-black" style={{ color: '#8B1E1E' }}>
                मन का मुख्य विषय: {horaryEvaluation.mookInsight.topic}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-semibold" style={{ color: '#2B1105' }}>
                <strong>गुप्त विचार:</strong> {horaryEvaluation.mookInsight.secretThought}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed font-bold pt-1" style={{ color: '#4A0E0E' }}>
                <strong>दैवज्ञ समाधान:</strong> {horaryEvaluation.mookInsight.solution}
              </p>
            </div>
          </div>

          {/* Main Horary Chart + Detailed Lagnesh/Karyesh Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5">
              <KundaliChart
                lagnaDegree={horaryEvaluation.kundali.lagnaDegree}
                planets={horaryEvaluation.kundali.planets}
                chartTitle={`तात्कालिक प्रश्न कुंडली (${horaryEvaluation.kundali.birthTime})`}
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
                    तात्कालिक प्रश्न निर्णय ({selectedCategory.houseName})
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
                  सिद्धि बल: {horaryEvaluation.successScore}%
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed font-semibold" style={{ color: '#2B1105' }}>
                {horaryEvaluation.verdictSummary}
              </p>

              {/* 4 Key Horary Factors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>प्रश्न लग्न व स्वामी</div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {horaryEvaluation.kundali.lagnaRashi} ({horaryEvaluation.lagnesh})
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    भाव: {horaryEvaluation.lagneshPlanet.house} ({horaryEvaluation.lagneshPlanet.rashi})
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>कार्येश ग्रह ({selectedCategory.house} भाव)</div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {horaryEvaluation.karyesh} ({horaryEvaluation.karyeshRashi})
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    भाव: {horaryEvaluation.karyeshPlanet.house} में स्थित
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>चंद्र एवं नक्षत्र बल</div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {horaryEvaluation.kundali.moonRashi} राशि
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    {horaryEvaluation.kundali.nakshatra} (भाव {horaryEvaluation.moonPlanet.house})
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#8C6239]/30" style={{ backgroundColor: '#FAF2E4' }}>
                  <div className="text-[10px] font-bold" style={{ color: '#735133' }}>शुभ दिशा व आरूढ़</div>
                  <div className="text-xs sm:text-sm font-black mt-0.5" style={{ color: '#4A0E0E' }}>
                    {horaryEvaluation.direction}
                  </div>
                  <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                    अंक #{prashnaNumber} ({horaryEvaluation.arudhaRashi})
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
                  <span>कार्य सिद्धि का संभावित समय: {horaryEvaluation.timingText}</span>
                </div>
                <p className="text-xs leading-relaxed font-semibold" style={{ color: '#3A1807' }}>
                  <strong>तात्कालिक उपाय:</strong> कार्येश ग्रह <strong>{horaryEvaluation.karyesh}</strong> एवं लग्नेश <strong>{horaryEvaluation.lagnesh}</strong> की अनुकूलता हेतु इष्टदेव को पीले पुष्प अर्पित करें और घर से निकलते समय गुड़-धनिया या जल ग्रहण कर प्रस्थान करें।
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
                  ॥ श्री रामशलाका प्रश्नावली (गोस्वामी तुलसीदास कृत) ॥
                </h3>
                <p className="text-xs mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
                  प्रभु श्री सीताराम का स्मरण कर अपने मन में प्रश्न सोचें और नीचे दिए गए ८१ अक्षरों में से किसी एक अक्षर पर श्रद्धापूर्वक स्पर्श करें।
                </p>
              </div>
              {selectedCellIndex !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedCellIndex(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black border border-[#8C6239]/40 cursor-pointer"
                  style={{ backgroundColor: '#FAF2E4', color: '#4A0E0E' }}
                >
                  पुनः नया अक्षर चुनें ↻
                </button>
              )}
            </div>

            <input
              type="text"
              value={ramQuestion}
              onChange={(e) => setRamQuestion(e.target.value)}
              placeholder="वैकल्पिक: अपना मनोरथ या प्रश्न यहाँ लिखें (जैसे: क्या यह कार्य शुभ होगा?)..."
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
                      प्राप्त चौपाई #{activeRamChaupai.id}
                    </span>
                    <div className="text-xs font-bold mt-1" style={{ color: '#5C3A21' }}>
                      {activeRamChaupai.kanda}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPosterData({
                        title: 'श्री रामशलाका प्रश्नावली निर्णय',
                        reference: activeRamChaupai.kanda,
                        sanskrit: activeRamChaupai.chaupai,
                        meaning: `${activeRamChaupai.meaning}\n\nफलादेश: ${activeRamChaupai.verdict}`,
                        accentTag: '🏹 श्री रामचरितमानस प्रश्नावली',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>📸 चौपाई स्टेटस कार्ड</span>
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
                    प्रसंग: {activeRamChaupai.context}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  <p style={{ color: '#2B1105' }}>
                    <strong>चौपाई भावार्थ:</strong> {activeRamChaupai.meaning}
                  </p>
                  <p className="font-bold leading-relaxed pt-1" style={{ color: '#4A0E0E' }}>
                    <strong>प्रभु श्री राम का आदेश / फलादेश:</strong> {activeRamChaupai.verdict}
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
              <span>॥ श्री हनुमान ज्योतिष यंत्र (१ से ४९ प्रश्नावली चक्र) ॥</span>
            </h3>
            <p className="text-xs mt-0.5 font-semibold" style={{ color: '#5C3A21' }}>
              "ॐ हं हनुमते रुद्रात्मकाय हुं फट्" का मानसिक जप कर १ से ४९ के बीच किसी भी एक अंक पर स्पर्श करें।
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
                      title: 'श्री हनुमान प्रश्नावली फलादेश',
                      reference: `हनुमत् प्रश्नावली यंत्र — चयनित अंक: ${selectedHanumanNum}`,
                      sanskrit: activeHanumanResult.title,
                      meaning: `${activeHanumanResult.prediction}\n\nसमय: ${activeHanumanResult.timing}\nउपाय: ${activeHanumanResult.remedy}`,
                      accentTag: '🔱 जय बजरंगबली',
                    })
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>📸 स्टेटस कार्ड</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: '#2B1105' }}>
                <strong>फलादेश:</strong> {activeHanumanResult.prediction}
              </p>
              <p className="text-xs sm:text-sm font-bold" style={{ color: '#4A0E0E' }}>
                <strong>फल प्राप्ति समय:</strong> {activeHanumanResult.timing}
              </p>
              <p className="text-xs sm:text-sm font-bold" style={{ color: '#6E1409' }}>
                <strong>अमोघ हनुमत् उपाय:</strong> {activeHanumanResult.remedy}
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
