'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Layers, 
  MapPin, 
  CloudRain, 
  Clock, 
  Bell, 
  User, 
  LogOut, 
  Monitor, 
  Play, 
  Sparkles,
  ChevronDown,
  Globe,
  Settings,
  Laptop,
  Flame,
  AlertTriangle,
  RefreshCw,
  Map,
  Compass,
  ArrowRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { useShellStore, HierarchyState } from '../../store/useShellStore'
import { DemoEngine, DemoScenarioName, DemoStepEvent } from '../../lib/demoEngine'
import GlobalSearch from './GlobalSearch'
import NotificationCenter from './NotificationCenter'
import BrandLogo from '../ui/BrandLogo'

export default function Header() {
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const logoutStore = useAuthStore((state) => state.logout)
  
  // Shell Store states
  const currentWorkspace = useShellStore((state) => state.currentWorkspace)
  const setWorkspace = useShellStore((state) => state.setWorkspace)
  const currentHierarchy = useShellStore((state) => state.currentHierarchy)
  const setHierarchy = useShellStore((state) => state.setHierarchy)
  const presentationMode = useShellStore((state) => state.presentationMode)
  const setPresentationMode = useShellStore((state) => state.setPresentationMode)
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed)

  // Local component states
  const [currentDate, setCurrentDate] = useState('')
  const [currentTimeOnly, setCurrentTimeOnly] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [hierarchyDropdownOpen, setHierarchyDropdownOpen] = useState<keyof HierarchyState | null>(null)
  
  // Demo states
  const [selectedScenario, setSelectedScenario] = useState<DemoScenarioName>('Heavy Rain & Coastal Flood')
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoStep, setDemoStep] = useState<DemoStepEvent | null>(null)

  // Live Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const dateOpts: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
      const timeOpts: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      }
      setCurrentDate(now.toLocaleDateString('en-IN', dateOpts).toUpperCase())
      setCurrentTimeOnly(now.toLocaleTimeString('en-IN', timeOpts).toUpperCase())
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logoutStore()
    router.push('/login')
  }

  const handleStartDemo = () => {
    setDemoRunning(true)
    DemoEngine.executeDemoSequence(selectedScenario, (stepEvent) => {
      setDemoStep(stepEvent)
      if (stepEvent.step === 8) {
        setTimeout(() => setDemoRunning(false), 1500)
      }
    })
  }

  // Workspace list
  const workspaces = [
    'National Operations Command Center',
    'West Operations Command (Mumbai)',
    'South Operations Command (Bengaluru)',
    'East Operations Command (Kolkata)',
    'North Operations Command (Srinagar)'
  ]

  // Hierarchy levels configuration
  const hierarchyOptions = {
    state: ['Andhra Pradesh', 'Delhi NCT', 'Maharashtra', 'Karnataka', 'Tamil Nadu'],
    district: ['Visakhapatnam', 'New Delhi', 'Mumbai Suburban', 'Bengaluru Urban', 'Chennai'],
    city: ['Visakhapatnam City', 'Delhi Municipal Corp', 'Mumbai Municipal Corp', 'Bengaluru Municipal Corp', 'Chennai Corp'],
    ward: ['Ward 12', 'Ward 18', 'Ward 22', 'Ward 45', 'Ward 04']
  }

  const getInitials = (name?: string) => {
    if (!name) return 'O'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  const getCompactHierarchyLabel = (level: string, value: string) => {
    if (level === 'state' && value === 'Andhra Pradesh') return 'AP'
    if (level === 'district' && value === 'Visakhapatnam') return 'Vizag'
    if (level === 'city' && value === 'Visakhapatnam City') return 'Vizag City'
    return value
  }

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] h-18 items-center border-b border-slate-900/60 bg-[#0B0F19]/80 px-4 lg:px-6 backdrop-blur-xl relative z-[30] select-none w-full max-w-full box-border gap-2 lg:gap-3">
      
      {/* 1. LEFT ZONE: Search Terminal & National Command selector */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0 min-w-0">
        {/* Logo shows ONLY if sidebar is collapsed */}
        {sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center shrink-0 border-r border-slate-850 pr-2 lg:pr-3"
          >
            <BrandLogo size="sm" />
          </motion.div>
        )}

        {/* Global Search Bar */}
        <div className="w-32 sm:w-44 md:w-52 lg:w-60 shrink-0">
          <GlobalSearch />
        </div>

        {/* Workspace Switcher Dropdown (National Command selector) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center space-x-1 lg:space-x-1.5 rounded-xl border border-slate-800 bg-slate-950/40 px-2 py-1.5 lg:px-3 lg:py-1.5 text-[10px] lg:text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition-all focus:outline-none min-w-0"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate max-w-[50px] sm:max-w-[80px] lg:max-w-[120px]">{currentWorkspace}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </button>

          <AnimatePresence>
            {workspaceDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setWorkspaceDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 shadow-2xl z-20"
                >
                  <h4 className="px-3 py-1.5 text-[9px] font-bold tracking-widest text-slate-500 uppercase font-mono border-b border-slate-900 mb-1.5">
                    Command Workspaces
                  </h4>
                  <div className="space-y-1">
                    {workspaces.map((ws) => (
                      <button
                        key={ws}
                        onClick={() => {
                          setWorkspace(ws)
                          setWorkspaceDropdownOpen(false)
                        }}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold transition-all text-left ${
                          currentWorkspace === ws
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'text-slate-400 hover:bg-slate-950 hover:text-white border border-transparent'
                        }`}
                      >
                        <Globe className="mr-2 h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{ws}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. MIDDLE ZONE: Location, Weather, Date/Time */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 lg:gap-3 items-center min-w-0 w-full px-2">
        {/* Geo Breadcrumb Selector */}
        <div className="flex items-center space-x-1 lg:space-x-1.5 bg-slate-950/30 border border-slate-900 rounded-xl p-1 text-[10px] lg:text-xs min-w-0 overflow-hidden flex-1">
          <span className="hidden lg:inline text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1 lg:px-2 font-mono shrink-0">
            GEO
          </span>
          <span className="hidden lg:inline text-slate-600 shrink-0">/</span>

          {/* Country node (static) */}
          <span className="px-1 py-0.5 lg:px-2 lg:py-1 font-bold text-slate-350 font-mono shrink-0">IND</span>

          {/* Interactive nodes dropdowns */}
          {(['state', 'district', 'city', 'ward'] as const).map((level) => {
            const currentVal = currentHierarchy[level]
            const options = hierarchyOptions[level]
            const isDropdownOpen = hierarchyDropdownOpen === level

            return (
              <React.Fragment key={level}>
                <span className="text-slate-750 font-mono font-bold shrink-0">&gt;</span>
                <div className="relative min-w-0 shrink">
                  <button
                    onClick={() => setHierarchyDropdownOpen(isDropdownOpen ? null : level)}
                    className="flex items-center space-x-0.5 lg:space-x-1 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 font-semibold text-slate-400 hover:text-slate-200 transition-all text-[10px] lg:text-xs min-w-0"
                  >
                    <span className="truncate max-w-[30px] sm:max-w-[60px] lg:max-w-[80px] font-mono">
                      {getCompactHierarchyLabel(level, currentVal)}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-slate-500 shrink-0" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setHierarchyDropdownOpen(null)} />
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 mt-1.5 w-48 rounded-xl border border-slate-800 bg-[#0B0F19] p-1.5 shadow-2xl z-20"
                        >
                          {options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setHierarchy({ [level]: opt })
                                setHierarchyDropdownOpen(null)
                              }}
                              className={`flex w-full items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                                currentVal === opt
                                  ? 'bg-sky-500/10 text-sky-400'
                                  : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                              }`}
                            >
                              <MapPin className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{opt}</span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Weather Telemetry widget */}
        <div className="flex items-center space-x-1.5 border-l border-r border-slate-800/80 px-2 lg:px-3 min-w-0 overflow-hidden shrink">
          <CloudRain className="w-3.5 h-3.5 text-sky-400 animate-bounce shrink-0" />
          <div className="text-left font-mono leading-none">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">WEATHER</span>
            <span className="block text-[10px] lg:text-xs font-bold text-slate-300 whitespace-nowrap">Vizag: 29°C · 92% RH</span>
          </div>
        </div>

        {/* Live Clock telemetry */}
        <div className="flex items-center space-x-1.5 border-r border-slate-800/80 pr-2 lg:pr-3 shrink-0 min-w-0 overflow-hidden">
          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <div className="text-left font-mono leading-none">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">NEOC TIME</span>
            <span className="block text-[10px] lg:text-xs font-bold text-slate-300 whitespace-nowrap">
              {currentDate || 'SYNCING...'}
            </span>
            <span className="block text-[9px] text-sky-400 font-bold drop-shadow-[0_0_6px_rgba(56,189,248,0.25)] mt-0.5 whitespace-nowrap">
              {currentTimeOnly || ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. RIGHT ZONE: Display, Notifications, Alert, Start Demo, Profile */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0 ml-auto">
        {/* Presentation mode toggle */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          title="Toggle Presentation Mode"
          className={`flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-xl border transition-all focus:outline-none relative group shrink-0 ${
            presentationMode 
              ? 'border-purple-500/40 bg-purple-950/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <Monitor className="h-4 w-4 lg:h-4.5 lg:w-4.5 shrink-0" />
          {presentationMode && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          )}
        </button>

        {/* Notification alarms center */}
        <div className="shrink-0 flex items-center justify-center">
          <NotificationCenter />
        </div>

        {/* Demo execution scenario trigger & controller (Alert Selector) */}
        <div className="flex items-center space-x-1 lg:space-x-2 shrink-0">
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as DemoScenarioName)}
            disabled={demoRunning}
            className="bg-slate-950 border border-slate-900 rounded-xl px-1.5 py-1 lg:px-2.5 lg:py-2 text-[10px] lg:text-xs font-bold text-slate-300 focus:outline-none focus:border-slate-700 select-none cursor-pointer disabled:opacity-50 max-w-[80px] sm:max-w-[150px] lg:max-w-[200px] truncate"
          >
            {DemoEngine.getScenarios().map((sc) => (
              <option key={sc} value={sc}>
                🎯 {sc}
              </option>
            ))}
          </select>

          <button
            onClick={handleStartDemo}
            disabled={demoRunning}
            className="relative flex items-center space-x-1 lg:space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 px-2 py-1.5 lg:px-4 lg:py-2 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white hover:from-blue-500 hover:to-purple-600 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] focus:outline-none disabled:opacity-50 border border-purple-400/20 shrink-0"
          >
            <Play className={`h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0 ${demoRunning ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">Start Demo</span>
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-950/40 p-1 lg:p-1.5 pr-2 lg:pr-3 hover:border-slate-700 hover:text-white transition-all focus:outline-none"
          >
            <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 font-extrabold text-white text-xs select-none shrink-0">
              {getInitials(profile?.full_name)}
            </div>
            <div className="hidden sm:block text-left min-w-0 max-w-[50px] lg:max-w-[80px]">
              <p className="text-[10px] lg:text-xs font-bold text-slate-200 truncate leading-none mb-0.5">{profile?.full_name || 'NEOC Lead'}</p>
              <p className="text-[8px] lg:text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono leading-none truncate">{profile?.role_name || 'Admin'}</p>
            </div>
            <ChevronDown className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-slate-500 shrink-0" />
          </button>

          <AnimatePresence>
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-[#0B0F19] p-2 shadow-2xl z-20"
                >
                  <div className="px-3 py-3 border-b border-slate-900">
                    <p className="text-xs font-bold text-slate-200">{profile?.full_name || 'Officer Account'}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{profile?.email || 'officer@bharatos.in'}</p>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        router.push('/dashboard/executive#settings')
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-950 hover:text-slate-200 transition-all text-left"
                    >
                      <Settings className="mr-2 h-4 w-4 text-slate-500" />
                      Command Console Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect Node (Sign Out)
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Demo Scenario Modal Progression Overlay */}
      {demoRunning && demoStep && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-scale relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <div className="h-16 w-16 rounded-2xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-center mx-auto text-sky-400 relative">
              <RefreshCw className="h-7 w-7 animate-spin" />
              <Sparkles className="w-4 h-4 text-purple-400 absolute top-1 right-1 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 font-mono block">
                Executing Sequence Step {demoStep.step} of 8
              </span>
              <h4 className="text-lg font-black text-white mt-1.5">{demoStep.title}</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{demoStep.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                <motion.div 
                  className="bg-gradient-to-r from-sky-400 to-purple-600 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(demoStep.step / 8) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500 pt-1">
                <span>SEPARATE PIPELINES</span>
                <span>{Math.round((demoStep.step / 8) * 100)}% COMPLETE</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  )
}
