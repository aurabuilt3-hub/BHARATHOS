'use client'

import React, { useState } from 'react'
import { ActivityIcon, AlertIcon } from '../icons'

export type ScenarioType = 'Heavy Rain' | 'Cyclone' | 'Chemical Fire' | 'Road Accident' | 'Flood'

interface ScenarioSimulatorWidgetProps {
  onScenarioChange?: (scenario: ScenarioType) => void
}

export default function ScenarioSimulatorWidget({ onScenarioChange }: ScenarioSimulatorWidgetProps) {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('Flood')

  const handleSelect = (sc: ScenarioType) => {
    setActiveScenario(sc)
    if (onScenarioChange) onScenarioChange(sc)
  }

  const getScenarioDetails = (sc: ScenarioType) => {
    switch (sc) {
      case 'Cyclone':
        return {
          intensity: 'Category 3 Coastal Cyclone Alert',
          impact: 'Predicted wind gusts 110 km/h, 95mm precipitation over coastal wards.',
          recommendation: 'Initiate evacuation of 1,200 ground-floor coastal residents to Sector 3 shelters.'
        }
      case 'Chemical Fire':
        return {
          intensity: 'Hazmat Level 2 Chemical Alarm',
          impact: 'Toxic vapor cloud threat near Gajuwaka Industrial Zone Ward 45.',
          recommendation: 'Deploy 4 Hazmat Fire Tenders and issue air quality stay-indoors order.'
        }
      case 'Road Accident':
        return {
          intensity: 'NH16 Multi-Vehicle Collision',
          impact: 'Highway traffic gridlock extended over 4.5 km corridor.',
          recommendation: 'Dispatch 3 heavy tow cranes and route traffic via Inner Ring Road bypass.'
        }
      case 'Heavy Rain':
        return {
          intensity: 'Monsoonal Downpour (55mm/h)',
          impact: 'Flash urban surface water accumulation across low-lying zones.',
          recommendation: 'Activate municipal storm pumps across all 6 zones.'
        }
      case 'Flood': default:
        return {
          intensity: 'Coastal High Tide Drainage Inundation',
          impact: 'Ward 12 storm drain depth breached 4.2m safety limit.',
          recommendation: 'Barricade Beach Road corridor and deploy dewatering pump unit M-12.'
        }
    }
  }

  const details = getScenarioDetails(activeScenario)

  return (
    <div className="glass-panel border-l-4 border-l-purple-500 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-purple-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">Emergency Scenario Simulator</h4>
        </div>
        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/40 border border-purple-900/30 px-2 py-0.5 rounded font-mono-data uppercase tracking-wider">
          Simulation Mode Active
        </span>
      </div>

      {/* Scenario Selection Buttons */}
      <div className="flex flex-wrap gap-2 text-xs">
        {(['Heavy Rain', 'Cyclone', 'Chemical Fire', 'Road Accident', 'Flood'] as const).map((sc) => (
          <button
            key={sc}
            onClick={() => handleSelect(sc)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all ${
              activeScenario === sc
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                : 'bg-[#050816] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sc}
          </button>
        ))}
      </div>

      {/* Dynamic Simulation Output Box */}
      <div className="rounded-xl border border-slate-800 bg-[#050816] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">{details.intensity}</span>
          <span className="text-[10px] font-mono-data text-purple-400 font-bold">Simulated Telemetry</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{details.impact}</p>
        <div className="pt-2 border-t border-slate-900 text-xs text-emerald-400 font-semibold flex items-center space-x-2">
          <AlertIcon className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Recommended Response: {details.recommendation}</span>
        </div>
      </div>
    </div>
  )
}
