'use client'

import React, { useState, useEffect } from 'react'
import { ActivityIcon } from '../icons'
import { apiService, BackendDigitalTwinNode } from '../../services/api'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts'

export default function SensorWidget() {
  const [nodes, setNodes] = useState<BackendDigitalTwinNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Selection and History States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [historicalTelemetry, setHistoricalTelemetry] = useState<{ time: string; value: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 10000)
    const timeout = setTimeout(() => {
      setCurrentTime(Date.now())
    }, 0)
    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    apiService.getDigitalTwinNodes({ limit: 100 })
      .then((res) => {
        if (isMounted) {
          // Keep only nodes that represent sensors/weather or have telemetry
          const filtered = (res.items || []).filter(n => n.type === 'sensor' || n.type === 'weather' || n.last_telemetry)
          setNodes(filtered)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch IoT telemetry.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  const handleNodeClick = async (nodeId: string) => {
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
      setHistoricalTelemetry([])
      return
    }

    setSelectedNodeId(nodeId)
    setHistoryLoading(true)
    try {
      const res = await apiService.getTelemetry(nodeId, 30)
      const formatted = (res.items || [])
        .map((rec: { timestamp: string; value: number }) => ({
          time: new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          value: rec.value
        }))
        .reverse() // Chronological order
      setHistoricalTelemetry(formatted)
    } catch (err) {
      console.warn("Failed to load telemetry history:", err)
      setHistoricalTelemetry([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const isNodeOffline = (node: BackendDigitalTwinNode) => {
    if (node.last_telemetry?.source_type !== 'REAL_IOT') return false
    const observedStr = node.last_telemetry?.observed_at
    if (!observedStr) return false
    const lastTime = new Date(observedStr).getTime()
    if (isNaN(lastTime)) return false
    if (!currentTime) return false
    // 30 seconds threshold
    return (currentTime - lastTime) > 30000
  }

  const getNodeStatus = (node: BackendDigitalTwinNode) => {
    if (isNodeOffline(node)) return 'offline'
    return node.status || 'normal'
  }

  const getStatusClass = (status?: string) => {
    const st = String(status || '').toLowerCase()
    if (st === 'offline') return 'text-slate-400 bg-slate-950/60 border-slate-900'
    if (st === 'critical' || st === 'danger') return 'text-red-400 bg-red-950/40 border-red-900/30 animate-pulse'
    if (st === 'warning' || st === 'warn') return 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30'
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
  }

  const getReadingText = (node: BackendDigitalTwinNode) => {
    if (isNodeOffline(node)) {
      const obsAt = node.last_telemetry?.observed_at
      const timeStr = obsAt ? new Date(obsAt).toLocaleTimeString() : 'N/A'
      return `Offline (Last received: ${timeStr})`
    }

    const telemetry = node.last_telemetry
    if (!telemetry) return 'No Reading'

    // Extract first numeric key value or format all keys
    const keys = Object.keys(telemetry).filter(k => k !== 'unit' && k !== 'observed_at' && k !== 'freshness' && k !== 'source_type' && k !== 'source_name' && k !== 'source_url')
    if (keys.length === 0) return 'Active'
    
    return keys.map(k => {
      const val = telemetry[k]
      const label = k.replace('_', ' ')
      return `${label}: ${val}${telemetry.unit || 'm'}`
    }).join(', ')
  }

  const hasRealIoT = nodes.some(n => n.last_telemetry?.source_type === 'REAL_IOT' && !isNodeOffline(n))

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-blue-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">IoT Telemetry Gauges</h4>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-blue-950/40 border border-blue-900/30 text-blue-400">
          {hasRealIoT ? 'Live API Data • LIVE IoT ACTIVE' : 'Live API Data • SIMULATED'}
        </span>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 animate-pulse">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-[10px] text-slate-500 font-mono">Syncing sensors...</span>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-xs text-red-400 font-mono">{error}</div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">No active IoT gauges registered.</div>
      ) : (
        <div className="space-y-2.5">
          {nodes.map((node) => {
            const currentStatus = getNodeStatus(node)
            return (
              <div 
                key={node.id} 
                onClick={() => handleNodeClick(node.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                  selectedNodeId === node.id 
                    ? 'border-sky-500 bg-sky-950/10' 
                    : 'border-slate-850 bg-[#050816] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="min-w-0 flex-1 pr-2">
                    <h5 className="text-xs font-bold text-white truncate">{node.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Telemetry: <span className="text-blue-400 font-bold">{getReadingText(node)}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono shrink-0 ${getStatusClass(currentStatus)}`}>
                    {currentStatus}
                  </span>
                </div>

                {/* Expansion Details with Recharts Line Chart */}
                {selectedNodeId === node.id && (
                  <div className="mt-3 pt-3 border-t border-slate-850 w-full space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                      {node.last_telemetry?.source_type === 'REAL_IOT'
                        ? 'Historical Trend (Last 30 Cycles) [REAL IoT]'
                        : 'Historical Trend (Last 30 Cycles) [SIMULATED]'}
                    </span>
                    {historyLoading ? (
                      <div className="py-6 flex justify-center items-center text-[10px] text-slate-400 animate-pulse font-mono">
                        <div className="h-3 w-3 animate-spin rounded-full border border-sky-450 border-t-transparent mr-2"></div>
                        Loading historical timeline...
                      </div>
                    ) : historicalTelemetry.length === 0 ? (
                      <div className="py-4 text-center text-[10px] text-slate-500 font-mono italic">
                        No historical telemetry available.
                      </div>
                    ) : (
                      <div className="h-28 w-full font-mono text-[8px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historicalTelemetry} margin={{ left: -30, right: 10, top: 5, bottom: 5 }}>
                            <XAxis 
                              dataKey="time" 
                              stroke="#475569" 
                              strokeWidth={0.5} 
                              tickLine={false} 
                            />
                            <YAxis 
                              stroke="#475569" 
                              strokeWidth={0.5} 
                              tickLine={false} 
                              domain={['auto', 'auto']}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                              labelStyle={{ color: '#94a3b8', fontSize: '8px', fontWeight: 'bold' }}
                              itemStyle={{ color: '#38bdf8', fontSize: '9px' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#38bdf8" 
                              strokeWidth={1.5} 
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
