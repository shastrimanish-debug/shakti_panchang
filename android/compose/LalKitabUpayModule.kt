// ============================================================================
// SHAKTI PANCHANG - 100 LAL KITAB UPAY (REMEDIES) MODULE
// Modular Architecture: Decoupled Static Data Repository + Compose UI
// ============================================================================

package com.shaktipanchang.lalkitab

import android.os.Parcelable
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.parcelize.Parcelize

// ============================================================================
// 1. DATA MODEL: LalKitabRemedy (@Parcelize for Zero Data Loss)
// ============================================================================

@Parcelize
data class LalKitabRemedy(
    val id: Int,                     // 1..100
    val code: String,                // e.g. "LK-001"
    val title: String,               // उपाय का शीर्षक
    val planet: String,              // संबंधित ग्रह (सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु, केतु)
    val khanaNumber: Int,            // लाल किताब खाना नंबर (1..12)
    val category: String,            // श्रेणी (धन-समृद्धि, ऋण मुक्ति, व्यापार, विवाह, स्वास्थ्य, नजर दोष)
    val problemDescription: String,  // समस्या एवं अशुभ ग्रह के लक्षण
    val remedyProcedure: String,     // लाल किताब का अचूक उपाय / विधि
    val materials: List<String>,     // आवश्यक सामग्री
    val durationDays: String,        // अवधि (43 दिन / 27 दिन / 7 सप्ताह)
    val bestTime: String,            // श्रेष्ठ दिन व समय (केवल सूर्योदय से सूर्यास्त के मध्य)
    val precaution: String           // विशेष सावधानी / परहेज
) : Parcelable

// ============================================================================
// 2. DEDICATED DATA LAYER: LalKitabRepository (Decoupled from UI)
// ============================================================================
// IMPORTANT: Keep this object in its own file (e.g. `data/LalKitabRepository.kt`)
// so UI refactoring NEVER touches or truncates your 100 remedies.
// ============================================================================

object LalKitabRepository {

    val categories: List<String> = listOf(
        "सभी (All)",
        "धन-समृद्धि",
        "ऋण मुक्ति",
        "व्यापार व नौकरी",
        "विवाह व संतान",
        "स्वास्थ्य व मानसिक शांति",
        "शत्रु व नजर दोष"
    )

    val planets: List<String> = listOf(
        "सभी ग्रह",
        "सूर्य (Sun)",
        "चंद्र (Moon)",
        "मंगल (Mars)",
        "बुध (Mercury)",
        "गुरु (Jupiter)",
        "शुक्र (Venus)",
        "शनि (Saturn)",
        "राहु (Rahu)",
        "केतु (Ketu)"
    )

