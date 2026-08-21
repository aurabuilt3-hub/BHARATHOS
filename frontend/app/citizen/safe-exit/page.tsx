'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Navigation,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  PhoneCall,
  Clock,
  ArrowRight,
  Info,
  Radio,
  Flame,
  LifeBuoy,
  Shield,
  Car,
  CloudRain,
  WifiOff
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { EvacuationRoutingService } from '../../../services/citizen/evacuationRoutingService'
import { GeolocationService } from '../../../services/location/geolocationService'
import MapContainer, { MapMarker, MapPolyline } from '../../../components/ui/MapContainer'
import { EmergencyRoute, EmergencyRouteType, AppLanguage, LocationInfo } from '../../../types/citizen'

const exitTranslations = {
  en: {
    title: "EMERGENCY EXIT & SAFE EVACUATION",
    subtitle: "Hazard-aware emergency evacuation routing and assembly point guidance",
    btnStart: "START SAFE ROUTE",
    btnActive: "EVACUATION ROUTE ACTIVE — TRACKING POSITION",
    btnGuidance: "VIEW OFFICIAL GUIDANCE",
    originLabel: "CURRENT LOCATION:",
    destinationLabel: "SAFE EVACUATION DESTINATION:",
    avoidHeader: "AVOID DANGEROUS AREAS (HAZARD ZONES):",
    blockedHeader: "CONFIRMED BLOCKED ROADS:",
    instructionsHeader: "OFFICIAL EVACUATION INSTRUCTIONS:",
    honestDisclaimer: "BHARATOS Safe Exit provides suggested evacuation pathways based on available spatial telemetry. Never attempt to cross fast-moving flood waters or active fire corridors."
  },
  te: {
    title: "అత్యవసర నిష్క్రమణ & సురక్షిత తరలింపు",
    subtitle: "ప్రమాద రహిత సురక్షిత తరలింపు మార్గం మరియు పునరావాస కేంద్ర మార్గదర్శి",
    btnStart: "సురక్షిత మార్గాన్ని ప్రారంభించండి",
    btnActive: "తరలింపు మార్గం క్రియాశీలంగా ఉంది",
    btnGuidance: "అధికారిక మార్గదర్శకాలు చూడండి",
    originLabel: "ప్రస్తుత లొకేషన్:",
    destinationLabel: "సురక్షిత గమ్యస్థానం:",
    avoidHeader: "ప్రమాదకర ప్రాంతాలు (నివారించండి):",
    blockedHeader: "మూసివేయబడిన రహదారులు:",
    instructionsHeader: "అధికారిక తరలింపు సూచనలు:",
    honestDisclaimer: "భారత్ఓఎస్ లభ్యమైన సమాచారం ఆధారంగా నిష్క్రమణ మార్గాన్ని సూచిస్తుంది."
  },
  hi: {
    title: "आपातकालीन निकास व सुरक्षित निकासी",
    subtitle: "खतरा-जागरूक निकासी मार्ग व सुरक्षित शरण स्थल निर्देश",
    btnStart: "सुरक्षित मार्ग शुरू करें",
    btnActive: "निकासी मार्ग सक्रिय है",
    btnGuidance: "आधिकारिक निर्देश देखें",
    originLabel: "वर्तमान स्थान:",
    destinationLabel: "सुरक्षित निकासी गंतव्य:",
    avoidHeader: "खतरनाक क्षेत्र (बचें):",
    blockedHeader: "बंद सड़कें:",
    instructionsHeader: "आधिकारिक निकासी निर्देश:",
    honestDisclaimer: "भारतओएस उपलब्ध जानकारी के आधार पर निकासी मार्ग का सुझाव देता है।"
  }
}

