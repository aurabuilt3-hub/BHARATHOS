'use client'

import React, { useState, useEffect } from 'react'
import L from 'leaflet'
import { 
  MapContainer as LeafletMap, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  Circle,
  Polyline,
  LayersControl, 
  LayerGroup,
  ScaleControl,
  ZoomControl,
  useMapEvents
} from 'react-leaflet'

// Import Leaflet styles
import 'leaflet/dist/leaflet.css'

// Fix default marker icon asset paths for Next.js bundlers
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-shadow.png',
  })
}

export interface MapMarker {
  id: string | number
  position: [number, number]
  title: string
  description?: string
  category?: 'critical' | 'high' | 'medium' | 'low' | 'info'
}

export interface MapPolygon {
  id: string | number
  positions: [number, number][]
  color?: string
  fillColor?: string
  fillOpacity?: number
  label?: string
}

export interface MapHeatPoint {
  position: [number, number]
  radius: number
  color: string
}

export interface MapPolyline {
  id: string | number
  positions: [number, number][]
  color?: string
  weight?: number
  dashArray?: string
}

interface MapInnerProps {
  center: [number, number]
  zoom: number
  markers?: MapMarker[]
  polygons?: MapPolygon[]
  heatpoints?: MapHeatPoint[]
  polylines?: MapPolyline[]
  onMarkerClick?: (marker: MapMarker) => void
}

// Leaflet Hook: Mouse Movement Coordinate Tracker
function CoordinateTracker() {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 17.6868, lng: 83.2185 })

  useMapEvents({
    mousemove(e) {
      setCoords(e.latlng)
    }
  })

  return (
    <div className="absolute bottom-4 right-4 z-[999] bg-[#020617]/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-slate-300 font-mono shadow-xl backdrop-blur-md">
      <span className="text-slate-500 font-bold mr-1 font-mono">COORDS:</span>
      {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
    </div>
  )
}

export default function MapInner({
  center,
  zoom,
  markers = [],
  polygons = [],
  heatpoints = [],
  polylines = [],
  onMarkerClick
}: MapInnerProps) {
  const [measuring, setMeasuring] = useState(false)

  const getMarkerIcon = (category?: string) => {
    let color = '#3b82f6'
    if (category === 'critical') color = '#ef4444'
    if (category === 'high') color = '#f97316'
    if (category === 'medium') color = '#eab308'
    if (category === 'low') color = '#10b981'

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}; cursor: pointer;"></div>`,
      className: 'custom-leaflet-icon',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
  }

  return (
    <div className="relative w-full h-full">
      {/* Measurement Tool Button */}
      <div className="absolute top-4 left-4 z-[999]">
        <button
          onClick={() => setMeasuring(!measuring)}
          className="px-3 py-1.5 rounded-lg border border-slate-800 bg-[#020617]/90 text-slate-400 hover:text-white text-xs font-bold transition-all shadow-xl backdrop-blur-md"
        >
          {measuring ? '📐 Measuring Mode Active' : '📐 Measure Distance'}
        </button>
      </div>

      <LeafletMap 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#050816' }}
        zoomControl={false}
      >
        <ScaleControl position="bottomleft" imperial={false} />
        <ZoomControl position="bottomleft" />
        <CoordinateTracker />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Assets & Incidents">
            <LayerGroup>
              {markers.map((marker) => (
                <Marker 
                  key={marker.id} 
                  position={marker.position} 
                  icon={getMarkerIcon(marker.category)}
                  eventHandlers={{
                    click: () => onMarkerClick && onMarkerClick(marker)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="text-slate-900 p-1">
                      <h5 className="font-bold text-xs">{marker.title}</h5>
                      {marker.description && (
                        <p className="text-[10px] text-slate-600 mt-1">{marker.description}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {polylines.length > 0 && (
            <LayersControl.Overlay checked name="Digital Twin Connections">
              <LayerGroup>
                {polylines.map((line) => (
                  <Polyline
                    key={line.id}
                    positions={line.positions}
                    pathOptions={{
                      color: line.color || '#3b82f6',
                      weight: line.weight || 2.5,
                      dashArray: line.dashArray
                    }}
                  />
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}

          {polygons.length > 0 && (
            <LayersControl.Overlay checked name="Ward Polygons">
              <LayerGroup>
                {polygons.map((poly) => (
                  <Polygon
                    key={poly.id}
                    positions={poly.positions}
                    pathOptions={{
                      color: poly.color || '#3b82f6',
                      fillColor: poly.fillColor || '#3b82f6',
                      fillOpacity: poly.fillOpacity || 0.15,
                      weight: 1.5
                    }}
                  >
                    {poly.label && (
                      <Popup>
                        <span className="text-slate-900 font-bold text-xs">{poly.label}</span>
                      </Popup>
                    )}
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}

          {heatpoints.length > 0 && (
            <LayersControl.Overlay checked name="Hazard Heatmap">
              <LayerGroup>
                {heatpoints.map((hp, idx) => (
                  <Circle
                    key={idx}
                    center={hp.position}
                    radius={hp.radius}
                    pathOptions={{
                      color: hp.color,
                      fillColor: hp.color,
                      fillOpacity: 0.15,
                      weight: 1,
                      dashArray: '4 4'
                    }}
                  />
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </LeafletMap>
    </div>
  )
}
