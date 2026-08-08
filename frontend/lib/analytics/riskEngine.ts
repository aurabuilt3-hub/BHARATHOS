export interface RiskArea {
  zoneName: string
  wardName: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  activeIncidentsCount: number
  primaryHazard: string
}

export class RiskEngine {
  public static getTopRiskAreas(): RiskArea[] {
    return [
      { zoneName: 'Zone 2 (MVP Colony)', wardName: 'Ward 12', riskLevel: 'critical', activeIncidentsCount: 5, primaryHazard: 'Coastal Flood Inundation' },
      { zoneName: 'Zone 4 (Gajuwaka)', wardName: 'Ward 45', riskLevel: 'high', activeIncidentsCount: 3, primaryHazard: 'Heavy Vehicle Highway Traffic' },
      { zoneName: 'Zone 1 (Madhurawada)', wardName: 'Ward 14', riskLevel: 'medium', activeIncidentsCount: 2, primaryHazard: 'Main Water Pipeline Erosion' }
    ]
  }
}
