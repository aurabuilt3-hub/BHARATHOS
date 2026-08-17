import { supabase } from '../lib/supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// --- Interfaces for API Response Contracts ---

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

export interface DashboardOverview {
  active_incidents_count: number
  total_incidents_count: number
  active_alerts_count: number
  resources: {
    total: number
    available: number
    allocated: number
  }
  facilities_count: number
  digital_twin_nodes_count: number
  telemetry: {
    total_records: number
    status: string
  }
  weather?: {
    temperature: number
    humidity: number
    precipitation: number
    wind_speed: number
    weather_code: number
    observed_at: string
    freshness: 'FRESH' | 'STALE' | 'EXPIRED' | 'UNKNOWN'
    source_type: string
    source_name: string
    source_url: string
  } | null
  air_quality?: {
    aqi: number
    pm2_5: number
    pm10: number
    nitrogen_dioxide: number
    ozone: number
    observed_at: string
    freshness: 'FRESH' | 'STALE' | 'EXPIRED' | 'UNKNOWN'
    source_type: string
    source_name: string
    source_url: string
  } | null
}

export interface BackendFacility {
  id: string
  name: string
  facility_type: string
  address?: string
  phone?: string
  latitude: number
  longitude: number
  state_id?: string
  district_id?: string
  city_id?: string
  zone_id?: string
  ward_id?: string
  source_type: 'OFFICIAL_PUBLIC' | 'OPEN_DATA' | 'VERIFIED_PUBLIC' | 'SIMULATED'
  source_name?: string
  source_url?: string
  verified_at?: string
  extra_data?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PaginatedFacilityResponse {
  items: BackendFacility[]
  page: number
  limit: number
  total: number
}

export interface BackendResource {
  id: string
  name: string
  type: string
  status: 'available' | 'allocated' | 'deployed' | 'busy'
  latitude: number
  longitude: number
  department_id?: string
  city_id?: string
  created_at: string
  updated_at: string
}

export interface PaginatedResourceResponse {
  items: BackendResource[]
  page: number
  limit: number
  total: number
}

export interface BackendAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  status: 'active' | 'acknowledged' | 'resolved' | 'expired'
  expires_at?: string
  state_id?: string
  district_id?: string
  city_id?: string
  zone_id?: string
  ward_id?: string
  source_type: string
  source_name?: string
  source_url?: string
  created_at: string
  updated_at: string
}

export interface PaginatedAlertResponse {
  items: BackendAlert[]
  page: number
  limit: number
  total: number
}

export interface AlertSummaryResponse {
  total: number
  active: number
  acknowledged: number
  resolved: number
  expired: number
  critical: number
  high: number
  medium: number
  low: number
}

