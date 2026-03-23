'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'

type Place = {
  id: string
  name: string
  type: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  cuisine: string | null
  phone: string | null
  created_at: string | null
  image_url: string | null
}

type PlacesListProps = {
  places: Place[]
  selectedPlaceId: string | null
  setSelectedPlaceId: (id: string | null) => void
  userLocation: { lat: number; lng: number } | null
}

export default function PlacesList({
  places,
  selectedPlaceId,
  setSelectedPlaceId,
  userLocation,
}: PlacesListProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!selectedPlaceId || !listRef.current) return

    const container = listRef.current
    const el = cardRefs.current[selectedPlaceId]

    if (!el) return

    const containerTop = container.scrollTop
    const containerHeight = container.clientHeight
    const elTop = el.offsetTop
    const elHeight = el.offsetHeight
    const elBottom = elTop + elHeight
    const visibleTop = containerTop
    const visibleBottom = containerTop + containerHeight

    if (elTop < visibleTop || elBottom > visibleBottom) {
      container.scrollTo({
        top: Math.max(elTop - 16, 0),
        behavior: 'smooth',
      })
    }
  }, [selectedPlaceId])

  function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const km = R * c
    return km * 0.621371
  }

  const sortedPlaces = useMemo(() => {
    if (!userLocation) return places

    return [...places].sort((a, b) => {
      const distanceA = getDistanceMiles(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude
      )

      const distanceB = getDistanceMiles(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude
      )

      return distanceA - distanceB
    })
  }, [places, userLocation])

  if (sortedPlaces.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">No places found</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div ref={listRef} className="space-y-5">
      {sortedPlaces.map((place) => {
        const isSelected = place.id === selectedPlaceId

        const directionsHref =
          typeof place.latitude === 'number' && typeof place.longitude === 'number'
            ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
            : place.address
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
            : null

        return (
          <div
            key={place.id}
            ref={(el) => {
              cardRefs.current[place.id] = el
            }}
            className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
              isSelected
                ? 'scale-[1.01] border-neutral-900 ring-1 ring-neutral-900 shadow-md'
                : 'border-neutral-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg active:scale-[0.99]'
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedPlaceId(place.id)}
              className="block w-full text-left"
            >
              {place.image_url ? (
                <div className="h-40 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                  No image available
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {place.name}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-600">
                      {place.cuisine || place.type}
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                      {place.city}, {place.state}
                    </p>

                    {userLocation && (
                      <p className="mt-1 text-sm font-medium text-blue-600">
                        {getDistanceMiles(
                          userLocation.lat,
                          userLocation.lng,
                          place.latitude,
                          place.longitude
                        ).toFixed(1)}{' '}
                        miles away
                      </p>
                    )}

                    <p className="mt-2 text-sm text-neutral-500">{place.address}</p>

                    {place.phone && (
                      <p className="mt-1 text-sm text-neutral-500">{place.phone}</p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      place.type === 'restaurant'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {place.type}
                  </span>
                </div>
              </div>
            </button>

            <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
              <Link
                href={`/places/${place.id}`}
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                View Details →
              </Link>

              {directionsHref && (
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
                >
                  Directions
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
