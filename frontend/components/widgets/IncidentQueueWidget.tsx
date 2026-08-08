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
  const [incidents, setIncidents] = useState<IncidentItem[]>(visakhapatnamIncidentsData)
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
          const mapped: IncidentItem[] = backendIncidents.map((b) => ({
            id: b.id,
            category: b.category as any,
            title: b.title,
            location: b.address || `${b.latitude.toFixed(4)}° N, ${b.longitude.toFixed(4)}° E`,
            coordinates: [b.latitude, b.longitude],
            severity: b.severity as any,
            status: b.status as any,
            timestamp: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timeHour: new Date(b.created_at).getHours(),
            description: b.description
          }))
          setIncidents(mapped)
          setIsLive(true)
        } else {
          // Fallback to structured mock data if DB has 0 items
          const filteredMock = visakhapatnamIncidentsData.filter((inc) => {
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

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-white tracking-wide">Live Incident Queue</h4>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono-data uppercase tracking-wider ${
              isLive 
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400' 
                : 'bg-blue-950/40 border border-blue-900/30 text-blue-400'
            }`}>
              {isLive ? '● Live API Feed' : 'Mock Datasets'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{incidents.length} active incidents logged</p>
        </div>

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
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-xs text-slate-500 font-mono-data">Syncing incident queue...</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No active incidents matching category filter.
            </div>
          ) : (
            incidents.map((inc) => (
              <AlertCard
                key={inc.id}
                category={inc.category}
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
