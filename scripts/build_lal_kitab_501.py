#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build 501 authentic, comprehensive Lal Kitab remedies in the exact schema of:
/public/assets/aistudio/Lal_Kitab_Web_Research_Starter_50a70117.json

Schema for each upay:
{
  "id": int (1 to 501),
  "category": str,
  "title": str,
  "planet": str ("सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु", "सर्वग्रह"),
  "problem": str,
  "materials": [str],
  "procedure": str,
  "mantra": str,
  "duration_days": int or None,
  "frequency": str or None,
  "source_url": str,
  "source_note": str,
  "caution": str
}
"""

import json
import os

sources = [
    {"url": "https://vaastuinternational.com/lal_kitab_hindi-2.html", "title": "लाल किताब पारंपरिक उपाय संग्रह"},
    {"url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799", "title": "नवग्रह शांति हेतु लाल किताब निर्देश"},
    {"url": "https://www.amarujala.com/astrology/lal-kitab-upay-remedies-to-get-bleesings-of-navgrah-in-hindi", "title": "लाल किताब ग्रह एवं खाना उपाय"}
]

# Standard Lal Kitab caution
STD_CAUTION = "लाल किताब के उपाय हमेशा दिन के समय (सूर्य निकलने के बाद व डूबने से पहले) करें; कर्ज लेकर कभी दान न करें; किसी भी जीव को हानि न पहुँचाएँ; मदिरा व मांसाहार से दूर रहें; यह पारंपरिक ज्योतिषीय मार्गदर्शन है, चिकित्सा/कानूनी सलाह का विकल्प नहीं।"

upays = []

def add_upay(category, title, planet, problem, materials, procedure, mantra, duration_days, frequency, source_url, source_note, caution=STD_CAUTION):
    uid = len(upays) + 1
    upays.append({
        "id": uid,
        "category": category,
        "title": title,
        "planet": planet,
        "problem": problem,
        "materials": materials,
        "procedure": procedure,
        "mantra": mantra,
        "duration_days": duration_days,
        "frequency": frequency,
        "source_url": source_url,
        "source_note": source_note,
        "caution": caution
    })

# 1-12: The original starter items from the user's attachment
starter_items = [
    {
        "category": "सूर्य ग्रह उपाय",
        "title": "पिता की सेवा और सुबह सूर्य को जल अर्पित करना",
        "planet": "सूर्य",
        "problem": "मान-सम्मान में कमी, पिता से अनबन, नेत्र विकार व सरकारी कार्यों में बाधा",
        "materials": ["तांबे का पात्र", "शुद्ध जल", "रोली", "लाल पुष्प"],
        "procedure": "तांबे के पात्र में शुद्ध जल लेकर उसमें रोली और लाल फूल डालें। प्रातः सूर्योदय के समय सूर्य देव को अर्घ्य दें और पिता के चरण स्पर्श कर आशीर्वाद लें।",
        "mantra": "ॐ घृणिः सूर्याय नमः अथवा आदित्य हृदय स्तोत्र",
        "duration_days": 43,
        "frequency": "प्रतिदिन सूर्योदय काल",
        "source_url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799",
        "source_note": "लाल किताब पारंपरिक ग्रह-शांति विधान",
        "caution": "अर्घ्य का जल पैरों पर न गिरे; पिता या गुरुजनों का अनादर न करें; दिन में ही उपाय करें।"
    },
    {
        "category": "चंद्र ग्रह उपाय",
        "title": "शिव उपासना और सोमवार का व्रत व दुग्धाभिषेक",
        "planet": "चंद्र",
        "problem": "मानसिक अशांति, अत्यधिक चिंता, अनिद्रा, माता का अस्वस्थ रहना",
        "materials": ["कच्चा गाय का दूध", "गंगाजल", "सफेद चंदन", "बेलपत्र"],
        "procedure": "सोमवार को प्रातः स्नान कर शिवलिंग पर कच्चा दूध व गंगाजल अर्पित करें। सफेद चंदन से त्रिपुंड लगाएँ व माता के चरण स्पर्श करें।",
        "mantra": "ॐ नमः शिवाय अथवा ॐ सों सोमाय नमः",
        "duration_days": 43,
        "frequency": "प्रत्येक सोमवार प्रातः",
        "source_url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799",
        "source_note": "लाल किताब चंद्र शांति नियम",
        "caution": "रात को दूध न पिएं; माता का दिल कभी न दुखाएँ; घर में जल की बर्बादी रोकें।"
    },
    {
        "category": "मंगल ग्रह उपाय",
        "title": "हनुमान उपासना और सिंदूर अर्पण",
        "planet": "मंगल",
        "problem": "क्रोध, रक्त विकार, भाइयों से मतभेद, साहस में कमी, भूमि विवाद",
        "materials": ["चमेली का तेल", "नारंगी सिंदूर", "गुड़-चना"],
        "procedure": "मंगलवार को हनुमान जी के मंदिर जाकर चमेली के तेल में सिंदूर मिलाकर चोला चढ़ाएँ। गुड़-चने का प्रसाद बंदरों या निर्धनों में बांटें।",
        "mantra": "ॐ क्रां क्रीं क्रौं सः भौमाय नमः अथवा श्री हनुमान चालीसा",
        "duration_days": 43,
        "frequency": "प्रत्येक मंगलवार व शनिवार",
        "source_url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799",
        "source_note": "लाल किताब मंगल नेक एवं बद विधान",
        "caution": "भाई-बंधुओं से कभी विवाद न करें; घर में हथियार खुले न रखें; क्रोध पर नियंत्रण रखें।"
    },
    {
        "category": "सूर्य ग्रह उपाय",
        "title": "गेहूँ और गुड़ का दान",
        "planet": "सूर्य",
        "problem": "सूर्य का नीच प्रभाव, आत्मविश्वास की कमी, राजकार्य में अड़चन",
        "materials": ["साबुत गेहूँ (सवा किलो)", "देसी गुड़"],
        "procedure": "रविवार को दोपहर 12 बजे से पूर्व सवा किलो गेहूँ और गुड़ किसी जरूरतमंद व्यक्ति या धार्मिक स्थल पर दान करें।",
        "mantra": "ॐ सूर्याय नमः",
        "duration_days": 11,
        "frequency": "रविवार प्रातः",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब सूर्य दान नियम",
        "caution": "दान के लिए कर्ज न लें; गुड़ शुद्ध होना चाहिए; अहंकार का प्रदर्शन न करें।"
    },
    {
        "category": "चंद्र ग्रह उपाय",
        "title": "चावल, दूध या चाँदी का दान",
        "planet": "चंद्र",
        "problem": "धन की अस्थिरता, चंचलता, कफ रोग, चंद्र-केतु युति (ग्रहण दोष)",
        "materials": ["चावल", "दूध", "चाँदी का सिक्का या पात्र"],
        "procedure": "सोमवार के दिन किसी वृद्ध स्त्री या मंदिर के पुजारी को सवा किलो चावल या दूध का दान करें। चाँदी का चौकोर टुकड़ा अपने पास रखें।",
        "mantra": "ॐ चं चंद्रमसे नमः",
        "duration_days": 21,
        "frequency": "सोमवार पूर्वाह्न",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब चंद्र पुष्टिकारक उपाय",
        "caution": "दूध को नाली में न बहाएँ; घर के बुजुर्गों का मान रखें; नमकीन चावल न दान करें।"
    },
    {
        "category": "मंगल ग्रह उपाय",
        "title": "मसूर दाल और लाल वस्त्र का दान",
        "planet": "मंगल",
        "problem": "मंगल दोष, विवाह में अड़चन, रक्तचाप की समस्या, कर्ज की अधिकता",
        "materials": ["लाल मसूर की दाल (सवा किलो)", "लाल कपड़ा", "तांबे का सिक्का"],
        "procedure": "मंगलवार को लाल कपड़े में सवा किलो मसूर दाल बांधकर किसी सफाईकर्मी या जरूरतमंद को दान दें अथवा हनुमान मंदिर में रखें।",
        "mantra": "ॐ अं अंगारकाय नमः",
        "duration_days": 21,
        "frequency": "मंगलवार दोपहर से पूर्व",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब मंगल दोष शांति",
        "caution": "मंगलवार को नमक का सेवन कम करें; मसूर की दाल खुद उस दिन न खाएं; वाणी में संयम रखें।"
    },
    {
        "category": "बुध ग्रह उपाय",
        "title": "हरी मूँग या हरी घास का गौ सेवा दान",
        "planet": "बुध",
        "problem": "व्यापार में हानि, हकलाहट, त्वचा रोग, बुद्धि का भ्रमित होना",
        "materials": ["साबुत हरी मूँग", "हरी ताजी घास", "पालक"],
        "procedure": "बुधवार को साबुत मूँग रात को भिगोकर सुबह गाय को खिलाएं या गौशाला में हरी घास/पालक दान करें।",
        "mantra": "ॐ बुं बुधाय नमः अथवा श्री गणेश अथर्वशीर्ष",
        "duration_days": 43,
        "frequency": "प्रत्येक बुधवार प्रातः",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब बुध ग्रह सुधार",
        "caution": "घर में तोता न पालें; फटे-पुराने कपड़े न पहनें; बहन-बेटी का अनादर न करें।"
    },
    {
        "category": "गुरु ग्रह उपाय",
        "title": "हल्दी या चने की दाल का दान व केसर तिलक",
        "planet": "गुरु",
        "problem": "ज्ञान में बाधा, मान-प्रतिष्ठा में कमी, संतान संबंधी चिंता, पेट के रोग",
        "materials": ["चने की दाल (सवा किलो)", "हल्दी की 5 गांठें", "शुद्ध केसर"],
        "procedure": "गुरुवार को चने की दाल और हल्दी किसी मंदिर में अर्पित करें। प्रतिदिन स्नान के बाद नाभि, माथे और कंठ पर केसर या हल्दी का तिलक लगाएँ।",
        "mantra": "ॐ बृं बृहस्पतये नमः अथवा गुरु गायत्री",
        "duration_days": 43,
        "frequency": "प्रतिदिन तिलक व गुरुवार को दान",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब बृहस्पति देव प्रतिष्ठा",
        "caution": "पीपल का पेड़ कभी न काटें; गुरु, ब्राह्मण और साधुओं का अपमान न करें; झूठ न बोलें।"
    },
    {
        "category": "शुक्र ग्रह उपाय",
        "title": "दही, खीर या ज्वार का दान और इत्र प्रयोग",
        "planet": "शुक्र",
        "problem": "वैवाहिक मतभेद, आकर्षण में कमी, वीर्य व जननेंद्रिय विकार, आर्थिक तंगी",
        "materials": ["सफेद ज्वार", "शुद्ध दही", "चावल की खीर", "प्राकृतिक इत्र"],
        "procedure": "शुक्रवार को मंदिर में दही या खीर का भोग लगाएँ। गाय को ज्वार या दो रोटी पर मक्खन लगाकर खिलाएं। स्वयं स्वच्छ और सुगंधित इत्र का प्रयोग करें।",
        "mantra": "ॐ शुं शुक्राय नमः अथवा श्री सूक्त",
        "duration_days": 43,
        "frequency": "प्रत्येक शुक्रवार",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब शुक्र भोग्य शुद्धि",
        "caution": "फटे या मैले वस्त्र न पहनें; जीवनसाथी का तिरस्कार न करें; चरित्र दोष से बचें।"
    },
    {
        "category": "शनि ग्रह उपाय",
        "title": "उड़द, तेल व तिल का दान एवं छाया पात्र दान",
        "planet": "शनि",
        "problem": "शनि की ढैया/साढ़ेसाती, नसों व जोड़ों में दर्द, नौकरी में अस्थिरता, कानूनी विवाद",
        "materials": ["सरसों का तेल", "कांसे या लोहे की कटोरी", "साबुत काले उड़द", "काले तिल"],
        "procedure": "शनिवार को लोहे या कांसे के पात्र में सरसों का तेल भरकर उसमें अपना चेहरा देखें (छाया दान) और उसे शनि मंदिर या जरूरतमंद को दान करें।",
        "mantra": "ॐ शं शनैश्चराय नमः अथवा दशरथकृत शनि स्तोत्र",
        "duration_days": 43,
        "frequency": "प्रत्येक शनिवार संध्या",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब शनि शांति एवं छाया पात्र विधि",
        "caution": "शराब व मांसाहार से पूर्ण परहेज रखें; मजदूरों, सफाईकर्मियों व निर्धनों को न सताएं; मुफ्त में लोहा न लें।"
    },
    {
        "category": "राहु ग्रह उपाय",
        "title": "चाँदी की ठोस गोली जेब में रखना और ससुराल से संबंध सुधारना",
        "planet": "राहु",
        "problem": "अचानक दुर्घटना का भय, अनजाना डर, षड्यंत्र, इलेक्ट्रॉनिक खराबी, भ्रम",
        "materials": ["ठोस चाँदी की गोली (4 या 8 ग्राम)", "सफेद सूती रुमाल"],
        "procedure": "बिना जोड़ वाली 4 या 8 ग्राम की ठोस चाँदी की गोली बनवाकर हमेशा अपनी जेब या पर्स में रखें। माता और ससुराल पक्ष के लोगों से रिश्ते मधुर रखें।",
        "mantra": "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",
        "duration_days": 43,
        "frequency": "सदैव धारण रखें",
        "source_url": "https://www.amarujala.com/amp/astrology/lal-kitab-upay-remedies-to-get-bleesings-of-navgrah-in-hindi-2023-02-08",
        "source_note": "लाल किताब राहु शांति अहानिकर विधान",
        "caution": "घर की छत पर कबाड़ या बंद घड़ियां न रखें; तंबाकू और बीड़ी-सिगरेट से दूर रहें; रसोई में बैठकर भोजन करें।"
    },
    {
        "category": "केतु ग्रह उपाय",
        "title": "कन्याओं की सेवा और दोरंगे कुत्ते को भोजन",
        "planet": "केतु",
        "problem": "रीढ़ की हड्डी, पैरों व जोड़ों में दर्द, यूरिनरी विकार, संतानों से कष्ट",
        "materials": ["काले-सफेद तिल", "मीठी तंदूरी रोटी", "केसर"],
        "procedure": "काले और सफेद (चितकबरे) कुत्ते को तेल चुपड़ी या मीठी तंदूरी रोटी खिलाएं। छोटी कन्याओं को फल व उपहार दें तथा माथे पर केसर का तिलक लगाएँ।",
        "mantra": "ॐ कें केतवे नमः अथवा श्री गणेश स्तोत्र",
        "duration_days": 43,
        "frequency": "प्रतिदिन या प्रत्येक रविवार/गुरुवार",
        "source_url": "https://www.amarujala.com/amp/astrology/lal-kitab-upay-remedies-to-get-bleesings-of-navgrah-in-hindi-2023-02-08",
        "source_note": "लाल किताब केतु शांति विधान",
        "caution": "कुत्तों को कभी डंडे या पत्थर से न मारें; कान छिदवाकर सोने का तार पहनना शुभ माना जाता है।"
    }
]

for item in starter_items:
    add_upay(
        category=item["category"],
        title=item["title"],
        planet=item["planet"],
        problem=item["problem"],
        materials=item["materials"],
        procedure=item["procedure"],
        mantra=item["mantra"],
        duration_days=item["duration_days"],
        frequency=item["frequency"],
        source_url=item["source_url"],
        source_note=item["source_note"],
        caution=item["caution"]
    )

print(f"Added starter items: {len(upays)}")
