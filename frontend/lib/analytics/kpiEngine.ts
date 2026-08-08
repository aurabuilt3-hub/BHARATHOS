export interface KPIMetrics {
  avgResponseTimeMinutes: number
  avgResolutionTimeHours: number
  resolutionRatePercent: number
  criticalIncidentRatio: number
  hospitalCapacityAvailablePercent: number
  sensorHealthPercent: number
}

export class KPIEngine {
  public static calculateSummary(): KPIMetrics {
    return {
      avgResponseTimeMinutes: 14.2,
      avgResolutionTimeHours: 2.4,
      resolutionRatePercent: 94.2,
      criticalIncidentRatio: 12.8,
      hospitalCapacityAvailablePercent: 28.4,
      sensorHealthPercent: 98.6
    }
  }
}
