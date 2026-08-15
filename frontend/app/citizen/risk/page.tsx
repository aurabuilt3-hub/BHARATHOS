'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '../layout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { apiService, BackendIncident, BackendFacility } from '../../../services/api'
import { AlertCircle, MapPin, Shield, Layers, HelpCircle, Activity } from 'lucide-react'

const riskTranslations = {
  en: {
    title: "My Area Risk",
    levelLabel: "Risk Severity:",
    reasonLabel: "Risk Factors:",
    whyRainfall: "Heavy rainfall pattern detected",
    whyWaterLevel: "High storm runoff level warning",
    whyTopography: "Low-lying coastal topography",
    dataStatus: "Data Status:",
    facilitiesTitle: "Emergency Facilities Nearby",
    facilitiesDesc: "Official municipal centers, police stations, and fire services.",
    incidentsTitle: "Recent Reported Risks Nearby",
    rainfallLabel: "Rainfall Rate:",
    tempLabel: "Temperature:",
    humidityLabel: "Humidity:",
    statusLabel: "Status:",
    livePilot: "LIVE PILOT",
    demoScenario: "DEMO SCENARIO"
  },
  te: {
    title: "నా ప్రాంతం రిస్క్ వివరాలు",
    levelLabel: "రిస్క్ తీవ్రత:",
    reasonLabel: "రిస్క్ కారకాలు:",
    whyRainfall: "భారీ వర్షపాతం కనుగొనబడింది",
    whyWaterLevel: "అధిక తుఫాను నీటి ప్రవాహం హెచ్చరిక",
    whyTopography: "తక్కువ ఎత్తులో ఉన్న కోస్తా ప్రాంతం",
    dataStatus: "డేటా స్థితి:",
    facilitiesTitle: "సమీప అత్యవసర సౌకర్యాలు",
    facilitiesDesc: "అధికారిక పురపాలక కేంద్రాలు, పోలీస్ స్టేషన్లు మరియు అగ్నిమాపక సేవలు.",
    incidentsTitle: "సమీపంలో నమోదైన వరద రిస్క్‌లు",
    rainfallLabel: "వర్షపాతం రేటు:",
    tempLabel: "ఉష్ణోగ్రత:",
    humidityLabel: "తేమ:",
    statusLabel: "స్థితి:",
    livePilot: "లైవ్ పైలట్",
    demoScenario: "డెమో దృశ్యం"
  },
  hi: {
    title: "मेरे क्षेत्र का जोखिम",
    levelLabel: "जोखिम की गंभीरता:",
    reasonLabel: "जोखिम के कारक:",
    whyRainfall: "भारी वर्षा का स्वरूप दर्ज",
    whyWaterLevel: "उच्च तूफान अपवाह स्तर चेतावनी",
    whyTopography: "निचले तटीय क्षेत्र की स्थलाकृति",
    dataStatus: "डेटा स्थिति:",
    facilitiesTitle: "पास के आपातकालीन केंद्र",
    facilitiesDesc: "आधिकारिक नगर पालिका केंद्र, पुलिस स्टेशन और फायर सेवाएं।",
    incidentsTitle: "समीप में दर्ज बाढ़ जोखिम",
    rainfallLabel: "वर्षा दर:",
    tempLabel: "तापमान:",
    humidityLabel: "आर्द्रता:",
    statusLabel: "स्थिति:",
    livePilot: "लाइव पायलट",
    demoScenario: "डेमो परिदृश्य"
  }
}

