export interface WeatherData {
  city: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  rainfall24h: number
  uvIndex: number
  airQualityIndex: number
  warningAlert?: string
}

export const visakhapatnamWeatherData: WeatherData = {
  city: 'Visakhapatnam',
  temperature: 28,
  condition: 'Heavy Monsoonal Rain',
  humidity: 89,
  windSpeed: 32, // km/h
  rainfall24h: 78, // mm
  uvIndex: 3,
  airQualityIndex: 42, // Good AQI
  warningAlert: 'Yellow Rainfall Warning active for coastal wards until 18:00.'
}
