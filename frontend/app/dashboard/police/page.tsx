'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { 
  Shield, 
  Clock, 
  CloudRain, 
  Zap, 
  MapPin, 
  Activity, 
  Car, 
  Users, 
  Eye, 
  Compass, 
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react'

const policeUnits = [
  { id: 'P-101', name: 'Patrol Unit 101', officer: 'Inspector K. Raju', team: '3 Officers', vehicle: 'Tata Nexon EV', callSign: 'CHARLIE-1', location: 'MVP Colony Sector 2', speed: '32 km/h', lastUpdate: '10s ago', status: 'Patrolling', route: 'Beach Road -> MVP Colony', progress: '65%', eta: '4 mins', nextCheckpoint: 'MVP Double Road' },
  { id: 'P-114', name: 'Patrol Unit 114', officer: 'Sub-Inspector M. Srinivas', team: '2 Officers', vehicle: 'Mahindra Scorpio', callSign: 'DELTA-4', location: 'Dwaraka Nagar BRTS', speed: '45 km/h', lastUpdate: '45s ago', status: 'En Route', route: 'RTC Complex -> BRTS Lane', progress: '82%', eta: '2 mins', nextCheckpoint: 'Dwaraka Junction' },
  { id: 'P-305', name: 'Patrol Unit 305', officer: 'Inspector S. Lakshmi', team: '3 Officers', vehicle: 'Tata Nexon EV', callSign: 'ALPHA-2', location: 'Beach Road', speed: '0 km/h', lastUpdate: '2m ago', status: 'On Scene', route: 'Beach Road Bypass', progress: '100%', eta: 'Reached', nextCheckpoint: 'None' },
  { id: 'P-207', name: 'Patrol Unit 207', officer: 'Inspector G. Prasad', team: '2 Officers', vehicle: 'Mahindra Scorpio', callSign: 'SIERRA-3', location: 'Gajuwaka Junction', speed: '18 km/h', lastUpdate: '1m ago', status: 'Congested', route: 'NH16 -> Gajuwaka Sump', progress: '40%', eta: '12 mins', nextCheckpoint: 'Gajuwaka Industrial Hub' },
  { id: 'P-110', name: 'Patrol Unit 110', officer: 'SI A. Harsha', team: '2 Officers', vehicle: 'Tata Nexon EV', callSign: 'KILO-1', location: 'VIP Road', speed: '52 km/h', lastUpdate: '5s ago', status: 'Patrolling', route: 'VIP Road -> Siripuram', progress: '10%', eta: '8 mins', nextCheckpoint: 'Siripuram Circle' }
]

const policeIncidents = [
  { ticket: 'POL-3982', title: 'Road Blockage Bypass', location: 'Beach Road Sector 4', priority: 'High', status: 'Assigned', unit: 'P-305', time: '12:42' },
  { ticket: 'POL-3983', title: 'Municipal Sump Security', location: 'Mudasarlova Sump', priority: 'Medium', status: 'Patrolling', unit: 'P-101', time: '12:44' },
  { ticket: 'POL-3984', title: 'Traffic Escort NH16', location: 'NH16 bypass north', priority: 'High', status: 'En Route', unit: 'P-114', time: '12:45' }
]

