'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  MapPin,
  CheckCircle2,
  LifeBuoy,
  Flame,
  Shield,
  Car,
  CloudRain,
  Radio,
  Mic,
  Camera,
  Video,
  Users,
  Navigation,
  ChevronRight,
  WifiOff,
  Info
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import {
  EmergencyCategory,
  EmergencySeverity,
  CitizenIncident,
  LocationInfo,
  GpsLocationState,
  AppLanguage
} from '../../../types/citizen'

const reportTranslations = {
  en: {
    title: "REPORT AN EMERGENCY",
    subtitle: "File a multi-media emergency report with real-time GPS coordinates",
    categoryLabel: "1. Select Emergency Category",
    medical: "Medical",
    fire: "Fire & Rescue",
    police: "Police / Safety",
    roadAccident: "Road Accident",
    disaster: "Natural Disaster",
    general: "General Emergency",
    locationLabel: "2. Emergency Location Details",
    manualLocationPlaceholder: "Enter landmark or street address...",
    gpsDetecting: "Detecting GPS Coords...",
    detailsLabel: "3. Incident Details & Observations",
    titlePlaceholder: "Brief summary (e.g. 2 vehicles collided near Beach Road)",
    descPlaceholder: "Describe what happened, hazards present, or stranded citizens...",
    affectedLabel: "4. Number of People Affected",
    mediaLabel: "5. Attach Multi-Media Evidence (Optional)",
    voiceRecordBtn: "Record Voice Note",
    imageAttachBtn: "Upload Image",
    videoAttachBtn: "Upload Video",
    sharedInfoNotice: "Information Shared: Your exact GPS coordinates, incident summary, affected count, and contact phone number will be transmitted.",
    submitBtn: "SUBMIT EMERGENCY REPORT",
    submittingBtn: "Submitting Emergency Report...",
    successTitle: "EMERGENCY REPORT RECEIVED",
    ticketLabel: "Incident ID:",
    offlineNotice: "SAVED LOCALLY IN INDEXEDDB — WILL SYNC WHEN ONLINE",
    honestReceipt: "Request Submitted — Waiting for Department Assignment Confirmation",
    trackBtn: "Track Incident Response",
    homeBtn: "Return to Home Dashboard"
  },
  te: {
    title: "అత్యవసర పరిస్థితిని నివేదించండి",
    subtitle: "GPS వివరాలతో మల్టీ-మీడియా అత్యవసర నివేదికను పంపండి",
    categoryLabel: "1. అత్యవసర వర్గాన్ని ఎంచుకోండి",
    medical: "వైద్యం",
    fire: "అగ్నిప్రమాదం",
    police: "పోలీస్",
    roadAccident: "రోడ్డు ప్రమాదం",
    disaster: "ప్రకృతి విపత్తు",
    general: "సాధారణం",
    locationLabel: "2. అత్యవసర లొకేషన్ వివరాలు",
    manualLocationPlaceholder: "ల్యాండ్‌మార్క్ లేదా చిరునామా నమోదు చేయండి...",
    gpsDetecting: "GPS గుర్తిస్తోంది...",
    detailsLabel: "3. ఇన్సిడెంట్ వివరాలు",
    titlePlaceholder: "సంక్షిప్త సారాంశం (ఉదా. బీచ్ రోడ్ వద్ద ప్రమాదం)",
    descPlaceholder: "ఏమి జరిగిందో వివరించండి...",
    affectedLabel: "4. ప్రభావితమైన ప్రజల సంఖ్య",
    mediaLabel: "5. మీడియా ఆధారాలు జోడించండి (ఐచ్ఛికం)",
    voiceRecordBtn: "వాయిస్ రికార్డ్ చేయండి",
    imageAttachBtn: "ఫోటో అప్‌లోడ్",
    videoAttachBtn: "వీడియో అప్‌లోడ్",
    sharedInfoNotice: "పంచుకున్న సమాచారం: మీ GPS చిరునామా, వివరణ మరియు ఫోన్ నంబర్ పంపబడతాయి.",
    submitBtn: "అత్యవసర రిపోర్ట్ పంపండి",
    submittingBtn: "సమర్పిస్తోంది...",
    successTitle: "అత్యవసర నివేదిక స్వీకరించబడింది",
    ticketLabel: "ఇన్సిడెంట్ ID:",
    offlineNotice: "లోకల్‌గా సేవ్ చేయబడింది — కనెక్షన్ కోసం నిరీక్షణ",
    honestReceipt: "అభ్యర్థన సమర్పించబడింది — ధృవీకరణ కోసం వేచి ఉంది",
    trackBtn: "స్టేటస్ ట్రాక్ చేయండి",
    homeBtn: "హోమ్‌కు తిరిగి వెళ్ళండి"
  },
  hi: {
    title: "आपातकाल की रिपोर्ट करें",
    subtitle: "वास्तविक समय जीपीएस के साथ मल्टी-मीडिया आपातकालीन रिपोर्ट दर्ज करें",
    categoryLabel: "1. आपातकालीन श्रेणी चुनें",
    medical: "चिकित्सा",
    fire: "अग्निशमन",
    police: "पुलिस / सुरक्षा",
    roadAccident: "सड़क दुर्घटना",
    disaster: "प्राकृतिक आपदा",
    general: "सामान्य",
    locationLabel: "2. आपातकालीन स्थान का विवरण",
    manualLocationPlaceholder: "लैंडमार्क या पता दर्ज करें...",
    gpsDetecting: "जीपीएस ट्रैक हो रहा है...",
    detailsLabel: "3. घटना का विवरण",
    titlePlaceholder: "संक्षिप्त विवरण (उदा. सड़क दुर्घटना)",
    descPlaceholder: "क्या हुआ विवरण में बताएं...",
    affectedLabel: "4. प्रभावित लोगों की संख्या",
    mediaLabel: "5. मीडिया साक्ष्य जोड़ें (वैकल्पिक)",
    voiceRecordBtn: "वॉइस नोट रिकॉर्ड करें",
    imageAttachBtn: "छवि अपलोड करें",
    videoAttachBtn: "वीडियो अपलोड करें",
    sharedInfoNotice: "साझा की गई जानकारी: आपके जीपीएस निर्देशांक, विवरण और संपर्क नंबर प्रेषित किए जाएंगे।",
    submitBtn: "आपातकालीन रिपोर्ट भेजें",
    submittingBtn: "सबमिट हो रहा है...",
    successTitle: "आपातकालीन रिपोर्ट प्राप्त हुई",
    ticketLabel: "घटना आईडी:",
    offlineNotice: "स्थानीय रूप से सहेजा गया — कनेक्शन की प्रतीक्षा",
    honestReceipt: "अनुरोध सबमिट हुआ — पुष्टि की प्रतीक्षा में",
    trackBtn: "स्थिति ट्रैक करें",
    homeBtn: "होम पर लौटें"
  }
}

