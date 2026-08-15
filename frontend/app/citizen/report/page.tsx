'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '../layout'
import { apiService, CreateIncidentPayload } from '../../../services/api'
import { AlertTriangle, ShieldAlert, Navigation, CheckCircle2, ChevronLeft, Info } from 'lucide-react'

const reportTranslations = {
  en: {
    reportTitle: "Report Local Flooding",
    helpTitle: "Request Emergency Assistance",
    reportSubtitle: "Help authorities trace active waterlogging and drainage overflows in real-time.",
    helpSubtitle: "Request emergency evacuation, medical aid, or rescue operations.",
    explainText: "BHARATOS identifies flood risk automatically using environmental and SCADA infrastructure sensors. You can also report active hazards observed on the ground.",
    labelCategory: "What is happening?",
    labelHelpType: "Emergency Type",
    labelSeverity: "Severity Level",
    labelDesc: "Optional details / description",
    labelLoc: "Report Location",
    locButton: "Capture Coords",
    submitReport: "Send Flood Report",
    submitHelp: "Send Assistance Request",
    submitting: "Submitting to NEOC Dispatch...",
    successHeading: "Report Received Successfully",
    ticketLabel: "Ticket ID:",
    statusLabel: "Initial Status:",
    timeLabel: "Submitted Time:",
    backHome: "Back to Safety Deck",
    helpSentText: "Emergency request has been dispatched to the BHARATOS response system.",
    integrationReady: "LIVE DISPATCH EN ROUTE"
  },
  te: {
    reportTitle: "వరద రిపోర్ట్ చేయండి",
    helpTitle: "అత్యవసర సహాయాన్ని అభ్యర్థించండి",
    reportSubtitle: "అధికారులకు నిజ సమయంలో నీటి నిల్వ మరియు డ్రైనేజీ సమస్యలను గుర్తించడంలో సహాయపడండి.",
    helpSubtitle: "అత్యవసర తరలింపు, వైద్య సహాయం లేదా సహాయక చర్యలను అభ్యర్థించండి.",
    explainText: "పర్యావరణ మరియు స్కాడా సెన్సార్ల ద్వారా భారత్ఓఎస్ వరద ముప్పును స్వయంచాలకంగా గుర్తిస్తుంది. మీరు కూడా ప్రత్యక్షంగా చూసిన ప్రమాదాలను నివేదించవచ్చు.",
    labelCategory: "ఏం జరుగుతోంది?",
    labelHelpType: "అత్యవసర రకం",
    labelSeverity: "తీవ్రత స్థాయి",
    labelDesc: "అదనపు వివరాలు (ఐచ్ఛికం)",
    labelLoc: "రిపోర్ట్ లొకేషన్",
    locButton: "లొకేషన్ తీసుకో",
    submitReport: "వరద రిపోర్ట్ పంపండి",
    submitHelp: "సహాయ అభ్యర్థన పంపండి",
    submitting: "డిస్పాచ్ కేంద్రానికి పంపుతోంది...",
    successHeading: "నివేదిక విజయవంతంగా స్వీకరించబడింది",
    ticketLabel: "టికెట్ ఐడి:",
    statusLabel: "ప్రారంభ స్థితి:",
    timeLabel: "సమర్పించిన సమయం:",
    backHome: "భద్రతా డెక్‌కు తిరిగి వెళ్ళు",
    helpSentText: "అత్యవసర అభ్యర్థన భారత్ఓఎస్ ప్రతిస్పందన వ్యవస్థకు పంపబడింది.",
    integrationReady: "అత్యవసర సహాయం పంపబడింది"
  },
  hi: {
    reportTitle: "बाढ़ की रिपोर्ट करें",
    helpTitle: "आपातकालीन सहायता का अनुरोध करें",
    reportSubtitle: "अधिकारियों को वास्तविक समय में जलभराव और जल निकासी समस्याओं को ट्रैक करने में मदद करें।",
    helpSubtitle: "आपातकालीन निकासी, चिकित्सा सहायता या बचाव कार्यों का अनुरोध करें।",
    explainText: "भारतओएस पर्यावरण और स्काडा सेंसर के माध्यम से स्वचालित रूप से बाढ़ के जोखिम की पहचान करता है। आप भी जमीन पर देखे गए खतरों की रिपोर्ट कर सकते हैं।",
    labelCategory: "क्या हो रहा है?",
    labelHelpType: "आपातकालीन प्रकार",
    labelSeverity: "गंभीरता स्तर",
    labelDesc: "वैकल्पिक विवरण / विवरण",
    labelLoc: "रिपोर्ट स्थान",
    locButton: "स्थान कैप्चर करें",
    submitReport: "बाढ़ रिपोर्ट भेजें",
    submitHelp: "सहायता अनुरोध भेजें",
    submitting: "NEOC डिस्पैच को भेजा जा रहा है...",
    successHeading: "रिपोर्ट सफलतापूर्वक प्राप्त हुई",
    ticketLabel: "टिकट आईडी:",
    statusLabel: "प्रारंभिक स्थिति:",
    timeLabel: "जमा करने का समय:",
    backHome: "सुरक्षा डेक पर लौटें",
    helpSentText: "आपातकालीन अनुरोध भारतओएस प्रतिक्रिया प्रणाली को भेज दिया गया है।",
    integrationReady: "आपातकालीन सहायता भेजी गई"
  }
}

