'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Shield,
  LifeBuoy,
  CheckCircle2,
  ChevronRight,
  User,
  RefreshCw,
  Info,
  Navigation
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import { CitizenIncident, AppLanguage, EmergencyCategory } from '../../../types/citizen'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
  isAiAssisted?: boolean
  hasEvacuationLink?: boolean
}

interface AiSummaryCardData {
  category: EmergencyCategory
  priority: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  recommendedDepts: string[]
  suggestedAction: string
}

const aiTranslations = {
  en: {
    title: "AI EMERGENCY ASSISTANT",
    subtitle: "Conversational Emergency Triage & Real-Time Incident Summary",
    aiTag: "AI ASSISTED — NOT OFFICIAL AUTHORITY PROTOCOL",
    welcomeMessage: "Hello, I am the BHARATOS AI Emergency Assistant. Tell me what is happening around you. I will analyze the situation, provide immediate safety guidance, and draft an emergency summary.",
    inputPlaceholder: "Describe your emergency situation here...",
    sendBtn: "Send Message",
    quickPrompt1: "Medical emergency: chest pain & breathing difficulty",
    quickPrompt2: "Heavy waterlogging near Beach Road corridor",
    quickPrompt3: "Where should I go to evacuate safely?",
    summaryTitle: "Generated Incident Summary Card",
    categoryLabel: "Category:",
    priorityLabel: "AI Priority:",
    deptsLabel: "Recommended Depts:",
    submitFromSummaryBtn: "Submit Emergency Report From AI Summary",
    disclaimer: "BHARATOS AI provides automated triage assistance. Official authority protocols will supersede AI advice upon dispatch arrival."
  },
  te: {
    title: "AI అత్యవసర అసిస్టెంట్",
    subtitle: "సంభాషణ అత్యవసర వర్గీకరణ & ఇన్సిడెంట్ సారాంశం",
    aiTag: "AI ప్రాసెస్ చేయబడింది — అధికారిక వ్యవస్థ కాదు",
    welcomeMessage: "నమస్కారం, నేను భారత్ఓఎస్ AI అత్యవసర అసిస్టెంట్. పరిస్థితిని వివరించండి.",
    inputPlaceholder: "మీ అత్యవసర పరిస్థితిని ఇక్కడ టైప్ చేయండి...",
    sendBtn: "సందేశం పంపండి",
    quickPrompt1: "మెడికల్ ఎమర్జెన్సీ: గుండె నెప్పి",
    quickPrompt2: "బీచ్ రోడ్డు వద్ద ఎక్కువ నీరు చేరింది",
    quickPrompt3: "నేను సురక్షితంగా ఎక్కడికి తరలిపోవాలి?",
    summaryTitle: "AI రూపొందించిన సారాంశం",
    categoryLabel: "కేటగిరీ:",
    priorityLabel: "ప్రాధాన్యత:",
    deptsLabel: "సిఫార్సు చేయబడిన విభాగాలు:",
    submitFromSummaryBtn: "సారాంశం నుండి నివేదిక సమర్పించండి",
    disclaimer: "AI ఆటోమేటెడ్ సహాయాన్ని అందిస్తుంది."
  },
  hi: {
    title: "एआई आपातकालीन सहायक",
    subtitle: "बातचीत द्वारा आपातकालीन सहायता व सारांश",
    aiTag: "एआई सहायता प्राप्त — आधिकारिक प्रणाली नहीं",
    welcomeMessage: "नमस्ते, मैं भारतओएस एआई आपातकालीन सहायक हूं। अपनी स्थिति बताएं।",
    inputPlaceholder: "अपनी आपातकालीन स्थिति यहाँ लिखें...",
    sendBtn: "संदेश भेजें",
    quickPrompt1: "चिकित्सा आपातकाल: सीने में दर्द",
    quickPrompt2: "समुद्र तट मार्ग के पास जलभराव",
    quickPrompt3: "मुझे सुरक्षित निकासी के लिए कहाँ जाना चाहिए?",
    summaryTitle: "एआई जनरेटेड रिपोर्ट सारांश",
    categoryLabel: "श्रेणी:",
    priorityLabel: "प्राथमिकता:",
    deptsLabel: "अनुशंसित विभाग:",
    submitFromSummaryBtn: "एआई सारांश से रिपोर्ट भेजें",
    disclaimer: "एआई केवल सहायता प्रदान करता है।"
  }
}