function ReportEmergencyForm() {
  const router = useRouter()
  const { profile, activeLocation, networkState, setLocation, addIncident } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = reportTranslations[lang as 'en' | 'te' | 'hi'] || reportTranslations.en

  // Form State
  const [category, setCategory] = useState<EmergencyCategory>('medical')
  const [severity, setSeverity] = useState<EmergencySeverity>('high')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [affectedCount, setAffectedCount] = useState<number>(1)
  const [manualAddress, setManualAddress] = useState(activeLocation.address || '')
  const [gpsStatus, setGpsStatus] = useState<GpsLocationState>(activeLocation.gpsState || 'GPS AVAILABLE')

  // Media Attachment Simulation State
  const [voiceRecorded, setVoiceRecorded] = useState(false)
  const [imageAttached, setImageAttached] = useState(false)
  const [videoAttached, setVideoAttached] = useState(false)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedIncident, setSubmittedIncident] = useState<CitizenIncident | null>(null)

  // GPS Re-detection
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
        setGpsStatus(err.code === err.PERMISSION_DENIED ? 'PERMISSION DENIED' : 'GPS UNAVAILABLE')
      }
    )
  }

  // Handle Submit
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const incId = `INC-REP-${Math.floor(1000 + Math.random() * 9000)}`
    const nowIso = new Date().toISOString()
    const isOffline = networkState === 'OFFLINE'

    const incidentPayload: CitizenIncident = {
      id: incId,
      category,
      severity,
      title: title || `[${category.toUpperCase()} EMERGENCY] ${manualAddress || activeLocation.address}`,
      description: description || `Report submitted by citizen. Media evidence attached: Voice (${voiceRecorded ? 'Yes' : 'No'}), Image (${imageAttached ? 'Yes' : 'No'}), Video (${videoAttached ? 'Yes' : 'No'}).`,
      location: {
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        address: manualAddress || activeLocation.address,
        district: activeLocation.district || 'Visakhapatnam',
        stateName: activeLocation.stateName || 'Andhra Pradesh',
        gpsState: gpsStatus,
        isManual: gpsStatus !== 'GPS AVAILABLE'
      },
      affectedCount,
      mediaUrls: {
        voice: voiceRecorded ? 'simulated_audio_note.webm' : undefined,
        images: imageAttached ? ['simulated_scene_photo.jpg'] : undefined,
        video: videoAttached ? 'simulated_hazard_clip.mp4' : undefined
      },
      stage: 'received',
      dataFreshness: isOffline ? 'offline' : 'live',
      dataSource: isOffline ? 'CACHED' : 'LIVE',
      syncState: isOffline ? 'PENDING' : 'SYNCED',
      isOfflineSaved: isOffline,
      timeline: [
        { stage: 'received', title: 'Emergency Report Received', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: isOffline ? 'Enqueued in IndexedDB sync queue' : 'Received by BHARATOS Core Gateway' }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    }

    // Save to Zustand & IndexedDB
    addIncident(incidentPayload)
    await IndexedDbService.saveIncident(incidentPayload)

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmittedIncident(incidentPayload)
    }, 700)
  }

  if (submittedIncident) {
    return (
      <div className="space-y-5 py-3">
        <div className={`rounded-3xl p-6 text-center space-y-4 border ${
          submittedIncident.isOfflineSaved
            ? 'border-amber-800/80 bg-amber-950/20'
            : 'border-emerald-800/80 bg-emerald-950/20'
        }`}>
          <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center border-2 ${
            submittedIncident.isOfflineSaved ? 'border-amber-400 text-amber-400 bg-amber-950/80' : 'border-emerald-400 text-emerald-400 bg-emerald-950/80'
          }`}>
            {submittedIncident.isOfflineSaved ? <WifiOff className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8 animate-bounce" />}
          </div>

          <div className="space-y-1">
            <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 uppercase tracking-widest">
              {submittedIncident.isOfflineSaved ? 'SAVED LOCALLY' : 'RECEIPT CONFIRMED'}
            </span>
            <h2 className="text-lg font-black text-white font-mono uppercase tracking-wide pt-1">
              {t.successTitle}
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              {t.ticketLabel} <span className="text-sky-400 font-bold">{submittedIncident.id}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-850 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Category: <strong className="text-white uppercase">{submittedIncident.category}</strong></span>
              <span>Severity: <strong className="text-amber-400 uppercase">{submittedIncident.severity}</strong></span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">{submittedIncident.title}</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed truncate">
              📍 {submittedIncident.location.address}
            </p>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-300/90 font-bold">
              ● {submittedIncident.isOfflineSaved ? t.offlineNotice : t.honestReceipt}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <Link
            href={`/citizen/incidents/${submittedIncident.id}`}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            <span>{t.trackBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/citizen"
            className="w-full py-3.5 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-bold tracking-wider uppercase text-center block transition-all"
          >
            {t.homeBtn}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <span className="text-[9.5px] font-mono font-black text-sky-400 uppercase tracking-widest block">
          MULTIPLE EMERGENCY TYPES SUPPORTED
        </span>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmitReport} className="space-y-4">

        {/* 1. Category Picker Grid */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
          <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
            {t.categoryLabel}
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setCategory('medical')}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                category === 'medical' ? 'border-red-500 bg-red-950/60 text-white font-bold' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-4 h-4 text-red-400 shrink-0" />
              <span>{t.medical}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('fire')}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                category === 'fire' ? 'border-orange-500 bg-orange-950/60 text-white font-bold' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{t.fire}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('police')}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                category === 'police' ? 'border-blue-500 bg-blue-950/60 text-white font-bold' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{t.police}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('road_accident')}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                category === 'road_accident' ? 'border-amber-500 bg-amber-950/60 text-white font-bold' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t.roadAccident}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('disaster')}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                category === 'disaster' ? 'border-purple-500 bg-purple-950/60 text-white font-bold' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{t.disaster}</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('general')}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                category === 'general' ? 'border-slate-500 bg-slate-900 text-white font-bold' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.general}</span>
            </button>
          </div>
        </div>

        {/* 2. Location Picker Card */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {t.locationLabel}
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

          <input
            type="text"
            required
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder={t.manualLocationPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500/60"
          />

          <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className={gpsStatus === 'GPS AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'}>
              {gpsStatus === 'GPS AVAILABLE' ? 'GPS High-Accuracy Linked' : 'GPS Signal Unavailable — Manual Address Entered'}
            </span>
          </div>
        </div>

        {/* 3. Details & Observations */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
            {t.detailsLabel}
          </label>

          <div className="space-y-2.5">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500/60"
            />

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500/60 resize-none"
            />
          </div>
        </div>

        {/* 4. Affected Count Counter */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {t.affectedLabel}
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">{affectedCount} Person(s)</span>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            {[1, 3, 8, 15].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setAffectedCount(cnt)}
                className={`py-2 rounded-xl border text-center font-bold transition-all ${
                  affectedCount === cnt
                    ? 'border-sky-500 bg-sky-950 text-sky-300'
                    : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {cnt === 1 ? '1 Person' : cnt === 3 ? '2-5' : cnt === 8 ? '5-10' : '10+'}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Multi-Media Attachments */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
          <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
            {t.mediaLabel}
          </label>

          <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setVoiceRecorded(!voiceRecorded)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                voiceRecorded ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{voiceRecorded ? 'Voice Added' : t.voiceRecordBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setImageAttached(!imageAttached)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                imageAttached ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{imageAttached ? 'Image Added' : t.imageAttachBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoAttached(!videoAttached)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                videoAttached ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{videoAttached ? 'Video Added' : t.videoAttachBtn}</span>
            </button>
          </div>
        </div>

        {/* Data Consent & Privacy Notice */}
        <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-[10px] font-mono text-slate-400 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t.sharedInfoNotice}</p>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 hover:from-blue-500 hover:to-sky-500 active:scale-98 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
        >
          {isSubmitting ? t.submittingBtn : t.submitBtn}
        </button>

      </form>

    </div>
  )
}

export default function CitizenReportPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-slate-500 font-mono animate-pulse">Loading Emergency Reporter...</div>}>
      <ReportEmergencyForm />
    </Suspense>
  )
}
