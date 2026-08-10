'use client'

import React, { useState, useEffect } from 'react'

interface TimelinePlaybackWidgetProps {
  currentHour: number // 9, 10, 11, 12
  onHourChange: (hour: number) => void
}

export default function TimelinePlaybackWidget({
  currentHour,
  onHourChange
}: TimelinePlaybackWidgetProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const hours = [9, 10, 11, 12]

  useEffect(() => {
    let interval: any = null
    if (isPlaying) {
      interval = setInterval(() => {
        onHourChange(currentHour >= 12 ? 9 : currentHour + 1)
      }, 2500)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentHour, onHourChange])

  const getHourLabel = (h: number) => {
    switch (h) {
      case 9: return '09:00 AM'
      case 10: return '10:00 AM'
      case 11: return '11:00 AM'
      case 12: return '12:00 PM'
      default: return `${h}:00`
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-2xl">
      {/* Play/Pause Controls */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center transition-all shadow-lg ${
            isPlaying
              ? 'bg-amber-600 text-white shadow-amber-900/30 hover:bg-amber-700'
              : 'bg-blue-600 text-white shadow-blue-900/30 hover:bg-blue-700'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play Incident Replay'}
        </button>
        <span className="text-xs font-mono-data text-blue-400 font-bold bg-blue-950/40 border border-blue-900/30 px-3 py-1.5 rounded-xl">
          {getHourLabel(currentHour)}
        </span>
      </div>

      {/* Interactive Time Slider */}
      <div className="flex-1 flex items-center space-x-4">
        <input
          type="range"
          min="9"
          max="12"
          step="1"
          value={currentHour}
          onChange={(e) => {
            setIsPlaying(false)
            onHourChange(parseInt(e.target.value))
          }}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex items-center space-x-2 text-[10px] font-mono-data text-slate-500 shrink-0">
          <span>09:00</span>
          <span>•</span>
          <span>12:00</span>
        </div>
      </div>
    </div>
  )
}