export interface BackendDigitalTwinNode {
  id: string
  state_id?: string
  district_id?: string
  city_id?: string
  zone_id?: string
  ward_id?: string
  name: string
  type: string
  status: string
  latitude: number
  longitude: number
  last_telemetry?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PaginatedNodeResponse {
  items: BackendDigitalTwinNode[]
  page: number
  limit: number
  total: number
}

export interface BackendNodeConnection {
  id: string
  source_node_id: string
  target_node_id: string
  connection_type: string
  status: string
  bandwidth_mbps?: number
  latency_ms?: number
  last_tested?: string
  created_at: string
  updated_at: string
}

export interface PaginatedConnectionResponse {
  items: BackendNodeConnection[]
  page: number
  limit: number
  total: number
}

export interface DigitalTwinSummaryResponse {
  total_nodes: number
  active_nodes: number
  critical_nodes: number
  total_connections: number
  average_latency_ms: number
}

export interface BackendTelemetryRecord {
  id: string
  node_id: string
  metric_type: string
  value: number
  unit?: string
  status: string
  timestamp: string
}

export interface PaginatedTelemetryResponse {
  items: BackendTelemetryRecord[]
  page: number
  limit: number
  total: number
}

export interface BackendCommandCenter {
  id: string
  name: string
  level: string
  city_id?: string
  district_id?: string
  state_id?: string
  latitude: number
  longitude: number
  status: string
  contact_number?: string
  created_at: string
  updated_at: string
}

export interface CommandCenterSummaryResponse {
  command_center_id: string
  active_incidents_count: number
  total_incidents_count: number
  resources: {
    total: number
    available: number
    allocated: number
    deployed: number
    busy: number
  }
  active_allocations_count: number
}

export interface IngestionStatusResponse {
  last_run?: string
  status?: string
  duration_ms?: number
  sources?: Record<string, any>
}

export interface AIChatResponse {
  answer: string
  intent?: string
  confidence?: number
  sources?: string[]
  data?: Record<string, any>
  recommendations?: string[]
  warnings?: string[]
}

// --- Helper for Authorized Headers with Supabase JWT ---

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

// --- Reusable Fetch Wrapper with Unified Error Handling ---

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeader()
  const mergedOptions = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  }

  const response = await fetch(url, mergedOptions)
  
  if (!response.ok) {
    let errorDetail = ''
    try {
      const errorJson = await response.json()
      errorDetail = errorJson.detail || errorJson.message || ''
    } catch {
      // ignore JSON parse failures for errors
    }

    if (response.status === 401) {
      // Clear local session on auth failure
      supabase.auth.signOut()
      throw new Error(errorDetail || 'Session expired. Please sign in again.')
    }
    if (response.status === 403) {
      throw new Error(errorDetail || 'You do not have access to this geographic region or operations role.')
    }
    if (response.status === 404) {
      throw new Error(errorDetail || 'Requested record or endpoint was not found.')
    }
    if (response.status === 409) {
      throw new Error(errorDetail || 'A database conflict error occurred.')
    }
    throw new Error(errorDetail || `HTTP Error ${response.status}: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

// --- API Service Object ---

export const apiService = {
  // 1. Fetch List of Incidents
  async getIncidents(filters?: { category?: string; severity?: string; status?: string; page?: number; limit?: number }): Promise<BackendIncident[]> {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category)
      if (filters?.severity && filters.severity !== 'all') queryParams.append('severity', filters.severity)
      if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status)
      if (filters?.page) queryParams.append('page', String(filters.page))
      if (filters?.limit) queryParams.append('limit', String(filters.limit))

      // The backend returns PaginatedIncidentResponse or list depending on query structure
      // To preserve compatibility with components expecting lists, we parse list or return items property
      const res = await apiFetch<any>(`${API_BASE_URL}/incidents?${queryParams.toString()}`)
      if (res && Array.isArray(res)) {
        return res
      }
      if (res && res.items && Array.isArray(res.items)) {
        return res.items
      }
      return []
    } catch (err) {
      console.warn('Backend API connection failed. Using fallback mock incidents.', err)
      throw err
    }
  },

  // 2. Fetch Single Incident by ID
  async getIncidentById(id: string): Promise<BackendIncident> {
    return apiFetch<BackendIncident>(`${API_BASE_URL}/incidents/${id}`)
  },

  // 3. Create Incident
  async createIncident(payload: CreateIncidentPayload): Promise<BackendIncident> {
    return apiFetch<BackendIncident>(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  // 4. Update Incident Status
  async updateIncidentStatus(id: string, status: string, notes?: string): Promise<BackendIncident> {
    return apiFetch<BackendIncident>(`${API_BASE_URL}/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    })
  },

  // 5. Assign Incident
  async assignIncident(id: string, departmentId: string, notes?: string): Promise<any> {
    return apiFetch<any>(`${API_BASE_URL}/incidents/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ department_id: departmentId, notes })
    })
  },

  // 6. Query Multi-Agent AI Triage
  async getAITriage(incidentDescription: string): Promise<any> {
    try {
      return await apiFetch<any>(`${API_BASE_URL}/ai/triage`, {
        method: 'POST',
        body: JSON.stringify({ incident_description: incidentDescription })
      })
    } catch (err) {
      console.warn('AI Triage API offline. Using built-in agent fallback.', err)
      return null
    }
  },

  // 7. GET Dashboard Overview
  async getDashboardOverview(): Promise<DashboardOverview> {
    return apiFetch<DashboardOverview>(`${API_BASE_URL}/dashboard/overview`)
  },

  // 8. GET Facilities
  async getFacilities(filters?: { state_id?: string; district_id?: string; city_id?: string; facility_type?: string; source_type?: string; page?: number; limit?: number }): Promise<PaginatedFacilityResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.state_id) queryParams.append('state_id', filters.state_id)
    if (filters?.district_id) queryParams.append('district_id', filters.district_id)
    if (filters?.city_id) queryParams.append('city_id', filters.city_id)
    if (filters?.facility_type && filters.facility_type !== 'all') queryParams.append('facility_type', filters.facility_type)
    if (filters?.source_type && filters.source_type !== 'all') queryParams.append('source_type', filters.source_type)
    if (filters?.page) queryParams.append('page', String(filters.page))
    if (filters?.limit) queryParams.append('limit', String(filters.limit))

    return apiFetch<PaginatedFacilityResponse>(`${API_BASE_URL}/facilities/?${queryParams.toString()}`)
  },

  // 9. GET Resources
  async getResources(filters?: { city_id?: string; status?: string; type?: string; page?: number; limit?: number }): Promise<PaginatedResourceResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.city_id) queryParams.append('city_id', filters.city_id)
    if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status)
    if (filters?.type && filters.type !== 'all') queryParams.append('type', filters.type)
    if (filters?.page) queryParams.append('page', String(filters.page))
    if (filters?.limit) queryParams.append('limit', String(filters.limit))

    return apiFetch<PaginatedResourceResponse>(`${API_BASE_URL}/resources/?${queryParams.toString()}`)
  },

  // 10. GET Alerts & Alerts Summary
  async getAlerts(filters?: { severity?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedAlertResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.severity && filters.severity !== 'all') queryParams.append('severity', filters.severity)
    if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status)
    if (filters?.page) queryParams.append('page', String(filters.page))
    if (filters?.limit) queryParams.append('limit', String(filters.limit))

    return apiFetch<PaginatedAlertResponse>(`${API_BASE_URL}/alerts/?${queryParams.toString()}`)
  },

  async getAlertsSummary(): Promise<AlertSummaryResponse> {
    return apiFetch<AlertSummaryResponse>(`${API_BASE_URL}/alerts/summary`)
  },

  async getAlertById(id: string): Promise<BackendAlert> {
    return apiFetch<BackendAlert>(`${API_BASE_URL}/alerts/${id}`)
  },

  // 11. GET Digital Twin Data
  async getDigitalTwinNodes(filters?: { page?: number; limit?: number; type?: string }): Promise<PaginatedNodeResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.page) queryParams.append('page', String(filters.page))
    if (filters?.limit) queryParams.append('limit', String(filters.limit))
    if (filters?.type && filters.type !== 'all') queryParams.append('type', filters.type)

    return apiFetch<PaginatedNodeResponse>(`${API_BASE_URL}/digital-twin/nodes?${queryParams.toString()}`)
  },

  async getDigitalTwinConnections(filters?: { page?: number; limit?: number }): Promise<PaginatedConnectionResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.page) queryParams.append('page', String(filters.page))
    if (filters?.limit) queryParams.append('limit', String(filters.limit))

    return apiFetch<PaginatedConnectionResponse>(`${API_BASE_URL}/digital-twin/connections?${queryParams.toString()}`)
  },

  async getDigitalTwinSummary(): Promise<DigitalTwinSummaryResponse> {
    return apiFetch<DigitalTwinSummaryResponse>(`${API_BASE_URL}/digital-twin/summary`)
  },

  async getDigitalTwinTelemetry(nodeId: string, filters?: { limit?: number }): Promise<PaginatedTelemetryResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.limit) queryParams.append('limit', String(filters.limit))

    return apiFetch<PaginatedTelemetryResponse>(`${API_BASE_URL}/digital-twin/nodes/${nodeId}/telemetry?${queryParams.toString()}`)
  },

  // 12. GET Command Centers
  async getCommandCenters(): Promise<BackendCommandCenter[]> {
    return apiFetch<BackendCommandCenter[]>(`${API_BASE_URL}/command-centers/`)
  },

  async getCommandCenter(id: string): Promise<BackendCommandCenter> {
    return apiFetch<BackendCommandCenter>(`${API_BASE_URL}/command-centers/${id}`)
  },

  async getCommandCenterSummary(id: string): Promise<CommandCenterSummaryResponse> {
    return apiFetch<CommandCenterSummaryResponse>(`${API_BASE_URL}/command-centers/${id}/summary`)
  },

  // 13. POST AI Chat Agent
  async postAIChat(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<AIChatResponse> {
    // Backend expects { "message": "...", "history": [ ... ] }
    return apiFetch<AIChatResponse>(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history })
    })
  },

  // 14. GET Ingestion status & POST Ingestion trigger
  async getIngestionStatus(): Promise<IngestionStatusResponse> {
    return apiFetch<IngestionStatusResponse>(`${API_BASE_URL}/admin/data-ingestion/status`)
  },

  async triggerIngestionSync(): Promise<IngestionStatusResponse> {
    return apiFetch<IngestionStatusResponse>(`${API_BASE_URL}/admin/data-ingestion/sync`, {
      method: 'POST'
    })
  },

  async getDepartments(): Promise<any[]> {
    return apiFetch<any[]>(`${API_BASE_URL}/departments`)
  },

  // 15. Resource Allocation & Release
  async allocateIncidentResource(incidentId: string, resourceId: string): Promise<any> {
    return apiFetch<any>(`${API_BASE_URL}/incidents/${incidentId}/resources`, {
      method: 'POST',
      body: JSON.stringify({
        incident_id: incidentId,
        resource_id: resourceId
      })
    })
  },

  async getIncidentResources(incidentId: string): Promise<BackendResource[]> {
    return apiFetch<BackendResource[]>(`${API_BASE_URL}/incidents/${incidentId}/resources`)
  },

  async releaseIncidentResource(incidentId: string, resourceId: string): Promise<any> {
    return apiFetch<any>(`${API_BASE_URL}/incidents/${incidentId}/resources/${resourceId}/release`, {
      method: 'PATCH'
    })
  },

  // 16. Alert lifecycle
  async acknowledgeAlert(alertId: string): Promise<BackendAlert> {
    return apiFetch<BackendAlert>(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'PATCH'
    })
  },

  async resolveAlert(alertId: string): Promise<BackendAlert> {
    return apiFetch<BackendAlert>(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: 'PATCH'
    })
  },

  // 17. Telemetry alias
  async getTelemetry(nodeId: string, limit: number = 100): Promise<any> {
    return this.getDigitalTwinTelemetry(nodeId, { limit })
  }
}
