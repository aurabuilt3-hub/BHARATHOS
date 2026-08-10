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
  Waves,
  Clock,
  Check
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

// Detailed list of incidents to map to the Queue
const detailedIncidents = [
  { id: 'm-1', name: 'MVP Colony Flooding', location: 'MVP Colony, Ward 12', type: 'Flood', severity: 'critical', status: 'Assigned', eta: '8m', affectedPeople: '120', affectedRoads: 'Mudasarlova Arterial', weather: 'Heavy Rain (78mm)', aiConf: '98.4%', desc: 'Breach of storm drain sump limits. Localized residential flooding logged in sector 4.', rec: 'Dispatch dewatering pump M-12. Reroute via Beach Road.' },
  { id: 'm-2', name: 'Traffic Gridlock NH16', location: 'NH16 Expressway Bypass', type: 'Traffic', severity: 'high', status: 'In Progress', eta: '12m', affectedPeople: '500', affectedRoads: 'NH16 Bypass Northbound', weather: 'Overcast, wet asphalt', aiConf: '95.4%', desc: 'Extreme gridlock at bypass intersection. Standing water up to 1.2 feet.', rec: 'Divert heavy cargo transit to inner bypass road.' },
  { id: 'm-3', name: 'Visakhapatnam Fire HQ', location: 'Fire HQ, Sector 3', type: 'Hazmat', severity: 'low', status: 'Standby', eta: '0m', affectedPeople: '0', affectedRoads: 'None', weather: 'Overcast', aiConf: '99.1%', desc: 'Routine operational standby of 4 specialized fire tenders.', rec: 'Maintain ready alert status for district deploy.' },
  { id: 'm-4', name: 'NTR General Hospital', location: 'Hospital Lane, Vizag', type: 'Medical', severity: 'low', status: 'Monitoring', eta: '5m', affectedPeople: '42 beds free', affectedRoads: 'Hospital Access Road', weather: 'Overcast', aiConf: '97.9%', desc: 'Emergency trauma center status check. 42 critical care reserve beds confirmed.', rec: 'Keep coordinates open for incoming emergency transports.' },
  { id: 'm-5', name: 'Gajuwaka Gas Triage', location: 'Gajuwaka Industrial Area', type: 'Hazmat', severity: 'critical', status: 'Assigned', eta: '15m', affectedPeople: '350', affectedRoads: 'Gajuwaka Main Arterial', weather: 'Windy (18km/h SW)', aiConf: '96.2%', desc: 'Sensor threshold breach indicating minor chemical vapor release. Containment in progress.', rec: 'Isolate Sector 12. Deploy Hazmat Tender 3 and alert local health nodes.' }
]

