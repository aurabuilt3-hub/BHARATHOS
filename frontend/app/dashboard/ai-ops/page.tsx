'use client'

import React, { useState } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import MetricBadge from '../../../components/ui/MetricBadge'
import { ActivityIcon, AlertIcon } from '../../../components/icons'
import { Sparkles as SparklesIcon } from 'lucide-react'

interface LogEntry {
  timestamp: string
  agentName: string
  level: 'info' | 'warn'
  message: string
}

export default function AIOperationsCenterPage() {
  const [selectedNode, setSelectedNode] = useState<string>('CoordinatorAgent')

  const logs: LogEntry[] = [
    { timestamp: '21:00:24', agentName: 'CoordinatorAgent', level: 'info', message: 'Orchestrating Gemini 2.5 Pro LangGraph state graph execution' },
    { timestamp: '21:00:20', agentName: 'CyberSecurityAgent', level: 'info', message: 'SCADA TLS 1.3 cryptographic handshake validated successfully' },
    { timestamp: '21:00:18', agentName: 'PowerGridAgent', level: 'info', message: 'APTRANSCO substation MVP isolated street lighting feeder L-12' },
    { timestamp: '21:00:15', agentName: 'WaterResourcesAgent', level: 'info', message: 'CWC Estuary Sluice Gate Depth: 4.18m (Backflow alert)' },
    { timestamp: '21:00:12', agentName: 'InfrastructureAgent', level: 'info', message: 'CULVERT-Sector 4 SCADA vibration sensor reporting normal parameters' },
    { timestamp: '21:00:08', agentName: 'AnalyticsAgent', level: 'info', message: 'Database RAG query returned 88% historical match with monsoon event' }
  ]

  const agentStates = {
    CoordinatorAgent: { confidence: 95.4, latency: '18.2ms', status: 'active', sop: 'NDMA Hydro-Meteorological Protocol v2', memory: { activeSession: 'sess-8902', loopCount: 2 } },
    CyberSecurityAgent: { confidence: 99.1, latency: '6.4ms', status: 'success', sop: 'National SCADA Cyber Protection Policy', memory: { encryption: 'TLS_1.3', threats: 0 } },
    PowerGridAgent: { confidence: 97.0, latency: '11.8ms', status: 'success', sop: 'Electrical Isolation SOP Code 4', memory: { substation: 'MVP-4', feederState: 'isolated' } }
  }

  const activeState = agentStates[selectedNode as keyof typeof agentStates] || agentStates.CoordinatorAgent

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <PageHeader
          title="LangGraph Operations Center & Agent Workspace"
          description="Visual multi-agent orchestrator state graphs, execution timelines, raw tool call arrays, and pgvector RAG memory logs."
          breadcrumbs={[{ label: 'Home' }, { label: 'AI Operations' }]}
        />

        {/* Studio Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Col 1 & 2: Interactive SVG Node Graph */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h4 className="text-sm font-bold text-white tracking-wide">LangGraph Execution Flow Graph</h4>
              <span className="text-[10px] text-purple-400 font-mono-data bg-purple-950 border border-purple-900/40 px-2 py-0.5 rounded">
                Live State Machine Active
              </span>
            </div>

            {/* Visual Agent Flow Cards */}
            <div className="flex flex-col items-center justify-center py-8 space-y-6 bg-slate-950/40 rounded-xl border border-slate-900">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setSelectedNode('CitizenAgent')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-[#050816] text-xs font-bold text-slate-300 hover:border-purple-500 transition-all"
                >
                  👤 CitizenAgent (NLP Triage)
                </button>
              </div>

              <div className="h-8 w-0.5 bg-purple-500/50 animate-pulse"></div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => setSelectedNode('CoordinatorAgent')}
                  className={`px-6 py-3 rounded-2xl border text-sm font-extrabold transition-all shadow-xl ${
                    selectedNode === 'CoordinatorAgent' 
                      ? 'bg-purple-900/30 border-purple-500 text-purple-300 shadow-purple-950/20' 
                      : 'border-slate-800 bg-[#050816] text-slate-400'
                  }`}
                >
                  ⚙️ CoordinatorAgent (Graph Orchestrator)
                </button>
              </div>

              <div className="h-8 w-0.5 bg-purple-500/50 animate-pulse"></div>

              {/* Sub-agents Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
                {['CyberSecurityAgent', 'PowerGridAgent', 'WaterResourcesAgent', 'InfrastructureAgent'].map((node) => (
                  <button
                    key={node}
                    onClick={() => setSelectedNode(node)}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold transition-all text-center ${
                      selectedNode === node
                        ? 'bg-purple-900/30 border-purple-500 text-purple-300'
                        : 'border-slate-850 bg-[#050816] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🤖 {node.replace('Agent', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Execution logs output stream terminal */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono-data">Live Agent Cluster Output Logs</h5>
              <div className="bg-[#030712] border border-slate-900 rounded-xl p-4 font-mono-data text-[10.5px] leading-relaxed text-slate-400 h-44 overflow-y-auto space-y-1.5">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-slate-600">[{log.timestamp}]</span>
                    <span className="text-purple-400 font-bold">{log.agentName}:</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Agent Memory & Telemetry Inspector */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-900 pb-3">
              <h4 className="text-sm font-bold text-white tracking-wide">State Memory Inspector</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Active selection: {selectedNode}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl border border-slate-850 bg-[#050816]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Confidence</span>
                  <span className="text-emerald-400 font-extrabold text-sm font-mono-data">{activeState.confidence}%</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-[#050816]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Latency</span>
                  <span className="text-blue-400 font-extrabold text-sm font-mono-data">{activeState.latency}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">SOP Citation Reference</span>
                <p className="text-xs text-slate-300 font-mono-data mt-1 bg-slate-950 p-2 rounded border border-slate-900">{activeState.sop}</p>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">In-Memory Session Context</span>
                <pre className="text-[10px] text-purple-300 font-mono-data mt-1 bg-slate-950 p-2 rounded border border-slate-900 overflow-x-auto">
                  {JSON.stringify(activeState.memory, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
