'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { 
  HeartPulse, 
  Clock, 
  CloudRain, 
  Zap, 
  MapPin, 
  Activity, 
  Truck, 
  Shield, 
  Compass, 
  AlertTriangle,
  Building2,
  Sparkles,
  Play,
  FileText
} from 'lucide-react'

const suitableHospitals = [
  { name: 'NTR General Hospital', distance: '1.8 km', eta: '4 mins', erLoad: '72% Load', icu: '6 Available', trauma: 'Level 1 Trauma', status: 'Optimal' },
  { name: 'Seven Hills Clinic', distance: '3.4 km', eta: '8 mins', erLoad: '55% Load', icu: '12 Available', trauma: 'Level 2 Trauma', status: 'Optimal' },
  { name: 'Apollo Health Center', distance: '4.8 km', eta: '11 mins', erLoad: '90% Load', icu: '2 Available', trauma: 'Level 1 Trauma', status: 'Delayed' },
  { name: 'Care Emergency Care', distance: '5.2 km', eta: '12 mins', erLoad: '40% Load', icu: '8 Available', trauma: 'Level 3 Trauma', status: 'Optimal' }
]

const liveAmbulances = [
  { id: 'A-21', incident: 'MVP Flooding Trauma', destination: 'NTR General Hospital', status: 'En Route', eta: '3 mins' },
  { id: 'A-08', incident: 'Gajuwaka Inhalation Alert', destination: 'Care Emergency Care', status: 'On Scene', eta: 'Reached' },
  { id: 'A-19', incident: 'Bypass Expressway Crash', destination: 'Apollo Health Center', status: 'Transporting', eta: '7 mins' }
]