    /**
     * Static, immutable list of 100 Lal Kitab Remedies.
     * Items #1 to #10 are complete production remedies; paste items #11 to #100
     * directly below the marker comment using the exact same `LalKitabRemedy(...)` constructor.
     */
    val allRemedies: List<LalKitabRemedy> = listOf(
        LalKitabRemedy(
            id = 1,
            code = "LK-001",
            title = "सूर्य खाना नं. 1 व 7 — तांबा एवं गुड़ जल प्रवाह प्रयोग",
            planet = "सूर्य (Sun)",
            khanaNumber = 1,
            category = "व्यापार व नौकरी",
            problemDescription = "सरकारी कार्यों में बाधा, उच्चाधिकारियों से मतभेद, मान-सम्मान में कमी अथवा पिता के स्वास्थ्य में गिरावट।",
            remedyProcedure = "रविवार के दिन प्रातः सूर्योदय के पश्चात तांबे का एक चौकोर टुकड़ा अथवा देसी गुड़ बहते हुए शुद्ध जल में प्रवाहित करें। किसी भी महत्वपूर्ण कार्य पर जाने से पहले गुड़ खाकर जल पिएं।",
            materials = listOf("तांबे का चौकोर टुकड़ा", "देसी गुड़", "तांबे का लोटा"),
            durationDays = "लगातार 7 रविवार अथवा 43 दिन",
            bestTime = "रविवार प्रातः (सूर्योदय के बाद दिन में)",
            precaution = "रविवार को नमक का कम सेवन करें एवं रात्रि में लाल किताब के उपाय न करें।"
        ),
        LalKitabRemedy(
            id = 2,
            code = "LK-002",
            title = "चंद्र खाना नं. 4 व 8 — चांदी का चौकोर टुकड़ा एवं सिरहाने जल प्रयोग",
            planet = "चंद्र (Moon)",
            khanaNumber = 4,
            category = "स्वास्थ्य व मानसिक शांति",
            problemDescription = "अत्यधिक मानसिक तनाव, अनिद्रा, घबराहट, माता का अस्वस्थ रहना और नकद धन का हाथ में न टिकना।",
            remedyProcedure = "रात्रि में सोते समय सिरहाने तांबे या चांदी के पात्र में जल भरकर रखें और सुबह उठकर उसे कीकर या बबूल के पौधे में डाल दें। 4 ग्राम का शुद्ध चांदी का चौकोर टुकड़ा सदैव जेब में रखें।",
            materials = listOf("चांदी का चौकोर टुकड़ा (4 ग्राम)", "तांबे/चांदी का लोटा", "स्वच्छ जल"),
            durationDays = "लगातार 43 दिन (बिना नागा)",
            bestTime = "सोमवार से आरंभ कर प्रतिदिन प्रातःकाल",
            precaution = "रात्रि के समय दूध न पिएं और घर में दूध उफनने या जलने न दें।"
        ),
        LalKitabRemedy(
            id = 3,
            code = "LK-003",
            title = "मंगल बद (खाना नं. 4, 7, 8, 12) — मीठी रेवड़ी व बताशे जल प्रवाह",
            planet = "मंगल (Mars)",
            khanaNumber = 8,
            category = "ऋण मुक्ति",
            problemDescription = "मंगल बद के कारण अत्यधिक क्रोध, कर्ज का बढ़ना, भाइयों से संपत्ति विवाद और मांगलिक दोष के कारण दांपत्य कलह।",
            remedyProcedure = "मंगलवार के दिन तिल और गुड़ से बनी मीठी रेवड़ियां अथवा सफेद बताशे बहते हुए जल में प्रवाहित करें। घर में मिट्टी के कुल्हड़ में शुद्ध शहद भरकर ढक्कन बंद कर सुरक्षित कोने में रखें।",
            materials = listOf("तिल-गुड़ की रेवड़ियां (400 ग्राम)", "सफेद बताशे", "मिट्टी का कुल्हड़ व शहद"),
            durationDays = "लगातार 7 मंगलवार",
            bestTime = "मंगलवार दोपहर 12 से 2 बजे के मध्य",
            precaution = "छोटे भाइयों से विवाद न करें तथा दक्षिण मुखी द्वार पर अंधेरा न रखें।"
        ),
        LalKitabRemedy(
            id = 4,
            code = "LK-004",
            title = "बुध खाना नं. 3, 8, 9, 12 — छेद वाला तांबे का पैसा व फिटकरी प्रयोग",
            planet = "बुध (Mercury)",
            khanaNumber = 9,
            category = "व्यापार व नौकरी",
            problemDescription = "व्यापार में अचानक भारी घाटा, नसों व त्वचा के रोग, निर्णय लेने में भ्रम तथा वाणी दोष।",
            remedyProcedure = "बुधवार को केंद्र में गोल छेद वाला तांबे का सिक्का बहते जल में प्रवाहित करें। प्रतिदिन फिटकरी के पानी से कुल्ला करें और बुधवार को गाय को भीगी हुई साबुत हरी मूंग खिलाएं।",
            materials = listOf("छेद वाला तांबे का पैसा", "सफेद फिटकरी", "साबुत हरी मूंग"),
            durationDays = "लगातार 27 बुधवार या 43 दिन",
            bestTime = "बुधवार प्रातः 8 से 11 बजे के मध्य",
            precaution = "घर में चौड़े पत्ते वाले रबर के पौधे, बंद घड़ियां और टूटे कांच बिल्कुल न रखें।"
        ),
        LalKitabRemedy(
            id = 5,
            code = "LK-005",
            title = "बृहस्पति खाना नं. 2, 5, 9, 10 — केसर तिलक एवं पीपल जल सेवा",
            planet = "गुरु (Jupiter)",
            khanaNumber = 5,
            category = "विवाह व संतान",
            problemDescription = "भाग्योदय में रुकावट, विवाह एवं संतान सुख में विलंब, शिक्षा में बाधा अथवा स्वर्ण की हानि।",
            remedyProcedure = "प्रतिदिन स्नान के पश्चात नाभि, जिह्वा और माथे पर शुद्ध केसर का तिलक लगाएं। गुरुवार को पीपल के वृक्ष को बिना स्पर्श किए जल चढ़ाएं और चने की दाल व पीली हल्दी की गांठ मंदिर में दान करें।",
            materials = listOf("शुद्ध केसर", "चने की दाल (400 ग्राम)", "साबुत पीली हल्दी"),
            durationDays = "लगातार 43 दिन",
            bestTime = "गुरुवार प्रातः सूर्योदय के बाद",
            precaution = "घर के ईशान कोण (North-East) को सदैव स्वच्छ व हल्का रखें तथा बुजुर्गों का अनादर न करें।"
        ),
        LalKitabRemedy(
            id = 6,
            code = "LK-006",
            title = "शुक्र खाना नं. 1, 6, 7, 12 — सफेद ज्वार दान एवं गौ सेवा",
            planet = "शुक्र (Venus)",
            khanaNumber = 7,
            category = "विवाह व संतान",
            problemDescription = "पति-पत्नी में कलह, वैवाहिक जीवन में नीरसता, त्वचा रोग और धन का अनावश्यक खर्च होना।",
            remedyProcedure = "शुक्रवार के दिन अपने भार के दशांश के बराबर सफेद ज्वार (चरी) गौशाला या मंदिर में दान करें। काली अथवा दोरंगी गाय को हरा चारा खिलाएं और जेब में ठोस चांदी की गोली रखें।",
            materials = listOf("सफेद ज्वार (चरी)", "ठोस चांदी की गोली", "गाय के लिए हरा चारा"),
            durationDays = "लगातार 7 शुक्रवार",
            bestTime = "शुक्रवार प्रातःकाल",
            precaution = "कभी भी फटे, गंदे या बिना धुले वस्त्र न पहनें तथा जीवनसाथी का सम्मान करें।"
        ),
        LalKitabRemedy(
            id = 7,
            code = "LK-007",
            title = "शनि खाना नं. 1, 4, 8, 10 — सरसों तेल का छाया पात्र दान एवं बादाम प्रयोग",
            planet = "शनि (Saturn)",
            khanaNumber = 8,
            category = "ऋण मुक्ति",
            problemDescription = "शनि साढ़ेसाती या ढैय्या का कष्ट, हर कार्य में विलंब, जोड़ों का दर्द, मशीनरी खराब होना और कोर्ट-कचहरी की उलझन।",
            remedyProcedure = "शनिवार को लोहे की कटोरी में सरसों का तेल भरकर उसमें अपना मुख देखकर पात्र सहित दान करें। 8 साबुत छिलके वाले बादाम मंदिर में चढ़ाएं और उनमें से 4 बादाम वापस लाकर लाल कपड़े में बांधकर तिजोरी में रखें।",
            materials = listOf("लोहे की कटोरी", "सरसों का तेल", "8 साबुत बादाम"),
            durationDays = "लगातार 7 या 11 शनिवार",
            bestTime = "शनिवार प्रातः 9 बजे से संध्या पूर्व",
            precaution = "शनिवार को लोहा, तेल, चमड़ा और झाड़ू खरीदकर घर न लाएं।"
        ),
        LalKitabRemedy(
            id = 8,
            code = "LK-008",
            title = "राहु खाना नं. 1, 5, 8, 12 — जौ-दूध जल प्रवाह एवं सौंफ की पोटली",
            planet = "राहु (Rahu)",
            khanaNumber = 12,
            category = "शत्रु व नजर दोष",
            problemDescription = "अचानक बड़ी आर्थिक हानि, रात्रि में बुरे सपने, अज्ञात भय, वहम और बनते हुए कार्य अंतिम क्षण में बिगड़ जाना।",
            remedyProcedure = "400 ग्राम साबुत जौ को कच्चे दूध से धोकर शनिवार या बुधवार को बहते जल में प्रवाहित करें। तकिए के नीचे लाल सूती कपड़े की पोटली में हरी सौंफ बांधकर सोएं।",
            materials = listOf("400 ग्राम साबुत जौ", "कच्चा दूध", "हरी सौंफ व लाल कपड़ा"),
            durationDays = "लगातार 43 दिन या 7 शनिवार",
            bestTime = "शनिवार या बुधवार दिन के समय",
            precaution = "घर की छत, सीढ़ियों के नीचे और शौचालय में कबाड़ या गंदगी न जमने दें।"
        ),
        LalKitabRemedy(
            id = 9,
            code = "LK-009",
            title = "केतु खाना नं. 3, 6, 8, 11 — दोरंगी कंबल दान एवं केसर तिलक",
            planet = "केतु (Ketu)",
            khanaNumber = 6,
            category = "स्वास्थ्य व मानसिक शांति",
            problemDescription = "रीढ़ की हड्डी, घुटनों व पैरों में अकारण दर्द, संतान पक्ष को कष्ट और गुप्त शत्रुओं से हानि।",
            remedyProcedure = "मंगलवार या शनिवार को काला-सफेद (दोरंगी) कंबल मंदिर या निर्धन को दान करें। प्रतिदिन दोरंगी (चितकबरे) कुत्ते को रोटी खिलाएं और कानों के पीछे केसर का तिलक लगाएं।",
            materials = listOf("काला-सफेद दोरंगी कंबल", "ताजी रोटी", "शुद्ध केसर"),
            durationDays = "लगातार 43 दिन",
            bestTime = "मंगलवार या शनिवार प्रातःकाल",
            precaution = "कुत्ते या किसी भी मूक प्राणी को कभी न सताएं और झूठी कसम न खाएं।"
        ),
        LalKitabRemedy(
            id = 10,
            code = "LK-010",
            title = "धन बरकत व पितृ ऋण मुक्ति — चांदी की डिब्बी में शहद-नागकेसर एवं तीन ग्रास नियम",
            planet = "गुरु (Jupiter)",
            khanaNumber = 2,
            category = "धन-समृद्धि",
            problemDescription = "कड़ी मेहनत के बाद भी तिजोरी खाली रहना, घर में बरकत न होना और पितृ ऋण के कारण वंश वृद्धि में बाधा।",
            remedyProcedure = "चांदी की छोटी डिब्बी में शुद्ध शहद व नागकेसर भरकर तिजोरी में रखें। साथ ही प्रतिदिन रसोई की पहली रोटी के तीन बराबर भाग कर गाय, काले कुत्ते और कौवे को नियमित रूप से दें।",
            materials = listOf("चांदी की छोटी डिब्बी", "नागकेसर व शुद्ध शहद", "ताजी रोटी व गुड़"),
            durationDays = "43 दिन लगातार (नित्य नियम)",
            bestTime = "प्रातःकाल भोजन निर्माण के समय",
            precaution = "तिजोरी के पास झाड़ू या जूते-चप्पल न रखें तथा कुल परंपरा का सम्मान करें।"
        )

        // ====================================================================
        // PASTE ITEMS #11 TO #100 HERE:
        // Simply copy any `LalKitabRemedy(...)` block above, increment `id`
        // from 11 up to 100 (`code = "LK-011"` .. `"LK-100"`), and fill in
        // your remaining 90 Lal Kitab remedies. Because this repository is
        // completely decoupled from `LalKitabScreen`, future UI edits will
        // never touch or truncate this list.
        // ====================================================================
    )

