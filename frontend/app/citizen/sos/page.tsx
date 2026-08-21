'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  LifeBuoy,
  Flame,
  Shield,
  AlertTriangle,
  WifiOff,
  Navigation
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import { 
  EmergencyCategory, 
  CitizenIncident, 
  LocationInfo, 
  GpsLocationState,
  AppLanguage,
  EmergencyContact 
} from '../../../types/citizen'

const sosTranslations = {
  en: {
    heroTitle: "SOS EMERGENCY ACTIVATION",
    heroSub: "Tap or hold to request high-priority emergency response",
    categoryLabel: "Select Emergency Type:",
    medical: "Medical Emergency",
    fire: "Fire & Rescue",
    police: "Police / Public Safety",
    general: "General Emergency",
    btnActivate: "ACTIVATE SOS NOW",
    btnActivating: "RECORDING SOS...",
    locationTitle: "Location Details:",
    manualLocationPlaceholder: "Enter landmark or street address...",
    gpsAvailable: "GPS High-Accuracy Linked",
    gpsDenied: "GPS Permission Denied — Using Landmark",
    gpsUnavailable: "GPS Signal Unavailable — Enter Address",
    contactsHeader: "Emergency Contacts Notification Request:",
    contactsSimulatedBadge: "SIMULATED REQUEST",
    statusRequested: "Notification Requested",
    submitConfirmation: "EMERGENCY REQUEST RECEIVED",
    incidentId: "Incident ID:",
    offlineNotice: "SOS SAVED LOCALLY — WAITING FOR SECURE CONNECTION",
    honestReceipt: "Request Submitted — Waiting for Department Assignment Confirmation",
    safetyHeader: "Immediate Safety Instructions:",
    safetyStep1: "1. Stay in a safe, visible location if possible.",
    safetyStep2: "2. Keep your phone line clear for incoming emergency calls.",
    safetyStep3: "3. If safe to do so, signal to responders upon arrival.",
    trackIncidentBtn: "Track Response Status",
    backHomeBtn: "Return to Home Dashboard"
  },
  te: {
    heroTitle: "SOS అత్యవసర సక్రియం",
    heroSub: "అధిక ప్రాధాన్యత అత్యవసర ప్రతిస్పందన కోసం ట్యాప్ చేయండి",
    categoryLabel: "అత్యవసర రకాన్ని ఎంచుకోండి:",
    medical: "వైద్య అత్యవసరం",
    fire: "అగ్నిప్రమాదం & రక్షణ",
    police: "పోలీస్ / ప్రజా రక్షణ",
    general: "సాధారణ అత్యవసరం",
    btnActivate: "ఇప్పుడే SOS యాక్టివేట్ చేయండి",
    btnActivating: "SOS రికార్డ్ అవుతోంది...",
    locationTitle: "లొకేషన్ వివరాలు:",
    manualLocationPlaceholder: "ల్యాండ్‌మార్క్ లేదా చిరునామా నమోదు చేయండి...",
    gpsAvailable: "GPS లింక్ చేయబడింది",
    gpsDenied: "GPS అనుమతి నిరసించబడింది — మాన్యువల్ చిరునామా",
    gpsUnavailable: "GPS అందుబాటులో లేదు",
    contactsHeader: "అత్యవసర కాంటాక్ట్‌ల నోటిఫికేషన్ అభ్యర్థన:",
    contactsSimulatedBadge: "సిమ్యులేటెడ్ అభ్యర్థన",
    statusRequested: "నోటిఫికేషన్ అభ్యర్థించబడింది",
    submitConfirmation: "అత్యవసర అభ్యర్థన స్వీకరించబడింది",
    incidentId: "ఇన్సిడెంట్ ID:",
    offlineNotice: "SOS లోకల్‌గా సేవ్ చేయబడింది — కనెక్షన్ కోసం నిరీక్షణ",
    honestReceipt: "అభ్యర్థన సమర్పించబడింది — ధృవీకరణ కోసం వేచి ఉంది",
    safetyHeader: "తక్షణ భద్రతా సూచనలు:",
    safetyStep1: "1. సాధ్యమైతే సురక్షితమైన ప్రదేశంలో ఉండండి.",
    safetyStep2: "2. అత్యవసర కాల్‌ల కోసం మీ ఫోన్ లైన్ ఉచితంగా ఉంచండి.",
    safetyStep3: "3. ప్రతిస్పందనదారులు వచ్చినప్పుడు సంకేతం ఇవ్వండి.",
    trackIncidentBtn: "రెస్పాన్స్ స్టేటస్ ట్రాక్ చేయండి",
    backHomeBtn: "హోమ్‌కు తిరిగి వెళ్లండి"
  },
  hi: {
    heroTitle: "एसओएस आपातकालीन सक्रियकरण",
    heroSub: "उच्च प्राथमिकता सहायता के लिए टैप करें",
    categoryLabel: "आपातकाल का प्रकार चुनें:",
    medical: "चिकित्सा आपातकाल",
    fire: "अग्निशमन व बचाव",
    police: "पुलिस व सुरक्षा",
    general: "सामान्य आपातकाल",
    btnActivate: "अभी एसओएस सक्रिय करें",
    btnActivating: "एसओएस दर्ज हो रहा है...",
    locationTitle: "स्थान का विवरण:",
    manualLocationPlaceholder: "लैंडमार्क या पता दर्ज करें...",
    gpsAvailable: "जीपीएस लिंक हुआ",
    gpsDenied: "जीपीएस अनुमति अस्वीकृत — मैन्युअल पता",
    gpsUnavailable: "जीपीएस सिग्नल अनुपलब्ध",
    contactsHeader: "आपातकालीन संपर्क सूचना अनुरोध:",
    contactsSimulatedBadge: "सिम्युलेटेड अनुरोध",
    statusRequested: "सूचना का अनुरोध किया गया",
    submitConfirmation: "आपातकालीन अनुरोध प्राप्त हुआ",
    incidentId: "घटना आईडी:",
    offlineNotice: "एसओएस स्थानीय रूप से सहेजा गया — सुरक्षित कनेक्शन की प्रतीक्षा",
    honestReceipt: "अनुरोध सबमिट हुआ — पुष्टि की प्रतीक्षा में",
    safetyHeader: "तत्काल सुरक्षा निर्देश:",
    safetyStep1: "1. यदि संभव हो तो सुरक्षित स्थान पर रहें।",
    safetyStep2: "2. आने वाली आपातकालीन कॉल के लिए फोन लाइन खाली रखें।",
    safetyStep3: "3. टीम आगमन पर संकेत दें।",
    trackIncidentBtn: "स्थिति ट्रैक करें",
    backHomeBtn: "होम पर लौटें"
  }
}

