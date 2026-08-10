'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Flame, 
  Layers, 
  Wind,
  Plus,
  Minus
} from 'lucide-react'
import { geoMercator, geoPath } from 'd3-geo'

// Import GeoJSON source of truth
import IndiaGeoJSON from '../../src/data/IndiaGeoJSON.json'

interface StateMetadata {
  capital: string
  status: 'connected' | 'warning' | 'incident'
  districts: number
  activeIncidents: number
  depts: string[]
  confidence: number
}

// Complete operational metadata for all states and Union Territories
const STATE_METADATA: Record<string, StateMetadata> = {
  dl: { capital: 'Delhi', status: 'connected', districts: 11, activeIncidents: 0, depts: ['Police', 'Fire', 'Health', 'NDMA'], confidence: 99.8 },
  mh: { capital: 'Mumbai', status: 'connected', districts: 36, activeIncidents: 0, depts: ['Police', 'Fire', 'Health', 'NDMA', 'IMD'], confidence: 99.4 },
  gj: { capital: 'Ahmedabad', status: 'connected', districts: 33, activeIncidents: 0, depts: ['Police', 'Fire', 'Health', 'NDMA'], confidence: 99.1 },
  rj: { capital: 'Jaipur', status: 'connected', districts: 33, activeIncidents: 0, depts: ['Police', 'Fire', 'NDMA'], confidence: 98.9 },
  up: { capital: 'Lucknow', status: 'warning', districts: 75, activeIncidents: 2, depts: ['Police', 'Fire', 'NDMA', 'IMD'], confidence: 96.5 },
  mp: { capital: 'Bhopal', status: 'connected', districts: 52, activeIncidents: 0, depts: ['Police', 'Fire', 'Health'], confidence: 99.0 },
  tg: { capital: 'Hyderabad', status: 'connected', districts: 33, activeIncidents: 0, depts: ['Police', 'Fire', 'NDMA'], confidence: 99.3 },
  ka: { capital: 'Bengaluru', status: 'connected', districts: 31, activeIncidents: 0, depts: ['Police', 'Fire', 'Health', 'NDMA'], confidence: 99.2 },
  tn: { capital: 'Chennai', status: 'incident', districts: 38, activeIncidents: 4, depts: ['Police', 'Fire', 'Health', 'NDMA', 'IMD'], confidence: 94.2 },
  ap: { capital: 'Visakhapatnam', status: 'connected', districts: 26, activeIncidents: 0, depts: ['Police', 'Fire', 'NDMA'], confidence: 99.1 },
  or: { capital: 'Bhubaneswar', status: 'warning', districts: 30, activeIncidents: 1, depts: ['Police', 'NDMA', 'IMD'], confidence: 97.8 },
  wb: { capital: 'Kolkata', status: 'connected', districts: 23, activeIncidents: 0, depts: ['Police', 'Fire', 'Health', 'IMD'], confidence: 99.0 },
  as: { capital: 'Guwahati', status: 'warning', districts: 35, activeIncidents: 1, depts: ['Police', 'Fire', 'NDMA', 'IMD'], confidence: 98.2 },
  jk: { capital: 'Srinagar', status: 'connected', districts: 20, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 98.7 },
  br: { capital: 'Patna', status: 'connected', districts: 38, activeIncidents: 0, depts: ['Police', 'Fire', 'Health'], confidence: 98.5 },
  jh: { capital: 'Ranchi', status: 'connected', districts: 24, activeIncidents: 0, depts: ['Police', 'Health'], confidence: 99.0 },
  ct: { capital: 'Raipur', status: 'connected', districts: 28, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 98.8 },
  pb: { capital: 'Chandigarh', status: 'connected', districts: 23, activeIncidents: 0, depts: ['Police', 'Fire'], confidence: 99.1 },
  kl: { capital: 'Trivandrum', status: 'connected', districts: 14, activeIncidents: 0, depts: ['Police', 'Fire', 'Health', 'NDMA'], confidence: 99.4 },
  ut: { capital: 'Dehradun', status: 'connected', districts: 13, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.1 },
  hp: { capital: 'Shimla', status: 'connected', districts: 12, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.3 },
  tr: { capital: 'Agartala', status: 'connected', districts: 8, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.2 },
  sk: { capital: 'Gangtok', status: 'connected', districts: 6, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.5 },
  ga: { capital: 'Panaji', status: 'connected', districts: 2, activeIncidents: 0, depts: ['Police', 'Fire', 'Health'], confidence: 99.7 },
  la: { capital: 'Leh', status: 'connected', districts: 2, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.6 },
  an: { capital: 'Port Blair', status: 'connected', districts: 3, activeIncidents: 0, depts: ['Police', 'NDMA', 'IMD'], confidence: 99.1 },
  ld: { capital: 'Kavaratti', status: 'connected', districts: 1, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.8 },
  py: { capital: 'Puducherry', status: 'connected', districts: 4, activeIncidents: 0, depts: ['Police', 'Health'], confidence: 99.5 },
  ar: { capital: 'Itanagar', status: 'connected', districts: 25, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.1 },
  nl: { capital: 'Kohima', status: 'connected', districts: 16, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.0 },
  mn: { capital: 'Imphal', status: 'connected', districts: 16, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 98.9 },
  mz: { capital: 'Aizawl', status: 'connected', districts: 11, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.2 },
  ml: { capital: 'Shillong', status: 'connected', districts: 12, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.3 },
  ch: { capital: 'Chandigarh', status: 'connected', districts: 1, activeIncidents: 0, depts: ['Police', 'Fire'], confidence: 99.9 },
  dh: { capital: 'Daman', status: 'connected', districts: 3, activeIncidents: 0, depts: ['Police', 'NDMA'], confidence: 99.8 }
}

