// ============================================================================
// SHAKTI PANCHANG - 3D VEDIC KUNDALI & UMA AI ASSISTANT SYNC (JETPACK COMPOSE)
// Complete Zero-Data-Loss Architecture (@Parcelize + SavedStateHandle + 3D UI)
// ============================================================================

package com.shaktipanchang.kundali.ui.threeD

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import android.os.Parcelable
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.parcelize.Parcelize
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

// ============================================================================
// DELIVERABLE 1: ZERO DATA LOSS PARCELABLE MODEL (@Parcelize VedicChartData)
// ============================================================================

@Parcelize
data class PlanetaryDegree(
    val planetName: String,
    val sanskritSymbol: String,
    val rashiIndex: Int,          // 0..11 (Mesha..Meena)
    val rashiName: String,
    val degreeInSign: Float,      // 0f..30f
    val absoluteLongitude: Float, // 0f..360f sidereal Lahiri
    val houseNumber: Int,         // 1..12
    val isRetrograde: Boolean,
    val nakshatraName: String,
    val pada: Int,
    val colorArgb: Long
) : Parcelable

@Parcelize
data class ChartHouseCell(
    val houseNumber: Int,         // 1..12
    val rashiNumber: Int,         // 1..12
    val rashiName: String,
    val occupantPlanets: List<String>
) : Parcelable

@Parcelize
data class MahadashaInfo(
    val mahadashaLord: String,
    val antardashaLord: String,
    val pratyantardashaLord: String,
    val startDateIso: String,
    val endDateIso: String,
    val progressFraction: Float   // 0f..1f
) : Parcelable

@Parcelize
data class DailyPanchangTransitData(
    val locationName: String,
    val tithiName: String,
    val pakshaName: String,
    val nakshatraName: String,
    val yogaName: String,
    val karanaName: String,
    val sunriseTime: String,
    val sunsetTime: String,
    val gocharHighlights: List<String>
) : Parcelable

@Parcelize
data class VedicChartData(
    val chartId: String,
    val nativeName: String,
    val birthDateTimeIso: String,
    val birthPlace: String,
    val lagnaRashi: String,
    val lagnaDegree: Float,
    val planetaryDegrees: List<PlanetaryDegree>,
    val d1ChartGrid: List<ChartHouseCell>,
    val d9ChartGrid: List<ChartHouseCell>,
    val currentMahadasha: MahadashaInfo,
    val dailyPanchang: DailyPanchangTransitData,
    val umaPredictions: List<String>,
    val activeDivision: String = "D1",
    val isUmaSheetExpanded: Boolean = false,
    val selectedPlanetName: String? = null
) : Parcelable

// ============================================================================
// DELIVERABLE 2: ZERO DATA LOSS VIEWMODEL (PanchangViewModel + SavedStateHandle)
// ============================================================================

class PanchangViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    companion object {
        private const val KEY_VEDIC_CHART_DATA = "key_shakti_panchang_vedic_chart_data_v1"
    }

    // Restores immediately from SavedStateHandle on process death / screen rotation
    // without re-running expensive ephemeris calculations
    private val _chartState: MutableStateFlow<VedicChartData> = MutableStateFlow(
        savedStateHandle.get<VedicChartData>(KEY_VEDIC_CHART_DATA)
            ?: createDefaultVedicChartPayload()
    )
    val chartState: StateFlow<VedicChartData> = _chartState.asStateFlow()

    init {
        // Persist initial payload into SavedStateHandle bundle if not yet stored
        if (!savedStateHandle.contains(KEY_VEDIC_CHART_DATA)) {
            savedStateHandle[KEY_VEDIC_CHART_DATA] = _chartState.value
        }
    }

    /**
     * Atomically updates StateFlow AND writes to SavedStateHandle for 0% Data Loss
     */
    private fun commitState(transform: (VedicChartData) -> VedicChartData) {
        _chartState.update { current ->
            val updated = transform(current)
            savedStateHandle[KEY_VEDIC_CHART_DATA] = updated
            updated
        }
    }

    fun setFullKundaliPayload(newPayload: VedicChartData) {
        viewModelScope.launch {
            commitState { newPayload }
        }
    }

    fun toggleChartDivision(division: String) {
        commitState { it.copy(activeDivision = division) }
    }

    fun toggleUmaAssistantSheet(expand: Boolean? = null) {
        commitState { current ->
            current.copy(isUmaSheetExpanded = expand ?: !current.isUmaSheetExpanded)
        }
    }

    fun selectPlanetForInspection(planetName: String?) {
        commitState { current ->
            current.copy(
                selectedPlanetName = planetName,
                isUmaSheetExpanded = planetName != null || current.isUmaSheetExpanded
            )
        }
    }

    private fun createDefaultVedicChartPayload(): VedicChartData {
        val planets = listOf(
            PlanetaryDegree("सूर्य (Sun)", "सू", 0, "मेष", 14.2f, 14.2f, 1, false, "भरणी", 1, 0xFFFF9800),
            PlanetaryDegree("चंद्र (Moon)", "चं", 3, "कर्क", 21.8f, 111.8f, 4, false, "आश्लेषा", 2, 0xFFE2E8F0),
            PlanetaryDegree("मंगल (Mars)", "मं", 9, "मकर", 26.4f, 296.4f, 10, false, "धनिष्ठा", 1, 0xFFEF4444),
            PlanetaryDegree("बुध (Mercury)", "बु", 5, "कन्या", 11.5f, 161.5f, 6, false, "हस्त", 1, 0xFF22C55E),
            PlanetaryDegree("गुरु (Jupiter)", "गु", 3, "कर्क", 4.9f, 94.9f, 4, false, "पुष्य", 1, 0xFFFACC15),
            PlanetaryDegree("शुक्र (Venus)", "शु", 11, "मीन", 18.7f, 348.7f, 12, false, "रेवती", 1, 0xFFF472B6),
            PlanetaryDegree("शनि (Saturn)", "श", 6, "तुला", 19.3f, 199.3f, 7, true, "स्वाती", 4, 0xFF60A5FA),
            PlanetaryDegree("राहु (Rahu)", "रा", 1, "वृषभ", 8.1f, 38.1f, 2, true, "कृतिका", 4, 0xFFA855F7),
            PlanetaryDegree("केतु (Ketu)", "के", 7, "वृश्चिक", 8.1f, 218.1f, 8, true, "अनुराधा", 2, 0xFFFB923C)
        )

        val rashis = listOf("मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन")

        val d1Grid = (1..12).map { house ->
            val rIdx = (house - 1) % 12
            val occupants = planets.filter { it.houseNumber == house }.map { it.sanskritSymbol }
            ChartHouseCell(house, rIdx + 1, rashis[rIdx], occupants)
        }

        val d9Grid = (1..12).map { house ->
            val rIdx = (house + 3) % 12
            val occupants = planets.filter { ((it.rashiIndex * 9 + (it.degreeInSign / 3.333f).toInt()) % 12) == rIdx }
                .map { it.sanskritSymbol }
            ChartHouseCell(house, rIdx + 1, rashis[rIdx], occupants)
        }

        return VedicChartData(
            chartId = "shakti_default_01",
            nativeName = "श्रीमान जातक",
            birthDateTimeIso = "1995-10-13T10:30:00",
            birthPlace = "उज्जैन (Ujjain)",
            lagnaRashi = "मेष (Aries)",
            lagnaDegree = 12.45f,
            planetaryDegrees = planets,
            d1ChartGrid = d1Grid,
            d9ChartGrid = d9Grid,
            currentMahadasha = MahadashaInfo(
                mahadashaLord = "गुरु (Jupiter)",
                antardashaLord = "शुक्र (Venus)",
                pratyantardashaLord = "सूर्य (Sun)",
                startDateIso = "2024-03-15",
                endDateIso = "2026-11-15",
                progressFraction = 0.62f
            ),
            dailyPanchang = DailyPanchangTransitData(
                locationName = "उज्जैन (Ujjain)",
                tithiName = "शुक्ल दशमी",
                pakshaName = "शुक्ल पक्ष",
                nakshatraName = "धनिष्ठा",
                yogaName = "शूल योग",
                karanaName = "तैतिल करण",
                sunriseTime = "06:18 AM",
                sunsetTime = "05:56 PM",
                gocharHighlights = listOf(
                    "गुरु गोचर चतुर्थ भाव में हंस महापुरुष राजयोग को बल दे रहा है।",
                    "शनि सप्तम भाव से दशम कर्म क्षेत्र पर शुभ दृष्टि डाल रहे हैं।",
                    "सूर्य लग्नस्थ होकर आत्मबल, तेज व नेतृत्व क्षमता में वृद्धि कर रहे हैं।"
                )
            ),
            umaPredictions = listOf(
                "UMA विश्लेषण: आपकी लग्न कुण्डली (D-1) में चतुर्थ भाव में उच्च के गुरु एवं चंद्रमा से 'गजकेसरी' तथा 'हंस महापुरुष राजयोग' निर्मित हो रहा है।",
                "महादशा संकेत: वर्तमान गुरु महादशा में शुक्र की अंतर्दशा भूमि, वाहन, आध्यात्मिक उन्नति एवं पद-प्रतिष्ठा के लिए अत्यंत अनुकूल है।",
                "नवमांश (D-9) सामर्थ्य: लग्नेश मंगल दशम भाव में उच्चस्थ होकर आपके कर्म व भाग्य को दीर्घकालिक स्थायित्व प्रदान करता है।"
            )
        )
    }
}

