export interface NationalKPI {
  totalIncidents: number
  criticalAlerts: number
  activeDisasters: number
  nationalResponseRate: number
}

export interface StateSummary {
  id: string
  name: string
  code: string
  activeIncidents: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  capital: string
  population: string
}

export const nationalKPIData: NationalKPI = {
  totalIncidents: 1420,
  criticalAlerts: 18,
  activeDisasters: 3,
  nationalResponseRate: 94.2
}

export const statesSummaryData: StateSummary[] = [
  { id: '1', name: 'Andhra Pradesh', code: 'AP', activeIncidents: 142, riskLevel: 'high', capital: 'Amaravati', population: '53.1M' },
  { id: '2', name: 'Telangana', code: 'TG', activeIncidents: 98, riskLevel: 'medium', capital: 'Hyderabad', population: '38.0M' },
  { id: '3', name: 'Tamil Nadu', code: 'TN', activeIncidents: 115, riskLevel: 'medium', capital: 'Chennai', population: '76.8M' },
  { id: '4', name: 'Karnataka', code: 'KA', activeIncidents: 130, riskLevel: 'high', capital: 'Bengaluru', population: '67.7M' },
  { id: '5', name: 'Odisha', code: 'OD', activeIncidents: 85, riskLevel: 'critical', capital: 'Bhubaneswar', population: '47.1M' },
  { id: '6', name: 'Maharashtra', code: 'MH', activeIncidents: 210, riskLevel: 'high', capital: 'Mumbai', population: '126.4M' }
]
