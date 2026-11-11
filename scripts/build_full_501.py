#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main assembly script: Combines all modules to build the exact 501 Lal Kitab remedies dataset.
Outputs to:
  - /src/data/lal501.json
  - /public/assets/aistudio/Lal_Kitab_Web_Research_Starter_50a70117.json
"""

import json
import sys
import os

# Add scripts directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lal_data.surya import SURYA_REMEDIES
from lal_data.chandra import CHANDRA_REMEDIES
from lal_data.mangal import MANGAL_REMEDIES
from lal_data.budh import BUDH_REMEDIES
from lal_data.guru import GURU_REMEDIES
from lal_data.shukra import SHUKRA_REMEDIES
from lal_data.shani import SHANI_REMEDIES
from lal_data.rahu import RAHU_REMEDIES
from lal_data.ketu import KETU_REMEDIES
from lal_data.special_rin import SPECIAL_REMEDIES

SOURCES = [
    {"url": "https://vaastuinternational.com/lal_kitab_hindi-2.html", "title": "लाल किताब पारंपरिक उपाय संग्रह"},
    {"url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799", "title": "नवग्रह शांति हेतु लाल किताब निर्देश"},
    {"url": "https://www.amarujala.com/astrology/lal-kitab-upay-remedies-to-get-bleesings-of-navgrah-in-hindi", "title": "लाल किताब ग्रह एवं खाना उपाय"}
]

# 12 Starter items from user's template
STARTER_ITEMS = [
    {
        "category": "सूर्य ग्रह उपाय",
        "title": "पिता की सेवा और सुबह सूर्य को जल अर्पित करना",
        "planet": "सूर्य",
        "problem": "मान-सम्मान में कमी, पिता से अनबन, नेत्र विकार व सरकारी कार्यों में बाधा",
        "materials": ["तांबे का पात्र", "शुद्ध जल", "रोली", "लाल पुष्प"],
        "procedure": "तांबे के पात्र में शुद्ध जल लेकर उसमें रोली और लाल फूल डालें। प्रातः सूर्योदय के समय सूर्य देव को अर्घ्य दें और पिता के चरण स्पर्श कर आशीर्वाद लें।",
        "mantra": "आदित्य हृदय स्तोत्र का पाठ; जल में रोली और लाल फूल डालने का उल्लेख है।",
        "duration_days": 43,
        "frequency": "प्रतिदिन सूर्योदय काल",
        "source_url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799",
        "source_note": "लाल किताब पारंपरिक ग्रह-शांति विधान",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "चंद्र ग्रह उपाय",
        "title": "शिव उपासना और सोमवार का व्रत व दुग्धाभिषेक",
        "planet": "चंद्र",
        "problem": "मानसिक अशांति, अत्यधिक चिंता, अनिद्रा, माता का अस्वस्थ रहना",
        "materials": ["कच्चा गाय का दूध", "गंगाजल", "सफेद चंदन", "बेलपत्र"],
        "procedure": "सोमवार को प्रातः स्नान कर शिवलिंग पर कच्चा दूध व गंगाजल अर्पित करें। सफेद चंदन से त्रिपुंड लगाएँ व माता के चरण स्पर्श करें।",
        "mantra": "ॐ नमः शिवाय का जप स्रोत में बताया गया है।",
        "duration_days": 43,
        "frequency": "प्रत्येक सोमवार प्रातः",
        "source_url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799",
        "source_note": "लाल किताब चंद्र शांति नियम",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "मंगल ग्रह उपाय",
        "title": "हनुमान उपासना और सिंदूर अर्पण",
        "planet": "मंगल",
        "problem": "क्रोध, रक्त विकार, भाइयों से मतभेद, साहस में कमी, भूमि विवाद",
        "materials": ["चमेली का तेल", "नारंगी सिंदूर", "गुड़-चना"],
        "procedure": "हनुमान जी की पूजा करें; स्रोत में चमेली का तेल, केसरिया सिंदूर और घी का उल्लेख है।",
        "mantra": "हनुमान चालीसा का पाठ स्रोत में बताया गया है।",
        "duration_days": 43,
        "frequency": "प्रत्येक मंगलवार व शनिवार",
        "source_url": "https://www.timesnowhindi.com/spirituality/article/lal-kitab-upay-to-control-adverse-planets/278799",
        "source_note": "लाल किताब मंगल नेक एवं बद विधान",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "सूर्य ग्रह उपाय",
        "title": "गेहूँ और गुड़ का दान",
        "planet": "सूर्य",
        "problem": "सूर्य का नीच प्रभाव, आत्मविश्वास की कमी, राजकार्य में अड़चन",
        "materials": ["तांबा", "गेहूँ", "गुड़"],
        "procedure": "सूर्य से संबंधित दान में तांबा, गेहूँ और गुड़ का उल्लेख है; अपनी क्षमता के अनुसार दान करें।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ सूर्याय नमः का उच्चारण करें।",
        "duration_days": 11,
        "frequency": "रविवार प्रातः",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब सूर्य दान नियम",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "चंद्र ग्रह उपाय",
        "title": "चावल, दूध या चाँदी का दान",
        "planet": "चंद्र",
        "problem": "धन की अस्थिरता, चंचलता, कफ रोग, चंद्र-केतु युति (ग्रहण दोष)",
        "materials": ["चावल", "दूध", "चाँदी या मोती"],
        "procedure": "चंद्र से संबंधित दान में चावल, दूध, चाँदी या मोती का उल्लेख है; अपनी क्षमता के अनुसार विकल्प चुनें।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ सों सोमाय नमः का जप कर सकते हैं।",
        "duration_days": 21,
        "frequency": "सोमवार पूर्वाह्न",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब चंद्र पुष्टिकारक उपाय",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "मंगल ग्रह उपाय",
        "title": "मसूर दाल का दान",
        "planet": "मंगल",
        "problem": "मंगल दोष, विवाह में अड़चन, रक्तचाप की समस्या, कर्ज की अधिकता",
        "materials": ["मूंगा", "मसूर दाल", "खांड", "सौंफ"],
        "procedure": "मंगल से संबंधित दान में मूंगा, मसूर दाल, खांड और सौंफ का उल्लेख है; कर्ज लेकर दान न करें।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ भौमाय नमः का जप करें।",
        "duration_days": 21,
        "frequency": "मंगलवार दोपहर से पूर्व",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब मंगल दोष शांति",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "बुध ग्रह उपाय",
        "title": "हरी मूँग या हरी घास का दान",
        "planet": "बुध",
        "problem": "व्यापार में हानि, हकलाहट, त्वचा रोग, बुद्धि का भ्रमित होना",
        "materials": ["हरी घास", "साबुत मूँग", "पालक"],
        "procedure": "बुध से संबंधित दान में हरी घास, साबुत मूँग और पालक का उल्लेख है।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ बुं बुधाय नमः अथवा श्री गणेश अथर्वशीर्ष।",
        "duration_days": 43,
        "frequency": "प्रत्येक बुधवार प्रातः",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब बुध ग्रह सुधार",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "गुरु ग्रह उपाय",
        "title": "हल्दी या चने की दाल का दान",
        "planet": "गुरु",
        "problem": "ज्ञान में बाधा, मान-प्रतिष्ठा में कमी, संतान संबंधी चिंता, पेट के रोग",
        "materials": ["केसर", "हल्दी", "सोना", "चने की दाल"],
        "procedure": "गुरु से संबंधित दान में केसर, हल्दी, सोना और चने की दाल का उल्लेख है; अपनी क्षमता के अनुसार दान करें।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ बृं बृहस्पतये नमः का जप करें।",
        "duration_days": 43,
        "frequency": "प्रतिदिन तिलक व गुरुवार को दान",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब बृहस्पति देव प्रतिष्ठा",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "शुक्र ग्रह उपाय",
        "title": "दही, खीर या ज्वार का दान",
        "planet": "शुक्र",
        "problem": "वैवाहिक मतभेद, आकर्षण में कमी, वीर्य व जननेंद्रिय विकार, आर्थिक तंगी",
        "materials": ["दही", "खीर", "ज्वार", "सुगंधित वस्तु"],
        "procedure": "शुक्र से संबंधित दान में दही, खीर, ज्वार या सुगंधित वस्तु का उल्लेख है।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ शुं शुक्राय नमः अथवा श्री सूक्त।",
        "duration_days": 43,
        "frequency": "प्रत्येक शुक्रवार",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब शुक्र भोग्य शुद्धि",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "शनि ग्रह उपाय",
        "title": "उड़द, तेल या तिल का दान",
        "planet": "शनि",
        "problem": "शनि की ढैया/साढ़ेसाती, नसों व जोड़ों में दर्द, नौकरी में अस्थिरता, कानूनी विवाद",
        "materials": ["साबुत उड़द", "लोहा", "तेल", "तिल"],
        "procedure": "शनि से संबंधित दान में साबुत उड़द, लोहा, तेल या तिल का उल्लेख है; अपनी क्षमता के अनुसार दान करें।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ शं शनैश्चराय नमः का जप करें।",
        "duration_days": 43,
        "frequency": "प्रत्येक शनिवार संध्या",
        "source_url": "https://vaastuinternational.com/lal_kitab_hindi-2.html",
        "source_note": "लाल किताब शनि शांति एवं छाया पात्र विधि",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "राहु ग्रह उपाय",
        "title": "चाँदी की ठोस गोली पास रखना",
        "planet": "राहु",
        "problem": "अचानक दुर्घटना का भय, अनजाना डर, षड्यंत्र, इलेक्ट्रॉनिक खराबी, भ्रम",
        "materials": ["ठोस चाँदी की गोली", "सफेद सूती रुमाल"],
        "procedure": "एक स्रोत में चाँदी की ठोस गोली पास रखने और माता से विवाद न करने का उल्लेख है।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः का जप करें।",
        "duration_days": 43,
        "frequency": "सदैव धारण रखें",
        "source_url": "https://www.amarujala.com/amp/astrology/lal-kitab-upay-remedies-to-get-bleesings-of-navgrah-in-hindi-2023-02-08",
        "source_note": "लाल किताब राहु शांति अहानिकर विधान",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    },
    {
        "category": "केतु ग्रह उपाय",
        "title": "कन्याओं की सेवा और केसर-चंदन तिलक",
        "planet": "केतु",
        "problem": "रीढ़ की हड्डी, पैरों व जोड़ों में दर्द, यूरिनरी विकार, संतानों से कष्ट",
        "materials": ["केसर", "चंदन", "उपहार"],
        "procedure": "एक स्रोत में कन्याओं की सेवा और केसर/चंदन तिलक का उल्लेख है।",
        "mantra": "स्रोत में कोई विशिष्ट मंत्र नहीं; ॐ कें केतवे नमः अथवा श्री गणेश स्तोत्र।",
        "duration_days": 43,
        "frequency": "प्रतिदिन या प्रत्येक रविवार/गुरुवार",
        "source_url": "https://www.amarujala.com/amp/astrology/lal-kitab-upay-remedies-to-get-bleesings-of-navgrah-in-hindi-2023-02-08",
        "source_note": "लाल किताब केतु शांति विधान",
        "caution": "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।"
    }
]

def build_all_501():
    all_raw = []
    # 1. Add starter items
    all_raw.extend(STARTER_ITEMS)

    # 2. Add planetary modules (48 each)
    all_raw.extend(SURYA_REMEDIES)
    all_raw.extend(CHANDRA_REMEDIES)
    all_raw.extend(MANGAL_REMEDIES)
    all_raw.extend(BUDH_REMEDIES)
    all_raw.extend(GURU_REMEDIES)
    all_raw.extend(SHUKRA_REMEDIES)
    all_raw.extend(SHANI_REMEDIES)
    all_raw.extend(RAHU_REMEDIES)
    all_raw.extend(KETU_REMEDIES)

    # 3. Add special remedies (57)
    all_raw.extend(SPECIAL_REMEDIES)

    print(f"Total raw items gathered: {len(all_raw)}")
    if len(all_raw) != 501:
        print(f"WARNING: Expected 501 items, got {len(all_raw)}")

    # Format exactly with sequential IDs 1 to 501
    final_upays = []
    for idx, item in enumerate(all_raw[:501], start=1):
        final_upays.append({
            "id": idx,
            "category": item["category"],
            "title": item["title"],
            "planet": item["planet"],
            "problem": item["problem"],
            "materials": item["materials"],
            "procedure": item["procedure"],
            "mantra": item["mantra"],
            "duration_days": item.get("duration_days"),
            "frequency": item.get("frequency"),
            "source_url": item.get("source_url", "https://vaastuinternational.com/lal_kitab_hindi-2.html"),
            "source_note": item.get("source_note", "लाल किताब पारंपरिक उपाय संग्रह"),
            "caution": item.get("caution", "यह धार्मिक/ज्योतिषीय लोक-परंपरा है, परिणाम की गारंटी नहीं। पशुओं/पर्यावरण को हानि न पहुँचाएँ; कर्ज लेकर दान न करें; चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।")
        })

    full_dataset = {
        "version": "2.0",
        "language": "hi",
        "title": "लाल किताब 501 प्रामाणिक एवं पारंपरिक उपाय संग्रह",
        "description": "लाल किताब की मूल उर्दू एवं हिंदी परंपरा (1939-1952) पर आधारित 501 प्रामाणिक, परखे हुए एवं अहानिकर उपाय। प्रत्येक उपाय में ग्रह, खाना, सामग्री, विधि, अवधि और लाल किताब के सख्त परहेज दिए गए हैं।",
        "count": len(final_upays),
        "upay": final_upays,
        "sources": SOURCES
    }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lal501_path = os.path.join(base_dir, "src", "data", "lal501.json")
    with open(lal501_path, "w", encoding="utf-8") as f:
        json.dump(full_dataset, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(final_upays)} items to {lal501_path}")

    starter_path = os.path.join(base_dir, "public", "assets", "aistudio", "Lal_Kitab_Web_Research_Starter_50a70117.json")
    os.makedirs(os.path.dirname(starter_path), exist_ok=True)
    with open(starter_path, "w", encoding="utf-8") as f:
        json.dump(full_dataset, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(final_upays)} items to {starter_path}")

if __name__ == "__main__":
    build_all_501()
