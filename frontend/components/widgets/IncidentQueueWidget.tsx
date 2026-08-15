'use client'

import React, { useState, useEffect } from 'react'
import AlertCard from '../ui/AlertCard'
import { visakhapatnamIncidentsData, IncidentItem } from '../../lib/mock/incidents'
import { apiService, BackendIncident } from '../../services/api'

interface IncidentQueueWidgetProps {
  onSelectIncident?: (incident: IncidentItem) => void
}

export default function IncidentQueueWidget({ onSelectIncident }: IncidentQueueWidgetProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'auto' | 'citizen'>('all')
  const [incidents, setIncidents] = useState<(IncidentItem & { citizen_id?: string })[]>(
    visakhapatnamIncidentsData.map((inc, idx) => ({
      ...inc,
      citizen_id: idx % 2 === 0 ? 'mock-citizen-uuid' : undefined
    }))
  )
  const [isLive, setIsLive] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // Fetch live incidents from FastAPI Backend
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    apiService.getIncidents({ category: categoryFilter })
      .then((backendIncidents: BackendIncident[]) => {
        if (!isMounted) return
        if (backendIncidents && backendIncidents.length > 0) {
          const mapped = backendIncidents.map((b) => ({
            id: b.id,
            category: b.category as any,
            title: b.title,
            location: b.address || `${b.latitude.toFixed(4)}° N, ${b.longitude.toFixed(4)}° E`,
            coordinates: [b.latitude, b.longitude] as [number, number],
            severity: b.severity as any,
            status: b.status as any,
            timestamp: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timeHour: new Date(b.created_at).getHours(),
            description: b.description,
            citizen_id: b.citizen_id
          }))
          setIncidents(mapped)
          setIsLive(true)
        } else {
          // Fallback to structured mock data if DB has 0 items
          const filteredMock = visakhapatnamIncidentsData.map((inc, idx) => ({
            ...inc,
            citizen_id: idx % 2 === 0 ? 'mock-citizen-uuid' : undefined
          })).filter((inc) => {
            if (categoryFilter === 'all') return true
            return inc.category.toLowerCase() === categoryFilter.toLowerCase()
          })
          setIncidents(filteredMock)
          setIsLive(false)
        }
      })
      .catch(() => {
        if (!isMounted) return
        setIsLive(false)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [categoryFilter])

  // Filter by source type
  const filteredIncidents = incidents.filter(inc => {
    if (sourceFilter === 'all') return true
    if (sourceFilter === 'auto') return !inc.citizen_id
    if (sourceFilter === 'citizen') return !!inc.citizen_id
    return true
  })

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-3 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-white tracking-wide">Flood & Municipal Incident Queue</h4>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono-data uppercase tracking-wider ${
              isLive 
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400' 
                : 'bg-blue-950/40 border border-blue-900/30 text-blue-400'
            }`}>
              {isLive ? '● Live API Feed' : 'Mock Datasets'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{filteredIncidents.length} incidents resolved / active</p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-[10px]">
            {(['all', 'Flood', 'Fire', 'Accident', 'Medical'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg border font-bold capitalize transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-900/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Source Filter Tabs */}
          <div className="flex border border-slate-850 rounded-lg p-0.5 bg-[#050816] text-[9px] font-mono-data">
            {(['all', 'auto', 'citizen'] as const).map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`flex-1 px-2 py-1 rounded text-center font-bold uppercase transition-all ${
                  sourceFilter === src
                    ? 'bg-slate-850 text-sky-400 border border-slate-800'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {src === 'all' ? 'All Feeds' : src === 'auto' ? 'Auto-Detected' : 'Citizen Reports'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-xs text-slate-500 font-mono-data">Syncing incident queue...</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No incidents matching active filters.
            </div>
          ) : (
            filteredIncidents.map((inc) => (
              <AlertCard
                key={inc.id}
                category={`${inc.category} • ${inc.citizen_id ? 'Citizen Report' : 'Auto-Detected'}`}
                title={inc.title}
                location={inc.location}
                severity={inc.severity}
                timestamp={inc.timestamp}
                status={inc.status}
                onClick={() => onSelectIncident && onSelectIncident(inc)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
