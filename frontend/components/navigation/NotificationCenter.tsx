'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShieldAlert, Sparkles, Check, CheckSquare, RefreshCw, Volume2, AlertTriangle, AlertCircle } from 'lucide-react'
import { RealtimeWebSocketClient } from '../../services/websocket'

interface NotificationItem {
  id: string
  title: string
  body: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  read: boolean
  timestamp: string
  category?: string
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'alarms'>('all')

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Water Level Alert (MVP Sector 4)',
      body: 'Gauges at Storm Drain M-12 breached critical flood threshold (4.32m). AI advises traffic diversion.',
      priority: 'critical',
      read: false,
      timestamp: '2 mins ago',
      category: 'Flood Warning'
    },
    {
      id: '2',
      title: 'Beach Road Highway Blockage',
      body: 'Severe coastal waterlogging reported by citizen sensors. 4 local transport vehicles rerouted.',
      priority: 'high',
      read: false,
      timestamp: '14 mins ago',
      category: 'Traffic Anomaly'
    },
    {
      id: '3',
      title: 'GIS Map Layers Sync Verified',
      body: 'Spatial digital twin layers successfully refreshed with Sentinel-3 radar passes.',
      priority: 'low',
      read: true,
      timestamp: '1 hour ago',
      category: 'System Sync'
    }
  ])

  // Subscribe to live WebSockets notifications stream safely
  useEffect(() => {
    try {
      const wsClient = new RealtimeWebSocketClient('notifications')
      wsClient.connect()

      const unsubscribe = wsClient.subscribe((evt: any) => {
        if (evt && evt.event === 'ALERT_CREATED' && evt.data) {
          const item: NotificationItem = {
            id: evt.data.id || Date.now().toString(),
            title: evt.data.title,
            body: evt.data.description || '',
            priority: evt.data.severity || 'medium',
            read: false,
            timestamp: 'Just now',
            category: evt.data.category || 'Alert'
          }
          setNotifications(prev => [item, ...prev])
        } else if (evt && evt.event === 'ALERT_STATUS_CHANGED' && evt.data) {
          setNotifications(prev => prev.map(n => {
            if (n.id === evt.data.id) {
              return {
                ...n,
                title: `[${evt.data.status.toUpperCase()}] ${evt.data.title || n.title}`,
                read: evt.data.status === 'resolved' || evt.data.status === 'expired' ? true : n.read
              }
            }
            return n
          }))
        }
      })

      return () => {
        unsubscribe()
        wsClient.disconnect()
      }
    } catch (e) {
      console.warn("WebSocket notification subscribe failed, running local telemetry feed...", e)
    }
  }, [])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'alarms') return n.priority === 'critical' || n.priority === 'high'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      
      {/* Glow button trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View system notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all focus:outline-none ${
          isOpen 
            ? 'border-sky-500/40 bg-sky-950/20 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
        }`}
      >
        <Bell className="h-4.5 w-4.5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white border-2 border-[#0B0F19] shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-slate-800/80 bg-[#0B0F19]/95 p-4 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">Incident Alarms</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                    {unreadCount} UNREAD
                  </span>
                </div>
                <button
                  onClick={markAllRead}
                  className="text-[9px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest flex items-center space-x-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Acknowledge All</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-900/60 my-3 text-[10px] font-bold uppercase tracking-wider p-0.5 bg-slate-950/45 rounded-lg border border-slate-900">
                {(['all', 'unread', 'alarms'] as const).map((tab) => {
                  const label = tab === 'all' ? 'All Alerts' : tab === 'unread' ? 'Unread' : 'Incidents'
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        isActive
                          ? 'bg-[#162032] text-sky-400 border border-slate-800'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-900">
                <AnimatePresence initial={false}>
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500 italic">
                      No active alerts matching selection.
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                          notif.read
                            ? 'bg-slate-950/20 border-slate-900/60 opacity-60'
                            : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700 shadow-md'
                        }`}
                      >
                        {/* Red Dot indicator */}
                        {!notif.read && (
                          <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-sky-400" />
                        )}

                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${
                            notif.priority === 'critical' ? 'text-red-400 bg-red-950/30 border-red-900/30 animate-pulse' :
                            notif.priority === 'high' ? 'text-amber-400 bg-amber-950/30 border-amber-900/30' :
                            notif.priority === 'medium' ? 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30' :
                            'text-sky-400 bg-sky-950/30 border-sky-900/30'
                          }`}>
                            {notif.priority}
                          </span>
                          {notif.category && (
                            <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                              {notif.category}
                            </span>
                          )}
                          <span className="text-[8px] text-slate-600 font-mono tracking-wider ml-auto">
                            {notif.timestamp}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-200 mt-2 tracking-wide group-hover:text-white transition-colors">
                          {notif.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {notif.body}
                        </p>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Telemetry Audio Mode status */}
              <div className="border-t border-slate-900/80 pt-2.5 mt-3 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>VOICE BROADCAST ENGAGED</span>
                </span>
                <span className="flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 text-slate-600" />
                  <span>SECURE CHANNEL L-4</span>
                </span>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