// ============================================================================
// DELIVERABLE 3: 3D COMPOSABLE UI (Rotating Zodiac Wheel, Glassmorphism & UMA)
// ============================================================================

private val DeepCosmicNavy = Color(0xFF060919)
private val MidnightIndigo = Color(0xFF0F172A)
private val SacredSaffron = Color(0xFFFF6F00)
private val DeepVermilion = Color(0xFFE65100)
private val RoyalGold = Color(0xFFFFD700)
private val SoftGold = Color(0xFFFDE68A)

@Composable
fun Shakti3DKundaliScreen(
    viewModel: PanchangViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.chartState.collectAsState()

    // 1. Continuous 3D Wheel Spin Animation (runs on RenderThread / InfiniteTransition,
    // completely unaffected when UMA Assistant sheet slides in or out)
    val infiniteTransition = rememberInfiniteTransition(label = "ZodiacWheelSpinTransition")
    val continuousRotationZ by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 48000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "WheelRotationZ"
    )

    // 2. Interactive 3D Parallax Tilt (rotationX, rotationY) via touch gestures
    var tiltX by remember { mutableFloatStateOf(22f) }
    var tiltY by remember { mutableFloatStateOf(-8f) }

    val animatedTiltX by animateFloatAsState(
        targetValue = tiltX,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "ParallaxTiltX"
    )
    val animatedTiltY by animateFloatAsState(
        targetValue = tiltY,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "ParallaxTiltY"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(DeepCosmicNavy, MidnightIndigo, Color(0xFF1A0F2E))
                )
            )
    ) {
        // Main Column: Header + Glassmorphism Panchang Overlay + 3D Zodiac Wheel
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Header with D-1 / D-9 Switcher & UMA Trigger
            TopVedic3DHeader(
                nativeName = state.nativeName,
                lagnaRashi = state.lagnaRashi,
                activeDivision = state.activeDivision,
                isUmaOpen = state.isUmaSheetExpanded,
                onSwitchDivision = viewModel::toggleChartDivision,
                onToggleUma = { viewModel.toggleUmaAssistantSheet() }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Frosted Glassmorphism Card: Daily Panchang & Gochar Transits
            FrostedGlassPanchangOverlayCard(
                panchang = state.dailyPanchang,
                mahadasha = state.currentMahadasha
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Centerpiece: 3D Rotating Zodiac Kundali Wheel using Modifier.graphicsLayer
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragEnd = {
                                tiltX = 22f
                                tiltY = -8f
                            },
                            onDragCancel = {
                                tiltX = 22f
                                tiltY = -8f
                            },
                            onDrag = { change, dragAmount ->
                                change.consume()
                                tiltY = (tiltY + dragAmount.x * 0.12f).coerceIn(-32f, 32f)
                                tiltX = (tiltX - dragAmount.y * 0.12f).coerceIn(-25f, 45f)
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Rotating3DZodiacWheel(
                    chartData = state,
                    rotationX = animatedTiltX,
                    rotationY = animatedTiltY,
                    rotationZ = continuousRotationZ,
                    onPlanetTapped = { planet ->
                        viewModel.selectPlanetForInspection(planet.planetName)
                    }
                )
            }

            // Planetary Degree Horizontal Ribbon
            PlanetaryDegreesRibbon(
                planets = state.planetaryDegrees,
                selectedPlanetName = state.selectedPlanetName,
                onSelectPlanet = { viewModel.selectPlanetForInspection(it.planetName) }
            )
        }

        // 4. UMA AI Assistant Sync Overlay Sheet (slides in smoothly without halting 3D wheel)
        AnimatedVisibility(
            visible = state.isUmaSheetExpanded,
            enter = slideInVertically(
                initialOffsetY = { fullHeight -> fullHeight },
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioLowBouncy,
                    stiffness = Spring.StiffnessMediumLow
                )
            ) + fadeIn(),
            exit = slideOutVertically(
                targetOffsetY = { fullHeight -> fullHeight },
                animationSpec = tween(durationMillis = 280)
            ) + fadeOut(),
            modifier = Modifier.align(Alignment.BottomCenter)
        ) {
            UmaAssistantSlidingSheet(
                chartData = state,
                onDismiss = { viewModel.toggleUmaAssistantSheet(false) }
            )
        }
    }
}

