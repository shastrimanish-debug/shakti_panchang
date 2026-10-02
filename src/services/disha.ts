import { calculateSolarTimes } from './astronomy';
import { getDayChoghadiya, getInauspiciousWindows } from './choghadiya';
import { ChoghadiyaItem } from '../types';

export interface IndianCity {
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  country?: string;
  district?: string;
  type?: string;
}

export const COMMON_INDIAN_CITIES: IndianCity[] = [
  { name: 'उज्जैन (Ujjain)', latitude: 23.1765, longitude: 75.7885, state: 'मध्य प्रदेश', type: 'pilgrimage' },
  { name: 'वाराणसी / काशी (Varanasi)', latitude: 25.3176, longitude: 82.9739, state: 'उत्तर प्रदेश', type: 'pilgrimage' },
  { name: 'अयोध्या (Ayodhya)', latitude: 26.7986, longitude: 82.1998, state: 'उत्तर प्रदेश', type: 'pilgrimage' },
  { name: 'मथुरा (Mathura)', latitude: 27.4924, longitude: 77.6737, state: 'उत्तर प्रदेश', type: 'pilgrimage' },
  { name: 'वृंदावन (Vrindavan)', latitude: 27.5806, longitude: 77.7006, state: 'उत्तर प्रदेश', type: 'pilgrimage' },
  { name: 'हरिद्वार (Haridwar)', latitude: 29.9457, longitude: 78.1642, state: 'उत्तराखंड', type: 'pilgrimage' },
  { name: 'ऋषिकेश (Rishikesh)', latitude: 30.0869, longitude: 78.2676, state: 'उत्तराखंड', type: 'pilgrimage' },
  { name: 'बद्रीनाथ (Badrinath)', latitude: 30.7433, longitude: 79.4938, state: 'उत्तराखंड', type: 'pilgrimage' },
  { name: 'केदारनाथ (Kedarnath)', latitude: 30.7352, longitude: 79.0669, state: 'उत्तराखंड', type: 'pilgrimage' },
  { name: 'गंगोत्री (Gangotri)', latitude: 30.9940, longitude: 78.9398, state: 'उत्तराखंड', type: 'pilgrimage' },
  { name: 'यमुनोत्री (Yamunotri)', latitude: 31.0140, longitude: 78.4600, state: 'उत्तराखंड', type: 'pilgrimage' },
  { name: 'प्रयागराज (Prayagraj)', latitude: 25.4358, longitude: 81.8463, state: 'उत्तर प्रदेश', type: 'pilgrimage' },
  { name: 'गया (Gaya)', latitude: 24.7969, longitude: 85.0002, state: 'बिहार', type: 'pilgrimage' },
  { name: 'पुरी जगन्नाथ (Puri)', latitude: 19.8135, longitude: 85.8312, state: 'ओडिशा', type: 'pilgrimage' },
  { name: 'द्वारका (Dwarka)', latitude: 22.2442, longitude: 68.9685, state: 'गुजरात', type: 'pilgrimage' },
  { name: 'सोमनाथ (Somnath)', latitude: 20.8880, longitude: 70.4012, state: 'गुजरात', type: 'pilgrimage' },
  { name: 'रामेश्वरम (Rameswaram)', latitude: 9.2876, longitude: 79.3129, state: 'तमिलनाडु', type: 'pilgrimage' },
  { name: 'तिरुपति (Tirupati)', latitude: 13.6288, longitude: 79.4192, state: 'आंध्र प्रदेश', type: 'pilgrimage' },
  { name: 'मदुरै (Madurai)', latitude: 9.9252, longitude: 78.1198, state: 'तमिलनाडु', type: 'pilgrimage' },
  { name: 'शिरडी (Shirdi)', latitude: 19.7660, longitude: 74.4774, state: 'महाराष्ट्र', type: 'pilgrimage' },
  { name: 'पंढरपुर (Pandharpur)', latitude: 17.6746, longitude: 75.3235, state: 'महाराष्ट्र', type: 'pilgrimage' },
  { name: 'पुष्कर (Pushkar)', latitude: 26.4897, longitude: 74.5510, state: 'राजस्थान', type: 'pilgrimage' },
  { name: 'वैष्णो देवी (Vaishno Devi)', latitude: 33.0309, longitude: 74.9490, state: 'जम्मू और कश्मीर', type: 'pilgrimage' },
  { name: 'चित्रकूट (Chitrakoot)', latitude: 25.1980, longitude: 80.8590, state: 'उत्तर प्रदेश', type: 'pilgrimage' },
  { name: 'ओंकारेश्वर (Omkareshwar)', latitude: 22.2455, longitude: 76.1511, state: 'मध्य प्रदेश', type: 'pilgrimage' },
  { name: 'नासिक (Nashik)', latitude: 19.9975, longitude: 73.7898, state: 'महाराष्ट्र', type: 'pilgrimage' },
  { name: 'कन्याकुमारी (Kanyakumari)', latitude: 8.0883, longitude: 77.5385, state: 'तमिलनाडु', type: 'pilgrimage' },
  { name: 'नई दिल्ली (New Delhi)', latitude: 28.6139, longitude: 77.2090, state: 'दिल्ली' },
  { name: 'मुंबई (Mumbai)', latitude: 19.0760, longitude: 72.8777, state: 'महाराष्ट्र' },
  { name: 'वडोदरा (Vadodara)', latitude: 22.3072, longitude: 73.1812, state: 'गुजरात' },
  { name: 'अहमदाबाद (Ahmedabad)', latitude: 23.0225, longitude: 72.5714, state: 'गुजरात' },
  { name: 'सूरत (Surat)', latitude: 21.1702, longitude: 72.8311, state: 'गुजरात' },
  { name: 'पुणे (Pune)', latitude: 18.5204, longitude: 73.8567, state: 'महाराष्ट्र' },
  { name: 'जयपुर (Jaipur)', latitude: 26.9124, longitude: 75.7873, state: 'राजस्थान' },
  { name: 'इन्दौर (Indore)', latitude: 22.7196, longitude: 75.8577, state: 'मध्य प्रदेश' },
  { name: 'भोपाल (Bhopal)', latitude: 23.2599, longitude: 77.4126, state: 'मध्य प्रदेश' },
  { name: 'बुरहानपुर (Burhanpur)', latitude: 21.3142, longitude: 76.2298, state: 'मध्य प्रदेश' },
  { name: 'खंडवा (Khandwa)', latitude: 21.8314, longitude: 76.3498, state: 'मध्य प्रदेश' },
  { name: 'जबलपुर (Jabalpur)', latitude: 23.1815, longitude: 79.9864, state: 'मध्य प्रदेश' },
  { name: 'ग्वालियर (Gwalior)', latitude: 26.2183, longitude: 78.1828, state: 'मध्य प्रदेश' },
  { name: 'बेंगलुरु (Bengaluru)', latitude: 12.9716, longitude: 77.5946, state: 'कर्नाटक' },
  { name: 'हैदराबाद (Hyderabad)', latitude: 17.3850, longitude: 78.4867, state: 'तेलंगाना' },
  { name: 'चेन्नई (Chennai)', latitude: 13.0827, longitude: 80.2707, state: 'तमिलनाडु' },
  { name: 'कोलकाता (Kolkata)', latitude: 22.5726, longitude: 88.3639, state: 'पश्चिम बंगाल' },
  { name: 'पटना (Patna)', latitude: 25.5941, longitude: 85.1376, state: 'बिहार' },
  { name: 'लखनऊ (Lucknow)', latitude: 26.8467, longitude: 80.9462, state: 'उत्तर प्रदेश' },
  { name: 'आगरा (Agra)', latitude: 27.1767, longitude: 78.0081, state: 'उत्तर प्रदेश' },
  { name: 'चंडीगढ़ (Chandigarh)', latitude: 30.7333, longitude: 76.7794, state: 'चंडीगढ़' },
  { name: 'अमृतसर (Amritsar)', latitude: 31.6340, longitude: 74.8723, state: 'पंजाब' },
  { name: 'रायपुर (Raipur)', latitude: 21.2514, longitude: 81.6296, state: 'छत्तीसगढ़' },
  { name: 'नागपुर (Nagpur)', latitude: 21.1458, longitude: 79.0882, state: 'महाराष्ट्र' },
  { name: 'राजकोट (Rajkot)', latitude: 22.3039, longitude: 70.8022, state: 'गुजरात' },
  { name: 'पणजी (Panaji)', latitude: 15.4909, longitude: 73.8278, state: 'गोवा' },
  { name: 'कानपुर (Kanpur)', latitude: 26.4499, longitude: 80.3319, state: 'उत्तर प्रदेश' },
  { name: 'मेरठ (Meerut)', latitude: 28.9845, longitude: 77.7064, state: 'उत्तर प्रदेश' },
  { name: 'गाजियाबाद (Ghaziabad)', latitude: 28.6692, longitude: 77.4538, state: 'उत्तर प्रदेश' },
  { name: 'नोएडा (Noida)', latitude: 28.5355, longitude: 77.3910, state: 'उत्तर प्रदेश' },
  { name: 'गोरखपुर (Gorakhpur)', latitude: 26.7606, longitude: 83.3732, state: 'उत्तर प्रदेश' },
  { name: 'बरेली (Bareilly)', latitude: 28.3670, longitude: 79.4304, state: 'उत्तर प्रदेश' },
  { name: 'अलीगढ़ (Aligarh)', latitude: 27.8974, longitude: 78.0880, state: 'उत्तर प्रदेश' },
  { name: 'मुरादाबाद (Moradabad)', latitude: 28.8386, longitude: 78.7733, state: 'उत्तर प्रदेश' },
  { name: 'झांसी (Jhansi)', latitude: 25.4484, longitude: 78.5685, state: 'उत्तर प्रदेश' },
  { name: 'वाराणसी छावनी (Varanasi Cantt)', latitude: 25.3337, longitude: 82.9755, state: 'उत्तर प्रदेश' },
  { name: 'सहारनपुर (Saharanpur)', latitude: 29.9680, longitude: 77.5460, state: 'उत्तर प्रदेश' },
  { name: 'गुड़गाँव (Gurugram)', latitude: 28.4595, longitude: 77.0266, state: 'हरियाणा' },
  { name: 'फरीदाबाद (Faridabad)', latitude: 28.4089, longitude: 77.3178, state: 'हरियाणा' },
  { name: 'पानीपत (Panipat)', latitude: 29.3909, longitude: 76.9635, state: 'हरियाणा' },
  { name: 'करनाल (Karnal)', latitude: 29.6857, longitude: 76.9905, state: 'हरियाणा' },
  { name: 'हिसार (Hisar)', latitude: 29.1492, longitude: 75.7217, state: 'हरियाणा' },
  { name: 'रोहतक (Rohtak)', latitude: 28.8955, longitude: 76.6066, state: 'हरियाणा' },
  { name: 'अम्बाला (Ambala)', latitude: 30.3782, longitude: 76.7767, state: 'हरियाणा' },
  { name: 'लुधियाना (Ludhiana)', latitude: 30.9010, longitude: 75.8573, state: 'पंजाब' },
  { name: 'जालंधर (Jalandhar)', latitude: 31.3260, longitude: 75.5762, state: 'पंजाब' },
  { name: 'पटियाला (Patiala)', latitude: 30.3398, longitude: 76.3869, state: 'पंजाब' },
  { name: 'बठिंडा (Bathinda)', latitude: 30.2110, longitude: 74.9455, state: 'पंजाब' },
  { name: 'जम्मू (Jammu)', latitude: 32.7266, longitude: 74.8570, state: 'जम्मू और कश्मीर' },
  { name: 'श्रीनगर (Srinagar)', latitude: 34.0837, longitude: 74.7973, state: 'जम्मू और कश्मीर' },
  { name: 'लेह (Leh)', latitude: 34.1526, longitude: 77.5771, state: 'लद्दाख' },
  { name: 'शिमला (Shimla)', latitude: 31.1048, longitude: 77.1734, state: 'हिमाचल प्रदेश' },
  { name: 'धर्मशाला (Dharamshala)', latitude: 32.2190, longitude: 76.3234, state: 'हिमाचल प्रदेश' },
  { name: 'मनाली (Manali)', latitude: 32.2396, longitude: 77.1887, state: 'हिमाचल प्रदेश' },
  { name: 'देहरादून (Dehradun)', latitude: 30.3165, longitude: 78.0322, state: 'उत्तराखंड' },
  { name: 'नैनीताल (Nainital)', latitude: 29.3803, longitude: 79.4636, state: 'उत्तराखंड' },
  { name: 'हल्द्वानी (Haldwani)', latitude: 29.2183, longitude: 79.5130, state: 'उत्तराखंड' },
  { name: 'उदयपुर (Udaipur)', latitude: 24.5854, longitude: 73.7125, state: 'राजस्थान' },
  { name: 'जोधपुर (Jodhpur)', latitude: 26.2389, longitude: 73.0243, state: 'राजस्थान' },
  { name: 'कोटा (Kota)', latitude: 25.2138, longitude: 75.8648, state: 'राजस्थान' },
  { name: 'बीकानेर (Bikaner)', latitude: 28.0229, longitude: 73.3119, state: 'राजस्थान' },
  { name: 'अजमेर (Ajmer)', latitude: 26.4499, longitude: 74.6399, state: 'राजस्थान' },
  { name: 'माउंट आबू (Mount Abu)', latitude: 24.5926, longitude: 72.7156, state: 'राजस्थान' },
  { name: 'गांधीनगर (Gandhinagar)', latitude: 23.2156, longitude: 72.6369, state: 'गुजरात' },
  { name: 'भावनगर (Bhavnagar)', latitude: 21.7645, longitude: 72.1519, state: 'गुजरात' },
  { name: 'जामनगर (Jamnagar)', latitude: 22.4707, longitude: 70.0577, state: 'गुजरात' },
  { name: 'जूनागढ़ (Junagadh)', latitude: 21.5222, longitude: 70.4579, state: 'गुजरात' },
  { name: 'भुज (Bhuj)', latitude: 23.2420, longitude: 69.6669, state: 'गुजरात' },
  { name: 'पोरबंदर (Porbandar)', latitude: 21.6417, longitude: 69.6293, state: 'गुजरात' },
  { name: 'आणंद (Anand)', latitude: 22.5645, longitude: 72.9289, state: 'गुजरात' },
  { name: 'भड़ौच (Bharuch)', latitude: 21.7051, longitude: 72.9959, state: 'गुजरात' },
  { name: 'ठाणे (Thane)', latitude: 19.2183, longitude: 72.9781, state: 'महाराष्ट्र' },
  { name: 'नवी मुंबई (Navi Mumbai)', latitude: 19.0330, longitude: 73.0297, state: 'महाराष्ट्र' },
  { name: 'औरंगाबाद (Aurangabad / Chhatrapati Sambhajinagar)', latitude: 19.8762, longitude: 75.3433, state: 'महाराष्ट्र' },
  { name: 'कोल्हापुर (Kolhapur)', latitude: 16.7050, longitude: 74.2433, state: 'महाराष्ट्र' },
  { name: 'सोलापुर (Solapur)', latitude: 17.6599, longitude: 75.9064, state: 'महाराष्ट्र' },
  { name: 'नांदेड़ (Nanded)', latitude: 19.1383, longitude: 77.3210, state: 'महाराष्ट्र' },
  { name: 'गोवा वास्को (Vasco da Gama)', latitude: 15.3982, longitude: 73.8113, state: 'गोवा' },
  { name: 'मैसूरु (Mysuru)', latitude: 12.2958, longitude: 76.6394, state: 'कर्नाटक' },
  { name: 'मंगलुरु (Mangaluru)', latitude: 12.9141, longitude: 74.8560, state: 'कर्नाटक' },
  { name: 'हुब्बल्ली (Hubballi)', latitude: 15.3647, longitude: 75.1240, state: 'कर्नाटक' },
  { name: 'बेलगावी (Belagavi)', latitude: 15.8497, longitude: 74.4977, state: 'कर्नाटक' },
  { name: 'कलबुर्गी (Kalaburagi)', latitude: 17.3297, longitude: 76.8343, state: 'कर्नाटक' },
  { name: 'उड़ुपी (Udupi)', latitude: 13.3409, longitude: 74.7421, state: 'कर्नाटक' },
  { name: 'कोच्चि (Kochi)', latitude: 9.9312, longitude: 76.2673, state: 'केरल' },
  { name: 'तिरुवनंतपुरम (Thiruvananthapuram)', latitude: 8.5241, longitude: 76.9366, state: 'केरल' },
  { name: 'कोझिकोड (Kozhikode)', latitude: 11.2588, longitude: 75.7804, state: 'केरल' },
  { name: 'त्रिशूर (Thrissur)', latitude: 10.5276, longitude: 76.2144, state: 'केरल' },
  { name: 'कोयंबटूर (Coimbatore)', latitude: 11.0168, longitude: 76.9558, state: 'तमिलनाडु' },
  { name: 'तिरुचिरापल्ली (Tiruchirappalli)', latitude: 10.7905, longitude: 78.7047, state: 'तमिलनाडु' },
  { name: 'सेलम (Salem)', latitude: 11.6643, longitude: 78.1460, state: 'तमिलनाडु' },
  { name: 'वेल्लोर (Vellore)', latitude: 12.9165, longitude: 79.1325, state: 'तमिलनाडु' },
  { name: 'कांचीपुरम (Kanchipuram)', latitude: 12.8342, longitude: 79.7036, state: 'तमिलनाडु' },
  { name: 'पुदुच्चेरी (Puducherry)', latitude: 11.9416, longitude: 79.8083, state: 'पुदुच्चेरी' },
  { name: 'विशाखापत्तनम (Visakhapatnam)', latitude: 17.6868, longitude: 83.2185, state: 'आंध्र प्रदेश' },
  { name: 'विजयवाड़ा (Vijayawada)', latitude: 16.5062, longitude: 80.6480, state: 'आंध्र प्रदेश' },
  { name: 'गुंटूर (Guntur)', latitude: 16.3067, longitude: 80.4365, state: 'आंध्र प्रदेश' },
  { name: 'कुरनूल (Kurnool)', latitude: 15.8281, longitude: 78.0373, state: 'आंध्र प्रदेश' },
  { name: 'नेल्लोर (Nellore)', latitude: 14.4426, longitude: 79.9865, state: 'आंध्र प्रदेश' },
  { name: 'वारंगल (Warangal)', latitude: 17.9689, longitude: 79.5941, state: 'तेलंगाना' },
  { name: 'भुवनेश्वर (Bhubaneswar)', latitude: 20.2961, longitude: 85.8245, state: 'ओडिशा' },
  { name: 'कटक (Cuttack)', latitude: 20.4625, longitude: 85.8830, state: 'ओडिशा' },
  { name: 'राउरकेला (Rourkela)', latitude: 22.2604, longitude: 84.8536, state: 'ओडिशा' },
  { name: 'राँची (Ranchi)', latitude: 23.3441, longitude: 85.3096, state: 'झारखंड' },
  { name: 'जमशेदपुर (Jamshedpur)', latitude: 22.8046, longitude: 86.2029, state: 'झारखंड' },
  { name: 'धनबाद (Dhanbad)', latitude: 23.7957, longitude: 86.4304, state: 'झारखंड' },
  { name: 'मुजफ्फरपुर (Muzaffarpur)', latitude: 26.1209, longitude: 85.3647, state: 'बिहार' },
  { name: 'भागलपुर (Bhagalpur)', latitude: 25.2425, longitude: 86.9842, state: 'बिहार' },
  { name: 'दरभंगा (Darbhanga)', latitude: 26.1542, longitude: 85.8918, state: 'बिहार' },
  { name: 'हावड़ा (Howrah)', latitude: 22.5958, longitude: 88.2636, state: 'पश्चिम बंगाल' },
  { name: 'सिलीगुड़ी (Siliguri)', latitude: 26.7271, longitude: 88.3953, state: 'पश्चिम बंगाल' },
  { name: 'दुर्गापुर (Durgapur)', latitude: 23.5204, longitude: 87.3119, state: 'पश्चिम बंगाल' },
  { name: 'आसनसोल (Asansol)', latitude: 23.6739, longitude: 86.9524, state: 'पश्चिम बंगाल' },
  { name: 'भिलाई (Bhilai)', latitude: 21.1938, longitude: 81.3509, state: 'छत्तीसगढ़' },
  { name: 'बिलासपुर (Bilaspur)', latitude: 22.0797, longitude: 82.1409, state: 'छत्तीसगढ़' },
  { name: 'सागर (Sagar)', latitude: 23.8388, longitude: 78.7378, state: 'मध्य प्रदेश' },
  { name: 'रीवा (Rewa)', latitude: 24.5362, longitude: 81.3037, state: 'मध्य प्रदेश' },
  { name: 'सतना (Satna)', latitude: 24.6005, longitude: 80.8322, state: 'मध्य प्रदेश' },
  { name: 'उज्जैन महाकाल क्षेत्र (Ujjain Mahakal)', latitude: 23.1828, longitude: 75.7682, state: 'मध्य प्रदेश', type: 'pilgrimage' },
  { name: 'रतलाम (Ratlam)', latitude: 23.3315, longitude: 75.0367, state: 'मध्य प्रदेश' },
  { name: 'देवास (Dewas)', latitude: 22.9676, longitude: 76.0534, state: 'मध्य प्रदेश' },
  { name: 'गुवाहाटी (Guwahati)', latitude: 26.1445, longitude: 91.7362, state: 'असम' },
  { name: 'शिलांग (Shillong)', latitude: 25.5788, longitude: 91.8933, state: 'मेघालय' },
  { name: 'इंफाल (Imphal)', latitude: 24.8170, longitude: 93.9368, state: 'मणिपुर' },
  { name: 'आइजोल (Aizawl)', latitude: 23.7271, longitude: 92.7176, state: 'मिजोरम' },
  { name: 'अगरतला (Agartala)', latitude: 23.8315, longitude: 91.2868, state: 'त्रिपुरा' },
  { name: 'कोहिमा (Kohima)', latitude: 25.6751, longitude: 94.1086, state: 'नागालैंड' },
  { name: 'ईटानगर (Itanagar)', latitude: 27.0844, longitude: 93.6053, state: 'अरुणाचल प्रदेश' },
  { name: 'गंगटोक (Gangtok)', latitude: 27.3389, longitude: 88.6065, state: 'सिक्किम' },
  { name: 'पोर्ट ब्लेयर (Port Blair)', latitude: 11.6234, longitude: 92.7265, state: 'अंडमान और निकोबार' },
  { name: 'कवारत्ती (Kavaratti)', latitude: 10.5593, longitude: 72.6358, state: 'लक्षद्वीप' },
  { name: 'सिलवासा (Silvassa)', latitude: 20.2763, longitude: 73.0083, state: 'दादरा और नगर हवेली' },
  { name: 'दमन (Daman)', latitude: 20.3974, longitude: 72.8328, state: 'दमन और दीव' },
];

