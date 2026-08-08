'use client'

import React from 'react'
import { CloseIcon, MapPinIcon, ActivityIcon, SuccessIcon } from '../icons'
import { SelectedAssetDetail } from '../../lib/digitalTwin/selectionManager'

interface AssetDetailsDrawerProps {
  asset: SelectedAssetDetail | null
  onClose: () => void
}

export default function AssetDetailsDrawer({
  asset,
  onClose
}: AssetDetailsDrawerProps) {
  if (!asset) return null

  return (
    <div className="fixed inset-y-0 right-0 z-[1000] w-full max-w-md bg-[#111827] border-l border-slate-800 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between animate-slideRight">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block font-mono-data">
              {asset.category} Profile
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">{asset.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body Specs */}
        <div className="space-y-4 py-5">
          <div className="rounded-xl border border-slate-800 bg-[#050816] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Status</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider font-mono-data bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                {asset.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Coordinates</span>
              <span className="text-blue-400 font-mono-data">
                {asset.coordinates[0].toFixed(4)}° N, {asset.coordinates[1].toFixed(4)}° E
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              {asset.description}
            </p>
          </div>

          {asset.relatedIncidents.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Related Incidents</span>
              <div className="space-y-1.5">
                {asset.relatedIncidents.map((inc, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                    <ActivityIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Buttons (UI Only) */}
      <div className="border-t border-slate-800 pt-4 space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Quick Actions</span>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => alert(`Dispatching team to ${asset.name} (Mock UI)`)}
            className="w-full py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
          >
            Dispatch Unit
          </button>
          <button 
            onClick={() => alert(`Opening telemetric log for ${asset.name} (Mock UI)`)}
            className="w-full py-2.5 border border-slate-800 bg-slate-900 rounded-xl text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            Telemetry Log
          </button>
        </div>
      </div>
    </div>
  )
}
