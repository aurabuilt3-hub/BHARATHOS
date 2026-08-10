'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { 
  Truck, 
  Clock, 
  CloudRain, 
  Zap, 
  MapPin, 
  Activity, 
  Phone, 
  BatteryCharging, 
  Navigation,
  Compass, 
  AlertTriangle,
  Building2,
  CheckCircle2,
  PhoneCall
} from 'lucide-react'

const ambulances = [
  { id: 'A-21', driver: 'R. Koteswara Rao', paramedic: 'G. Swetha', phone: '+91 98480 22341', status: 'En Route', fuel: '84% (EV Battery)', location: 'MVP Colony Sector 2', lastUpdate: '10s ago', routeProgress: 'En Route to Incident' },
  { id: 'A-08', driver: 'P. Appa Rao', paramedic: 'K. Prasad', phone: '+91 98480 22308', status: 'On Scene', fuel: '72% (EV Battery)', location: 'Dwaraka Nagar BRTS', lastUpdate: '45s ago', routeProgress: 'Patient Pickup' },
  { id: 'A-19', driver: 'K. Rambabu', paramedic: 'T. Suresh', phone: '+91 98480 22319', status: 'Transporting', fuel: '60% (Diesel)', location: 'NH16 Bypass North', lastUpdate: '2m ago', routeProgress: 'En Route to Hospital' },
  { id: 'A-14', driver: 'M. Satyanarayana', paramedic: 'V. Ramesh', phone: '+91 98480 22314', status: 'Available', fuel: '92% (EV Battery)', location: 'Vizag Central Station', lastUpdate: '5m ago', routeProgress: 'Standby' }
]