export default function CitizenRisk() {
  const { lang } = useLanguage()
  const [incidents, setIncidents] = useState<BackendIncident[]>([])
  const [facilities, setFacilities] = useState<BackendFacility[]>([])
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([
      apiService.getIncidents({ limit: 50 }),
      apiService.getFacilities({ limit: 50 }),
      apiService.getDashboardOverview()
    ]).then(([incidentsRes, facilitiesRes, statsRes]) => {
      if (!isMounted) return
      setIncidents(incidentsRes || [])
      setFacilities(facilitiesRes.items || [])
      if (statsRes && statsRes.weather) {
        setWeatherData(statsRes.weather)
      }
      setLoading(false)
    }).catch(err => {
      console.warn("Failed to load risk dashboard parameters:", err)
      if (isMounted) setLoading(false)
    })

    return () => { isMounted = false }
  }, [])

  // Convert objects to map pins
  const incidentPins: MapMarker[] = incidents.map(inc => ({
    id: `inc-${inc.id}`,
    position: [inc.latitude, inc.longitude] as [number, number],
    title: `⚠️ [${inc.category.toUpperCase()}] ${inc.title}`,
    description: inc.description,
    category: inc.severity === 'critical' ? 'critical' as const : inc.severity === 'high' ? 'high' as const : 'medium' as const
  }))

  const facilityPins: MapMarker[] = facilities.map(fac => {
    let emoji = '👮'
    if (fac.facility_type === 'FIRE_STATION') emoji = '🚒'
    if (fac.facility_type === 'HEALTH_SERVICES') emoji = '🏥'
    return {
      id: `fac-${fac.id}`,
      position: [fac.latitude, fac.longitude] as [number, number],
      title: `${emoji} ${fac.name}`,
      description: fac.address || 'Emergency Center',
      category: 'info' as const
    }
  })

  const allMarkers = [...incidentPins, ...facilityPins].filter(m => m.position[0] && m.position[1])
  const t = riskTranslations[lang]

  return (
    <div className="space-y-5">
      
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">{t.title}</h2>
        <span className="text-[10px] font-mono-data text-slate-500 block mt-0.5">LOCATION: VISAKHAPATNAM (MVP COLONY)</span>
      </div>

      {/* Weather Stats Bar */}
      {weatherData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel border border-slate-900 rounded-xl p-3 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.tempLabel}</span>
            <span className="text-sm font-extrabold text-white mt-1 block font-mono-data">{weatherData.temperature}°C</span>
          </div>
          <div className="glass-panel border border-slate-900 rounded-xl p-3 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.rainfallLabel}</span>
            <span className="text-sm font-extrabold text-sky-400 mt-1 block font-mono-data">48mm/h</span>
          </div>
          <div className="glass-panel border border-slate-900 rounded-xl p-3 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.humidityLabel}</span>
            <span className="text-sm font-extrabold text-slate-300 mt-1 block font-mono-data">{weatherData.humidity || '82'}%</span>
          </div>
        </div>
      )}

      {/* Main Risk Status and Details */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-900 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block">{t.levelLabel}</span>
            <span className="text-sm font-extrabold text-orange-400 font-mono mt-0.5 block">WARNING / HIGH RISK</span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-orange-950/60 border border-orange-900/40 text-orange-300 px-2 py-0.5 rounded uppercase">
            {t.livePilot}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">{t.reasonLabel}</span>
          <ul className="space-y-2 text-xs text-slate-350">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
              <span>{t.whyRainfall}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
              <span>{t.whyWaterLevel}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
              <span>{t.whyTopography}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Simplified Citizen Map */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">Simplified Area Map</span>
        <div className="h-64 w-full rounded-2xl border border-slate-900 overflow-hidden relative">
          <MapContainer
            center={[17.7289, 83.3214]}
            zoom={13}
            markers={allMarkers}
          />
          
          {/* Simple Legend overlay */}
          <div className="absolute bottom-3 left-3 z-[999] bg-[#020617]/95 border border-slate-800 rounded-lg p-2 text-[9px] text-slate-400 shadow-xl space-y-1 font-mono pointer-events-none select-none">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded bg-red-500" />
              <span>🔴 Hazard</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded bg-blue-500" />
              <span>🔵 Facility</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Facilities Nearby */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-900 space-y-4">
        <div>
          <h4 className="text-sm font-extrabold text-white leading-none">{t.facilitiesTitle}</h4>
          <p className="text-[10px] text-slate-500 mt-1">{t.facilitiesDesc}</p>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-slate-500 font-mono animate-pulse">Syncing emergency locations...</div>
        ) : facilities.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-500 font-mono italic">No facilities available.</div>
        ) : (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {facilities.slice(0, 5).map(f => (
              <div key={f.id} className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 text-xs flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white">{f.name}</h5>
                  <span className="text-[9px] text-slate-500 font-mono-data mt-0.5 block">{f.address || 'Address Pending'}</span>
                </div>
                <span className="text-[9px] font-mono-data bg-blue-950/40 border border-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">
                  {f.facility_type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reported Risks Nearby */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-900 space-y-4">
        <h4 className="text-sm font-extrabold text-white leading-none">{t.incidentsTitle}</h4>

        {loading ? (
          <div className="py-4 text-center text-xs text-slate-500 font-mono animate-pulse">Syncing nearby reports...</div>
        ) : incidents.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-500 font-mono italic">No active reports.</div>
        ) : (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {incidents.slice(0, 5).map(inc => (
              <div key={inc.id} className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[200px]">{inc.title}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    inc.severity === 'critical' ? 'text-red-400 bg-red-950/40' :
                    inc.severity === 'high' ? 'text-orange-400 bg-orange-950/40' : 'text-yellow-400 bg-yellow-950/40'
                  }`}>
                    {inc.severity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed truncate">{inc.description}</p>
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono-data pt-1 border-t border-slate-900/40">
                  <span>Loc: {inc.address || 'Coords Pending'}</span>
                  <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
