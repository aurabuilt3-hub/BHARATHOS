'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  User,
  Bot,
  BookOpen,
  Search,
  Menu,
  X,
  PhoneCall,
  Shield,
  LifeBuoy,
  RefreshCw,
  Navigation
} from 'lucide-react'
import BrandLogo from '../ui/BrandLogo'
import { useCitizenStore } from '../../store/useCitizenStore'
import { AppLanguage, NetworkHealthState, SyncState } from '../../types/citizen'
import { GeolocationService } from '../../services/location/geolocationService'

interface ShellProps {
  children: React.ReactNode
}

export default function BharatOSShell({ children }: ShellProps) {
  const pathname = usePathname()
  const { profile, activeLocation, setLocation, networkState, syncState, emergencyModeActive, setLanguage, setEmergencyMode } = useCitizenStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [manualAddrInput, setManualAddrInput] = useState('')

  // Primary Bottom Navigation Items (STRICTLY EXACTLY 5 ITEMS)
  const primaryNavItems = [
    { label: { en: 'Home', te: 'హోమ్', hi: 'होम' }, path: '/citizen', icon: Home },
    { label: { en: 'Report', te: 'రిపోర్ట్', hi: 'रिपोर्ट' }, path: '/citizen/report', icon: AlertTriangle },
    { label: { en: 'SOS', te: 'SOS', hi: 'ఎస్ओएस' }, path: '/citizen/sos', icon: ShieldAlert, isSos: true },
    { label: { en: 'Alerts', te: 'అలర్ట్‌లు', hi: 'अलर्ट' }, path: '/citizen/alerts', icon: Shield },
    { label: { en: 'My Incidents', te: 'ఇన్సిడెంట్స్', hi: 'घटनाएं' }, path: '/citizen/incidents', icon: Clock }
  ]

  // Secondary & Desktop Drawer Navigation Links
  const secondaryNavItems = [
    { label: { en: 'Find Safe Exit (Evacuation)', te: 'సురక్షిత నిష్క్రమణ (తరలింపు)', hi: 'सुरक्षित निकास (निकासी)' }, path: '/citizen/safe-exit', icon: Navigation, highlight: true },
    { label: { en: 'AI Emergency Assistant', te: 'AI అత్యవసర అసిస్టెంట్', hi: 'ఎఐ ఆపత్కాలీన్ సహాయక్' }, path: '/citizen/ai-assistant', icon: Bot },
    { label: { en: 'Emergency Guidance', te: 'అత్యవసర మార్గదర్శి', hi: 'ఆపత్కాలీన్ నిర్దేశ్' }, path: '/citizen/guidance', icon: BookOpen },
    { label: { en: 'Find Emergency Help', te: 'సహాయం కనుగొనండి', hi: 'సహాయతా ఖోజేం' }, path: '/citizen/resources', icon: Search },
    { label: { en: 'Profile & Contacts', te: 'ప్రొఫైల్ & కాంటాక్ట్స్', hi: 'ప్రోఫైల్ వ సంపర్క్' }, path: '/citizen/profile', icon: User }
  ]

  // Fetch real device coordinates using standard browser Geolocation API
  const handleFetchMyLocation = async () => {
    setIsLocating(true)
    setGpsFeedback('Requesting browser device GPS...')

    const result = await GeolocationService.getDeviceLocation()
    setIsLocating(false)

    if (result.location && result.location.gpsState === 'GPS AVAILABLE') {
      setLocation(result.location)
      setGpsFeedback(`GPS Acquired (±${result.location.accuracy || 10}m)`)
      setTimeout(() => setGpsFeedback(null), 3500)
    } else {
      const errState = result.errorState || 'GPS UNAVAILABLE'
      setLocation({
        ...activeLocation,
        gpsState: errState
      })
      setGpsFeedback(`⚠️ ${result.errorMessage || 'GPS Error'}. Tap to enter address manually.`)
    }
  }

  // Handle Manual Address Submission
  const handleSaveManualLocation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualAddrInput.trim()) return

    setLocation({
      latitude: activeLocation.latitude || 17.7289,
      longitude: activeLocation.longitude || 83.3214,
      address: manualAddrInput.trim(),
      district: 'Manual Entry Location',
      stateName: 'India',
      gpsState: activeLocation.gpsState !== 'GPS AVAILABLE' ? activeLocation.gpsState : 'GPS AVAILABLE',
      isManual: true
    })
    setManualModalOpen(false)
    setManualAddrInput('')
    setGpsFeedback('Manual location saved!')
    setTimeout(() => setGpsFeedback(null), 3000)
  }

  // Human-Readable Connection & Sync Status Message
  const getNetworkBadge = (net: NetworkHealthState, sync: SyncState) => {
    if (sync === 'SYNCING') {
      return { label: 'Your information is sending...', color: 'bg-sky-950/80 text-sky-400 border-sky-800/40', icon: RefreshCw }
    }
    if (net === 'OFFLINE') {
      return { label: "You're offline. Emergency info saved.", color: 'bg-red-950/80 text-red-400 border-red-800/40', icon: WifiOff }
    }
    if (net === 'FAILOVER') {
      return { label: 'Trying another secure connection...', color: 'bg-amber-950/80 text-amber-400 border-amber-800/40', icon: Wifi }
    }
    if (net === 'DEGRADED') {
      return { label: 'Connection is weak', color: 'bg-amber-950/80 text-amber-400 border-amber-800/40', icon: Wifi }
    }
    if (net === 'RECOVERING') {
      return { label: 'Reconnecting...', color: 'bg-blue-950/80 text-blue-400 border-blue-800/40', icon: Wifi }
    }
    return { label: 'Connected', color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40', icon: Wifi }
  }

  const networkBadge = getNetworkBadge(networkState, syncState)
  const NetworkIcon = networkBadge.icon
  const lang = profile.language || 'en'

  return (
    <div className={`min-h-screen ${emergencyModeActive ? 'bg-[#0a0002]' : 'bg-[#030712]'} text-slate-100 flex flex-col relative pb-20 md:pb-8 select-none transition-colors duration-300`}>

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-[#030712]/95 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/citizen" className="flex items-center space-x-2">
            <BrandLogo size="sm" />
            <span className="hidden lg:inline-block text-xs font-black font-mono tracking-widest text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-lg">
              CITIZEN OS
            </span>
          </Link>
        </div>

        {/* Desktop Header Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-950/80 border border-slate-900 rounded-2xl p-1.5 font-mono text-xs">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                  item.isSos
                    ? 'bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg shadow-red-950/50'
                    : isActive
                    ? 'bg-blue-600 text-white font-extrabold shadow-lg shadow-blue-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label[lang]}</span>
              </Link>
            )
          })}

          {/* Safe Exit Desktop Shortcut Button */}
          <Link
            href="/citizen/safe-exit"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-extrabold bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-950/50"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Safe Exit</span>
          </Link>
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex items-center space-x-2">
            {/* Clickable Device Location Pill */}
            <button
              onClick={handleFetchMyLocation}
              title="Click to request real device GPS location"
              className="flex items-center space-x-1 text-[10px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-sky-500 transition-all truncate max-w-[200px] cursor-pointer"
            >
              <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'text-amber-400 animate-spin' : 'text-sky-400'} shrink-0`} />
              <span className="truncate">
                {isLocating ? 'Acquiring GPS...' : activeLocation.address.split(',')[0]}
              </span>
            </button>

            <div className={`flex items-center space-x-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-xl border ${networkBadge.color}`}>
              <NetworkIcon className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="hidden lg:inline">{networkBadge.label}</span>
            </div>
          </div>

          {/* Trilingual Language Selector */}
          <div className="flex border border-slate-800 rounded-xl p-0.5 bg-slate-950 text-[10px] font-mono">
            {(['en', 'te', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l as AppLanguage)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  lang === l ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>

          <Link
            href="/citizen/profile"
            aria-label="View Citizen Profile"
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline text-xs font-mono font-bold text-white max-w-[100px] truncate">{profile.name}</span>
          </Link>
        </div>
      </header>

      {/* Mobile Telemetry Bar */}
      <div className="sm:hidden px-4 py-2 bg-[#060a13] border-b border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <button
          onClick={handleFetchMyLocation}
          className="flex items-center space-x-1.5 truncate max-w-[60%] text-left"
        >
          <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'text-amber-400 animate-spin' : 'text-sky-400'} shrink-0`} />
          <span className="truncate text-slate-200 font-bold">
            {isLocating ? 'Locating...' : activeLocation.address}
          </span>
        </button>

        <button
          onClick={() => setManualModalOpen(true)}
          className="text-[9px] font-bold text-sky-400 underline shrink-0 ml-1"
        >
          Manual Location
        </button>
      </div>

      {/* GPS Feedback Toast Banner */}
      {gpsFeedback && (
        <div className="bg-sky-950/90 border-b border-sky-800 px-4 py-2 text-center text-xs font-mono font-bold text-sky-200 animate-fade-in flex items-center justify-between">
          <span className="truncate">{gpsFeedback}</span>
          {activeLocation.gpsState !== 'GPS AVAILABLE' && (
            <button
              onClick={() => setManualModalOpen(true)}
              className="text-[10px] text-amber-400 underline font-bold ml-2 shrink-0"
            >
              Enter Address
            </button>
          )}
        </div>
      )}

      {/* Manual Location Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#060a13] border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-sky-400 font-bold">
                <MapPin className="w-4 h-4" />
                <span>MANUAL LOCATION ENTRY</span>
              </div>
              <button onClick={() => setManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              If GPS permission is denied or device GPS is unavailable, enter your landmark or street address below. Emergency dispatch will proceed with your manual location.
            </p>

            <form onSubmit={handleSaveManualLocation} className="space-y-3">
              <input
                type="text"
                required
                value={manualAddrInput}
                onChange={(e) => setManualAddrInput(e.target.value)}
                placeholder="e.g. Sector 5, Beach Road, Visakhapatnam..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Emergency Mode Alert Banner */}
      {emergencyModeActive && (
        <div className="bg-red-950/90 border-b border-red-800 px-4 md:px-8 py-2 flex items-center justify-between text-xs font-mono font-bold text-red-200 animate-pulse">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>EMERGENCY MODE ACTIVE — PRIORITIZING DISPATCH UPDATE</span>
          </div>
          <button
            onClick={() => setEmergencyMode(false)}
            className="text-[10px] text-red-400 underline font-bold"
          >
            Exit Mode
          </button>
        </div>
      )}

      {/* Main Page Container */}
      <main className="flex-1 max-w-5xl lg:max-w-6xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {children}
      </main>

      {/* Secondary Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setDrawerOpen(false)} />

          <div className="relative w-4/5 max-w-xs bg-[#060a13] border-r border-slate-900 h-full p-5 flex flex-col justify-between z-10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <BrandLogo size="sm" />
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/60 space-y-1">
                <p className="text-xs font-bold text-white leading-none">{profile.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{profile.phone}</p>
                <p className="text-[9.5px] font-mono text-sky-400 pt-1 border-t border-slate-900/60 mt-1">
                  📍 {activeLocation.address.split(',')[0]}
                </p>
              </div>

              {/* Links */}
              <div className="space-y-1 text-xs font-mono">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">QUICK ASSIST SURFACES</p>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl border transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-950/40 text-blue-400 font-bold'
                          : item.highlight
                          ? 'border-emerald-800/80 bg-emerald-950/30 text-emerald-400 font-bold'
                          : 'border-transparent hover:border-slate-800 text-slate-300 hover:text-white hover:bg-slate-950'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{item.label[lang]}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Helpline Shortcuts */}
            <div className="pt-4 border-t border-slate-900 space-y-2">
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">NATIONAL EMERGENCY LINES</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
                <a href="tel:112" className="p-2 rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 flex items-center justify-center space-x-1 hover:bg-red-950/40">
                  <PhoneCall className="w-3 h-3" />
                  <span>112 POLICE</span>
                </a>
                <a href="tel:108" className="p-2 rounded-lg border border-sky-900/40 bg-sky-950/20 text-sky-400 flex items-center justify-center space-x-1 hover:bg-sky-950/40">
                  <LifeBuoy className="w-3 h-3" />
                  <span>108 AMBULANCE</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (EXACTLY 5 ITEMS: Home, Report, SOS, Alerts, My Incidents) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-900 bg-[#030712]/95 backdrop-blur-xl max-w-lg mx-auto w-full flex justify-around py-2 px-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all relative ${
                item.isSos
                  ? 'text-red-500 font-extrabold'
                  : isActive
                  ? 'text-blue-400 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.isSos ? (
                <div className="h-9 w-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/50 border border-red-400 -mt-3 animate-pulse">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              )}
              <span className={item.isSos ? 'text-[9px] text-red-400 font-black mt-0.5' : ''}>
                {item.label[lang]}
              </span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
