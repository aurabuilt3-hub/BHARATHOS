export interface TrafficCorridor {
  id: string
  roadName: string
  avgSpeedKmh: number
  congestionLevel: 'free' | 'moderate' | 'heavy' | 'blocked'
  incidentCount: number
}

export const visakhapatnamTrafficData: TrafficCorridor[] = [
  { id: 'tf-1', roadName: 'NH16 (Gajuwaka to Maddilapalem)', avgSpeedKmh: 24, congestionLevel: 'heavy', incidentCount: 2 },
  { id: 'tf-2', roadName: 'Beach Road (RK Beach to Rushikonda)', avgSpeedKmh: 0, congestionLevel: 'blocked', incidentCount: 1 },
  { id: 'tf-3', roadName: 'BRTS Corridor (Dwaraka Nagar)', avgSpeedKmh: 42, congestionLevel: 'moderate', incidentCount: 0 },
  { id: 'tf-4', roadName: 'VIP Road (Siripuram)', avgSpeedKmh: 55, congestionLevel: 'free', incidentCount: 0 }
]