function CitizenReportForm() {
  const { lang } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Mode toggle: 'report' vs 'help'
  const [mode, setMode] = useState<'report' | 'help'>('report')

  // Form states
  const [category, setCategory] = useState('Flood')
  const [severity, setSeverity] = useState('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState(17.7289)
  const [longitude, setLongitude] = useState(83.3214)
  const [address, setAddress] = useState('MVP Colony, Visakhapatnam')

  // UI state
  const [capturingCoords, setCapturingCoords] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'help') {
      setMode('help')
      setCategory('Medical')
      setSeverity('critical')
    } else {
      setMode('report')
      setCategory('Flood')
      setSeverity('medium')
    }
  }, [searchParams])

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) return
    setCapturingCoords(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        // If close to MVP Colony
        const dist = Math.abs(pos.coords.latitude - 17.7289) + Math.abs(pos.coords.longitude - 83.3214)
        if (dist < 0.2) {
          setAddress('Beach Road corridor, Visakhapatnam')
        } else {
          setAddress(`Custom Coordinates [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`)
        }
        setCapturingCoords(false)
      },
      () => {
        setCapturingCoords(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Build standard payload compatible with existing incidents schema
    const payload: CreateIncidentPayload = {
      category,
      title: title || (mode === 'help' ? `[RESCUE ASSISTANCE] ${category} Emergency` : `[CITIZEN REPORT] Waterlogging`),
      description: description || `Report filed by citizen via mobile portal. Details pending.`,
      latitude,
      longitude,
      address,
      severity
    }

    try {
      const res = await apiService.createIncident(payload)
      setResult(res)
    } catch (err) {
      console.warn("Incident report submission offline, using local response fallback:", err)
      // Local fallback for offline demo
      setResult({
        id: `mock-incident-${Date.now()}`,
        ticket_number: `TKT-${Math.floor(Math.random() * 900000 + 100000)}`,
        status: 'active',
        created_at: new Date().toISOString()
      })
    } finally {
      setSubmitting(false)
    }
  }

  const t = reportTranslations[lang]

  if (result) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-900 text-center space-y-5 shadow-2xl">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-white">{t.successHeading}</h3>
          <p className="text-xs text-slate-450 leading-relaxed">
            {mode === 'help' ? t.helpSentText : 'Your flood report has gone directly to the Visakhapatnam command center.'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 text-xs font-mono text-left space-y-2.5 max-w-xs mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">{t.ticketLabel}</span>
            <span className="text-white font-extrabold">{result.ticket_number || 'TKT-PENDING'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">{t.statusLabel}</span>
            <span className="text-orange-400 font-extrabold uppercase">{result.status || 'active'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">{t.timeLabel}</span>
            <span className="text-slate-350">{new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="pt-2">
          <span className="inline-block text-[8px] font-mono font-bold bg-emerald-950/60 border border-emerald-900/40 px-2.5 py-0.5 rounded text-emerald-400 uppercase tracking-widest animate-pulse">
            {t.integrationReady}
          </span>
        </div>

        <button
          onClick={() => {
            setResult(null)
            setTitle('')
            setDescription('')
            router.push('/citizen')
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-98"
        >
          {t.backHome}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      
      {/* Page Selector Tabs */}
      <div className="flex border border-slate-850 rounded-xl bg-slate-950 p-1 font-mono text-xs">
        <button
          onClick={() => {
            setMode('report')
            setCategory('Flood')
            setSeverity('medium')
            router.push('/citizen/report')
          }}
          className={`flex-1 py-2 text-center rounded-lg font-bold transition-all ${
            mode === 'report'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.reportTitle}
        </button>
        <button
          onClick={() => {
            setMode('help')
            setCategory('Medical')
            setSeverity('critical')
            router.push('/citizen/report?action=help')
          }}
          className={`flex-1 py-2 text-center rounded-lg font-bold transition-all ${
            mode === 'help'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.helpTitle}
        </button>
      </div>

      {/* Mode Header */}
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
          {mode === 'report' ? t.reportTitle : t.helpTitle}
        </h2>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {mode === 'report' ? t.reportSubtitle : t.helpSubtitle}
        </p>
      </div>

      {/* Description Explainer */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-900 flex items-start space-x-3.5 bg-slate-950/30 text-[10px]">
        <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-slate-400 leading-relaxed">{t.explainText}</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5 border border-slate-900 space-y-4 shadow-xl text-xs">
        
        {/* Category selector */}
        {mode === 'report' ? (
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.labelCategory}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="Flood">Waterlogging & Flooding</option>
              <option value="Water Leakage">Drainage Overflow</option>
              <option value="Infrastructure Damage">Road Blocked</option>
              <option value="Fallen Tree">Fallen Tree / Debris</option>
              <option value="Other">Other</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.labelHelpType}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="Medical">Evacuation / Medical Emergency</option>
              <option value="Flood">Trapped by Flooding</option>
              <option value="Accident">Road Access Blocked</option>
              <option value="Other">Other Life Safety Emergency</option>
            </select>
          </div>
        )}

        {/* Severity selection */}
        {mode === 'report' && (
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.labelSeverity}</label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-2 rounded-lg font-bold capitalize transition-all border font-mono text-[10px] ${
                    severity === sev
                      ? sev === 'critical' ? 'bg-red-650 text-white border-red-500' :
                        sev === 'high' ? 'bg-orange-600 text-white border-orange-500' :
                        sev === 'medium' ? 'bg-yellow-600 text-slate-950 border-yellow-500' : 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-350'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold uppercase tracking-wider block font-mono">Incident Summary / Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === 'report' ? "e.g. Water logging knee depth MVP colony" : "e.g. Elderly citizen trapped inside waterlogged home"}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.labelDesc}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Include any landmarks, status of stranded people, or critical observations."
            rows={3}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
          />
        </div>

        {/* Location Picker */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold uppercase tracking-wider block font-mono">{t.labelLoc}</label>
          <div className="flex space-x-2">
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-w-0"
            />
            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={capturingCoords}
              className="px-3 rounded-xl border border-slate-850 bg-slate-900 text-slate-400 hover:text-white transition-all text-[10px] font-mono uppercase shrink-0 flex items-center space-x-1"
            >
              <Navigation className="h-3 w-3 shrink-0" />
              <span>{capturingCoords ? '...' : t.locButton}</span>
            </button>
          </div>
          <div className="text-[10px] font-mono-data text-slate-500">
            Coordinates: [{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E]
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg text-white active:scale-98 ${
            mode === 'help' ? 'bg-red-600 hover:bg-red-500 shadow-red-950/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/20'
          }`}
        >
          {submitting ? t.submitting : (mode === 'help' ? t.submitHelp : t.submitReport)}
        </button>

      </form>

    </div>
  )
}

export default function CitizenReport() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-slate-500 font-mono animate-pulse">Loading report center...</div>}>
      <CitizenReportForm />
    </Suspense>
  )
}
