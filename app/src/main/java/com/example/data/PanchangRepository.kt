package com.example.data

import java.text.SimpleDateFormat
import java.util.*

object PanchangRepository {

    val cities = listOf(
        City("Varanasi", "Uttar Pradesh", 25.3176, 82.9739, "IST"),
        City("New Delhi", "Delhi", 28.6139, 77.2090, "IST"),
        City("Ujjain", "Madhya Pradesh", 23.1793, 75.7849, "IST"),
        City("Mumbai", "Maharashtra", 19.0760, 72.8777, "IST"),
        City("Haridwar", "Uttarakhand", 29.9457, 78.1642, "IST"),
        City("Ayodhya", "Uttar Pradesh", 26.7922, 82.1998, "IST"),
        City("Tirupati", "Andhra Pradesh", 13.6288, 79.4192, "IST"),
        City("Kolkata", "West Bengal", 22.5726, 88.3639, "IST"),
        City("Bengaluru", "Karnataka", 12.9716, 77.5946, "IST"),
        City("Chennai", "Tamil Nadu", 13.0827, 80.2707, "IST")
    )

    fun getPanchangForDate(date: Date, cityName: String): PanchangDay {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val displaySdf = SimpleDateFormat("dd MMMM yyyy", Locale.getDefault())
        val daySdf = SimpleDateFormat("EEEE", Locale.getDefault())
        
        val dateStr = sdf.format(date)
        val displayDate = displaySdf.format(date)
        val dayOfWeek = daySdf.format(date)

        // Generate dynamic yet authentic-looking panchang based on date hash/values
        val cal = Calendar.getInstance().apply { time = date }
        val dayOfYear = cal.get(Calendar.DAY_OF_YEAR)
        
        val tithis = listOf(
            "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
            "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
            "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima / Amavasya"
        )
        val nakshatras = listOf(
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
            "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
            "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
            "Mula", "Purvashadha", "Uttarashadha", "Shravana", "Dhanistha", "Shatabhisha",
            "Purvabhadrapada", "Uttarabhadrapada", "Revati"
        )
        val yogas = listOf(
            "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
            "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
            "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipat", "Variyan",
            "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
            "Brahma", "Indra", "Vaidhriti"
        )
        val karanas = listOf("Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti")

        val tithiIndex = dayOfYear % tithis.size
        val nakIndex = (dayOfYear * 3) % nakshatras.size
        val yogaIndex = (dayOfYear * 5) % yogas.size
        val karanaIndex = (dayOfYear * 2) % karanas.size

        val isShukla = (dayOfYear / 15) % 2 == 0
        val paksha = if (isShukla) "Shukla Paksha" else "Krishna Paksha"
        val hinduMonth = if (dayOfYear < 90) "Magha - Phalguna" else if (dayOfYear < 180) "Chaitra - Vaishakha" else if (dayOfYear < 270) "Ashwin - Kartika" else "Margashirsha - Pausha"

        val festival = when {
            dayOfYear == 100 -> "Chaitra Navratri / Gudi Padwa"
            dayOfYear == 109 -> "Ram Navami"
            dayOfYear == 118 -> "Hanuman Jayanti"
            dayOfYear == 220 -> "Raksha Bandhan"
            dayOfYear == 230 -> "Krishna Janmashtami"
            dayOfYear == 245 -> "Ganesh Chaturthi"
            dayOfYear == 280 -> "Navratri & Durga Ashtami"
            dayOfYear == 288 -> "Vijayadashami (Dussehra)"
            dayOfYear == 305 -> "Diwali (Deepavali)"
            dayOfYear == 350 -> "Makar Sankranti"
            dayOfYear % 15 == 10 -> "Kamada / Ekadashi Vrat"
            else -> null
        }

        val dayChaughadiya = listOf(
            ChaughadiyaItem("Udveg", "06:12 AM - 07:42 AM", "Inauspicious"),
            ChaughadiyaItem("Chara", "07:42 AM - 09:12 AM", "Neutral"),
            ChaughadiyaItem("Labh", "09:12 AM - 10:42 AM", "Auspicious"),
            ChaughadiyaItem("Amrit", "10:42 AM - 12:12 PM", "Auspicious"),
            ChaughadiyaItem("Kaal", "12:12 PM - 01:42 PM", "Inauspicious"),
            ChaughadiyaItem("Shubh", "01:42 PM - 03:12 PM", "Auspicious"),
            ChaughadiyaItem("Rog", "03:12 PM - 04:42 PM", "Inauspicious"),
            ChaughadiyaItem("Udveg", "04:42 PM - 06:12 PM", "Inauspicious")
        )

        val nightChaughadiya = listOf(
            ChaughadiyaItem("Shubh", "06:12 PM - 07:42 PM", "Auspicious"),
            ChaughadiyaItem("Amrit", "07:42 PM - 09:12 PM", "Auspicious"),
            ChaughadiyaItem("Chara", "09:12 PM - 10:42 PM", "Neutral"),
            ChaughadiyaItem("Rog", "10:42 PM - 12:12 AM", "Inauspicious"),
            ChaughadiyaItem("Kaal", "12:12 AM - 01:42 AM", "Inauspicious"),
            ChaughadiyaItem("Labh", "01:42 AM - 03:12 AM", "Auspicious"),
            ChaughadiyaItem("Udveg", "03:12 AM - 04:42 AM", "Inauspicious"),
            ChaughadiyaItem("Shubh", "04:42 AM - 06:12 AM", "Auspicious")
        )

        return PanchangDay(
            dateString = dateStr,
            displayDate = displayDate,
            dayOfWeek = dayOfWeek,
            hinduMonth = "$hinduMonth, $paksha",
            tithi = tithis[tithiIndex],
            tithiEndTime = "03:45 PM",
            nakshatra = nakshatras[nakIndex],
            nakshatraEndTime = "05:20 PM",
            yoga = yogas[yogaIndex],
            karana = karanas[karanaIndex],
            sunrise = "06:12 AM",
            sunset = "06:05 PM",
            moonrise = "07:30 AM",
            moonset = "06:50 PM",
            rahuKaal = "03:30 PM - 05:00 PM",
            yamagandam = "09:00 AM - 10:30 AM",
            gulikai = "12:00 PM - 01:30 PM",
            abhijitMuhurat = "11:45 AM - 12:32 PM",
            amritKaal = "01:15 PM - 02:50 PM",
            samvat = "Vikram Samvat 2083",
            ritu = "Sharad Ritu",
            sunSign = "Kanya (Virgo)",
            moonSign = "Tula (Libra)",
            festivalName = festival,
            chaughadiyaDay = dayChaughadiya,
            chaughadiyaNight = nightChaughadiya
        )
    }

