export interface DistrictItem {
  id: string
  name: string
  stateId: string
  activeIncidents: number
  hospitalsCount: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  headquarters: string
}

export const apDistrictsData: DistrictItem[] = [
  { id: 'd-1', name: 'Visakhapatnam', stateId: 'ap-01', activeIncidents: 42, hospitalsCount: 18, riskLevel: 'high', headquarters: 'Visakhapatnam City' },
  { id: 'd-2', name: 'NTR (Vijayawada)', stateId: 'ap-01', activeIncidents: 28, hospitalsCount: 14, riskLevel: 'medium', headquarters: 'Vijayawada' },
  { id: 'd-3', name: 'Guntur', stateId: 'ap-01', activeIncidents: 22, hospitalsCount: 12, riskLevel: 'low', headquarters: 'Guntur' },
  { id: 'd-4', name: 'East Godavari', stateId: 'ap-01', activeIncidents: 31, hospitalsCount: 10, riskLevel: 'high', headquarters: 'Rajahmundry' },
  { id: 'd-5', name: 'Tirupati', stateId: 'ap-01', activeIncidents: 19, hospitalsCount: 15, riskLevel: 'low', headquarters: 'Tirupati' }
]
