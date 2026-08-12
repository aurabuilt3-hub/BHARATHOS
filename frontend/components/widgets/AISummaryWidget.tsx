'use client'

import React, { useState, useEffect } from 'react'
import { ActivityIcon } from '../icons'
import { apiService } from '../../services/api'

export default function AISummaryWidget() {
  const [data, setData] = useState<{
    summary: string
    confidence: number
    reasoning: string
    priority: string
    recommended_departments: string[]
    next_steps: string[]
  }>({
    summary: 'Divert traffic off NH16 beach bypass corridor and deploy pump unit M-12 to Mudasarlova Spillway.',
    confidence: 94.2,
    reasoning: 'Drain gauge reading exceeds critical safety limit. RAG SOP Guidelines recommend pump pre-positioning.',
    priority: 'high',
    recommended_departments: ['Municipal Operations', 'Traffic Control'],
    next_steps: ['Deploy water pumps', 'Establish police barricades']
  })

  useEffect(() => {
    apiService.getAITriage('Waterlogging on Beach Road MVP Colony Sector 4')
      .then((res) => {
        if (res && res.summary) {
          setData({
            summary: res.summary,
            confidence: res.confidence,
            reasoning: res.reasoning,
            priority: res.priority || 'medium',
            recommended_departments: res.recommended_departments || [],
            next_steps: res.next_steps || []
          })
        }
      })
      .catch((err) => {
        console.warn("AI Triage query offline, using local cached recommendations:", err)
      })
  }, [])

  return (
    <div className="glass-panel border-l-4 border-l-purple-500 rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-purple-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">Multi-Agent AI Recommendation Plan</h4>
        </div>
        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded font-mono">
          Advisory Mode
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Plan</span>
          <p className="text-xs font-bold text-white mt-1 leading-relaxed">{data.summary}</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block font-mono">AI Reasoning</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{data.reasoning}</p>
        </div>

        {data.next_steps.length > 0 && (
          <div>
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block font-mono">Next Steps</span>
            <ul className="list-disc pl-4 text-[11px] text-slate-400 mt-1 space-y-0.5">
              {data.next_steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="rounded-xl border border-slate-850 bg-[#050816] p-2.5 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase block font-mono">Confidence</span>
            <span className="text-xs font-bold text-purple-400 mt-0.5 block font-mono">{data.confidence}%</span>
          </div>
          <div className="rounded-xl border border-slate-850 bg-[#050816] p-2.5 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase block font-mono">Priority</span>
            <span className="text-xs font-bold text-red-400 mt-0.5 block font-mono uppercase">{data.priority}</span>
          </div>
          <div className="rounded-xl border border-slate-850 bg-[#050816] p-2.5 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase block font-mono">Routing</span>
            <span className="text-[10px] font-bold text-blue-450 mt-0.5 block font-mono truncate" title={data.recommended_departments.join(', ')}>
              {data.recommended_departments[0] || 'NEOC'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
