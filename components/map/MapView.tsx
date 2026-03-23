'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Place = {
  id: string
  name: string
  latitude: number
  longitude: number
  type?: string
}

type MapViewProps = {
  places: Place[]
  selectedPlaceId?: string | null
  onSelectPlace?: (id: string) => void
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken
}

export default function MapView({
  places,
  selectedPlaceId,
  onSelectPlace,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const markerElementsRef = useRef<Record<string, HTMLDivElement>>({})
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-77.0369, 38.9072],
      zoom: 10,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      map.resize()
      setMapReady(true)
    })

    const handleResize = () => {
      map.resize()
    }

    window.addEventListener('resize', handleResize)

    mapRef.current = map

    return () => {
      window.removeEventListener('resize', handleResize)
      Object.values(markersRef.current).forEach((marker) => marker.remove())
      markersRef.current = {}
      markerElementsRef.current = {}
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}
    markerElementsRef.current = {}

    places.forEach((place) => {
      if (
        typeof place.latitude !== 'number' ||
        typeof place.longitude !== 'number'
      ) {
        return
      }

      const el = document.createElement('div')
      el.className =
        'h-4 w-4 shrink-0 cursor-pointer rounded-full border-2 border-white shadow-md transition-all duration-200'
      el.style.backgroundColor =
        place.type === 'restaurant' ? '#ef4444' : '#22c55e'

      el.addEventListener('click', (event) => {
        event.stopPropagation()
        onSelectPlace?.(place.id)
      })

      const badgeBg = place.type === 'restaurant' ? '#fee2e2' : '#dcfce7'
      const badgeColor = place.type === 'restaurant' ? '#b91c1c' : '#15803d'

      const popupHtml = `
        <div style="min-width:190px; padding:2px;">
          <div style="font-size:15px; font-weight:700; color:#111827; margin-bottom:6px;">
            ${place.name}
          </div>
          <div style="margin-bottom:10px;">
            <span style="
              display:inline-block;
              border-radius:9999px;
              padding:4px 10px;
              font-size:11px;
              font-weight:700;
              text-transform:capitalize;
              background:${badgeBg};
              color:${badgeColor};
            ">
              ${place.type || 'place'}
            </span>
          </div>
          <a
            href="/places/${place.id}"
            style="
              display:inline-block;
              width:100%;
              box-sizing:border-box;
              border-radius:12px;
              background:#111827;
              color:white;
              text-decoration:none;
              text-align:center;
              padding:10px 12px;
              font-size:13px;
              font-weight:700;
            "
          >
            View details
          </a>
        </div>
      `

      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
      }).setHTML(popupHtml)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map)

      markersRef.current[place.id] = marker
      markerElementsRef.current[place.id] = el
    })
  }, [places, mapReady, onSelectPlace])

  useEffect(() => {
    Object.entries(markerElementsRef.current).forEach(([id, el]) => {
      if (id === selectedPlaceId) {
        el.style.transform = 'scale(1.4)'
        el.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.18)'
        el.style.zIndex = '10'
      } else {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = ''
        el.style.zIndex = '1'
      }
    })
  }, [selectedPlaceId])

  useEffect(() => {
    if (!selectedPlaceId || !mapRef.current) return

    const place = places.find((p) => p.id === selectedPlaceId)
    if (!place) return

    mapRef.current.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 13,
      essential: true,
    })
  }, [selectedPlaceId, places])

  if (!mapboxToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 p-6 text-center">
        <div>
          <p className="text-base font-semibold text-neutral-900">
            Mapbox token missing
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local and restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0" />
    </div>
  )
}