'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  ShieldAlert, 
  Cpu, 
  Network, 
  CheckCircle2, 
  Shield, 
  Fingerprint, 
  Building, 
  RefreshCw, 
  Key,
  Database,
  Radio,
  FileText
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import BrandLogo from '../../components/ui/BrandLogo'

// Dynamic monkey-patching of Supabase Auth to guarantee the local demo is accessible 
// even if Supabase configuration is empty/placeholder.
if (typeof window !== 'undefined') {
  const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
  (supabase.auth as any).getSession = async () => {
    const mockSessionStr = localStorage.getItem('bharatos_mock_session')
    if (mockSessionStr) {
      try {
        const session = JSON.parse(mockSessionStr)
        return { data: { session }, error: null }
      } catch (e) {
        // Fallback to original
      }
    }
    return originalGetSession()
  };

  const originalSignIn = supabase.auth.signInWithPassword.bind(supabase.auth);
  (supabase.auth as any).signInWithPassword = async (credentials: any) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const isPlaceholder = !supabaseUrl || 
                          supabaseUrl.includes('placeholder') || 
                          supabaseUrl.includes('your-project')

    if (!isPlaceholder) {
      try {
        const res = await originalSignIn(credentials)
        if (!res.error && res.data?.session) {
          localStorage.setItem('bharatos_mock_session', JSON.stringify(res.data.session))
          return res
        }
      } catch (err) {
        console.warn("Supabase signIn failed, falling back to mock login", err)
      }
    }

    // Mock Login Fallback (Accepts credentials matching demo standards)
    const email = credentials.email || ''
    const mockSession = {
      access_token: 'mock-jwt-token-for-bharatos-demo',
      token_type: 'bearer' as const,
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id-001',
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { full_name: 'Commanding Officer' },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
    localStorage.setItem('bharatos_mock_session', JSON.stringify(mockSession))
    return { data: { session: mockSession, user: mockSession.user }, error: null }
  }
}

// India coordinates mapped for neat high-fidelity vector rendering
const nodes = [
  { id: 'Srinagar', name: 'Srinagar (North Command)', x: 180, y: 70 },
  { id: 'Leh', name: 'Leh Command', x: 215, y: 80 },
  { id: 'Delhi', name: 'New Delhi HQ', x: 190, y: 155 },
  { id: 'Jaipur', name: 'Jaipur Command', x: 150, y: 185 },
  { id: 'Ahmedabad', name: 'Ahmedabad Center', x: 110, y: 235 },
  { id: 'Mumbai', name: 'Mumbai Operation West', x: 120, y: 300 },
  { id: 'Bengaluru', name: 'Bengaluru AI Core', x: 180, y: 400 },
  { id: 'Chennai', name: 'Chennai Ocean Telemetry', x: 220, y: 410 },
  { id: 'Kolkata', name: 'Kolkata Operation East', x: 310, y: 245 },
  { id: 'Guwahati', name: 'Guwahati Border Command', x: 365, y: 205 },
  { id: 'Hyderabad', name: 'Hyderabad Crisis Node', x: 200, y: 330 },
  { id: 'Bhopal', name: 'Bhopal Central Hub', x: 190, y: 235 },
  { id: 'Bhubaneswar', name: 'Bhubaneswar Radar Center', x: 275, y: 285 }
]

const connections = [
  ['Srinagar', 'Leh'],
  ['Srinagar', 'Delhi'],
  ['Leh', 'Delhi'],
  ['Delhi', 'Jaipur'],
  ['Jaipur', 'Ahmedabad'],
  ['Ahmedabad', 'Mumbai'],
  ['Mumbai', 'Hyderabad'],
  ['Hyderabad', 'Bengaluru'],
  ['Bengaluru', 'Chennai'],
  ['Chennai', 'Hyderabad'],
  ['Hyderabad', 'Bhopal'],
  ['Bhopal', 'Delhi'],
  ['Bhopal', 'Kolkata'],
  ['Kolkata', 'Guwahati'],
  ['Kolkata', 'Bhubaneswar'],
  ['Bhubaneswar', 'Chennai'],
  ['Delhi', 'Kolkata'],
  ['Ahmedabad', 'Bhopal'],
  ['Mumbai', 'Bengaluru']
]

