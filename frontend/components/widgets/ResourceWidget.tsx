'use client'

import React from 'react'
import { HealthIcon, PoliceIcon, FireIcon } from '../icons'
import { visakhapatnamHospitalsData } from '../../lib/mock/hospitals'
import { visakhapatnamPoliceData } from '../../lib/mock/police'
import { visakhapatnamFireData } from '../../lib/mock/fire'

export default function ResourceWidget() {
  const totalBedsAvailable = visakhapatnamHospitalsData.reduce((acc, h) => acc + h.availableBeds, 0)
  const totalPoliceUnits = visakhapatnamPoliceData.reduce((acc, p) => acc + p.activeUnits, 0)
  const totalFireTenders = visakhapatnamFireData.reduce((acc, f) => acc + f.fireTendersAvailable, 0)

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h4 className="text-sm font-bold text-white tracking-wide">Public Safety Assets Summary</h4>
        <span className="text-[10px] text-emerald-400 font-mono-data font-bold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
          Active Fleet
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <HealthIcon className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Beds Free</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono-data">{totalBedsAvailable}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <PoliceIcon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Police Units</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono-data">{totalPoliceUnits}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#050816] p-3 text-center">
          <FireIcon className="h-5 w-5 text-red-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Fire Tenders</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono-data">{totalFireTenders}</span>
        </div>
      </div>
    </div>
  )
}
