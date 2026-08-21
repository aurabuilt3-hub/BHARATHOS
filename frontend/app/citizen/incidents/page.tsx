'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  WifiOff, 
  RefreshCw, 
  FileText,
  LifeBuoy,
  Flame,
  Shield,
  Car,
  CloudRain,
  AlertTriangle
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import { CitizenIncident, IncidentStage, AppLanguage } from '../../../types/citizen'

const incidentListTranslations = {
  en: {
    title: "MY INCIDENTS & STATUS",
    subtitle: "Track live status and stage progress of your emergency requests",
    tabActive: "Active Incidents",
    tabResolved: "Resolved Incidents",
    noIncidentsActive: "No active emergency reports found.",
    noIncidentsResolved: "No resolved emergency reports.",
    viewDetailsBtn: "View Tracking Details",
    syncedBadge: "SYNCED WITH CORE",
    pendingBadge: "OFFLINE DRAFT — PENDING SYNC",
    honestReceipt: "Request Submitted — Waiting for Department Assignment Confirmation"
  },
  te: {
    title: "నా ఇన్సిడెంట్స్ & స్టేటస్",
    subtitle: "మీ అత్యవసర నివేదికల స్థితిని ప్రతిక్షణం ట్రాక్ చేయండి",
    tabActive: "క్రియాశీల నివేదికలు",
    tabResolved: "పరిష్కరించబడినవి",
    noIncidentsActive: "క్రియాశీల నివేదికలు లేవు.",
    noIncidentsResolved: "పరిష్కరించబడిన నివేదికలు లేవు.",
    viewDetailsBtn: "ట్రాకింగ్ వివరాలు చూడండి",
    syncedBadge: "సింక్ చేయబడింది",
    pendingBadge: "ఆఫ్‌లైన్ డ్రాఫ్ట్ — సింకింగ్ పెండింగ్",
    honestReceipt: "అభ్యర్థన సమర్పించబడింది — ధృవీకరణ కోసం వేచి ఉంది"
  },
  hi: {
    title: "मेरी घटनाएं व स्थिति",
    subtitle: "अपने आपातकालीन अनुरोधों की स्थिति और प्रगति ट्रैक करें",
    tabActive: "सक्रिय घटनाएं",
    tabResolved: "समाधान की गई",
    noIncidentsActive: "कोई सक्रिय घटना रिपोर्ट नहीं मिली।",
    noIncidentsResolved: "कोई समाधान की गई रिपोर्ट नहीं।",
    viewDetailsBtn: "ट्रैकिंग विवरण देखें",
    syncedBadge: "सिंक किया गया",
    pendingBadge: "ऑफ़लाइन ड्राफ्ट — सिंक लंबित",
    honestReceipt: "अनुरोध सबमिट हुआ — पुष्टि की प्रतीक्षा में"
  }
}

const STAGES_ORDER: { stage: IncidentStage; label: string }[] = [
  { stage: 'received', label: '1. Received' },
  { stage: 'ai_analyzed', label: '2. AI Analysis' },
  { stage: 'priority_assigned', label: '3. Priority' },
  { stage: 'dept_notified', label: '4. Dept Notified' },
  { stage: 'resources_assigned', label: '5. Resources' },
  { stage: 'response_in_progress', label: '6. In Progress' },
  { stage: 'resolved', label: '7. Resolved' }
]

export default function MyIncidentsPage() {
  const { profile, myIncidents, addIncident } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = incidentListTranslations[lang as 'en' | 'te' | 'hi'] || incidentListTranslations.en

  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active')
  const [localIncidents, setLocalIncidents] = useState<CitizenIncident[]>([])

  // Load incidents from IndexedDB & store
  useEffect(() => {
    async function loadIncidents() {
      const dbIncidents = await IndexedDbService.getAllIncidents()
      const merged = [...myIncidents]
      dbIncidents.forEach(inc => {
        if (!merged.find(m => m.id === inc.id)) {
          merged.push(inc)
        }
      })
      setLocalIncidents(merged)
    }
    loadIncidents()
  }, [myIncidents])

  // Filter active vs resolved
  const filteredIncidents = localIncidents.filter(inc => 
    activeTab === 'active' ? inc.stage !== 'resolved' : inc.stage === 'resolved'
  )

  // Helper for category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <LifeBuoy className="w-4 h-4 text-red-400" />
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />
      case 'police': return <Shield className="w-4 h-4 text-blue-400" />
      case 'road_accident': return <Car className="w-4 h-4 text-amber-400" />
      case 'disaster': return <CloudRain className="w-4 h-4 text-purple-400" />
      default: return <AlertTriangle className="w-4 h-4 text-slate-400" />
    }
  }

  // Get index of current stage in 7-stage lifecycle
  const getStageIndex = (stage: IncidentStage) => {
    return STAGES_ORDER.findIndex(s => s.stage === stage)
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <span className="text-[9.5px] font-mono font-black text-sky-400 uppercase tracking-widest block">
          LIFECYCLE STATUS TRACKER
        </span>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex border border-slate-900 rounded-2xl bg-[#060a13] p-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabActive} ({localIncidents.filter(i => i.stage !== 'resolved').length})
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'resolved'
              ? 'bg-emerald-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabResolved} ({localIncidents.filter(i => i.stage === 'resolved').length})
        </button>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            {activeTab === 'active' ? t.noIncidentsActive : t.noIncidentsResolved}
          </p>
          <Link
            href="/citizen/report"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-all"
          >
            File Emergency Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const currentStageIdx = getStageIndex(incident.stage)

            return (
              <div 
                key={incident.id}
                className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3.5 hover:border-slate-800 transition-all shadow-lg"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(incident.category)}
                    <span className="text-xs font-bold text-white font-mono uppercase">{incident.category}</span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 uppercase">
                      {incident.severity}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-sky-400 font-bold">
                    {incident.id}
                  </span>
                </div>

                {/* Body Details */}
                <div>
                  <h3 className="text-xs font-extrabold text-white leading-snug">{incident.title}</h3>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-1">📍 {incident.location.address}</p>
                </div>

                {/* 7-Stage Visual Lifecycle Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                    <span>LIFECYCLE PROGRESS:</span>
                    <span className="text-sky-400 uppercase">{incident.stage.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {STAGES_ORDER.map((stg, idx) => {
                      const isComplete = idx <= currentStageIdx
                      const isCurrent = idx === currentStageIdx

                      return (
                        <div key={stg.stage} className="space-y-1 text-center">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              isCurrent 
                                ? 'bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]' 
                                : isComplete 
                                ? 'bg-emerald-500' 
                                : 'bg-slate-850'
                            }`}
                          />
                          <span className={`text-[7.5px] font-mono uppercase block truncate ${
                            isCurrent ? 'text-sky-300 font-bold' : isComplete ? 'text-emerald-400' : 'text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Honest Sync & Receipt Status Footer */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[9.5px] font-mono">
                  <div className="flex items-center space-x-1.5">
                    {incident.syncState === 'PENDING' || incident.isOfflineSaved ? (
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <WifiOff className="w-3 h-3" />
                        <span>{t.pendingBadge}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t.syncedBadge}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/citizen/incidents/${incident.id}`}
                    className="px-3 py-1.5 rounded-lg border border-sky-800 bg-sky-950 hover:bg-sky-900 text-sky-300 hover:text-white font-bold transition-all flex items-center space-x-1"
                  >
                    <span>{t.viewDetailsBtn}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
