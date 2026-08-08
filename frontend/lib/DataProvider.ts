import { nationalKPIData, statesSummaryData } from './mock/india'
import { andhraPradeshStateData } from './mock/states'
import { apDistrictsData } from './mock/districts'
import { visakhapatnamSensorsData } from './mock/sensors'
import { visakhapatnamHospitalsData } from './mock/hospitals'
import { visakhapatnamPoliceData } from './mock/police'
import { visakhapatnamFireData } from './mock/fire'
import { visakhapatnamTrafficData } from './mock/traffic'
import { visakhapatnamWeatherData } from './mock/weather'

export class BoundaryProvider {
  public static getAdministrativeBoundaries(level: 'national' | 'state' | 'district' | 'city' | 'ward', id?: string) {
    switch (level) {
      case 'state':
        return andhraPradeshStateData
      case 'district':
        return apDistrictsData
      case 'national':
      default:
        return { national: nationalKPIData, states: statesSummaryData }
    }
  }
}

export class WeatherProvider {
  public static getWeatherData(location: string) {
    return visakhapatnamWeatherData
  }
}

export class HospitalProvider {
  public static getHospitals(city: string) {
    return visakhapatnamHospitalsData
  }
}

export class PoliceProvider {
  public static getPoliceStations(city: string) {
    return visakhapatnamPoliceData
  }
}

export class FireProvider {
  public static getFireStations(city: string) {
    return visakhapatnamFireData
  }
}

export class TrafficProvider {
  public static getTrafficCorridors(city: string) {
    return visakhapatnamTrafficData
  }
}

export class SensorProvider {
  public static getSensors(city: string) {
    return visakhapatnamSensorsData
  }
}
