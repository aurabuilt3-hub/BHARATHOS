'use client'

import React, { useState, useEffect } from 'react'
import { HealthIcon, PoliceIcon, FireIcon } from '../icons'
import { apiService, BackendResource } from '../../services/api'

interface ResourceWidgetProps {
  resources?: BackendResource[] | null
  loading?: boolean
  error?: string | null
}

export default function ResourceWidget({
  resources: propResources,
  loading: propLoading = false,
  error: propError = null
}: ResourceWidgetProps) {
  const [resources, setResources] = useState<BackendResource[]>([])
  const [loading, setLoading] = useState(propLoading)
  const [error, setError] = useState<string | null>(propError)

  useEffect(() => {
    if (propResources) {
      setResources(propResources)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    apiService.getResources({ limit: 200 })
      .then((res) => {
        if (isMounted) {
          setResources(res.items || [])
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch resource counts.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [propResources])

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-5 h-40 flex items-center justify-center animate-pulse">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  const totalAmbulances = resources.filter(r => r.type === 'ambulance' && r.status === 'available').length
  const totalPolice = resources.filter(r => r.type === 'patrol_car' && r.status === 'available').length
  const totalFire = resources.filter(r => r.type === 'fire_truck' && r.status === 'available').length

  const hasSimulated = resources.some(r => r.name.includes('[SIMULATED]') || r.name.includes('Simulated'))

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h4 className="text-sm font-bold text-white tracking-wide">Public Safety Assets Summary</h4>
        <span className="text-[10px] text-emerald-400 font-mono-data font-bold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded uppercase tracking-wider">
          {hasSimulated ? 'Simulated & Real' : 'Active Fleet'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <HealthIcon className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Ambulances</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono-data">{totalAmbulances}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <PoliceIcon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Police Units</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono-data">{totalPolice}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <FireIcon className="h-5 w-5 text-red-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Fire Tenders</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono-data">{totalFire}</span>
        </div>
      </div>

      {error && (
        <span className="text-[10px] text-red-400 font-mono block text-center mt-1">{error}</span>
      )}
    </div>
  )
}
