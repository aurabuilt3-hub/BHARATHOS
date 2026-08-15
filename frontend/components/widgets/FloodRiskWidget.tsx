'use client'

import React from 'react'
import { Activity, ShieldAlert } from 'lucide-react'

export default function FloodRiskWidget() {
  const factors = [
    { name: 'Rainfall Intensity', value: '48 mm/hr', status: 'critical', desc: 'Exceeds soil absorption limit' },
    { name: 'Runoff Infiltration', value: '18% Capacity', status: 'high', desc: 'High land surface saturation' },
    { name: 'Drainage Pipe Stress', value: '78% Volumetric', status: 'high', desc: 'Backpressure in storm mains' },
    { name: 'Tidal Backflow Risk', value: 'Active Sea Swell', status: 'medium', desc: 'Outfall gates locked' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 font-mono-data'
      case 'high': return 'text-orange-400 font-mono-data'
      case 'medium': return 'text-yellow-400 font-mono-data'
      default: return 'text-emerald-400 font-mono-data'
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-sky-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">Flood Risk Engine</h4>
        </div>
        <span className="text-[10px] text-sky-400 bg-sky-950/60 border border-sky-900/40 px-2 py-0.5 rounded font-mono uppercase">
          DEMO SCENARIO
        </span>
      </div>

      <div className="rounded-xl border border-red-950 bg-red-950/10 p-3 flex items-start space-x-2.5">
        <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest block font-mono">Prediction Event</span>
          <p className="text-xs font-bold text-red-200 mt-0.5 leading-relaxed">
            Waterlogging Warning issued for Beach Road MVP corridor. Confidence: 92.4%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Contributing Hydrology Factors</span>
        {factors.map((f, idx) => (
          <div key={idx} className="p-2.5 rounded-xl border border-slate-850 bg-[#050816] flex items-center justify-between text-xs">
            <div>
              <h5 className="font-bold text-white leading-none">{f.name}</h5>
              <span className="text-[10px] text-slate-500 mt-1 block">{f.desc}</span>
            </div>
            <div className="text-right">
              <span className={`font-bold block ${getStatusColor(f.status)}`}>{f.value}</span>
              <span className="text-[9px] text-slate-500 uppercase font-mono-data font-semibold">{f.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
