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

// Geographic validation for Visakhapatnam operational bounds
const isValidCoordinate = (pos: any): pos is [number, number] => {
  if (!Array.isArray(pos) || pos.length !== 2) return false
  const [lat, lng] = pos
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return false
  // Visakhapatnam regional bounding box check (lat: 17.50-18.00, lng: 83.00-83.50)
  if (lat < 17.50 || lat > 18.00 || lng < 83.00 || lng > 83.50) {
    console.warn(`[Healthcare Map] Marker position out of operational bounds: [${lat}, ${lng}]`)
    return false
  }
  return true
}

interface HospitalData {
  id: string
  name: string
  distance: string
  eta: string
  erLoad: string
  icu: string
  trauma: string
  status: string
  position: [number, number]
  location: string
}

interface AmbulanceData {
  id: string
  incident: string
  destination: string
  status: string
  eta: string
  position: [number, number]
}

const suitableHospitals: HospitalData[] = [
  { id: 'hosp-1', name: 'NTR General Hospital', distance: '1.8 km', eta: '4 mins', erLoad: '72% Load', icu: '6 Available', trauma: 'Level 1 Trauma', status: 'Optimal', position: [17.7250, 83.3320], location: 'Hospital Access Road, Vizag' },
  { id: 'hosp-2', name: 'Seven Hills Clinic', distance: '3.4 km', eta: '8 mins', erLoad: '55% Load', icu: '12 Available', trauma: 'Level 2 Trauma', status: 'Optimal', position: [17.7120, 83.3050], location: 'Ram Nagar, Vizag' },
  { id: 'hosp-3', name: 'Apollo Health Center', distance: '4.8 km', eta: '11 mins', erLoad: '90% Load', icu: '2 Available', trauma: 'Level 1 Trauma', status: 'Delayed', position: [17.7712, 83.3389], location: 'Health City, Arilova' },
  { id: 'hosp-4', name: 'Care Emergency Care', distance: '5.2 km', eta: '12 mins', erLoad: '40% Load', icu: '8 Available', trauma: 'Level 3 Trauma', status: 'Optimal', position: [17.7088, 83.3012], location: 'Maharanipeta, Vizag' }
]

const liveAmbulances: AmbulanceData[] = [
  { id: 'A-21', incident: 'MVP Flooding Trauma', destination: 'NTR General Hospital', status: 'En Route', eta: '3 mins', position: [17.7240, 83.3250] },
  { id: 'A-08', incident: 'Gajuwaka Inhalation Alert', destination: 'Care Emergency Care', status: 'On Scene', eta: 'Reached', position: [17.6812, 83.2104] },
  { id: 'A-19', incident: 'Bypass Expressway Crash', destination: 'Apollo Health Center', status: 'Transporting', eta: '7 mins', position: [17.7550, 83.3280] }
]

