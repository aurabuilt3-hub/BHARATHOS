import { MapHeatPoint } from '../../components/ui/MapContainer'

export class HeatmapManager {
  public static getVisakhapatnamFloodHeatmap(): MapHeatPoint[] {
    return [
      {
        position: [17.7289, 83.3214], // Beach Road MVP Colony
        radius: 800,
        color: '#ef4444' // Critical Red flood risk zone
      },
      {
        position: [17.7689, 83.2912], // Mudasarlova Spillway
        radius: 1200,
        color: '#f97316' // Orange warning flood risk zone
      },
      {
        position: [17.6812, 83.2104], // Gajuwaka Low Lying
        radius: 600,
        color: '#eab308' // Yellow caution flood risk zone
      }
    ]
  }
}
