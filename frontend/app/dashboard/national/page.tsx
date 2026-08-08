'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Flame,
  HeartPulse,
  Truck,
  Activity,
  Cpu,
  TrendingUp,
  Users,
  Compass,
  MapPin,
  MessageSquare,
  Send,
  Zap,
  Radio,
  Sparkles,
  Server,
  CloudRain,
  Layers,
  Database,
  Search,
  Bell,
  Play,
  FileText,
  CornerDownLeft,
  Minimize2,
  Car,
  Waves
} from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker, MapPolygon, MapHeatPoint } from '../../../components/ui/MapContainer'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart as RechartsBarChart, 
  Bar, 
  Cell, 
  PieChart as RechartsPieChart, 
  Pie 
} from 'recharts'

// Mock Data for Charts
const responseTimeData = [
  { time: '00:00', duration: 4.2 },
  { time: '04:00', duration: 3.8 },
  { time: '08:00', duration: 5.1 },
  { time: '12:00', duration: 6.2 },
  { time: '16:00', duration: 4.8 },
  { time: '20:00', duration: 3.9 },
  { time: '24:00', duration: 3.2 }
]

const departmentPerformanceData = [
  { name: 'Police', efficiency: 94, color: '#38bdf8' },
  { name: 'Fire', efficiency: 91, color: '#f59e0b' },
  { name: 'Health', efficiency: 88, color: '#10b981' },
  { name: 'Hazmat', efficiency: 85, color: '#a855f7' },
  { name: 'Traffic', efficiency: 96, color: '#06b6d4' }
]

const resourceAllocationData = [
  { name: 'Active Patrols', value: 420, fill: '#38bdf8' },
  { name: 'Fire Tenders', value: 85, fill: '#f59e0b' },
  { name: 'Ambulances', value: 140, fill: '#10b981' },
  { name: 'Rescue Teams', value: 95, fill: '#a855f7' }
]

const incidentTrendsData = [
  { day: 'Mon', incidents: 38 },
  { day: 'Tue', incidents: 42 },
  { day: 'Wed', incidents: 56 },
  { day: 'Thu', incidents: 48 },
  { day: 'Fri', incidents: 64 },
  { day: 'Sat', incidents: 72 },
  { day: 'Sun', incidents: 45 }
]

// Mock Map Markers (Vizag Centered coordinates)
const mapMarkers: MapMarker[] = [
  { id: 'm-1', position: [17.7200, 83.3150], title: 'MVP Colony Flooding', description: 'Critical water depth logged: 4.3m', category: 'critical' },
  { id: 'm-2', position: [17.7120, 83.3050], title: 'Traffic Gridlock NH16', description: 'Beach bypass gridlocked due to water clogging', category: 'high' },
  { id: 'm-3', position: [17.7050, 83.2850], title: 'Visakhapatnam Fire HQ', description: '4 hazmat response tenders on standby', category: 'low' },
  { id: 'm-4', position: [17.7250, 83.3320], title: 'NTR General Hospital', description: 'Emergency trauma beds available: 42', category: 'info' },
  { id: 'm-5', position: [17.6850, 83.2200], title: 'Gajuwaka Industrial Incident', description: 'Chemical vapor sensor threshold breach', category: 'critical' }
]

// Mock Map Polygons representing Flood Zones/Danger Sectors
const mapPolygons: MapPolygon[] = [
  {
    id: 'poly-1',
    positions: [
      [17.7250, 83.3100],
      [17.7300, 83.3250],
      [17.7150, 83.3300],
      [17.7100, 83.3150]
    ],
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.18,
    label: 'MVP Sector 4 Critical Inundation Zone'
  },
  {
    id: 'poly-2',
    positions: [
      [17.6950, 83.2100],
      [17.6900, 83.2300],
      [17.6750, 83.2350],
      [17.6780, 83.2150]
    ],
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.12,
    label: 'Gajuwaka Industrial Alert Area'
  }
]

// Mock Heatpoints
const mapHeatpoints: MapHeatPoint[] = [
  { position: [17.7200, 83.3150], radius: 600, color: '#ef4444' },
  { position: [17.6850, 83.2200], radius: 800, color: '#f59e0b' }
]

// AI Agents definition
interface AIAgent {
  name: string
  status: 'online' | 'processing' | 'standby' | 'offline'
  confidence: number
  latency: number
  task: string
}

