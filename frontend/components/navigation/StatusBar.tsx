'use client'

import React from 'react'

export default function StatusBar() {
  return (
    <div className="h-6 bg-[#030712] border-t border-slate-900 px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono-data select-none z-[50] relative shrink-0">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-400 font-bold">GRID STATUS: NORMAL</span>
        </span>
        <span>•</span>
        <span>SCADA Nodes: 98 Online</span>
        <span>•</span>
        <span>Active Terminals: 14 Connected</span>
      </div>

      <div className="flex items-center space-x-4">
        <span>Latency: <span className="text-blue-400 font-bold">1.2ms</span></span>
        <span>•</span>
        <span>SCADA Security: <span className="text-purple-400 font-bold">AES-256</span></span>
      </div>
    </div>
  )
}
