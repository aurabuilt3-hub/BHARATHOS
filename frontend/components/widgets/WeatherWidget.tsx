'use client'

import React from 'react'
import { WeatherIcon, AlertIcon } from '../icons'
import { visakhapatnamWeatherData } from '../../lib/mock/weather'

interface WeatherWidgetProps {
  loading?: boolean
  error?: string | null
}

export default function WeatherWidget({
  loading = false,
  error = null
}: WeatherWidgetProps) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-48 flex items-center justify-center animate-pulse">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel border-l-4 border-l-red-500 rounded-2xl p-6">
        <span className="text-xs text-red-400 font-semibold">{error}</span>
      </div>
    )
  }

  const data = visakhapatnamWeatherData

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <WeatherIcon className="h-5 w-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">Weather Radar ({data.city})</h4>
        </div>
        <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded font-mono-data">
          {data.temperature}°C
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Condition</span>
          <span className="text-xs font-bold text-white mt-1 block truncate">{data.condition}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Rainfall (24h)</span>
          <span className="text-xs font-bold text-blue-400 mt-1 block font-mono-data">{data.rainfall24h} mm</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Wind Speed</span>
          <span className="text-xs font-bold text-white mt-1 block font-mono-data">{data.windSpeed} km/h</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Air Quality</span>
          <span className="text-xs font-bold text-emerald-400 mt-1 block font-mono-data">{data.airQualityIndex} AQI</span>
        </div>
      </div>

      {data.warningAlert && (
        <div className="rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-3 flex items-center space-x-2 text-xs text-yellow-400">
          <AlertIcon className="h-4 w-4 shrink-0" />
          <span className="text-[11px] leading-tight">{data.warningAlert}</span>
        </div>
      )}
    </div>
  )
}
