'use client'

import React from 'react'
import { ActivityIcon, CheckCircle } from 'lucide-react'

export default function CommandWorkflowWidget() {
  const steps = [
    { label: 'Citizen Report', status: 'completed' },
    { label: 'AI Triage', status: 'completed' },
    { label: 'Weather Feed', status: 'completed' },
    { label: 'Traffic Route', status: 'completed' },
    { label: 'Human Signoff', status: 'active' },
    { label: 'Force Dispatch', status: 'pending' }
  ]

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-blue-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">Incident Response Workflow</h4>
        </div>
        <span className="text-[10px] text-amber-400 font-mono-data bg-amber-950 border border-amber-900/40 px-2 py-0.5 rounded animate-pulse">
          Pending Approval
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        {steps.map((st, i) => (
          <React.Fragment key={st.label}>
            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono-data ${
                st.status === 'completed' 
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                  : st.status === 'active'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-400 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                {st.status === 'completed' ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-bold ${
                st.status === 'completed' 
                  ? 'text-slate-300'
                  : st.status === 'active'
                  ? 'text-amber-400 font-extrabold'
                  : 'text-slate-500'
              }`}>{st.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden md:block h-0.5 w-8 border-t-2 border-dashed ${
                st.status === 'completed' ? 'border-emerald-600/50' : 'border-slate-800'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