    fun getUpcomingFestivals(): List<Festival> {
        return listOf(
            Festival(
                id = "f1",
                date = "2026-10-02",
                name = "Sharad Purnima",
                hindiName = "शरद पूर्णिमा (Kojagiri Purnima)",
                category = "Purnima",
                description = "Sharad Purnima is celebrated on the full moon night of Ashwin month. Moon shines with all 16 kalas.",
                pujaVidhi = "Keep Kheer under moonlight and offer to Goddess Lakshmi and Lord Krishna."
            ),
            Festival(
                id = "f2",
                date = "2026-10-10",
                name = "Karva Chauth",
                hindiName = "करवा चौथ",
                category = "Vrat",
                description = "Married women observe nirjala fast for the long life and prosperity of their husbands.",
                pujaVidhi = "Offer prayers to Goddess Chauth Mata and Lord Shiva-Parvati, break fast after sighting moon."
            ),
            Festival(
                id = "f3",
                date = "2026-10-20",
                name = "Dhanteras",
                hindiName = "धनतेरस",
                category = "Major Festival",
                description = "First day of Deepawali festival. Purchasing gold, silver or utensils brings good fortune.",
                pujaVidhi = "Light Yamdiya (Yama Lamp) in the evening and worship Lord Dhanwantari and Kuber."
            ),
            Festival(
                id = "f4",
                date = "2026-10-22",
                name = "Diwali (Deepavali)",
                hindiName = "दीपावली - महालक्ष्मी पूजा",
                category = "Major Festival",
                description = "Festival of lights celebrating Lord Rama's return to Ayodhya and worship of Goddess Lakshmi.",
                pujaVidhi = "Clean home, light clay diyas, and perform Lakshmi-Ganesh puja at auspicious muhurat."
            ),
            Festival(
                id = "f5",
                date = "2026-10-24",
                name = "Govardhan Puja",
                hindiName = "गोवर्धन पूजा (अन्नकूट)",
                category = "Major Festival",
                description = "Commemorates the lifting of Govardhan hill by Lord Krishna.",
                pujaVidhi = "Prepare Chhappan Bhog (Annakut), make Govardhan hill replica with cow dung and perform parikrama."
            ),
            Festival(
                id = "f6",
                date = "2026-10-26",
                name = "Bhai Dooj",
                hindiName = "भैया दूज",
                category = "Major Festival",
                description = "Celebrates the sacred bond of brothers and sisters.",
                pujaVidhi = "Sisters apply tilak on brothers' forehead and pray for their long life."
            ),
            Festival(
                id = "f7",
                date = "2026-11-01",
                name = "Devuthani Ekadashi",
                hindiName = "देवउठनी एकादशी (प्रबोधिनी एकादशी)",
                category = "Ekadashi",
                description = "Lord Vishnu wakes up from four months of yogic slumber (Chaturmas ends).",
                pujaVidhi = "Perform Tulsi Vivah and light ghee lamps across the house."
            )
        )
    }