// ----------------------------------------------------------------------------
// 3D ROTATING ZODIAC WHEEL WITH Modifier.graphicsLayer
// ----------------------------------------------------------------------------

@Composable
fun Rotating3DZodiacWheel(
    chartData: VedicChartData,
    rotationX: Float,
    rotationY: Float,
    rotationZ: Float,
    onPlanetTapped: (PlanetaryDegree) -> Unit
) {
    val density = LocalDensity.current.density
    val textMeasurer = rememberTextMeasurer()

    val rashiGlyphs = remember {
        listOf(
            "♈ मेष", "♉ वृषभ", "♊ मिथुन", "♋ कर्क",
            "♌ सिंह", "♍ कन्या", "♎ तुला", "♏ वृश्चिक",
            "♐ धनु", "♑ मकर", "♒ कुंभ", "♓ मीन"
        )
    }

    val activeHouses = if (chartData.activeDivision == "D9") {
        chartData.d9ChartGrid
    } else {
        chartData.d1ChartGrid
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(340.dp)
            .graphicsLayer {
                // True 3D perspective camera distance + parallax tilt + continuous Z spin
                this.cameraDistance = 14f * density
                this.rotationX = rotationX
                this.rotationY = rotationY
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val outerRadius = size.minDimension / 2f * 0.95f
            val rashiRingRadius = outerRadius * 0.78f
            val houseRingRadius = outerRadius * 0.56f
            val coreRadius = outerRadius * 0.28f

            // Ambient Saffron-Gold Outer Halo
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        SacredSaffron.copy(alpha = 0.32f),
                        RoyalGold.copy(alpha = 0.12f),
                        Color.Transparent
                    ),
                    center = center,
                    radius = outerRadius * 1.05f
                ),
                radius = outerRadius * 1.05f,
                center = center
            )

            // Rotate Wheel along Z-Axis
            rotate(degrees = rotationZ, pivot = center) {
                // Cosmic Navy Disc Base
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0xFF1E293B), DeepCosmicNavy),
                        center = center,
                        radius = outerRadius
                    ),
                    radius = outerRadius,
                    center = center
                )

                // Metallic Gold Bezel Rings
                drawCircle(
                    brush = Brush.sweepGradient(
                        colors = listOf(RoyalGold, SacredSaffron, SoftGold, DeepVermilion, RoyalGold),
                        center = center
                    ),
                    radius = outerRadius,
                    center = center,
                    style = Stroke(width = 4.dp.toPx())
                )

                drawCircle(
                    color = RoyalGold.copy(alpha = 0.65f),
                    radius = rashiRingRadius,
                    center = center,
                    style = Stroke(width = 2.dp.toPx())
                )

                drawCircle(
                    color = SacredSaffron.copy(alpha = 0.5f),
                    radius = houseRingRadius,
                    center = center,
                    style = Stroke(width = 1.5.dp.toPx())
                )

                // Draw 12 Rashi Sectors & House Divisions
                for (i in 0 until 12) {
                    val startAngleDeg = i * 30f - 90f
                    val midAngleDeg = startAngleDeg + 15f
                    val startRad = (startAngleDeg * PI / 180.0).toFloat()
                    val midRad = (midAngleDeg * PI / 180.0).toFloat()

                    val innerPoint = Offset(
                        x = center.x + coreRadius * cos(startRad),
                        y = center.y + coreRadius * sin(startRad)
                    )
                    val outerPoint = Offset(
                        x = center.x + outerRadius * cos(startRad),
                        y = center.y + outerRadius * sin(startRad)
                    )

                    drawLine(
                        color = RoyalGold.copy(alpha = 0.38f),
                        start = innerPoint,
                        end = outerPoint,
                        strokeWidth = 1.2.dp.toPx()
                    )

                    // Rashi Name on Outer Ring
                    val labelRadius = (outerRadius + rashiRingRadius) / 2f
                    val labelCenter = Offset(
                        x = center.x + labelRadius * cos(midRad),
                        y = center.y + labelRadius * sin(midRad)
                    )

                    val rashiLayout = textMeasurer.measure(
                        text = rashiGlyphs[i],
                        style = TextStyle(
                            color = SoftGold,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    drawText(
                        textLayoutResult = rashiLayout,
                        topLeft = Offset(
                            x = labelCenter.x - rashiLayout.size.width / 2f,
                            y = labelCenter.y - rashiLayout.size.height / 2f
                        )
                    )

                    // House Number & Occupants inside Inner Ring
                    val houseRadius = (rashiRingRadius + houseRingRadius) / 2f
                    val houseCenter = Offset(
                        x = center.x + houseRadius * cos(midRad),
                        y = center.y + houseRadius * sin(midRad)
                    )
                    val houseCell = activeHouses.getOrNull(i)
                    val houseLabel = "H${i + 1}"
                    val houseTextLayout = textMeasurer.measure(
                        text = houseLabel,
                        style = TextStyle(
                            color = SacredSaffron,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    )
                    drawText(
                        textLayoutResult = houseTextLayout,
                        topLeft = Offset(
                            x = houseCenter.x - houseTextLayout.size.width / 2f,
                            y = houseCenter.y - houseTextLayout.size.height / 2f
                        )
                    )
                }

                // Draw 9 Navagraha Planetary Nodes at exact Sidereal Longitudes
                chartData.planetaryDegrees.forEachIndexed { idx, planet ->
                    val pAngleRad = ((planet.absoluteLongitude - 90f) * PI / 180.0).toFloat()
                    val orbitRadius = coreRadius + (houseRingRadius - coreRadius) * (0.35f + (idx % 3) * 0.25f)
                    val pOffset = Offset(
                        x = center.x + orbitRadius * cos(pAngleRad),
                        y = center.y + orbitRadius * sin(pAngleRad)
                    )
                    val planetColor = Color(planet.colorArgb)

                    // Glowing Planetary Orb
                    drawCircle(
                        color = planetColor.copy(alpha = 0.28f),
                        radius = 15.dp.toPx(),
                        center = pOffset
                    )
                    drawCircle(
                        color = DeepCosmicNavy,
                        radius = 11.dp.toPx(),
                        center = pOffset
                    )
                    drawCircle(
                        color = planetColor,
                        radius = 11.dp.toPx(),
                        center = pOffset,
                        style = Stroke(width = 2.dp.toPx())
                    )

                    val symLayout = textMeasurer.measure(
                        text = planet.sanskritSymbol,
                        style = TextStyle(
                            color = Color.White,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black
                        )
                    )
                    drawText(
                        textLayoutResult = symLayout,
                        topLeft = Offset(
                            x = pOffset.x - symLayout.size.width / 2f,
                            y = pOffset.y - symLayout.size.height / 2f
                        )
                    )
                }
            }

            // Stationary Sacred Bindu Hub (Om & Active Chart Division)
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(DeepVermilion, DeepCosmicNavy),
                    center = center,
                    radius = coreRadius
                ),
                radius = coreRadius,
                center = center
            )
            drawCircle(
                color = RoyalGold,
                radius = coreRadius,
                center = center,
                style = Stroke(width = 2.5.dp.toPx())
            )

            val omLayout = textMeasurer.measure(
                text = "ॐ ${chartData.activeDivision}",
                style = TextStyle(
                    color = RoyalGold,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black
                )
            )
            drawText(
                textLayoutResult = omLayout,
                topLeft = Offset(
                    x = center.x - omLayout.size.width / 2f,
                    y = center.y - omLayout.size.height / 2f
                )
            )
        }
    }
}

