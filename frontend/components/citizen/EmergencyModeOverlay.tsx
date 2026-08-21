'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldAlert, Navigation, ChevronRight, X, MapPin, AlertTriangle } from 'lucide-react'
import { useCitizenStore } from '../../store/useCitizenStore'

export default function EmergencyModeOverlay() {
  const { emergencyModeActive, setEmergencyMode, myIncidents, activeLocation, networkState } = useCitizenStore()
  if (!emergencyModeActive) return null

  const activeInc = myIncidents.find(i => i.stage !== 'resolved') || myIncidents[0]

  return (
    <div className="fixed inset-x-0 top-12 z-40 bg-red-950/95 border-b-2 border-red-600 px-4 py-3 text-white shadow-2xl backdrop-blur-xl animate-pulse font-mono text-xs">
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-black uppercase tracking-wider block text-red-200 text-xs">
                1. IMMEDIATE SAFETY INSTRUCTION: EVACUATE LOW-LYING CORRIDORS
              </span>
              <p className="text-[10px] text-slate-300 truncate">
                📍 Location: <strong className="text-white">{activeLocation.address}</strong> • Network: <strong className="text-emerald-400">{networkState}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-2">
            {/* Primary Action: FIND SAFE EXIT */}
            <Link
              href="/citizen/safe-exit"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1 shadow-lg shadow-emerald-950/50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>FIND SAFE EXIT</span>
            </Link>

            {activeInc && (
              <Link
                href={`/citizen/incidents/${activeInc.id}`}
                className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider items-center"
              >
                <span>Track Incident</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            )}

            <button
              onClick={() => setEmergencyMode(false)}
              aria-label="Dismiss Overlay"
              className="p-1 text-red-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
