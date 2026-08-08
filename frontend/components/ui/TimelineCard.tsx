import React from 'react'
import { TimelineIcon, SuccessIcon, ErrorIcon, AlertIcon, HelpIcon } from '../icons'

interface TimelineEvent {
  title: string
  description: string
  timestamp: string
  type?: 'success' | 'warning' | 'info' | 'error'
}

interface TimelineCardProps {
  title: string
  events: TimelineEvent[]
}

export default function TimelineCard({
  title,
  events
}: TimelineCardProps) {
  
  const getEventIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <SuccessIcon className="h-4 w-4 text-emerald-400" />
      case 'error':
        return <ErrorIcon className="h-4 w-4 text-red-400" />
      case 'warning':
        return <AlertIcon className="h-4 w-4 text-orange-400" />
      case 'info':
      default:
        return <TimelineIcon className="h-4 w-4 text-blue-400" />
    }
  }

  const getEventBulletBg = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-950/80 border-emerald-900'
      case 'error':
        return 'bg-red-950/80 border-red-900'
      case 'warning':
        return 'bg-orange-950/80 border-orange-900'
      case 'info':
      default:
        return 'bg-blue-950/80 border-blue-900'
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col space-y-5">
      <h4 className="text-base font-bold text-white tracking-tight border-b border-slate-900 pb-3">{title}</h4>
      
      <div className="relative pl-6 border-l border-slate-800 space-y-6">
        {events.length === 0 ? (
          <div className="text-xs text-slate-500 py-2">No timeline logs recorded yet.</div>
        ) : (
          events.map((evt, idx) => (
            <div key={idx} className="relative group">
              {/* Bullet node on timeline thread */}
              <div className={`absolute -left-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                getEventBulletBg(evt.type)
              }`}>
                {getEventIcon(evt.type)}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-mono-data block">
                  {evt.timestamp}
                </span>
                <h5 className="text-xs font-bold text-white tracking-wide mt-1">
                  {evt.title}
                </h5>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed mt-0.5">
                  {evt.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
