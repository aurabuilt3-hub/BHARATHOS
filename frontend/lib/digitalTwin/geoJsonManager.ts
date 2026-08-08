import { MapPolygon } from '../../components/ui/MapContainer'

export class GeoJsonManager {
  public static getVisakhapatnamWardPolygons(): MapPolygon[] {
    return [
      {
        id: 'ward-mvp',
        label: 'Ward 12 (MVP Colony Sector 4)',
        positions: [
          [17.7320, 83.3180],
          [17.7360, 83.3280],
          [17.7280, 83.3320],
          [17.7240, 83.3210]
        ],
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15
      },
      {
        id: 'ward-gajuwaka',
        label: 'Ward 45 (Gajuwaka Industrial)',
        positions: [
          [17.6780, 83.2020],
          [17.6890, 83.2180],
          [17.6740, 83.2240],
          [17.6680, 83.2080]
        ],
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.15
      }
    ]
  }
}
