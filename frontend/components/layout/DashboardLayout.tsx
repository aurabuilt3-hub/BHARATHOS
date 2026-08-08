'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../navigation/Sidebar'
import Header from '../navigation/Header'
import RightAIPanel from '../navigation/RightAIPanel'
import StatusBar from '../navigation/StatusBar'
import { useShellStore } from '../../store/useShellStore'
import { ChevronRight, Home, MapPin, Minimize2, Terminal } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: string
}

export default function DashboardLayout({
  children,
  userRole = 'officer'
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const presentationMode = useShellStore((state) => state.presentationMode)
  const setPresentationMode = useShellStore((state) => state.setPresentationMode)

  // Dynamically generate high-fidelity Breadcrumbs based on the router path
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((path, idx) => {
      const label = path
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
      const href = '/' + paths.slice(0, idx + 1).join('/')
      const isLast = idx === paths.length - 1

      return { label, href, isLast }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 font-sans relative">
      
      {/* 1. Left Sidebar Navigation Panel (Collapsed if Presentation Mode is active) */}
      <AnimatePresence>
        {!presentationMode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex h-full shrink-0"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Area Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header navbar (Hidden if Presentation Mode is active) */}
        <AnimatePresence>
          {!presentationMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full shrink-0"
            >
              <Header />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic inner split area */}
        <div className="flex-1 flex min-h-0 min-w-0 relative">
          
          {/* Scrollable Main Workspace Content */}
          <main className="flex-1 overflow-y-auto px-6 py-5 min-w-0 bg-[#030712] flex flex-col justify-between">
            
            {/* Main Content Workspace wrapper */}
            <div className="space-y-4 flex-1">
              
              {/* Sleek Reusable Breadcrumbs & System Mode Indicator */}
              {!presentationMode && (
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-2 text-xs">
                  
                  {/* Breadcrumb Path list */}
                  <nav className="flex items-center space-x-1.5 font-medium text-slate-400">
                    <Link 
                      href="/dashboard/city" 
                      className="hover:text-slate-200 transition-colors flex items-center space-x-1"
                    >
                      <Home className="w-3.5 h-3.5" />
                    </Link>
                    {breadcrumbs.map((bc, idx) => (
                      <React.Fragment key={bc.href}>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        {bc.isLast ? (
                          <span className="font-bold text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.2)]">
                            {bc.label}
                          </span>
                        ) : (
                          <Link href={bc.href} className="hover:text-slate-200 transition-colors">
                            {bc.label}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>

                  {/* Operational Terminal ID indicator */}
                  <div className="flex items-center space-x-3.5 text-[9px] font-mono font-bold text-slate-500">
                    <span className="flex items-center space-x-1 bg-slate-950/60 border border-slate-900 rounded px-1.5 py-0.5">
                      <Terminal className="w-3 h-3 text-sky-500" />
                      <span>TERMINAL NODE: VZG-NEOC-L4</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>SECURE PIPELINE LINKED</span>
                    </span>
                  </div>

                </div>
              )}

              {/* Page Children layout rendering */}
              <div className="w-full h-full relative">
                {children}
              </div>

            </div>

          </main>

          {/* 3. Right AI Advisor Alerts panel (Hidden if Presentation Mode is active) */}
          <AnimatePresence>
            {!presentationMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-full shrink-0"
              >
                <RightAIPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Persistent Bottom Status Bar (Hidden if Presentation Mode is active) */}
        <AnimatePresence>
          {!presentationMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full shrink-0"
            >
              <StatusBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Exit Button during Presentation Mode */}
      {presentationMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setPresentationMode(false)}
          className="fixed bottom-6 right-6 z-[9999] flex items-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest shadow-2xl transition-all border border-purple-400/25 cursor-pointer hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Presentation Mode</span>
        </motion.button>
      )}

    </div>
  )
}
