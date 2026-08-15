'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './layout'
import { MapPin, Navigation, ShieldAlert, AlertTriangle, ChevronRight, Info } from 'lucide-react'

const homeTranslations = {
  en: {
    safetyHeading: "Flood Safety & Early Warning",
    riskQuestion: "Is my area currently at risk?",
    useLocation: "Use My Location",
    manualLocation: "Or select manually:",
    riskLabel: "Your Area Risk:",
    riskWarning: "WARNING",
    riskNormal: "NORMAL",
    riskDetailWarning: "Heavy rainfall and rising water levels detected.",
    riskDetailNormal: "No flood risks detected in your area.",
    coveragePending: "Coverage coming soon for selected location.",
    pilotBadge: "LIVE PILOT",
    demoBadge: "DEMO SCENARIO",
    noAppHeading: "Location Alerts",
    noAppText: "BHARATOS is designed to integrate with government and public emergency communication channels. Emergency alerts do not require you to keep this page open.",
    integrationBadge: "INTEGRATION PENDING",
    quickReport: "Report Flooding",
    quickHelp: "Request Assistance",
    activeAlerts: "Active Warnings"
  },
  te: {
    safetyHeading: "వరద భద్రత & ముందస్తు హెచ్చరిక",
    riskQuestion: "నా ప్రాంతం ప్రస్తుతం ప్రమాదంలో ఉందా?",
    useLocation: "నా ప్రస్తుత లొకేషన్ ఉపయోగించు",
    manualLocation: "లేదా మాన్యువల్‌గా ఎంచుకోండి:",
    riskLabel: "మీ ప్రాంతం రిస్క్ లెవెల్:",
    riskWarning: "హెచ్చరిక",
    riskNormal: "సాధారణం",
    riskDetailWarning: "భారీ వర్షపాతం మరియు పెరుగుతున్న నీటి మట్టాలు కనుగొనబడ్డాయి.",
    riskDetailNormal: "మీ ప్రాంతంలో వరద ముప్పు ఏదీ కనుగొనబడలేదు.",
    coveragePending: "ఎంచుకున్న ప్రాంతానికి కవరేజీ త్వరలో అందుబాటులోకి వస్తుంది.",
    pilotBadge: "లైవ్ పైలట్",
    demoBadge: "డెమో దృశ్యం",
    noAppHeading: "లొకేషన్ హెచ్చరికలు",
    noAppText: "భారత్ఓఎస్ ప్రభుత్వ మరియు ప్రజా అత్యవసర సమాచార వ్యవస్థలతో అనుసంధానం చేయడానికి రూపొందించబడింది. అత్యవసర హెచ్చరికల కోసం మీరు ఈ యాప్‌ను తెరిచి ఉంచాల్సిన అవసరం లేదు.",
    integrationBadge: "అనుసంధానం పెండింగ్‌లో ఉంది",
    quickReport: "వరదను రిపోర్ట్ చేయండి",
    quickHelp: "సహాయాన్ని అభ్యర్థించండి",
    activeAlerts: "క్రియాశీల హెచ్చరికలు"
  },
  hi: {
    safetyHeading: "बाढ़ सुरक्षा एवं पूर्व चेतावनी",
    riskQuestion: "क्या मेरा क्षेत्र वर्तमान में खतरे में है?",
    useLocation: "मेरी वर्तमान स्थिति का उपयोग करें",
    manualLocation: "या मैन्युअल रूप से चुनें:",
    riskLabel: "आपके क्षेत्र का जोखिम:",
    riskWarning: "चेतावनी",
    riskNormal: "सामान्य",
    riskDetailWarning: "भारी वर्षा और बढ़ता जल स्तर पाया गया है।",
    riskDetailNormal: "आपके क्षेत्र में कोई बाढ़ का खतरा नहीं पाया गया है।",
    coveragePending: "चयनित स्थान के लिए कवरेज जल्द ही आ रहा है।",
    pilotBadge: "लाइव पायलट",
    demoBadge: "डेमो परिदृश्य",
    noAppHeading: "स्थान अलर्ट",
    noAppText: "भारतओएस सरकारी और सार्वजनिक आपातकालीन संचार चैनलों के साथ एकीकृत करने के लिए डिज़ाइन किया गया है। आपातकालीन अलर्ट के लिए आपको इस ऐप को खुला रखने की आवश्यकता नहीं है।",
    integrationBadge: "एकीकरण लंबित है",
    quickReport: "बाढ़ की रिपोर्ट करें",
    quickHelp: "सहायता का अनुरोध करें",
    activeAlerts: "सक्रिय चेतावनियाँ"
  }
}

