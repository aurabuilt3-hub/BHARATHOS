export interface CityDetail {
  id: string
  name: string
  districtId: string
  center: [number, number]
  zoom: number
  population: string
  zonesCount: number
  wardsCount: number
  currentWeather: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
}

export const visakhapatnamCityData: CityDetail = {
  id: 'city-vizag',
  name: 'Visakhapatnam',
  districtId: 'd-1',
  center: [17.6868, 83.2185],
  zoom: 13,
  population: '2.3M',
  zonesCount: 6,
  wardsCount: 98,
  currentWeather: 'Heavy Rain / Coastal Wind (28°C)',
  riskLevel: 'high'
}
