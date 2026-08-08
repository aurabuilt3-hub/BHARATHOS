'use client'

import React, { useState } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import TimelinePlaybackWidget from '../../../components/widgets/TimelinePlaybackWidget'
import AssetDetailsDrawer from '../../../components/widgets/AssetDetailsDrawer'

import { visakhapatnamIncidentsData } from '../../../lib/mock/incidents'
import { visakhapatnamHospitalsData } from '../../../lib/mock/hospitals'
import { visakhapatnamPoliceData } from '../../../lib/mock/police'
import { visakhapatnamFireData } from '../../../lib/mock/fire'
import { visakhapatnamSensorsData } from '../../../lib/mock/sensors'

import { MarkerManager } from '../../../lib/digitalTwin/markerManager'
import { HeatmapManager } from '../../../lib/digitalTwin/heatmapManager'
import { GeoJsonManager } from '../../../lib/digitalTwin/geoJsonManager'
import { SelectedAssetDetail } from '../../../lib/digitalTwin/selectionManager'

export default function DigitalTwinPage() {
  const [currentHour, setCurrentHour] = useState<number>(9)
  const [selectedAsset, setSelectedAsset] = useState<SelectedAssetDetail | null>(null)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  // 1. Filter incidents by timeline hour and category/severity
  const filteredIncidents = visakhapatnamIncidentsData.filter((inc) => {
    const matchesHour = inc.timeHour <= currentHour
    const matchesCategory = categoryFilter === 'all' || inc.category.toLowerCase() === categoryFilter.toLowerCase()
    const matchesSeverity = severityFilter === 'all' || inc.severity.toLowerCase() === severityFilter.toLowerCase()
    return matchesHour && matchesCategory && matchesSeverity
  })

  // 2. Convert mock data to map markers using MarkerManager
  const incidentMarkers = MarkerManager.mapIncidentsToMarkers(filteredIncidents)
  const hospitalMarkers = MarkerManager.mapHospitalsToMarkers(visakhapatnamHospitalsData)
  const policeMarkers = MarkerManager.mapPoliceToMarkers(visakhapatnamPoliceData)
  const fireMarkers = MarkerManager.mapFireToMarkers(visakhapatnamFireData)
  const sensorMarkers = MarkerManager.mapSensorsToMarkers(visakhapatnamSensorsData)

  const allMarkers = [
    ...incidentMarkers,
    ...hospitalMarkers,
    ...policeMarkers,
    ...fireMarkers,
    ...sensorMarkers
  ]

  // 3. Load polygons & heatmaps via managers
  const polygons = GeoJsonManager.getVisakhapatnamWardPolygons()
  const heatpoints = HeatmapManager.getVisakhapatnamFloodHeatmap()

  // Handle marker selection event
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedAsset({
      id: String(marker.id),
      name: marker.title,
      category: marker.category || 'Asset',
      status: 'Active Monitoring',
      coordinates: marker.position,
      description: marker.description || 'Spatial asset registered in Visakhapatnam Digital Twin registry.',
      relatedIncidents: ['Flood Alert #12', 'Traffic Bypass']
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
            Visible Pins: <span className="text-blue-400 font-bold">{allMarkers.length}</span>
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
