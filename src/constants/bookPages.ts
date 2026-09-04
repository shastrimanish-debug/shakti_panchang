import {
  Sun,
  Calendar,
  Clock,
  Compass,
  User,
  Heart,
  Gift,
  Bell,
  LucideIcon
} from 'lucide-react';

export interface BookPageItem {
  id: string;
  title: string;
  label: string;
  pageNumber: number;
  chapter: string;
  desc: string;
  icon: LucideIcon;
}

export const BOOK_PAGES: BookPageItem[] = [
  {
    id: 'panchang',
    title: 'दैनिक पंचांग व काल गणना',
    label: 'पंचांग',
    pageNumber: 1,
    chapter: 'प्रथम अध्याय',
    desc: 'तिथि, वार, नक्षत्र, योग, करण व अयनांश',
    icon: Sun,
  },
  {
    id: 'choghadiya',
    title: 'चौघड़िया चक्र व मुहूर्त वेला',
    label: 'चौघड़िया',
    pageNumber: 2,
    chapter: 'द्वितीय अध्याय',
    desc: 'दिन व रात्रि के अमृत, शुभ, लाभ व त्याज्य काल',
    icon: Clock,
  },
  {
    id: 'muhurat',
    title: 'कार्य सिद्धि व शुभ मुहूर्त निर्णय',
    label: 'मुहूर्त',
    pageNumber: 3,
    chapter: 'तृतीय अध्याय',
    desc: 'विवाह, गृह प्रवेश, व्यापार, वाहन व नामकरण मुहूर्त',
    icon: Compass,
  },
  {
    id: 'yatra',
    title: 'दिशाशूल विचार व यात्रा शुद्धि',
    label: 'यात्रा',
    pageNumber: 4,
    chapter: 'चतुर्थ अध्याय',
    desc: 'दैनिक दिशाशूल, यात्रा दूरी व शास्त्रोक्त सात्विक परिहार',
    icon: Compass,
  },
  {
    id: 'kundali',
    title: 'जातक जन्म पत्रिका व विंशोत्तरी दशा',
    label: 'कुंडली',
    pageNumber: 5,
    chapter: 'पंचम अध्याय',
    desc: 'लग्न चक्र, नवमांश, महादशा, अंतर्दशा व प्रत्यंतर',
    icon: User,
  },
  {
    id: 'milan',
    title: 'अष्टकूट मिलान व वर-कन्या मेलापक',
    label: 'मिलान',
    pageNumber: 6,
    chapter: 'षष्ठ अध्याय',
    desc: '36 गुण विचार, नाड़ी, भकूट, गण, योनि व मांगलिक विचार',
    icon: Heart,
  },
  {
    id: 'festivals',
    title: 'सनातन व्रत, पर्व व राष्ट्रीय उत्सव',
    label: 'व्रत/त्योहार',
    pageNumber: 7,
    chapter: 'सप्तम अध्याय',
    desc: 'एकादशी, प्रदोष, पूर्णिमा, अमावस्या, शिवरात्रि व समस्त व्रत',
    icon: Gift,
  },
  {
    id: 'reminders',
    title: 'वैदिक अनुष्ठान व धार्मिक संकल्प',
    label: 'रिमाइंडर',
    pageNumber: 8,
    chapter: 'अष्टम अध्याय',
    desc: 'नित्य पूजा, जप, साधना व व्यक्तिगत धार्मिक संकल्प स्मरण',
    icon: Bell,
  },
];
