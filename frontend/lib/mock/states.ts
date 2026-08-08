export interface StateDetail {
  id: string
  name: string
  code: string
  districtsCount: number
  totalPopulation: string
  activeEmergencyTeams: number
  stateRiskLevel: 'critical' | 'high' | 'medium' | 'low'
  emergencyHotlines: string[]
}

export const andhraPradeshStateData: StateDetail = {
  id: 'ap-01',
  name: 'Andhra Pradesh',
  code: 'AP',
  districtsCount: 26,
  totalPopulation: '53.1M',
  activeEmergencyTeams: 148,
  stateRiskLevel: 'high',
  emergencyHotlines: ['112', '1070 (Disaster Management)', '108 (Ambulance)']
}
