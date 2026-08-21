import { LocationInfo, GpsLocationState } from '../../types/citizen'

export interface DeviceLocationResult {
  location?: LocationInfo
  errorState?: GpsLocationState
  errorMessage?: string
}

export class GeolocationService {
  /**
   * Request real device coordinates using standard browser navigator.geolocation API.
   * Does NOT use any paid GPS API or IP geolocation.
   */
  static async getDeviceLocation(): Promise<DeviceLocationResult> {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return {
        errorState: 'GPS UNAVAILABLE',
        errorMessage: 'Geolocation API is not supported by this browser.'
      }
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords

          const locationInfo: LocationInfo = {
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            address: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`,
            district: 'Live GPS Location',
            stateName: 'India',
            gpsState: 'GPS AVAILABLE',
            isManual: false
          }

          resolve({ location: locationInfo })
        },
        (error) => {
          let errorState: GpsLocationState = 'GPS UNAVAILABLE'
          let errorMessage = 'Unable to retrieve location.'

          if (error.code === error.PERMISSION_DENIED) {
            errorState = 'PERMISSION DENIED'
            errorMessage = 'Location permission denied by user or browser.'
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorState = 'LOCATION UNAVAILABLE'
            errorMessage = 'Location information is unavailable on this device.'
          } else if (error.code === error.TIMEOUT) {
            errorState = 'GPS UNAVAILABLE'
            errorMessage = 'Location request timed out.'
          }

          resolve({ errorState, errorMessage })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  /**
   * Continuous location watcher for real-time tracking during active SOS or safe evacuation.
   */
  static watchDeviceLocation(
    onLocation: (location: LocationInfo) => void,
    onError?: (errorState: GpsLocationState) => void
  ): number | null {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      if (onError) onError('GPS UNAVAILABLE')
      return null
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        onLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          address: `Live Tracking: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`,
          district: 'Live GPS Location',
          stateName: 'India',
          gpsState: 'GPS AVAILABLE',
          isManual: false
        })
      },
      (error) => {
        const errState: GpsLocationState = error.code === error.PERMISSION_DENIED ? 'PERMISSION DENIED' : 'GPS UNAVAILABLE'
        if (onError) onError(errState)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    )
  }

  static stopWatch(watchId: number | null): void {
    if (watchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
}
