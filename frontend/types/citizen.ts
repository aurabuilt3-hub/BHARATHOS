export type EmergencyCategory = 'medical' | 'fire' | 'police' | 'road_accident' | 'disaster' | 'general'
export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStage = 'received' | 'ai_analyzed' | 'priority_assigned' | 'dept_notified' | 'resources_assigned' | 'response_in_progress' | 'resolved'
export type DataFreshness = 'live' | 'last_updated' | 'last_known' | 'offline' | 'unavailable'
export type DataSourceLabel = 'LIVE' | 'CACHED' | 'LAST KNOWN' | 'SIMULATED' | 'AI ASSISTED' | 'OFFICIAL AUTHORITY'
export type GpsLocationState = 'GPS AVAILABLE' | 'GPS UNAVAILABLE' | 'PERMISSION DENIED' | 'LOCATION UNAVAILABLE'

// Separated Network State vs Synchronization State
export type NetworkHealthState = 'ONLINE' | 'DEGRADED' | 'FAILOVER' | 'OFFLINE' | 'RECOVERING'
export type SyncState = 'SYNCED' | 'PENDING' | 'SYNCING' | 'FAILED'

export type AppLanguage = 'en' | 'te' | 'hi'

export type EmergencyRouteType =
  | 'fire'
  | 'flood'
  | 'cyclone'
  | 'earthquake'
  | 'road_accident'
  | 'chemical'
  | 'building'
  | 'general'
  | 'medical'

export type RouteSourceType =
  | 'OFFICIAL EVACUATION ROUTE'
  | 'CALCULATED SAFE ROUTE'
  | 'CACHED ROUTE'
  | 'LAST KNOWN ROUTE'
  | 'ROUTE UNAVAILABLE'

export interface HazardSegment {
  name: string
  type: string
  severity: 'medium' | 'high' | 'critical'
  latitude: number
  longitude: number
}

export interface BlockedRoadSegment {
  roadName: string
  reason: string
}

export interface EmergencyRoute {
  id: string
  origin: LocationInfo
  destination: {
    name: string
    address: string
    latitude: number
    longitude: number
    facilityType?: string
  }
  routeType: EmergencyRouteType
  distanceKm: number
  estimatedMinutes: number | null
  hazards: HazardSegment[]
  blockedSegments: BlockedRoadSegment[]
  sourceType: RouteSourceType
  sourceAuthority?: string
  lastUpdated: string
  status: 'available' | 'rerouted' | 'blocked' | 'unavailable'
  isOfficial: boolean
  isCached: boolean
  isSimulated: boolean
  officialInstructions: string[]
  coordinatesPath: Array<[number, number]>
}

export interface LocationInfo {
  latitude: number
  longitude: number
  address: string
  district?: string
  stateName?: string
  gpsState: GpsLocationState
  isManual?: boolean
  accuracy?: number
}

export interface TimelineEvent {
  stage: IncidentStage
  title: string
  timestamp: string
  note?: string
}

export interface CitizenIncident {
  id: string
  category: EmergencyCategory
  severity: EmergencySeverity
  title: string
  description: string
  location: LocationInfo
  affectedCount: number
  mediaUrls: { voice?: string; images?: string[]; video?: string }
  stage: IncidentStage
  dataFreshness: DataFreshness
  dataSource: DataSourceLabel
  syncState: SyncState
  isOfflineSaved?: boolean
  timeline: TimelineEvent[]
  assignedDepartment?: string
  assignedUnit?: { name: string; type: string; phone?: string }
  estimatedEta?: string
  safetyInstructions?: string[]
  createdAt: string
  updatedAt: string
}

export interface CitizenAlert {
  id: string
  title: string
  summary: string
  severity: EmergencySeverity
  category: string
  affectedArea: string
  officialSource: string
  recommendedAction: string
  timestamp: string
  isVerified: boolean
  status: 'active' | 'nearby' | 'previous'
  dataSource: DataSourceLabel
}

export interface EmergencyResource {
  id: string
  name: string
  category: 'hospital' | 'police' | 'fire' | 'shelter' | 'ambulance'
  distanceKm: number
  address: string
  phone: string
  availableBeds?: number
  availableUnits?: number
  status: 'available' | 'busy' | 'full'
  latitude: number
  longitude: number
  dataSource: DataSourceLabel
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  notifyOnSos: boolean
  lastNotificationStatus?: 'Notification Requested' | 'SIMULATED' | 'Failed' | 'Pending'
}

export interface UserProfile {
  name: string
  phone: string
  language: AppLanguage
  homeAddress: string
  // Optional Emergency Information fields
  bloodGroup?: string
  medicalConditions?: string
  emergencyContacts: EmergencyContact[]
  accessibility: {
    voiceAlerts: boolean
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    largeInterface: boolean
  }
}

export interface SyncEvent {
  eventId: string
  eventType: 'CREATE_INCIDENT' | 'TRIGGER_SOS' | 'UPDATE_PROFILE'
  timestamp: number
  payload: any
  retryCount: number
  status: SyncState
}

export interface NetworkNode {
  id: string
  name: string
  type: 'CENTRAL' | 'DISTRICT' | 'POLICE' | 'FIRE' | 'HEALTHCARE' | 'MOBILE_COMMAND'
  status: 'active' | 'degraded' | 'offline'
  latencyMs: number
  authenticated: boolean
}
