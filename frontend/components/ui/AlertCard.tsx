import React from 'react'
import { AlertIcon, MapPinIcon } from '../icons'

interface AlertCardProps {
  category: string
  title: string
  location: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  onClick?: () => void
  status?: string
}

export default function AlertCard({
  category,
  title,
  location,
  severity,
  timestamp,
  onClick,
  status = 'active'
}: AlertCardProps) {
  
  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'border-l-red-500 bg-red-950/10 hover:border-red-500/50'
      case 'high':
        return 'border-l-orange-500 bg-orange-950/10 hover:border-orange-500/50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-950/10 hover:border-yellow-500/50'
      case 'low':
        return 'border-l-emerald-500 bg-emerald-950/10 hover:border-emerald-500/50'
      default:
        return 'border-l-slate-500 bg-slate-950/10'
    }
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'text-red-400 bg-red-950/40 border-red-900/30'
      case 'high':
        return 'text-orange-400 bg-orange-950/40 border-orange-900/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30'
      case 'low':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800'
    }
  }

  return (
    <div 
      onClick={onClick}
      className={`glass-panel border-l-4 rounded-2xl p-4 flex flex-col space-y-3 cursor-pointer transition-all duration-300 ${
        getSeverityStyle(severity)
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {category}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full uppercase tracking-wider font-mono-data ${
          getSeverityBadge(severity)
        }`}>
          {severity}
        </span>
      </div>

      <div>
        <h5 className="text-sm font-bold text-white tracking-wide line-clamp-1">{title}</h5>
        <div className="flex items-center space-x-1 mt-1.5 text-xs text-slate-400">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="line-clamp-1">{location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[10px] text-slate-500 font-mono-data">
        <span>{timestamp}</span>
        <span className="uppercase font-bold tracking-widest text-slate-400">{status}</span>
      </div>
    </div>
  )
}