    /**
     * Filters remedies by search query, category, and planet.
     */
    fun filterRemedies(
        query: String,
        selectedCategory: String,
        selectedPlanet: String
    ): List<LalKitabRemedy> {
        val trimmed = query.trim().lowercase()
        return allRemedies.filter { item ->
            val matchesCategory = selectedCategory == "सभी (All)" || item.category == selectedCategory
            val matchesPlanet = selectedPlanet == "सभी ग्रह" || item.planet == selectedPlanet
            val matchesQuery = trimmed.isEmpty() ||
                item.title.lowercase().contains(trimmed) ||
                item.code.lowercase().contains(trimmed) ||
                item.planet.lowercase().contains(trimmed) ||
                item.category.lowercase().contains(trimmed) ||
                item.problemDescription.lowercase().contains(trimmed) ||
                item.remedyProcedure.lowercase().contains(trimmed) ||
                "खाना ${item.khanaNumber}".contains(trimmed)

            matchesCategory && matchesPlanet && matchesQuery
        }
    }
}

// ============================================================================
// 3. UI INTEGRATION: LalKitabScreen (Jetpack Compose LazyColumn + Card + Search)
// ============================================================================

private val LalKitabMaroon = Color(0xFF4A0E17)
private val LalKitabCrimson = Color(0xFF7F1D1D)
private val ParchmentCream = Color(0xFFFAF2E4)
private val ParchmentBorder = Color(0xFF8C6239)
private val TempleGold = Color(0xFFD97706)
private val DeepWoodText = Color(0xFF3E2714)

