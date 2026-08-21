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
  useMapEvents,
  useMap
} from 'react-leaflet'
import { GeolocationService } from '../../services/location/geolocationService'
import { LocationInfo, GpsLocationState } from '../../types/citizen'
import { useCitizenStore } from '../../store/useCitizenStore'

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
  category?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'user' | 'destination' | 'hazard'
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
  fitBoundsPoints?: [number, number][]
  onMarkerClick?: (marker: MapMarker) => void
  showMyLocationButton?: boolean
}

// Helper component to invalidate container bounds, fit route bounds, and sync view
function MapViewController({
  center,
  zoom,
  fitBoundsPoints
}: {
  center: [number, number];
  zoom: number;
  fitBoundsPoints?: [number, number][]
}) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const timer1 = setTimeout(() => { map.invalidateSize() }, 100)
    const timer2 = setTimeout(() => { map.invalidateSize() }, 300)

    if (fitBoundsPoints && fitBoundsPoints.length >= 2) {
      try {
        const bounds = L.latLngBounds(fitBoundsPoints)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      } catch (err) {
        console.warn('[MapViewController] Fit bounds failed, fallback to center:', err)
        map.setView(center, zoom)
      }
    } else {
      map.setView(center, zoom)
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [map, center, zoom, fitBoundsPoints])

  return null
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
  fitBoundsPoints,
  onMarkerClick,
  showMyLocationButton = true
}: MapInnerProps) {
  const { setLocation, activeLocation } = useCitizenStore()
  const [measuring, setMeasuring] = useState(false)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center)
  const [userGpsPosition, setUserGpsPosition] = useState<[number, number] | null>(
    activeLocation.gpsState === 'GPS AVAILABLE' ? [activeLocation.latitude, activeLocation.longitude] : null
  )
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | undefined>(activeLocation.accuracy)
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Synchronize center state when props update
  useEffect(() => {
    setCurrentCenter(center)
  }, [center])

  const getMarkerIcon = (category?: string) => {
    if (category === 'user') {
      return L.divIcon({
        html: `<div style="background-color: #06b6d4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px #06b6d4; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;" class="animate-pulse">📍</div>`,
        className: 'user-live-gps-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }

    if (category === 'destination') {
      return L.divIcon({
        html: `<div style="background-color: #10b981; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px #10b981; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🚪</div>`,
        className: 'destination-evac-icon',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      })
    }

    if (category === 'hazard' || category === 'critical') {
      return L.divIcon({
        html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">⚠️</div>`,
        className: 'hazard-icon',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      })
    }

    let color = '#3b82f6'
    if (category === 'high') color = '#f97316'
    if (category === 'medium') color = '#eab308'
    if (category === 'low') color = '#10b981'

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}; cursor: pointer;"></div>`,
      className: 'custom-leaflet-icon',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })
  }

  // Handle "My Location" button click using browser navigator.geolocation API
  const handleFetchMyLocation = async () => {
    setIsLocating(true)
    setGpsStatusMessage('Acquiring real device coordinates...')

    const res = await GeolocationService.getDeviceLocation()
    setIsLocating(false)

    if (res.location && res.location.gpsState === 'GPS AVAILABLE') {
      const pos: [number, number] = [res.location.latitude, res.location.longitude]
      setUserGpsPosition(pos)
      setGpsAccuracyMeters(res.location.accuracy)
      setCurrentCenter(pos)
      setLocation(res.location)
      setGpsStatusMessage(`GPS Acquired: ±${res.location.accuracy || 10}m accuracy`)
      setTimeout(() => setGpsStatusMessage(null), 4000)
    } else {
      const errMsg = res.errorMessage || 'GPS Unavailable'
      setGpsStatusMessage(`⚠️ ${errMsg}`)
      setTimeout(() => setGpsStatusMessage(null), 5000)
    }
  }

  return (
    <div className="relative w-full h-full min-h-[380px]">
      {/* Top Map Controls (My Location + Measure) */}
      <div className="absolute top-4 left-4 z-[999] flex flex-wrap gap-2">
        {showMyLocationButton && (
          <button
            onClick={handleFetchMyLocation}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-xl border border-sky-800 bg-[#020617]/95 text-sky-300 hover:text-white text-xs font-bold font-mono transition-all shadow-xl backdrop-blur-md flex items-center space-x-1.5 cursor-pointer"
          >
            <span className={isLocating ? 'animate-spin' : ''}>🎯</span>
            <span>{isLocating ? 'Acquiring GPS...' : 'My Location'}</span>
          </button>
        )}

        <button
          onClick={() => setMeasuring(!measuring)}
          className="px-3.5 py-2 rounded-xl border border-slate-800 bg-[#020617]/95 text-slate-400 hover:text-white text-xs font-bold font-mono transition-all shadow-xl backdrop-blur-md"
        >
          {measuring ? '📐 Measuring Active' : '📐 Measure Distance'}
        </button>
      </div>

      {/* GPS Feedback Status Toast */}
      {gpsStatusMessage && (
        <div className="absolute top-16 left-4 z-[999] px-3.5 py-2 rounded-xl border border-sky-800/80 bg-[#020617]/95 text-sky-200 text-[11px] font-mono shadow-2xl backdrop-blur-md animate-fade-in">
          {gpsStatusMessage}
        </div>
      )}

      <LeafletMap
        center={currentCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '380px', background: '#050816' }}
        zoomControl={false}
      >
        <ScaleControl position="bottomleft" imperial={false} />
        <ZoomControl position="bottomleft" />
        <CoordinateTracker />
        <MapViewController center={currentCenter} zoom={zoom} fitBoundsPoints={fitBoundsPoints} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark Command View">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street View">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Assets & Incidents">
            <LayerGroup>
              {/* Render User Live GPS Marker if active */}
              {userGpsPosition && (
                <>
                  <Marker
                    position={userGpsPosition}
                    icon={getMarkerIcon('user')}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="text-slate-900 p-1 font-mono">
                        <h5 className="font-bold text-xs text-sky-700">📍 YOU ARE HERE</h5>
                        <p className="text-[10px] text-slate-600 mt-1">
                          Live Device GPS (±{gpsAccuracyMeters || 10}m accuracy)
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Accuracy Circle */}
                  <Circle
                    center={userGpsPosition}
                    radius={gpsAccuracyMeters || 30}
                    pathOptions={{
                      color: '#06b6d4',
                      fillColor: '#06b6d4',
                      fillOpacity: 0.15,
                      weight: 1.5
                    }}
                  />
                </>
              )}

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
                    <div className="text-slate-900 p-1 font-mono">
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
            <LayersControl.Overlay checked name="Evacuation Routes & Connections">
              <LayerGroup>
                {polylines.map((line) => (
                  <Polyline
                    key={line.id}
                    positions={line.positions}
                    pathOptions={{
                      color: line.color || '#06b6d4',
                      weight: line.weight || 5,
                      opacity: 0.9,
                      dashArray: line.dashArray
                    }}
                  />
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}

          {polygons.length > 0 && (
            <LayersControl.Overlay checked name="Evacuation Zones & Polygons">
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
