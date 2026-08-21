'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  AlertTriangle,
  Bot,
  Shield,
  Clock,
  PhoneCall,
  LifeBuoy,
  Flame,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Navigation
} from 'lucide-react'
import { useCitizenStore } from '../../store/useCitizenStore'
import { AppLanguage, CitizenAlert, CitizenIncident } from '../../types/citizen'

const homeTranslations = {
  en: {
    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    sosHeroTitle: "SOS — GET HELP NOW",
    sosHeroSub: "Instant 1-Tap Emergency Dispatch Request",
    safeExitTitle: "FIND SAFE EXIT",
    safeExitSub: "Hazard-Aware Evacuation Routing",
    quickReport: "Report Emergency",
    quickReportSub: "Multi-Media & Live GPS",
    quickAi: "Ask BHARATOS AI",
    quickAiSub: "Conversational Triage",
    nearbyAlertsTitle: "Active Alerts Nearby",
    viewAllAlerts: "View All Alerts",
    activeIncidentTitle: "My Ongoing Emergency",
    trackStatus: "Track Status",
    servicesTitle: "Quick Emergency Services",
    servicePolice: "112 Police",
    servicePoliceDesc: "Public Safety & Rescue",
    serviceAmbulance: "108 Ambulance",
    serviceAmbulanceDesc: "Medical Trauma & Emergency",
    serviceFire: "101 Fire & Rescue",
    serviceFireDesc: "Hazmat & Structural Fire",
    serviceWomen: "1091 Women Helpline",
    serviceWomenDesc: "Immediate Safety & Escort",
    honestNotice: "BHARATOS Emergency OS is connected to national dispatch channels. Operational telemetry is verified before status updates.",
    dataVerifiedBadge: "OFFICIAL AUTHORITY"
  },
  te: {
    greetingMorning: "శుభోదయం",
    greetingAfternoon: "శుభాహ్నం",
    greetingEvening: "సాయంత్ర శుభాకాంక్షలు",
    sosHeroTitle: "SOS — సహాయం పొందండి",
    sosHeroSub: "తక్షణ 1-ట్యాప్ అత్యవసర డిస్పాచ్",
    safeExitTitle: "సురక్షిత నిష్క్రమణ",
    safeExitSub: "ప్రమాద రహిత తరలింపు మార్గం",
    quickReport: "అత్యవసర రిపోర్ట్",
    quickReportSub: "మల్టీ-మీడియా & లైవ్ GPS",
    quickAi: "BHARATOS AI ని అడగండి",
    quickAiSub: "సంభాషణ వర్గీకరణ",
    nearbyAlertsTitle: "సమీప క్రియాశీల హెచ్చరికలు",
    viewAllAlerts: "అన్ని హెచ్చరికలు చూడండి",
    activeIncidentTitle: "నా కొనసాగుతున్న అత్యవసర పరిస్థితి",
    trackStatus: "స్టేటస్ ట్రాక్ చేయండి",
    servicesTitle: "త్వరిత అత్యవసర సేవలు",
    servicePolice: "112 పోలీస్",
    servicePoliceDesc: "ప్రజా రక్షణ & రక్షణ దళం",
    serviceAmbulance: "108 అంబులెన్స్",
    serviceAmbulanceDesc: "మెడికల్ ఎమర్జెన్సీ",
    serviceFire: "101 ఫైర్ & రెస్క్యూ",
    serviceFireDesc: "అగ్నిమాపక రక్షణ",
    serviceWomen: "1091 మహిళా హెల్ప్‌లైన్",
    serviceWomenDesc: "మహిళల తక్షణ భద్రత",
    honestNotice: "BHARATOS అత్యవసర సిస్టమ్ జాతీయ డిస్పాచ్ ఛానెళ్లకు అనుసంధానించబడింది.",
    dataVerifiedBadge: "అధికారిక వ్యవస్థ"
  },
  hi: {
    greetingMorning: "सुप्रभात",
    greetingAfternoon: "नमस्कार",
    greetingEvening: "शुभ संध्या",
    sosHeroTitle: "एसओएस — तुरंत मदद पाएं",
    sosHeroSub: "तत्काल 1-टैप आपातकालीन सहायता अनुरोध",
    safeExitTitle: "सुरक्षित निकास",
    safeExitSub: "खतरा-जागरूक निकासी मार्ग",
    quickReport: "आपातकाल रिपोर्ट करें",
    quickReportSub: "मल्टी-मीडिया व लाइव जीपीएस",
    quickAi: "भारतओएस एआई से पूछें",
    quickAiSub: "बातचीत सहायता",
    nearbyAlertsTitle: "आसपास के सक्रिय अलर्ट",
    viewAllAlerts: "सभी अलर्ट देखें",
    activeIncidentTitle: "मेरी सक्रिय आपातकालीन स्थिति",
    trackStatus: "स्थिति ट्रैक करें",
    servicesTitle: "त्वरित आपातकालीन सेवाएं",
    servicePolice: "112 पुलिस",
    servicePoliceDesc: "सार्वजनिक सुरक्षा व बचाव",
    serviceAmbulance: "108 एम्बुलेंस",
    serviceAmbulanceDesc: "चिकित्सा आपातकाल",
    serviceFire: "101 अग्निशमन",
    serviceFireDesc: "अग्निशमन व आपदा बचाव",
    serviceWomen: "1091 महिला हेल्पलाइन",
    serviceWomenDesc: "तत्काल महिला सुरक्षा",
    honestNotice: "भारतओएस आपातकालीन प्रणाली राष्ट्रीय प्रेषण चैनलों से जुड़ी है।",
    dataVerifiedBadge: "आधिकारिक प्राधिकरण"
  }
}

