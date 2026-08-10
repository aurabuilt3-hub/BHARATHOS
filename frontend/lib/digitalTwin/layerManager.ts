export interface LayerConfig {
  id: string
  name: string
  enabled: boolean
  category: 'incidents' | 'hospitals' | 'police' | 'fire' | 'sensors' | 'hazards'
}

export const defaultLayerConfigs: LayerConfig[] = [
  { id: 'layer-incidents', name: 'Active Incidents', enabled: true, category: 'incidents' },
  { id: 'layer-hospitals', name: 'Hospitals & Medical', enabled: true, category: 'hospitals' },
  { id: 'layer-police', name: 'Police Stations', enabled: true, category: 'police' },
  { id: 'layer-fire', name: 'Fire Stations', enabled: true, category: 'fire' },
  { id: 'layer-sensors', name: 'IoT Telemetry Sensors', enabled: true, category: 'sensors' },
  { id: 'layer-hazards', name: 'Disaster Hazard Heatmap', enabled: true, category: 'hazards' }
]

export class LayerManager {
  private layers: LayerConfig[]

  constructor(initialLayers: LayerConfig[] = defaultLayerConfigs) {
    this.layers = [...initialLayers]
  }

  public getLayers(): LayerConfig[] {
    return this.layers
  }

  public toggleLayer(layerId: string): LayerConfig[] {
    this.layers = this.layers.map(l => l.id === layerId ? { ...l, enabled: !l.enabled } : l)
    return this.layers
  }

  public isCategoryEnabled(category: LayerConfig['category']): boolean {
    const found = this.layers.find(l => l.category === category)
    return found ? found.enabled : true
  }
}
