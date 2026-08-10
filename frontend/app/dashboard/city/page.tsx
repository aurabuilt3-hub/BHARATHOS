'use client'

import React, { useState, useEffect, Suspense } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import WeatherWidget from '../../../components/widgets/WeatherWidget'
import TrafficWidget from '../../../components/widgets/TrafficWidget'
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
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { visakhapatnamCityData } from '../../../lib/mock/cities'
import { incidentCategoryPieData, responseTimeHistoryData } from '../../../lib/mock/analytics'
import PageHeader from '../../../components/ui/PageHeader'
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
  Cpu
} from 'lucide-react'

type AdminLevel = 'national' | 'state' | 'district' | 'city' | 'ward'

export default function CityDashboardPage() {
  const [level, setLevel] = useState<AdminLevel>('city')
  const city = visakhapatnamCityData

  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  // Read search parameters safely on client-side only to avoid Next.js static render warnings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const lvl = params.get('level') as AdminLevel
      if (lvl) {
        setLevel(lvl)
      }
    }
  }, [])

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
            
            {/* COLUMN 1: LIVE WEATHER RADAR */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
                <div className="flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Weather Radar</h4>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">CYCLONE TRACK</span>
              </div>

              {/* RADAR CANVAS SCREEN */}
              <div className="flex-1 relative rounded-xl border border-slate-950 bg-slate-950 overflow-hidden min-h-[220px] flex items-center justify-center">
                {/* Simulated radar background & rotating line */}
                <div className="absolute inset-0 opacity-20 border border-sky-500/30 rounded-full scale-[0.8] flex items-center justify-center">
                  <div className="w-1/2 h-1/2 border border-sky-500/30 rounded-full" />
                </div>
                <div className="absolute w-[95%] h-[95%] border border-sky-500/10 rounded-full animate-pulse" />
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-sky-500 origin-center animate-spin duration-5000" style={{ animationDuration: '6s' }} />
                
                {/* Glowing alert dots */}
                <span className="absolute top-[30%] left-[45%] h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="absolute top-[30%] left-[45%] h-2 w-2 rounded-full bg-red-500" />
                <span className="absolute top-[60%] left-[70%] h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span className="absolute top-[45%] left-[25%] h-1.5 w-1.5 rounded-full bg-yellow-500" />

                <span className="absolute bottom-2.5 right-2.5 text-[8px] font-mono text-slate-500">SWEEP RADAR FEED v3</span>
              </div>

              {/* METEOROLOGY STATS */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center shrink-0 border-t border-slate-900/50 pt-2.5">
                <div>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Rainfall</p>
                  <p className="text-xs font-bold text-sky-400 font-mono mt-0.5">78 mm</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Wind</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">18 km/h</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Humidity</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">92%</p>
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

  // City Dashboard View (Redesigned visual counterpart)
  const cityInfo = {
    title: `Smart City Command Center - ${city.name}`,
    desc: `Real-time municipal digital twin telemetry, IoT sensor networks, and automated multi-agent triage (${city.zonesCount} zones, ${city.wardsCount} wards).`
  }

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6 text-slate-100 bg-[#030712] p-2 rounded-2xl">
        <PageHeader
          title={cityInfo.title}
          description={cityInfo.desc}
          breadcrumbs={[{ label: 'Home' }, { label: 'City Dashboard' }]}
          actions={
            <div className="flex items-center space-x-3">
              <TimeMachineSlider />
              <div className="flex border border-slate-850 rounded-xl bg-[#050816] p-1 text-[10px] font-mono font-bold">
                {(['state', 'district', 'city'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setLevel(lvl)
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', lvl === 'city' ? '/dashboard/city' : `/dashboard/city?level=${lvl}`)
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
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

        {/* 1. Top Row: Weather & AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherWidget />
          <AISummaryWidget />
        </div>

        {/* 2. Middle Row: Resource, Sensor & Traffic Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResourceWidget />
          <SensorWidget />
          <TrafficWidget />
        </div>

        {/* 3. Incidents Queue & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CommandWorkflowWidget />
            <IncidentQueueWidget />
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
      </div>
    </DashboardLayout>
  )
}