@Composable
fun LalKitabScreen(
    modifier: Modifier = Modifier,
    remedies: List<LalKitabRemedy> = remember { LalKitabRepository.allRemedies }
) {
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var selectedCategory by rememberSaveable { mutableStateOf("सभी (All)") }
    var selectedPlanet by rememberSaveable { mutableStateOf("सभी ग्रह") }
    var expandedRemedyId by rememberSaveable { mutableStateOf<Int?>(1) }

    val filteredRemedies = remember(searchQuery, selectedCategory, selectedPlanet, remedies) {
        LalKitabRepository.filterRemedies(
            query = searchQuery,
            selectedCategory = selectedCategory,
            selectedPlanet = selectedPlanet
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ParchmentCream)
    ) {
        // 1. Lal Kitab Header Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(LalKitabMaroon, LalKitabCrimson, LalKitabMaroon)
                    )
                )
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "📕 लाल किताब के १०० अचूक उपाय",
                        color = Color(0xFFFDE68A),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Surface(
                        color = Color(0xFFF59E0B).copy(alpha = 0.2f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "${filteredRemedies.size} / ${remedies.size} उपाय",
                            color = Color(0xFFFDE68A),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "खाना नंबर (भाव 1 से 12) एवं नवग्रहों के प्रामाणिक लाल किताब टोटके व सावधानियां",
                    color = Color(0xFFFDE68A).copy(alpha = 0.85f),
                    fontSize = 12.sp
                )
            }
        }

        // 2. Search Bar & Filter Chips
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF4E8D1))
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = {
                    Text(
                        text = "ग्रह, खाना नंबर, समस्या या उपाय खोजें (जैसे: शनि, कर्ज, खाना 8)...",
                        fontSize = 13.sp,
                        color = DeepWoodText.copy(alpha = 0.6f)
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = LalKitabCrimson
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear",
                                tint = DeepWoodText
                            )
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LalKitabCrimson,
                    unfocusedBorderColor = ParchmentBorder.copy(alpha = 0.45f),
                    focusedContainerColor = ParchmentCream,
                    unfocusedContainerColor = ParchmentCream
                )
            )

            // Category Filter Chips
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(LalKitabRepository.categories) { category ->
                    val isSelected = category == selectedCategory
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = category },
                        label = {
                            Text(
                                text = category,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LalKitabCrimson,
                            selectedLabelColor = Color.White,
                            containerColor = ParchmentCream,
                            labelColor = DeepWoodText
                        )
                    )
                }
            }

            // Planet Filter Chips
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(LalKitabRepository.planets) { planet ->
                    val isSelected = planet == selectedPlanet
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedPlanet = planet },
                        label = {
                            Text(
                                text = planet,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = TempleGold,
                            selectedLabelColor = Color.White,
                            containerColor = ParchmentCream,
                            labelColor = DeepWoodText
                        )
                    )
                }
            }
        }

        // 3. LazyColumn of Lal Kitab Remedy Cards
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp),
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(
                items = filteredRemedies,
                key = { remedy -> remedy.id }
            ) { remedy ->
                LalKitabRemedyCard(
                    remedy = remedy,
                    isExpanded = expandedRemedyId == remedy.id,
                    onToggleExpand = {
                        expandedRemedyId = if (expandedRemedyId == remedy.id) null else remedy.id
                    }
                )
            }
        }
    }
}