export default function CitizenHome() {
  const { lang } = useLanguage()
  const [selectedArea, setSelectedArea] = useState<string>('vizag')
  const [locationLoading, setLocationLoading] = useState(false)
  const [gpsName, setGpsName] = useState<string | null>(null)

  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // MVP Colony Vizag coords: 17.7289, 83.3214
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        
        // Check proximity to Vizag
        const isNearVizag = Math.abs(lat - 17.7289) < 0.2 && Math.abs(lng - 83.3214) < 0.2
        if (isNearVizag) {
          setSelectedArea('vizag')
          setGpsName(`Visakhapatnam (GPS Coords: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`)
        } else {
          setSelectedArea('other')
          setGpsName(`Custom Location (GPS Coords: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`)
        }
        setLocationLoading(false)
      },
      () => {
        setLocationLoading(false)
      }
    )
  }

  const t = homeTranslations[lang]

  return (
    <div className="space-y-5">
      
      {/* Upper Logo Context */}
      <div className="text-center py-2 shrink-0">
        <h1 className="text-lg font-black tracking-[0.2em] text-white font-mono uppercase">BHARATOS</h1>
        <p className="text-xs text-sky-400 font-bold uppercase tracking-wider mt-0.5">{t.safetyHeading}</p>
      </div>

      {/* Geolocation Section */}
      <div className="glass-panel rounded-2xl p-4 space-y-3.5 border border-slate-900 shadow-xl">
        <h3 className="text-sm font-extrabold text-white leading-none">{t.riskQuestion}</h3>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleUseLocation}
            disabled={locationLoading}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg active:scale-98"
          >
            <Navigation className="h-4 w-4 shrink-0" />
            <span>{locationLoading ? 'Locating...' : t.useLocation}</span>
          </button>
          
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider mb-1">{t.manualLocation}</span>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value)
                setGpsName(null)
              }}
              className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="vizag">Visakhapatnam (MVP Colony)</option>
              <option value="hyderabad">Hyderabad (Charminar)</option>
              <option value="vijayawada">Vijayawada (Kanakadurga)</option>
            </select>
          </div>
        </div>

        {gpsName && (
          <div className="flex items-center space-x-1.5 text-[10px] font-mono-data text-sky-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{gpsName}</span>
          </div>
        )}
      </div>

      {/* Current Area Risk Screen */}
      <div className={`glass-panel border-l-4 rounded-2xl p-5 space-y-3 shadow-xl ${
        selectedArea === 'vizag' 
          ? 'border-l-orange-500 bg-orange-950/10' 
          : 'border-l-emerald-500 bg-emerald-950/10'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">{t.riskLabel}</span>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider ${
            selectedArea === 'vizag' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
          }`}>
            {selectedArea === 'vizag' ? t.riskWarning : t.riskNormal}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-white">{selectedArea === 'vizag' ? 'MVP Colony, Visakhapatnam' : selectedArea === 'hyderabad' ? 'Charminar, Hyderabad' : 'Vijayawada'}</h4>
          <p className="text-xs text-slate-350 mt-1 leading-relaxed">{selectedArea === 'vizag' ? t.riskDetailWarning : t.riskDetailNormal}</p>
        </div>

        {selectedArea !== 'vizag' && (
          <p className="text-[10px] text-slate-500 font-bold italic font-mono-data leading-relaxed">{t.coveragePending}</p>
        )}

        <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-[9px] font-mono font-bold">
          <span className="text-slate-500 uppercase">Data Status:</span>
          <span className={selectedArea === 'vizag' ? 'text-sky-400' : 'text-slate-500'}>
            {selectedArea === 'vizag' ? t.pilotBadge : t.demoBadge}
          </span>
        </div>
      </div>

      {/* Alert Card Banner (Prominent highlight) */}
      {selectedArea === 'vizag' && (
        <div className="glass-panel border border-red-900/60 bg-red-950/20 rounded-2xl p-4 flex items-start space-x-3.5 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest font-mono block">🔴 FLOOD WARNING ACTIVE</span>
            <p className="text-xs font-bold text-white leading-relaxed">Avoid low-lying roads near Beach Bypass and follow official instructions.</p>
            <div className="flex items-center space-x-3 pt-1">
              <Link href="/citizen/safety" className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase font-mono flex items-center">
                <span>Safety Guidelines</span>
                <ChevronRight className="h-3 w-3 shrink-0 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <Link
          href="/citizen/report"
          className="glass-panel hover:border-slate-800 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 border border-slate-900 hover:bg-slate-950/40 transition-all shadow-md group"
        >
          <AlertTriangle className="h-6 w-6 text-orange-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white tracking-wide">{t.quickReport}</span>
        </Link>
        <Link
          href="/citizen/report?action=help"
          className="glass-panel hover:border-slate-800 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 border border-slate-900 hover:bg-slate-950/40 transition-all shadow-md group"
        >
          <ShieldAlert className="h-6 w-6 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white tracking-wide">{t.quickHelp}</span>
        </Link>
      </div>

      {/* No App Notification */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-900 flex items-start space-x-3.5 bg-slate-950/30 text-xs">
        <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="font-extrabold text-white">{t.noAppHeading}</h4>
          <p className="text-slate-400 leading-relaxed">{t.noAppText}</p>
          <span className="inline-block text-[8px] font-mono font-bold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-sky-400 uppercase tracking-widest">
            {t.integrationBadge}
          </span>
        </div>
      </div>

    </div>
  )
}
