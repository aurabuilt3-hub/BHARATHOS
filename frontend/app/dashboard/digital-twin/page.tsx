'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import TimelinePlaybackWidget from '../../../components/widgets/TimelinePlaybackWidget'
import AssetDetailsDrawer from '../../../components/widgets/AssetDetailsDrawer'
import { visakhapatnamIncidentsData } from '../../../lib/mock/incidents'
import { visakhapatnamHospitalsData } from '../../../lib/mock/hospitals'
import { visakhapatnamPoliceData } from '../../../lib/mock/police'
import { visakhapatnamFireData } from '../../../lib/mock/fire'
import { visakhapatnamSensorsData } from '../../../lib/mock/sensors'
import { MarkerManager } from '../../../lib/digitalTwin/markerManager'
import { HeatmapManager } from '../../../lib/digitalTwin/heatmapManager'
import { GeoJsonManager } from '../../../lib/digitalTwin/geoJsonManager'
import { SelectedAssetDetail } from '../../../lib/digitalTwin/selectionManager'
import { 
  Layers, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CloudRain, 
  Shield, 
  Flame, 
  HeartPulse, 
  Truck, 
  Sparkles,
  Play,
  Settings,
  Compass
} from 'lucide-react'

export default function DigitalTwinPage() {
  const [currentHour, setCurrentHour] = useState<number>(9)
  const [selectedAsset, setSelectedAsset] = useState<SelectedAssetDetail | null>(null)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Layers state
  const [layers, setLayers] = useState({
    incidents: true,
    emergencyAssets: true,
    hospitals: true,
    shelters: true,
    rainGauges: true,
    drainGauges: true,
    riverGauges: true,
    weatherSensors: true,
    aqiSensors: true,
    traffic: true,
    hazardZones: true,
    wardBoundaries: true
  })

  // Date and time live updates
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

  // 1. Filter incidents by timeline hour and filters
  const filteredIncidents = visakhapatnamIncidentsData.filter((inc) => {
    const matchesHour = inc.timeHour <= currentHour
    const matchesCategory = categoryFilter === 'all' || inc.category.toLowerCase() === categoryFilter.toLowerCase()
    const matchesSeverity = severityFilter === 'all' || inc.severity.toLowerCase() === severityFilter.toLowerCase()
    const matchesStatus = statusFilter === 'all' || inc.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesHour && matchesCategory && matchesSeverity && matchesStatus
  })

  // 2. Convert mock data to map markers using MarkerManager
  const incidentMarkers = MarkerManager.mapIncidentsToMarkers(filteredIncidents)
  const hospitalMarkers = MarkerManager.mapHospitalsToMarkers(visakhapatnamHospitalsData)
  const policeMarkers = MarkerManager.mapPoliceToMarkers(visakhapatnamPoliceData)
  const fireMarkers = MarkerManager.mapFireToMarkers(visakhapatnamFireData)
  const sensorMarkers = MarkerManager.mapSensorsToMarkers(visakhapatnamSensorsData)

  const allMarkers = [
    ...(layers.incidents ? incidentMarkers : []),
    ...(layers.hospitals ? hospitalMarkers : []),
    ...(layers.emergencyAssets ? [...policeMarkers, ...fireMarkers] : []),
    ...(layers.drainGauges || layers.rainGauges || layers.riverGauges || layers.weatherSensors || layers.aqiSensors 
      ? sensorMarkers.filter(s => {
          const title = s.title.toLowerCase()
          if (title.includes('drain') && !layers.drainGauges) return false
          if (title.includes('rain') && !layers.rainGauges) return false
          if (title.includes('river') && !layers.riverGauges) return false
          if (title.includes('weather') && !layers.weatherSensors) return false
          if (title.includes('aqi') && !layers.aqiSensors) return false
          return true
        }) 
      : [])
  ]

  // 3. Load polygons & heatmaps via managers
  const polygons = layers.wardBoundaries ? GeoJsonManager.getVisakhapatnamWardPolygons() : []
  const heatpoints = layers.hazardZones ? HeatmapManager.getVisakhapatnamFloodHeatmap() : []

  // Handle marker selection event
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedAsset({
      id: String(marker.id),
      name: marker.title,
      category: marker.category || 'Asset',
      status: 'Active Monitoring',
      coordinates: marker.position,
      description: marker.description || 'Spatial asset registered in Visakhapatnam Digital Twin registry.',
      relatedIncidents: ['Flood Alert #12', 'Traffic Bypass']
    })
  }

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }))
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
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
            </div>
            <span className="text-slate-800 text-lg">|</span>
            <div>
              <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">VISAKHAPATNAM DIGITAL TWIN</h2>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Live spatial operations & infrastructure intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>GIS CLOUD LINKED</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-mono font-bold">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{currentDate} {currentTime}</span>
            </div>
          </div>
        </header>

        {/* TOP KPI STAT ROW */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Pins</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">{allMarkers.length}</h3>
            <span className="text-[8px] text-slate-500 font-mono">Total map symbols</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">IoT Nodes</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">{sensorMarkers.length}</h3>
            <span className="text-[8px] text-emerald-500 font-mono">Gauges & sensors active</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Emergency Assets</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">127 Units</h3>
            <span className="text-[8px] text-sky-400 font-mono">Police, Fire & Medical</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Incidents</span>
            <h3 className="text-lg font-black text-red-400 font-mono leading-none mt-1">{filteredIncidents.length}</h3>
            <span className="text-[8px] text-red-400 font-mono">Live critical incidents</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Hazard Zones</span>
            <h3 className="text-lg font-black text-amber-500 font-mono leading-none mt-1">{heatpoints.length} Zones</h3>
            <span className="text-[8px] text-amber-500 font-mono">High inundation risk</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Network Health</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">99.8%</h3>
            <span className="text-[8px] text-emerald-500 font-mono">Latency under 12ms</span>
          </div>
        </section>

        {/* CONTROL FILTER BAR */}
        <section className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] font-mono">Filters & Telemetry:</span>
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Accident">Accident</option>
              <option value="Medical">Medical</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="text-slate-500">MODE:</span>
            <span className="text-sky-400 font-bold bg-sky-950/20 border border-sky-900/30 px-2 py-0.5 rounded">LIVE TELEMETRY STREAM</span>
          </div>
        </section>

        {/* MAP STAGE AREA */}
        <section className="flex-1 min-h-[460px] relative rounded-2xl border border-slate-900 overflow-hidden bg-slate-950 flex">
          
          {/* LEFT FLOATING MAP OVERLAY LAYERS PANEL */}
          <div className="absolute top-4 left-4 z-[999] p-4 rounded-xl border border-slate-900 bg-[#060a13]/90 backdrop-blur-md shadow-2xl space-y-3.5 max-w-[200px]">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-900 pb-1.5 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Map Layers</span>
            </h5>
            
            <div className="space-y-2 text-[10px] font-mono text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.incidents} onChange={() => toggleLayer('incidents')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0" />
                <span>Incidents</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.emergencyAssets} onChange={() => toggleLayer('emergencyAssets')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Emergency Units</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.hospitals} onChange={() => toggleLayer('hospitals')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Hospitals</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.shelters} onChange={() => toggleLayer('shelters')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Shelter Camps</span>
              </label>
              
              <div className="border-t border-slate-900/60 my-2 pt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sensors</div>
              
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.rainGauges} onChange={() => toggleLayer('rainGauges')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Rain Gauges</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.drainGauges} onChange={() => toggleLayer('drainGauges')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Drain Gauges</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.riverGauges} onChange={() => toggleLayer('riverGauges')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>River Levels</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.weatherSensors} onChange={() => toggleLayer('weatherSensors')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Weather Sensors</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.aqiSensors} onChange={() => toggleLayer('aqiSensors')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>AQI Monitors</span>
              </label>
              
              <div className="border-t border-slate-900/60 my-2 pt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">Overlays</div>
              
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.hazardZones} onChange={() => toggleLayer('hazardZones')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Hazard Zones</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" checked={layers.wardBoundaries} onChange={() => toggleLayer('wardBoundaries')} className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span>Ward Boundaries</span>
              </label>
            </div>
          </div>

          {/* DYNAMIC LEAFLET MAP ELEMENT */}
          <div className="flex-1 w-full h-[600px] relative">
            <MapContainer
              center={[17.7200, 83.3150]}
              zoom={13}
              markers={allMarkers}
              polygons={polygons}
              heatpoints={heatpoints}
              onMarkerClick={handleMarkerClick}
            />

            {/* Bottom Floating Map Legend */}
            <div className="absolute bottom-4 left-4 z-[999] p-3 rounded-lg border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1 text-[8.5px] font-mono text-slate-350 max-w-[130px]">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Critical Incident</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 bg-blue-500 rounded-full" />
                <span>Hospitals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 bg-purple-500 rounded-full border border-white" />
                <span>IoT Sensor node</span>
              </div>
            </div>
          </div>

          {/* RIGHT FLOATING OVERLAY: SPATIAL INTELLIGENCE */}
          <div className="absolute top-4 right-4 z-[999] p-4 rounded-xl border border-slate-900 bg-[#060a13]/90 backdrop-blur-md shadow-2xl space-y-4 max-w-[240px] max-h-[90%] overflow-y-auto scrollbar-thin">
            
            {/* Spatial anomalies list */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-900 pb-1 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Spatial Anomalies</span>
              </h5>
              <div className="space-y-1.5 text-[9px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded leading-relaxed">
                <p>⚠️ Inundation depth alert: Ward 12 gauge breached 4.2m safety limit.</p>
              </div>
            </div>

            {/* Live sensor network */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-900 pb-1">Live Sensor Network</h5>
              <div className="space-y-1.5 text-[9.5px] font-mono text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Depth Sensors</span>
                  <span className="text-emerald-400 font-bold">12 online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rain Gauges</span>
                  <span className="text-emerald-400 font-bold">8 online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>AQI Monitors</span>
                  <span className="text-emerald-400 font-bold">14 online</span>
                </div>
              </div>
            </div>

            {/* Emergency assets roster */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-900 pb-1">Emergency Assets Roster</h5>
              <div className="space-y-1.5 text-[9.5px] font-mono text-slate-350">
                <div className="flex items-center justify-between">
                  <span>Police Cruisers</span>
                  <span className="text-slate-200">42 deployed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fire Tenders</span>
                  <span className="text-slate-200">12 standby</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ambulance Vans</span>
                  <span className="text-slate-200">18 active</span>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* TIMELINE SLIDER AREA */}
        <section className="shrink-0">
          <TimelinePlaybackWidget
            currentHour={currentHour}
            onHourChange={(h) => setCurrentHour(h)}
          />
        </section>

        {/* LOWER DESKTOP OPERATIONAL PANELS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          
          {/* Panel 1: Live Traffic Overview */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-900 pb-1.5">Live Traffic Overview</h4>
            <div className="space-y-2 text-[10px] font-mono text-slate-300">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Beach Road corridor:</span>
                <span className="text-red-400 font-bold">BLOCKED (0 km/h)</span>
              </div>
              <div className="flex justify-between">
                <span>NH16 Bypass highway:</span>
                <span className="text-yellow-400 font-bold">HEAVY DELAY (24 km/h)</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Hazard Zones */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-900 pb-1.5">Hazard Zones Risk Matrix</h4>
            <div className="space-y-2 text-[10px] font-mono text-slate-300">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>MVP colony Flood Zone:</span>
                <span className="text-red-400 font-bold">Critical Level 4</span>
              </div>
              <div className="flex justify-between">
                <span>Gajuwaka Industrial Alert:</span>
                <span className="text-amber-500 font-bold">High Alert Zone</span>
              </div>
            </div>
          </div>

          {/* Panel 3: Quick Actions */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-900 pb-1">Twin Command Actions</h4>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button className="py-1 rounded bg-red-950/60 hover:bg-red-900/40 text-red-400 text-[9px] font-bold font-mono transition-all border border-red-900/50 uppercase cursor-pointer">
                🚨 Trigger Evac Alert
              </button>
              <button className="py-1 rounded bg-slate-950/60 hover:bg-slate-900/40 text-slate-300 text-[9px] font-bold font-mono transition-all border border-slate-800 uppercase cursor-pointer">
                ⚙️ Recalibrate Sensors
              </button>
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

        {/* Asset Details Drawer */}
        <AssetDetailsDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />

      </div>
    </DashboardLayout>
  )
}
