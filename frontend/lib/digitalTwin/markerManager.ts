import { MapMarker } from '../../components/ui/MapContainer'
import { IncidentItem } from '../mock/incidents'
import { HospitalAsset } from '../mock/hospitals'
import { PoliceStationAsset } from '../mock/police'
import { FireStationAsset } from '../mock/fire'
import { SensorItem } from '../mock/sensors'

export class MarkerManager {
  public static mapIncidentsToMarkers(incidents: IncidentItem[]): MapMarker[] {
    return incidents.map((inc) => ({
      id: `inc-${inc.id}`,
      position: inc.coordinates,
      title: `${inc.category}: ${inc.title}`,
      description: `${inc.location} • Status: ${inc.status}`,
      category: inc.severity
    }))
  }

  public static mapHospitalsToMarkers(hospitals: HospitalAsset[]): MapMarker[] {
    return hospitals.map((hosp) => ({
      id: `hosp-${hosp.id}`,
      position: hosp.coordinates,
      title: `🏥 ${hosp.name}`,
      description: `Available Beds: ${hosp.availableBeds}/${hosp.totalBeds} • ICU: ${hosp.icuBedsAvailable}`,
      category: 'info'
    }))
  }

  public static mapPoliceToMarkers(police: PoliceStationAsset[]): MapMarker[] {
    return police.map((pol) => ({
      id: `pol-${pol.id}`,
      position: pol.coordinates,
      title: `👮 ${pol.name}`,
      description: `Active Units: ${pol.activeUnits} • Contact: ${pol.phone}`,
      category: 'info'
    }))
  }

  public static mapFireToMarkers(fire: FireStationAsset[]): MapMarker[] {
    return fire.map((f) => ({
      id: `fire-${f.id}`,
      position: f.coordinates,
      title: `🚒 ${f.name}`,
      description: `Tenders: ${f.fireTendersAvailable} • Water Cap: ${f.waterCapacityLiters}L`,
      category: 'info'
    }))
  }

  public static mapSensorsToMarkers(sensors: SensorItem[]): MapMarker[] {
    return sensors.map((sns) => ({
      id: `sns-${sns.id}`,
      position: sns.coordinates,
      title: `📡 ${sns.name}`,
      description: `Reading: ${sns.currentReading} ${sns.unit} • Status: ${sns.status}`,
      category: sns.status === 'critical' ? 'critical' : sns.status === 'warning' ? 'high' : 'info'
    }))
  }
}