export default function AmbulanceOperationsPage() {
  const [selectedAmbId, setSelectedAmbId] = useState('A-21')
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

  const selectedAmb = ambulances.find(a => a.id === selectedAmbId) || ambulances[0]

  const mapMarkers: MapMarker[] = [
    { id: 'A-21', position: [17.7200, 83.3150], title: 'Ambulance A-21', description: 'En Route | Driver: R. Koteswara Rao', category: 'high' },
    { id: 'A-08', position: [17.7120, 83.3050], title: 'Ambulance A-08', description: 'On Scene | Paramedic: K. Prasad', category: 'critical' },
    { id: 'A-19', position: [17.7050, 83.2850], title: 'Ambulance A-19', description: 'Transporting | Status: Active transport', category: 'high' },
    { id: 'm-1', position: [17.7210, 83.3180], title: 'MVP Flooding Trauma Incident', description: 'Critical water depth | Dispatched A-21', category: 'critical' }
  ]

  // Vertical timeline state simulation
  const timelineStages = [
    { label: 'Assigned to Incident', done: true, time: '12:45' },
    { label: 'En Route to Incident', done: true, time: '12:47' },
    { label: 'Arriving at Incident', done: selectedAmbId !== 'A-21', time: selectedAmbId === 'A-08' ? '12:50' : '12:51 (Est)' },
    { label: 'Patient Pickup', done: selectedAmbId === 'A-08' || selectedAmbId === 'A-19', time: selectedAmbId === 'A-19' ? '12:55' : '--' },
    { label: 'En Route to Hospital', done: selectedAmbId === 'A-19', time: selectedAmbId === 'A-19' ? '12:58' : '--' },
    { label: 'Expected at Hospital', done: false, time: '13:08 (Est)' }
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
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
            </div>
            <span className="text-slate-800 text-lg">|</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">AMBULANCE OPERATIONS CENTER</h2>
                <span className="bg-emerald-600 text-white font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded animate-pulse uppercase tracking-wider">LIVE</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Real-time ambulance fleet monitoring, dispatch & tracking</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-455 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>FLEET SYSTEM CONNECTED</span>
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
                AC
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] leading-tight text-white font-bold font-mono">Ambulance Controller</p>
                <p className="text-[8.5px] leading-none text-slate-400">Fleet Operations Command</p>
              </div>
            </div>
          </div>
        </header>

        {/* 7 KPIstat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Ambulances</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">32 Vehicles</h3>
            <span className="text-[8px] text-slate-500 font-mono">District fleet registry</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Available</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">14 Available</h3>
            <span className="text-[8px] text-emerald-500 font-mono">43.7% fleet standby</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">En Route</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">8 En Route</h3>
            <span className="text-[8px] text-sky-400 font-mono">Dispatched to scene</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">On Scene</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">6 On Scene</h3>
            <span className="text-[8px] text-slate-450 font-mono">Stabilizing patients</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Offline</span>
            <h3 className="text-lg font-black text-slate-450 font-mono leading-none mt-1">4 Vehicles</h3>
            <span className="text-[8px] text-slate-500 font-mono">Maintenance schedule</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Avg Response Time</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">5.1 mins</h3>
            <span className="text-[8px] text-slate-450 font-mono">Triage standard average</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Completed Today</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">84 Cases</h3>
            <span className="text-[8px] text-slate-450 font-mono">Successful hospital runs</span>
          </div>
        </section>

        {/* WORKSPACE Row */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[460px]">
          
          {/* COLUMN 1, 2 & 3: LIVE AMBULANCE TRACKING MAP */}
          <div className="xl:col-span-3 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-xs font-mono shrink-0">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-sky-400 animate-pulse" />
                <h4 className="font-bold text-white uppercase tracking-wider">LIVE AMBULANCE TRACKING</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1.5" />
                <span>GPS telemetry active</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-955 overflow-hidden min-h-[300px] bg-slate-950">
              <MapContainer
                center={[17.7200, 83.3150]}
                zoom={13}
                markers={mapMarkers}
              />
              
              {/* Status overlay */}
              <div className="absolute top-4 right-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1.5 text-[8.5px] font-mono text-slate-350">
                <h5 className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Fleet Markers</h5>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>On Scene (Critical)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>En Route / Transporting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Standby (Available)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4: ACTIVE ASSIGNMENT & AMBULANCE DETAILS */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0 font-mono">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Assignment</h4>
              </div>
              <span className="text-[8.5px] font-bold text-sky-400 bg-sky-950/20 border border-sky-900/30 px-1.5 py-0.5 rounded uppercase">{selectedAmb.id}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
              
              {/* Assignment logs */}
              <div className="space-y-1 border-b border-slate-900/60 pb-2.5">
                <h5 className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Incident</h5>
                <p className="font-extrabold text-white text-sm">MVP Flooding Trauma</p>
                <p className="text-[9.5px] text-slate-400 font-mono">Location: MVP Colony Sector 2</p>
              </div>

              {/* Ambulance specifications details */}
              <div className="space-y-1.5 text-[10px] font-mono text-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="text-slate-200">{selectedAmb.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EMT:</span>
                  <span className="text-slate-200">{selectedAmb.paramedic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone Contact:</span>
                  <span className="text-slate-300">{selectedAmb.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Battery Level:</span>
                  <span className="text-emerald-400 font-bold">{selectedAmb.fuel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Telemetry:</span>
                  <span className="text-slate-400">{selectedAmb.lastUpdate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-sky-400 font-bold uppercase">{selectedAmb.status}</span>
                </div>
              </div>

              {/* Vertical timeline steps */}
              <div className="space-y-2 pt-2 border-t border-slate-900/50">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Live Dispatch Route Progress</span>
                <div className="space-y-2 font-mono text-[9.5px]">
                  {timelineStages.map((st, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="flex flex-col items-center mt-1 shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${st.done ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'}`} />
                        {idx < timelineStages.length - 1 && <div className="w-0.5 h-6 bg-slate-900" />}
                      </div>
                      <div className="flex-1 flex justify-between">
                        <span className={st.done ? 'text-slate-300 font-bold' : 'text-slate-500'}>{st.label}</span>
                        <span className="text-[8.5px] text-slate-500">{st.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* LOWER WORKSPACE SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          
          {/* Ambulance Status breakdown */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Ambulance Status Breakdown</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Total Active Fleet:</span>
                <span className="text-sky-400 font-bold">28 dispatches</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Available Standby:</span>
                <span className="text-emerald-400 font-bold">14 vehicles</span>
              </div>
              <div className="flex justify-between">
                <span>Offline / Servicing:</span>
                <span className="text-slate-400">4 vehicles</span>
              </div>
            </div>
          </div>

          {/* Destination Hospital Loads */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Top Destination Hospitals</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-350 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>NTR General Hospital:</span>
                <span className="text-sky-400 font-bold">4 dispatches en route</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Care Emergency Clinic:</span>
                <span className="text-sky-400 font-bold">2 dispatches en route</span>
              </div>
              <div className="flex justify-between">
                <span>Apollo Health Center:</span>
                <span className="text-yellow-400">ER overloaded (90%)</span>
              </div>
            </div>
          </div>

          {/* Active dispatches queue */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Ambulances On Scene</span>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-900 pb-1">
                    <th className="py-1">ID</th>
                    <th className="py-1">Incident</th>
                    <th className="py-1">Fuel</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-300">
                  {ambulances.map((a) => (
                    <tr key={a.id} onClick={() => setSelectedAmbId(a.id)} className={`hover:bg-slate-950/45 cursor-pointer ${selectedAmbId === a.id ? 'bg-slate-900/80 border-l border-emerald-500 pl-1' : ''}`}>
                      <td className="py-1.5 font-bold text-white">{a.id}</td>
                      <td className="py-1.5 truncate max-w-[85px]">{a.routeProgress}</td>
                      <td className="py-1.5 text-slate-400">{a.fuel}</td>
                      <td className={`py-1.5 font-bold ${a.status === 'On Scene' ? 'text-red-400' : a.status === 'En Route' ? 'text-amber-500' : 'text-emerald-400'}`}>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Available Ambulances list */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Available Nearby Standby</span>
            <div className="space-y-1.5 mt-2 text-[10px] font-mono text-slate-350 overflow-y-auto max-h-[85px] pr-0.5">
              <div className="flex justify-between border-b border-slate-900/40 pb-1">
                <span>Ambulance A-14:</span>
                <span className="text-emerald-400 font-bold">92% (EV Battery)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/40 pb-1">
                <span>Ambulance A-28:</span>
                <span className="text-emerald-400">89% (Diesel)</span>
              </div>
              <div className="flex justify-between">
                <span>Ambulance A-31:</span>
                <span className="text-emerald-400">95% (EV Battery)</span>
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