export const DISHASHOOL_MAP: Record<number, string> = {
  0: 'पश्चिम', // Sunday
  1: 'पूर्व',   // Monday
  2: 'उत्तर',  // Tuesday
  3: 'उत्तर',  // Wednesday
  4: 'दक्षिण', // Thursday
  5: 'पश्चिम', // Friday
  6: 'पूर्व',   // Saturday
};

export const DISHASHOOL_REMEDIES: Record<number, string> = {
  0: 'रविवार दिशाशूल परिहार: यात्रा से पूर्व दलिया अथवा घी खाकर, सूर्य देव को अर्घ्य देकर प्रस्थान करें।',
  1: 'सोमवार दिशाशूल परिहार: दर्पण (शीशा) में अपना मुख देखकर अथवा दूध पीकर यात्रा आरंभ करें।',
  2: 'मंगलवार दिशाशूल परिहार: गुड़ खाकर अथवा धनिया चबाकर, हनुमान चालीसा का पाठ कर प्रस्थान करें।',
  3: 'बुधवार दिशाशूल परिहार: तिल अथवा हरी इलायची खाकर, भगवान गणेश का स्मरण कर यात्रा करें।',
  4: 'गुरुवार दिशाशूल परिहार: दही खाकर अथवा पीली सरसों साथ रखकर, श्री हरि विष्णु का ध्यान करें।',
  5: 'शुक्रवार दिशाशूल परिहार: जौ अथवा खीर खाकर, मां लक्ष्मी का ध्यान कर प्रस्थान करें।',
  6: 'शनिवार दिशाशूल परिहार: अदरक, उड़द अथवा राई खाकर, शनि देव का स्मरण कर यात्रा आरंभ करें।',
};

