'use client'

import React, { useState } from 'react'
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
  Sparkles
} from 'lucide-react'

import BrandLogo from '../ui/BrandLogo'

export default function Sidebar() {
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useShellStore((state) => state.setSidebarCollapsed)
  const profile = useAuthStore((state) => state.profile)
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const menuSections = [
    {
      title: 'COMMAND',
      items: [
        { id: 'national-command', label: 'National Command', path: '/dashboard/national', icon: Globe, color: 'text-sky-400' },
        { id: 'state-command', label: 'State Command', path: '/dashboard/state', icon: Building2, color: 'text-indigo-400' },
        { id: 'district-command', label: 'District Command', path: '/dashboard/city?level=district', icon: MapPin, color: 'text-teal-400' },
        { id: 'city-command', label: 'City Command', path: '/dashboard/city', icon: Building, color: 'text-emerald-400' },
        { id: 'digital-twin', label: 'Digital Twin', path: '/dashboard/digital-twin', icon: Layers, color: 'text-blue-400' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'incidents', label: 'Incidents', path: '/dashboard/city#incidents', icon: AlertTriangle, color: 'text-red-400' },
        { id: 'police', label: 'Police', path: '/dashboard/city#police', icon: Shield, color: 'text-blue-500' },
        { id: 'fire', label: 'Fire & Hazmat', path: '/dashboard/city#fire', icon: Flame, color: 'text-amber-500' },
        { id: 'healthcare', label: 'Healthcare', path: '/dashboard/executive#health', icon: HeartPulse, color: 'text-rose-400' },
        { id: 'ambulance', label: 'Ambulance', path: '/dashboard/executive#ambulance', icon: Truck, color: 'text-emerald-400' },
        { id: 'traffic', label: 'Traffic', path: '/dashboard/city#traffic', icon: Car, color: 'text-orange-400' },
        { id: 'emergency-dispatch', label: 'Emergency Dispatch', path: '/dashboard/executive#dispatch', icon: PhoneCall, color: 'text-pink-400' }
      ]
    },
    {
      title: 'HAZARDS',
      items: [
        { id: 'weather', label: 'Weather', path: '/dashboard/digital-twin#weather', icon: CloudRain, color: 'text-yellow-400' },
        { id: 'flood', label: 'Flood Warnings', path: '/dashboard/digital-twin#flood', icon: Waves, color: 'text-blue-400' },
        { id: 'cyclone', label: 'Cyclone Intel', path: '/dashboard/digital-twin#cyclone', icon: Wind, color: 'text-cyan-400' },
        { id: 'earthquake', label: 'Earthquake Monitor', path: '/dashboard/digital-twin#earthquake', icon: Activity, color: 'text-orange-500' }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'ai-ops', label: 'AI Operations', path: '/dashboard/ai-ops', icon: Cpu, color: 'text-purple-400', badge: 'AI' },
        { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics', icon: TrendingUp, color: 'text-cyan-300' },
        { id: 'reports', label: 'Reports', path: '/dashboard/analytics#reports', icon: BarChart3, color: 'text-teal-300' },
        { id: 'knowledge-base', label: 'Knowledge Base', path: '/dashboard/ai-ops#kb', icon: BookOpen, color: 'text-indigo-300' }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'users-roles', label: 'Users & Roles', path: '/dashboard/executive#users', icon: Users, color: 'text-slate-400' },
        { id: 'settings', label: 'Settings', path: '/dashboard/executive#settings', icon: Sliders, color: 'text-slate-400' },
        { id: 'audit-logs', label: 'Audit Logs', path: '/dashboard/analytics#audit', icon: ClipboardList, color: 'text-slate-400' }
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
                const isActive = pathname === item.path
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
