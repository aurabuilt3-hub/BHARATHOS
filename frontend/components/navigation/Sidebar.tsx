'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useShellStore } from '../../store/useShellStore'
import { useAuthStore } from '../../store/useAuthStore'
import {
  Globe,
  Building2,
  MapPin,
  Building,
  Layers,
  AlertTriangle,
  Shield,
  Flame,
  HeartPulse,
  Truck,
  Car,
  PhoneCall,
  CloudRain,
  Waves,
  Wind,
  Activity,
  Cpu,
  TrendingUp,
  BarChart3,
  BookOpen,
  Users,
  Sliders,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react'

import BrandLogo from '../ui/BrandLogo'

export default function Sidebar() {
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useShellStore((state) => state.setSidebarCollapsed)
  const profile = useAuthStore((state) => state.profile)
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [level, setLevel] = useState<string>('')
  const [hash, setHash] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkLevel = () => {
        const params = new URLSearchParams(window.location.search)
        setLevel(params.get('level') || '')
        setHash(window.location.hash || '')
      }
      checkLevel()
      // Listen to popstate and custom pushes
      window.addEventListener('popstate', checkLevel)
      // Listen to hashchange events to track hash updates instantly
      window.addEventListener('hashchange', checkLevel)
      // Check on periodic timer or click as well to keep sidebar synced
      const interval = setInterval(checkLevel, 800)
      return () => {
        window.removeEventListener('popstate', checkLevel)
        window.removeEventListener('hashchange', checkLevel)
        clearInterval(interval)
      }
    }
  }, [pathname])

  const menuSections = [
    {
      title: 'COMMAND',
      items: [
        { id: 'national-command', label: 'National Command', path: '/dashboard/national', icon: Globe, color: 'text-sky-400' },
        { id: 'state-command', label: 'State Command', path: '/dashboard/state', icon: Building2, color: 'text-indigo-400' },
        { id: 'city-command', label: 'City Command', path: '/dashboard/city', icon: Building, color: 'text-emerald-400' },
        { id: 'ward-command', label: 'Ward Operations', path: '/dashboard/city?level=ward', icon: Sliders, color: 'text-emerald-500' }
      ]
    },
    {
      title: 'FLOOD INTELLIGENCE',
      items: [
        { id: 'flood-overview', label: 'Flood Overview', path: '/dashboard/national#overview', icon: Layers, color: 'text-blue-400' },
        { id: 'risk-map', label: 'Risk Map', path: '/dashboard/national#risk', icon: Waves, color: 'text-cyan-400' },
        { id: 'flood-incidents', label: 'Flood Incidents', path: '/dashboard/national#incidents', icon: AlertTriangle, color: 'text-red-400' },
        { id: 'early-warnings', label: 'Early Warnings', path: '/dashboard/national#warnings', icon: Wind, color: 'text-amber-400' },
        { id: 'risk-analysis', label: 'Risk Analysis', path: '/dashboard/national#risk-analysis', icon: TrendingUp, color: 'text-teal-400' }
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { id: 'dispatch', label: 'Dispatch', path: '/dashboard/national?action=dispatch', icon: PhoneCall, color: 'text-pink-400' },
        { id: 'resources', label: 'Resources', path: '/dashboard/national#resources', icon: Truck, color: 'text-emerald-400' },
        { id: 'response-teams', label: 'Response Teams', path: '/dashboard/national#resources', icon: Shield, color: 'text-indigo-400' }
      ]
    },
    {
      title: 'DIGITAL TWIN',
      items: [
        { id: 'flood-twin', label: 'Flood Digital Twin', path: '/dashboard/digital-twin', icon: Cpu, color: 'text-blue-450' },
        { id: 'sensors', label: 'Sensors', path: '/dashboard/digital-twin#sensors', icon: Activity, color: 'text-purple-400' }
      ]
    },
    {
      title: 'AI',
      items: [
        { id: 'flood-ai', label: 'Flood AI Advisor', path: '/dashboard/ai-ops', icon: Sparkles, color: 'text-purple-300', badge: 'AI' }
      ]
    },
    {
      title: 'CITIZEN',
      items: [
        { id: 'report-flooding', label: 'Report Flooding', path: '/dashboard/national?report=citizen', icon: AlertTriangle, color: 'text-red-500' },
        { id: 'safety-alerts', label: 'Safety & Alerts', path: '/dashboard/national#safety', icon: BookOpen, color: 'text-sky-300' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'sync-console', label: 'Sync Console', path: '/dashboard/administration', icon: Database, color: 'text-sky-400' }
      ]
    }
  ]

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-[#0B0F19]/95 border-r border-slate-900/60 flex flex-col relative z-[40] backdrop-blur-xl shadow-2xl overflow-hidden shrink-0"
    >
      {/* Dynamic scan line or lighting overlay */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent pointer-events-none" />

      {/* Header Logo section */}
      <div className="flex h-22 items-center px-4 border-b border-slate-900/60 justify-between shrink-0">
        <div className="flex items-center overflow-hidden w-full py-1 pl-1">
          <BrandLogo size="md" hideText={sidebarCollapsed} />
        </div>
      </div>

      {/* Scrollable Categories List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {!sidebarCollapsed ? (
              <h5 className="px-3 text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase font-mono">
                {section.title}
              </h5>
            ) : (
              <div className="h-px bg-slate-900 mx-2 my-4" />
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                 const isDistrictItem = item.path.includes('level=district')
                 const isWardItem = item.path.includes('level=ward')
                 const isCityItem = item.path === '/dashboard/city'
                 
                 const queryStr = typeof window !== 'undefined' ? window.location.search : ''
                 const [itemPath, itemHash] = item.path.split('#')
                 const cleanItemPath = itemPath.split('?')[0]
                 const hasHash = !!itemHash

                 const isActive = isDistrictItem 
                   ? (pathname === '/dashboard/city' && level === 'district')
                   : isWardItem
                     ? (pathname === '/dashboard/city' && level === 'ward')
                     : isCityItem 
                       ? (pathname === '/dashboard/city' && level !== 'district' && level !== 'ward' && !queryStr.includes('report=citizen') && !queryStr.includes('action=dispatch'))
                       : item.path.includes('report=citizen')
                         ? (pathname === cleanItemPath && queryStr.includes('report=citizen'))
                         : item.path.includes('action=dispatch')
                           ? (pathname === cleanItemPath && queryStr.includes('action=dispatch'))
                           : hasHash
                             ? (pathname === cleanItemPath && hash === '#' + itemHash)
                             : (pathname === cleanItemPath)
                 
                 const isHovered = hoveredItem === item.id
                 const Icon = item.icon

                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all relative group min-w-0 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {/* Sliding Hover highlight indicator */}
                    {isHovered && !isActive && (
                      <motion.div
                        layoutId="sidebarHoverId"
                        className="absolute inset-0 bg-slate-950/40 border border-slate-900 rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Sliding Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActiveId"
                        className="absolute inset-0 bg-gradient-to-r from-sky-950/50 to-blue-950/20 border border-sky-500/20 rounded-xl -z-10 shadow-[0_0_15px_rgba(56,189,248,0.08)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    {/* Icon with custom colors */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <Icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-115 shrink-0 ${
                        isActive ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : item.color
                      }`} />
                      {isActive && (
                        <div className="absolute -left-1 w-1.5 h-1.5 rounded-full bg-sky-400" />
                      )}
                    </div>

                    {/* Label */}
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-3 transition-opacity duration-200 truncate min-w-0 pr-2"
                      >
                        {item.label}
                      </motion.span>
                    )}

                    {/* Floating tooltip when collapsed */}
                    {sidebarCollapsed && (
                      <div className="absolute left-16 scale-0 rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-slate-200 group-hover:scale-100 transition-all z-[99] border border-slate-800/80 shadow-2xl whitespace-nowrap font-semibold">
                        {item.label}
                      </div>
                    )}

                    {/* Custom Telemetry Badges */}
                    {item.badge && !sidebarCollapsed && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-400 animate-pulse font-mono shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Role Card & Collapse Controls */}
      <div className="border-t border-slate-900/60 bg-[#060a13]/30 p-4 space-y-4 shrink-0">
        
        {/* User profile role badge */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 min-w-0"
          >
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-lg bg-blue-950 border border-blue-900 flex items-center justify-center text-xs font-bold text-sky-400 font-mono">
                {profile?.full_name ? profile.full_name[0] : 'O'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B0F19] animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{profile?.full_name || 'NEOC Officer'}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono truncate">{profile?.role_name || 'Operations Lead'}</p>
            </div>
          </motion.div>
        )}

        {/* Collapsible toggle button */}
        <div className="flex justify-center">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex h-9 w-full items-center justify-center rounded-xl border border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white hover:bg-slate-950 transition-all shadow-inner"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4.5 w-4.5" />
            ) : (
              <div className="flex items-center space-x-2 text-xs font-bold tracking-wider uppercase px-2 font-mono justify-center">
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse Terminal</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