export default function PoliceOperationsPage() {
  const [selectedUnitId, setSelectedUnitId] = useState('P-101')
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

  const selectedUnit = policeUnits.find(u => u.id === selectedUnitId) || policeUnits[0]

  const mapMarkers: MapMarker[] = policeUnits.map((u, idx) => {
    const coords: Record<string, [number, number]> = {
      'P-101': [17.7200, 83.3150],
      'P-114': [17.7120, 83.3050],
      'P-305': [17.7050, 83.2850],
      'P-207': [17.6850, 83.2200],
      'P-110': [17.7250, 83.3320]
    }
    let cat: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (u.status === 'On Scene') cat = 'critical'
    else if (u.status === 'Congested') cat = 'high'
    else if (u.status === 'En Route') cat = 'medium'

    return {
      id: u.id,
      position: coords[u.id] || [17.7200 + idx * 0.015, 83.3150 + idx * 0.015],
      title: `${u.id} - ${u.callSign}`,
      description: `Officer: ${u.officer} | Speed: ${u.speed} | Status: ${u.status}`,
      category: cat
    }
  })

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
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
            </div>
            <span className="text-slate-800 text-lg">|</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">POLICE OPERATIONS CENTER</h2>
                <span className="bg-blue-600 text-white font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded animate-pulse uppercase tracking-wider">LIVE</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Real-time law enforcement monitoring & resource management</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-450 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AP-POLICE SECURED</span>
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
                SP
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] leading-tight text-white font-bold font-mono">SP Visakhapatnam</p>
                <p className="text-[8.5px] leading-none text-slate-400">Law Enforcement Command</p>
              </div>
            </div>
          </div>
        </header>

        {/* 7 KPIstat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Units</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">42 Units</h3>
            <span className="text-[8px] text-slate-500 font-mono">Active registration roster</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">On Duty</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">36 Units</h3>
            <span className="text-[8px] text-emerald-500 font-mono">85.7% active duty shift</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Deployed</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">24 Units</h3>
            <span className="text-[8px] text-sky-400 font-mono">Assigned to incidents</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Available</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">12 Units</h3>
            <span className="text-[8px] text-slate-450 font-mono">Standby in district reserves</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Patrols Active</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">18 Routes</h3>
            <span className="text-[8px] text-slate-450 font-mono">Assigned key sectors</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Incidents Assigned</span>
            <h3 className="text-lg font-black text-red-400 font-mono leading-none mt-1">8 incidents</h3>
            <span className="text-[8px] text-red-500 font-mono">● Dispatching status</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Avg Response Time</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">4.2 mins</h3>
            <span className="text-[8px] text-slate-450 font-mono">District average</span>
          </div>
        </section>

        {/* WORKSPACE Row */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[460px]">
          
          {/* COLUMN 1, 2 & 3: LIVE UNIT TRACKING MAP */}
          <div className="xl:col-span-3 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-xs font-mono shrink-0">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-sky-400 animate-pulse" />
                <h4 className="font-bold text-white uppercase tracking-wider">LIVE UNIT TRACKING</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1.5" />
                <span>GPS Feeds Linked</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-950 overflow-hidden min-h-[300px] bg-slate-950">
              <MapContainer
                center={[17.7200, 83.3150]}
                zoom={13}
                markers={mapMarkers}
              />
              
              {/* Floating controls overlays */}
              <div className="absolute top-4 right-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1.5 text-[8.5px] font-mono text-slate-350">
                <h5 className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Units Status</h5>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Critical Alert</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>High/Congested</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span>En Route</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Patrolling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4: UNIT DETAILS PANEL */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Unit Details</h4>
              </div>
              <span className="text-[8.5px] font-bold text-sky-400 bg-sky-950/20 border border-sky-900/30 px-1.5 py-0.5 rounded font-mono shrink-0 uppercase">{selectedUnit.id}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
              
              <div className="space-y-1">
                <h5 className="font-extrabold text-white text-sm">{selectedUnit.name}</h5>
                <p className="text-[9.5px] text-slate-400 font-mono">Officer: {selectedUnit.officer}</p>
              </div>

              {/* Specifications list */}
              <div className="space-y-1.5 text-[10px] font-mono border-t border-b border-slate-900/60 py-2.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Call Sign:</span>
                  <span className="text-slate-200 font-bold">{selectedUnit.callSign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Personnel:</span>
                  <span className="text-slate-200">{selectedUnit.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="text-slate-200">{selectedUnit.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-200 truncate max-w-[120px]">{selectedUnit.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Velocity:</span>
                  <span className="text-sky-400 font-bold">{selectedUnit.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Telemetry:</span>
                  <span className="text-slate-400">{selectedUnit.lastUpdate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{selectedUnit.status}</span>
                </div>
              </div>

              {/* Patrol route progress list */}
              <div className="space-y-2">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Patrol Progress Route</span>
                
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/40 space-y-1.5 font-mono text-[9.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Track:</span>
                    <span className="text-slate-200">{selectedUnit.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed Share:</span>
                    <span className="text-slate-200">{selectedUnit.progress}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900/60 pt-1.5 mt-1">
                    <span className="text-slate-500">ETA Next Checkpoint:</span>
                    <span className="text-sky-400 font-bold">{selectedUnit.eta}</span>
                  </div>
                  <p className="text-[8.5px] text-slate-450 italic mt-1 leading-normal">Checkpoint target: {selectedUnit.nextCheckpoint}</p>
                </div>
              </div>

              {/* Action dispatch buttons */}
              <div className="flex flex-col space-y-1.5 pt-1.5 border-t border-slate-900/50 mt-2">
                <button className="py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold font-mono tracking-wider transition-all text-[9.5px] uppercase cursor-pointer text-center">
                  📣 Dispatch Message
                </button>
                <button className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-350 font-mono transition-all text-[9px] uppercase cursor-pointer text-center">
                  ⚙️ Recalibrate Route
                </button>
              </div>

            </div>
          </div>

        </section>

        {/* LOWER OPERATIONS WORKSPACE */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          
          {/* Active incidents queue */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Active Law Incidents</span>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-slate-450 border-b border-slate-900 pb-1">
                    <th className="py-1">Ticket</th>
                    <th className="py-1">Incident</th>
                    <th className="py-1">Severity</th>
                    <th className="py-1">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-300">
                  {policeIncidents.map((inc) => (
                    <tr key={inc.ticket} className="hover:bg-slate-905/30">
                      <td className="py-1.5 font-bold text-white">{inc.ticket}</td>
                      <td className="py-1.5 truncate max-w-[90px]">{inc.title}</td>
                      <td className={`py-1.5 uppercase font-bold ${inc.priority === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>{inc.priority}</td>
                      <td className="py-1.5 text-slate-200">{inc.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unit Status Breakdown */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Unit Status Breakdown</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Active Patrolling:</span>
                <span className="text-emerald-400 font-bold">18 units (42.8%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Incident Response:</span>
                <span className="text-sky-400 font-bold">12 units</span>
              </div>
              <div className="flex justify-between">
                <span>Standby Reserve:</span>
                <span className="text-slate-400 font-bold">12 units</span>
              </div>
            </div>
          </div>

          {/* Deployment Zones */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Sector Deployments</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>MVP Colony Sector 4:</span>
                <span className="text-red-405 font-bold">8 Units deploy</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Gajuwaka Industrial:</span>
                <span className="text-amber-500 font-bold">12 Units deploy</span>
              </div>
              <div className="flex justify-between">
                <span>Beach Road Arterial:</span>
                <span className="text-slate-400">4 Units deploy</span>
              </div>
            </div>
          </div>

          {/* Live Police Radio Log feed */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Live Radio Feed Ticker</span>
            <div className="space-y-1.5 text-[9.5px] font-mono text-slate-450 max-h-[85px] overflow-y-auto pr-0.5">
              <p className="border-b border-slate-900/60 pb-1">
                <span className="text-sky-400 font-bold mr-1">[P-101 12:44]:</span> Patrolling MVP colony Double Road. Traffic normal.
              </p>
              <p className="border-b border-slate-900/60 pb-1">
                <span className="text-red-400 font-bold mr-1">[P-305 12:42]:</span> Arrived on scene at Beach road sector 4 blockage.
              </p>
              <p>
                <span className="text-emerald-400 font-bold mr-1">[P-114 12:40]:</span> Dispatching to NH16 escort target.
              </p>
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
