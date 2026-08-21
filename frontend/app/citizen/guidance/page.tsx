'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  LifeBuoy,
  Flame,
  Shield,
  Car,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  Info,
  Navigation
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { AppLanguage, EmergencyCategory } from '../../../types/citizen'

interface GuidanceTopic {
  id: string
  category: EmergencyCategory
  title: string
  subtitle: string
  doSteps: string[]
  dontSteps: string[]
  attribution: 'OFFICIAL AUTHORITY' | 'AI ASSISTED'
  officialSource?: string
}

const guidanceTranslations = {
  en: {
    title: "EMERGENCY GUIDANCE & SAFETY",
    subtitle: "Verified step-by-step emergency survival protocols and first responder guidance",
    dosTitle: "WHAT TO DO (RECOMMENDED STEPS):",
    dontsTitle: "WHAT AVOID / WHAT NOT TO DO:",
    officialBadge: "OFFICIAL NDMA APPROVED PROTOCOL",
    aiBadge: "AI ASSISTED PROTOCOL",
    safeExitBtn: "FIND SAFE EXIT FOR THIS EMERGENCY",
    medicalTab: "Medical",
    fireTab: "Fire & Rescue",
    policeTab: "Police & Safety",
    roadTab: "Road Accidents",
    disasterTab: "Disasters",
    generalTab: "General"
  },
  te: {
    title: "అత్యవసర మార్గదర్శకాలు & భద్రత",
    subtitle: "ధృవీకరించబడిన అత్యవసర రక్షణ ప్రోటోకాల్‌లు మరియు మొదటి సహాయ మార్గదర్శి",
    dosTitle: "చేయవలసినవి (రక్షణ చర్యలు):",
    dontsTitle: "చేయకూడనివి (నివారించవలసినవి):",
    officialBadge: "అధికారిక జాతీయ విపత్తు నిర్వహణ ప్రోటోకాల్",
    aiBadge: "AI సలహా ప్రోటోకాల్",
    safeExitBtn: "సురక్షిత నిష్క్రమణ మార్గాన్ని కనుగొనండి",
    medicalTab: "వైద్యం",
    fireTab: "అగ్నిప్రమాదం",
    policeTab: "పోలీస్",
    roadTab: "రోడ్డు ప్రమాదం",
    disasterTab: "విపత్తులు",
    generalTab: "సాధారణం"
  },
  hi: {
    title: "आपातकालीन निर्देश व सुरक्षा",
    subtitle: "सत्यापित चरण-दर-चरण आपातकालीन सुरक्षा निर्देश",
    dosTitle: "क्या करें (अनुशंसित चरण):",
    dontsTitle: "क्या न करें (बचें):",
    officialBadge: "आधिकारिक आपदा प्रबंधन निर्देश",
    aiBadge: "एआई सलाह निर्देश",
    safeExitBtn: "सुरक्षित निकास मार्ग खोजें",
    medicalTab: "चिकित्सा",
    fireTab: "अग्निशमन",
    policeTab: "पुलिस",
    roadTab: "सड़क दुर्घटना",
    disasterTab: "आपदाएं",
    generalTab: "सामान्य"
  }
}

