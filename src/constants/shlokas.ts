export interface DailyShloka {
  id: number;
  sanskrit: string;
  transliteration?: string;
  hindi: string;
  gujarati?: string;
  english?: string;
  source: string;
}

export function getLocalizedDailyShloka(
  shloka: DailyShloka,
  lang: string
): { sanskrit: string; meaning: string; source: string; title: string; badge: string; meaningLabel: string; copiedMsg: string } {
  if (lang === 'gu') {
    return {
      sanskrit: shloka.sanskrit,
      meaning: shloka.gujarati || shloka.hindi,
      source: shloka.source,
      title: 'દૈનિક સુભાષિતમ્',
      badge: 'આજનો શ્લોક',
      meaningLabel: 'ગુજરાતી ભાવાર્થ:',
      copiedMsg: 'શ્લોક અને ભાવાર્થ કોપી થઈ ગયો!',
    };
  }
  if (lang === 'en') {
    return {
      sanskrit: shloka.sanskrit,
      meaning: shloka.english || shloka.hindi,
      source: shloka.source,
      title: 'Daily Subhashitam',
      badge: 'Verse of the Day',
      meaningLabel: 'English Meaning & Reflection:',
      copiedMsg: 'Verse and reflection copied to clipboard!',
    };
  }
  return {
    sanskrit: shloka.sanskrit,
    meaning: shloka.hindi,
    source: shloka.source,
    title: 'दैनिक सुभाषितम्',
    badge: 'आज का श्लोक',
    meaningLabel: 'हिन्दी भावार्थ:',
    copiedMsg: 'श्लोक व भावार्थ कॉपी हो गया!',
  };
}

