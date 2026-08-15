'use client'

import React, { useState, useEffect } from 'react'
import { ActivityIcon } from '../icons'
import { RealtimeWebSocketClient } from '../../services/websocket'

interface ActivityItem {
  id: string
  timestamp: string
  title: string
  description: string
  category: 'incident' | 'ai' | 'assignment' | 'resolution'
}

export default function ActivityFeedWidget() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', timestamp: '20:18:00', title: 'Incident Resolved', description: 'Pothole cave-in patched at Jagadamba Junction.', category: 'resolution' },
    { id: '2', timestamp: '20:14:14', title: 'Officer Assigned', description: 'Municipal Team M-12 assigned to Ward 12 flood.', category: 'assignment' },
    { id: '3', timestamp: '20:14:10', title: 'AI Recommendation Ready', description: 'Gemini 2.5 Pro triage plan generated (94.2% confidence).', category: 'ai' },
    { id: '4', timestamp: '20:14:07', title: 'AI Analysis Started', description: 'LangGraph multi-agent orchestrator initiated.', category: 'ai' },
    { id: '5', timestamp: '20:14:03', title: 'Incident Created', description: 'Waterlogging reported on Beach Road MVP Colony.', category: 'incident' }
  ])

  useEffect(() => {
    const wsClient = new RealtimeWebSocketClient('dashboard')
    wsClient.connect()

    const unsubscribe = wsClient.subscribe((evt: any) => {
      if (!evt || !evt.event || !evt.data) return

      const timestamp = new Date(evt.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      let activityItem: ActivityItem | null = null

      switch (evt.event) {
        case 'INCIDENT_CREATED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Incident Created',
            description: `[${(evt.data.severity || 'low').toUpperCase()}] ${evt.data.category || 'Incident'}: ${evt.data.title}`,
            category: 'incident'
          }
          break
        case 'INCIDENT_STATUS_CHANGED':
          const isResolved = evt.data.status === 'resolved' || evt.data.status === 'closed'
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: `Incident ${evt.data.status.toUpperCase()}`,
            description: `Ticket #${evt.data.ticket_number || ''} is now ${evt.data.status}.`,
            category: isResolved ? 'resolution' : 'incident'
          }
          break
        case 'INCIDENT_ASSIGNED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Officer Assigned',
            description: `Ticket #${evt.data.ticket_number || ''} assigned. Notes: ${evt.data.notes || 'Dispatch active'}.`,
            category: 'assignment'
          }
          break
        case 'ALERT_CREATED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Alert Created',
            description: `[${(evt.data.severity || 'low').toUpperCase()}] ${evt.data.title}: ${evt.data.description || ''}`,
            category: 'incident'
          }
          break
        case 'ALERT_STATUS_CHANGED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: `Alert ${evt.data.status.toUpperCase()}`,
            description: `Alert '${evt.data.title}' is now ${evt.data.status}.`,
            category: evt.data.status === 'resolved' ? 'resolution' : 'incident'
          }
          break
        case 'RESOURCE_ALLOCATED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Resource Allocated',
            description: `${evt.data.type || 'Resource'} '${evt.data.name}' allocated to incident #${evt.data.incident_ticket || ''}.`,
            category: 'assignment'
          }
          break
        case 'RESOURCE_RELEASED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Resource Released',
            description: `${evt.data.type || 'Resource'} '${evt.data.name}' released from incident #${evt.data.incident_ticket || ''}.`,
            category: 'resolution'
          }
          break
        case 'RESOURCE_UPDATED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Resource Updated',
            description: `Resource '${evt.data.name}' is now ${evt.data.status}.`,
            category: 'resolution'
          }
          break
        case 'TELEMETRY_UPDATED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Telemetry Alert',
            description: `Sensor '${evt.data.node_name}' registered ${evt.data.value} ${evt.data.unit || ''} (${evt.data.status}).`,
            category: 'ai'
          }
          break
        case 'DIGITAL_TWIN_NODE_UPDATED':
          activityItem = {
            id: evt.data.id || Date.now().toString(),
            timestamp,
            title: 'Sensor Status Update',
            description: `Digital twin node '${evt.data.name}' status is now ${evt.data.status}.`,
            category: 'ai'
          }
          break
        default:
          break
      }

      if (activityItem) {
        setActivities(prev => [activityItem!, ...prev.slice(0, 9)])
      }
    })

    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [])

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'resolution': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
      case 'ai': return 'text-purple-400 bg-purple-950/40 border-purple-900/30'
      case 'assignment': return 'text-blue-400 bg-blue-950/40 border-blue-900/30'
      case 'incident': default: return 'text-amber-400 bg-amber-950/40 border-amber-900/30'
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-emerald-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">Command Center Live Activity Stream</h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono-data">Updated Live</span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {activities.map((act) => (
          <div key={act.id} className="p-3 rounded-xl border border-slate-850 bg-[#050816] flex items-start justify-between space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono-data ${getCategoryBadge(act.category)}`}>
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">{act.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{act.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
