'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { 
  Flame, 
  Clock, 
  CloudRain, 
  Zap, 
  MapPin, 
  Activity, 
  Truck, 
  Wind, 
  Compass, 
  AlertTriangle,
  Flame as FireIcon,
  Droplets,
  Thermometer,
  Shield,
  FileText
} from 'lucide-react'

const fireTenders = [
  { id: 'FT-12', type: 'Hazmat Tender', station: 'Gajuwaka Stn', capacity: '5000L', personnel: '6', status: 'En Route', location: 'Gajuwaka Area', speed: '48 km/h', eta: '5 mins' },
  { id: 'FT-07', type: 'Standard Pumper', station: 'Vizag Central', capacity: '4000L', personnel: '5', status: 'On Scene', location: 'MVP Sector 4', speed: '0 km/h', eta: 'Reached' },
  { id: 'FT-03', type: 'Rescue Tender', station: 'Mudasarlova Stn', capacity: '2000L', personnel: '4', status: 'Patrolling', location: 'Mudasarlova Road', speed: '35 km/h', eta: '10 mins' },
  { id: 'FT-08', type: 'Hazmat Tender', station: 'Vizag Central', capacity: '5000L', personnel: '6', status: 'Standby', location: 'Central HQ', speed: '0 km/h', eta: 'Standby' },
  { id: 'FT-01', type: 'Standard Pumper', station: 'Gajuwaka Stn', capacity: '4000L', personnel: '5', status: 'Standby', location: 'Gajuwaka Stn', speed: '0 km/h', eta: 'Standby' }
]

const fireIncidents = [
  { ticket: 'FIRE-102', title: 'MVP Residential Structure Fire', location: 'MVP Sector 4', priority: 'Critical', status: 'In Progress', personnel: '15 deployed', water: '12000L required' },
  { ticket: 'FIRE-103', title: 'Gajuwaka Chemical Valve Leak', location: 'Gajuwaka Gate 3', priority: 'High', status: 'En Route', personnel: '6 deployed', water: 'Foam required' }
]

