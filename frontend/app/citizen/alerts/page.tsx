'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '../layout'
import { apiService, BackendAlert } from '../../../services/api'
import { ShieldAlert, Bell, Info, AlertTriangle } from 'lucide-react'

const alertTranslations = {
  en: {
    title: "Active Warning Feeds",
    desc: "Active safety alerts and municipal warnings in your region.",
    systemWarning: "Government Integration Pending",
    systemWarningText: "BHARATOS is designed to integrate directly with emergency SMS, radio, and public warning infrastructure.",
    noAlerts: "No active flood warnings currently issued.",
    sourceLabel: "Source:",
    severityLabel: "Severity:",
    statusLabel: "Status:",
    demoBadge: "DEMO SCENARIO",
    liveBadge: "LIVE PILOT FEED"
  },
  te: {
    title: "క్రియాశీల హెచ్చరికలు",
    desc: "మీ ప్రాంతంలో క్రియాశీల భద్రతా అలర్ట్‌లు మరియు పురపాలక హెచ్చరికలు.",
    systemWarning: "ప్రభుత్వ వ్యవస్థలతో అనుసంధానం పెండింగ్‌లో ఉంది",
    systemWarningText: "భారత్ఓఎస్ అత్యవసర ఎస్ఎంఎస్, రేడియో మరియు ప్రజా హెచ్చరికల వ్యవస్థలతో నేరుగా అనుసంధానం చేయడానికి రూపొందించబడింది.",
    noAlerts: "ప్రస్తుతం ఎటువంటి క్రియాశీల వరద హెచ్చరికలు జారీ చేయబడలేదు.",
    sourceLabel: "మూలం:",
    severityLabel: "తీవ్రత:",
    statusLabel: "స్థితి:",
    demoBadge: "డెమో దృశ్యం",
    liveBadge: "లైవ్ పైలట్ ఫీడ్"
  },
  hi: {
    title: "सक्रिय चेतावनियाँ",
    desc: "आपके क्षेत्र में सक्रिय सुरक्षा अलर्ट और नगर पालिका चेतावनियाँ।",
    systemWarning: "सरकारी एकीकरण लंबित है",
    systemWarningText: "भारतओएस आपातकालीन एसएमएस, रेडियो और सार्वजनिक चेतावनी प्रणालियों के साथ सीधे एकीकृत करने के लिए डिज़ाइन किया गया है।",
    noAlerts: "वर्तमान में कोई सक्रिय बाढ़ चेतावनी जारी नहीं की गई है।",
    sourceLabel: "स्रोत:",
    severityLabel: "गंभीरता:",
    statusLabel: "स्थिति:",
    demoBadge: "डेमो परिदृश्य",
    liveBadge: "लाइव पायलट फीड"
  }
}

export default function CitizenAlerts() {
  const { lang } = useLanguage()
  const [alerts, setAlerts] = useState<BackendAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    apiService.getAlerts()
      .then((res: any) => {
        if (!isMounted) return
        // Accept either items from paginated object or lists directly
        const list = Array.isArray(res) ? res : (res.items || [])
        setAlerts(list)
        setLoading(false)
      })
      .catch((err) => {
        console.warn("Failed to load active alerts from DB:", err)
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  const t = alertTranslations[lang]

  return (
    <div className="space-y-5">
      
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">{t.title}</h2>
        <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
      </div>

      {/* Integration Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-900 flex items-start space-x-3.5 bg-slate-950/20 text-xs">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="font-extrabold text-white">{t.systemWarning}</h4>
          <p className="text-slate-400 leading-relaxed">{t.systemWarningText}</p>
          <span className="inline-block text-[8.5px] font-mono font-bold bg-blue-950/60 border border-blue-900/40 px-2 py-0.5 rounded text-blue-400 uppercase tracking-widest">
            {t.demoBadge}
          </span>
        </div>
      </div>

      {/* Warnings Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono animate-pulse">Syncing warnings database...</div>
        ) : alerts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center text-xs text-slate-500 border border-slate-900 italic">
            {t.noAlerts}
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`glass-panel border-l-4 rounded-2xl p-4.5 space-y-3.5 shadow-lg border border-slate-900 ${
                alert.severity === 'critical' ? 'border-l-red-500 bg-red-950/10' :
                alert.severity === 'high' ? 'border-l-orange-500 bg-orange-950/10' :
                alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-950/10' : 'border-l-blue-500 bg-slate-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider">
                  {t.sourceLabel} {alert.source || 'CWC Station'}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${
                  alert.severity === 'critical' ? 'text-red-400 bg-red-950/40 border-red-900/30' :
                  alert.severity === 'high' ? 'text-orange-400 bg-orange-950/40 border-orange-900/30' : 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30'
                }`}>
                  {alert.severity}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wide leading-relaxed">{alert.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5 text-[9px] font-mono font-bold text-slate-500">
                <span>{new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span className="text-sky-400 font-extrabold uppercase tracking-wider">{t.liveBadge}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
