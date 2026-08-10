export interface FireStationAsset {
  id: string
  name: string
  coordinates: [number, number]
  fireTendersAvailable: number
  waterCapacityLiters: number
  phone: string
}

export const visakhapatnamFireData: FireStationAsset[] = [
  { id: 'fire-01', name: 'Surya Bagh Main Fire Station', coordinates: [17.7165, 83.3012], fireTendersAvailable: 6, waterCapacityLiters: 45000, phone: '0891-2562222' },
  { id: 'fire-02', name: 'Auto Nagar Industrial Fire Station', coordinates: [17.6745, 83.2089], fireTendersAvailable: 4, waterCapacityLiters: 30000, phone: '0891-2563333' }
]
