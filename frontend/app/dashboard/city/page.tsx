'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import WeatherWidget from '../../../components/widgets/WeatherWidget'
import FloodRiskWidget from '../../../components/widgets/FloodRiskWidget'
import ResourceWidget from '../../../components/widgets/ResourceWidget'
import SensorWidget from '../../../components/widgets/SensorWidget'
import AISummaryWidget from '../../../components/widgets/AISummaryWidget'
import IncidentQueueWidget from '../../../components/widgets/IncidentQueueWidget'
import ActivityFeedWidget from '../../../components/widgets/ActivityFeedWidget'
import CommandWorkflowWidget from '../../../components/widgets/CommandWorkflowWidget'
import TimeMachineSlider from '../../../components/widgets/TimeMachineSlider'
import ChartCard from '../../../components/ui/ChartCard'
import PieChart from '../../../components/ui/PieChart'
import LineChart from '../../../components/ui/LineChart'
import { visakhapatnamCityData } from '../../../lib/mock/cities'
import { incidentCategoryPieData, responseTimeHistoryData } from '../../../lib/mock/analytics'
import { 
  Clock, 
  AlertTriangle, 
  Compass, 
  CloudRain, 
  Activity, 
  Shield, 
  Flame, 
  HeartPulse, 
  Truck, 
  Car, 
  Zap, 
  Server, 
  AlertCircle, 
  Check, 
  Map, 
  Thermometer, 
  Wind, 
  Droplets,
  HelpCircle,
  FileText,
  Cpu,
  MapPin
} from 'lucide-react'
import { 
  apiService, 
  BackendIncident, 
  BackendResource,
  BackendFacility,
  DashboardOverview
} from '../../../services/api'
import { AnimatePresence, motion } from 'framer-motion'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'

const cityMapMarkers: MapMarker[] = [
  { id: 'm-1', position: [17.7289, 83.3214], title: 'MVP Colony Waterlogging', description: 'Beach Road Sector 4 | Drain Sump Alert', category: 'critical' },
  { id: 'm-2', position: [17.7202, 83.3156], title: 'Siripuram Electrical Incident', description: 'Commercial Complex 2nd Floor', category: 'high' },
  { id: 'm-3', position: [17.6812, 83.2104], title: 'Gajuwaka Highway Collision', description: 'Gajuwaka Flyover | Traffic escorts on scene', category: 'critical' },
  { id: 'm-4', position: [17.8105, 83.3421], title: 'Madhurawada Pipeline Rupture', description: 'Zone 2 Main Line Breach', category: 'medium' },
  { id: 'm-5', position: [17.7250, 83.3320], title: 'NTR General Hospital', description: 'Level 1 Trauma | 42 ICU Beds Standby', category: 'low' },
  { id: 'm-6', position: [17.7120, 83.3050], title: 'Seven Hills Clinic', description: 'Emergency Health Node', category: 'low' },
  { id: 'm-7', position: [17.7200, 83.3150], title: 'Police Patrol Unit P-101', description: 'MVP Sector 2 Patrol | Speed 32km/h', category: 'info' },
  { id: 'm-8', position: [17.6850, 83.2200], title: 'Hazmat Tender FT-12', description: 'Gajuwaka Industrial Response', category: 'high' },
  { id: 'm-9', position: [17.7240, 83.3250], title: 'Ambulance A-21', description: 'En Route MVP -> NTR Hospital', category: 'high' }
]

type AdminLevel = 'national' | 'state' | 'district' | 'city' | 'ward'

