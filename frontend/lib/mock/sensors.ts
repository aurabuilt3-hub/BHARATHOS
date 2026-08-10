export interface SensorItem {
  id: string
  name: string
  type: 'water_level' | 'rain_gauge' | 'air_quality' | 'flow_meter'
  coordinates: [number, number]
  currentReading: string | number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: string
}

export const visakhapatnamSensorsData: SensorItem[] = [
  { id: 'sns-1', name: 'Ward 12 Storm Drain Gauge', type: 'water_level', coordinates: [17.7312, 83.3245], currentReading: 4.2, unit: 'm', status: 'critical', lastUpdated: '1 min ago' },
  { id: 'sns-2', name: 'Mudasarlova Reservoir Spillway', type: 'water_level', coordinates: [17.7689, 83.2912], currentReading: 8.5, unit: 'm', status: 'warning', lastUpdated: '3 mins ago' },
  { id: 'sns-3', name: 'MVP Colony Rain Gauge', type: 'rain_gauge', coordinates: [17.7401, 83.3340], currentReading: 45, unit: 'mm/h', status: 'warning', lastUpdated: '5 mins ago' },
  { id: 'sns-4', name: 'Siripuram AQI Station', type: 'air_quality', coordinates: [17.7210, 83.3160], currentReading: 42, unit: 'AQI', status: 'normal', lastUpdated: '10 mins ago' }
]
