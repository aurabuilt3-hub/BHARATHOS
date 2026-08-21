import { create } from 'zustand'
import { 
  UserProfile, 
  CitizenIncident, 
  CitizenAlert, 
  NetworkHealthState, 
  SyncState,
  LocationInfo,
  AppLanguage 
} from '../types/citizen'

interface CitizenStoreState {
  profile: UserProfile
  activeLocation: LocationInfo
  networkState: NetworkHealthState
  syncState: SyncState
  emergencyModeActive: boolean
  myIncidents: CitizenIncident[]
  nearbyAlerts: CitizenAlert[]
  
  // Actions
  setLanguage: (lang: AppLanguage) => void
  updateProfile: (updated: Partial<UserProfile>) => void
  setLocation: (loc: LocationInfo) => void
  setNetworkState: (state: NetworkHealthState) => void
  setSyncState: (state: SyncState) => void
  setEmergencyMode: (active: boolean) => void
  addIncident: (incident: CitizenIncident) => void
  updateIncident: (id: string, updated: Partial<CitizenIncident>) => void
  setAlerts: (alerts: CitizenAlert[]) => void
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Bharat Citizen',
  phone: '+91 98765 43210',
  language: 'en',
  homeAddress: 'MVP Colony, Visakhapatnam, Andhra Pradesh',
  bloodGroup: undefined, // Optional Emergency Info
  medicalConditions: undefined, // Optional Emergency Info
  emergencyContacts: [
    { id: 'c-1', name: 'Ramesh Sharma', relationship: 'Spouse', phone: '+91 98765 00001', notifyOnSos: true, lastNotificationStatus: 'Pending' },
    { id: 'c-2', name: 'Dr. Anita Rao', relationship: 'Family Physician', phone: '+91 98765 00002', notifyOnSos: true, lastNotificationStatus: 'Pending' }
  ],
  accessibility: {
    voiceAlerts: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    largeInterface: false
  }
}

const DEFAULT_LOCATION: LocationInfo = {
  latitude: 17.7289,
  longitude: 83.3214,
  address: 'Beach Road Sector 4, MVP Colony, Visakhapatnam',
  district: 'Visakhapatnam',
  stateName: 'Andhra Pradesh',
  gpsState: 'GPS AVAILABLE'
}

export const useCitizenStore = create<CitizenStoreState>((set) => ({
  profile: DEFAULT_PROFILE,
  activeLocation: DEFAULT_LOCATION,
  networkState: 'ONLINE',
  syncState: 'SYNCED',
  emergencyModeActive: false,
  myIncidents: [],
  nearbyAlerts: [],

  setLanguage: (language: AppLanguage) =>
    set((state) => ({
      profile: { ...state.profile, language }
    })),

  updateProfile: (updated: Partial<UserProfile>) =>
    set((state) => ({
      profile: { ...state.profile, ...updated }
    })),

  setLocation: (activeLocation: LocationInfo) =>
    set({ activeLocation }),

  setNetworkState: (networkState: NetworkHealthState) =>
    set({ networkState }),

  setSyncState: (syncState: SyncState) =>
    set({ syncState }),

  setEmergencyMode: (emergencyModeActive: boolean) =>
    set({ emergencyModeActive }),

  addIncident: (incident: CitizenIncident) =>
    set((state) => ({
      myIncidents: [incident, ...state.myIncidents.filter(i => i.id !== incident.id)]
    })),

  updateIncident: (id: string, updated: Partial<CitizenIncident>) =>
    set((state) => ({
      myIncidents: state.myIncidents.map(inc => inc.id === id ? { ...inc, ...updated } : inc)
    })),

  setAlerts: (nearbyAlerts: CitizenAlert[]) =>
    set({ nearbyAlerts })
}))