const DISPLAY_LABELS_SET = new Set([
  'jk', 'pb', 'hr', 'rj', 'gj', 'mh', 'mp', 'up', 'br', 'jh', 'wb', 'or', 'ct', 'tg', 'ap', 'ka', 'tn', 'kl', 'as', 'la', 'ut', 'hp', 'ga', 'tr', 'sk'
])

// Reduced node density (approx 20-25% reduction: down from 35 states/UTs to 24 key backbone nodes)
const VISIBLE_NODE_IDS = new Set([
  'dl', 'mh', 'gj', 'rj', 'up', 'mp', 'tg', 'ka', 'tn', 'ap', 'or', 'wb', 'as', 'jk', 'br', 'jh', 'kl', 'la', 'pb', 'ut', 'hp', 'ga', 'py', 'ch'
])

// Clean hierarchical backbone routing network matching the design parameters
const HUB_CONNECTIONS: [string, string][] = [
  // Delhi National Primary Hub -> Commands Tree
  ['dl', 'ch'], // Delhi -> Chandigarh
  ['dl', 'rj'], // Delhi -> Jaipur
  ['dl', 'up'], // Delhi -> Lucknow
  ['dl', 'br'], // Delhi -> Patna
  ['dl', 'wb'], // Delhi -> Kolkata
  ['dl', 'tg'], // Delhi -> Hyderabad
  ['dl', 'ka'], // Delhi -> Bengaluru

  // Secondary Connections
  ['up', 'br'], // Lucknow -> Patna
  ['br', 'wb'], // Patna -> Kolkata
  ['wb', 'as'], // Kolkata -> Guwahati
  ['tg', 'ka'], // Hyderabad -> Bengaluru
  ['tg', 'tn'], // Hyderabad -> Chennai
  ['tg', 'ap'], // Hyderabad -> Visakhapatnam
  ['rj', 'gj'], // Jaipur -> Ahmedabad
  ['gj', 'mh']  // Ahmedabad -> Mumbai
]

interface LabelConfig {
  id: string
  text: string
  x: number
  y: number
  textAnchor: 'start' | 'end' | 'middle'
  hasLeader: boolean
  leaderX?: number
  leaderY?: number
}

interface DistrictNode {
  id: string
  parentId: string
  x: number
  y: number
  status: 'connected' | 'warning' | 'incident'
}

interface ProjectedState {
  id: string
  name: string
  capital: string
  path: string
  cx: number
  cy: number
  status: 'connected' | 'warning' | 'incident'
  districts: number
  activeIncidents: number
  depts: string[]
  confidence: number
  bounds: [[number, number], [number, number]]
}

// Utility to normalize GeoJSON features to lowercase 2-letter state codes
const getNormalizedId = (feature: any): string => {
  const iso = feature.properties.iso_3166_2 || '';
  const parts = iso.split('-');
  if (parts.length === 2) {
    return parts[1].toLowerCase();
  }
  const name = (feature.properties.name || '').toLowerCase();
  if (name.includes('delhi')) return 'dl';
  if (name.includes('goa')) return 'ga';
  if (name.includes('sikkim')) return 'sk';
  if (name.includes('tripura')) return 'tr';
  if (name.includes('pondicherry') || name.includes('puducherry')) return 'py';
  if (name.includes('chandigarh')) return 'ch';
  if (name.includes('daman') || name.includes('dadra')) return 'dh';
  if (name.includes('andaman')) return 'an';
  if (name.includes('lakshadweep')) return 'ld';
  if (name.includes('jammu')) return 'jk';
  if (name.includes('ladakh')) return 'la';
  return name.slice(0, 2);
}