export default function FireOperationsPage() {
  const [selectedIncId, setSelectedIncId] = useState('FIRE-102')
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

  const selectedIncident = fireIncidents.find(i => i.ticket === selectedIncId) || fireIncidents[0]

  const mapMarkers: MapMarker[] = [
    { id: 'FT-12', position: [17.6850, 83.2200], title: 'FT-12 Hazmat Tender', description: 'En Route to Gajuwaka | Speed: 48 km/h', category: 'high' },
    { id: 'FT-07', position: [17.7200, 83.3150], title: 'FT-07 Standard Pumper', description: 'On Scene at MVP Colony | Active fire suppression', category: 'critical' },
    { id: 'FT-03', position: [17.7300, 83.2950], title: 'FT-03 Rescue Tender', description: 'Patrolling near Mudasarlova', category: 'low' },
    { id: 'm-1', position: [17.7210, 83.3180], title: 'MVP Sector 4 Structure Fire', description: 'Critical residential building fire log', category: 'critical' }
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
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">FIRE & HAZMAT OPERATIONS CENTER</h2>
                <span className="bg-red-500 text-white font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded animate-pulse uppercase tracking-wider">LIVE</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Real-time fire response, resource tracking & hazmat management</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-455 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>DISPATCH TELEMETRY ACTIVE</span>
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

        {/* 7 KPIstat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Fire Stations</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">12 Stations</h3>
            <span className="text-[8px] text-slate-550 font-mono">Total district stations</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Fire Tenders</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">28 Pumpers</h3>
            <span className="text-[8px] text-emerald-500 font-mono">24 Online / Deployed</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Water Tankers</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">14 Tankers</h3>
            <span className="text-[8px] text-sky-400 font-mono">Aggregate: 78,000L</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Rescue Vehicles</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">8 Trucks</h3>
            <span className="text-[8px] text-slate-450 font-mono">Extrication gear online</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Incidents</span>
            <h3 className="text-lg font-black text-red-400 font-mono leading-none mt-1">2 Live</h3>
            <span className="text-[8px] text-red-500 font-mono">● Active fire suppression</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Hazmat Alerts</span>
            <h3 className="text-lg font-black text-amber-500 font-mono leading-none mt-1">1 Incident</h3>
            <span className="text-[8px] text-amber-500 font-mono">Containment active</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Personnel</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">148 On Duty</h3>
            <span className="text-[8px] text-slate-450 font-mono">On shift rotation</span>
          </div>
        </section>

        {/* MAIN Row */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[460px]">
          
          {/* COLUMN 1, 2 & 3: LIVE FIRE RESPONSE MAP */}
          <div className="xl:col-span-3 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-xs font-mono shrink-0">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-sky-400 animate-pulse" />
                <h4 className="font-bold text-white uppercase tracking-wider font-mono">LIVE FIRE RESPONSE TRACKING</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1.5" />
                <span>SCADA telemetry synced</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-955 overflow-hidden min-h-[300px] bg-slate-950">
              <MapContainer
                center={[17.7200, 83.3150]}
                zoom={13}
                markers={mapMarkers}
              />
              
              {/* Legend overlay */}
              <div className="absolute top-4 right-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1.5 text-[8.5px] font-mono text-slate-350">
                <h5 className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Asset Status</h5>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    <span>MVP Structure Fire</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>FT-12 Hazmat tender</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Patrolling / Standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4: ACTIVE INCIDENT DETAILS PANEL */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Incident</h4>
              </div>
              <span className="text-[8.5px] font-bold text-sky-400 bg-sky-950/20 border border-sky-900/30 px-1.5 py-0.5 rounded font-mono shrink-0 uppercase">{selectedIncident.ticket}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
              
              <div className="space-y-1">
                <h5 className="font-extrabold text-white text-sm">{selectedIncident.title}</h5>
                <p className="text-[9.5px] text-slate-400 font-mono">Location: {selectedIncident.location}</p>
              </div>

              {/* Specifications list */}
              <div className="space-y-1.5 text-[10px] font-mono border-t border-b border-slate-900/60 py-2.5 text-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported Time:</span>
                  <span className="text-slate-200">12:45 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="text-slate-200">Structure Fire</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Severity:</span>
                  <span className="text-red-400 font-bold uppercase">{selectedIncident.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-slate-200 font-bold">{selectedIncident.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fire Spread Risk:</span>
                  <span className="text-red-400 font-bold">High (Level 4)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hazmat Risk:</span>
                  <span className="text-amber-500">None detected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wind Direction:</span>
                  <span className="text-slate-200">18 km/h SW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Temperature:</span>
                  <span className="text-slate-200">29°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Personnel Deployed:</span>
                  <span className="text-emerald-400 font-bold">{selectedIncident.personnel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Water volume req:</span>
                  <span className="text-sky-400 font-bold">{selectedIncident.water}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-1.5 pt-1.5 border-t border-slate-900/50 mt-2">
                <button className="py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold font-mono tracking-wider transition-all text-[9.5px] uppercase cursor-pointer text-center">
                  ⚙️ Update Status
                </button>
                <button className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-350 font-mono transition-all text-[9px] uppercase cursor-pointer text-center">
                  ⚙️ dispatch backup
                </button>
              </div>

            </div>
          </div>

        </section>

        {/* LOWER WORKSPACE SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          
          {/* Fire stations status */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Fire Stations Status</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Vizag Central HQ:</span>
                <span className="text-emerald-400 font-bold">14 Online (100%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Gajuwaka Station:</span>
                <span className="text-emerald-400 font-bold">8 Online (Ok)</span>
              </div>
              <div className="flex justify-between">
                <span>Mudasarlova Station:</span>
                <span className="text-emerald-400">6 Online (Ok)</span>
              </div>
            </div>
          </div>

          {/* Active fire incidents */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Active Fire Incidents</span>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-slate-455 border-b border-slate-900 pb-1">
                    <th className="py-1">Ticket</th>
                    <th className="py-1">Incident</th>
                    <th className="py-1">Severity</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-300">
                  {fireIncidents.map((inc) => (
                    <tr key={inc.ticket} onClick={() => setSelectedIncId(inc.ticket)} className={`hover:bg-slate-950/45 cursor-pointer ${selectedIncId === inc.ticket ? 'bg-slate-900/80 border-l border-sky-400 pl-1' : ''}`}>
                      <td className="py-1.5 font-bold text-white">{inc.ticket}</td>
                      <td className="py-1.5 truncate max-w-[90px]">{inc.title}</td>
                      <td className={`py-1.5 uppercase font-bold ${inc.priority === 'Critical' ? 'text-red-400' : 'text-orange-400'}`}>{inc.priority}</td>
                      <td className="py-1.5 text-slate-400">{inc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resource Utilization */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Resource Utilization</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-350 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Standard Pumpers:</span>
                <span className="text-sky-400 font-bold">12 / 28 deployed</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Water Tankers:</span>
                <span className="text-sky-400 font-bold">4 / 14 deployed</span>
              </div>
              <div className="flex justify-between">
                <span>Hazmat Tenders:</span>
                <span className="text-emerald-450">2 / 4 deployed</span>
              </div>
            </div>
          </div>

          {/* Live fire tenders list */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Live Vehicle Tracking</span>
            <div className="overflow-y-auto max-h-[85px] mt-2 pr-0.5">
              <table className="w-full text-left text-[9px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-900 pb-0.5">
                    <th className="py-0.5">ID</th>
                    <th className="py-0.5">Type</th>
                    <th className="py-0.5">Speed</th>
                    <th className="py-0.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-300">
                  {fireTenders.slice(0, 4).map((t) => (
                    <tr key={t.id}>
                      <td className="py-1 font-bold text-white">{t.id}</td>
                      <td className="py-1 text-slate-400">{t.type}</td>
                      <td className="py-1 text-sky-400">{t.speed}</td>
                      <td className={`py-1 font-bold ${t.status === 'On Scene' ? 'text-red-400' : t.status === 'En Route' ? 'text-amber-500' : 'text-slate-400'}`}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
