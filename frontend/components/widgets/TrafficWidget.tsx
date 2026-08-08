'use client'

import React from 'react'
import { TrafficIcon } from '../icons'
import { visakhapatnamTrafficData } from '../../lib/mock/traffic'

export default function TrafficWidget() {
  const corridors = visakhapatnamTrafficData

  const getStatusBadge = (lvl: string) => {
    switch (lvl) {
      case 'blocked': return 'text-red-400 bg-red-950/40 border-red-900/30'
      case 'heavy': return 'text-orange-400 bg-orange-950/40 border-orange-900/30'
      case 'moderate': return 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30'
      case 'free': default: return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <TrafficIcon className="h-5 w-5 text-orange-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">Key Traffic Corridors</h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono-data">Live Feed</span>
      </div>

      <div className="space-y-2.5">
        {corridors.map((c) => (
          <div key={c.id} className="p-3 rounded-xl border border-slate-850 bg-[#050816] flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white line-clamp-1">{c.roadName}</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono-data">Avg Speed: {c.avgSpeedKmh} km/h</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono-data ${getStatusBadge(c.congestionLevel)}`}>
              {c.congestionLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
