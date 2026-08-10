'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  ChevronRight, 
  Cpu, 
  Map, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Settings,
  Flame,
  Activity,
  Layers,
  Terminal,
  CornerDownLeft
} from 'lucide-react'
import { Input } from '../ui/input'
import { useShellStore } from '../../store/useShellStore'

interface SearchResult {
  id: string
  title: string
  category: 'command' | 'alert' | 'asset'
  details: string
  actionPath: string
  icon: any
  color: string
}

export default function GlobalSearch() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Shell Store states
  const commandBarOpen = useShellStore((state) => state.commandBarOpen)
  const setCommandBarOpen = useShellStore((state) => state.setCommandBarOpen)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'command' | 'alert' | 'asset'>('all')

  const searchResults: SearchResult[] = [
    { id: 'c-1', title: 'Launch GIS Digital Twin Workspace', category: 'command', details: 'Access real-time 3D spatial twin map visualizations & hazard feeds.', actionPath: '/dashboard/digital-twin', icon: Layers, color: 'text-sky-400' },
    { id: 'c-2', title: 'Open LangGraph AI Operations Hub', category: 'command', details: 'Monitor active multi-agent execution pipelines and decision logs.', actionPath: '/dashboard/ai-ops', icon: Cpu, color: 'text-purple-400' },
    { id: 'c-3', title: 'Access Strategic Analytics Dashboard', category: 'command', details: 'Review national/state telemetry metrics, charts, and audit histories.', actionPath: '/dashboard/analytics', icon: TrendingUp, color: 'text-cyan-400' },
    { id: 'c-4', title: 'Launch District Executive Console', category: 'command', details: 'Operational dashboard tailored for Collector & Commissioner decision vectors.', actionPath: '/dashboard/executive', icon: Settings, color: 'text-slate-400' },
    { id: 'a-1', title: 'Storm Drainage Overload - MVP Colony Sector 4', category: 'alert', details: 'Critical hazard: water depth exceeded 4.2m threshold.', actionPath: '/dashboard/city', icon: AlertTriangle, color: 'text-red-400' },
    { id: 'a-2', title: 'Air Quality Index Warning - Gajuwaka Zone', category: 'alert', details: 'High particulate matter detected at industrial sensor #82.', actionPath: '/dashboard/city', icon: Activity, color: 'text-amber-500' },
    { id: 'as-1', title: 'Fire Staging Deployment Unit 4', category: 'asset', details: 'Status: Standby. Location: MVP Colony outpost.', actionPath: '/dashboard/city', icon: Flame, color: 'text-orange-400' },
    { id: 'as-2', title: 'Emergency Dispatch Center Hub', category: 'asset', details: '9 dispatcher nodes active. Handling incoming disaster links.', actionPath: '/dashboard/executive', icon: Shield, color: 'text-blue-400' }
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(!commandBarOpen)
      } else if (e.key === 'Escape') {
        setCommandBarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandBarOpen, setCommandBarOpen])

  useEffect(() => {
    if (commandBarOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [commandBarOpen])

  const handleSelectResult = (res: SearchResult) => {
    setCommandBarOpen(false)
    router.push(res.actionPath)
  }

  const filteredResults = searchResults.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) || 
                          item.details.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || item.category === filter
    return matchesQuery && matchesFilter
  })

  return (
    <div className="w-full relative">
      {/* Search trigger button styled to feel like a terminal command bar */}
      <button
        onClick={() => setCommandBarOpen(true)}
        className="flex items-center justify-between w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-3.5 text-xs text-slate-500 hover:border-slate-700 hover:text-slate-400 hover:bg-slate-950 transition-all select-none"
        aria-label="Open command palette"
      >
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-slate-500" />
          <span className="font-medium tracking-wide">Search terminal (Ctrl+K)...</span>
        </div>
        <kbd className="hidden sm:inline-block border border-slate-850 px-1.5 py-0.5 rounded text-[9px] bg-slate-900 font-mono tracking-wide font-bold">
          Ctrl K
        </kbd>
      </button>

      <AnimatePresence>
        {commandBarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] transition-opacity duration-300"
              onClick={() => setCommandBarOpen(false)}
            />

            {/* Command palette modal box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
              className="fixed top-[12%] left-[50%] w-full max-w-2xl bg-[#0B0F19]/95 border border-slate-800/80 rounded-2xl shadow-2xl z-[1000] p-5 overflow-hidden max-h-[520px] flex flex-col backdrop-blur-xl"
            >
              {/* Header input bar */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3.5">
                <div className="flex items-center space-x-3.5 flex-1">
                  <Terminal className="h-5 w-5 text-sky-400 animate-pulse" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Enter command, address index, or hazard node..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-slate-100 text-sm font-semibold tracking-wide focus:outline-none placeholder-slate-500"
                  />
                </div>
                <button 
                  onClick={() => setCommandBarOpen(false)}
                  className="p-1 rounded-lg border border-slate-900 bg-slate-950 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Filters list tab bar */}
              <div className="flex space-x-2 py-3 border-b border-slate-900/60 text-xs">
                {(['all', 'command', 'alert', 'asset'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-lg border font-bold uppercase tracking-widest text-[9px] transition-all ${
                      filter === cat 
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-md' 
                        : 'bg-slate-950/60 text-slate-500 border-slate-900 hover:border-slate-850 hover:text-slate-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Channels' : `${cat}s`}
                  </button>
                ))}
              </div>

              {/* Matching Search Results List */}
              <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 max-h-[320px] scrollbar-thin scrollbar-thumb-slate-900">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <AlertTriangle className="h-8 w-8 text-slate-700 mx-auto animate-bounce" />
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching results found</h5>
                    <p className="text-[10px] text-slate-500">Verify query syntax. Search supports Digital Twin, AI Operations, or Alerts.</p>
                  </div>
                ) : (
                  filteredResults.map((res) => {
                    const IconComp = res.icon
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult(res)}
                        className="p-3 rounded-xl border border-slate-900 bg-slate-950/20 hover:bg-slate-950/70 hover:border-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className={`p-2 rounded-lg bg-slate-950 border border-slate-900 shrink-0 ${res.color} group-hover:scale-105 transition-transform duration-300`}>
                            <IconComp className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2.5">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${
                                res.category === 'command' ? 'text-purple-400 bg-purple-950/30 border-purple-900/30' :
                                res.category === 'alert' ? 'text-red-400 bg-red-950/30 border-red-900/30' :
                                'text-sky-400 bg-sky-950/30 border-sky-900/30'
                              }`}>
                                {res.category}
                              </span>
                              <h6 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{res.title}</h6>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-normal truncate max-w-[420px]">{res.details}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600 group-hover:text-slate-400 transition-all">
                          <span className="text-[9px] font-mono font-bold hidden group-hover:inline-block">ENTER</span>
                          <CornerDownLeft className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer hotkeys guide */}
              <div className="flex justify-between items-center border-t border-slate-900/60 pt-3.5 mt-3 text-[9px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <kbd className="px-1 border border-slate-900 rounded bg-slate-950">ESC</kbd> <span>to close</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <kbd className="px-1 border border-slate-900 rounded bg-slate-950">↑↓</kbd> <span>to navigate</span>
                  <kbd className="px-1 border border-slate-900 rounded bg-slate-950">↵</kbd> <span>to execute</span>
                </span>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