    fun getRashiList(): List<RashiBhavishya> {
        return listOf(
            RashiBhavishya("mesh", "Aries", "मेष (Mesh)", "♈", "Today brings high energy and new career opportunities. Avoid hasty decisions in financial matters.", "Saffron / Red", 9, 85, 80, 75),
            RashiBhavishya("vrishabh", "Taurus", "वृषभ (Vrishabh)", "♉", "Financial stability improves. Family time will bring peace of mind and joy.", "White / Pink", 6, 90, 88, 80),
            RashiBhavishya("mithun", "Gemini", "मिथुन (Mithun)", "♊", "Communication skills will shine at workplace. Travel is indicated for business growth.", "Green", 5, 78, 82, 85),
            RashiBhavishya("karka", "Cancer", "कर्क (Karka)", "♋", "Emotional balance is key today. Focus on health and meditation in the morning.", "Yellow", 2, 75, 70, 90),
            RashiBhavishya("simha", "Leo", "सिंह (Simha)", "♌", "Leadership qualities appreciated by seniors. Excellent time for creative projects.", "Gold / Orange", 1, 92, 85, 80),
            RashiBhavishya("kanya", "Virgo", "कन्या (Kanya)", "♍", "Attention to detail will prevent errors. Investments made today yield good returns.", "Green / Blue", 5, 88, 90, 75),
            RashiBhavishya("tula", "Libra", "तुला (Tula)", "♎", "Partnerships flourish. Harmony in domestic life will keep you cheerful.", "Light Blue", 7, 82, 80, 88),
            RashiBhavishya("vrishchik", "Scorpio", "वृश्चिक (Vrishchik)", "♏", "Hidden talents emerge. Keep calm during challenging discussions.", "Maroon", 9, 79, 85, 82),
            RashiBhavishya("dhanu", "Sagittarius", "धनु (Dhanu)", "♐", "Optimism is high. Spiritual pursuits and reading holy scriptures bring inner peace.", "Yellow", 3, 95, 88, 90),
            RashiBhavishya("makar", "Capricorn", "मकर (Makar)", "♑", "Hard work pays off with recognition. Manage time efficiently to avoid stress.", "Dark Blue / Grey", 8, 80, 92, 70),
            RashiBhavishya("kumbh", "Aquarius", "कुंभ (Kumbh)", "♒", "Innovative ideas lead to success. Social networking opens new doors.", "Cyan / Purple", 4, 85, 78, 85),
            RashiBhavishya("meen", "Pisces", "मीन (Meen)", "♓", "Intuition is strong today. Acts of charity bring profound psychological satisfaction.", "Sea Green", 3, 90, 82, 92)
        )
    }

    fun getSacredMantras(): List<SacredMantra> {
        return listOf(
            SacredMantra(
                "m1",
                "Gayatri Mantra",
                "गायत्री मन्त्र",
                "Mantra",
                "Surya / Divine Light",
                "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
                "We meditate on the effulgent glory of the divine Creator; may He inspire our intellects."
            ),
            SacredMantra(
                "m2",
                "Mahamrityunjaya Mantra",
                "महामृत्युंजय मन्त्र",
                "Mantra",
                "Lord Shiva",
                "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्",
                "We worship the Three-Eyed Lord who is fragrant and nourishes all beings. May He liberate us from death for immortality."
            ),
            SacredMantra(
                "m3",
                "Hanuman Chalisa",
                "हनुमान चालीसा",
                "Chalisa",
                "Lord Hanuman",
                "श्री गुरु चरन सरोज रज निज मनु मुकuru सुधारि। बर्नउँ रघुबर बिमल सुसु जो दायकु फल चारि...\n(Full 49 Verses available in app reader)",
                "Praising the strength, wisdom, and supreme devotion of Lord Hanuman to overcome all obstacles."
            ),
            SacredMantra(
                "m4",
                "Durga Stotram",
                "श्री दुर्गा अष्टोत्तर शतनाम स्तोत्रम्",
                "Stotram",
                "Goddess Durga",
                "शैलपुत्री ब्रह्मचारिणी चन्द्रघण्टेटा कूष्माण्डेटा स्कन्दमाता कात्यायनी च कालरात्री महागौरी च सिद्धिदात्री च नवदुर्गाः प्रकीर्तिताः",
                "Invocation of the Nine Divine Forms of Goddess Shakti (Navdurga) for strength, courage and protection."
            ),
            SacredMantra(
                "m5",
                "Ganesha Stotram",
                "संकटनाशन गणेश स्तोत्र",
                "Stotram",
                "Lord Ganesha",
                "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्। भक्तास्मरेद्नित्यमायुष्कामार्थसिद्धये...",
                "Salutations to Lord Ganesha, son of Gauri, who removes all obstacles when remembered daily."
            )
        )
    }
}