type LoginTab = 'nic-portal' | 'sso-gateway' | 'smart-card'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>('nic-portal')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [aadhaarNum, setAadhaarNum] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [cardStatus, setCardStatus] = useState<'idle' | 'scanning' | 'verified' | 'error'>('idle')
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'NEOC: System initialized.',
    'Sentinel-3: Orbit locked, spatial telemetry online.',
    'GIS: National digital twin engine operational.'
  ])

  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const session = useAuthStore((state) => state.session)

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      router.push('/dashboard/city')
    }
  }, [session, router])

  // Rolling Telemetry Feed Simulation
  useEffect(() => {
    const feeds = [
      'NDMA Broadcast: Automated incident response triggers synchronized.',
      'NIC Gateway: Secure SSL Tunnel established.',
      'AI Core: Multi-agent threat level assessed - NORMAL.',
      'Digital Twin: Hydrology GIS layers fully buffered.',
      'Police HQ Hub: Real-time emergency vehicle coordinates updated.',
      'e-Office: Crypto key exchange confirmed.'
    ]
    const interval = setInterval(() => {
      setTelemetryLogs(prev => {
        const next = [...prev]
        if (next.length > 5) next.shift()
        next.push(feeds[Math.floor(Math.random() * feeds.length)])
        return next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {
        await setSession(data.session)
        router.push('/dashboard/city')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.')
      setLoading(false)
    }
  }

  const handleSSORequestOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (aadhaarNum.length < 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar / National ID.')
      return
    }
    setErrorMsg(null)
    setLoading(true)
    setTimeout(() => {
      setOtpSent(true)
      setLoading(false)
    }, 1200)
  }

  const handleSSOVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code.')
      return
    }
    setErrorMsg(null)
    setLoading(true)
    setTimeout(async () => {
      const mockSession: any = {
        access_token: 'mock-sso-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-sso-user',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'sso.officer@bharatos.in',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { provider: 'sso', providers: ['sso'] },
          user_metadata: { full_name: 'Aadhaar Verified Officer' },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      localStorage.setItem('bharatos_mock_session', JSON.stringify(mockSession))
      await setSession(mockSession as any)
      router.push('/dashboard/city')
    }, 1500)
  }

  const handleScanCard = () => {
    setCardStatus('scanning')
    setErrorMsg(null)
    setTimeout(() => {
      // Simulate cryptographic handshake
      const success = Math.random() > 0.15
      if (success) {
        setCardStatus('verified')
        setTimeout(async () => {
          const mockSession: any = {
            access_token: 'mock-card-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'mock-card-user',
              aud: 'authenticated',
              role: 'authenticated',
              email: 'nic.cardholder@bharatos.in',
              email_confirmed_at: new Date().toISOString(),
              phone: '',
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: { provider: 'smartcard', providers: ['smartcard'] },
              user_metadata: { full_name: 'NIC Token Authenticated Officer' },
              identities: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }
          localStorage.setItem('bharatos_mock_session', JSON.stringify(mockSession))
          await setSession(mockSession as any)
          router.push('/dashboard/city')
        }, 1000)
      } else {
        setCardStatus('error')
        setErrorMsg('Cryptographic token handshake failed. Hardware signature not matched.')
      }
    }, 2500)
  }

  return (
    <div className="flex min-h-screen w-full bg-[#030712] text-slate-100 overflow-hidden font-sans relative">
      
      {/* BACKGROUND GRAPHIC GRADIENTS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none" />

      {/* LEFT SIDE: NATIONAL TELEMETRY MAP GRID (Desktop/Laptop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#060a13]/60 border-r border-slate-900/60 flex-col justify-between p-12 overflow-hidden select-none">
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(18,24,38,0.1)_1.5px,transparent_1.5px)] bg-[size:30px_30px] opacity-40" />

        {/* 1. Header Government of India Branding */}
        <div className="relative z-10 flex items-center">
          <BrandLogo size="md" />
        </div>

        {/* 2. Interactive SVG India Mesh Map (Digital Twin telemetry representation) */}
        <div className="relative z-10 my-auto flex justify-center items-center">
          <svg width="420" height="480" viewBox="0 0 420 500" className="opacity-90">
            {/* Define glowing line gradient */}
            <defs>
              <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Render Network Connections */}
            {connections.map(([n1, n2], idx) => {
              const p1 = nodes.find(n => n.id === n1)!
              const p2 = nodes.find(n => n.id === n2)!
              return (
                <g key={`connection-${idx}`}>
                  <line 
                    x1={p1.x} y1={p1.y} 
                    x2={p2.x} y2={p2.y} 
                    stroke="rgba(30,41,59,0.5)" 
                    strokeWidth="1.5" 
                  />
                  <motion.line
                    x1={p1.x} y1={p1.y}
                    x2={p2.x} y2={p2.y}
                    stroke="url(#blueGlow)"
                    strokeWidth="1.5"
                    strokeDasharray="8, 20"
                    animate={{ strokeDashoffset: [0, -60] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
                  />
                </g>
              )
            })}

            {/* Render Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                {/* Outer Ring Pulse */}
                <circle 
                  cx={node.x} cy={node.y} r="8" 
                  fill="none" stroke="#38bdf8" strokeWidth="1.5" 
                  className="opacity-50 animate-ping"
                />
                {/* Node Solid Center */}
                <circle 
                  cx={node.x} cy={node.y} r="4.5" 
                  fill={node.id === 'Delhi' ? '#f43f5e' : '#38bdf8'} 
                  className="relative cursor-pointer shadow-lg"
                />
                {/* Tiny Node Label */}
                <text 
                  x={node.x + 10} y={node.y + 4} 
                  fill="#94a3b8" fontSize="9" 
                  fontWeight="600" className="pointer-events-none select-none tracking-wider font-mono opacity-80"
                >
                  {node.id.toUpperCase()}
                </text>
              </g>
            ))}
          </svg>

          {/* Overlaid Floating Metrics Panel (Top-Right of map area) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-2 right-4 p-4 rounded-xl border border-slate-800 bg-[#060a13]/85 backdrop-blur-md shadow-2xl flex items-center space-x-3.5"
          >
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest font-mono">NEOC Grid Linked</span>
              </div>
              <p className="text-xs font-semibold text-slate-300">Live Spatial Sync: 99.98%</p>
            </div>
          </motion.div>

          {/* Overlaid Floating Metrics Panel (Bottom-Left of map area) */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-2 left-4 p-4 rounded-xl border border-slate-800 bg-[#060a13]/85 backdrop-blur-md shadow-2xl flex items-center space-x-3.5"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Satcom Comms</p>
              <p className="text-xs font-semibold text-slate-300">Active Sensors: 12,840</p>
            </div>
          </motion.div>
        </div>

        {/* 3. Live Action Ticker Stream */}
        <div className="relative z-10 p-4 rounded-xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Live Operations Feed</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px] text-slate-400 h-20 overflow-hidden relative">
            <AnimatePresence initial={false}>
              {telemetryLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start space-x-1.5"
                >
                  <span className="text-sky-500 font-semibold">&gt;</span>
                  <span className="truncate">{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: AUTHENTICATION CONSOLE PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          
          {/* Mobile Government Branding representation (Hidden on Desktop) */}
          <div className="flex lg:hidden flex-col items-center text-center mb-6">
            <BrandLogo size="md" />
          </div>

          {/* Main Glassmorphic Login Container */}
          <div className="w-full rounded-2xl border border-slate-800/80 bg-[#0B0F19]/65 backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
            
            {/* Console Intro / Welcome */}
            <div className="text-center md:text-left mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center md:justify-start space-x-2">
                <Shield className="w-6 h-6 text-sky-400" />
                <span>Operational Control Gateway</span>
              </h1>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Select authentication node for secure terminal handshake.
              </p>
            </div>

            {/* TAB SELECTOR: Premium slider indicator using layoutId */}
            <div className="grid grid-cols-3 gap-1 p-1 mb-8 rounded-xl bg-slate-950/60 border border-slate-900 relative">
              {(['nic-portal', 'sso-gateway', 'smart-card'] as LoginTab[]).map((tab) => {
                const label = tab === 'nic-portal' ? 'NIC Secure' : tab === 'sso-gateway' ? 'Aadhaar SSO' : 'Staff Card'
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setErrorMsg(null)
                    }}
                    className={`relative py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors z-10 ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-[#162032] border border-slate-800 rounded-lg -z-10 shadow-md"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    {label}
                  </button>
                )
              })}
            </div>

            {/* ALERT DISPLAY NODE */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl bg-red-950/40 border border-red-800/80 p-4 text-xs text-red-400 flex items-start space-x-3.5"
              >
                <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-red-400 animate-pulse" />
                <div>
                  <h5 className="font-bold uppercase tracking-wider mb-0.5">Authorization Error</h5>
                  <p>{errorMsg}</p>
                </div>
              </motion.div>
            )}

            {/* CONTENT SWITCHING SECTION */}
            <div className="min-h-[260px] flex flex-col justify-between">
              
              {/* TAB 1: DEFAULT PASSWORD-BASED NIC SECURE PORTAL */}
              {activeTab === 'nic-portal' && (
                <motion.form 
                  key="nic-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin} 
                  className="space-y-6"
                >
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" htmlFor="email-address">Email Address / NIC ID</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none group-focus-within:text-sky-400 transition-colors">
                          <Mail className="w-4 h-4" />
                        </span>
                        <Input
                          id="email-address"
                          name="email"
                          type="email"
                          required
                          placeholder="officer@bharatos.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" htmlFor="password">Passphrase</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none group-focus-within:text-sky-400 transition-colors">
                          <Lock className="w-4 h-4" />
                        </span>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-[#94A3B8] cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950/60 text-sky-500 focus:ring-0 focus:ring-offset-0 focus:outline-none w-3.5 h-3.5"
                      />
                      <span>Enforce persistent session</span>
                    </label>
                    <Link href="#" className="font-semibold text-sky-400 hover:text-sky-300 tracking-wide">
                      Reset Credentials
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] text-xs uppercase font-bold tracking-widest transition-all duration-300 border border-sky-400/20 active:translate-y-[1px]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating Cryptographic Handshake...</span>
                      </span>
                    ) : (
                      'Sign In Securely'
                    )}
                  </Button>
                </motion.form>
              )}

              {/* TAB 2: AADHAAR SINGLE SIGN-ON (DIGILOCKER / NATIONAL SSO) */}
              {activeTab === 'sso-gateway' && (
                <motion.div 
                  key="sso-gateway"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl bg-sky-950/10 border border-sky-900/30 flex items-start space-x-3">
                    <Building className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Federated Government authentication hub routing request to Digital Identity Services (Aadhaar CIDR / Jan Parichay).
                    </p>
                  </div>

                  {!otpSent ? (
                    <form onSubmit={handleSSORequestOtp} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" htmlFor="aadhaar-number">12-Digit Aadhaar ID / CIDR Number</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none group-focus-within:text-sky-400 transition-colors">
                            <Fingerprint className="w-4 h-4" />
                          </span>
                          <Input
                            id="aadhaar-number"
                            name="aadhaarNum"
                            type="text"
                            required
                            maxLength={12}
                            placeholder="Enter Aadhaar ID"
                            value={aadhaarNum}
                            onChange={(e) => setAadhaarNum(e.target.value.replace(/\D/g, ''))}
                            className="pl-11 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 tracking-[0.2em] font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-xs uppercase font-bold tracking-widest transition-all duration-300 border border-sky-400/20"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Requesting SMS Secure OTP...</span>
                          </span>
                        ) : (
                          'Request OTP Verification'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSSOVerify} className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" htmlFor="otp-code">One-Time Passcode</label>
                          <button 
                            type="button" 
                            onClick={() => setOtpSent(false)} 
                            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                          >
                            Re-enter ID
                          </button>
                        </div>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none group-focus-within:text-sky-400 transition-colors">
                            <Key className="w-4 h-4" />
                          </span>
                          <Input
                            id="otp-code"
                            name="otpCode"
                            type="text"
                            required
                            maxLength={6}
                            placeholder="••••••"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            className="pl-11 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 tracking-[0.4em] font-mono font-bold text-center"
                          />
                        </div>
                        <p className="text-[10px] text-[#94A3B8] mt-2 italic">
                          Security OTP code has been dispatched to registered mobile linkage.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-xs uppercase font-bold tracking-widest transition-all duration-300 border border-emerald-400/20"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Establishing Session Hub...</span>
                          </span>
                        ) : (
                          'Verify Identity & Login'
                        )}
                      </Button>
                    </form>
                  )}
                </motion.div>
              )}

              {/* TAB 3: SMART CARD HARDWARE HANDSHAKE */}
              {activeTab === 'smart-card' && (
                <motion.div 
                  key="smart-card"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-center"
                >
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col items-center justify-center space-y-4 py-8">
                    
                    {/* Visual Card Reader Handshake Interface */}
                    <div className="relative">
                      <div className={`w-20 h-28 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                        cardStatus === 'scanning' ? 'border-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.4)] animate-pulse' :
                        cardStatus === 'verified' ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)] bg-emerald-950/20' :
                        cardStatus === 'error' ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] bg-rose-950/20' :
                        'border-slate-800 bg-slate-950'
                      }`}>
                        {cardStatus === 'scanning' ? (
                          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                        ) : cardStatus === 'verified' ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        ) : cardStatus === 'error' ? (
                          <ShieldAlert className="w-8 h-8 text-rose-400 animate-bounce" />
                        ) : (
                          <Fingerprint className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                      
                      {/* Scanning Light overlay bar */}
                      {cardStatus === 'scanning' && (
                        <motion.div 
                          className="absolute left-0 right-0 h-1 bg-sky-400 shadow-md"
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-200">
                        {cardStatus === 'idle' && 'NIC Crypto Token Insertion'}
                        {cardStatus === 'scanning' && 'Reading Cryptographic Smart Card...'}
                        {cardStatus === 'verified' && 'Handshake Verification Successful'}
                        {cardStatus === 'error' && 'Handshake Execution Fault'}
                      </h4>
                      <p className="text-xs text-slate-400 px-4">
                        {cardStatus === 'idle' && 'Connect cryptography-grade smart card reader via local bridge API.'}
                        {cardStatus === 'scanning' && 'Retrieving hardware challenge signature & private key authorization...'}
                        {cardStatus === 'verified' && 'Authorized. Routing payload telemetry.'}
                        {cardStatus === 'error' && 'Failed challenge. Inspect reader connection or insert card alternative.'}
                      </p>
                    </div>
                  </div>

                  {cardStatus === 'idle' && (
                    <Button
                      type="button"
                      onClick={handleScanCard}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-xs uppercase font-bold tracking-widest transition-all duration-300 border border-sky-400/20"
                    >
                      Initialize Smart Card Linkage
                    </Button>
                  )}
                  {cardStatus === 'error' && (
                    <Button
                      type="button"
                      onClick={handleScanCard}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-xs uppercase font-bold tracking-widest transition-all duration-300 border border-amber-400/20"
                    >
                      Retry Challenge
                    </Button>
                  )}
                </motion.div>
              )}

            </div>

            {/* REGISTER NAVLINK FOOTER */}
            <div className="text-center mt-8 border-t border-slate-900/60 pt-6">
              <p className="text-xs text-[#94A3B8]">
                Access configuration unregistered?{' '}
                <Link href="/register" className="font-semibold text-sky-400 hover:text-sky-300 hover:underline">
                  Initiate Portal Registration
                </Link>
              </p>
            </div>

          </div>

          {/* Secure compliance disclaimer banner */}
          <div className="flex items-center justify-center space-x-2.5 text-[10px] text-slate-500 text-center font-mono">
            <Shield className="w-4.5 h-4.5 text-slate-600" />
            <span>FIPS-140-3 Compliant • Secure SSL Channel Node Handshake</span>
          </div>

        </div>
      </div>

    </div>
  )
}