export default function IndiaDigitalTwin() {
  const [hoveredState, setHoveredState] = useState<ProjectedState | null>(null)
  const [layers, setLayers] = useState({
    gridLinks: true,
    emergencyPins: true,
    weatherHazards: true,
    boundaries: true
  })
  const [activeLayerPanel, setActiveLayerPanel] = useState(false)

  // Auto-fit & Projection configuration: uses D3 geoMercator fitted into a 600x700 viewport with 28px padding
  const { projectedStates, commandNodes, districtNodes, labelLayout } = useMemo(() => {
    const width = 600
    const height = 700
    const padding = 28

    const projection = geoMercator()
      .fitExtent([[padding, padding], [width - padding, height - padding]], IndiaGeoJSON as any)
    const pathGenerator = geoPath().projection(projection)

    // 1. Process state shapes and centroids
    const statesList: ProjectedState[] = (IndiaGeoJSON as any).features.map((feature: any) => {
      const id = getNormalizedId(feature)
      const meta = STATE_METADATA[id] || {
        capital: feature.properties.name || '',
        status: 'connected',
        districts: 10,
        activeIncidents: 0,
        depts: ['NDMA'],
        confidence: 99.0
      }

      const path = pathGenerator(feature) || ''
      const [cx, cy] = pathGenerator.centroid(feature) || [0, 0]
      const bounds = pathGenerator.bounds(feature) || [[0, 0], [0, 0]]

      return {
        id,
        name: feature.properties.name || '',
        capital: meta.capital,
        path,
        cx,
        cy,
        status: meta.status,
        districts: meta.districts,
        activeIncidents: meta.activeIncidents,
        depts: meta.depts,
        confidence: meta.confidence,
        bounds
      }
    })

    // 2. Extract command nodes coordinates: filters by VISIBLE_NODE_IDS to reduce map node density by ~25%
    const nodesMap = new Map<string, { x: number; y: number; id: string; status: string }>()
    statesList.forEach(s => {
      if (VISIBLE_NODE_IDS.has(s.id)) {
        nodesMap.set(s.id, { x: s.cx, y: s.cy, id: s.id, status: s.status })
      }
    })

    // Adjust Delhi slightly to visual center for better layout balance
    const dlNode = nodesMap.get('dl')
    if (dlNode) {
      dlNode.y -= 10
    }

    // 3. Dynamically distribute district nodes inside state bounds
    const districts: DistrictNode[] = []
    statesList.forEach(s => {
      // Only draw district nodes for states with warnings or incidents to represent dynamic telemetry
      if (s.status !== 'connected' || s.id === 'ka' || s.id === 'mh' || s.id === 'wb') {
        const stateW = s.bounds[1][0] - s.bounds[0][0]
        const stateH = s.bounds[1][1] - s.bounds[0][1]
        const radius = Math.min(stateW, stateH) * 0.22
        
        const count = s.status === 'incident' ? 3 : 2
        for (let i = 0; i < count; i++) {
          const angle = (i * 2 * Math.PI) / count + (s.id === 'tn' ? 0.3 : 0)
          const distStatus = i === 0 && s.status === 'incident' ? 'incident' : (i === 1 && s.status === 'warning' ? 'warning' : 'connected')
          districts.push({
            id: `${s.id}-dist-${i}`,
            parentId: s.id,
            x: s.cx + Math.cos(angle) * radius,
            y: s.cy + Math.sin(angle) * radius,
            status: distStatus as any
          })
        }
      }
    })

    // 4. Collision-resolved Label Layout using Force-Directed Relaxation
    const initialLabels: LabelConfig[] = statesList
      .filter(s => DISPLAY_LABELS_SET.has(s.id))
      .map(s => {
        // Handle small states with custom offset leader lines
        if (s.id === 'dl') {
          return { id: s.id, text: 'DELHI', x: s.cx + 50, y: s.cy - 12, textAnchor: 'start', hasLeader: true, leaderX: s.cx, leaderY: s.cy }
        }
        if (s.id === 'ga') {
          return { id: s.id, text: 'GOA', x: s.cx - 40, y: s.cy + 10, textAnchor: 'end', hasLeader: true, leaderX: s.cx, leaderY: s.cy }
        }
        if (s.id === 'sk') {
          return { id: s.id, text: 'SIKKIM', x: s.cx + 40, y: s.cy - 20, textAnchor: 'start', hasLeader: true, leaderX: s.cx, leaderY: s.cy }
        }
        if (s.id === 'tr') {
          return { id: s.id, text: 'TRIPURA', x: s.cx + 45, y: s.cy, textAnchor: 'start', hasLeader: true, leaderX: s.cx, leaderY: s.cy }
        }
        if (s.id === 'jh') {
          return { id: s.id, text: 'JHARKHAND', x: s.cx + 10, y: s.cy + 16, textAnchor: 'middle', hasLeader: false }
        }
        if (s.id === 'wb') {
          return { id: s.id, text: 'WEST BENGAL', x: s.cx + 25, y: s.cy + 5, textAnchor: 'start', hasLeader: false }
        }
        if (s.id === 'ut') {
          return { id: s.id, text: 'UTTARAKHAND', x: s.cx + 12, y: s.cy - 12, textAnchor: 'start', hasLeader: false }
        }
        if (s.id === 'hp') {
          return { id: s.id, text: 'HIMACHAL PRADESH', x: s.cx - 15, y: s.cy - 12, textAnchor: 'end', hasLeader: false }
        }
        // Centered labels by default for large states
        return {
          id: s.id,
          text: s.name.toUpperCase(),
          x: s.cx,
          y: s.cy + 3, // slightly drop center for node offset
          textAnchor: 'middle',
          hasLeader: false
        }
      })

    // Force relaxation algorithm
    const labels = initialLabels.map(l => ({ ...l }))
    const iterations = 25
    const collisionDist = 26 // separation boundary for labels
    
    // Command node centers to avoid overlap
    const avoidPoints = Array.from(nodesMap.values())

    for (let iter = 0; iter < iterations; iter++) {
      // Repel from key nodes
      for (const label of labels) {
        if (label.hasLeader) continue;
        for (const pt of avoidPoints) {
          const dx = label.x - pt.x
          const dy = label.y - pt.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < collisionDist + 8) {
            const force = (collisionDist + 8 - dist) * 0.35
            const angle = dist > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2
            label.x += Math.cos(angle) * force
            label.y += Math.sin(angle) * force
          }
        }
      }

      // Repel labels from each other
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const l1 = labels[i]
          const l2 = labels[j]
          const dx = l1.x - l2.x
          const dy = l1.y - l2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const targetDist = collisionDist + 10
          
          if (dist < targetDist) {
            const force = (targetDist - dist) * 0.25
            const angle = dist > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2
            
            if (!l1.hasLeader) {
              l1.x += Math.cos(angle) * force
              l1.y += Math.sin(angle) * force
            }
            if (!l2.hasLeader) {
              l2.x -= Math.cos(angle) * force
              l2.y -= Math.sin(angle) * force
            }
          }
        }
      }
    }

    return {
      projectedStates: statesList,
      commandNodes: nodesMap,
      districtNodes: districts,
      labelLayout: labels
    }
  }, [])

  // Emergency overlays dynamically positioned at node centers
  const emergencyOverlays = useMemo(() => {
    const dl = commandNodes.get('dl')
    const mh = commandNodes.get('mh')
    const list = []
    if (dl) {
      list.push({ id: 'o1', type: 'police', x: dl.x, y: dl.y - 12, label: 'Police HQ (Delhi)', icon: <Shield className="w-4 h-4" />, color: 'text-sky-400' })
    }
    if (mh) {
      list.push({ id: 'o2', type: 'fire', x: mh.x, y: mh.y - 12, label: 'Fire HQ (Mumbai)', icon: <Flame className="w-4 h-4" />, color: 'text-red-400' })
    }
    return list
  }, [commandNodes])

  return (
    <div className="relative w-full h-[720px] bg-[#040815] rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#050918] to-[#02050e] p-6 backdrop-blur-xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)] flex flex-col justify-between select-none">
      {/* Background patterns: reduced grid opacity and added soft radial light behind the map */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.22)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 opacity-18" /> {/* Reduced grid opacity slightly */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/5 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_99%,rgba(34,211,238,0.03)_100%)] bg-[size:100%_8px] pointer-events-none z-10 animate-[pulse_3s_infinite_ease-in-out]" />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 z-20 relative">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-500 animate-pulse" />
          <span className="text-[10px] font-bold font-mono tracking-widest text-slate-300">GOI DIGITAL TWIN MESH</span>
        </div>
        <button 
          onClick={() => setActiveLayerPanel(!activeLayerPanel)} 
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-800/80 bg-[#0B0F19]/90 text-[9px] font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-950 transition-all duration-200"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>GIS LAYERS</span>
        </button>
      </div>

      {/* Layer Control Panel */}
      <AnimatePresence>
        {activeLayerPanel && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }} 
            className="absolute top-16 right-5 z-30 w-[170px] rounded-2xl border border-slate-800 bg-[#0B0F19]/95 p-4 backdrop-blur-md shadow-2xl space-y-2.5 text-left"
          >
            <h5 className="text-[8.5px] font-extrabold tracking-wider text-slate-400 uppercase font-mono border-b border-slate-900 pb-1.5">GIS LAYERS CONTROL</h5>
            {Object.keys(layers).map((key) => (
              <button 
                key={key} 
                onClick={() => setLayers(p => ({ ...p, [key]: !p[key as keyof typeof layers] }))} 
                className="flex items-center justify-between w-full text-[9px] font-mono font-bold text-slate-300 hover:text-white py-0.5 transition-colors"
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={layers[key as keyof typeof layers] ? 'text-cyan-400' : 'text-slate-600'}>{layers[key as keyof typeof layers] ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Canvas */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 600 700">
        <defs>
          {/* Style element containing premium GPU-accelerated keyframe animations */}
          <style>{`
            @keyframes pulse-national {
              0% { r: 6px; opacity: 1; stroke-width: 1px; }
              50% { r: 26px; opacity: 0.45; stroke-width: 2.2px; }
              100% { r: 46px; opacity: 0; stroke-width: 0.5px; }
            }
            @keyframes pulse-regional {
              0% { r: 4.5px; opacity: 1; stroke-width: 1px; }
              50% { r: 16px; opacity: 0.4; stroke-width: 1.8px; }
              100% { r: 28px; opacity: 0; stroke-width: 0.4px; }
            }
            @keyframes pulse-state {
              0% { r: 3px; opacity: 1; stroke-width: 0.8px; }
              50% { r: 11px; opacity: 0.35; stroke-width: 1.2px; }
              100% { r: 19px; opacity: 0; stroke-width: 0.3px; }
            }
            @keyframes pulse-district {
              0% { r: 1.8px; opacity: 1; stroke-width: 0.5px; }
              50% { r: 7px; opacity: 0.35; stroke-width: 1px; }
              100% { r: 12px; opacity: 0; stroke-width: 0.2px; }
            }
            @keyframes pulse-warning {
              0% { r: 3px; opacity: 1; stroke-width: 1px; }
              50% { r: 14px; opacity: 0.45; stroke-width: 1.5px; }
              100% { r: 24px; opacity: 0; stroke-width: 0.3px; }
            }
            @keyframes pulse-incident {
              0% { r: 3px; opacity: 1; stroke-width: 1px; }
              50% { r: 14px; opacity: 0.45; stroke-width: 1.5px; }
              100% { r: 24px; opacity: 0; stroke-width: 0.3px; }
            }
            @keyframes routeFlow {
              from { stroke-dashoffset: 36; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes float-particle-1 {
              0% { transform: translate(0, 0); opacity: 0.1; }
              50% { transform: translate(15px, -20px); opacity: 0.45; }
              100% { transform: translate(0, 0); opacity: 0.1; }
            }
            @keyframes float-particle-2 {
              0% { transform: translate(0, 0); opacity: 0.15; }
              50% { transform: translate(-25px, 15px); opacity: 0.4; }
              100% { transform: translate(0, 0); opacity: 0.15; }
            }
            .route-path {
              stroke-dasharray: 8 6;
              animation: routeFlow 2.2s linear infinite;
            }
            .pulse-national { animation: pulse-national 4.5s ease-in-out infinite; }
            .pulse-regional { animation: pulse-regional 3.5s ease-in-out infinite; }
            .pulse-state { animation: pulse-state 3.5s ease-in-out infinite; }
            .pulse-district { animation: pulse-district 2.0s ease-in-out infinite; }
            .pulse-warning { animation: pulse-warning 2.5s ease-in-out infinite; }
            .pulse-incident { animation: pulse-incident 2.0s ease-in-out infinite; }
            .float-p1 { animation: float-particle-1 8s ease-in-out infinite; }
            .float-p2 { animation: float-particle-2 12s ease-in-out infinite; }
          `}</style>

          {/* Gradients */}
          <linearGradient id="networkLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#00f2ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.25" />
          </linearGradient>

          {/* Premium terrain gradients for states: Connected uses a Deep Teal gradient fill */}
          <linearGradient id="stateGradient-connected" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#042f2e" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#030b18" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="stateGradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3f2f0a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0d0802" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="stateGradient-incident" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c0519" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#120303" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.00" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
          </linearGradient>

          <radialGradient id="delhiCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>

          {/* Filters */}
          <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="delhiGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="hubGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="warningGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="incidentGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="cyanTextShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#06b6d4" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* Dynamic ambient scan grid telemetry */}
        <g id="bg-telemetry" className="opacity-25 pointer-events-none">
          <circle cx="300" cy="350" r="250" fill="none" stroke="rgba(6,182,212,0.22)" strokeWidth="1" strokeDasharray="3 9" className="animate-[spin_32s_linear_infinite]" />
          <circle cx="300" cy="350" r="160" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="0.8" strokeDasharray="6 12" className="animate-[spin_18s_linear_infinite]" />
        </g>

        {/* Ambient radial glow centered on Delhi command room */}
        {commandNodes.get('dl') && (
          <circle 
            cx={commandNodes.get('dl')!.x} 
            cy={commandNodes.get('dl')!.y} 
            r="280" 
            fill="url(#delhiCenterGlow)" 
            className="pointer-events-none" 
          />
        )}

        {/* Subtle GPU-accelerated floating ambient particles */}
        <g id="particles" className="pointer-events-none">
          <circle cx="150" cy="220" r="1.2" fill="#00f2ff" className="float-p1" />
          <circle cx="280" cy="180" r="1.5" fill="#00f2ff" className="float-p2" />
          <circle cx="450" cy="300" r="1.0" fill="#22d3ee" className="float-p1" style={{ animationDelay: '2s' }} />
          <circle cx="200" cy="450" r="1.3" fill="#22d3ee" className="float-p2" style={{ animationDelay: '4s' }} />
          <circle cx="350" cy="550" r="1.6" fill="#00f2ff" className="float-p1" style={{ animationDelay: '3s' }} />
          <circle cx="120" cy="360" r="1.1" fill="#00f2ff" className="float-p2" style={{ animationDelay: '1s' }} />
        </g>

        {/* State Boundaries: Soft background glow path */}
        <g id="states-glow" filter="url(#borderGlow)" className="pointer-events-none opacity-80">
          {projectedStates.map((state) => {
            const isHovered = hoveredState?.id === state.id
            const borderColors = {
              connected: isHovered ? 'rgba(0, 242, 255, 0.8)' : 'rgba(20, 184, 166, 0.22)',
              warning: isHovered ? 'rgba(251, 191, 36, 0.8)' : 'rgba(245, 158, 11, 0.3)',
              incident: isHovered ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.4)'
            }
            return (
              <path
                key={`glow-${state.id}`}
                d={state.path}
                fill="none"
                stroke={layers.boundaries ? borderColors[state.status] : 'none'}
                strokeWidth={isHovered ? 3.0 : 1.8}
              />
            )
          })}
        </g>

        {/* State Boundaries: Crisp front vector path + Hover interaction */}
        <g id="states-mesh" className="pointer-events-auto">
          {projectedStates.map((state) => {
            const isHovered = hoveredState?.id === state.id
            const fillGradient = `url(#stateGradient-${state.status})`
            const borderColors = {
              connected: isHovered ? '#00f2ff' : 'rgba(20, 184, 166, 0.35)',
              warning: isHovered ? '#fbbf24' : 'rgba(245, 158, 11, 0.45)',
              incident: isHovered ? '#f87171' : 'rgba(239, 68, 68, 0.55)'
            }

            return (
              <g key={`group-${state.id}`}>
                <path
                  d={state.path}
                  fill={layers.boundaries ? fillGradient : 'rgba(8, 16, 32, 0.4)'}
                  stroke={layers.boundaries ? borderColors[state.status] : 'rgba(15, 23, 42, 0.6)'}
                  strokeWidth={isHovered ? 1.5 : 1.0}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                  className="transition-all duration-250 cursor-pointer"
                />
                {/* Micro reflection top layer for premium glass effect */}
                {layers.boundaries && (
                  <path
                    d={state.path}
                    fill="url(#glassShine)"
                    className="pointer-events-none"
                  />
                )}
              </g>
            )
          })}
        </g>

        {/* Hierarchical Backbone Network Command routes (reduced opacity to 70% as requested) */}
        {layers.gridLinks && (
          <g id="networks" className="pointer-events-none" opacity="0.70"> {/* Reduced network route opacity to 70% */}
            {HUB_CONNECTIONS.map(([fromId, toId], index) => {
              const fromNode = commandNodes.get(fromId)
              const toNode = commandNodes.get(toId)
              
              if (!fromNode || !toNode) return null

              const x1 = fromNode.x
              const y1 = fromNode.y
              const x2 = toNode.x
              const y2 = toNode.y

              const dx = x2 - x1
              const dy = y2 - y1
              
              // Alternating perpendicular offsets for S-curve routing topology
              const offsetMult = (index % 2 === 0 ? 0.08 : -0.08)
              const cx1 = x1 + dx * 0.3 - dy * offsetMult
              const cy1 = y1 + dy * 0.3 + dx * offsetMult
              const cx2 = x1 + dx * 0.7 - dy * offsetMult
              const cy2 = y1 + dy * 0.7 + dx * offsetMult

              const pathD = `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`
              const packetAnimDuration = fromId === 'dl' ? '1.8s' : `${2.2 + (index % 3) * 0.4}s`
              
              // Primary routes (originating from Delhi) are 2.5px; secondary routes are 1.8px
              const routeWidth = fromId === 'dl' ? '2.5' : '1.8'
              const packetRadius = fromId === 'dl' ? 2.2 : 1.7

              return (
                <g key={`link-${fromId}-${toId}-${index}`}>
                  <path
                    d={pathD}
                    stroke="url(#networkLine)"
                    strokeWidth={routeWidth}
                    fill="none"
                    className="route-path"
                  />
                  {/* Flow packets along the curve representing real-time telemetry hops */}
                  <circle r={packetRadius} fill="#00f2ff" className="filter drop-shadow-[0_0_4px_#00f2ff]">
                    <animateMotion dur={packetAnimDuration} repeatCount="indefinite" path={pathD} />
                  </circle>
                </g>
              )
            })}
          </g>
        )}

        {/* Dynamic District Telemetry Nodes connected via local 1.0px routes */}
        {layers.gridLinks && (
          <g id="district-nodes" className="pointer-events-none">
            {districtNodes.map((dist) => {
              const parentNode = commandNodes.get(dist.parentId)
              if (!parentNode) return null

              // Draw subtle local 1.0px connection line from District Node to parent State Hub
              return (
                <g key={dist.id} className="opacity-70">
                  <line 
                    x1={dist.x} 
                    y1={dist.y} 
                    x2={parentNode.x} 
                    y2={parentNode.y} 
                    stroke="rgba(6,182,212,0.18)" 
                    strokeWidth="1.0" 
                    strokeDasharray="1.5 2.5" 
                  />
                  <circle
                    cx={dist.x}
                    cy={dist.y}
                    r="4.5"
                    fill="none"
                    className="pulse-district stroke-cyan-500/40"
                  />
                  <circle
                    cx={dist.x}
                    cy={dist.y}
                    r="1.5"
                    className={dist.status === 'incident' ? 'fill-red-500' : dist.status === 'warning' ? 'fill-amber-400' : 'fill-emerald-500'}
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* Command Nodes with concentric hub hierarchy */}
        <g id="capital-nodes" className="pointer-events-none">
          {Array.from(commandNodes.values()).map((node) => {
            const stateMeta = projectedStates.find(s => s.id === node.id)
            if (!stateMeta) return null

            let outerRadius = 7.5 // State node default
            let innerRadius = 2.5
            let glowFilter: string | undefined = undefined
            let pulseClass = 'pulse-state stroke-emerald-500/40'
            
            if (node.id === 'dl') {
              outerRadius = 18 // Delhi National Hub increased size as requested
              innerRadius = 6.5
              glowFilter = "url(#delhiGlow)"
              pulseClass = 'pulse-national stroke-cyan-400/60'
            } else if (['mh', 'gj', 'up', 'wb', 'tg', 'tn', 'ka', 'as'].includes(node.id)) {
              outerRadius = 11 // Regional secondary node
              innerRadius = 3.5
              glowFilter = node.status === 'incident'
                ? "url(#incidentGlow)"
                : node.status === 'warning'
                  ? "url(#warningGlow)"
                  : "url(#hubGlow)"
              pulseClass = 'pulse-regional stroke-cyan-500/50'
            } else {
              glowFilter = node.status === 'incident'
                ? "url(#incidentGlow)"
                : node.status === 'warning'
                  ? "url(#warningGlow)"
                  : undefined
              pulseClass = node.status === 'incident'
                ? 'pulse-incident stroke-red-500/50'
                : node.status === 'warning'
                  ? 'pulse-warning stroke-amber-400/50'
                  : 'pulse-state stroke-emerald-500/40'
            }

            const colorClass = node.status === 'incident' 
              ? 'fill-red-500' 
              : node.status === 'warning' 
                ? 'fill-amber-400' 
                : 'fill-emerald-400'

            return (
              <g key={`node-${node.id}`} filter={glowFilter}>
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={outerRadius} 
                  fill="none"
                  className={pulseClass}
                />
                {node.id === 'dl' && (
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r={outerRadius * 1.5} 
                    fill="none"
                    className="pulse-national stroke-cyan-400/30"
                    style={{ animationDuration: '4.5s' }}
                  />
                )}
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={innerRadius} 
                  className={colorClass}
                  stroke="#040815"
                  strokeWidth="1.2"
                />
              </g>
            )
          })}
        </g>

        {/* Collision-resolved State Labels & Leader lines */}
        <g id="city-labels" className="pointer-events-none select-none" filter="url(#cyanTextShadow)">
          {labelLayout.map((label) => {
            return (
              <g key={`label-group-${label.id}`}>
                {label.hasLeader && label.leaderX !== undefined && label.leaderY !== undefined && (
                  <line 
                    x1={label.leaderX} 
                    y1={label.leaderY} 
                    x2={label.x} 
                    y2={label.y} 
                    stroke="rgba(6,182,212,0.45)" 
                    strokeWidth="0.8" 
                    strokeDasharray="2 2" 
                  />
                )}
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.textAnchor}
                  className="fill-[#F8FAFC] font-mono text-[9.5px] font-bold tracking-wider antialiased"
                >
                  {label.text}
                </text>
              </g>
            )
          })}
        </g>

        {/* Emergency HQ icons overlays */}
        {layers.emergencyPins && (
          <g id="emergency-overlays" className="pointer-events-auto">
            {emergencyOverlays.map((item) => (
              <g key={item.id} className="cursor-pointer group">
                <circle
                  cx={item.x}
                  cy={item.y}
                  r="9"
                  className="fill-slate-950/95 stroke-slate-900 stroke-[1.2]"
                />
                <foreignObject
                  x={item.x - 6}
                  y={item.y - 6}
                  width="12"
                  height="12"
                  className={`flex items-center justify-center ${item.color}`}
                >
                  {item.icon}
                </foreignObject>
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect
                    x={item.x - 55}
                    y={item.y - 28}
                    width="110"
                    height="15"
                    rx="3"
                    className="fill-[#0B0F19]/95 stroke-slate-800/80 stroke-[0.8]"
                  />
                  <text
                    x={item.x}
                    y={item.y - 18}
                    textAnchor="middle"
                    className="fill-slate-300 font-mono text-[6.5px] font-bold tracking-wider"
                  >
                    {item.label}
                  </text>
                </g>
              </g>
            ))}
          </g>
        )}

        {/* Cyclone Warning over Bay of Bengal */}
        {layers.weatherHazards && (
          <g id="bay-of-bengal-cyclone" className="opacity-50 pointer-events-none">
            <path 
              d="M 405,430 C 405,430 435,400 465,420 C 495,440 495,470 465,480 C 435,490 405,460 405,430" 
              fill="none" 
              stroke="rgba(6,182,212,0.4)" 
              strokeWidth="5" 
              strokeDasharray="3 3"
              className="animate-[spin_12s_linear_infinite]"
              style={{ transformOrigin: '450px 450px' }}
            />
            <circle cx="450" cy="450" r="18" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" className="animate-[ping_3s_infinite]" />
            <foreignObject x="432" y="438" width="36" height="24">
              <div className="flex flex-col items-center justify-center text-amber-500 font-mono text-[6.5px] font-bold tracking-widest leading-none">
                <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="mt-0.5">STORM</span>
              </div>
            </foreignObject>
          </g>
        )}
      </svg>

      {/* Legend Map Indicator */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-3 bg-slate-950/85 border border-slate-900 px-3 py-1.5 rounded-lg text-[8.5px] font-mono font-bold text-slate-400 shadow-lg">
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Connected</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Command Center</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Warning</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Incident</span>
        </div>
      </div>

    </div>
  )
}
