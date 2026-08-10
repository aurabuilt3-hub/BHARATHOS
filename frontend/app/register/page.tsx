'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('citizen')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      // 1. Sign up user on Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      const session = data.session
      const user = data.user
      
      if (!user) {
        throw new Error('Supabase Auth registration failed to return user profiles.')
      }

      // If email confirmation is enabled, session might be null.
      // In local prototype mode, Supabase auto-confirms and logs in.
      // If we don't have a session, we ask the user to sign in to initialize.
      let token = session?.access_token

      if (!token) {
        // Fallback: If Supabase requires email verification, we instruct them to log in.
        setSuccessMsg('Supabase account created! Please sign in at the login screen to sync your local profile.')
        setTimeout(() => {
          router.push('/login')
        }, 4000)
        return
      }

      // 2. Synchronize user profile with custom backend database using the Supabase JWT
      const syncResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || null,
          role_name: role,
          city_id: null // Can be updated in future dashboard configurations
        })
      })

      if (!syncResponse.ok) {
        const errDetail = await syncResponse.json()
        throw new Error(errDetail?.detail || 'Syncing custom database profile failed.')
      }

      setSuccessMsg('Account created and localized database profile synchronized! Redirecting to Sign In...')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-[#111827]/80 p-8 shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Create account
          </h2>
          <p className="mt-2 text-center text-sm text-[#94A3B8]">
            Access the BharatOS governance ecosystem
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-md bg-red-950/50 border border-red-800 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-md bg-green-950/50 border border-green-800 p-4 text-sm text-green-400">
            {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
              <input
                type="text"
                required
                className="relative block w-full rounded-lg border border-slate-800 bg-[#050816] px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="Rohan Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
              <input
                type="email"
                required
                className="relative block w-full rounded-lg border border-slate-800 bg-[#050816] px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="rohan@bharatos.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
              <input
                type="text"
                className="relative block w-full rounded-lg border border-slate-800 bg-[#050816] px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Select Role</label>
              <select
                className="relative block w-full rounded-lg border border-slate-800 bg-[#050816] px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer (Field Responder)</option>
                <option value="dept_head">Department Head</option>
                <option value="admin">City Administrator</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                required
                className="relative block w-full rounded-lg border border-slate-800 bg-[#050816] px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#050816] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