export default function SafeExitPage() {
  const router = useRouter()
  const { profile, activeLocation, setLocation, networkState } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = exitTranslations[lang as 'en' | 'te' | 'hi'] || exitTranslations.en

  const [routeType, setRouteType] = useState<EmergencyRouteType>('general')
  const [routeData, setRouteData] = useState<EmergencyRoute | null>(null)
  const [loading, setLoading] = useState(true)
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    async function loadRoute() {
      setLoading(true)
      let originToUse = activeLocation

      // Attempt real device geolocation if not yet acquired
      if (activeLocation.gpsState !== 'GPS AVAILABLE') {
        const gpsRes = await GeolocationService.getDeviceLocation()
        if (gpsRes.location && gpsRes.location.gpsState === 'GPS AVAILABLE') {
          originToUse = gpsRes.location
          setLocation(gpsRes.location)
        }
      }

      const route = await EvacuationRoutingService.calculateEvacuationRoute(
        originToUse,
        routeType,
        networkState !== 'OFFLINE'
      )
      setRouteData(route)
      setLoading(false)
    }
    loadRoute()
  }, [activeLocation, routeType, networkState, setLocation])

  if (loading || !routeData) {
    return (
      <div className="py-16 text-center text-xs font-mono text-[#94a3b8] animate-pulse space-y-3">
        <Navigation className="w-10 h-10 mx-auto text-sky-400 animate-spin" />
        <p className="text-sm font-bold">Calculating Hazard-Aware Evacuation Route & Canvas Bounds...</p>
      </div>
    )
  }

  const sourceMeta = EvacuationRoutingService.getSourceLabel(routeData.sourceType)

  // Map Markers: Origin (User 📍), Destination (Door 🚪), Hazards (⚠️)
  const mapMarkers: MapMarker[] = [
    {
      id: 'origin-marker',
      position: [routeData.origin.latitude, routeData.origin.longitude],
      title: '📍 YOU ARE HERE',
      description: `Citizen Location: ${routeData.origin.address}`,
      category: 'user'
    },
    {
      id: 'dest-marker',
      position: [routeData.destination.latitude, routeData.destination.longitude],
      title: `🚪 ${routeData.destination.name}`,
      description: `Evacuation Assembly Destination: ${routeData.destination.address}`,
      category: 'destination'
    }
  ]

  // Add Hazard markers
  routeData.hazards.forEach((haz, i) => {
    mapMarkers.push({
      id: `haz-${i}`,
      position: [haz.latitude, haz.longitude],
      title: `⚠️ HAZARD: ${haz.name}`,
      description: `Hazard Zone: ${haz.name} (${haz.severity.toUpperCase()})`,
      category: 'hazard'
    })
  })

  // Polyline for evacuation route
  const mapPolylines: MapPolyline[] = [
    {
      id: 'evac-path-main',
      positions: routeData.coordinatesPath,
      color: '#06b6d4',
      weight: 6
    }
  ]

  // Collect all points for fitBoundsPoints
  const fitBoundsPoints: Array<[number, number]> = [
    [routeData.origin.latitude, routeData.origin.longitude],
    [routeData.destination.latitude, routeData.destination.longitude],
    ...routeData.coordinatesPath,
    ...routeData.hazards.map(h => [h.latitude, h.longitude] as [number, number])
  ]

  return (
    <div className="space-y-6 pb-8">

      {/* 1. Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-red-400 uppercase tracking-widest">
          <Navigation className="w-3.5 h-3.5" />
          <span>HAZARD-AWARE EVACUATION ROUTER</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-[#94a3b8] mt-0.5">{t.subtitle}</p>
      </div>

      {/* 2. Source Transparency Badge Banner */}
      <div className={`p-3.5 rounded-2xl border ${sourceMeta.color} space-y-1 font-mono`}>
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="uppercase tracking-wider flex items-center">
            <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            {sourceMeta.label}
          </span>
          {routeData.isSimulated && (
            <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded text-[8.5px] font-bold">
              SIMULATED ROUTE
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium leading-relaxed">{sourceMeta.text}</p>
        {routeData.sourceAuthority && (
          <span className="text-[9px] text-slate-400 block pt-0.5">
            Authority Source: <strong>{routeData.sourceAuthority}</strong>
          </span>
        )}
      </div>

      {/* Emergency Category Selector */}
      <div className="grid grid-cols-4 gap-1.5 border border-slate-900 rounded-2xl bg-[#060a13] p-1 font-mono text-[10px]">
        <button
          onClick={() => setRouteType('general')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            routeType === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          General
        </button>

        <button
          onClick={() => setRouteType('fire')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            routeType === 'fire' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔥 Fire
        </button>

        <button
          onClick={() => setRouteType('flood')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            routeType === 'flood' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🌊 Flood
        </button>

        <button
          onClick={() => setRouteType('medical')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            routeType === 'medical' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏥 Medical
        </button>
      </div>

      {/* 3. LARGE VISIBLE EVACUATION MAP CANVAS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>ORIGIN: <strong className="text-white">{routeData.origin.address.split(',')[0]}</strong></span>
          </span>
          <span className="flex items-center space-x-1">
            <span>DESTINATION: <strong className="text-emerald-400">{routeData.destination.name.split(' ')[0]}</strong></span>
          </span>
        </div>

        {/* Map Container Element (Explicit height: 380px mobile / 440px desktop) */}
        <div className="h-[380px] md:h-[440px] w-full rounded-3xl border-2 border-sky-900/60 overflow-hidden relative shadow-2xl bg-[#050816]">
          <MapContainer
            center={[routeData.origin.latitude, routeData.origin.longitude]}
            zoom={13}
            markers={mapMarkers}
            polylines={mapPolylines}
            fitBoundsPoints={fitBoundsPoints}
            showMyLocationButton={true}
          />
        </div>
      </div>

      {/* 4. Route Summary Details Card */}
      <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3 font-mono text-xs shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="space-y-0.5">
            <span className="text-[9px] text-[#64748b] font-bold uppercase">{t.originLabel}</span>
            <p className="text-white font-bold truncate max-w-[220px]">{routeData.origin.address}</p>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[9px] text-sky-400 font-bold uppercase">DISTANCE</span>
            <p className="text-white font-bold">{routeData.distanceKm} km</p>
          </div>
        </div>

        <div className="space-y-0.5 pt-1">
          <span className="text-[9px] text-emerald-400 font-bold uppercase">{t.destinationLabel}</span>
          <h3 className="text-sm font-black text-white">🚪 {routeData.destination.name}</h3>
          <p className="text-[11px] text-slate-400">📍 {routeData.destination.address}</p>
        </div>

        {routeData.estimatedMinutes !== null && (
          <div className="flex items-center space-x-1.5 text-xs text-sky-300 bg-sky-950/40 p-2.5 rounded-xl border border-sky-900/60 font-bold">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Estimated Evacuation Time: {routeData.estimatedMinutes} Mins (If Traffic Clear)</span>
          </div>
        )}
      </div>

      {/* 5. Hazards & Blocked Roads Warnings Box */}
      {(routeData.hazards.length > 0 || routeData.blockedSegments.length > 0) && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-4 space-y-3 font-mono text-xs">
          {routeData.hazards.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-red-500" />
                {t.avoidHeader}
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {routeData.hazards.map((haz, i) => (
                  <li key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900">
                    <span>⚠️ {haz.name}</span>
                    <span className="text-[9px] font-bold text-red-400 uppercase px-2 py-0.5 rounded bg-red-950 border border-red-800">
                      {haz.severity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {routeData.blockedSegments.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-red-900/40">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                ⛔ {t.blockedHeader}
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {routeData.blockedSegments.map((blk, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">
                    <span className="font-bold text-white block">⛔ {blk.roadName}</span>
                    <span className="text-[10px] text-slate-400">Reason: {blk.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. Official Evacuation Instructions */}
      <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5 font-mono text-xs">
        <h3 className="text-[10.5px] font-bold text-white uppercase tracking-wider">{t.instructionsHeader}</h3>
        <ul className="space-y-2 text-slate-300 text-[11px]">
          {routeData.officialInstructions.map((step, i) => (
            <li key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Action Buttons */}
      <div className="space-y-2.5 pt-2 font-mono text-xs">
        <button
          onClick={() => setNavigating(!navigating)}
          className={`w-full py-4 rounded-2xl font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 shadow-xl transition-all cursor-pointer ${
            navigating
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50 animate-pulse'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
          }`}
        >
          <Navigation className="w-4.5 h-4.5" />
          <span>{navigating ? t.btnActive : t.btnStart}</span>
        </button>

        <Link
          href="/citizen/guidance"
          className="w-full py-3.5 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 transition-all block"
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>{t.btnGuidance}</span>
        </Link>
      </div>

      {/* Honest Operational Disclaimer */}
      <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 text-[9.5px] font-mono text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t.honestDisclaimer}</p>
      </div>

    </div>
  )
}
