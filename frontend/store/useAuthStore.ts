import { create } from 'zustand'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'

export interface LocalUserProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role_name: string
  city_id: string | null
  status: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: SupabaseUser | null
  profile: LocalUserProfile | null
  session: Session | null
  token: string | null
  loading: boolean
  error: string | null
  setSession: (session: Session | null) => Promise<void>
  fetchProfile: (token: string) => Promise<void>
  logout: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  token: null,
  loading: false,
  error: null,

  setSession: async (session: Session | null) => {
    if (!session) {
      set({ session: null, token: null, user: null, profile: null, error: null })
      return
    }

    const token = session.access_token
    set({ session, token, user: session.user, loading: true, error: null })

    try {
      await get().fetchProfile(token)
    } catch (err: any) {
      set({ error: err.message || 'Failed to load user profile from backend database', loading: false })
    }
  },

  fetchProfile: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User profile not synchronized in local database yet.')
        }
        throw new Error('Failed to retrieve profile from backend API.')
      }

      const result = await response.json()
      // If result fits { success: true, data: UserResponse }, or direct UserResponse
      // FastAPI main.py GET /auth/me returns UserResponse directly since we declared response_model=UserResponse
      const profileData: LocalUserProfile = result
      set({ profile: profileData, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Error occurred during profile fetch', loading: false })
      throw err
    }
  },

  logout: () => {
    set({ user: null, profile: null, session: null, token: null, error: null, loading: false })
  }
}))