@Composable
fun LalKitabRemedyCard(
    remedy: LalKitabRemedy,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = if (isExpanded) 1.5.dp else 1.dp,
                color = if (isExpanded) LalKitabCrimson else ParchmentBorder.copy(alpha = 0.35f),
                shape = RoundedCornerShape(16.dp)
            )
            .clickable { onToggleExpand() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBF4)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Top Badges Row (Code, Planet, Khana Number, Category)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(LalKitabCrimson)
                            .padding(horizontal = 7.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "#${remedy.id} • खाना ${remedy.khanaNumber}",
                            color = Color(0xFFFDE68A),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFFFEF3C7))
                            .border(0.5.dp, TempleGold, RoundedCornerShape(6.dp))
                            .padding(horizontal = 7.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = remedy.planet,
                            color = DeepWoodText,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Text(
                    text = remedy.category,
                    color = TempleGold,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Remedy Title
            Text(
                text = remedy.title,
                color = DeepWoodText,
                fontSize = 15.sp,
                fontWeight = FontWeight.ExtraBold
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Problem Statement Preview
            Text(
                text = "समस्या: ${remedy.problemDescription}",
                color = Color(0xFF5C3A21),
                fontSize = 12.sp,
                maxLines = if (isExpanded) Int.MAX_VALUE else 2,
                overflow = TextOverflow.Ellipsis
            )

            // Expandable Remedy Details
            AnimatedVisibility(visible = isExpanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    HorizontalDivider(color = ParchmentBorder.copy(alpha = 0.25f))

                    // Procedure Box
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFFFEF2F2))
                            .border(1.dp, LalKitabCrimson.copy(alpha = 0.25f), RoundedCornerShape(10.dp))
                            .padding(10.dp)
                    ) {
                        Text(
                            text = "📕 लाल किताब उपाय विधि:",
                            color = LalKitabCrimson,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = remedy.remedyProcedure,
                            color = DeepWoodText,
                            fontSize = 12.sp,
                            lineHeight = 18.sp
                        )
                    }

                    // Materials, Duration, and Best Time
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFF4E8D1))
                                .padding(8.dp)
                        ) {
                            Text("सामग्री:", fontSize = 10.sp, color = TempleGold, fontWeight = FontWeight.Bold)
                            Text(
                                text = remedy.materials.joinToString(", "),
                                fontSize = 11.sp,
                                color = DeepWoodText,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFF4E8D1))
                                .padding(8.dp)
                        ) {
                            Text("अवधि व समय:", fontSize = 10.sp, color = TempleGold, fontWeight = FontWeight.Bold)
                            Text(
                                text = "${remedy.durationDays} (${remedy.bestTime})",
                                fontSize = 11.sp,
                                color = DeepWoodText,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // Precaution Box
                    Text(
                        text = "⚠️ सावधानी / परहेज: ${remedy.precaution}",
                        color = Color(0xFF991B1B),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
