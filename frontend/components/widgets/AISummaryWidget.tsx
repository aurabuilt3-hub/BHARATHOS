'use client'

import React, { useState, useEffect } from 'react'
import { ActivityIcon } from '../icons'
import { apiService } from '../../services/api'

export default function AISummaryWidget() {
  const [data, setData] = useState<{
    summary: string
    confidence: number
    reasoning: string
    model: string
  }>({
    summary: 'Divert traffic off NH16 beach bypass corridor and deploy pump unit M-12 to Mudasarlova Spillway.',
    confidence: 94.2,
    reasoning: 'Drain gauge reading exceeds critical safety limit. RAG SOP Guidelines recommend pump pre-positioning.',
    model: 'Gemini 2.5 Pro (LangGraph Graph Orchestrated)'
  })

  useEffect(() => {
    apiService.getAITriage('Waterlogging on Beach Road MVP Colony Sector 4')
      .then((res) => {
        if (res && res.summary) {
          setData({
            summary: res.summary,
            confidence: res.confidence,
            reasoning: res.reasoning,
            model: res.model
          })
        }
      })
  }, [])

  return (
    <div className="glass-panel border-l-4 border-l-blue-500 rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-blue-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">Multi-Agent AI Recommendation Plan</h4>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-mono-data">
          Human Approval Mandatory
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Plan</span>
          <p className="text-xs font-bold text-white mt-1 leading-relaxed">{data.summary}</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Reasoning & Evidence</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{data.reasoning}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl border border-slate-800 bg-[#050816] p-2.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Agent Confidence</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block font-mono-data">{data.confidence}%</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#050816] p-2.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Orchestration Graph</span>
            <span className="text-[11px] font-bold text-blue-400 mt-0.5 block font-mono-data truncate">{data.model}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