export const SHLOKAS: DailyShloka[] = [
  {
    id: 1,
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    hindi: 'तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए कर्म के फल की इच्छा मत करो और न ही कर्म न करने में तुम्हारी आसक्ति हो।',
    gujarati: "તમારો અધિકાર માત્ર કર્મ કરવામાં જ છે, તેના ફળ પર ક્યારેય નહીં. તેથી કર્મફળના હેતુ ન બનો અને કર્મ ન કરવામાં પણ તમારી આસક્તિ ન થવી જોઈએ.",
    english: "You have a right only to perform your prescribed duty, never to the fruits of action. Never consider yourself the cause of results, nor be attached to inaction.",
    source: 'श्रीमद्भगवद्गीता (२.४७)',
  },
  {
    id: 2,
    sanskrit: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः॥',
    hindi: 'कार्य केवल परिश्रम से ही सिद्ध होते हैं, केवल सोचने या इच्छा करने से नहीं। सोते हुए सिंह के मुख में हिरण स्वयं प्रवेश नहीं करते।',
    gujarati: "કાર્યો માત્ર પરિશ્રમથી જ સિદ્ધ થાય છે, માત્ર મનોરથ કે વિચાર કરવાથી નહીં. સૂતેલા સિંહના મુખમાં હરણ પોતાની મેળે પ્રવેશતા નથી.",
    english: "Tasks are accomplished only through diligence and hard work, not by mere wishful thinking. Deer do not enter the mouth of a sleeping lion on their own.",
    source: 'हितोपदेशः',
  },
  {
    id: 3,
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    hindi: 'हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं अपने रूप की रचना करता हूँ अर्थात् साकार रूप में प्रकट होता हूँ।',
    gujarati: "હે ભારત! જ્યારે જ્યારે ધર્મની હાનિ અને અધર્મનો વધારો થાય છે, ત્યારે ત્યારે હું સાકાર રૂપે પ્રગટ થાઉં છું.",
    english: "Whenever righteousness declines and unrighteousness prevails, O Bharata, I manifest Myself upon this earth to protect the good.",
    source: 'श्रीमद्भगवद्गीता (४.७)',
  },
  {
    id: 4,
    sanskrit: 'विद्या ददाति विनयं विनयाद्याति पात्रताम्।\nपात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥',
    hindi: 'सच्ची विद्या विनय (नम्रता) देती है, विनय से योग्यता आती है, योग्यता से धन प्राप्त होता है, धन से धर्म होता है और धर्म से ही वास्तविक सुख मिलता है।',
    gujarati: "સાચી વિદ્યા વિનમ્રતા આપે છે, વિનમ્રતાથી પાત્રતા આવે છે, પાત્રતાથી ધન પ્રાપ્ત થાય છે, ધનથી ધર્મ અને ધર્મથી વાસ્તવિક સુખ મળે છે.",
    english: "True knowledge bestows humility; humility leads to worthiness; worthiness brings wealth; wealth enables righteous living, which brings lasting joy.",
    source: 'हितोपदेशः',
  },
  {
    id: 5,
    sanskrit: 'अयं निजः परो वेति गणना लघुचेतसाम्।\nउदारचरितानां तु वसुधैव कुटुम्बकम्॥',
    hindi: 'यह मेरा है और यह पराया है, ऐसी संकीर्ण सोच छोटे मन वालों की होती है। उदार चरित्र वाले महापुरुषों के लिए तो सम्पूर्ण पृथ्वी ही एक परिवार है।',
    gujarati: "આ મારું છે અને આ પારકું છે, એવી સંકુચિત વિચારસરણી સંકીર્ણ મનના લોકોની હોય છે. ઉદાર ચરિત્રવાળા લોકો માટે સમગ્ર પૃથ્વી જ એક કુટુંબ છે.",
    english: "'This is mine and that is another's' is the calculation of narrow minds. For the noble-hearted, the entire Earth is one single family.",
    source: 'महोपनिषद् (४.७१)',
  },
  {
    id: 6,
    sanskrit: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
    hindi: 'सभी सुखी हों, सभी रोगमुक्त व निरोगी रहें, सभी का कल्याण हो और कोई भी प्राणी दुःख का भागी न बने।',
    gujarati: "સર્વ સુખી થાઓ, સર્વ નિરોગી અને રોગમુક્ત રહો, સૌનું કલ્યાણ થાય અને કોઈ પણ જીવ દુઃખનો ભાગી ન બને.",
    english: "May all beings be happy; may all be healthy and free from illness; may all perceive auspiciousness; may no one suffer misery.",
    source: 'बृहदारण्यकोपनिषद्',
  },
  {
    id: 7,
    sanskrit: 'सत्यं ब्रूयात् प्रियं ब्रूयात् न ब्रूयात् सत्यमप्रियम्।\nप्रियं च नानृतं ब्रूयात् एष धर्मः सनातनः॥',
    hindi: 'सत्य बोलो, प्रिय बोलो, लेकिन अप्रिय सत्य मत बोलो। और प्रिय लगने वाला असत्य भी मत बोलो; यही सनातन धर्म है।',
    gujarati: "સત્ય બોલો, પ્રિય બોલો, પણ અપ્રિય સત્ય ન બોલો. અને પ્રિય લાગે એવું અસત્ય પણ ન બોલો; આ જ સનાતન ધર્મ છે.",
    english: "Speak the truth and speak pleasantly; do not speak unpleasant truth. Do not speak agreeable untruth either; this is the eternal Sanatan Dharma.",
    source: 'मनुस्मृतिः (४.१३८)',
  },
  {
    id: 8,
    sanskrit: 'आलस्यं हि मनुष्याणां शरीरस्थो महान् रिपुः।\nनास्त्युद्यमसमो बन्धुः कृत्वा यं नावसीदति॥',
    hindi: 'मनुष्यों के शरीर में स्थित आलस्य ही उनका सबसे बड़ा शत्रु है। परिश्रम के समान कोई सच्चा मित्र नहीं है, जिसे करने वाला कभी दुःखी नहीं होता।',
    gujarati: "મનુષ્યના શરીરમાં રહેલો આળસ જ તેનો સૌથી મોટો શત્રુ છે. પરિશ્રમ જેવો કોઈ સાચો મિત્ર નથી, જેને કરનાર ક્યારેય દુઃખી થતો નથી.",
    english: "Laziness residing in one's own body is humanity's greatest enemy. There is no friend equal to dedicated effort, performing which one never grieves.",
    source: 'भर्तृहरि नीतिशतकम्',
  },
  {
    id: 9,
    sanskrit: 'अभिवादनशीलस्य नित्यं वृद्धोपसेविनः।\nचत्वारि तस्य वर्धन्ते आयुर्विद्या यशो बलम्॥',
    hindi: 'जो प्रतिदिन बड़ों को प्रणाम करता है और वृद्धों व गुरुजनों की सेवा करता है, उसकी आयु, विद्या, कीर्ति और बल — ये चारों सदा बढ़ते हैं।',
    gujarati: "જે વ્યક્તિ રોજ વડીલોને પ્રણામ કરે છે અને ગુરુજનોની સેવા કરે છે, તેનું આયુષ્ય, વિદ્યા, યશ અને બળ — આ ચારેય સદા વધે છે.",
    english: "One who routinely respects elders and serves spiritual masters gains increase in four sacred gifts: lifespan, wisdom, fame, and vitality.",
    source: 'मनुस्मृतिः (२.१२१)',
  },
  {
    id: 10,
    sanskrit: 'माता शत्रुः पिता वैरी येन बालो न पाठितः।\nन शोभते सभामध्ये हंसमध्ये बको यथा॥',
    hindi: 'वे माता-पिता शत्रु के समान हैं जिन्होंने अपने बालक को विद्या नहीं पढ़ाई। अशिक्षित व्यक्ति विद्वानों की सभा में वैसे ही शोभा नहीं पाता जैसे हंसों के बीच बगुला।',
    gujarati: "તે માતા-પિતા શત્રુ સમાન છે જે પોતાના બાળકને વિદ્યા નથી ભણાવતા. અશિક્ષિત વ્યક્તિ વિદ્વાનોની સભામાં હંસો વચ્ચે બગલા જેવી શોભે છે.",
    english: "Those parents act like enemies who do not educate their child. An uneducated person shines in a gathering of scholars like a heron among swans.",
    source: 'चाणक्य नीतिः',
  },
  {
    id: 11,
    sanskrit: 'सुखार्थिनः कुतो विद्या नास्ति विद्यार्थिनः सुखम्।\nसुखार्थी वा त्यजेद्विद्यां विद्यार्थी वा त्यजेत्सुखम्॥',
    hindi: 'सुख चाहने वाले को विद्या कहाँ और विद्या चाहने वाले को सुख कहाँ? इसलिए सुख चाहने वाले को विद्या का और विद्या चाहने वाले को सुख-आलस्य का त्याग कर देना चाहिए।',
    gujarati: "સુખની ઇચ્છા રાખનારને વિદ્યા ક્યાંથી અને વિદ્યા ઇચ્છનારને સુખ ક્યાંથી? તેથી સુખાર્થીએ વિદ્યાનો અને વિદ્યાર્થીએ સુખ-આળસનો ત્યાગ કરવો જોઈએ.",
    english: "Where is knowledge for one who seeks mere pleasure, and where is pleasure for a student pursuing wisdom? One must forgo comfort to gain knowledge.",
    source: 'चाणक्य नीतिः',
  },
  {
    id: 12,
    sanskrit: 'धृतिः क्षमा दमोऽस्तेयं शौचमिन्द्रियनिग्रहः।\nधीर्विद्या सत्यमक्रोधो दशकं धर्मलक्षणम्॥',
    hindi: 'धैर्य, क्षमा, आत्म-संयम, चोरी न करना, पवित्रता, इन्द्रिय-निग्रह, सद्बुद्धि, विद्या, सत्य और क्रोध न करना — ये धर्म के दस लक्षण हैं।',
    gujarati: "ધીરજ, ક્ષમા, આત્મસંયમ, ચોરી ન કરવી, પવિત્રતા, ઇન્દ્રિયનિગ્રહ, સદ્બુદ્ધિ, વિદ્યા, સત્ય અને ક્રોધ ન કરવો — આ ધર્મના દસ લક્ષણ છે.",
    english: "Fortitude, forgiveness, self-control, non-stealing, cleanliness, sense restraint, wisdom, knowledge, truthfulness, and freedom from anger are the 10 marks of Dharma.",
    source: 'मनुस्मृतिः (६.९२)',
  },
  {
    id: 13,
    sanskrit: 'काव्यशास्त्रविनोदेन कालो गच्छति धीमताम्।\nव्यसनेन तु मूर्खाणां निद्रया कलहेन वा॥',
    hindi: 'बुद्धिमान लोगों का समय काव्य और शास्त्रों के अध्ययन व आनंद में व्यतीत होता है, जबकि मूर्खों का समय व्यसन (बुरी आदतों), नींद और कलह-विवाद में बीतता है।',
    gujarati: "બુદ્ધિશાળી લોકોનો સમય કાવ્ય અને શાસ્ત્રોના અભ્યાસમાં પસાર થાય છે, જ્યારે મૂર્ખોનો સમય દુર્વ્યસન, ઊંઘ અને કલેશ-ઝઘડામાં વીતે છે.",
    english: "Wise souls spend their time in the joy of literature and sacred scriptures, while foolish people waste time in vices, excessive sleep, and disputes.",
    source: 'हितोपदेशः',
  },
  {
    id: 14,
    sanskrit: 'नास्ति विद्यासमं चक्षुर्नास्ति सत्यसमं तपः।\nनास्ति रागसमं दुःखं नास्ति त्यागसमं सुखम्॥',
    hindi: 'विद्या के समान कोई नेत्र नहीं है, सत्य के समान कोई तप नहीं है, आसक्ति (मोह) के समान कोई दुःख नहीं है और त्याग के समान कोई सुख नहीं है।',
    gujarati: "વિદ્યા સમાન કોઈ નેત્ર નથી, સત્ય સમાન કોઈ તપ નથી, આસક્તિ સમાન કોઈ દુઃખ નથી અને ત્યાગ સમાન કોઈ સાચું સુખ નથી.",
    english: "There is no vision equal to knowledge, no penance equal to truth, no sorrow equal to attachment, and no supreme bliss equal to self-renunciation.",
    source: 'महाभारतम् (शांतिपर्व)',
  },
  {
    id: 15,
    sanskrit: 'यत्र नार्यस्तु पूज्यन्ते रमन्ते तत्र देवताः।\nयत्रैतास्तु न पूज्यन्ते सर्वास्तत्राफलाः क्रियाः॥',
    hindi: 'जहाँ नारियों का सम्मान व आदर होता है, वहाँ देवता निवास करते हैं। और जहाँ इनका अनादर होता है, वहाँ के समस्त शुभ कार्य निष्फल हो जाते हैं।',
    gujarati: "જ્યાં સ્ત્રીઓનું સન્માન અને પૂજન થાય છે, ત્યાં દેવતાઓ નિવાસ કરે છે. અને જ્યાં તેમનો અનાદર થાય છે, ત્યાંના તમામ કાર્યો નિષ્ફળ જાય છે.",
    english: "Where women are honored, the divine powers rejoice and reside. Where they are disrespected, all noble ceremonies and actions become fruitless.",
    source: 'मनुस्मृतिः (३.५६)',
  },
  {
    id: 16,
    sanskrit: 'यस्य नास्ति स्वयं प्रज्ञा शास्त्रं तस्य करोति किम्।\nलोचनाभ्यां विहीनस्य दर्पणः किं करिष्यति॥',
    hindi: 'जिसके पास अपनी स्वयं की बुद्धि या विवेक नहीं है, शास्त्र उसका क्या कर सकता है? जैसे दोनों नेत्रों से हीन अंधे व्यक्ति के लिए दर्पण क्या कर सकता है।',
    gujarati: "જેની પાસે પોતાની વિવેકબુદ્ધિ નથી, શાસ્ત્ર તેનું શું કરી શકે? જેમ બંને આંખો વગરના અંધ વ્યક્તિ માટે દર્પણ કશું કરી શકતું નથી.",
    english: "What can scriptures do for someone who lacks their own discernment? What can a mirror do for a blind person who cannot see?",
    source: 'चाणक्य नीतिः',
  },
  {
    id: 17,
    sanskrit: 'परोपकाराय फलन्ति वृक्षाः परोपकाराय वहन्ति नद्यः।\nपरोपकाराय दुहन्ति गावः परोपकारार्थमिदं शरीरम्॥',
    hindi: 'वृक्ष परोपकार के लिए फल देते हैं, नदियाँ परोपकार के लिए बहती हैं, गायें परोपकार के लिए दूध देती हैं; यह मानव शरीर भी परोपकार के लिए ही है।',
    gujarati: "વૃક્ષો પરોપકાર માટે ફળ આપે છે, નદીઓ પરોપકાર માટે વહે છે, ગાયો પરોપકાર માટે દૂધ આપે છે; આ માનવ શરીર પણ પરોપકાર માટે જ છે.",
    english: "Trees bear fruit for the benefit of others; rivers flow for others; cows give milk for others; this human body is also meant for selfless service.",
    source: 'सुभाषितरत्नभाण्डागारम्',
  },
  {
    id: 18,
    sanskrit: 'नमस्ते सते ते जगत्कारणाय नमस्ते चिते सर्वलोकाश्रयाय।\nनमोऽद्वैततत्त्वाय मुक्तिप्रदाय नमो ब्रह्मणे व्यापिने शाश्वताय॥',
    hindi: 'हे जगत् के कारण सत्स्वरूप परमात्मा! आपको नमस्कार है। समस्त लोकों के आश्रय ज्ञानस्वरूप आपको नमस्कार है। अद्वैत तत्व, मुक्तिदाता, सर्वव्यापी सनातन ब्रह्म को नमस्कार है।',
    gujarati: "હે જગતના કારણ પરમાત્મા! આપને નમસ્કાર છે. સર્વ લોકોના આશ્રયરૂપ ચૈતન્ય સ્વરૂપને નમસ્કાર છે. મુક્તિદાતા અદ્વૈત પરબ્રહ્મને નમસ્કાર છે.",
    english: "Salutations to the Supreme Being, the cause of the universe; salutations to the embodiment of pure consciousness; salutations to the eternal omnipresent Brahman.",
    source: 'महानिर्वाण तन्त्रम्',
  },
  {
    id: 19,
    sanskrit: 'असतो मा सद्गमय तमसो मा ज्योतिर्गमय।\nमृत्योर्मा अमृतं गमय ॐ शान्तिः शान्तिः शान्तिः॥',
    hindi: 'हे प्रभु! मुझे असत्य से सत्य की ओर ले चलो, अंधकार से प्रकाश की ओर ले चलो और मृत्यु से अमरता की ओर ले चलो।',
    gujarati: "હે પ્રભુ! મને અસત્યથી સત્ય તરફ લઈ જાઓ, અંધકારથી પ્રકાશ તરફ લઈ જાઓ અને મૃત્યુથી અમરત્વ તરફ દોરી જાઓ. ૐ શાંતિઃ શાંતિઃ શાંતિઃ.",
    english: "Lead me from the unreal to the real, from darkness to light, and from mortality to immortality. Om Peace, Peace, Peace.",
    source: 'बृहदारण्यकोपनिषद् (१.३.२८)',
  },
  {
    id: 20,
    sanskrit: 'दुर्जनः परिहर्तव्यो विद्ययालङ्कृतोऽपि सन्।\nमणिना भूषितः सर्पः किमसौ न भयङ्करः॥',
    hindi: 'दुर्जन व्यक्ति यदि विद्या से सुशोभित भी हो, तब भी उसका त्याग कर देना चाहिए। मणि से युक्त होने पर भी क्या विषैला सर्प भयंकर नहीं होता?',
    gujarati: "દુર્જન વ્યક્તિ જો વિદ્યાવાન હોય તો પણ તેનો ત્યાગ કરવો જોઈએ. મણિથી શણગારેલો સાપ પણ શું ભયંકર નથી હોતો?",
    english: "An evil person should be avoided even if they are well educated. Does a venomous serpent not remain deadly even when adorned with a jewel?",
    source: 'भर्तृहरि नीतिशतकम्',
  },
  {
    id: 21,
    sanskrit: 'क्रोधो वैवस्वतो राजा तृष्णा वैतरणी नदी।\nविद्या कामदुघा धेनुः सन्तोषो नन्दनं वनम्॥',
    hindi: 'क्रोध यमराज के समान है, तृष्णा वैतरणी नदी के समान है। विद्या सब इच्छाएँ पूर्ण करने वाली कामधेनु है और संतोष ही नन्दन वन (स्वर्ग का बगीचा) है।',
    gujarati: "ક્રોધ યમરાજ સમાન છે, તૃષ્ણા વૈતરણી નદી જેવી છે. વિદ્યા કામધેનુ ગાય સમાન છે અને સંતોષ જ નંદનવન સમાન છે.",
    english: "Anger is like the Lord of Death; greed is like the river Vaitarani; knowledge is like Kamadhenu (the wish-fulfilling cow); and contentment is the celestial garden.",
    source: 'चाणक्य नीतिः',
  },
  {
    id: 22,
    sanskrit: 'हस्तस्य भूषणं दानं सत्यं कण्ठस्य भूषणम्।\nश्रोत्रस्य भूषणं शास्त्रं भूषणैः किं प्रयोजनम्॥',
    hindi: 'हाथ का वास्तविक आभूषण दान है, कंठ का आभूषण सत्य है और कानों का आभूषण शास्त्र-श्रवण है; फिर अन्य भौतिक आभूषणों का क्या प्रयोजन?',
    gujarati: "હાથનું સાચું ઘરેણું દાન છે, કંઠનું ઘરેણું સત્ય છે અને કાનનું ઘરેણું શાસ્ત્રશ્રવણ છે; પછી અન્ય બાહ્ય ઘરેણાંઓનું શું કામ?",
    english: "Charity is the true ornament of the hand; truth is the ornament of speech; listening to sacred wisdom is the ornament of ears; what use are external jewels?",
    source: 'सुभाषितसुधानिधिः',
  },
  {
    id: 23,
    sanskrit: 'अनित्यानि शरीराणि विभवो नैव शाश्वतः।\nनित्यं सन्निहितो मृत्युः कर्तव्यो धर्मसङ्ग्रहः॥',
    hindi: 'यह भौतिक शरीर नश्वर है, धन-सम्पदा कभी शाश्वत नहीं रहती, मृत्यु सदा समीप खड़ी है; इसलिए मनुष्य को सदैव धर्म का संचय करना चाहिए।',
    gujarati: "આ શરીર નશ્વર છે, ધન-સંપત્તિ ક્યારેય શાશ્વત રહેતી નથી, મૃત્યુ સદા નજીક ઊભું છે; માટે મનુષ્યે સદા ધર્મનો સંગ્રહ કરવો જોઈએ.",
    english: "Physical bodies are transient, wealth is never permanent, and death stands ever near; therefore, righteous virtue must always be accumulated.",
    source: 'कथासरित्सागरः',
  },
  {
    id: 24,
    sanskrit: 'न कश्चित् कस्यचिन्मित्रं न कश्चित् कस्यचिद्रिपुः।\nव्यवहारेण जायन्ते मित्राणि रिपवस्तथा॥',
    hindi: 'कोई भी किसी का जन्म से मित्र या शत्रु नहीं होता। व्यक्ति के अपने आचरण और व्यवहार से ही मित्र और शत्रु बनते हैं।',
    gujarati: "કોઈ કોઈનો જન્મથી મિત્ર કે શત્રુ હોતો નથી. વ્યક્તિના પોતાના આચરણ અને સદ્વ્યવહારથી જ મિત્રો અને શત્રુઓ બને છે.",
    english: "No one is by birth a friend or an enemy to anyone. It is through one's own conduct and mutual behavior that friends and adversaries are made.",
    source: 'विदुर नीतिः',
  },
  {
    id: 25,
    sanskrit: 'यथा चित्तं तथा वाचो यथा वाचस्तथा क्रियाः।\nचित्ते वाचि क्रियायां च साधूनामेकरूपता॥',
    hindi: 'जैसा मन होता है वैसी ही वाणी होती है और जैसी वाणी होती है वैसे ही कार्य होते हैं। श्रेष्ठ सज्जनों के मन, वाणी और कर्म में पूर्ण एकरूपता होती है।',
    gujarati: "જેવું મન હોય તેવી વાણી હોય છે અને જેવી વાણી હોય તેવા કાર્યો થાય છે. સજ્જનોના મન, વચન અને કર્મમાં પૂર્ણ એકરૂપતા હોય છે.",
    english: "As the mind is, so is speech; as speech is, so are actions. The mind, speech, and deeds of noble souls are always in harmonious alignment.",
    source: 'हितोपદેશः',
  },
  {
    id: 26,
    sanskrit: 'सम्पत्तौ च विपत्तौ च महतामेकरूपता।\nउदये सविता रक्तो रक्तश्चास्तमये तथा॥',
    hindi: 'महान पुरुष सुख-सम्पत्ति और दुःख-विपत्ति दोनों में एक समान रहते हैं; जैसे सूर्य उदय के समय भी लाल होता है और अस्त के समय भी लाल ही रहता है।',
    gujarati: "મહાન પુરુષો સંપત્તિ અને વિપત્તિ બંનેમાં સમાન રહે છે; જેમ સૂર્ય ઉદય સમયે પણ લાલ હોય છે અને અસ્ત સમયે પણ લાલ જ રહે છે.",
    english: "Great beings remain equanimous in both prosperity and adversity; just as the Sun rises in golden crimson and sets in crimson splendour.",
    source: 'सुभाषितरत्नभाण्डागारम्',
  },
  {
    id: 27,
    sanskrit: 'विद्या विवादाय धनं मदाय शक्तिः परेषां परिपीडनाय।\nखलस्य साधोर्विपरीतमेतत् ज्ञानाय दानाय च रक्षणाय॥',
    hindi: 'दुष्ट की विद्या विवाद के लिए, धन अहंकार के लिए और शक्ति दूसरों को पीड़ित करने के लिए होती है। इसके विपरीत सज्जनों की विद्या ज्ञान के लिए, धन दान के लिए और शक्ति निर्बलों की रक्षा के लिए होती है।',
    gujarati: "દુર્જનની વિદ્યા વિવાદ માટે, ધન અહંકાર માટે અને શક્તિ અન્યને પીડવા માટે હોય છે. સજ્જનની વિદ્યા જ્ઞાન માટે, ધન દાન માટે અને શક્તિ રક્ષણ માટે હોય છે.",
    english: "A wicked person's learning causes disputes, wealth breeds pride, and power causes oppression. In noble souls, it brings wisdom, charity, and protection.",
    source: 'भर्तृहरि नीतिशतकम्',
  },
  {
    id: 28,
    sanskrit: 'छायामन्यस्य कुर्वन्ति तिष्ठन्ति स्वयमातपे।\nफलान्यपि परार्थाय वृक्षाः सत्पुरुषा इव॥',
    hindi: 'वृक्ष स्वयं धूप में खड़े रहकर दूसरों को शीतल छाया देते हैं और उनके फल भी दूसरों के लिए ही होते हैं; वे सत्पुरुषों के समान होते हैं।',
    gujarati: "વૃક્ષો પોતે તડકામાં ઊભા રહીને અન્યને શીતળ છાંયો આપે છે અને તેમના ફળો પણ પારકા માટે જ હોય છે; તેઓ સત્પુરુષો સમાન છે.",
    english: "Trees stand in the scorching sun to give soothing shade to others, and their fruits belong to others; they live like saintly souls.",
    source: 'सुभाषितत्रिशती',
  },
  {
    id: 29,
    sanskrit: 'अक्रोधेन जयेत् क्रोधमसाधुं साधुना जयेत्।\nजयेत् कदर्यं दानेन जयेत् सत्येन चानृतम्॥',
    hindi: 'क्रोध को शांति से जीतें, दुर्जन को भलाई से जीतें, कंजूस को दान से जीतें और असत्य को सत्य से जीतें।',
    gujarati: "ક્રોધને શાંતિથી જીતો, દુર્જનને ભલાઈથી જીતો, કંજૂસને દાનથી જીતો અને અસત્યને સદા સત્યથી જીતો.",
    english: "Overcome anger with tranquility; overcome evil with goodness; overcome stinginess with generous giving; and conquer untruth with truth.",
    source: 'महाभारतम् (उद्योगपर्व)',
  },
  {
    id: 30,
    sanskrit: 'वरमेको गुणी पुत्रो न च मूर्खशतैरपि।\nएकश्चन्द्रस्तमो हन्ति न च तारागणैरपि॥',
    hindi: 'सैकड़ों मूर्ख पुत्रों की अपेक्षा एक गुणवान पुत्र ही श्रेष्ठ होता है। आकाश में अकेला चंद्रमा अंधकार को नष्ट कर देता है, जबकि अनगिनत तारे ऐसा नहीं कर पाते।',
    gujarati: "સેંકડો મૂર્ખ પુત્રો કરતાં એક ગુણવાન પુત્ર શ્રેષ્ઠ છે. આકાશમાં એકલો ચંદ્ર અંધકાર દૂર કરે છે, અગણિત તારાઓ પણ તેમ કરી શકતા નથી.",
    english: "Better is a single virtuous child than a hundred foolish ones. A single moon dispels the darkness of the sky, whereas countless stars cannot.",
    source: 'चाणक्य नीतिः',
  },
  {
    id: 31,
    sanskrit: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं\nविश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं\nवन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥',
    hindi: 'शांत स्वरूप, शेषनाग पर शयन करने वाले, नाभि में कमल धारण करने वाले, देवताओं के स्वामी, सम्पूर्ण विश्व के आधार, मेघ वर्ण और समस्त लोकों के स्वामी भगवान विष्णु की मैं वंदना करता हूँ।',
    gujarati: "શાંત સ્વરૂપ, શેષનાગ પર શયન કરનાર, નાભિમાં કમળ ધારણ કરનાર, દેવોના સ્વામી અને જગતના આધાર ભગવાન વિષ્ણુને હું વંદન કરું છું.",
    english: "I bow to Lord Vishnu, serene in form, resting upon the serpent Shesha, with a lotus navel, the sovereign Lord of all cosmic realms.",
    source: 'विष्णु स्तुतिः',
  },
];

/**
 * Returns a deterministic daily shloka based on the provided date.
 */
export function getDailyShloka(date: Date = new Date()): DailyShloka {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % SHLOKAS.length;
  return SHLOKAS[index];
}
