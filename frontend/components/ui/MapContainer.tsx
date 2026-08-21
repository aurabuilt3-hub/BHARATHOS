'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { MapMarker, MapPolygon, MapHeatPoint, MapPolyline } from './MapInner'

// Load Leaflet MapInner asynchronously on client-side only
const DynamicMap = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[380px] flex flex-col items-center justify-center bg-[#050816] text-slate-400 space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      <p className="text-xs uppercase tracking-wider">Loading Evacuation Spatial Canvas...</p>
    </div>
  )
})

interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  polygons?: MapPolygon[]
  heatpoints?: MapHeatPoint[]
  polylines?: MapPolyline[]
  fitBoundsPoints?: [number, number][]
  onMarkerClick?: (marker: MapMarker) => void
  showMyLocationButton?: boolean
}

export default function MapContainer({
  center = [17.6868, 83.2185],
  zoom = 12,
  markers = [],
  polygons = [],
  heatpoints = [],
  polylines = [],
  fitBoundsPoints,
  onMarkerClick,
  showMyLocationButton = true
}: MapContainerProps) {
  return (
    <div className="w-full h-full min-h-[380px] md:min-h-[440px] overflow-hidden rounded-2xl border border-slate-800 relative">
      <DynamicMap
        center={center}
        zoom={zoom}
        markers={markers}
        polygons={polygons}
        heatpoints={heatpoints}
        polylines={polylines}
        fitBoundsPoints={fitBoundsPoints}
        onMarkerClick={onMarkerClick}
        showMyLocationButton={showMyLocationButton}
      />
    </div>
  )
}

export type { MapMarker, MapPolygon, MapHeatPoint, MapPolyline }
