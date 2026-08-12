'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import TimelinePlaybackWidget from '../../../components/widgets/TimelinePlaybackWidget'
import AssetDetailsDrawer from '../../../components/widgets/AssetDetailsDrawer'
import { SelectedAssetDetail } from '../../../lib/digitalTwin/selectionManager'
import { GeoJsonManager } from '../../../lib/digitalTwin/geoJsonManager'
import { HeatmapManager } from '../../../lib/digitalTwin/heatmapManager'
import { 
  apiService, 
  BackendIncident, 
  BackendFacility, 
  BackendResource, 
  BackendDigitalTwinNode 
} from '../../../services/api'

export default function DigitalTwinPage() {
  const [currentHour, setCurrentHour] = useState<number>(9)
  const [selectedAsset, setSelectedAsset] = useState<SelectedAssetDetail | null>(null)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  // Live database states
  const [incidents, setIncidents] = useState<BackendIncident[]>([])
  const [facilities, setFacilities] = useState<BackendFacility[]>([])
  const [resources, setResources] = useState<BackendResource[]>([])
  const [nodes, setNodes] = useState<BackendDigitalTwinNode[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([
      apiService.getIncidents({ 
        category: categoryFilter, 
        severity: severityFilter 
      }),
      apiService.getFacilities({ limit: 100 }),
      apiService.getResources({ limit: 100 }),
      apiService.getDigitalTwinNodes({ limit: 100 }),
      apiService.getDigitalTwinConnections()
    ]).then(([incidentsRes, facilitiesRes, resourcesRes, nodesRes, connectionsRes]) => {
      if (!isMounted) return
      setIncidents(incidentsRes)
      setFacilities(facilitiesRes.items || [])
      setResources(resourcesRes.items || [])
      setNodes(nodesRes.items || [])
      setConnections(connectionsRes.items || [])
      setLoading(false)
    }).catch(err => {
      console.error("Failed to load digital twin data", err)
      if (isMounted) setLoading(false)
    })

    return () => { isMounted = false }
  }, [categoryFilter, severityFilter])

  // Convert DB items to map markers
  const incidentMarkers: MapMarker[] = incidents
    .filter(inc => {
      // Map hour comparison if created_at belongs to current simulation playback context
      const createdHour = new Date(inc.created_at).getHours()
      return isNaN(createdHour) || createdHour <= currentHour
    })
    .map(inc => ({
      id: `inc-${inc.id}`,
      position: [inc.latitude, inc.longitude] as [number, number],
      title: `🔥 [${inc.category.toUpperCase()}] ${inc.title}`,
      description: `${inc.description} • Severity: ${inc.severity} • Status: ${inc.status}`,
      category: inc.severity === 'critical' ? 'critical' as const : inc.severity === 'high' ? 'high' as const : inc.severity === 'medium' ? 'medium' as const : 'low' as const
    }))

  const facilityMarkers: MapMarker[] = facilities.map(fac => {
    let emoji = '🏥'
    if (fac.facility_type === 'POLICE_STATION') emoji = '👮'
    if (fac.facility_type === 'FIRE_STATION') emoji = '🚒'
    
    return {
      id: `fac-${fac.id}`,
      position: [fac.latitude, fac.longitude] as [number, number],
      title: `${emoji} ${fac.name}`,
      description: `Type: ${fac.facility_type} • Source: ${fac.source_type} • Address: ${fac.address || 'N/A'}`,
      category: 'info' as const
    }
  })

  const resourceMarkers: MapMarker[] = resources.map(res => {
    let emoji = '🚗'
    if (res.type === 'ambulance') emoji = '🚑'
    if (res.type === 'fire_truck') emoji = '🚒'
    if (res.type === 'patrol_car') emoji = '🚓'

    return {
      id: `res-${res.id}`,
      position: [res.latitude, res.longitude] as [number, number],
      title: `${emoji} ${res.name}`,
      description: `Type: ${res.type} • Status: ${res.status}`,
      category: 'info' as const
    }
  })

  const nodeMarkers: MapMarker[] = nodes.map(node => ({
    id: `node-${node.id}`,
    position: [node.latitude, node.longitude] as [number, number],
    title: `📡 ${node.name}`,
    description: `Type: ${node.type} • Status: ${node.status}`,
    category: node.status === 'critical' ? 'critical' as const : node.status === 'warning' ? 'high' as const : 'info' as const
  }))

  const allMarkers = [
    ...incidentMarkers,
    ...facilityMarkers,
    ...resourceMarkers,
    ...nodeMarkers
  ].filter(marker => marker.position[0] !== undefined && marker.position[1] !== undefined && !isNaN(marker.position[0]) && !isNaN(marker.position[1]))

  // Load polygons & heatmaps via managers
  const polygons = GeoJsonManager.getVisakhapatnamWardPolygons()
  const heatpoints = HeatmapManager.getVisakhapatnamFloodHeatmap()

  // Compute connection polylines
  const mapPolylines = connections
    .map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from_node_id)
      const toNode = nodes.find(n => n.id === conn.to_node_id)
      if (!fromNode || !toNode) return null

      let color = '#10b981' // healthy
      if (conn.status === 'warning') color = '#eab308'
      if (conn.status === 'offline') color = '#ef4444'

      return {
        id: conn.id,
        positions: [
          [fromNode.latitude, fromNode.longitude],
          [toNode.latitude, toNode.longitude]
        ] as [number, number][],
        color,
        weight: 2,
        dashArray: conn.status === 'offline' ? '5 5' : undefined
      }
    })
    .filter((l): l is NonNullable<typeof l> => l !== null)

  // Handle marker selection event
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedAsset({
      id: String(marker.id),
      name: marker.title,
      category: marker.category || 'Asset',
      status: 'Active Monitoring',
      coordinates: marker.position,
      description: marker.description || 'Spatial asset registered in Visakhapatnam Digital Twin registry.',
      relatedIncidents: []
    })
  }

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
        {/* Page Header */}
        <PageHeader
          title="Visakhapatnam Digital Twin Spatial Platform"
          description="Interactive 3D/2D GIS spatial map framework mapping live sensors, emergency assets, hazard overlays, and incident playback timeline."
          breadcrumbs={[{ label: 'Home' }, { label: 'Digital Twin' }]}
        />

        {/* Global Map Filters Bar */}
        <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Filters:</span>
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Accident">Accident</option>
              <option value="Medical">Medical</option>
              <option value="Water Leakage">Water Leakage</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="text-[11px] font-mono-data text-slate-400">
            {loading ? (
              <span className="animate-pulse">Loading markers...</span>
            ) : (
              <>Visible Pins: <span className="text-blue-400 font-bold">{allMarkers.length}</span></>
            )}
          </div>
        </div>

        {/* Leaflet Dynamic Spatial Map Canvas Workspace */}
        <div className="flex-1 min-h-0 relative">
          <MapContainer
            center={[17.6868, 83.2185]}
            zoom={13}
            markers={allMarkers}
            polygons={polygons}
            heatpoints={heatpoints}
            polylines={mapPolylines}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Timeline Playback Slider Bar */}
        <div className="shrink-0">
          <TimelinePlaybackWidget
            currentHour={currentHour}
            onHourChange={(h) => setCurrentHour(h)}
          />
        </div>

        {/* Asset Details Drawer */}
        <AssetDetailsDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      </div>
    </DashboardLayout>
  )
}
