'use client'

import React from 'react'
import { useLanguage } from '../layout'
import { BookOpen, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react'

const safetyTranslations = {
  en: {
    title: "Flood Safety Center",
    desc: "Critical safety guidelines and protocols before, during, and after a flood event.",
    beforeTitle: "Before a Flood",
    before1: "Keep emergency supplies (food, water, medicine) ready.",
    before2: "Ensure mobile devices are fully charged and power reserves are ready.",
    before3: "Monitor official alerts and warning boards closely.",
    before4: "Avoid transit routes through low-lying areas or drainage outlets.",
    duringTitle: "During Flooding",
    during1: "Do NOT walk, swim, or drive through flowing water.",
    during2: "Follow evacuation alerts and orders immediately.",
    during3: "Stay clear of power lines, transformers, and electrical poles.",
    during4: "Move to designated high-ground assembly points when instructed.",
    afterTitle: "After Flooding",
    after1: "Avoid standing water; it may be contaminated or contain live current.",
    after2: "Do NOT return home until municipal authorities declare the area safe.",
    after3: "Report structural damage, water mains leaks, or electrical hazards."
  },
  te: {
    title: "వరద భద్రతా కేంద్రం",
    desc: "వరద సమయంలో, అంతకు ముందు మరియు తరువాత పాటించాల్సిన ముఖ్యమైన భద్రతా సూచనలు.",
    beforeTitle: "వరదకు ముందు",
    before1: "అత్యవసర సామాగ్రి (ఆహారం, నీరు, మందులు) సిద్ధంగా ఉంచుకోండి.",
    before2: "మొబైల్ ఫోన్లు పూర్తిగా ఛార్జ్ చేసి ఉంచండి.",
    before3: "అధికారిక హెచ్చరికలు మరియు సమాచారాన్ని నిరంతరం గమనించండి.",
    before4: "తక్కువ ఎత్తులో ఉండే ప్రవాహ మార్గాలు మరియు డ్రైనేజీ ప్రాంతాలకు దూరంగా ఉండండి.",
    duringTitle: "వరద సమయంలో",
    during1: "ప్రవహిస్తున్న వరద నీటిలో నడవటం లేదా వాహనాలు నడపటం చేయవద్దు.",
    during2: "తరలింపు ఉత్తర్వులను వెంటనే పాటించండి.",
    during3: "విద్యుత్ స్తంభాలు, తీగలు మరియు ట్రాన్స్‌ఫార్మర్లకు దూరంగా ఉండండి.",
    during4: "సూచించినప్పుడు సురక్షితమైన ఎత్తైన ప్రాంతాలకు తరలి వెళ్ళండి.",
    afterTitle: "వరద తరువాత",
    after1: "నిల్వ ఉన్న వరద నీటిని తాకవద్దు; అది కలుషితం లేదా విద్యుత్ ప్రవాహం కలిగి ఉండవచ్చు.",
    after2: "అధికారులు సురక్షితం అని ప్రకటించే వరకు ఇళ్లకు తిరిగి వెళ్ళకండి.",
    after3: "భవనాల దెబ్బతినడం, నీటి లీకేజీలు లేదా విద్యుత్ ప్రమాదాలను నివేదించండి."
  },
  hi: {
    title: "बाढ़ सुरक्षा केंद्र",
    desc: "बाढ़ की स्थिति से पहले, दौरान और बाद में महत्वपूर्ण सुरक्षा दिशानिर्देश।",
    beforeTitle: "बाढ़ से पहले",
    before1: "आपातकालीन आपूर्ति (भोजन, पानी, दवा) तैयार रखें।",
    before2: "सुनिश्चित करें कि मोबाइल फोन पूरी तरह चार्ज हैं और पावर बैंक तैयार हैं।",
    before3: "आधिकारिक अलर्ट और चेतावनी बोर्डों पर कड़ी नज़र रखें।",
    before4: "जलभराव वाले निचले क्षेत्रों या जल निकासी आउटलेट के पास जाने से बचें।",
    duringTitle: "बाढ़ के दौरान",
    during1: "बहते पानी में न चलें, न तैरें और न ही गाड़ी चलाएं।",
    during2: "निकासी के आदेशों का तुरंत पालन करें।",
    during3: "बिजली की लाइनों, ट्रांसफार्मर और खंभों से दूर रहें।",
    during4: "निर्देश दिए जाने पर तुरंत ऊंचे सुरक्षित स्थानों पर चले जाएं।",
    afterTitle: "बाढ़ के बाद",
    after1: "खड़े पानी से बचें; यह दूषित हो सकता है या इसमें करंट हो सकता है।",
    after2: "जब तक अधिकारी सुरक्षित घोषित न करें, घर वापस न जाएं।",
    after3: "संरचनात्मक क्षति, पाइप लीकेज या बिजली के खतरों की रिपोर्ट करें।"
  }
}

export default function CitizenSafety() {
  const { lang } = useLanguage()
  const t = safetyTranslations[lang]

  return (
    <div className="space-y-5">
      
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">{t.title}</h2>
        <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
      </div>

      {/* Safety categories */}
      <div className="space-y-4">
        
        {/* Category 1: Before */}
        <div className="glass-panel border-l-4 border-l-sky-500 rounded-2xl p-5 space-y-3.5 shadow-md">
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-sky-400 shrink-0" />
            <span>{t.beforeTitle}</span>
          </h3>
          <ul className="space-y-2 text-[11px] text-slate-350 leading-relaxed text-left">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-450 mt-1.5 shrink-0" />
              <span>{t.before1}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-450 mt-1.5 shrink-0" />
              <span>{t.before2}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-450 mt-1.5 shrink-0" />
              <span>{t.before3}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-450 mt-1.5 shrink-0" />
              <span>{t.before4}</span>
            </li>
          </ul>
        </div>

        {/* Category 2: During */}
        <div className="glass-panel border-l-4 border-l-orange-500 rounded-2xl p-5 space-y-3.5 shadow-md">
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-orange-400 shrink-0" />
            <span>{t.duringTitle}</span>
          </h3>
          <ul className="space-y-2 text-[11px] text-slate-350 leading-relaxed text-left">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-450 mt-1.5 shrink-0" />
              <span className="font-semibold text-white">{t.during1}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-450 mt-1.5 shrink-0" />
              <span>{t.during2}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-450 mt-1.5 shrink-0" />
              <span>{t.during3}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-450 mt-1.5 shrink-0" />
              <span>{t.during4}</span>
            </li>
          </ul>
        </div>

        {/* Category 3: After */}
        <div className="glass-panel border-l-4 border-l-emerald-500 rounded-2xl p-5 space-y-3.5 shadow-md">
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{t.afterTitle}</span>
          </h3>
          <ul className="space-y-2 text-[11px] text-slate-350 leading-relaxed text-left">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 mt-1.5 shrink-0" />
              <span>{t.after1}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 mt-1.5 shrink-0" />
              <span>{t.after2}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 mt-1.5 shrink-0" />
              <span>{t.after3}</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  )
}