export default function CityDashboardPage() {
  const [level, setLevel] = useState<AdminLevel>('city')
  const city = visakhapatnamCityData

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

  // E2E Dispatch Drawer & Reporting Modal state
  const [selectedIncident, setSelectedIncident] = useState<BackendIncident | null>(null)
  const [incidentResources, setIncidentResources] = useState<BackendResource[]>([])
  const [allDepartments, setAllDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [resources, setResources] = useState<BackendResource[]>([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportForm, setReportForm] = useState({
    category: 'Flood',
    title: '',
    description: '',
    severity: 'medium',
    latitude: 17.7289,
    longitude: 83.3214,
    address: 'Beach Road, Sector 4, MVP Colony'
  })
  
  const [submittingIncident, setSubmittingIncident] = useState(false)
  const [allocatingResourceId, setAllocatingResourceId] = useState<string | null>(null)
  const [assigningDeptId, setAssigningDeptId] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [actionAlert, setActionAlert] = useState<string | null>(null)

  // Live map and dashboard stats states
  const [incidents, setIncidents] = useState<BackendIncident[]>([])
  const [facilities, setFacilities] = useState<BackendFacility[]>([])
  const [stats, setStats] = useState<DashboardOverview | null>(null)

  // Fetch initial metadata and live command telemetry
  useEffect(() => {
    Promise.all([
      apiService.getDepartments(),
      apiService.getResources({ limit: 100 }),
      apiService.getIncidents({ limit: 100 }),
      apiService.getFacilities({ limit: 100 }),
      apiService.getDashboardOverview()
    ]).then(([deptsRes, resourcesRes, incidentsRes, facilitiesRes, statsRes]) => {
      setAllDepartments(deptsRes || [])
      setResources(resourcesRes.items || [])
      setIncidents(incidentsRes || [])
      setFacilities(facilitiesRes.items || [])
      setStats(statsRes)
    }).catch(err => {
      console.warn("Offline fallback loading metadata and stats", err)
    })
  }, [])

  // Convert DB items to map markers
  const incidentMarkers = incidents.map(inc => ({
    id: `inc-${inc.id}`,
    position: [inc.latitude, inc.longitude] as [number, number],
    title: `⚠️ [${inc.category.toUpperCase()}] ${inc.title}`,
    description: `${inc.description} • Status: ${inc.status}`,
    category: inc.severity === 'critical' ? 'critical' as const : inc.severity === 'high' ? 'high' as const : inc.severity === 'medium' ? 'medium' as const : 'low' as const
  }))

  const facilityMarkers = facilities.map(fac => {
    let emoji = '🏥'
    if (fac.facility_type === 'POLICE_STATION') emoji = '👮'
    if (fac.facility_type === 'FIRE_STATION') emoji = '🚒'
    return {
      id: `fac-${fac.id}`,
      position: [fac.latitude, fac.longitude] as [number, number],
      title: `${emoji} ${fac.name}`,
      description: `Type: ${fac.facility_type} • Address: ${fac.address || 'N/A'}`,
      category: 'info' as const
    }
  })

  const resourceMarkers = resources.map(res => {
    let emoji = '🚗'
    if (res.type === 'ambulance') emoji = '🚑'
    if (res.type === 'fire_truck') emoji = '🚒'
    if (res.type === 'patrol_car') emoji = '🚓'
    return {
      id: `res-${res.id}`,
      position: [res.latitude, res.longitude] as [number, number],
      title: `${emoji} ${res.name}`,
      description: `Type: ${res.type} • Status: ${res.status}`,
      category: 'info' as const
    }
  })

  const allMarkers = [...incidentMarkers, ...facilityMarkers, ...resourceMarkers].filter(m => m.position[0] !== undefined && m.position[1] !== undefined)

  const handleMarkerClick = (marker: MapMarker) => {
    const rawId = String(marker.id).replace(/^(inc|fac|res)-/, '')
    if (String(marker.id).startsWith('inc-')) {
      const inc = incidents.find(i => i.id === rawId)
      if (inc) {
        handleSelectIncident(inc)
      }
    }
  }

  // E2E Dispatch & workflow handler actions
  const handleSelectIncident = async (item: { id: string }) => {
    try {
      const inc = await apiService.getIncidentById(item.id)
      setSelectedIncident(inc)
      const res = await apiService.getIncidentResources(item.id)
      setIncidentResources(res || [])
    } catch (err) {
      console.error("Failed to load incident detail", err)
    }
  }

  // District Dashboard view
  if (level === 'district') {
    return (
      <DashboardLayout 
        userRole="admin"
        hideHeader={true}
        hideRightPanel={true}
        hideBreadcrumbs={true}
        hideStatusBar={true}
      >
        <div className="flex flex-col min-h-screen text-slate-100 font-sans bg-[#030712] p-4 space-y-4">
          
          {/* HEADER */}
          <header className="flex items-center justify-between border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md rounded-2xl px-5 py-3 shrink-0 shadow-lg">
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
              </div>
              <span className="text-slate-800 text-lg">|</span>
              <div>
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">DISTRICT COMMAND CENTER</h2>
                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Visakhapatnam District, Andhra Pradesh</p>
              </div>
            </div>

            {/* TELEMETRY */}
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/10 border border-emerald-900/30 rounded-lg px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE COMMAND STATUS</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-mono font-bold">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{currentDate} {currentTime}</span>
              </div>
              
              {/* Level switch tabs */}
              <div className="flex border border-slate-850 rounded-xl bg-[#050816] p-1 text-[9px] font-mono font-bold">
                {(['state', 'district', 'city'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setLevel(lvl)
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', lvl === 'city' ? '/dashboard/city' : `/dashboard/city?level=${lvl}`)
                      }
                    }}
                    className={`px-2 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      level === lvl
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold border-l border-slate-800 pl-4">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-mono font-bold border border-slate-700">
                  DC
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] leading-tight text-white font-bold font-mono">District Collector</p>
                  <p className="text-[8.5px] leading-none text-slate-400">Visakhapatnam</p>
                </div>
              </div>
            </div>
          </header>

          {/* KPI ROW */}
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 shrink-0">
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Incidents</span>
              <h3 className="text-xl font-black text-red-400 font-mono leading-none mt-1">24</h3>
              <span className="text-[8px] text-red-500 font-mono mt-1 border-t border-slate-900/50 pt-1">● Live Telemetry Feeds</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Response Teams</span>
              <h3 className="text-xl font-black text-emerald-400 font-mono leading-none mt-1">42</h3>
              <span className="text-[8px] text-emerald-500 font-mono mt-1 border-t border-slate-900/50 pt-1">On field dispatches</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Resources Available</span>
              <h3 className="text-xl font-black text-sky-400 font-mono leading-none mt-1">185</h3>
              <span className="text-[8px] text-slate-450 font-mono mt-1 border-t border-slate-900/50 pt-1">NDRF standby standard</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">People Affected</span>
              <h3 className="text-xl font-black text-white font-mono leading-none mt-1">2,480</h3>
              <span className="text-[8px] text-orange-400 font-mono mt-1 border-t border-slate-900/50 pt-1">Low-lying wards triage</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Shelters Open</span>
              <h3 className="text-xl font-black text-teal-400 font-mono leading-none mt-1">15</h3>
              <span className="text-[8px] text-teal-500 font-mono mt-1 border-t border-slate-900/50 pt-1">94% capacity free</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Pending Approvals</span>
              <h3 className="text-xl font-black text-amber-500 font-mono leading-none mt-1">3</h3>
              <span className="text-[8px] text-amber-500/80 font-mono mt-1 border-t border-slate-900/50 pt-1">Needs collector sign</span>
            </div>
          </section>

          {/* MAIN WORKSPACE ROW */}
          <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[420px]">
            
            {/* COLUMN 1: LIVE CITY MAP */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-sky-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">LIVE CITY MAP</h4>
                </div>
                <span className="text-[8px] font-bold text-emerald-400 font-mono uppercase tracking-wider">VISAKHAPATNAM</span>
              </div>

              {/* MAP CANVAS CONTAINER */}
              <div className="flex-1 relative rounded-xl border border-slate-950 bg-slate-950 overflow-hidden min-h-[280px]">
                <MapContainer
                  center={[17.6868, 83.2185]}
                  zoom={12}
                  markers={cityMapMarkers}
                />
              </div>

              {/* MAP SPATIAL FOOTER STATS */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center shrink-0 border-t border-slate-900/50 pt-2.5">
                <div>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Sector</p>
                  <p className="text-xs font-bold text-sky-400 font-mono mt-0.5">Vizag Urban</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Active Markers</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">{cityMapMarkers.length} Nodes</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Status</p>
                  <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">Live Sync</p>
                </div>
              </div>
            </div>

            {/* COLUMN 2: CRITICAL GAUGES */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Critical Telemetry Dials</h4>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">SCADA GAUGES</span>
              </div>

              <div className="flex-1 space-y-3.5 overflow-y-auto pr-0.5">
                {/* Gauge 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-350 font-bold">Ward 12 Storm Drain</span>
                    <span className="text-red-400 font-bold">4.15m / 4.2m Alert</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.5)]" style={{ width: '92.6%' }} />
                  </div>
                </div>

                {/* Gauge 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-350">Mudasarlova Reservoir</span>
                    <span className="text-amber-500">92% Capacity</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                {/* Gauge 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-350">Gajuwaka River Sump</span>
                    <span className="text-emerald-400">3.4m (Safe)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>

                {/* Gauge 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-350">Siripuram AQI</span>
                    <span className="text-emerald-400">42 Good</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '21%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: KEY TRAFFIC CORRIDORS */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Key Traffic Corridors</h4>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">TRANSIT FLOW</span>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-200">National Highway 16</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-orange-900/50 text-orange-400 bg-orange-950/20 uppercase shrink-0">HEAVY FLOW</span>
                </div>
                <div className="p-2.5 rounded-lg border border-red-900/40 bg-red-950/15 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-200">Beach Road corridor</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-900/50 text-red-400 bg-red-950/20 uppercase shrink-0">BLOCKED</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-200">Gajuwaka Junction</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-900/50 text-emerald-400 bg-emerald-950/20 uppercase shrink-0">NORMAL</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-200">VIP Road artery</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-900/50 text-emerald-400 bg-emerald-950/20 uppercase shrink-0">NORMAL</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-200">Dwaraka Nagar BRTS</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-yellow-900/50 text-yellow-400 bg-yellow-950/20 uppercase shrink-0">MODERATE</span>
                </div>
              </div>
            </div>

            {/* COLUMN 4: MULTI-AGENT AI ENGINE */}
            <div className="xl:col-span-1 rounded-2xl border border-purple-900/40 bg-purple-950/10 shadow-[0_0_20px_rgba(168,85,247,0.04)] p-4 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between border-b border-purple-900/20 pb-2.5 mb-2.5 shrink-0">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Multi-Agent AI Engine</h4>
                </div>
                <span className="text-[8px] text-purple-400 bg-purple-900/20 border border-purple-800/30 px-1.5 py-0.5 rounded font-mono shrink-0">ACTIVE</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                
                {/* Active Agent States */}
                <div className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/30 space-y-1.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono block">AI Safety Guarantee</span>
                  <div className="flex items-center space-x-2 text-[9px] text-orange-400 bg-orange-950/10 border border-orange-900/30 px-2 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
                    <span className="font-mono">MANDATORY HUMAN-IN-THE-LOOP APPROVAL</span>
                  </div>
                </div>

                {/* Coordinator reasoning */}
                <div className="p-3 rounded-xl border border-purple-900/30 bg-purple-950/20 space-y-1.5">
                  <span className="text-[8.5px] font-bold text-purple-400 uppercase tracking-wider font-mono block">Coordinator Advisor Reasoning</span>
                  <p className="text-[10px] text-slate-350 font-mono leading-relaxed">
                    Citizen Agent reports severe waterlogging on Beach Road. Weather Agent confirms monsoonal storm surge threshold breach. Traffic Agent recommends diversion to NH16 corridors.
                  </p>
                  <button className="w-full mt-1.5 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-white text-[10px] font-bold font-mono tracking-wider transition-all border border-purple-600/30 uppercase cursor-pointer">
                    Approve Dispatch Plan
                  </button>
                </div>

                {/* Active Agent States */}
                <div className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/20 space-y-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Agent Cluster heartbeats</span>
                  <div className="space-y-1 text-[9px] font-mono text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>🤖 Coordinator</span>
                      <span className="text-emerald-400 font-bold">● online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🤖 Weather triage</span>
                      <span className="text-emerald-400 font-bold">● online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🤖 Traffic routing</span>
                      <span className="text-purple-400 font-bold">● processing</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🤖 Hospital logistics</span>
                      <span className="text-emerald-400 font-bold">● online</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </section>

          {/* LOWER WORKSPACE SECTION */}
          <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 shrink-0">
            
            {/* Column 1 & 2: Incident Response Workflow & Live incident Queue */}
            <div className="xl:col-span-2 space-y-4">
              <CommandWorkflowWidget />
              <IncidentQueueWidget />
            </div>

            {/* Column 3: Charts */}
            <div className="xl:col-span-1 space-y-4">
              <ChartCard title="Incident Category Breakdown">
                <PieChart data={incidentCategoryPieData} />
              </ChartCard>

              {/* Resource deployment card */}
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-900 pb-2">Resource Deployments</h4>
                <div className="space-y-2 text-[10px] font-mono text-slate-350">
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span>Police Patrol Units:</span>
                    <span className="text-sky-400 font-bold">420 Active (94%)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span>Fire & Hazmat Tenders:</span>
                    <span className="text-amber-500 font-bold">85 Active</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span>Emergency Ambulances:</span>
                    <span className="text-emerald-400 font-bold">140 Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dewatering Pumps:</span>
                    <span className="text-emerald-400 font-bold">18 Deployed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Public Safety Assets & Heatmap */}
            <div className="xl:col-span-1 space-y-4">
              <ActivityFeedWidget />

              {/* Infrastructure SCADA alerts */}
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-900 pb-2">Infrastructure SCADA</h4>
                <div className="space-y-1.5 text-[9px] font-mono text-slate-450">
                  <p className="border-b border-slate-900/50 pb-1">
                    <span className="text-red-400 font-bold">CRIT:</span> Ward 12 Drain Sump telemetry link breach.
                  </p>
                  <p className="border-b border-slate-900/50 pb-1">
                    <span className="text-emerald-400 font-bold">OK:</span> MVP Substation L-12 feeder isolated.
                  </p>
                  <p>
                    <span className="text-emerald-400 font-bold">OK:</span> Siripuram AQI optical node clean.
                  </p>
                </div>
              </div>
            </div>

          </section>

          {/* BOTTOM STATUS BAR */}
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

  const handleReportIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingIncident(true)
    try {
      await apiService.createIncident({
        category: reportForm.category,
        title: reportForm.title,
        description: reportForm.description,
        latitude: reportForm.latitude,
        longitude: reportForm.longitude,
        address: reportForm.address,
        severity: reportForm.severity
      })
      
      // Close modal & reset
      setShowReportModal(false)
      setReportForm({
        category: 'Flood',
        title: '',
        description: '',
        severity: 'medium',
        latitude: 17.7289,
        longitude: 83.3214,
        address: 'Beach Road, Sector 4, MVP Colony'
      })
      
      setActionAlert("CITIZEN INCIDENT REPORTED")
      // Quick refresh page by resetting selected incident
      setSelectedIncident(null)
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      setActionAlert(`Report Failed: ${error.message || 'Error'}`)
    } finally {
      setSubmittingIncident(false)
    }
  }

  const handleAssignDept = async (deptId: string) => {
    if (!selectedIncident || !deptId) return
    setAssigningDeptId(deptId)
    try {
      await apiService.assignIncident(selectedIncident.id, deptId, "Dispatched from City Command Center")
      
      setSelectedIncident(prev => prev ? {
        ...prev,
        status: 'assigned',
        assignments: [{ department_id: deptId, notes: "Dispatched from City Command Center" }]
      } : null)
      
      setActionAlert("DEPARTMENT DISPATCHED")
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      setActionAlert(`Assign Failed: ${error.message || 'Error'}`)
    } finally {
      setAssigningDeptId(null)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedIncident) return
    setUpdatingStatus(status)
    try {
      await apiService.updateIncidentStatus(selectedIncident.id, status, "Status updated from city dashboard")
      
      setSelectedIncident(prev => prev ? {
        ...prev,
        status: status as BackendIncident['status']
      } : null)
      
      setActionAlert(`INCIDENT STATUS: ${status.toUpperCase()}`)
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      setActionAlert(`Update Failed: ${error.message || 'Error'}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleAllocateResource = async (resourceId: string) => {
    if (!selectedIncident || !resourceId) return
    setAllocatingResourceId(resourceId)
    try {
      await apiService.allocateIncidentResource(selectedIncident.id, resourceId)
      
      const updatedList = await apiService.getIncidentResources(selectedIncident.id)
      setIncidentResources(updatedList || [])
      
      const refreshedResources = await apiService.getResources({ limit: 100 })
      setResources(refreshedResources.items || [])
      
      setActionAlert("FLEET ASSET ALLOCATED")
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      setActionAlert(`Allocation Failed: ${error.message || 'Error'}`)
    } finally {
      setAllocatingResourceId(null)
    }
  }

  const handleReleaseResource = async (resourceId: string) => {
    if (!selectedIncident || !resourceId) return
    setAllocatingResourceId(resourceId)
    try {
      await apiService.releaseIncidentResource(selectedIncident.id, resourceId)
      
      const updatedList = await apiService.getIncidentResources(selectedIncident.id)
      setIncidentResources(updatedList || [])
      
      const refreshedResources = await apiService.getResources({ limit: 100 })
      setResources(refreshedResources.items || [])
      
      setActionAlert("RESOURCE RELEASED")
    } catch (err: unknown) {
      const error = err as Error
      console.error(error)
      setActionAlert(`Release Failed: ${error.message || 'Error'}`)
    } finally {
      setAllocatingResourceId(null)
    }
  }

  const getHeaderDetails = () => {
    switch (level as string) {
      case 'national':
        return {
          title: 'National Operations Command Center',
          desc: 'Unified administrative control covering all 28 States and 8 UTs. Live tracking of inter-state resource deployments.'
        }
      case 'state':
        return {
          title: 'State Operations Center - Andhra Pradesh',
          desc: 'Monitoring 26 districts, coastal IMD storm surge sectors, and state police deployment telemetry.'
        }
      case 'district':
        return {
          title: 'District Emergency Console - Visakhapatnam',
          desc: 'High-level coordinating views for Collector and SP. 148 active field response teams online.'
        }
      case 'ward':
        return {
          title: 'Ward Operations Center - Ward 45',
          desc: 'Micro-level GIS telemetry: Ward 12 & 45 storm drain water depth gauges and street flooding alert zones.'
        }
      case 'city':
      default:
        return {
          title: `Smart City Command Center - ${city.name}`,
          desc: `Real-time municipal digital twin telemetry, IoT sensor networks, and automated multi-agent triage (${city.zonesCount} zones, ${city.wardsCount} wards).`
        }
    }
  }

  const info = getHeaderDetails()

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6">
        
        {/* Action feedback flash */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl border border-sky-500/40 bg-sky-950/80 backdrop-blur-md shadow-2xl text-center font-mono text-xs font-bold text-sky-300 flex items-center space-x-2"
            >
              <span>{actionAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <PageHeader
          title={info.title}
          description={info.desc}
          breadcrumbs={[{ label: 'Home' }, { label: 'City Dashboard' }]}
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950 text-slate-350 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-sky-450 shrink-0" />
                <span>Report Incident</span>
              </button>
              <TimeMachineSlider />
              <div className="flex border border-slate-800 rounded-xl bg-[#050816] p-1 text-xs">
                {(['national', 'state', 'district', 'city', 'ward'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      level === lvl
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-panel border-l-4 border-l-red-500 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Active Incidents</span>
            <span className="text-xl font-extrabold text-white mt-2 font-mono">{stats?.active_incidents_count ?? 12}</span>
            <span className="text-[9px] text-red-400 mt-1 font-mono">● LIVE FEEDS ACTIVE</span>
          </div>
          <div className="glass-panel border-l-4 border-l-orange-500 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">High Risk Zones</span>
            <span className="text-xl font-extrabold text-white mt-2 font-mono">3</span>
            <span className="text-[9px] text-orange-400 mt-1 font-mono">MVP Colony, Beach Road, Gajuwaka</span>
          </div>
          <div className="glass-panel border-l-4 border-l-yellow-500 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Active Warnings</span>
            <span className="text-xl font-extrabold text-white mt-2 font-mono">{stats?.active_alerts_count ?? 4}</span>
            <span className="text-[9px] text-yellow-400 mt-1 font-mono">RED ALERT IS ACTIVE</span>
          </div>
          <div className="glass-panel border-l-4 border-l-emerald-500 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Resources Deployed</span>
            <span className="text-xl font-extrabold text-white mt-2 font-mono">{stats?.resources?.allocated ?? 8}</span>
            <span className="text-[9px] text-emerald-400 mt-1 font-mono">PUMPS, DRAINAGE VANS</span>
          </div>
          <div className="glass-panel border-l-4 border-l-blue-500 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Avg Response Time</span>
            <span className="text-xl font-extrabold text-white mt-2 font-mono">14.2m</span>
            <span className="text-[9px] text-blue-400 mt-1 font-mono">TARGET &lt; 15.0m</span>
          </div>
          <div className="glass-panel border-l-4 border-l-purple-500 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Areas at Risk</span>
            <span className="text-xl font-extrabold text-white mt-2 font-mono">6</span>
            <span className="text-[9px] text-purple-400 mt-1 font-mono">LOW-LYING COASTAL BASINS</span>
          </div>
        </div>

        {/* Large Interactive GIS Map */}
        <div className="h-[450px] w-full rounded-2xl border border-slate-900 overflow-hidden relative shadow-2xl">
          <MapContainer 
            center={[17.7289, 83.3214]} 
            zoom={13}
            markers={allMarkers}
            onMarkerClick={handleMarkerClick}
          />
          <div className="absolute top-4 right-4 z-[999] bg-[#020617]/95 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-350 shadow-2xl backdrop-blur-md max-w-xs space-y-2 pointer-events-none select-none">
            <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-extrabold text-white font-mono uppercase tracking-wider text-[10px]">GIS Control Center</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono-data text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-red-500 border border-white" />
              <span>Flooding Incidents</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono-data text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-white" />
              <span>Municipal Infrastructure</span>
            </div>
          </div>
        </div>

        {/* 1. Top Row: Weather & AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherWidget />
          <AISummaryWidget />
        </div>

        {/* 2. Middle Row: Resource, Sensor & Flood Risk Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResourceWidget />
          <SensorWidget />
          <FloodRiskWidget />
        </div>

        {/* 3. Incidents Queue & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CommandWorkflowWidget />
            <IncidentQueueWidget onSelectIncident={handleSelectIncident} />
          </div>

          <div className="space-y-6">
            <ActivityFeedWidget />
            <ChartCard title="Incident Category Breakdown">
              <PieChart data={incidentCategoryPieData} />
            </ChartCard>
            <ChartCard title="Average Response Time (Minutes)">
              <LineChart
                data={responseTimeHistoryData}
                xAxisKey="time"
                series={[{ key: 'avgMinutes', color: '#3b82f6', name: 'Avg Min' }]}
              />
            </ChartCard>
          </div>
        </div>

        {/* REPORT CITIZEN INCIDENT MODAL */}
        <AnimatePresence>
          {showReportModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Report Citizen Incident</h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-slate-400 hover:text-white text-xs border border-slate-800 bg-slate-950 px-2 py-1 rounded cursor-pointer"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <form onSubmit={handleReportIncidentSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Category</label>
                      <select
                        value={reportForm.category}
                        onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {['Flood', 'Fire', 'Medical', 'Accident', 'Garbage', 'Water Leakage', 'Pothole', 'Street Light Failure', 'Fallen Tree', 'Infrastructure Damage'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Severity</label>
                      <select
                        value={reportForm.severity}
                        onChange={(e) => setReportForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {['critical', 'high', 'medium', 'low'].map(sev => (
                          <option key={sev} value={sev}>{sev}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block font-bold font-mono">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Drainage clog on main street"
                      value={reportForm.title}
                      onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block font-bold font-mono">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detailed description of water depth, blockage details..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block font-bold font-mono">Address / Landmark</label>
                    <input
                      type="text"
                      placeholder="Beach Road MVP Sector 4"
                      value={reportForm.address}
                      onChange={(e) => setReportForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={reportForm.latitude}
                        onChange={(e) => setReportForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block font-bold font-mono">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={reportForm.longitude}
                        onChange={(e) => setReportForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingIncident}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                  >
                    {submittingIncident ? 'Registering...' : 'Submit Incident Report'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* INCIDENT DISPATCH DRAWER */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              className="fixed top-0 right-0 h-screen w-[420px] bg-[#0b0f19] border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[999] flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">Incident Dispatch Console</span>
                  <h3 className="text-sm font-extrabold text-white mt-1">Ticket: #{selectedIncident.ticket_number || 'N/A'}</h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-5 flex-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Category & Severity</span>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold text-white uppercase tracking-wider font-mono">
                      {selectedIncident.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded border font-bold uppercase tracking-wider font-mono ${
                      selectedIncident.severity === 'critical' ? 'bg-red-950 text-red-400 border-red-900' :
                      selectedIncident.severity === 'high' ? 'bg-orange-950 text-orange-400 border-orange-900' :
                      selectedIncident.severity === 'medium' ? 'bg-yellow-950 text-yellow-400 border-yellow-900' :
                      'bg-emerald-950 text-emerald-400 border-emerald-900'
                    }`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Title & Description</span>
                  <h4 className="font-extrabold text-slate-100 mt-1">{selectedIncident.title}</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">{selectedIncident.description}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Address & Coordinates</span>
                  <p className="text-slate-300 mt-1 leading-relaxed">Location: {selectedIncident.address || 'N/A'}</p>
                  <p className="text-slate-500 font-mono mt-0.5">[{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}]</p>
                </div>

                {/* AI Flood Response Advisor */}
                <div className="p-3.5 rounded-xl border border-purple-900/40 bg-purple-950/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">AI Flood Response Advisor</span>
                    <span className="text-[8px] font-mono font-bold bg-purple-950 px-2 py-0.5 rounded border border-purple-900/40 text-purple-300">ADVISORY MODE</span>
                  </div>
                  <p className="text-slate-350 leading-relaxed font-semibold">
                    Triage Priority: <span className="font-bold text-purple-300 uppercase">{selectedIncident.severity}</span>. Recommended routing of dewatering pumps and municipal support to {selectedIncident.address || 'incident coordinates'}.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <span className="text-purple-400">AI Advisory</span>
                    <span>➔</span>
                    <span className="text-amber-400 text-slate-300 animate-pulse">Operator Review</span>
                    <span>➔</span>
                    <span className="text-emerald-400">Dispatch Decision</span>
                  </div>
                </div>

                {/* Operations Assignment */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Operations dispatch controls</h5>

                  {/* Department Assign */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 block font-bold text-[10px] uppercase font-mono">Assign Department</label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedIncident.assignments?.[0]?.department_id || ''}
                        onChange={(e) => handleAssignDept(e.target.value)}
                        disabled={assigningDeptId !== null}
                        className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500/50 min-w-0"
                      >
                        <option value="">-- Select Department --</option>
                        {allDepartments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Incident Status */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 block font-bold text-[10px] uppercase font-mono">Update Ticket Status</label>
                    <select
                      value={selectedIncident.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      disabled={updatingStatus !== null}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Resource Allocation Section */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Resource Allocations</h5>
                    <span className="text-[9px] font-mono text-slate-500">({incidentResources.length} Allocated)</span>
                  </div>

                  {/* Allocate Resource dropdown */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAllocateResource(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        disabled={allocatingResourceId !== null}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Allocate Available Fleet Asset --</option>
                        {resources
                          .filter(r => r.status === 'available')
                          .map(r => (
                            <option key={r.id} value={r.id}>
                              [{r.type.toUpperCase()}] {r.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* List of allocated resources */}
                    <div className="space-y-1.5">
                      {incidentResources.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No resources allocated to this ticket yet.</p>
                      ) : (
                        incidentResources.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-900 text-[10px]">
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{r.name}</span>
                              <span className="text-slate-500 font-mono block uppercase text-[8px]">{r.type} • {r.status}</span>
                            </div>
                            <button
                              onClick={() => handleReleaseResource(r.id)}
                              disabled={allocatingResourceId !== null}
                              className="px-2 py-1 rounded bg-red-950/60 border border-red-900 text-red-400 font-bold font-mono text-[9px] hover:bg-red-900 hover:text-white transition-all cursor-pointer"
                            >
                              Release
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