export default function NationalCommandPage() {
  const [agents, setAgents] = useState<AIAgent[]>([
    { name: 'Coordinator', status: 'online', confidence: 99.4, latency: 12, task: 'Orchestrating agent workflows' },
    { name: 'Citizen Agent', status: 'online', confidence: 96.8, latency: 45, task: 'Synthesizing voice emergency feeds' },
    { name: 'Weather Sensor', status: 'online', confidence: 98.2, latency: 18, task: 'Buffering IMD radar cyclone cones' },
    { name: 'Traffic Intel', status: 'processing', confidence: 95.4, latency: 68, task: 'Rerouting NH16 Beach Bypass grids' },
    { name: 'Healthcare Node', status: 'online', confidence: 97.9, latency: 22, task: 'Querying bed databases in Vizag' },
    { name: 'Emergency Dispatch', status: 'online', confidence: 99.1, latency: 14, task: 'Triggering NDRF Battalion 10 links' },
    { name: 'Police Dispatch', status: 'standby', confidence: 94.8, latency: 25, task: 'Monitoring active patrol GPS coordinates' },
    { name: 'Fire Response', status: 'online', confidence: 96.2, latency: 31, task: 'Deploying Gajuwaka Hazmat Tender 3' },
    { name: 'Infrastructure Node', status: 'online', confidence: 98.7, latency: 19, task: 'Polling city sump power statuses' },
    { name: 'Analytics Solver', status: 'online', confidence: 97.5, latency: 50, task: 'Compiling state response efficiency logs' },
    { name: 'Water Resources', status: 'processing', confidence: 98.1, latency: 75, task: 'Evaluating storm drain flow speed data' },
    { name: 'Power Grid Control', status: 'standby', confidence: 99.0, latency: 8, task: 'Monitoring high tension substations' },
    { name: 'Cyber Security Shield', status: 'online', confidence: 99.9, latency: 5, task: 'Hardening federated login endpoints' }
  ])

  // Incident log states
  const [incidentLogs, setIncidentLogs] = useState([
    { id: 1, time: '22:14:02', msg: 'Critical flood warning triggered: MVP colony Sector 4 waterlogged.', type: 'critical' },
    { id: 2, time: '22:15:30', msg: 'NIC secure SSO handshake verified for State Operations AP.', type: 'info' },
    { id: 3, time: '22:18:11', msg: 'Fire Hazmat response deployed to Gajuwaka Sector 12.', type: 'warning' },
    { id: 4, time: '22:20:45', msg: 'Dewatering pump M-12 activated at Ward 12 storm drain.', type: 'success' }
  ])

  // Chat message simulation states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'NEOC Lead', text: 'Confirming coordinate overlays with Visakhapatnam command center.', time: '22:10' },
    { sender: 'AI Coordinator', text: 'Spatial GIS twin synchronized. Heatmap outlines flood zones.', time: '22:11' }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Simulation overlays
  const [actionAlert, setActionAlert] = useState<string | null>(null)

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Simulated live metrics updates
  const [activeCount, setActiveCount] = useState(48)
  const [criticalCount, setCriticalCount] = useState(12)
  const [hospitalBeds, setHospitalBeds] = useState(1482)

  useEffect(() => {
    const timer = setInterval(() => {
      // Random walk on numbers to simulate live operational updates
      setActiveCount(c => Math.max(30, c + (Math.random() > 0.55 ? 1 : -1)))
      setCriticalCount(c => Math.max(5, c + (Math.random() > 0.6 ? 1 : -1)))
      setHospitalBeds(b => Math.max(1400, b + (Math.random() > 0.5 ? 2 : -2)))

      // Randomize AI Agents latency slightly
      setAgents(prev => prev.map(a => ({
        ...a,
        latency: Math.max(4, Math.floor(a.latency + (Math.random() > 0.5 ? 2 : -2)))
      })))
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = { sender: 'NEOC Lead', text: chatInput, time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiReply = { 
        sender: 'AI Coordinator', 
        text: `Command received. Triggering deployment analysis for query "${chatInput}". Confidence: 98.4%.`, 
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
      }
      setChatMessages(prev => [...prev, aiReply])
    }, 1200)
  }

  const triggerQuickAction = (actionName: string) => {
    setActionAlert(`${actionName} SEQUENCE ENGAGED`)
    
    // Add to incident logs
    const now = new Date().toLocaleTimeString('en-US', { hour12: false })
    const newLog = { 
      id: Date.now(), 
      time: now, 
      msg: `System trigger: "${actionName}" executed from Operations Board.`, 
      type: actionName === 'SOS TRIGGER' ? 'critical' : 'warning' 
    }
    setIncidentLogs(prev => [newLog, ...prev])

    setTimeout(() => setActionAlert(null), 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 text-slate-200">
        
        {/* ACTION FLASHING NOTIFICATION */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-xl border border-red-500/40 bg-red-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center font-mono text-sm font-bold text-red-300 flex items-center space-x-3.5 tracking-wider animate-pulse"
            >
              <AlertCircle className="w-5 h-5 animate-spin" />
              <span>{actionAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. TOP PREMIUM DENSE KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-3">
          
          {/* KPI 1 */}
          <div className="p-3 rounded-xl border border-red-900/60 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.06)] flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-[7.5px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">CRITICAL</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider font-mono truncate">Active Incidents</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{activeCount}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate flex items-center space-x-1 border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="truncate text-red-450">All India Sync</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="p-3 rounded-xl border border-amber-900/60 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.06)] flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[7.5px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">WARNING</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono truncate">Critical Alerts</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{criticalCount}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-400 font-mono">Monsoonal System</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">ACTIVE</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Police Units</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">420</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-emerald-400 font-mono">94% Deployment</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[7.5px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">STANDBY</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Fire Units</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">85</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">Hazmat Crews Ready</span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">READY</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Ambulances</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">140</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-emerald-400 font-mono">12m avg response</span>
            </div>
          </div>

          {/* KPI 6 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <HeartPulse className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">CAPACITY</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Hospital Beds</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">{hospitalBeds}</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">Trauma Reserve</span>
            </div>
          </div>

          {/* KPI 7 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">METEOROLOGY</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Weather Temp</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">29°C</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-blue-400 font-mono">Cyclone Depression</span>
            </div>
          </div>

          {/* KPI 8 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">RESOURCES</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">NDRF Teams</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">1,480</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">10 Battalions Ready</span>
            </div>
          </div>

          {/* KPI 9 */}
          <div className="p-3 rounded-xl border border-purple-900/60 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.06)] flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0">COGNITIVE</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider font-mono truncate">AI Confidence</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">98.4%</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate flex items-center space-x-1 border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
              <span className="truncate text-purple-400 font-mono">Multi-Agent Active</span>
            </div>
          </div>

          {/* KPI 10 */}
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[115px] min-w-0 transition-all duration-200">
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-[7.5px] font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 shrink-0">PORTAL</span>
            </div>
            <div className="space-y-0.5 text-left mt-2 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">Citizens Online</p>
              <h3 className="text-xl font-black text-slate-100 font-mono leading-none">24.2K</h3>
            </div>
            <div className="text-[8px] font-bold text-slate-500 mt-2 truncate border-t border-slate-900/40 pt-1.5 min-w-0">
              <span className="truncate text-slate-450 font-mono">Linked Portal Nodes</span>
            </div>
          </div>

        </div>
        {/* 2. DYNAMIC WORKSPACE GRID (LEFT AGENTS PANEL, CENTER MAP, RIGHT OPERATIONAL LOGS) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
          
          {/* A. LEFT COLUMN: AI OPERATIONS PANEL (All 13 AI Agents) */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-3.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">AI Cognitive Agents</h4>
              </div>
              <span className="text-[9px] font-bold text-slate-500 font-mono shrink-0">13 NODES RUNNING</span>
            </div>

            {/* Scrolling agent list container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-950">
              {agents.map((agent) => {
                const getAgentIcon = (name: string) => {
                  const cn = "w-4 h-4 shrink-0"
                  if (name.includes('Coordinator')) return <Compass className={`${cn} text-sky-400`} />
                  if (name.includes('Citizen')) return <Users className={`${cn} text-purple-400`} />
                  if (name.includes('Weather')) return <CloudRain className={`${cn} text-yellow-400`} />
                  if (name.includes('Traffic')) return <Car className={`${cn} text-orange-400`} />
                  if (name.includes('Healthcare')) return <HeartPulse className={`${cn} text-rose-400`} />
                  if (name.includes('Emergency')) return <AlertTriangle className={`${cn} text-red-400`} />
                  if (name.includes('Police')) return <Shield className={`${cn} text-blue-500`} />
                  if (name.includes('Fire')) return <Flame className={`${cn} text-amber-500`} />
                  if (name.includes('Infrastructure')) return <Server className={`${cn} text-slate-400`} />
                  if (name.includes('Analytics')) return <TrendingUp className={`${cn} text-teal-400`} />
                  if (name.includes('Water')) return <Waves className={`${cn} text-blue-500`} />
                  if (name.includes('Power Grid')) return <Zap className={`${cn} text-yellow-500`} />
                  return <Cpu className={`${cn} text-purple-400`} />
                }

                return (
                  <div 
                    key={agent.name}
                    className="p-3 rounded-xl border border-slate-900/60 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-800 transition-all flex flex-col space-y-1.5 group cursor-pointer min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center space-x-2 min-w-0">
                        {getAgentIcon(agent.name)}
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{agent.name}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 font-mono text-[9px] shrink-0 ml-2">
                        <span className="text-purple-400">{agent.confidence}% conf</span>
                        <span className="text-slate-650">•</span>
                        <span className="text-slate-500">{agent.latency}ms</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono break-words whitespace-normal leading-normal">
                      <span className="text-slate-600 font-bold mr-1">&gt;_</span>
                      {agent.task}
                    </p>

                    {/* Pulse wave heartbeat indicator */}
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 pt-0.5 border-t border-slate-900/40 shrink-0">
                      <span className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                          agent.status === 'online' ? 'bg-emerald-500 animate-pulse' :
                          agent.status === 'processing' ? 'bg-purple-500 animate-ping' :
                          agent.status === 'standby' ? 'bg-amber-500' : 'bg-slate-600'
                        }`} />
                        <span>HEARTBEAT OK</span>
                      </span>
                      <svg className="w-10 h-3 text-sky-500/40 shrink-0" viewBox="0 0 100 30">
                        <path 
                          d="M0,15 L30,15 L40,5 L50,25 L60,10 L70,15 L100,15" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                        />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* B. CENTER COLUMN: LARGE DIGITAL TWIN MAP */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            
            {/* Header map controls */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 text-xs shrink-0">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-400 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">Digital Twin Spatial Map</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-400">
                <span className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5" />
                  <span>Sentinel-3 Live Feed</span>
                </span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-900">ZOOM: 12</span>
              </div>
            </div>

            {/* Map Canvas block */}
            <div className="flex-1 relative rounded-xl border border-slate-950 overflow-hidden bg-slate-950 h-[460px]">
              <MapContainer 
                center={[17.7200, 83.3150]} 
                zoom={12} 
                markers={mapMarkers}
                polygons={mapPolygons}
                heatpoints={mapHeatpoints}
              />

              {/* Floating controls overlays - Shifted down to top-16 to prevent overlapping default layers control button */}
              <div className="absolute top-16 right-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-2">
                <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Legend</h5>
                <div className="space-y-1.5 text-[9px] font-mono text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span>Critical Floods</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>Traffic Blockage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Hospitals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-lg border border-red-500 bg-red-950/20 block" />
                    <span>Flood Zone Boundary</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* C. RIGHT COLUMN: NATIONAL ALERTS, RECOMMENDATIONS, LOGS, SECURE CHAT */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            
            {/* National Alerts & Recommendations (Top) */}
            <div className="space-y-3.5 shrink-0">
              
              {/* National Alert */}
              <div className="p-3.5 rounded-xl border border-red-900/60 bg-red-950/30 text-xs flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h5 className="font-bold text-red-400 uppercase tracking-wider text-[10px] font-mono">NDMA Incident Warning</h5>
                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px] break-words whitespace-normal">
                    Heavy monsoonal depression active over Bay of Bengal. Tidal swell surge likely along Visakhapatnam Beach Road.
                  </p>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-3.5 rounded-xl border border-purple-900/60 bg-purple-950/30 text-xs flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="font-bold text-purple-400 uppercase tracking-wider text-[10px] font-mono">AI Cognitive Advisory</h5>
                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px] break-words whitespace-normal">
                    Deploy heavy dewatering pump M-12 to MVP colony immediately. Reroute beach transport via NH16 bypass.
                  </p>
                </div>
              </div>

            </div>

            {/* Live Operations Feed Log (Middle) */}
            <div className="flex-1 my-4 flex flex-col min-h-0 border-t border-b border-slate-900 py-3.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 block shrink-0">Incident Timeline Log</span>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-slate-950 text-[10px] font-mono">
                {incidentLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 py-1 border-b border-slate-900/40 min-w-0">
                    <span className="text-slate-500 font-bold shrink-0">{log.time}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                      log.type === 'critical' ? 'bg-red-500 animate-pulse' :
                      log.type === 'warning' ? 'bg-amber-500' :
                      log.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
                    }`} />
                    <p className="text-slate-300 leading-normal break-words whitespace-normal min-w-0 flex-1">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secure Command Chat Box (Bottom) */}
            <div className="flex flex-col min-h-0 bg-slate-950/60 rounded-xl border border-slate-900 p-3 shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 block flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Secure Command chat</span>
              </span>

              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[140px] pr-1 scrollbar-thin text-[10px] font-mono mb-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'NEOC Lead' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-1 mb-0.5 text-slate-500 text-[8px] font-bold uppercase">
                      <span>{msg.sender}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className={`p-2 rounded-lg max-w-[85%] leading-normal break-words whitespace-normal ${
                      msg.sender === 'NEOC Lead' 
                        ? 'bg-sky-600/90 text-white rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Query system coordinator..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500/50 min-w-0"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 hover:shadow-[0_0_10px_rgba(56,189,248,0.25)] text-white transition-all border border-sky-400/20 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* 3. CENTER BOTTOM CHARTS (Response Time, Department Performance, Resource Allocation, Incident Trends) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {/* Chart 1: Response Time */}
          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Response Time Telemetry</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Average dispatch duration (hours)</h4>
            </div>
            <div className="h-36 w-full mt-4 font-mono text-[9px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData}>
                  <defs>
                    <linearGradient id="gradientDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#38bdf8', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="duration" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#gradientDuration)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Department Performance */}
          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Agency Performance</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Efficiency rating percent</h4>
            </div>
            <div className="h-36 w-full mt-4 font-mono text-[9px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={departmentPerformanceData}>
                  <XAxis dataKey="name" stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8', fontSize: '10px' }}
                  />
                  <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                    {departmentPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Resource Allocation */}
          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Resource Deployment</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Deployment node share</h4>
            </div>
            <div className="h-36 w-full mt-4 flex items-center justify-between font-mono text-[9px] min-w-0">
              <div className="w-[60%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={resourceAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {resourceAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[40%] flex flex-col space-y-1 text-[9px] justify-center min-w-0">
                {resourceAllocationData.map((entry) => (
                  <div key={entry.name} className="flex items-center space-x-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-slate-400 truncate min-w-0">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 4: Incident Trends */}
          <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/70 p-4 relative overflow-hidden flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Weekly Incident Trends</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">Weekly volume index</h4>
            </div>
            <div className="h-36 w-full mt-4 font-mono text-[9px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentTrendsData}>
                  <defs>
                    <linearGradient id="gradientIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#a855f7', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="incidents" stroke="#a855f7" strokeWidth={1.5} fillOpacity={1} fill="url(#gradientIncidents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 4. EMERGENCY QUICK ACTIONS (Bottom Board controls) */}
        <div className="rounded-xl border border-slate-900 bg-[#0B0F19]/60 p-4 space-y-3">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Emergency Quick dispatch control board</span>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerQuickAction('NEW INCIDENT REGISTRATION')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Create Incident</span>
            </button>
            <button
              onClick={() => triggerQuickAction('BROADCAST EMERGENCY ALERT')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Broadcast Alert</span>
            </button>
            <button
              onClick={() => triggerQuickAction('POLICE DISPATCH INITIATION')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Deploy Police</span>
            </button>
            <button
              onClick={() => triggerQuickAction('FIRE RESPONSE DISPATCH')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Deploy Fire</span>
            </button>
            <button
              onClick={() => triggerQuickAction('AMBULANCE RESPONSE DISPATCH')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Dispatch Ambulance</span>
            </button>
            <button
              onClick={() => triggerQuickAction('GENERATING REGULATORY AUDIT REPORT')}
              className="h-10 px-4 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 min-w-[140px] flex-1 min-w-0"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Generate Report</span>
            </button>
            <button
              onClick={() => triggerQuickAction('SOS TRIGGER')}
              className="h-10 px-4 rounded-lg border border-red-500 bg-red-950/80 hover:bg-red-950 text-red-200 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer border-dashed shrink-0 min-w-[140px] flex-1 min-w-0 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]"
            >
              <Zap className="w-3.5 h-3.5 text-red-500 animate-bounce shrink-0" />
              <span className="truncate">SOS PANIC</span>
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
