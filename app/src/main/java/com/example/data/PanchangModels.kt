package com.example.data

data class PanchangDay(
    val dateString: String, // yyyy-MM-dd
    val displayDate: String, // e.g., 30 September 2026
    val dayOfWeek: String, // Tuesday / Mangalwar
    val hinduMonth: String, // Ashwin Shukla Paksha
    val tithi: String, // Shukla Pratipada / Dwitiya etc.
    val tithiEndTime: String, // e.g. 04:15 PM
    val nakshatra: String, // Uttara Phalguni / Hasta
    val nakshatraEndTime: String, // e.g. 06:30 PM
    val yoga: String, // Siddhi / Vyatipat
    val karana: String, // Bava / Balava
    val sunrise: String, // 06:12 AM
    val sunset: String, // 06:05 PM
    val moonrise: String, // 06:45 AM
    val moonset: String, // 07:15 PM
    val rahuKaal: String, // 03:15 PM - 04:45 PM
    val yamagandam: String, // 09:15 AM - 10:45 AM
    val gulikai: String, // 12:15 PM - 01:45 PM
    val abhijitMuhurat: String, // 11:48 AM - 12:36 PM
    val amritKaal: String, // 02:10 PM - 03:50 PM
    val samvat: String, // Vikram Samvat 2083
    val ritu: String, // Sharad Ritu
    val sunSign: String, // Kanya (Virgo)
    val moonSign: String, // Tula (Libra)
    val festivalName: String? = null,
    val chaughadiyaDay: List<ChaughadiyaItem>,
    val chaughadiyaNight: List<ChaughadiyaItem>
)

data class ChaughadiyaItem(
    val periodName: String, // Amrit, Shubh, Chara, Labh, Rog, Kaal, Udveg
    val timeRange: String,
    val type: String // Auspicious / Inauspicious / Neutral
)

data class Festival(
    val id: String,
    val date: String,
    val name: String,
    val hindiName: String,
    val category: String, // Ekadashi, Purnima, Major Festival, Vrat
    val description: String,
    val pujaVidhi: String
)

data class RashiBhavishya(
    val rashiId: String,
    val name: String,
    val hindiName: String,
    val symbol: String,
    val dailyPrediction: String,
    val luckyColor: String,
    val luckyNumber: Int,
    val healthScore: Int,
    val wealthScore: Int,
    val loveScore: Int
)

data class SacredMantra(
    val id: String,
    val title: String,
    val hindiTitle: String,
    val category: String, // Chalisa, Mantra, Stotram, Aarti
    val deity: String,
    val sanskritText: String,
    val meaning: String
)

data class City(
    val name: String,
    val state: String,
    val lat: Double,
    val lon: Double,
    val timeZone: String
)