export default function AiAssistantPage() {
  const router = useRouter()
  const { profile, activeLocation, addIncident } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = aiTranslations[lang as 'en' | 'te' | 'hi'] || aiTranslations.en

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: t.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiAssisted: true
    }
  ])
  const [summaryCard, setSummaryCard] = useState<AiSummaryCardData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isProcessing) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsProcessing(true)

    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_description: query,
          session_id: `triage-${Date.now()}`
        })
      })

      const data = await res.json()

      const isEvacuationQuery = query.toLowerCase().includes('evacuat') ||
                                query.toLowerCase().includes('where should i go') ||
                                query.toLowerCase().includes('fire') ||
                                query.toLowerCase().includes('flood')

      const aiText = data.summary
        ? `${data.summary} (${data.next_steps ? data.next_steps.join('. ') : 'Stay calm.'})`
        : `I have analyzed your input: "${query}". Please stay in a safe location.`

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: isEvacuationQuery
          ? `${aiText} I can help you find available evacuation information using our hazard-aware routing engine.`
          : aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiAssisted: true,
        hasEvacuationLink: isEvacuationQuery
      }

      setMessages(prev => [...prev, aiMsg])

      setSummaryCard({
        category: (data.category?.toLowerCase() as EmergencyCategory) || 'general',
        priority: (data.priority?.toLowerCase() as 'low' | 'medium' | 'high' | 'critical') || 'high',
        summary: data.summary || query,
        recommendedDepts: data.recommended_departments || ['Police', 'Medical Triage'],
        suggestedAction: data.next_steps?.[0] || 'Keep your phone line clear for dispatch check-ins.'
      })
    } catch (err) {
      console.warn('[AI Assistant] FastAPI triage call failed, using client triage:', err)

      const isEvacuationQuery = query.toLowerCase().includes('evacuat') ||
                                query.toLowerCase().includes('where should i go') ||
                                query.toLowerCase().includes('fire') ||
                                query.toLowerCase().includes('flood')

      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `AI Triage: Received emergency detail "${query}". I have categorized this with High Priority. Stay in a safe area. ${
          isEvacuationQuery ? 'I can help you find available evacuation information.' : ''
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiAssisted: true,
        hasEvacuationLink: isEvacuationQuery
      }
      setMessages(prev => [...prev, fallbackMsg])

      setSummaryCard({
        category: query.toLowerCase().includes('fire') ? 'fire' : 'general',
        priority: 'high',
        summary: `Citizen reported: ${query}`,
        recommendedDepts: ['Disaster Response', 'Emergency Triage'],
        suggestedAction: 'Avoid low-lying or fire-affected zones immediately.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitFromSummary = async () => {
    if (!summaryCard) return

    const newIncident: CitizenIncident = {
      id: `INC-AI-${Date.now()}`,
      category: summaryCard.category,
      severity: summaryCard.priority,
      title: `AI Assistant Report: ${summaryCard.category.toUpperCase()}`,
      description: summaryCard.summary,
      location: activeLocation,
      affectedCount: 1,
      mediaUrls: {},
      stage: 'ai_analyzed',
      dataFreshness: 'live',
      dataSource: 'AI ASSISTED',
      syncState: 'SYNCED',
      timeline: [
        { stage: 'received', title: 'Request Initiated via AI Assistant', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { stage: 'ai_analyzed', title: 'Triage Summary Generated', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: summaryCard.summary }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addIncident(newIncident)
    await IndexedDbService.saveIncident(newIncident)
    router.push('/citizen/incidents')
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-sky-400 uppercase tracking-widest">
          <Bot className="w-3.5 h-3.5" />
          <span>CONVERSATIONAL TRIAGE SURFACES</span>
        </div>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      {/* Mandatory AI Attribution Tag */}
      <div className="px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/60 text-[10px] font-mono text-purple-300 font-bold flex items-center justify-between">
        <span className="flex items-center">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 mr-1.5 shrink-0" />
          {t.aiTag}
        </span>
      </div>

      {/* Quick Prompt Pill Buttons */}
      <div className="space-y-1.5 font-mono text-[10.5px]">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">TAP QUICK PROMPT:</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend(t.quickPrompt1)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-left"
          >
            💬 {t.quickPrompt1}
          </button>

          <button
            onClick={() => handleSend(t.quickPrompt2)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-left"
          >
            🌊 {t.quickPrompt2}
          </button>

          <button
            onClick={() => handleSend(t.quickPrompt3)}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-900/80 bg-emerald-950/40 text-emerald-300 hover:text-white font-bold transition-all text-left"
          >
            🏃 {t.quickPrompt3}
          </button>
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="h-[320px] rounded-2xl border border-slate-900 bg-[#060a13] p-4 overflow-y-auto space-y-3 font-mono text-xs no-scrollbar shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1 text-[9px] text-slate-500">
              <span>{msg.sender === 'user' ? 'You' : 'BHARATOS AI'}</span>
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none space-y-2'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>

              {msg.hasEvacuationLink && (
                <div className="pt-2 border-t border-slate-800">
                  <Link
                    href="/citizen/safe-exit"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-md"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>FIND SAFE EXIT</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.inputPlaceholder}
          className="w-full bg-[#060a13] border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={isProcessing}
          className="absolute right-2 top-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Generated AI Incident Summary Card */}
      {summaryCard && (
        <div className="rounded-2xl border border-sky-900/80 bg-[#040e1c] p-4 space-y-3 font-mono text-xs shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-sky-900/60 pb-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-sky-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.summaryTitle}</span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 uppercase">
              {summaryCard.priority} PRIORITY
            </span>
          </div>

          <p className="text-white font-bold text-xs">{summaryCard.summary}</p>

          <div className="space-y-1 text-[10.5px] text-slate-300">
            <p><strong>{t.deptsLabel}</strong> {summaryCard.recommendedDepts.join(', ')}</p>
            <p><strong>Suggested Safety Action:</strong> {summaryCard.suggestedAction}</p>
          </div>

          <button
            onClick={handleSubmitFromSummary}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.submitFromSummaryBtn}</span>
          </button>
        </div>
      )}

      {/* Operational Disclaimer */}
      <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-[10px] font-mono text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t.disclaimer}</p>
      </div>

    </div>
  )
}
