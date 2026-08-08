'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  Shield,
  Flame,
  Wind,
  Plus,
  Minus,
  ArrowRight,
  Database,
  Activity,
  HeartPulse,
  CloudRain,
  AlertTriangle,
  Car,
  Check,
  MapPin,
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react'
import { geoMercator, geoPath } from 'd3-geo'

// Districts database aligned with existing mock and state metadata
const DISTRICTS_BY_STATE: Record<string, string[]> = {
  ap: ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'East Godavari'],
  mh: ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
  dl: ['New Delhi', 'North Delhi', 'South Delhi'],
  ka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
  tn: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  wb: ['Kolkata', 'Howrah', 'Darjeeling', 'Asansol'],
  up: ['Lucknow', 'Kanpur', 'Noida', 'Varanasi', 'Agra']
}

// Import GeoJSON source of truth
import IndiaGeoJSON from '../../src/data/IndiaGeoJSON.json'

interface StateMetadata {
  name: string
  capital: string
  status: 'Operational' | 'Warning' | 'Incident'
  districts: number
  activeIncidents: number
  connectedNodes: number
  resources: number
  city?: string
}

const STATE_DATA: Record<string, StateMetadata> = {
  ap: { name: 'Andhra Pradesh', capital: 'Visakhapatnam', status: 'Operational', districts: 26, activeIncidents: 12, connectedNodes: 24, resources: 148, city: 'Visakhapatnam' },
  mh: { name: 'Maharashtra', capital: 'Mumbai', status: 'Operational', districts: 36, activeIncidents: 0, connectedNodes: 32, resources: 240, city: 'Mumbai' },
  dl: { name: 'Delhi NCT', capital: 'New Delhi', status: 'Operational', districts: 11, activeIncidents: 0, connectedNodes: 18, resources: 110, city: 'New Delhi' },
  ka: { name: 'Karnataka', capital: 'Bengaluru', status: 'Operational', districts: 31, activeIncidents: 0, connectedNodes: 28, resources: 195, city: 'Bengaluru' },
  tn: { name: 'Tamil Nadu', capital: 'Chennai', status: 'Incident', districts: 38, activeIncidents: 4, connectedNodes: 30, resources: 210, city: 'Chennai' },
  wb: { name: 'West Bengal', capital: 'Kolkata', status: 'Operational', districts: 23, activeIncidents: 0, connectedNodes: 22, resources: 160, city: 'Kolkata' },
  up: { name: 'Uttar Pradesh', capital: 'Lucknow', status: 'Warning', districts: 75, activeIncidents: 2, connectedNodes: 45, resources: 280, city: 'Lucknow' }
}

// DEMO data objects
const DEMO_STATS = {
  networkHealth: '98.4% NETWORK HEALTH',
  commandNodes: 148,
  twinNodes: 420,
  activeStates: 24,
  highAlertAreas: 12,
  lastSync: 'JUST NOW',
  status: 'OPERATIONAL'
}

const INCIDENTS_DEMO = [
  { label: 'WEATHER ALERTS', count: 18, icon: CloudRain, color: 'cyan' },
  { label: 'FLOOD RISK ZONES', count: 6, icon: AlertTriangle, color: 'amber' },
  { label: 'EMERGENCY RESPONSE', count: 12, icon: Activity, color: 'red' },
  { label: 'TRAFFIC DISRUPTION', count: 8, icon: Car, color: 'orange' }
]

const HUB_CONNECTIONS: [string, string][] = [
  ['dl', 'ch'],
  ['dl', 'rj'],
  ['dl', 'up'],
  ['dl', 'br'],
  ['dl', 'wb'],
  ['dl', 'tg'],
  ['dl', 'ka'],
  ['up', 'br'],
  ['br', 'wb'],
  ['wb', 'as'],
  ['tg', 'ka'],
  ['tg', 'tn'],
  ['tg', 'ap'],
  ['rj', 'gj'],
  ['gj', 'mh']
]

export default function NationalDigitalTwinMapSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 450 })

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setDimensions({ width, height })
        }
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const [selectedStateId, setSelectedStateId] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null)
  const [layers, setLayers] = useState({ networks: true, boundaries: true, hospitals: true, police: true })

  // D3 Projection for map fit - dynamically scaled to fit available container dimensions
  const { projectedStates, commandNodes } = useMemo(() => {
    const { width, height } = dimensions
    const xPadding = 35 // horizontal padding: 20-40px
    const yPadding = 20 // vertical padding: 15-25px

    // Filter out geographic outliers (offshore islands: Andaman & Nicobar and Lakshadweep)
    // when calculating the fit extent bounding box, so mainland India occupies 80-85% of height.
    const mainlandFeatures = (IndiaGeoJSON as any).features.filter((f: any) => {
      const id = getNormalizedId(f)
      return id !== 'an' && id !== 'ld'
    })

    const projection = geoMercator()
      .fitExtent([[xPadding, yPadding], [width - xPadding, height - yPadding]], {
        type: 'FeatureCollection',
        features: mainlandFeatures
      } as any)
    const pathGenerator = geoPath().projection(projection)
    const statesList = (IndiaGeoJSON as any).features.map((feature: any) => {
      const id = getNormalizedId(feature)
      const name = feature.properties.name || ''
      const path = pathGenerator(feature) || ''
      const [cx, cy] = pathGenerator.centroid(feature) || [0, 0]
      const bounds = pathGenerator.bounds(feature) || [[0, 0], [0, 0]]
      return { id, name, path, cx, cy, bounds }
    })
    const nodesMap = new Map<string, { x: number; y: number; id: string }>()
    statesList.forEach((s: any) => {
      if (['dl', 'mh', 'gj', 'rj', 'up', 'mp', 'tg', 'ka', 'tn', 'ap', 'or', 'wb', 'as', 'jk', 'br', 'jh', 'kl', 'la', 'pb', 'ut', 'hp', 'ga', 'py', 'ch'].includes(s.id)) {
        nodesMap.set(s.id, { x: s.cx, y: s.cy, id: s.id })
      }
    })
    const dlNode = nodesMap.get('dl')
    if (dlNode) dlNode.y -= 10
    return { projectedStates: statesList, commandNodes: nodesMap }
  }, [dimensions])

  const selectedState = selectedStateId ? STATE_DATA[selectedStateId] || {
    name: projectedStates.find((s: any) => s.id === selectedStateId)?.name || 'Simulated State',
    capital: 'Simulated HQ',
    status: 'Operational' as const,
    districts: 15,
    activeIncidents: 0,
    connectedNodes: 8,
    resources: 45
  } : null

  const handleStateClick = (stateId: string) => {
    setSelectedStateId(stateId)
    setSelectedCity(null)
  }

  const resetView = () => {
    setZoomLevel(1.0)
    setSelectedStateId(null)
    setSelectedCity(null)
    setHoveredStateId(null)
  }

  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-[#0B0F19]/45 backdrop-blur-xl overflow-hidden min-h-[460px] shadow-2xl flex flex-col select-none">
      {/* TOP TOOLBAR */}
      <div className="relative z-20 p-4 flex items-center justify-between border-b border-slate-900/60 bg-[#0B0F19]/65 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-[10px] font-bold font-mono tracking-wider text-slate-350">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>NATIONAL DIGITAL TWIN NETWORK</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="font-bold">NETWORK OPERATIONAL</span>
          </span>
          <span className="ml-4">LAST SYNC: {DEMO_STATS.lastSync}</span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-950/80 border border-slate-850 p-1 rounded-xl">
          <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.0))}
            className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
            className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={resetView}
            className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white transition-colors" title="Reset View">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 p-5 pb-12 min-h-0 relative z-10 h-auto md:h-[490px]">
        {/* LEFT PANEL */}
        <div className="w-full md:w-56 bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between shrink-0 backdrop-blur-md relative">
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-cyan-500" />
          <div className="space-y-3">
            <div className="border-b border-slate-850 pb-2 relative">
              <h5 className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase font-mono">DIGITAL TWIN MESH</h5>
              <div className="flex items-center space-x-1.5 mt-1 text-[8px] font-mono text-emerald-400 font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span>ONLINE · SIMULATED</span>
              </div>
            </div>
            {/* Node legend */}
            <div className="space-y-1 text-[8.5px] font-mono font-bold text-slate-400">
              <div className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded-lg border border-slate-900/60">
                <span className="flex items-center space-x-1.5">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-350 tracking-wider">POLICE</span>
                </span>
                <span className="text-emerald-500 text-[7px] tracking-widest bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">LIVE</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded-lg border border-slate-900/60">
                <span className="flex items-center space-x-1.5">
                  <Flame className="w-3 h-3 text-red-450" />
                  <span className="text-slate-350 tracking-wider">FIRE</span>
                </span>
                <span className="text-emerald-500 text-[7px] tracking-widest bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">LIVE</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded-lg border border-slate-900/60">
                <span className="flex items-center space-x-1.5">
                  <HeartPulse className="w-3 h-3 text-rose-405" />
                  <span className="text-slate-350 tracking-wider">HEALTHCARE</span>
                </span>
                <span className="text-emerald-500 text-[7px] tracking-widest bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">LIVE</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded-lg border border-slate-900/60">
                <span className="flex items-center space-x-1.5">
                  <CloudRain className="w-3 h-3 text-yellow-450" />
                  <span className="text-slate-350 tracking-wider">WEATHER</span>
                </span>
                <span className="text-emerald-500 text-[7px] tracking-widest bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">LIVE</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded-lg border border-slate-900/60">
                <span className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-450 animate-pulse" />
                  <span className="text-slate-350 tracking-wider">HAZARDS</span>
                </span>
                <span className="text-amber-500 text-[7px] tracking-widest bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">MONITOR</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/30 px-2 py-1 rounded-lg border border-slate-900/60">
                <span className="flex items-center space-x-1.5">
                  <Database className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-350 tracking-wider">INFRASTRUCTURE</span>
                </span>
                <span className="text-emerald-500 text-[7px] tracking-widest bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">LIVE</span>
              </div>
            </div>            {/* Network Health Gauge */}
            <div className="mt-2.5 p-2.5 bg-slate-950/70 border border-cyan-500/30 rounded-xl relative overflow-hidden shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]">
              <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-full blur-xl" />
              <div className="flex justify-between items-center mb-0.5">
                <div className="text-[8.5px] text-cyan-400 font-mono uppercase tracking-wider">NETWORK HEALTH</div>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <div className="text-lg font-bold text-cyan-300 font-mono tracking-tight shadow-[0_0_8px_rgba(6,182,212,0.25)]">98.4%</div>
                <div className="text-[7.5px] font-black text-emerald-400 font-mono tracking-wider">EXCELLENT</div>
              </div>
              <div className="mt-1.5 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-450 h-full rounded-full" style={{ width: '98.4%' }} />
              </div>
              <div className="mt-0.5 text-[7px] text-slate-500 font-mono font-bold uppercase">ALL SYSTEMS NOMINAL</div>
            </div>
            {/* National Summary Grid */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <div className="p-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-left flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
                <Shield className="w-3 h-3 text-cyan-400 mb-0.5" />
                <div className="font-bold text-cyan-300 font-mono text-xs leading-none">148</div>
                <div className="text-[6.5px] font-bold text-slate-500 tracking-tight leading-tight uppercase mt-0.5">COMMAND NODES</div>
              </div>
              <div className="p-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-left flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
                <Database className="w-3 h-3 text-teal-400 mb-0.5" />
                <div className="font-bold text-cyan-300 font-mono text-xs leading-none">420</div>
                <div className="text-[6.5px] font-bold text-slate-500 tracking-tight leading-tight uppercase mt-0.5">TWIN NODES</div>
              </div>
              <div className="p-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-left flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
                <Activity className="w-3 h-3 text-blue-450 mb-0.5" />
                <div className="font-bold text-cyan-300 font-mono text-xs leading-none">24</div>
                <div className="text-[6.5px] font-bold text-slate-500 tracking-tight leading-tight uppercase mt-0.5">ACTIVE STATES</div>
              </div>
              <div className="p-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-left flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
                <AlertCircle className="w-3 h-3 text-rose-400 mb-0.5 animate-pulse" />
                <div className="font-bold text-cyan-300 font-mono text-xs leading-none">12</div>
                <div className="text-[6.5px] font-bold text-slate-500 tracking-tight leading-tight uppercase mt-0.5">ALERT AREAS</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-900/60 text-[7px] font-mono font-bold text-slate-500 tracking-wider uppercase">
              ● NATIONAL NETWORK ACTIVE
            </div>
          </div>
          {/* Quick State Navigation */}
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-[8.5px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">QUICK NAVIGATION</div>
              <div className="relative">
                <select
                  value={selectedStateId ?? ''}
                  onChange={e => { const val = e.target.value; setSelectedStateId(val || null); setSelectedCity(null) }}
                  className="w-full appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-355 focus:text-slate-100 py-1.5 px-3 pr-8 rounded-lg text-[9.5px] font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
                >
                  <option value="" className="bg-slate-950 text-slate-450">Select State</option>
                  {Object.entries(STATE_DATA).map(([id, meta]) => (
                    <option key={id} value={id} className="bg-slate-950 text-slate-300">{meta.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {selectedStateId && DISTRICTS_BY_STATE[selectedStateId] && (
              <div>
                <div className="text-[8.5px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">DISTRICT / CITY</div>
                <div className="relative">
                  <select
                    value={selectedCity ?? ''}
                    onChange={e => setSelectedCity(e.target.value || null)}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-355 focus:text-slate-100 py-1.5 px-3 pr-8 rounded-lg text-[9.5px] font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
                  >
                    <option value="" className="bg-slate-950 text-slate-450">Select District / City</option>
                    {DISTRICTS_BY_STATE[selectedStateId].map((city) => (
                      <option key={city} value={city} className="bg-slate-950 text-slate-300">{city}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}

            {selectedCity && (
              <div>
                <div className="text-[8.5px] font-bold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">COMMAND CENTER</div>
                <Link href="/dashboard/city">
                  <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[9.5px] font-mono font-bold py-2 rounded-lg border border-cyan-400/30 transition transform hover:scale-[1.02] shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center space-x-1.5">
                    <span>OPEN COMMAND CENTER</span>
                    <span>→</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* CENTER MAP */}
        <div ref={containerRef} className="relative w-full h-full overflow-hidden flex-1 min-w-0 bg-[#040812]/70 border border-slate-800/80 rounded-xl shadow-[inset_0_0_24px_rgba(6,182,212,0.08)] flex items-center justify-center h-[320px] md:h-full">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(4,8,18,0.6)_100%)] pointer-events-none" />

          {/* Live Incident Card */}
          <div className="absolute top-2 left-2 bg-slate-950/85 border border-cyan-500/35 rounded-xl p-2.5 text-[8.5px] text-slate-355 shadow-[0_4px_24px_rgba(6,182,212,0.12)] backdrop-blur-md z-20 w-[150px]">
            <div className="font-bold text-cyan-400 mb-2 font-mono flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="tracking-wider">LIVE INCIDENTS</span>
              <span className="text-[7px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-1 py-0.2 rounded">SIMULATED</span>
            </div>
            <div className="space-y-1.5 font-mono">
              {INCIDENTS_DEMO.map((inc, idx) => {
                const colorMap: Record<string, string> = {
                  cyan: 'text-cyan-400 bg-cyan-950/45 border-cyan-500/20',
                  amber: 'text-yellow-400 bg-yellow-950/45 border-yellow-500/20',
                  red: 'text-red-400 bg-red-950/45 border-red-500/20',
                  orange: 'text-orange-400 bg-orange-950/45 border-orange-500/20'
                }
                const iconColorMap: Record<string, string> = {
                  cyan: 'text-cyan-400',
                  amber: 'text-yellow-400',
                  red: 'text-red-400',
                  orange: 'text-orange-400'
                }
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <inc.icon className={`w-3 h-3 ${iconColorMap[inc.color] || 'text-slate-400'}`} />
                      <span className="text-slate-450 tracking-tight text-[7.5px]">{inc.label}</span>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${colorMap[inc.color] || 'text-slate-300 bg-slate-900 border-slate-800'}`}>
                      {inc.count.toString().padStart(2, '0')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Map Legend (Top-Right inside the map) */}
          <div className="absolute top-2 right-2 bg-slate-950/85 border border-slate-800/80 rounded-xl p-2.5 text-[8.5px] font-mono text-slate-400 space-y-1.5 shadow-lg backdrop-blur-md z-20 w-[140px]">
            <div className="text-[9px] font-bold text-cyan-400 border-b border-slate-900 pb-1 mb-1">NETWORK LEGEND</div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span className="text-slate-300">COMMAND CENTER</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="text-slate-300">REGIONAL NODE</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="text-slate-300">DISTRICT NODE</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Flame className="w-2.5 h-2.5 text-red-500" />
              <span className="text-slate-300">ACTIVE INCIDENT</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CloudRain className="w-2.5 h-2.5 text-yellow-500" />
              <span className="text-slate-300">WEATHER ALERT</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
              <span className="text-slate-300">HAZARD ZONE</span>
            </div>
          </div>

          {/* Delhi glow */}
          {commandNodes.get('dl') && (
            <div
              className="absolute w-[180px] h-[180px] bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none"
              style={{
                left: `${(commandNodes.get('dl')!.x / dimensions.width) * 100}%`,
                top: `${(commandNodes.get('dl')!.y / dimensions.height) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}

          {/* Selected State glow */}
          {selectedStateId && commandNodes.get(selectedStateId) && (
            <div
              className="absolute w-[140px] h-[140px] bg-cyan-500/10 rounded-full filter blur-2xl pointer-events-none animate-pulse"
              style={{
                left: `${(commandNodes.get(selectedStateId)!.x / dimensions.width) * 100}%`,
                top: `${(commandNodes.get(selectedStateId)!.y / dimensions.height) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}

          <svg
            className="absolute inset-0 w-full h-full z-10 transition-transform duration-300"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* States */}
            <g id="states-group">
              {projectedStates.map((state: any) => {
                const isSelected = selectedStateId === state.id
                const isHovered = hoveredStateId === state.id
                const fill = isSelected ? 'rgba(6, 182, 212, 0.18)' : 'rgba(8, 16, 32, 0.35)'
                const stroke = isHovered ? '#00f2ff' : (isSelected ? '#00f2ff' : 'rgba(20, 184, 166, 0.2)')
                return (
                  <path
                    key={`map-state-${state.id}`}
                    d={state.path}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    onClick={() => handleStateClick(state.id)}
                    onMouseEnter={() => setHoveredStateId(state.id)}
                    onMouseLeave={() => setHoveredStateId(null)}
                    className="cursor-pointer transition-all duration-200 hover:fill-cyan-500/10"
                  />
                )
              })}
            </g>
            {/* Network Connections */}
            {layers.networks && (
              <g id="network-links" className="pointer-events-none" opacity="0.8">
                {HUB_CONNECTIONS.map(([fromId, toId], idx) => {
                  const fromNode = commandNodes.get(fromId)
                  const toNode = commandNodes.get(toId)
                  if (!fromNode || !toNode) return null

                  const fromMeta = STATE_DATA[fromId]
                  const toMeta = STATE_DATA[toId]
                  const isAlert = (fromMeta && fromMeta.status !== 'Operational') || (toMeta && toMeta.status !== 'Operational')
                  const strokeColor = isAlert ? 'rgba(245, 158, 11, 0.25)' : 'rgba(6, 182, 212, 0.3)'
                  const particleColor = isAlert ? '#f59e0b' : '#00f2ff'

                  return (
                    <g key={`link-${idx}`}>
                      <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
                      <circle r="1.2" fill={particleColor}>
                        <animateMotion
                          dur={`${1.8 + (idx % 4) * 0.3}s`}
                          repeatCount="indefinite"
                          path={`M ${fromNode.x},${fromNode.y} L ${toNode.x},${toNode.y}`}
                        />
                      </circle>
                    </g>
                  )
                })}
              </g>
            )}
            {/* Nodes */}
            <g id="nodes-group" className="pointer-events-none">
              {Array.from(commandNodes.values()).map((node) => {
                const isDelhi = node.id === 'dl'
                const isSelected = selectedStateId === node.id

                // Determine color based on metadata status
                const meta = STATE_DATA[node.id]
                let nodeColor = '#14b8a6' // default operational
                if (meta) {
                  if (meta.status === 'Incident') {
                    nodeColor = '#ef4444'
                  } else if (meta.status === 'Warning') {
                    nodeColor = '#f59e0b'
                  }
                }
                if (isSelected) {
                  nodeColor = '#00f2ff'
                }

                return (
                  <g key={`node-${node.id}`}>
                    {/* Pulsing Halos */}
                    {(isDelhi || isSelected || (meta && meta.status !== 'Operational')) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isDelhi ? 10 : 7}
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth="1"
                        className="animate-pulse opacity-45"
                        style={{ animationDuration: isDelhi ? '1.8s' : '2.5s' }}
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isDelhi ? 6 : (isSelected ? 4.5 : 3)}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isDelhi ? 2.5 : (isSelected ? 2 : 1.5)}
                      fill={nodeColor}
                    />
                  </g>
                )
              })}
            </g>
            {/* Incident / Warning centroids markers */}
            <g id="alert-markers" className="pointer-events-none">
              {commandNodes.get('up') && (
                <g transform={`translate(${commandNodes.get('up')!.x}, ${commandNodes.get('up')!.y - 12})`}>
                  <circle r="3" fill="#f59e0b" className="animate-ping" />
                  <polygon points="0,-4 3,2 -3,2" fill="#f59e0b" />
                </g>
              )}
              {commandNodes.get('tn') && (
                <g transform={`translate(${commandNodes.get('tn')!.x}, ${commandNodes.get('tn')!.y - 12})`}>
                  <circle r="3" fill="#ef4444" className="animate-ping" />
                  <path d="M-3,-3 L3,3 M3,-3 L-3,3" stroke="#ef4444" strokeWidth="1.2" />
                </g>
              )}
            </g>
          </svg>
          {/* Hover Tooltip */}
          {hoveredStateId && (
            <div
              className="absolute bg-slate-900/80 text-slate-200 text-xs px-2 py-1 rounded shadow-lg"
              style={{
                left: `${((projectedStates.find((s: any) => s.id === hoveredStateId)?.cx || 0) / dimensions.width) * 100}%`,
                top: `${((projectedStates.find((s: any) => s.id === hoveredStateId)?.cy || 0) / dimensions.height) * 100}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div>{projectedStates.find((s: any) => s.id === hoveredStateId)?.name}</div>
              <div className="text-emerald-400">● Operational</div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-64 bg-slate-950/70 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between shrink-0 backdrop-blur-md text-left relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-cyan-500" />
          <div className="space-y-4">
            <div className="border-b border-slate-900/60 pb-2.5">
              <span className="text-[8px] font-bold font-mono tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">
                {selectedCity ? 'CITY / DISTRICT OVERVIEW' : 'NATIONAL REGISTRY'}
              </span>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono mt-2 flex items-center justify-between">
                <span>{selectedCity ? selectedCity : (selectedState ? selectedState.name : 'INDIA OVERVIEW')}</span>
                {!selectedState && !selectedCity && <span className="text-[7.5px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-bold">LIVE</span>}
              </h4>
            </div>
            {selectedCity ? (
              // STATE 3 — DISTRICT / CITY OVERVIEW
              <div className="space-y-3 font-mono text-[10px] text-slate-400 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <span className="flex-1">Operational Status:</span>
                  <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>OPERATIONAL</span>
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span>Active Incidents:</span>
                  <span className="text-slate-200 font-bold">
                    {selectedCity.toLowerCase() === 'visakhapatnam' ? '42 (DEMO)' : '00 (DEMO)'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span>Hospitals Count:</span>
                  <span className="text-slate-200 font-bold">
                    {selectedCity.toLowerCase() === 'visakhapatnam' ? '18 (DEMO)' : '06 (DEMO)'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span>Telemetry Sensors:</span>
                  <span className="text-slate-200 font-bold">120 (DEMO)</span>
                </div>

                {/* Ward / Local Operations */}
                <div className="pt-2 border-t border-slate-900/60 space-y-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Local Jurisdiction</span>
                  <div className="text-[9.5px] text-slate-350 font-mono">
                    {selectedCity.toLowerCase() === 'visakhapatnam' ? '98 Active Wards synced' : '24 Local sectors synced'}
                  </div>
                </div>

                {/* COMMAND CENTER ACTION */}
                <div className="pt-2.5 border-t border-slate-900/60 space-y-2">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">OPERATIONAL CONSOLE</div>
                  <div className="text-[10px] text-slate-200 font-bold">{selectedCity.toUpperCase()} COMMAND CENTER</div>
                  <Link href="/dashboard/city">
                    <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-2 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition transform hover:scale-[1.02]">
                      OPEN COMMAND CENTER →
                    </button>
                  </Link>
                </div>
              </div>
            ) : selectedState ? (<>
              {/* STATE 2 — STATE OVERVIEW */}
              <div className="space-y-3 font-mono text-[10px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="flex-1">Operational Status:</span>
                  <span className={`flex items-center space-x-1 font-bold ${
                    selectedState.status === 'Incident' ? 'text-red-400' :
                    selectedState.status === 'Warning' ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedState.status === 'Incident' ? 'bg-red-500 animate-pulse' :
                      selectedState.status === 'Warning' ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'
                    }`} />
                    <span>{selectedState.status.toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span>Connected Nodes:</span>
                  <span className="text-slate-200 font-bold">{selectedState.connectedNodes}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span>Active Incidents:</span>
                  <span className={`font-bold ${selectedState.activeIncidents > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                    {selectedState.activeIncidents}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5">
                  <span>Emergency Resources:</span>
                  <span className="text-slate-200 font-bold">{selectedState.resources}</span>
                </div>
                {/* State Health Indicator */}
                <div className="mt-2 border-t border-slate-900/40 pt-2">
                  <div className="text-[9px] text-cyan-400 font-medium mb-1">REGIONAL HEALTH</div>
                  <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                    <div className={`h-full ${
                      selectedState.status === 'Incident' ? 'bg-red-500' :
                      selectedState.status === 'Warning' ? 'bg-yellow-500' : 'bg-cyan-405'
                    }`} style={{ width: selectedState.status === 'Incident' ? '78%' : selectedState.status === 'Warning' ? '88%' : '96%' }} />
                  </div>
                  <div className="text-[8px] text-slate-400 mt-1 flex justify-between">
                    <span>STATUS RATIO</span>
                    <span className="font-bold">{selectedState.status === 'Incident' ? '78.5%' : selectedState.status === 'Warning' ? '88.1%' : '96.3%'}</span>
                  </div>
                </div>
                {selectedState.city && (
                  <div className="pt-2 border-t border-slate-900/60 space-y-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Available Command Centers</span>
                    <button
                      onClick={() => setSelectedCity(selectedState.city || null)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                        selectedCity === selectedState.city
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-355 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{selectedState.city.toUpperCase()}</span>
                      <span className="text-[8px] font-bold uppercase shrink-0">Select</span>
                    </button>
                  </div>
                )}
                {/* HOW TO EXPLORE */}
                <div className="mt-3 pt-2 border-t border-slate-900">
                  <div className="text-[9px] font-bold text-cyan-400 mb-1.5 tracking-wider">HOW TO EXPLORE</div>
                  <ol className="list-decimal list-inside space-y-1 text-[8.5px] text-slate-400 font-mono">
                    <li><span className="text-sky-400">STATE</span> – click node on map</li>
                    <li><span className="text-sky-400">DISTRICT</span> – select regional node</li>
                    <li><span className="text-sky-400">COMMAND</span> – load operations desk</li>
                  </ol>
                </div>
              </div>
              {/* CTA Button */}
              <div className="mt-4">
                <Link href="/dashboard/state">
                  <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-2 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition transform hover:scale-[1.02]">
                    Explore State Twin →
                  </button>
                </Link>
              </div>
            </>) : (
              // STATE 1 — NATIONAL OVERVIEW
              <div className="space-y-3 font-mono text-[10px] text-slate-400 animate-fadeIn">
                <div className="p-2 bg-slate-950/40 border border-slate-900/50 rounded-lg space-y-1.5">
                  <div className="text-[9px] font-bold text-slate-400">COMMAND CONTROL STATUS</div>
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>OPERATIONAL (SIMULATED)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                  <div className="flex justify-between items-center">
                    <span>Total Districts:</span>
                    <span className="text-slate-200 font-bold">788</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>State Hubs Connect:</span>
                    <span className="text-slate-200 font-bold">28/28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Incident Feed:</span>
                    <span className="text-rose-450 font-bold">12 (DEMO)</span>
                  </div>
                </div>

                <div className="p-2 bg-cyan-950/15 border border-cyan-500/10 rounded-lg text-[9px] leading-relaxed text-slate-400 mt-2">
                  <p>
                    Click on any interactive state node (such as <strong className="text-cyan-400 hover:underline cursor-pointer" onClick={() => handleStateClick('ap')}>Andhra Pradesh</strong> or <strong className="text-cyan-400 hover:underline cursor-pointer" onClick={() => handleStateClick('mh')}>Maharashtra</strong>) to inspect regional telemetry datasets.
                  </p>
                </div>

                {/* HOW TO EXPLORE */}
                <div className="mt-3 pt-2 border-t border-slate-900">
                  <div className="text-[9px] font-bold text-cyan-400 mb-1.5 tracking-wider">HOW TO EXPLORE</div>
                  <ol className="list-decimal list-inside space-y-1 text-[8.5px] text-slate-400 font-mono">
                    <li><span className="text-sky-400">STATE</span> – click node on map</li>
                    <li><span className="text-sky-400">DISTRICT</span> – select regional node</li>
                    <li><span className="text-sky-400">COMMAND</span> – load operations desk</li>
                  </ol>
                </div>

                {/* CTA Button */}
                <div className="mt-4">
                  <Link href="/dashboard/national">
                    <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-2 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition transform hover:scale-[1.02]">
                      Explore National Twin →
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#060a13]/95 border-t border-slate-800/80 text-[8.5px] text-slate-450 flex justify-center py-1.5 overflow-x-auto whitespace-nowrap backdrop-blur-md z-20">
        <div className="flex space-x-5 font-mono">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>NETWORK HEALTH (DEMO): <strong className="text-cyan-300 font-bold">{DEMO_STATS.networkHealth}</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>COMMAND NODES (DEMO): <strong className="text-cyan-300 font-bold">{DEMO_STATS.commandNodes}</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>TWIN NODES (DEMO): <strong className="text-cyan-300 font-bold">{DEMO_STATS.twinNodes}</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>ACTIVE STATES (DEMO): <strong className="text-cyan-300 font-bold">{DEMO_STATS.activeStates}</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <AlertCircle className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>HIGH ALERT AREAS (DEMO): <strong className="text-rose-300 font-bold">{DEMO_STATS.highAlertAreas}</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>LAST SYNC (DEMO): <strong className="text-cyan-300 font-bold">{DEMO_STATS.lastSync}</strong></span>
          </span>
        </div>
      </div>
    </div>
  )
}

// Helper to map GeoJSON feature to normalized id
const getNormalizedId = (feature: any): string => {
  const iso = feature.properties.iso_3166_2 || ''
  const parts = iso.split('-')
  if (parts.length === 2) return parts[1].toLowerCase()
  const name = (feature.properties.name || '').toLowerCase()
  if (name.includes('delhi')) return 'dl'
  if (name.includes('goa')) return 'ga'
  if (name.includes('sikkim')) return 'sk'
  if (name.includes('tripura')) return 'tr'
  if (name.includes('pondicherry') || name.includes('puducherry')) return 'py'
  if (name.includes('chandigarh')) return 'ch'
  if (name.includes('daman') || name.includes('dadra')) return 'dh'
  if (name.includes('andaman')) return 'an'
  if (name.includes('lakshadweep')) return 'ld'
  if (name.includes('jammu')) return 'jk'
  if (name.includes('ladakh')) return 'la'
  return name.slice(0, 2)
}
