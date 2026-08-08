import { supabase } from '../lib/supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface BackendIncident {
  id: string
  ticket_number: string
  citizen_id?: string
  category: string
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  images?: any[]
  assignments?: any[]
}

export interface CreateIncidentPayload {
  category: string
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  severity?: string
}

async function getAuthHeader(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

export const apiService = {
  // 1. Fetch List of Incidents from Backend API
  async getIncidents(filters?: { category?: string; severity?: string; status?: string }): Promise<BackendIncident[]> {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category)
      if (filters?.severity && filters.severity !== 'all') queryParams.append('severity', filters.severity)
      if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status)

      const url = `${API_BASE_URL}/incidents?${queryParams.toString()}`
      const headers = await getAuthHeader()

      const res = await fetch(url, { method: 'GET', headers })
      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }
      return await res.json()
    } catch (err) {
      console.warn('Backend API connection failed. Using fallback mock incidents.', err)
      return []
    }
  },

  // 2. Create Incident on Backend API
  async createIncident(payload: CreateIncidentPayload): Promise<BackendIncident> {
    const url = `${API_BASE_URL}/incidents`
    const headers = await getAuthHeader()

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to report incident.')
    }
    return await res.json()
  },

  // 3. Update Incident Status on Backend API
  async updateIncidentStatus(id: string, status: string, notes?: string): Promise<BackendIncident> {
    const url = `${API_BASE_URL}/incidents/${id}/status`
    const headers = await getAuthHeader()

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, notes })
    })

    if (!res.ok) {
      throw new Error(`Failed to update status: ${res.statusText}`)
    }
    return await res.json()
  },

  // 4. Assign Incident to Department
  async assignIncident(id: string, departmentId: string, notes?: string): Promise<any> {
    const url = `${API_BASE_URL}/incidents/${id}/assign`
    const headers = await getAuthHeader()

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ department_id: departmentId, notes })
    })

    if (!res.ok) {
      throw new Error(`Failed to assign incident: ${res.statusText}`)
    }
    return await res.json()
  },

  // 5. Query Multi-Agent AI Triage Pipeline
  async getAITriage(incidentDescription: string): Promise<any> {
    try {
      const url = `${API_BASE_URL}/ai/triage`
      const headers = await getAuthHeader()
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ incident_description: incidentDescription })
      })
      if (!res.ok) throw new Error('AI Triage request failed')
      return await res.json()
    } catch (err) {
      console.warn('AI Triage API offline. Using built-in agent fallback.', err)
      return null
    }
  }
}
