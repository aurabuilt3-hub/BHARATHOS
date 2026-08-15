'use client'

import React, { useState, useEffect } from 'react'
import { WeatherIcon, AlertIcon } from '../icons'
import { apiService, DashboardOverview } from '../../services/api'

interface WeatherWidgetProps {
  data?: DashboardOverview | null
  loading?: boolean
  error?: string | null
}

export default function WeatherWidget({
  data: propData,
  loading: propLoading = false,
  error: propError = null
}: WeatherWidgetProps) {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(propLoading)
  const [error, setError] = useState<string | null>(propError)

  useEffect(() => {
    if (propData) {
      setData(propData)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    apiService.getDashboardOverview()
      .then((overview) => {
        if (isMounted) {
          setData(overview)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch weather data.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [propData])

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-48 flex flex-col items-center justify-center animate-pulse">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-2"></div>
        <span className="text-xs text-slate-500 font-mono-data">Loading weather digital twin...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel border-l-4 border-l-red-500 rounded-2xl p-6 flex flex-col justify-between h-48">
        <div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest block font-mono">Telemetry Error</span>
          <span className="text-xs text-slate-450 mt-1 block">{error}</span>
        </div>
      </div>
    )
  }

  const weather = data?.weather
  const aqi = data?.air_quality

  // Helper to decode weather code to condition string
  const getWeatherCondition = (code?: number) => {
    if (code === undefined || code === null) return 'N/A'
    if (code === 0) return 'Clear Sky'
    if (code >= 1 && code <= 3) return 'Partly Cloudy'
    if (code >= 45 && code <= 48) return 'Foggy'
    if (code >= 51 && code <= 55) return 'Light Drizzle'
    if (code >= 61 && code <= 65) return 'Rainy'
    if (code >= 71 && code <= 77) return 'Snowy'
    if (code >= 80 && code <= 82) return 'Rain Showers'
    if (code >= 95 && code <= 99) return 'Thunderstorm'
    return `Code ${code}`
  }

  // Format freshness display
  const formatTimeSince = (isoStr?: string) => {
    if (!isoStr) return 'N/A'
    try {
      const diffMs = Date.now() - new Date(isoStr).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHrs = Math.floor(diffMins / 60)
      return `${diffHrs}h ago`
    } catch {
      return 'N/A'
    }
  }

  const getFreshnessColor = (freshness?: string) => {
    if (freshness === 'FRESH') return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40'
    if (freshness === 'STALE') return 'text-yellow-400 bg-yellow-950/30 border-yellow-900/40'
    if (freshness === 'EXPIRED') return 'text-red-400 bg-red-950/30 border-red-900/40'
    return 'text-slate-400 bg-slate-900/40 border-slate-800'
  }

  const getProvenanceBadge = (type?: string) => {
    if (type === 'OFFICIAL_PUBLIC') return 'Official Public'
    if (type === 'VERIFIED_PUBLIC') return 'Verified Public'
    if (type === 'OPEN_DATA') return 'Open Data'
    if (type === 'SIMULATED') return 'Simulated'
    return 'N/A'
  }

  const tempDisplay = weather?.temperature !== undefined ? `${weather.temperature}` : 'N/A'
  const conditionDisplay = weather?.weather_code !== undefined ? getWeatherCondition(weather.weather_code) : 'N/A'
  const precipitationDisplay = weather?.precipitation !== undefined ? `${weather.precipitation}` : 'N/A'
  const windDisplay = weather?.wind_speed !== undefined ? `${weather.wind_speed}` : 'N/A'
  const aqiDisplay = aqi?.aqi !== undefined ? `${aqi.aqi}` : 'N/A'

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <WeatherIcon className="h-5 w-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">Weather & Air Quality Radar (Visakhapatnam)</h4>
        </div>
        <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded font-mono-data">
          {tempDisplay !== 'N/A' ? `${tempDisplay}°C` : 'N/A'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Condition</span>
          <span className="text-xs font-bold text-white mt-1 block truncate">{conditionDisplay}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Rainfall</span>
          <span className="text-xs font-bold text-blue-400 mt-1 block font-mono-data">{precipitationDisplay} mm</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Wind Speed</span>
          <span className="text-xs font-bold text-white mt-1 block font-mono-data">{windDisplay} km/h</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Air Quality</span>
          <span className="text-xs font-bold text-emerald-400 mt-1 block font-mono-data">{aqiDisplay} AQI</span>
        </div>
      </div>

      {/* Freshness & Provenance Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[9px] font-mono-data text-slate-500">
        <div className="flex items-center space-x-2">
          {weather?.freshness && (
            <span className={`px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${getFreshnessColor(weather.freshness)}`}>
              Weather {weather.freshness}
            </span>
          )}
          {weather?.observed_at && (
            <span>Updated {formatTimeSince(weather.observed_at)}</span>
          )}
        </div>
        <div className="flex items-center space-x-1.5">
          {weather?.source_type && (
            <span className="px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-350 font-bold uppercase tracking-wider">
              {getProvenanceBadge(weather.source_type)}: {weather.source_name || 'Open-Meteo'}
            </span>
          )}
          {weather?.source_url && (
            <a href={weather.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              [source link]
            </a>
          )}
        </div>
      </div>

      {weather?.weather_code !== undefined && weather.weather_code >= 95 && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3 flex items-center space-x-2 text-xs text-red-400">
          <AlertIcon className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="text-[11px] leading-tight font-bold">Severe Warning: Thunderstorm active in municipal boundaries.</span>
        </div>
      )}
    </div>
  )
}
