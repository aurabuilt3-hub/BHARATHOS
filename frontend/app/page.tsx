'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Flame, 
  HeartPulse, 
  Activity, 
  CloudRain, 
  Database, 
  Map, 
  Cpu, 
  Building, 
  Network, 
  ArrowRight, 
  Lock, 
  User, 
  CheckCircle2, 
  Zap, 
  Settings, 
  Layers, 
  Video, 
  Train, 
  Plane, 
  Power, 
  Radio, 
  FileText, 
  ExternalLink, 
  Eye,
  Check,
  Building2,
  AlertTriangle,
  Locate,
  Maximize2,
  Plus,
  Minus,
  Navigation,
  Compass
} from 'lucide-react'

import BrandLogo from '../components/ui/BrandLogo'
import IndiaDigitalTwin from '../components/landing/IndiaDigitalTwin'
import LiveMapLayers from '../components/landing/LiveMapLayers'
import NationalDigitalTwinMapSection from '../components/landing/NationalDigitalTwinMapSection'

export default function HomeLandingPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      
      {/* 1. AMBIENT GLOW BACKDROPS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-sky-500/5 rounded-full filter blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-10 w-[450px] h-[450px] bg-purple-500/3 rounded-full filter blur-[100px] pointer-events-none z-0" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.12)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* 2. STICKY STYLED GOVERNMENT HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/60 bg-[#030712]/80 backdrop-blur-xl select-none">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12 h-28 flex items-center justify-between">
          
          {/* Header Left Branding Block */}
          <BrandLogo size="md" />

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-12 text-[11px] font-semibold tracking-[0.15em] text-slate-400 font-mono antialiased">
            <Link href="/" className="text-sky-400 border-b-2 border-sky-500 pb-1.5 px-0.5 transition-all duration-300">HOME</Link>
            <a href="#supported-domains" className="hover:text-white transition-colors py-1">DOMAINS</a>
            <a href="#national-stats" className="hover:text-white transition-colors py-1">STATISTICS</a>
            <a href="#digital-twin" className="hover:text-white transition-colors py-1">DIGITAL TWIN</a>
            <Link href="/dashboard/national" className="hover:text-white transition-colors py-1 flex items-center space-x-1.5">
              <span>COMMAND DECK</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </nav>

          {/* Right Controls Area */}
          <div className="flex items-center space-x-3.5">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider font-mono uppercase select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            <Link 
              href="/dashboard/national" 
              className="hidden sm:inline-flex items-center justify-center space-x-1.5 px-4 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-bold shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(30,41,59,0.4),0_0_12px_rgba(148,163,184,0.1)] transition-all duration-200 hover:-translate-y-[2px] backdrop-blur-md bg-opacity-40"
            >
              <User className="w-3.5 h-3.5" />
              <span>Guest Preview</span>
            </Link>

            <Link 
              href="/login" 
              className="inline-flex items-center justify-center space-x-1.5 px-4 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.45),0_0_12px_rgba(59,130,246,0.35)] transition-all duration-200 hover:-translate-y-[2px]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Official Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO CONTAINER - THREE PANEL LAYOUT */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 relative z-10">
        
        <section className="grid grid-cols-1 lg:grid-cols-[28fr_44fr_28fr] gap-8 items-start lg:h-[780px]">
          
          {/* LEFT PANEL */}
          <div className="h-full flex flex-col justify-start py-2 lg:pt-0 lg:-mt-4">
            <div className="space-y-6 lg:max-w-[340px]">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] text-[10px] font-bold tracking-wider font-mono uppercase">
                <Shield className="w-3 h-3" />
                <span>Government of India AI Platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-[2.3rem] font-black tracking-tight leading-[1.15] text-white">
                One Platform.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Every Emergency.</span><br />
                Every Department.<br />
                Every Citizen.
              </h1>

              <p className="text-[12.5px] text-slate-300 leading-[1.7] font-medium max-w-[92%]">
                BharatOS unifies multi-agent AI, spatial digital twin systems, and real-time operations across India to coordinate emergency dispatch, emergency decision-making, and resilient public governance.
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-[10.5px] font-semibold font-mono tracking-wider text-slate-300 justify-items-start pl-1">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3 h-3 text-sky-400" />
                  <span>Multi-Agent AI</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3 h-3 text-sky-400" />
                  <span>Emergency Actions</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3 h-3 text-sky-400" />
                  <span>Digital Twin Mesh</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3 h-3 text-sky-400" />
                  <span>Smart Governance</span>
                </div>
              </div>

              {/* Launch Buttons block */}
              <div className="pt-4 space-y-4">
                <div className="flex flex-col gap-3 w-[78%]">
                  <Link 
                    href="/dashboard/national" 
                    className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.45),0_0_12px_rgba(59,130,246,0.35)] transition-all duration-200 hover:-translate-y-[2px] group"
                  >
                    <span>Continue as Guest</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/dashboard/national" 
                    className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-bold shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(30,41,59,0.4),0_0_12px_rgba(148,163,184,0.1)] transition-all duration-200 hover:-translate-y-[2px] backdrop-blur-md bg-opacity-40"
                  >
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Enter Command Center</span>
                  </Link>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1 pt-1 select-none w-[78%]">
                  <span>Explore public guest scenarios</span>
                  <span>Secondary entry bypass</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER PANEL: HUGE DIGITAL TWIN CARD & STATUS STRIP */}
          <div className="flex flex-col justify-between space-y-5 py-2 h-full w-full max-w-[965px] mx-auto">
            <IndiaDigitalTwin />
            
            {/* Compact glass status strip below the map */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl border border-slate-900 bg-slate-950/75 backdrop-blur-md text-[9px] font-mono font-bold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>28/28 States Connected</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>8 UT Connected</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>785+ Districts</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>13 AI Agents</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>12 Departments</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Network 99.98%</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE LAYERS & FEED */}
          <div className="py-2 h-full w-full">
            <LiveMapLayers />
          </div>

        </section>

        {/* 1. GOVERNMENT INFRASTRUCTURE APIs */}
        <section id="govt-infrastructure" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Government Infrastructure APIs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Live backhaul telemetry and connection status with official Government of India services.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'IMD Weather Feed', status: 'Connected', sync: '3s ago', latency: '45ms', health: '99.9%' },
              { name: 'NDMA Core Registry', status: 'Connected', sync: '1s ago', latency: '24ms', health: '99.9%' },
              { name: 'ISRO Bhuvan GIS', status: 'Connected', sync: 'Just Now', latency: '12ms', health: '99.9%' },
              { name: 'ERSS 112 Gateway', status: 'Connected', sync: 'Just Now', latency: '6ms', health: '100%' },
              { name: 'NIC Secure Portal', status: 'Connected', sync: '8s ago', latency: '18ms', health: '99.9%' },
              { name: 'Central Water Comm.', status: 'Connected', sync: '12s ago', latency: '40ms', health: '99.8%' },
              { name: 'Ministry of Health', status: 'Connected', sync: '2m ago', latency: '33ms', health: '99.9%' },
              { name: 'Indian Railways', status: 'Connected', sync: '15s ago', latency: '45ms', health: '99.8%' },
              { name: 'Power Grid Registry', status: 'Connected', sync: 'Just Now', latency: '8ms', health: '99.9%' },
              { name: 'Digital India API', status: 'Connected', sync: '1m ago', latency: '14ms', health: '99.9%' }
            ].map((api) => (
              <div 
                key={api.name}
                className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 hover:border-slate-800/85 hover:bg-[#0B0F19]/40 hover:shadow-lg transition-all duration-200 select-none text-left flex flex-col justify-between h-[155px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      {api.name}
                    </h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">
                      {api.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 mt-2 space-y-1 font-mono text-[8.5px] text-slate-500">
                  <div className="flex justify-between"><span>LAST SYNC:</span><span className="text-slate-300 font-bold">{api.sync}</span></div>
                  <div className="flex justify-between"><span>LATENCY:</span><span className="text-slate-300 font-bold">{api.latency}</span></div>
                  <div className="flex justify-between"><span>HEALTH %:</span><span className="text-emerald-400 font-bold">{api.health}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. AI EMERGENCY WORKFLOW */}
        <section id="ai-workflow" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              AI Emergency Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Synchronized pipeline detailing multi-agent dispatch coordination, validation, and resolution steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            
            {/* Animated network routing pipeline connecting the nodes */}
            <div className="hidden md:block absolute top-[44px] left-[6%] right-[6%] h-[8px] pointer-events-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M 0,5 H 100" fill="none" stroke="rgba(6,182,212,0.18)" strokeWidth="1.5" />
                <circle r="1.5" fill="#00f2ff">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 0,5 H 100" />
                </circle>
                <circle r="1.5" fill="#a855f7" style={{ animationDelay: '1.5s' }}>
                  <animateMotion dur="4.5s" repeatCount="indefinite" path="M 0,5 H 100" />
                </circle>
              </svg>
            </div>

            {[
              { step: '01', title: 'Citizen Report', desc: 'IoT Trigger / SOS Call', status: 'INCOMING', glow: 'border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' },
              { step: '02', title: 'AI Classification', desc: 'Category parsing & risk analysis', status: 'PROCESSING', glow: 'border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' },
              { step: '03', title: 'Dept Selection', desc: 'Cross-agency resource routing', status: 'ROUTING', glow: 'border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-[#0b1329]/20 border-cyan-500/40 animate-[pulse_3s_infinite_ease-in-out]' },
              { step: '04', title: 'Officer Approval', desc: 'Manual plinth confirmation', status: 'WAITING', glow: 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
              { step: '05', title: 'Dispatch', desc: 'ERSS 112 automated alert', status: 'STANDBY', glow: 'border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' },
              { step: '06', title: 'Live Tracking', desc: 'GIS location & drone monitoring', status: 'STANDBY', glow: 'border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' },
              { step: '07', title: 'Resolved', desc: 'Case closing & logs archived', status: 'STANDBY', glow: 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' }
            ].map((node) => (
              <div 
                key={node.title}
                className={`relative z-10 rounded-2xl border bg-[#0B0F19]/85 p-4 space-y-3 transition-all duration-300 hover:-translate-y-0.5 select-none ${node.glow}`}
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[9.5px] font-mono text-slate-500 font-bold">
                    STEP {node.step}
                  </span>
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    {node.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug">
                    {node.desc}
                  </p>
                </div>
                <div className="pt-1 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[8.5px] font-mono text-slate-400 tracking-wider">
                    {node.status}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* 3. SCENARIO SIMULATOR */}
        <section className="space-y-8 border-t border-slate-900/60 pt-16">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Scenario Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Execute response playbooks and auto-routing policies in a simulated environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'flood', title: 'Urban Flood Response', time: '12 mins', depts: 'NDMA, Traffic, CWC', agents: 'Coord, Water, Traffic' },
              { id: 'cyclone', title: 'Cyclone Response', time: '9 mins', depts: 'IMD, NDMA, Navy, ERSS', agents: 'Coord, Weather, Rescue' },
              { id: 'fire', title: 'Fire & Hazmat Response', time: '6 mins', depts: 'Fire, Health, Power Grid', agents: 'Coord, Rescue, Medical' },
              { id: 'earthquake', title: 'Earthquake Response', time: '15 mins', depts: 'NDMA, Health, Police', agents: 'Coord, Struct, Rescue' }
            ].map((scenario) => (
              <div 
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`cursor-pointer group relative rounded-2xl border p-5 transition-all duration-350 select-none flex flex-col justify-between h-[210px] ${
                  selectedScenario === scenario.id
                    ? 'border-sky-500 bg-sky-500/5 shadow-[0_0_20px_rgba(14,165,233,0.15)]'
                    : 'border-slate-900 bg-slate-950/20 hover:border-slate-800 hover:bg-slate-950/45'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">
                      ACTIVE PLAYBOOK
                    </span>
                    <span className="text-[9.5px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-bold">
                      EST: {scenario.time}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    {scenario.title}
                  </h3>
                </div>

                <div className="space-y-2 border-t border-slate-900/60 pt-3 text-[9.5px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">DEPTS:</span>
                    <span className="text-slate-300 font-bold">{scenario.depts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI AGENTS:</span>
                    <span className="text-sky-400 font-bold">{scenario.agents}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-900/40">
                  <button className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-[9px] font-bold text-center transition-colors">
                    SIMULATE
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[9px] font-bold text-center border border-slate-850 transition-colors">
                    WORKFLOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. NATIONAL DIGITAL TWIN */}
        <section id="digital-twin" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              National Digital Twin Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              ISRO Bhuvan mesh layers synthesizing police grids, NDRF units, hospital capacity, and hazard areas.
            </p>
          </div>

          <NationalDigitalTwinMapSection />
        </section>

        {/* 5. RESOURCE AVAILABILITY */}
        <section id="resource-availability" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Resource Availability Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              National status logs detailing emergency vehicle and personnel status counts ready for database sync.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Police Units', avail: 1420, busy: 320, offline: 15, update: '1s ago' },
              { name: 'Fire Trucks', avail: 420, busy: 110, offline: 4, update: '3s ago' },
              { name: 'Ambulances', avail: 840, busy: 290, offline: 8, update: 'Just Now' },
              { name: 'Emergency Beds', avail: 2450, busy: 1120, offline: 0, update: '12s ago' },
              { name: 'NDRF Teams', avail: 34, busy: 8, offline: 0, update: '1m ago' },
              { name: 'Relief Shelters', avail: 180, busy: 45, offline: 2, update: '5m ago' },
              { name: 'Blood Banks', avail: 95, busy: 5, offline: 0, update: '2m ago' },
              { name: 'Disaster Responders', avail: 4800, busy: 1200, offline: 40, update: '10s ago' }
            ].map((res) => (
              <div 
                key={res.name}
                className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 hover:border-slate-800/80 hover:bg-[#0B0F19]/45 hover:shadow-lg transition-all duration-200 select-none text-left flex flex-col justify-between h-[155px]"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    {res.name}
                  </h4>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">UPDATE: {res.update}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-900/60 mt-3 font-mono">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-400">{res.avail}</div>
                    <div className="text-[7.5px] text-slate-500 font-bold uppercase">AVAIL</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-amber-400">{res.busy}</div>
                    <div className="text-[7.5px] text-slate-500 font-bold uppercase">BUSY</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-400">{res.offline}</div>
                    <div className="text-[7.5px] text-slate-500 font-bold uppercase">OFFLINE</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. NATIONAL INFRASTRUCTURE STATISTICS */}
        <section id="national-stats" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              National Infrastructure Statistics
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium font-sans">
              Administrative telemetry counts representing connected national hardware layers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '785', label: 'Districts Connected', status: 'ACTIVE', color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/20' },
              { value: '17,240', label: 'Police Stations', status: 'NODE READY', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
              { value: '25,480', label: 'Government Hospitals', status: 'LIVE', color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/20' },
              { value: '8,410', label: 'Fire Stations', status: 'SYNCED', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
              { value: '12', label: 'Connected Departments', status: 'SECURE LINK', color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
              { value: '124,800+', label: 'IoT Grid Sensors', status: 'LIVE DATA', color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20' },
              { value: '13', label: 'AI Cognition Agents', status: 'ONLINE', color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { value: '4,280', label: 'Emergency Calls Today', status: 'TRACKING', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' }
            ].map((stat) => (
              <div 
                key={stat.label}
                className="rounded-2xl border border-slate-900 bg-slate-950/20 p-6 flex flex-col justify-between hover:border-slate-800/80 hover:bg-[#0B0F19]/45 hover:shadow-lg transition-all duration-200 select-none group h-[145px]"
              >
                <div className="space-y-1">
                  <span className={`text-[9px] font-bold font-mono tracking-widest px-1.5 py-0.5 rounded border uppercase ${stat.bg} ${stat.color}`}>
                    {stat.status}
                  </span>
                  <h3 className={`text-2xl font-black font-mono tracking-tight pt-2 transition-transform duration-200 ${stat.color}`}>
                    {stat.value}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-sans leading-tight pt-2 border-t border-slate-900/60 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. GOVERNMENT API HEALTH MONITOR */}
        <section id="health-monitor" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Government API Health Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium font-sans">
              Real-time hardware latency diagnostics, endpoint clearance check, and active backhaul connectivity.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'IMD API', status: 'Connected', latency: '45ms', sync: '3s ago', version: 'v3.2', health: '99.9%' },
              { name: 'NDMA API', status: 'Connected', latency: '24ms', sync: '1s ago', version: 'v1.8', health: '99.9%' },
              { name: 'ERSS Gateway', status: 'Connected', latency: '6ms', sync: 'Just Now', version: 'v2.4', health: '100%' },
              { name: 'NIC Portal', status: 'Connected', latency: '18ms', sync: '8s ago', version: 'v2.4', health: '99.9%' },
              { name: 'ISRO Bhuvan', status: 'Connected', latency: '12ms', sync: 'Just Now', version: 'v4.0', health: '99.9%' },
              { name: 'Health Ministry', status: 'Connected', latency: '33ms', sync: '2m ago', version: 'v2.1', health: '99.9%' },
              { name: 'Power Grid API', status: 'Connected', latency: '8ms', sync: 'Just Now', version: 'v3.0', health: '99.9%' },
              { name: 'Railways API', status: 'Connected', latency: '45ms', sync: '15s ago', version: 'v1.9', health: '99.8%' }
            ].map((api) => (
              <div 
                key={api.name}
                className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 hover:border-slate-800/80 hover:bg-[#0B0F19]/45 hover:shadow-lg transition-all duration-200 select-none text-left flex flex-col justify-between h-[155px]"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    {api.name}
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="pt-2.5 space-y-1 font-mono text-[8.5px] text-slate-500">
                  <div className="flex justify-between"><span>LATENCY:</span><span className="text-slate-300 font-bold">{api.latency}</span></div>
                  <div className="flex justify-between"><span>LAST SYNC:</span><span className="text-slate-300 font-bold">{api.sync}</span></div>
                  <div className="flex justify-between"><span>VERSION:</span><span className="text-slate-300 font-bold">{api.version}</span></div>
                  <div className="flex justify-between"><span>HEALTH %:</span><span className="text-emerald-400 font-bold">{api.health}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. AI AGENT STATUS */}
        <section id="ai-agent-status" className="space-y-8 border-t border-slate-900/60 pt-16 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              AI Command Agents Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Operational diagnostics and computational load of cognitive agents handling incident pipeline triage.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Vision Agent', status: 'Running', cpu: '14.2%', mem: '1.2GB', inf: '42 inf/s', health: '99.8%' },
              { name: 'Language Agent', status: 'Running', cpu: '22.8%', mem: '2.4GB', inf: '85 inf/s', health: '99.9%' },
              { name: 'Forecast Agent', status: 'Running', cpu: '8.4%', mem: '0.8GB', inf: '12 inf/s', health: '99.9%' },
              { name: 'Routing Agent', status: 'Running', cpu: '12.0%', mem: '1.1GB', inf: '55 inf/s', health: '99.9%' },
              { name: 'Dispatch Agent', status: 'Running', cpu: '6.5%', mem: '0.6GB', inf: '30 inf/s', health: '100.0%' },
              { name: 'Analytics Agent', status: 'Running', cpu: '18.1%', mem: '1.9GB', inf: '72 inf/s', health: '99.9%' }
            ].map((agent) => (
              <div 
                key={agent.name}
                className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 hover:border-slate-800/80 hover:bg-[#0B0F19]/45 hover:shadow-lg transition-all duration-200 select-none text-left flex flex-col justify-between h-[155px]"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    {agent.name}
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="pt-2.5 space-y-1 font-mono text-[8.5px] text-slate-500">
                  <div className="flex justify-between"><span>CPU LOAD:</span><span className="text-slate-300 font-bold">{agent.cpu}</span></div>
                  <div className="flex justify-between"><span>MEMORY:</span><span className="text-slate-300 font-bold">{agent.mem}</span></div>
                  <div className="flex justify-between"><span>INFERENCE:</span><span className="text-slate-300 font-bold">{agent.inf}</span></div>
                  <div className="flex justify-between"><span>HEALTH %:</span><span className="text-emerald-400 font-bold">{agent.health}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 9. SIMPLE GOVERNMENT FOOTER */}
      <footer className="border-t border-slate-900/60 bg-[#060a13] mt-24 py-12 relative overflow-hidden z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Footer Left Branding */}
            <div className="md:col-span-4 space-y-4">
              <BrandLogo size="md" />
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm">
                BharatOS coordinates multi-agent AI, spatial digital twin systems, and real-time operations across India to coordinate emergency dispatch, emergency decision-making, and resilient public governance.
              </p>
            </div>

            {/* Footer Center Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs font-bold tracking-widest text-slate-400 font-mono">
              <div className="space-y-2">
                <h5 className="text-[9px] text-slate-600 font-extrabold tracking-[0.2em] uppercase">DOCUMENTATION</h5>
                <p className="hover:text-white transition-colors cursor-pointer">PRIVACY POLICY</p>
                <p className="hover:text-white transition-colors cursor-pointer">TERMS OF SERVICE</p>
                <p className="hover:text-white transition-colors cursor-pointer font-sans leading-none uppercase">Government API References</p>
              </div>
              <div className="space-y-2">
                <h5 className="text-[9px] text-slate-600 font-extrabold tracking-[0.2em] uppercase">RESOURCES</h5>
                <p className="hover:text-white transition-colors cursor-pointer">COMMAND SCENARIOS</p>
                <p className="hover:text-white transition-colors cursor-pointer">GITHUB REPOSITORY</p>
                <p className="hover:text-white transition-colors cursor-pointer">SMART INDIA HACKATHON</p>
              </div>
            </div>

            {/* Footer Right Badges */}
            <div className="md:col-span-4 space-y-4 text-xs text-slate-500">
              <h5 className="text-[9px] text-slate-600 font-extrabold tracking-[0.2em] uppercase font-mono">GOVERNMENT PUBLIC INFRASTRUCTURE</h5>
              <p className="leading-relaxed">
                BharatOS is engineered for integration with NDMA disaster mitigation policies, ISRO Bhuvan spatial overlays, and NIC central directories.
              </p>
            </div>

          </div>

          {/* Footer Bottom Strip */}
          <div className="border-t border-slate-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-500">
            <p>DESIGNED FOR HACKATHON DEMONSTRATION & PROTOTYPE VIEW</p>
            <p className="mt-2 sm:mt-0">
              MADE WITH ❤️ IN INDIA • BHARATOS © 2026
            </p>
          </div>

        </div>
      </footer>

    </div>
  )
}