const GUIDANCE_TOPICS: GuidanceTopic[] = [
  {
    id: 'guide-med-1',
    category: 'medical',
    title: 'Medical Emergency: Severe Bleeding & Trauma',
    subtitle: 'Immediate actions for trauma victims before ambulance arrival',
    doSteps: [
      'Apply direct, steady pressure to the wound using a clean cloth or bandage.',
      'Keep the injured person calm, lying down, and covered with a warm blanket.',
      'Elevate the injured limb above heart level if no bone fractures are suspected.',
      'Call 108 Ambulance or tap SOS for medical dispatch.'
    ],
    dontSteps: [
      'DO NOT remove embedded objects (knives, glass) from deep wounds.',
      'DO NOT give the victim food or water if surgery might be required.',
      'DO NOT leave severe bleeding unattended.'
    ],
    attribution: 'OFFICIAL AUTHORITY',
    officialSource: 'National Disaster Management Authority (NDMA) & Indian Red Cross'
  },
  {
    id: 'guide-[#fire-1]',
    category: 'fire',
    title: 'Building Fire Evacuation Protocol',
    subtitle: 'Structural fire safety and smoke inhalation avoidance',
    doSteps: [
      'Crawl low under smoke — clean breathing air is closest to the floor.',
      'Feel door handles with the back of your hand before opening; if hot, do not open.',
      'Evacuate immediately via stairwells; use fire exit doors.',
      'Call 101 Fire Control once outside the building.'
    ],
    dontSteps: [
      'DO NOT use elevators during a fire evacuation.',
      'DO NOT re-enter a burning building for personal belongings.',
      'DO NOT open hot doors facing smoke plumes.'
    ],
    attribution: 'OFFICIAL AUTHORITY',
    officialSource: 'State Fire & Emergency Services Directorate'
  },
  {
    id: 'guide-disaster-1',
    category: 'disaster',
    title: 'Urban Waterlogging & Flood Evacuation',
    subtitle: 'Flash flood and storm surge safety instructions',
    doSteps: [
      'Move immediately to designated high-ground emergency shelters.',
      'Disconnect main electrical switches if floodwater enters home.',
      'Carry emergency survival pouch (drinking water, flashlight, essential medicines).'
    ],
    dontSteps: [
      'DO NOT walk or drive through moving floodwaters (15cm can knock a person down).',
      'DO NOT touch submerged electrical wires or transformer poles.',
      'DO NOT ignore official SDMA evacuation orders.'
    ],
    attribution: 'OFFICIAL AUTHORITY',
    officialSource: 'State Disaster Management Authority (SDMA)'
  }
]

export default function GuidancePage() {
  const { profile } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = guidanceTranslations[lang as 'en' | 'te' | 'hi'] || guidanceTranslations.en

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredTopics = GUIDANCE_TOPICS.filter(
    topic => selectedCategory === 'all' || topic.category === selectedCategory
  )

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-sky-400 uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" />
          <span>VERIFIED SURVIVAL PROTOCOLS</span>
        </div>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex overflow-x-auto gap-1.5 border border-slate-900 rounded-2xl bg-[#060a13] p-1 font-mono text-[10px] no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Protocols
        </button>

        <button
          onClick={() => setSelectedCategory('medical')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'medical' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏥 {t.medicalTab}
        </button>

        <button
          onClick={() => setSelectedCategory('fire')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'fire' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔥 {t.fireTab}
        </button>

        <button
          onClick={() => setSelectedCategory('disaster')}
          className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'disaster' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🌊 {t.disasterTab}
        </button>
      </div>

      {/* Guidance Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <div key={topic.id} className="rounded-2xl border border-slate-900 bg-[#060a13] p-4.5 space-y-3 shadow-lg">

            {/* Header Attribution */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {t.officialBadge}
              </span>
              <span className="text-[9.5px] font-mono text-slate-500">{topic.officialSource}</span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-sm font-black text-white">{topic.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{topic.subtitle}</p>
            </div>

            {/* DO Checklist */}
            <div className="space-y-1.5 font-mono text-xs pt-1">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t.dosTitle}</h4>
              <ul className="space-y-1">
                {topic.doSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DONT Checklist */}
            <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-slate-900">
              <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{t.dontsTitle}</h4>
              <ul className="space-y-1">
                {topic.dontSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FIND SAFE EXIT Action Button */}
            <div className="pt-2">
              <Link
                href="/citizen/safe-exit"
                className="w-full py-2.5 rounded-xl border border-emerald-800 bg-emerald-950/40 hover:bg-emerald-950 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.safeExitBtn}</span>
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