export const TRAVEL_REMEDIES = DISHASHOOL_REMEDIES;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

export function bearingToDirection(bearing: number): string {
  const b = ((bearing % 360) + 360) % 360;
  if (b < 22.5 || b >= 337.5) return 'उत्तर';
  if (b < 67.5) return 'उत्तर-पूर्व';
  if (b < 112.5) return 'पूर्व';
  if (b < 157.5) return 'दक्षिण-पूर्व';
  if (b < 202.5) return 'दक्षिण';
  if (b < 247.5) return 'दक्षिण-पश्चिम';
  if (b < 292.5) return 'पश्चिम';
  return 'उत्तर-पश्चिम';
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371 * c);
}

export interface YatraShoolResult {
  fromName: string;
  toName: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  bearing: number;
  direction: string;
  distanceKm: number;
  shoolDirection: string;
  isDirectionBlocked: boolean;
  message: string;
  remedy: string;
  suitablePeriods: ChoghadiyaItem[];
}

export function calculateYatraShool(
  fromName: string,
  fromLat: number,
  fromLon: number,
  toName: string,
  toLat: number,
  toLon: number,
  date: Date
): YatraShoolResult {
  const weekday = date.getDay();
  const shoolDir = DISHASHOOL_MAP[weekday] || 'पश्चिम';
  const bearing = calculateBearing(fromLat, fromLon, toLat, toLon);
  const direction = bearingToDirection(bearing);
  const distanceKm = calculateDistanceKm(fromLat, fromLon, toLat, toLon);

  const exactBlocked = direction === shoolDir;
  const partialBlocked =
    (direction === 'उत्तर-पूर्व' && shoolDir === 'पूर्व') ||
    (direction === 'उत्तर-पश्चिम' && shoolDir === 'पश्चिम') ||
    (direction === 'दक्षिण-पूर्व' && shoolDir === 'पूर्व') ||
    (direction === 'दक्षिण-पश्चिम' && shoolDir === 'पश्चिम') ||
    (direction === 'उत्तर-पूर्व' && shoolDir === 'उत्तर') ||
    (direction === 'उत्तर-पश्चिम' && shoolDir === 'उत्तर');

  const isBlocked = exactBlocked || partialBlocked;

  let message = '';
  if (exactBlocked) {
    message = `आज ${direction} दिशा में सीधा दिशाशूल है। वैदिक मान्यतानुसार आज इस दिशा में यात्रा प्रारंभ करने से बचें। यदि यात्रा अत्यावश्यक हो तो नीचे दिया गया पारंपरिक परिहार अवश्य करें।`;
  } else if (partialBlocked) {
    message = `आज ${direction} दिशा आंशिक रूप से दिशाशूल (${shoolDir}) से प्रभावित है। सावधानी बरतें और शुभ चौघड़िया में ही यात्रा प्रारंभ करें।`;
  } else {
    message = `आज की यात्रा दिशा (${direction}) दिशाशूल से पूर्णतया मुक्त है। यात्रा के लिए यह दिशा शुभ और अनुकूल है।`;
  }

  const solar = calculateSolarTimes(date, fromLat, fromLon);
  const dayChoghadiyas = getDayChoghadiya(solar, weekday);
  const inauspiciousWindows = getInauspiciousWindows(solar, weekday);

  const suitablePeriods = dayChoghadiyas.filter((c) => {
    if (['Kaal', 'Rog', 'Udveg'].includes(c.name)) return false;
    const overlapsRahu = inauspiciousWindows.some(
      (w) => w.title === 'राहु काल' && c.start < w.end && c.end > w.start
    );
    return !overlapsRahu;
  });

  const remedy = DISHASHOOL_REMEDIES[weekday] || '';

  return {
    fromName,
    toName,
    fromLat,
    fromLon,
    toLat,
    toLon,
    bearing,
    direction,
    distanceKm,
    shoolDirection: shoolDir,
    isDirectionBlocked: isBlocked,
    message,
    remedy,
    suitablePeriods,
  };
}