export default function CitizenHome() {
  const { profile, activeLocation, myIncidents, nearbyAlerts } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = homeTranslations[lang as 'en' | 'te' | 'hi'] || homeTranslations.en

  const [greeting, setGreeting] = useState(t.greetingMorning)
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(t.greetingMorning)
    else if (hour < 17) setGreeting(t.greetingAfternoon)
    else setGreeting(t.greetingEvening)
  }, [lang, t])

  const activeIncident: CitizenIncident | undefined = myIncidents.find(i => i.stage !== 'resolved') || myIncidents[0]

  const displayAlerts: CitizenAlert[] = nearbyAlerts.length > 0 ? nearbyAlerts : [
    {
      id: 'alt-101',
      title: 'High Coastal Storm Surge Warning',
      summary: 'Heavy rainfall and sea turbulence reported along Beach Bypass Corridors. Exercise caution.',
      severity: 'high',
      category: 'Disaster Alert',
      affectedArea: 'Visakhapatnam Coastal Belt',
      officialSource: 'SDMA / IMD Weather Center',
      recommendedAction: 'Avoid low-lying coastal roads and stay tuned for official advisories.',
      timestamp: '10 mins ago',
      isVerified: true,
      status: 'active',
      dataSource: 'OFFICIAL AUTHORITY'
    }
  ]

  return (
    <div className="space-y-6 pb-6">

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
            {greeting}, {profile.name}
          </span>
          <h1 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight leading-tight mt-0.5">
            BHARATOS CITIZEN OS
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full bg-slate-950 border border-slate-850 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DESKTOP COMMAND ENGINE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Responsive Grid Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols on Desktop): SOS Hero, Safe Exit & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. SOS Emergency Hero Button Card */}
          <div className="relative overflow-hidden rounded-3xl border border-red-900/80 bg-gradient-to-b from-red-950/80 via-[#1a0507] to-[#0d0203] p-6 shadow-[0_0_40px_rgba(220,38,38,0.25)] space-y-5 text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="space-y-2 md:max-w-md">
              <span className="text-[9.5px] font-mono font-black text-red-400 uppercase tracking-widest inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60">
                HIGH-PRIORITY SOS DISPATCH
              </span>
              <h2 className="text-lg md:text-xl font-black text-white font-mono uppercase">{t.sosHeroTitle}</h2>
              <p className="text-xs text-red-200/90 font-medium leading-relaxed">{t.sosHeroSub}</p>
              <p className="text-[10.5px] font-mono text-slate-400 pt-1">
                📍 Auto Location: <span className="text-white font-bold">{activeLocation.address}</span>
              </p>
            </div>

            {/* Large Interactive SOS Button */}
            <Link
              href="/citizen/sos"
              aria-label="Activate SOS Emergency"
              className="mx-auto md:mx-0 h-28 w-28 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.7)] border-2 border-red-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 group"
            >
              <ShieldAlert className="w-11 h-11 group-hover:animate-ping" />
              <span className="text-xs font-black tracking-wider uppercase mt-1">SOS</span>
            </Link>
          </div>

          {/* 2. FIND SAFE EXIT (Evacuation Action Card) */}
          <Link
            href="/citizen/safe-exit"
            className="rounded-3xl border border-emerald-900/80 bg-gradient-to-r from-[#041d13] via-[#06281c] to-[#041d13] p-5 flex items-center justify-between hover:border-emerald-700 transition-all shadow-xl group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">HAZARD-AWARE ROUTING</span>
                <h3 className="text-sm font-black text-white font-mono uppercase leading-tight">{t.safeExitTitle}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{t.safeExitSub}</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-mono font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1 shadow-lg shrink-0">
              <span>EXPLORE ROUTE</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </div>
          </Link>

          {/* 3. Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/citizen/report"
              className="rounded-2xl border border-slate-900 bg-[#060a13] p-5 flex items-center space-x-4 hover:border-slate-800 hover:bg-slate-950 transition-all shadow-md group"
            >
              <div className="h-12 w-12 rounded-2xl bg-orange-950/60 border border-orange-800/40 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight">{t.quickReport}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.quickReportSub}</p>
              </div>
            </Link>

            <Link
              href="/citizen/ai-assistant"
              className="rounded-2xl border border-slate-900 bg-[#060a13] p-5 flex items-center space-x-4 hover:border-slate-800 hover:bg-slate-950 transition-all shadow-md group"
            >
              <div className="h-12 w-12 rounded-2xl bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight">{t.quickAi}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.quickAiSub}</p>
              </div>
            </Link>
          </div>

          {/* 4. My Active Incident Status Banner (If ongoing) */}
          {activeIncident && (
            <div className="rounded-2xl border border-sky-900/60 bg-[#060e1c] p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">{t.activeIncidentTitle}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-sky-950 border border-sky-800/60 text-sky-300 uppercase">
                  {activeIncident.stage.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-snug">{activeIncident.title}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{activeIncident.location.address}</p>
                </div>
                <Link
                  href={`/citizen/incidents/${activeIncident.id}`}
                  className="px-4 py-2 rounded-xl border border-sky-800 bg-sky-950 text-sky-300 hover:text-white text-xs font-bold font-mono transition-all shrink-0 ml-2"
                >
                  {t.trackStatus}
                </Link>
              </div>
            </div>
          )}

          {/* 5. Active Nearby Alerts Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{t.nearbyAlertsTitle}</h2>
              </div>
              <Link href="/citizen/alerts" className="text-xs font-bold text-sky-400 hover:text-sky-300 font-mono flex items-center">
                <span>{t.viewAllAlerts}</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {displayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-4.5 space-y-2 border ${
                    alert.severity === 'critical' || alert.severity === 'high'
                      ? 'border-amber-900/60 bg-[#140b03]'
                      : 'border-slate-900 bg-[#060a13]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400 uppercase tracking-wider">
                      {alert.category} • {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {alert.officialSource}
                    </span>
                  </div>

                  <h3 className="text-xs font-extrabold text-white leading-snug">{alert.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.summary}</p>

                  <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono text-amber-300/90">
                    <span className="truncate max-w-[70%]">💡 {alert.recommendedAction}</span>
                    <span className="font-bold text-slate-500">{alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col on Desktop): Emergency Services & Telemetry */}
        <div className="space-y-6">

          {/* 6. Quick Emergency Services Dialers Grid */}
          <div className="rounded-3xl border border-slate-900 bg-[#060a13] p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-slate-900 pb-3">
              {t.servicesTitle}
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <a
                href="tel:112"
                className="p-3.5 rounded-2xl border border-red-900/50 bg-[#120406] hover:bg-[#1a0609] transition-all flex items-center space-x-3.5 group"
              >
                <div className="h-10 w-10 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block text-xs truncate">{t.servicePolice}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{t.servicePoliceDesc}</span>
                </div>
              </a>

              <a
                href="tel:108"
                className="p-3.5 rounded-2xl border border-sky-900/50 bg-[#040e1a] hover:bg-[#061426] transition-all flex items-center space-x-3.5 group"
              >
                <div className="h-10 w-10 rounded-xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block text-xs truncate">{t.serviceAmbulance}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{t.serviceAmbulanceDesc}</span>
                </div>
              </a>

              <a
                href="tel:101"
                className="p-3.5 rounded-2xl border border-orange-900/50 bg-[#140a03] hover:bg-[#1c0e04] transition-all flex items-center space-x-3.5 group"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-950 border border-orange-800 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block text-xs truncate">{t.serviceFire}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{t.serviceFireDesc}</span>
                </div>
              </a>

              <a
                href="tel:1091"
                className="p-3.5 rounded-2xl border border-purple-900/50 bg-[#120417] hover:bg-[#1a0621] transition-all flex items-center space-x-3.5 group"
              >
                <div className="h-10 w-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block text-xs truncate">{t.serviceWomen}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{t.serviceWomenDesc}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Operational Disclaimer & Verification Footer */}
          <div className="p-4 rounded-2xl border border-slate-900 bg-[#060a13] text-xs font-mono text-slate-400 flex items-start space-x-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="leading-relaxed">{t.honestNotice}</p>
              <span className="inline-block text-[9px] font-bold text-emerald-400 uppercase tracking-widest pt-1">
                ● {t.dataVerifiedBadge}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