// ----------------------------------------------------------------------------
// GLASSMORPHISM OVERLAYS (RenderEffect.createBlurEffect)
// ----------------------------------------------------------------------------

fun Modifier.frostedCosmicGlass(): Modifier = this.then(
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        Modifier.graphicsLayer {
            renderEffect = RenderEffect.createBlurEffect(
                24f,
                24f,
                Shader.TileMode.DECAL
            ).asComposeRenderEffect()
        }
    } else {
        Modifier
    }
)

@Composable
fun FrostedGlassPanchangOverlayCard(
    panchang: DailyPanchangTransitData,
    mahadasha: MahadashaInfo
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
    ) {
        // Blurred Background Layer using RenderEffect.createBlurEffect
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.12f),
                            SacredSaffron.copy(alpha = 0.10f),
                            MidnightIndigo.copy(alpha = 0.65f)
                        )
                    )
                )
                .frostedCosmicGlass()
        )

        // Foreground Crisp Astrological Telemetry
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    width = 1.dp,
                    brush = Brush.horizontalGradient(
                        colors = listOf(RoyalGold.copy(alpha = 0.55f), SacredSaffron.copy(alpha = 0.35f))
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "दैनिक पंचांग एवं गोचर • ${panchang.locationName}",
                    color = RoyalGold,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "🌅 ${panchang.sunriseTime}  🌇 ${panchang.sunsetTime}",
                    color = SoftGold.copy(alpha = 0.85f),
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                PanchangMiniPill("तिथि", panchang.tithiName, Modifier.weight(1f))
                PanchangMiniPill("नक्षत्र", panchang.nakshatraName, Modifier.weight(1f))
                PanchangMiniPill("योग", panchang.yogaName, Modifier.weight(1f))
                PanchangMiniPill("महादशा", "${mahadasha.mahadashaLord}/${mahadasha.antardashaLord}", Modifier.weight(1.2f))
            }
        }
    }
}