export default function NationalCommandPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('m-1')
  
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setCurrentDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase())
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const selectedIncident = detailedIncidents.find(i => i.id === selectedIncidentId) || detailedIncidents[0]

  // Simulation state for approvals alerts
  const [actionAlert, setActionAlert] = useState<string | null>(null)
  
  const triggerQuickAction = (actionName: string) => {
    setActionAlert(`${actionName} SEQUENCE ENGAGED`)
    setTimeout(() => setActionAlert(null), 3000)
  }

  return (
    <DashboardLayout
      hideHeader={true}
      hideRightPanel={true}
      hideBreadcrumbs={true}
      hideStatusBar={true}
    >
      <div className="flex flex-col min-h-screen text-slate-100 font-sans bg-[#030712] p-4 space-y-4">
        
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

        {/* HEADER BAR */}
        <header className="flex items-center justify-between border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md rounded-2xl px-5 py-3 shrink-0 shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
            </div>
            <span className="text-slate-800 text-lg">|</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">INCIDENT COMMAND CENTER</h2>
                <span className="bg-red-500 text-white font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded animate-pulse uppercase tracking-wider">LIVE</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Real-time incident monitoring, triage & response management</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-450 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>NEOC SECURE CHANNEL</span>
            </div>
            <div className="hidden md:flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>29°C | HUMIDITY 92%</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-mono font-bold">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{currentDate} {currentTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold border-l border-slate-855 pl-4">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-mono font-bold border border-slate-700">
                DC
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] leading-tight text-white font-bold font-mono">District Collector</p>
                <p className="text-[8.5px] leading-none text-slate-400">Visakhapatnam Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* TOP KPI ROW */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">Active Incidents</span>
            <h3 className="text-lg font-black text-red-400 font-mono leading-none mt-1">48</h3>
            <span className="text-[8px] text-red-500 font-mono">Total unresolved</span>
          </div>
          <div className="p-3 rounded-xl border border-red-950/60 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.06)] flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">Critical Warnings</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">12</h3>
            <span className="text-[8px] text-red-400 font-mono">Breaching safety limits</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">In Progress</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">18</h3>
            <span className="text-[8px] text-sky-400 font-mono">Teams actively handling</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Resolved Today</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">32</h3>
            <span className="text-[8px] text-emerald-500 font-mono">Closed ticket logs</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Avg Response Time</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">8.4 mins</h3>
            <span className="text-[8px] text-slate-450 font-mono">Dispatches telemetry</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Pending Approvals</span>
            <h3 className="text-lg font-black text-amber-500 font-mono leading-none mt-1">4</h3>
            <span className="text-[8px] text-amber-550/80 font-mono">Awaiting coordinator</span>
          </div>
        </section>

        {/* MAIN WORKSPACE split grid */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch flex-1 min-h-[440px]">
          
          {/* LEFT COLUMN: Live Incident Map (~34% width - represented as 4/12 cols) */}
          <div className="xl:col-span-4 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-white uppercase tracking-wider">Live Incident Area</h4>
              </div>
              <span className="text-[8px] text-slate-500 font-bold">ZOOM: 12.5</span>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-950 overflow-hidden min-h-[260px] bg-slate-950">
              <MapContainer
                center={[17.7200, 83.3150]}
                zoom={12.5}
                markers={mapMarkers}
                polygons={mapPolygons}
                heatpoints={mapHeatpoints}
              />
              
              {/* Map Floating Legend overlay */}
              <div className="absolute top-4 right-4 z-[999] p-3 rounded-lg border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1.5 text-[8.5px] font-mono text-slate-350">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Critical Incidents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>High Delays</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Hospitals</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Incident Queue (~42% width - represented as 5/12 cols) */}
          <div className="xl:col-span-5 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Incident queue stream</h4>
              </div>
              <span className="text-[8.5px] font-bold text-slate-500 font-mono">5 ACTIVE TELEMETRIES</span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 text-[10px] text-slate-450 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-1">Incident</th>
                    <th className="py-2 px-1">Location</th>
                    <th className="py-2 px-1">Type</th>
                    <th className="py-2 px-1">Severity</th>
                    <th className="py-2 px-1">Status</th>
                    <th className="py-2 px-1">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-[10.5px]">
                  {detailedIncidents.map((inc) => {
                    let sevColor = 'text-blue-400'
                    if (inc.severity === 'critical') sevColor = 'text-red-400 font-bold animate-pulse'
                    else if (inc.severity === 'high') sevColor = 'text-orange-400 font-bold'
                    else if (inc.severity === 'medium') sevColor = 'text-yellow-400'

                    return (
                      <tr 
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className={`hover:bg-slate-900/50 transition-all cursor-pointer ${selectedIncidentId === inc.id ? 'bg-slate-900 border-l-2 border-sky-500' : ''}`}
                      >
                        <td className="py-3 px-1 font-bold text-white max-w-[120px] truncate">{inc.name}</td>
                        <td className="py-3 px-1 text-slate-400 truncate max-w-[110px]">{inc.location}</td>
                        <td className="py-3 px-1 text-slate-300">{inc.type}</td>
                        <td className={`py-3 px-1 uppercase ${sevColor}`}>{inc.severity}</td>
                        <td className="py-3 px-1 text-slate-400">{inc.status}</td>
                        <td className="py-3 px-1 text-slate-200">{inc.eta}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: Incident Details (~24% width - represented as 3/12 cols) */}
          <div className="xl:col-span-3 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Incident Details</h4>
              </div>
              <span className="text-[8.5px] font-bold text-sky-400 bg-sky-950/20 border border-sky-900/30 px-1.5 py-0.5 rounded font-mono shrink-0 uppercase">{selectedIncident.id}</span>
            </div>

            {/* Scrollable details wrapper */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
              
              {/* Core header title details */}
              <div className="space-y-1">
                <h5 className="font-extrabold text-white text-sm">{selectedIncident.name}</h5>
                <p className="text-[9.5px] text-slate-400 font-mono">Reported Zone: {selectedIncident.location}</p>
              </div>

              {/* Triage Matrix Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-b border-slate-900/60 py-2.5">
                <div>
                  <span className="text-slate-500">Severity:</span>
                  <span className={`font-bold ml-1.5 uppercase ${selectedIncident.severity === 'critical' ? 'text-red-400 animate-pulse' : selectedIncident.severity === 'high' ? 'text-orange-400' : 'text-slate-200'}`}>{selectedIncident.severity}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <span className="text-slate-200 font-bold ml-1.5">{selectedIncident.status}</span>
                </div>
                <div>
                  <span className="text-slate-500">Affected Wards:</span>
                  <span className="text-slate-200 ml-1.5">{selectedIncident.affectedPeople} residents</span>
                </div>
                <div>
                  <span className="text-slate-500">Road Clutter:</span>
                  <span className="text-slate-200 ml-1.5">{selectedIncident.affectedRoads}</span>
                </div>
                <div>
                  <span className="text-slate-500">Weather:</span>
                  <span className="text-slate-200 ml-1.5">{selectedIncident.weather}</span>
                </div>
                <div>
                  <span className="text-slate-500">AI Confidence:</span>
                  <span className="text-purple-400 font-bold ml-1.5">{selectedIncident.aiConf}</span>
                </div>
              </div>

              {/* Incident log summary */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">Description log</span>
                <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-900/40">
                  {selectedIncident.desc}
                </p>
              </div>

              {/* AI advisory citation */}
              <div className="space-y-1 p-2.5 rounded-lg border border-purple-900/35 bg-purple-950/15">
                <span className="text-[8.5px] font-bold text-purple-400 uppercase tracking-widest font-mono block">AI Advisor Recommendation</span>
                <p className="text-[10px] text-purple-300 font-mono leading-relaxed">
                  {selectedIncident.rec}
                </p>
              </div>

              {/* Action Buttons Panel */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 shrink-0 border-t border-slate-900/50 mt-2">
                <button 
                  onClick={() => triggerQuickAction(`APPROVED DISPATCH FOR ${selectedIncident.id.toUpperCase()}`)}
                  className="py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold font-mono tracking-wider transition-all text-[9.5px] uppercase cursor-pointer text-center"
                >
                  Approve Plan
                </button>
                <button 
                  onClick={() => triggerQuickAction(`ESCALATED INCIDENT ${selectedIncident.id.toUpperCase()}`)}
                  className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-red-400 font-bold font-mono tracking-wider border border-red-950/40 transition-all text-[9.5px] uppercase cursor-pointer text-center"
                >
                  Escalate
                </button>
                <button 
                  onClick={() => triggerQuickAction(`EDIT DIALOG FOR ${selectedIncident.id.toUpperCase()}`)}
                  className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-350 font-mono transition-all text-[9px] uppercase cursor-pointer text-center"
                >
                  Edit Incident
                </button>
                <button 
                  onClick={() => triggerQuickAction(`ADD NOTE TO ${selectedIncident.id.toUpperCase()}`)}
                  className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-350 font-mono transition-all text-[9px] uppercase cursor-pointer text-center"
                >
                  Add Note
                </button>
              </div>

            </div>
          </div>

        </section>

        {/* LOWER WORKSPACE CHARTS & LOGS */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 shrink-0">
          
          {/* Chart 1: Breakdown */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Incident Breakdown</span>
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={resourceAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={38}
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
          </div>

          {/* Chart 2: Trends */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Incident Trend index</span>
            <div className="h-32 w-full mt-2 text-[8px] font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData}>
                  <Area type="monotone" dataKey="duration" stroke="#38bdf8" strokeWidth={1} fillOpacity={0.15} fill="#38bdf8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Performance */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Response Efficiency</span>
            <div className="h-32 w-full mt-2 text-[8px] font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={departmentPerformanceData}>
                  <Bar dataKey="efficiency" radius={[2, 2, 0, 0]}>
                    {departmentPerformanceData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Log terminal ticker */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 col-span-1 xl:col-span-2 min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Live Operations Feed</span>
            <div className="space-y-1.5 text-[9px] font-mono text-slate-400 overflow-y-auto max-h-[105px] pr-0.5">
              <p className="border-b border-slate-900/60 pb-1 leading-normal">
                <span className="text-red-400 font-bold mr-1">[CRIT 22:14]:</span> MVP Colony drain sump breached 4.2m alert level.
              </p>
              <p className="border-b border-slate-900/60 pb-1 leading-normal">
                <span className="text-orange-400 font-bold mr-1">[WARN 22:15]:</span> Traffic gridlock NH16 bypass northbound.
              </p>
              <p className="leading-normal">
                <span className="text-emerald-400 font-bold mr-1">[INFO 22:18]:</span> Fire tenders 2 and 3 standby alert logged.
              </p>
            </div>
          </div>

        </section>

        {/* BOTTOM SYSTEM STATUS BAR */}
        <footer className="border border-slate-900 bg-[#0B0F19]/90 rounded-xl px-4 py-2 shrink-0 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">GRID STATUS:</span>
              <span className="text-emerald-400 font-bold uppercase">NORMAL</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">SCADA NODES:</span>
              <span className="text-slate-200">98 ONLINE</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">ACTIVE TERMINALS:</span>
              <span className="text-slate-200">14 CONNECTED</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">LATENCY:</span>
              <span className="text-sky-400">1.2ms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">ENCRYPTION:</span>
              <span className="text-slate-200 uppercase">AES-256</span>
            </div>
          </div>
        </footer>

      </div>
    </DashboardLayout>
  )
}