export default function HealthcareOperationsPage() {
  const [selectedHosp, setSelectedHosp] = useState('NTR General Hospital')
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  
  // Interactive map center and zoom state initialized to Visakhapatnam operational center
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.6868, 83.2185])
  const [mapZoom, setMapZoom] = useState<number>(12)
  
  // Dynamic selected asset/incident details for map overlay panel
  const [selectedAsset, setSelectedAsset] = useState<{
    title: string
    location: string
    status: string
    detail: string
    coords: string
  }>({
    title: 'Waterlogging Trauma — Ward 12',
    location: 'MVP Colony',
    status: 'Active Emergency',
    detail: 'People affected: 1,240 | Dispatched: Ambulance A-21',
    coords: '17.7289° N, 83.3214° E'
  })

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

  // Raw markers list with validation before map rendering
  const rawMarkers: MapMarker[] = [
    // Hospitals
    ...suitableHospitals.map(h => ({
      id: h.id,
      position: h.position,
      title: h.name,
      description: `${h.location} | ${h.erLoad} | ICU: ${h.icu}`,
      category: h.status === 'Delayed' ? ('medium' as const) : ('low' as const)
    })),
    // Ambulances
    ...liveAmbulances.map(a => ({
      id: a.id,
      position: a.position,
      title: `Ambulance ${a.id}`,
      description: `Status: ${a.status} | Dest: ${a.destination} (ETA: ${a.eta})`,
      category: 'high' as const
     })),
    // Primary Incidents
    {
      id: 'm-1',
      position: [17.7289, 83.3214],
      title: 'MVP Flooding Trauma Incident',
      description: 'Ward 12 MVP Colony | Critical medical dispatch active',
      category: 'critical'
    },
    {
      id: 'm-2',
      position: [17.6812, 83.2104],
      title: 'Gajuwaka Inhalation Alert',
      description: 'Industrial Corridor | Ambulance A-08 on scene',
      category: 'critical'
    },
    {
      id: 'm-3',
      position: [17.7510, 83.3250],
      title: 'Bypass Expressway Crash',
      description: 'Expressway Corridor | Ambulance A-19 transporting',
      category: 'high'
    }
  ]

  // Filter and log any out-of-bounds or malformed markers
  const mapMarkers = rawMarkers.filter(m => isValidCoordinate(m.position))

  // Handler for selecting hospital from list
  const handleSelectHospital = (h: HospitalData) => {
    setSelectedHosp(h.name)
    if (isValidCoordinate(h.position)) {
      setMapCenter(h.position)
      setMapZoom(14)
    }
    setSelectedAsset({
      title: h.name,
      location: h.location,
      status: `Status: ${h.status} (${h.erLoad})`,
      detail: `Trauma: ${h.trauma} | ICU Free: ${h.icu}`,
      coords: `${h.position[0].toFixed(4)}° N, ${h.position[1].toFixed(4)}° E`
    })
  }

  // Handler for selecting ambulance from list
  const handleSelectAmbulance = (a: AmbulanceData) => {
    if (isValidCoordinate(a.position)) {
      setMapCenter(a.position)
      setMapZoom(14)
    }
    setSelectedAsset({
      title: `Ambulance ${a.id}`,
      location: a.incident,
      status: `Status: ${a.status}`,
      detail: `En Route to ${a.destination} (ETA: ${a.eta})`,
      coords: `${a.position[0].toFixed(4)}° N, ${a.position[1].toFixed(4)}° E`
    })
  }

  // Handler for clicking any marker on map
  const handleMarkerClick = (marker: MapMarker) => {
    if (isValidCoordinate(marker.position)) {
      setMapCenter(marker.position)
      setMapZoom(14)
    }
    setSelectedAsset({
      title: marker.title,
      location: 'Visakhapatnam Operational Sector',
      status: `Category: ${marker.category ? marker.category.toUpperCase() : 'ACTIVE'}`,
      detail: marker.description || 'Live GPS Unit Tracked',
      coords: `${marker.position[0].toFixed(4)}° N, ${marker.position[1].toFixed(4)}° E`
    })
  }

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

            <div className="w-full h-[550px] min-h-[550px] relative rounded-xl border border-slate-950 overflow-hidden bg-slate-950">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                markers={mapMarkers}
                onMarkerClick={handleMarkerClick}
              />
              
              {/* Map selected incident / asset popup overlay */}
              <div className="absolute bottom-4 left-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/90 backdrop-blur-md shadow-2xl space-y-1.5 text-[9px] font-mono text-slate-300 max-w-[220px]">
                <h5 className="font-bold text-red-400 uppercase tracking-widest border-b border-slate-900 pb-1">SELECTED ASSET / INCIDENT</h5>
                <p className="font-bold text-white leading-normal truncate">{selectedAsset.title}</p>
                <div className="space-y-0.5 text-slate-400">
                  <p>Location: {selectedAsset.location}</p>
                  <p>{selectedAsset.status}</p>
                  <p className="truncate">{selectedAsset.detail}</p>
                  <p className="text-sky-400 font-bold mt-1">{selectedAsset.coords}</p>
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
                    onClick={() => handleSelectHospital(h)}
                    className={`p-2.5 rounded-lg border border-slate-900/60 bg-slate-950/40 hover:bg-slate-950 transition-all cursor-pointer space-y-1 ${selectedHosp === h.name ? 'border-sky-500 bg-slate-900' : ''}`}
                  >
                    <div className="flex justify-between font-bold text-white">
                      <span className="truncate max-w-[120px]">{h.name}</span>
                      <span className="text-sky-400 font-mono">{h.distance}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-455 border-t border-slate-900/40 pt-1 mt-1">
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
                    <div 
                      key={a.id} 
                      onClick={() => handleSelectAmbulance(a)}
                      className="p-2 rounded bg-slate-950/30 hover:bg-slate-900 flex items-center justify-between text-slate-300 cursor-pointer transition-all border border-transparent hover:border-slate-800"
                    >
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
                <span className="text-yellow-400 font-bold">Delayed (90% ER load)</span>
              </div>
              <div className="flex justify-between">
                <span>Care Emergency Care:</span>
                <span className="text-emerald-400 font-bold">Optimal (40% ER load)</span>
              </div>
            </div>
          </div>

          {/* ICU Bed Reserve */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">ICU Bed Reserve Breakdown</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Level 1 Trauma Beds:</span>
                <span className="text-white font-bold">18 Standby</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Pediatric ICU Units:</span>
                <span className="text-emerald-400 font-bold">12 Available</span>
              </div>
              <div className="flex justify-between">
                <span>Burn & Inhalation ICU:</span>
                <span className="text-sky-400 font-bold">12 Reserve</span>
              </div>
            </div>
          </div>

          {/* Emergency Dispatch Protocol */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Emergency Dispatch Protocol</span>
            <div className="mt-2 text-[10px] font-mono text-slate-300 space-y-1 flex-1 flex flex-col justify-center">
              <p className="text-slate-400 leading-relaxed">
                <span className="text-red-400 font-bold mr-1">ADVISORY:</span> Reroute Ambulance A-19 to NTR General. Apollo ER load has reached 90% threshold limits.
              </p>
              <div className="flex items-center space-x-2 pt-1 text-[9px] text-sky-400">
                <Shield className="w-3 h-3 shrink-0" />
                <span>Auto-triage routing active</span>
              </div>
            </div>
          </div>

          {/* Emergency Triage Actions */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Quick Triage Actions</span>
            <div className="grid grid-cols-2 gap-2 mt-2 flex-1 items-center">
              <button className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 font-mono text-[9px] font-bold transition-all text-left flex items-center justify-between">
                <span>REROUTE A-19</span>
                <Play className="w-2.5 h-2.5 text-red-400" />
              </button>
              <button className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 hover:bg-sky-500/30 text-sky-300 font-mono text-[9px] font-bold transition-all text-left flex items-center justify-between">
                <span>OPEN ICU WING</span>
                <Building2 className="w-2.5 h-2.5 text-sky-400" />
              </button>
              <button className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[9px] font-bold transition-all text-left flex items-center justify-between">
                <span>DISPATCH BLOOD</span>
                <HeartPulse className="w-2.5 h-2.5 text-emerald-400" />
              </button>
              <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-mono text-[9px] font-bold transition-all text-left flex items-center justify-between">
                <span>EXPORT REPORT</span>
                <FileText className="w-2.5 h-2.5 text-slate-400" />
              </button>
            </div>
          </div>

        </section>

      </div>
    </DashboardLayout>
  )
}
