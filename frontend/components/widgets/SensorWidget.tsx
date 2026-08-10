'use client'

import React, { useState, useEffect } from 'react'
import { ActivityIcon } from '../icons'
import { visakhapatnamSensorsData, SensorItem } from '../../lib/mock/sensors'
import { RealtimeWebSocketClient } from '../../services/websocket'

export default function SensorWidget() {
  const [sensors, setSensors] = useState<SensorItem[]>(visakhapatnamSensorsData)
  const [isLiveStream, setIsLiveStream] = useState(false)

  useEffect(() => {
    const wsClient = new RealtimeWebSocketClient('sensors')
    wsClient.connect()

    const unsubscribe = wsClient.subscribe((payload) => {
      if (payload && payload.event === 'sensor_updated') {
        setIsLiveStream(true)
        setSensors(prevSensors =>
          prevSensors.map(s =>
            s.id === payload.sensor_id
              ? {
                  ...s,
                  currentReading: payload.reading,
                  status: payload.status,
                  lastUpdated: payload.timestamp
                }
              : s
          )
        )
      }
    })

    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [])

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'critical': return 'text-red-400 bg-red-950/40 border-red-900/30 animate-pulse'
      case 'warning': return 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30'
      case 'normal': default: return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-blue-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">IoT Telemetry Gauges</h4>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono-data uppercase tracking-wider ${
          isLiveStream 
            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400 animate-pulse' 
            : 'bg-blue-950/40 border border-blue-900/30 text-blue-400'
        }`}>
          {isLiveStream ? '● WebSocket Live' : 'Polling'}
        </span>
      </div>

      <div className="space-y-2.5">
        {sensors.map((sns) => (
          <div key={sns.id} className="p-3 rounded-xl border border-slate-850 bg-[#050816] flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white line-clamp-1">{sns.name}</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono-data">
                Reading: <span className="text-blue-400 font-bold">{sns.currentReading}</span> {sns.unit}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono-data ${getStatusBadge(sns.status)}`}>
              {sns.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