export default function HealthcareOperationsPage() {
  const [selectedHosp, setSelectedHosp] = useState('NTR General Hospital')
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

  const mapMarkers: MapMarker[] = [
    { id: 'hosp-1', position: [17.7250, 83.3320], title: 'NTR General Hospital', description: 'ER Capacity: 72% | ICU: 6 Free', category: 'low' },
    { id: 'hosp-2', position: [17.7120, 83.3050], title: 'Seven Hills Clinic', description: 'ER Capacity: 55% | ICU: 12 Free', category: 'low' },
    { id: 'A-21', position: [17.7200, 83.3150], title: 'Ambulance A-21', description: 'En Route to NTR | Status: En Route', category: 'high' },
    { id: 'm-1', position: [17.7210, 83.3180], title: 'MVP Flooding Incident', description: 'Critical water depth | Medical dispatch active', category: 'critical' }
  ]

  return (
    <DashboardLayout 
      userRole="officer"
      hideHeader={true}
      hideRightPanel={true}
      hideBreadcrumbs={true}
      hideStatusBar={true}
    >
      <div className="flex flex-col min-h-screen text-slate-100 font-sans bg-[#030712] p-4 space-y-4">
        
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
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">HEALTHCARE OPERATIONS CENTER</h2>
                <span className="bg-red-500 text-white font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded animate-pulse uppercase tracking-wider">LIVE</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Real-time medical emergency & hospital coordination</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-455 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MEDICAL WAN LINKED</span>
            </div>
            <div className="hidden md:flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>29°C | OVERCAST</span>
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

        {/* 7 KPIstat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Hospitals</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">18 Nodes</h3>
            <span className="text-[8px] text-slate-500 font-mono">Integrated health networks</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">ER Capacity</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">248 beds</h3>
            <span className="text-[8px] text-slate-450 font-mono">72% overall sector load</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">ICU Available</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">42 Beds</h3>
            <span className="text-[8px] text-emerald-500 font-mono">Standby trauma beds</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Medical Teams</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">36 Teams</h3>
            <span className="text-[8px] text-slate-450 font-mono">Active trauma surgeons</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Ambulances En Route</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">12 En Route</h3>
            <span className="text-[8px] text-sky-400 font-mono">Active emergency dispatches</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Blood Units</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">850 Units</h3>
            <span className="text-[8px] text-slate-450 font-mono">O-negative priority: 42</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Emergencies</span>
            <h3 className="text-lg font-black text-red-400 font-mono leading-none mt-1">4 Critical</h3>
            <span className="text-[8px] text-red-500 font-mono">● Dispatching ambulance</span>
          </div>
        </section>

        {/* WORKSPACE Row */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[460px]">
          
          {/* COLUMN 1, 2 & 3: LIVE MEDICAL RESPONSE MAP */}
          <div className="xl:col-span-3 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-xs font-mono shrink-0">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-sky-400 animate-pulse" />
                <h4 className="font-bold text-white uppercase tracking-wider">LIVE MEDICAL RESPONSE MAP</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1.5" />
                <span>GPS tracking linked</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-955 overflow-hidden min-h-[300px] bg-slate-950">
              <MapContainer
                center={[17.7250, 83.3320]}
                zoom={13}
                markers={mapMarkers}
              />
              
              {/* Map selected incident popup overlay */}
              <div className="absolute bottom-4 left-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/90 backdrop-blur-md shadow-2xl space-y-1.5 text-[9px] font-mono text-slate-300 max-w-[200px]">
                <h5 className="font-bold text-red-400 uppercase tracking-widest border-b border-slate-900 pb-1">SELECTED INCIDENT</h5>
                <p className="font-bold text-white leading-normal">Waterlogging Trauma — Ward 12</p>
                <div className="space-y-0.5 text-slate-400">
                  <p>Location: MVP Colony</p>
                  <p>Status: Active Emergency</p>
                  <p>People affected: 1,240</p>
                  <p>Dispatched: Ambulance A-21</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4: HOSPITAL TRIAGE DIRECTORY */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Nearby Suitable Hospitals</h4>
              </div>
              <span className="text-[8px] font-bold text-slate-500 font-mono">TRIAGE LOAD</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
              
              {/* Suitable Hospitals List */}
              <div className="space-y-2">
                {suitableHospitals.map((h) => (
                  <div 
                    key={h.name}
                    onClick={() => setSelectedHosp(h.name)}
                    className={`p-2.5 rounded-lg border border-slate-900/60 bg-slate-950/40 hover:bg-slate-950 transition-all cursor-pointer space-y-1 ${selectedHosp === h.name ? 'border-sky-500 bg-slate-900' : ''}`}
                  >
                    <div className="flex justify-between font-bold text-white">
                      <span className="truncate max-w-[120px]">{h.name}</span>
                      <span className="text-sky-400 font-mono">{h.distance}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-450 border-t border-slate-900/40 pt-1 mt-1">
                      <span>{h.icu}</span>
                      <span className={`font-bold ${h.status === 'Optimal' ? 'text-emerald-400' : 'text-yellow-400'}`}>{h.erLoad}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live ambulance tracking list */}
              <div className="space-y-2 pt-2 border-t border-slate-900/50">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Live Ambulance Tracking</span>
                <div className="space-y-1.5 text-[9px] font-mono">
                  {liveAmbulances.map((a) => (
                    <div key={a.id} className="p-2 rounded bg-slate-950/30 flex items-center justify-between text-slate-300">
                      <span className="font-bold text-white">{a.id}</span>
                      <span className="truncate max-w-[90px] text-slate-400">{a.destination}</span>
                      <span className="text-sky-400">{a.eta}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* LOWER WORKSPACE SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          
          {/* Hospital network status */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Hospital Network Status</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>NTR General Hospital:</span>
                <span className="text-emerald-400 font-bold">Optimal (72% ER load)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Apollo Health Center:</span>
                <span className="text-yellow-400 font-bold">Heavy Load (90%)</span>
              </div>
              <div className="flex justify-between">
                <span>Care Emergency Care:</span>
                <span className="text-emerald-400">Optimal (40% load)</span>
              </div>
            </div>
          </div>

          {/* Medical Resource Status */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Medical Resource Status</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-350 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Ventilators Available:</span>
                <span className="text-sky-400 font-bold">18 Ready</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Oxygen Reserves:</span>
                <span className="text-emerald-400 font-bold">98% Capacity</span>
              </div>
              <div className="flex justify-between">
                <span>Trauma Surgeons:</span>
                <span className="text-sky-400">8 Standby</span>
              </div>
            </div>
          </div>

          {/* Active medical emergencies list */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Active Medical Emergencies</span>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-900 pb-1">
                    <th className="py-1">Ticket</th>
                    <th className="py-1">Incident</th>
                    <th className="py-1">Destination</th>
                    <th className="py-1">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-350">
                  {liveAmbulances.map((a) => (
                    <tr key={a.id}>
                      <td className="py-1.5 font-bold text-white">{a.id}</td>
                      <td className="py-1.5 truncate max-w-[85px]">{a.incident}</td>
                      <td className="py-1.5 text-slate-400 truncate max-w-[90px]">{a.destination}</td>
                      <td className="py-1.5 text-sky-400">{a.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Healthcare AI Intelligence advisory */}
          <div className="p-4 rounded-xl border border-purple-900/30 bg-purple-950/10 shadow-[0_0_15px_rgba(168,85,247,0.02)] space-y-2 min-w-0">
            <span className="text-[8.5px] font-bold text-purple-400 uppercase tracking-widest font-mono border-b border-purple-900/20 pb-1.5 block">Healthcare AI Intelligence</span>
            <div className="space-y-1 text-[9.5px] font-mono text-purple-300">
              <p className="leading-relaxed">
                <span className="text-red-400 font-bold mr-1">ADVISORY:</span> Reroute Ambulance A-19 to NTR General. Apollo ER load has reached 90% threshold limits.
              </p>
              <div className="flex space-x-2 pt-1">
                <button className="py-1 px-2 rounded bg-purple-800 hover:bg-purple-700 text-white text-[9px] font-bold transition-all cursor-pointer">Approve</button>
                <button className="py-1 px-2 rounded bg-slate-950 hover:bg-slate-900 text-slate-400 text-[9px] font-bold transition-all cursor-pointer">Decline</button>
              </div>
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
