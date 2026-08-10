export interface ForecastItem {
  id: string
  title: string
  metric: string
  confidence: number
  timeframe: string
  recommendation: string
  expectedImpact: string
  assumptions: string[]
}

export class ForecastEngine {
  public static getPredictiveForecasts(): ForecastItem[] {
    return [
      {
        id: 'fc-1',
        title: 'Coastal Flood Inundation Risk',
        metric: 'Ward 12 Storm Drain Depth +0.4m expected in 3 hours',
        confidence: 88.5,
        timeframe: 'Next 3 Hours',
        recommendation: 'Pre-position dewatering pump M-12 at Beach Road Sector 4.',
        expectedImpact: 'Prevents waterlogging across 1.2 km of Beach Road corridor.',
        assumptions: ['High tide peak coincides with 30mm forecasted rainfall']
      },
      {
        id: 'fc-2',
        title: 'NH16 Corridor Traffic Bottleneck',
        metric: 'Traffic speed drop to <15 km/h predicted during 17:00 peak',
        confidence: 92.0,
        timeframe: '17:00 - 19:00 Today',
        recommendation: 'Post digital signboards on Inner Ring Road for detour.',
        expectedImpact: 'Reduces peak hour bottleneck delay by 18 minutes.',
        assumptions: ['Beach corridor detour remains active']
      },
      {
        id: 'fc-3',
        title: 'ICU Medical Surge Demand',
        metric: 'Predicted 8 ICU bed requests over next 12 hours',
        confidence: 84.2,
        timeframe: 'Next 12 Hours',
        recommendation: 'Reserve 15% ICU beds at King George Hospital (KGH).',
        expectedImpact: 'Ensures zero ambulance wait time for critical trauma patients.',
        assumptions: ['Emergency trauma surge pattern holds']
      }
    ]
  }
}
