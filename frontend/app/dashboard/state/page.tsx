'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { andhraPradeshStateData } from '../../../lib/mock/states'
import { apDistrictsData } from '../../../lib/mock/districts'
import { visakhapatnamIncidentsData } from '../../../lib/mock/incidents'
import { 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle, 
  Clock, 
  CloudRain, 
  Sparkles, 
  Cpu, 
  Layers, 
  Globe, 
  Building2, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Server,
  Zap,
  Waves,
  Briefcase,
  Terminal,
  FileText
} from 'lucide-react'
import MetricBadge from '../../../components/ui/MetricBadge'

export default function StateDashboardPage() {
  const state = andhraPradeshStateData
  const districts = apDistrictsData
  const incidents = visakhapatnamIncidentsData

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

  // Geolocation mappings for Andhra Pradesh districts to show on State Map
  const apDistrictMarkers: MapMarker[] = districts.map((d, idx) => {
    const coords: Record<string, [number, number]> = {
      'Visakhapatnam': [17.6868, 83.3150],
      'Vijayawada (NTR)': [16.5062, 80.6480],
      'Guntur': [16.3067, 80.4365],
      'Krishna': [16.1687, 81.1383],
      'Nellore': [14.4426, 79.9865],
      'Kurnool': [15.8281, 78.0373],
      'Anantapur': [14.6819, 77.6006],
      'Chittoor': [13.2172, 79.1003],
      'East Godavari': [17.0005, 81.8016],
      'West Godavari': [16.7107, 81.1004],
      'Srikakulam': [18.2949, 83.8938],
      'Vizianagaram': [18.1124, 83.3989],
      'Kadapa': [14.4710, 78.8243],
      'Prakasam': [15.5057, 80.0499],
      'Nandyal': [15.4847, 78.4849]
    }
    
    const pos = coords[d.name] || [16.5062 + (idx * 0.25 - 0.5), 80.6480 + (idx * 0.25 - 0.5)]
    let cat: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (d.riskLevel === 'critical') cat = 'critical'
    else if (d.riskLevel === 'high') cat = 'high'
    else if (d.riskLevel === 'medium') cat = 'medium'

    return {
      id: d.id || `dist-${idx}`,
      position: pos,
      title: `${d.name} Command Node`,
      description: `Active: ${d.activeIncidents} | Level: ${d.riskLevel}`,
      category: cat
    }
  })

  return (
    <DashboardLayout 
      userRole="dept_head"
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
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
            </div>
            <span className="text-slate-800 text-lg">|</span>
            <div>
              <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">STATE COMMAND CENTER</h2>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Andhra Pradesh State Headquarters</p>
            </div>
          </div>

          {/* TELEMETRY INFORMATION */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AP-WAN: SECURE</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-orange-400 bg-orange-950/10 border border-orange-900/30 rounded-lg px-2.5 py-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3 STATE ALERT CRITICALS ACTIVE</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-mono font-bold">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{currentDate} {currentTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold border-l border-slate-800 pl-4">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-mono font-bold border border-slate-700">
                CS
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] leading-tight text-white font-bold font-mono">Chief Secretary</p>
                <p className="text-[8.5px] leading-none text-slate-400">AP State Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* 7 KPIstat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
          <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Districts</span>
            <h3 className="text-xl font-black text-white font-mono leading-none mt-1">{state.districtsCount}</h3>
            <span className="text-[8px] text-slate-450 font-mono mt-1 border-t border-slate-900/50 pt-1">26 Admin Zones</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">Active Incidents</span>
            <h3 className="text-xl font-black text-red-400 font-mono leading-none mt-1">48</h3>
            <span className="text-[8px] text-red-500 font-mono mt-1 border-t border-slate-900/50 pt-1">● Live Feeds Sync</span>
          </div>

          <div className="p-3.5 rounded-xl border border-red-950/60 bg-red-950/20 shadow-[0_0_12px_rgba(239,68,68,0.06)] flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">Critical Warnings</span>
            <h3 className="text-xl font-black text-white font-mono leading-none mt-1">12</h3>
            <span className="text-[8px] text-red-400 font-mono mt-1 border-t border-red-900/30 pt-1">Severe Alert Level</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Response Teams</span>
            <h3 className="text-xl font-black text-emerald-400 font-mono leading-none mt-1">{state.activeEmergencyTeams}</h3>
            <span className="text-[8px] text-emerald-500 font-mono mt-1 border-t border-slate-900/50 pt-1">On active duty</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Available Resources</span>
            <h3 className="text-xl font-black text-sky-400 font-mono leading-none mt-1">850</h3>
            <span className="text-[8px] text-slate-450 font-mono mt-1 border-t border-slate-900/50 pt-1">Deploys standard</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Pending Approvals</span>
            <h3 className="text-xl font-black text-amber-500 font-mono leading-none mt-1">8</h3>
            <span className="text-[8px] text-amber-500/80 font-mono mt-1 border-t border-slate-900/50 pt-1">Needs CSO sign</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[90px] min-w-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Avg Response Time</span>
            <h3 className="text-xl font-black text-white font-mono leading-none mt-1">12.4m</h3>
            <span className="text-[8px] text-slate-450 font-mono mt-1 border-t border-slate-900/50 pt-1">District average</span>
          </div>
        </section>

        {/* WORKSPACE SECTION */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[480px]">
          
          {/* COLUMN A & B: Large State Operational Map */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 relative">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-xs shrink-0">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">State-wide GIS Boundary telemetry</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
                <span>Amaravati State Node Connected</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-950 overflow-hidden min-h-[380px] bg-slate-950">
              <MapContainer 
                center={[15.9129, 79.7400]} // Andhra Pradesh Center
                zoom={7} 
                markers={apDistrictMarkers}
              />
              
              {/* Legend overlay */}
              <div className="absolute top-4 right-4 z-[999] p-3 rounded-lg border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1.5">
                <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-900 pb-1">Districts Risk</h5>
                <div className="space-y-1 text-[8.5px] font-mono text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Low/Normal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN C: Active Incidents */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Incidents Queue</h4>
              </div>
              <span className="text-[9px] font-bold text-slate-500 font-mono shrink-0">LIVE INC-FEED</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {incidents.slice(0, 8).map((inc) => {
                let badgeColor = 'border-blue-900/30 text-blue-400 bg-blue-950/20'
                if (inc.severity === 'critical') badgeColor = 'border-red-900/50 text-red-400 bg-red-950/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                else if (inc.severity === 'high') badgeColor = 'border-orange-900/50 text-orange-400 bg-orange-950/20'
                else if (inc.severity === 'medium') badgeColor = 'border-yellow-950/50 text-yellow-400 bg-yellow-950/20'

                return (
                  <div 
                    key={inc.id} 
                    className="p-3 rounded-xl border border-slate-900/60 bg-slate-950/30 hover:bg-slate-950 transition-all space-y-1.5 flex flex-col justify-between text-xs"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-white truncate">{inc.title}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono-data ${badgeColor} shrink-0`}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-900/40 pt-1">
                      <span>{inc.location}</span>
                      <span>{inc.timestamp}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* COLUMN D: Multi-Agent AI Engine */}
          <div className="xl:col-span-1 rounded-2xl border border-purple-900/40 bg-purple-950/10 shadow-[0_0_20px_rgba(168,85,247,0.04)] p-4 flex flex-col justify-between max-h-[580px] min-w-0">
            <div className="flex items-center justify-between border-b border-purple-900/20 pb-2.5 mb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">Multi-Agent AI Engine</h4>
              </div>
              <span className="text-[8.5px] font-bold text-purple-400 bg-purple-900/20 border border-purple-800/30 px-1.5 py-0.5 rounded shrink-0">CONNECTED</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
              
              {/* Situation Intel */}
              <div className="p-3 rounded-xl border border-purple-900/40 bg-purple-950/30 space-y-2">
                <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest font-mono block">AI Situation Intelligence</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-500">Threat Level:</span>
                    <span className="text-red-400 font-bold">COASTAL STORM WARNING</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-500">Advisory Confidence:</span>
                    <span className="text-purple-300 font-bold">98.4%</span>
                  </div>
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Impact Assessment</span>
                <p className="text-[10px] text-slate-300 font-mono leading-normal">
                  Heavy rain index (78mm/24h) breaching Ward 12 storm drain limits. Secondary landslide warnings logged for Vizag Ghats.
                </p>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 space-y-1.5">
                <span className="text-[8.5px] font-bold text-purple-400 uppercase tracking-wider font-mono block">AI Advisory Directives</span>
                <p className="text-[10px] text-slate-300 font-mono leading-normal">
                  Dispatch 500L/min dewatering pump M-12 to MVP colony. Divert traffic bypass to NH16 corridors to clear emergency transport lines.
                </p>
                <button className="w-full mt-2 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-white text-[10px] font-bold font-mono tracking-wider transition-all border border-purple-600/30 uppercase cursor-pointer">
                  Approve Advisory Plan
                </button>
              </div>

              {/* Active Agent States */}
              <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/20 space-y-2">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Active Agent Cluster</span>
                <div className="space-y-1.5 text-[9px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-350">🤖 Coordinator Agent</span>
                    <span className="text-emerald-400">● online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-350">🤖 Weather Triage</span>
                    <span className="text-emerald-400">● online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-350">🤖 Traffic advisory</span>
                    <span className="text-purple-400">● processing</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-350">🤖 Emergency Dispatch</span>
                    <span className="text-slate-500">● standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOWER WORKSPACE PANELS */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-3 shrink-0">
          
          {/* Column 1: Risk & Services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Panel 1: Risk & Hazard Intel */}
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Risk & Hazard Intel</span>
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-450">Tidal Surge:</span>
                  <span className="text-orange-400 font-bold">+1.8m Alert</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-450">Wind Speed:</span>
                  <span className="text-slate-300">54 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Precipitation:</span>
                  <span className="text-slate-300">84%</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Critical Services Status */}
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Services Status</span>
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-450">Power Grid:</span>
                  <span className="text-emerald-400">98.2% Active</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-450">Cell Towers:</span>
                  <span className="text-emerald-400">96.8% Up</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Drinking Water:</span>
                  <span className="text-slate-300">14 Stations Up</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Resources & Approvals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Panel 3: Resource Overview */}
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Resource Overview</span>
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-450">Water Pumps:</span>
                  <span className="text-emerald-400">18 Active</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-450">Inflatable Boats:</span>
                  <span className="text-slate-300">42 Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Sandbags:</span>
                  <span className="text-slate-300">8,500 units</span>
                </div>
              </div>
            </div>

            {/* Panel 4: Recent Approvals */}
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Recent Approvals</span>
              <div className="space-y-1 text-[9px] font-mono text-slate-300 overflow-y-auto max-h-[55px] pr-0.5">
                <p className="border-b border-slate-900/60 pb-1 leading-normal">
                  <span className="text-emerald-400 font-bold mr-1">APPROVED:</span>
                  Tender 4 Hazmat deployment.
                </p>
                <p className="leading-normal">
                  <span className="text-emerald-400 font-bold mr-1">APPROVED:</span>
                  Release 2 battalions to NDRF zone.
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Alerts & Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Panel 5: State Alerts */}
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">State Alert Bulletins</span>
              <div className="space-y-1 text-[9px] font-mono text-slate-300 overflow-y-auto max-h-[55px] pr-0.5">
                <p className="border-b border-slate-900/60 pb-1 leading-normal">
                  <span className="text-red-400 font-bold mr-1">CRIT:</span>
                  Evacuate Ward 12 coastal boundaries.
                </p>
                <p className="leading-normal">
                  <span className="text-orange-400 font-bold mr-1">WARN:</span>
                  Traffic bypass redirected around Beach Road.
                </p>
              </div>
            </div>

            {/* Panel 6: State Command Actions */}
            <div className="p-3.5 rounded-xl border border-slate-900 bg-[#0B0F19]/60 space-y-2 min-w-0 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Command Actions</span>
              <div className="flex flex-col space-y-1.5">
                <button className="py-1 rounded bg-red-950/60 hover:bg-red-900/40 text-red-400 text-[9px] font-bold font-mono transition-all border border-red-900/50 uppercase cursor-pointer">
                  🚨 Trigger State SOS
                </button>
                <button className="py-1 rounded bg-slate-950/60 hover:bg-slate-900/40 text-slate-300 text-[9px] font-bold font-mono transition-all border border-slate-800 uppercase cursor-pointer">
                  ⚙️ Audit Feeds
                </button>
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