@Composable
private fun PanchangMiniPill(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(DeepCosmicNavy.copy(alpha = 0.55f))
            .border(0.5.dp, RoyalGold.copy(alpha = 0.25f), RoundedCornerShape(10.dp))
            .padding(horizontal = 8.dp, vertical = 6.dp)
    ) {
        Text(text = label, color = SoftGold.copy(alpha = 0.65f), fontSize = 10.sp)
        Text(text = value, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
    }
}

// ----------------------------------------------------------------------------
// TOP HEADER, PLANETARY RIBBON & UMA ASSISTANT SLIDING SHEET
// ----------------------------------------------------------------------------

@Composable
private fun TopVedic3DHeader(
    nativeName: String,
    lagnaRashi: String,
    activeDivision: String,
    isUmaOpen: Boolean,
    onSwitchDivision: (String) -> Unit,
    onToggleUma: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "शक्ति पंचांग • 3D कुण्डली",
                color = RoyalGold,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "$nativeName • लग्न: $lagnaRashi",
                color = SoftGold.copy(alpha = 0.8f),
                fontSize = 12.sp
            )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            listOf("D1", "D9").forEach { div ->
                val selected = activeDivision == div
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (selected) SacredSaffron else MidnightIndigo)
                        .border(1.dp, RoyalGold.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        .clickable { onSwitchDivision(div) }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = div,
                        color = if (selected) DeepCosmicNavy else SoftGold,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }

            Button(
                onClick = onToggleUma,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isUmaOpen) RoyalGold else SacredSaffron
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "UMA AI",
                    color = DeepCosmicNavy,
                    fontWeight = FontWeight.Black,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun PlanetaryDegreesRibbon(
    planets: List<PlanetaryDegree>,
    selectedPlanetName: String?,
    onSelectPlanet: (PlanetaryDegree) -> Unit
) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        items(planets, key = { it.planetName }) { p ->
            val isSel = p.planetName == selectedPlanetName
            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isSel) SacredSaffron.copy(alpha = 0.3f) else MidnightIndigo.copy(alpha = 0.75f))
                    .border(
                        width = if (isSel) 1.5.dp else 0.8.dp,
                        color = if (isSel) RoyalGold else RoyalGold.copy(alpha = 0.25f),
                        shape = RoundedCornerShape(12.dp)
                    )
                    .clickable { onSelectPlanet(p) }
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text(text = p.planetName, color = SoftGold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text(
                    text = "${p.rashiName} ${"%.1f".format(p.degreeInSign)}° (H${p.houseNumber})",
                    color = Color.White,
                    fontSize = 10.sp
                )
            }
        }
    }
}

