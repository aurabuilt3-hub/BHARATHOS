'use client'

import React, { useState } from 'react'
import { Clock } from 'lucide-react'

interface TimeMachineSliderProps {
  onTimeChange?: (time: string) => void
}

export default function TimeMachineSlider({ onTimeChange }: TimeMachineSliderProps) {
  const [selectedTime, setSelectedTime] = useState<string>('09:00')

  const times = ['08:00', '09:00', '10:00', '11:00', '12:00']

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = times[parseInt(e.target.value)]
    setSelectedTime(val)
    if (onTimeChange) onTimeChange(val)
  }

  return (
    <div className="flex items-center space-x-4 bg-[#050816] border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
      <div className="flex items-center space-x-1.5 text-blue-400 font-bold font-mono-data shrink-0 select-none">
        <Clock className="h-4 w-4" />
        <span>TIME MACHINE: {selectedTime}</span>
      </div>

      <input
        type="range"
        min="0"
        max={times.length - 1}
        step="1"
        defaultValue="1"
        onChange={handleSliderChange}
        className="w-24 md:w-32 accent-blue-500 cursor-pointer"
        aria-label="Time machine playback slider"
      />
    </div>
  )
}
