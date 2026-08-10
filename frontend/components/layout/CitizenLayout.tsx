import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { LogoutIcon } from '../icons'

interface CitizenLayoutProps {
  children: React.ReactNode
}

export default function CitizenLayout({ children }: CitizenLayoutProps) {
  const router = useRouter()
  const logoutStore = useAuthStore((state) => state.logout)
  const profile = useAuthStore((state) => state.profile)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logoutStore()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050816] text-white">
      {/* Top Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-[#111827]/40 px-6 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-extrabold tracking-wider">🇮🇳 BharatOS Citizen Portal</span>
        </div>
        <div className="flex items-center space-x-4">
          {profile && (
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {profile.full_name} (Citizen)
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-[#050816] px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Form workspace */}
      <main className="flex-1 flex justify-center py-10 px-4 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