@Composable
private fun UmaAssistantSlidingSheet(
    chartData: VedicChartData,
    onDismiss: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF1E1B4B).copy(alpha = 0.96f), DeepCosmicNavy.copy(alpha = 0.98f))
                )
            )
            .border(
                width = 1.5.dp,
                brush = Brush.horizontalGradient(listOf(RoyalGold, SacredSaffron, RoyalGold)),
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
            )
            .padding(20.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(listOf(SacredSaffron, RoyalGold))),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "उमा", color = DeepCosmicNavy, fontWeight = FontWeight.Black, fontSize = 13.sp)
                }
                Column {
                    Text(
                        text = "UMA AI ज्योतिष परामर्श (Live 3D Sync)",
                        color = RoyalGold,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        text = "महादशा: ${chartData.currentMahadasha.mahadashaLord} → ${chartData.currentMahadasha.antardashaLord}",
                        color = SoftGold.copy(alpha = 0.8f),
                        fontSize = 11.sp
                    )
                }
            }
            TextButton(onClick = onDismiss) {
                Text("बंद करें ✕", color = SoftGold)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        chartData.umaPredictions.forEach { prediction ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.06f))
                    .border(0.8.dp, RoyalGold.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Text(
                    text = prediction,
                    color = Color.White,
                    fontSize = 12.sp,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