export default function SosEmergencyPage() {
  const { profile, activeLocation, networkState, setLocation, addIncident, setEmergencyMode } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = sosTranslations[lang as 'en' | 'te' | 'hi'] || sosTranslations.en

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('medical')
  const [manualAddress, setManualAddress] = useState(activeLocation.address || '')
  const [gpsStatus, setGpsStatus] = useState<GpsLocationState>(activeLocation.gpsState || 'GPS AVAILABLE')
  const [isActivating, setIsActivating] = useState(false)
  const [activatedIncident, setActivatedIncident] = useState<CitizenIncident | null>(null)

  // Handlers for GPS detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS UNAVAILABLE')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const updatedLoc: LocationInfo = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: manualAddress || `GPS (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E), Visakhapatnam`,
          district: 'Visakhapatnam',
          stateName: 'Andhra Pradesh',
          gpsState: 'GPS AVAILABLE'
        }
        setLocation(updatedLoc)
        setGpsStatus('GPS AVAILABLE')
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('PERMISSION DENIED')
        } else {
          setGpsStatus('GPS UNAVAILABLE')
        }
      }
    )
  }

  // Trigger SOS Activation
  const handleTriggerSos = async () => {
    setIsActivating(true)
    
    // Generate incident ID
    const incId = `INC-SOS-${Math.floor(1000 + Math.random() * 9000)}`
    const nowIso = new Date().toISOString()
    const isOffline = networkState === 'OFFLINE'

    const sosIncident: CitizenIncident = {
      id: incId,
      category: selectedCategory,
      severity: 'critical',
      title: `HIGH-PRIORITY SOS — ${selectedCategory.toUpperCase()}`,
      description: `Automated 1-Tap SOS Emergency activation triggered by citizen from ${manualAddress || activeLocation.address}. Emergency contacts requested.`,
      location: {
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        address: manualAddress || activeLocation.address,
        district: activeLocation.district || 'Visakhapatnam',
        stateName: activeLocation.stateName || 'Andhra Pradesh',
        gpsState: gpsStatus,
        isManual: gpsStatus !== 'GPS AVAILABLE'
      },
      affectedCount: 1,
      mediaUrls: {},
      stage: 'received',
      dataFreshness: isOffline ? 'offline' : 'live',
      dataSource: isOffline ? 'CACHED' : 'LIVE',
      syncState: isOffline ? 'PENDING' : 'SYNCED',
      isOfflineSaved: isOffline,
      timeline: [
        { stage: 'received', title: 'SOS Request Received', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: isOffline ? 'Saved locally in IndexedDB queue' : 'Received by BHARATOS Core Gateway' }
      ],
      safetyInstructions: [
        t.safetyStep1,
        t.safetyStep2,
        t.safetyStep3
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    }

    // Save to store and IndexedDB
    addIncident(sosIncident)
    await IndexedDbService.saveIncident(sosIncident)
    
    // Enable Emergency Focus Mode
    setEmergencyMode(true)

    // Set confirmation UI state
    setTimeout(() => {
      setIsActivating(false)
      setActivatedIncident(sosIncident)
    }, 600)
  }

  return (
    <div className="space-y-5 pb-8">

      {!activatedIncident ? (
        <>
          {/* Hero Header */}
          <div className="text-center space-y-1">
            <span className="text-[9.5px] font-mono font-black text-red-500 uppercase tracking-widest px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 inline-block animate-pulse">
              ● 1-TAP HIGH-PRIORITY SOS
            </span>
            <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.heroTitle}</h1>
            <p className="text-xs text-slate-400">{t.heroSub}</p>
          </div>

          {/* Emergency Category Selector Grid */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              {t.categoryLabel}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('medical')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'medical'
                    ? 'border-red-500 bg-red-950/80 text-white shadow-lg shadow-red-950/50'
                    : 'border-slate-900 bg-[#060a13] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <LifeBuoy className={`w-5 h-5 ${selectedCategory === 'medical' ? 'text-red-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">{t.medical}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('fire')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'fire'
                    ? 'border-orange-500 bg-orange-950/80 text-white shadow-lg shadow-orange-950/50'
                    : 'border-slate-900 bg-[#060a13] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Flame className={`w-5 h-5 ${selectedCategory === 'fire' ? 'text-orange-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">{t.fire}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('police')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'police'
                    ? 'border-blue-500 bg-blue-950/80 text-white shadow-lg shadow-blue-950/50'
                    : 'border-slate-900 bg-[#060a13] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Shield className={`w-5 h-5 ${selectedCategory === 'police' ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">{t.police}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('general')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'general'
                    ? 'border-purple-500 bg-purple-950/80 text-white shadow-lg shadow-purple-950/50'
                    : 'border-slate-900 bg-[#060a13] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${selectedCategory === 'general' ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">{t.general}</span>
              </button>
            </div>
          </div>

          {/* Primary SOS Dispatch Button */}
          <div className="py-2 text-center space-y-3">
            <button
              onClick={handleTriggerSos}
              disabled={isActivating}
              aria-label="Trigger High-Priority SOS Emergency"
              className="w-full h-28 rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-mono font-black text-lg tracking-widest uppercase shadow-[0_0_40px_rgba(239,68,68,0.5)] border-2 border-red-300 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-200"
            >
              <ShieldAlert className="w-8 h-8 animate-bounce" />
              <span>{isActivating ? t.btnActivating : t.btnActivate}</span>
            </button>
          </div>

          {/* Location & GPS State Capture Card */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                {t.locationTitle}
              </label>
              <button 
                type="button" 
                onClick={handleDetectGps}
                className="text-[10px] font-mono font-bold text-sky-400 hover:underline flex items-center space-x-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Re-detect GPS</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder={t.manualLocationPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-red-500/60"
              />

              <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className={gpsStatus === 'GPS AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'}>
                  {gpsStatus === 'GPS AVAILABLE' ? t.gpsAvailable : gpsStatus === 'PERMISSION DENIED' ? t.gpsDenied : t.gpsUnavailable}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Notification Request List */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {t.contactsHeader}
              </span>
              <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300">
                {t.contactsSimulatedBadge}
              </span>
            </div>

            <div className="space-y-2">
              {profile.emergencyContacts.map((contact: EmergencyContact) => (
                <div key={contact.id} className="flex items-center justify-between text-xs font-mono p-2 rounded-xl bg-slate-950 border border-slate-900">
                  <div>
                    <span className="font-bold text-white block">{contact.name} ({contact.relationship})</span>
                    <span className="text-[10px] text-slate-400">{contact.phone}</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40">
                    {t.statusRequested}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Confirmation Overlay After SOS Activation */
        <div className="space-y-5 py-3">
          
          <div className={`rounded-3xl p-6 text-center space-y-4 border ${
            activatedIncident.isOfflineSaved 
              ? 'border-amber-800/80 bg-amber-950/20' 
              : 'border-emerald-800/80 bg-emerald-950/20'
          }`}>
            <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center border-2 ${
              activatedIncident.isOfflineSaved ? 'border-amber-400 text-amber-400 bg-amber-950/80' : 'border-emerald-400 text-emerald-400 bg-emerald-950/80'
            }`}>
              {activatedIncident.isOfflineSaved ? <WifiOff className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8 animate-bounce" />}
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 uppercase tracking-widest">
                {activatedIncident.isOfflineSaved ? 'SAVED LOCALLY' : 'RECEIPT CONFIRMED'}
              </span>
              <h2 className="text-lg font-black text-white font-mono uppercase tracking-wide pt-1">
                {t.submitConfirmation}
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                {t.incidentId} <span className="text-sky-400 font-bold">{activatedIncident.id}</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-850 text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>Category: <strong className="text-white uppercase">{activatedIncident.category}</strong></span>
                <span>Priority: <strong className="text-red-400 uppercase">{activatedIncident.severity}</strong></span>
              </div>
              <p className="text-slate-300 text-[11px] font-medium leading-relaxed truncate">
                📍 {activatedIncident.location.address}
              </p>
              <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-300/90 font-bold">
                ● {activatedIncident.isOfflineSaved ? t.offlineNotice : t.honestReceipt}
              </div>
            </div>
          </div>

          {/* Immediate Safety Instructions */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{t.safetyHeader}</h3>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="p-2 rounded-xl bg-slate-950 border border-slate-900">{t.safetyStep1}</li>
              <li className="p-2 rounded-xl bg-slate-950 border border-slate-900">{t.safetyStep2}</li>
              <li className="p-2 rounded-xl bg-slate-950 border border-slate-900">{t.safetyStep3}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2 font-mono text-xs">
            <Link
              href={`/citizen/incidents/${activatedIncident.id}`}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <span>{t.trackIncidentBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/citizen"
              className="w-full py-3.5 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-bold tracking-wider uppercase text-center block transition-all"
            >
              {t.backHomeBtn}
            </Link>
          </div>

        </div>
      )}

    </div>
  )
}
