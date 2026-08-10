import React from 'react'

interface MapCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  overlays?: React.ReactNode // Floating buttons/controls over the map
  legend?: React.ReactNode
}

export default function MapCard({
  title,
  subtitle,
  children,
  overlays,
  legend
}: MapCardProps) {
  return (
    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden relative min-h-[480px] w-full">
      {/* Map Header Panel */}
      <div className="absolute top-4 left-4 z-[99] bg-[#020617]/90 border border-slate-800 rounded-xl px-4 py-3 backdrop-blur-md max-w-xs shadow-2xl">
        <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Floating Control Overlays */}
      {overlays && (
        <div className="absolute top-4 right-4 z-[99] flex flex-col space-y-2">
          {overlays}
        </div>
      )}

      {/* Legend Overlay */}
      {legend && (
        <div className="absolute bottom-4 left-4 z-[99]">
          {legend}
        </div>
      )}

      {/* Map Canvas Component */}
      <div className="flex-1 w-full h-full relative z-[10]">
        {children}
      </div>
    </div>
  )
}
