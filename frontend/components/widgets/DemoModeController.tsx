'use client'

import React, { useState } from 'react'
import { DemoEngine, DemoScenarioName, DemoStepEvent } from '../../lib/demoEngine'
import { ActivityIcon, SuccessIcon } from '../icons'

export default function DemoModeController() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenarioName>('Heavy Rain & Coastal Flood')
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<DemoStepEvent | null>(null)

  const handleStartDemo = () => {
    setIsRunning(true)
    DemoEngine.executeDemoSequence(selectedScenario, (stepEvent) => {
      setCurrentStep(stepEvent)
      if (stepEvent.step === 8) {
        setTimeout(() => setIsRunning(false), 1200)
      }
    })
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Scenario Selector Dropdown */}
      <select
        value={selectedScenario}
        onChange={(e) => setSelectedScenario(e.target.value as DemoScenarioName)}
        className="hidden md:block bg-[#050816] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-blue-500 select-none"
      >
        {DemoEngine.getScenarios().map((sc) => (
          <option key={sc} value={sc}>
            🎯 {sc}
          </option>
        ))}
      </select>

      {/* START DEMO Button */}
      <button
        onClick={handleStartDemo}
        disabled={isRunning}
        className="relative flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/30 focus:outline-none disabled:opacity-50"
      >
        <ActivityIcon className="h-4 w-4 animate-pulse text-yellow-300" />
        <span>START DEMO</span>
      </button>

      {/* Demo Execution Progress Overlay Modal */}
      {isRunning && currentStep && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-scale">
            <div className="h-12 w-12 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center mx-auto text-blue-400">
              <ActivityIcon className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono-data block">
                Executing Demo Step {currentStep.step} of 8
              </span>
              <h4 className="text-base font-extrabold text-white mt-1">{currentStep.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentStep.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${(currentStep.step / 8) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
