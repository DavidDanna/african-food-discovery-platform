'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MapView from '@/components/map/MapView'
import PlacesList from '@/components/places/PlacesList'

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
  tags: string | null
  products: string | null
  hours: string | null
  delivery_available: boolean | null
}

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'restaurant' | 'grocery'>('all')
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchPlaces = async () => {
      setLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (error) {
        setPlaces([])
        setSelectedPlaceId(null)
        setErrorMessage('Could not load places right now. Please try again.')
        setLoading(false)
        return
      }

      const safeData = (data ?? []) as Place[]
      setPlaces(safeData)
      setSelectedPlaceId(safeData[0]?.id ?? null)
      setLoading(false)
    }

    fetchPlaces()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredPlaces = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    return places.filter((place) => {
      const matchesSearch =
        term === '' ||
        (place.name || '').toLowerCase().includes(term) ||
        (place.type || '').toLowerCase().includes(term) ||
        (place.address || '').toLowerCase().includes(term) ||
        (place.city || '').toLowerCase().includes(term) ||
        (place.state || '').toLowerCase().includes(term) ||
        (place.cuisine || '').toLowerCase().includes(term) ||
        (place.tags || '').toLowerCase().includes(term) ||
        (place.products || '').toLowerCase().includes(term)

      const matchesType = typeFilter === 'all' || place.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [places, searchTerm, typeFilter])

  const activeSelectedPlaceId = useMemo(() => {
    if (filteredPlaces.length === 0) return null

    const selectedStillExists = filteredPlaces.some(
      (place) => place.id === selectedPlaceId
    )

    return selectedStillExists ? selectedPlaceId : filteredPlaces[0].id
  }, [filteredPlaces, selectedPlaceId])

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported on this device.')
      return
    }

    setIsLocating(true)
    setErrorMessage(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsLocating(false)
      },
      () => {
        setErrorMessage('Unable to get your location.')
        setIsLocating(false)
      }
    )
  }

  const handleReset = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setUserLocation(null)
    setErrorMessage(null)
    setSelectedPlaceId(places[0]?.id ?? null)
  }

  const resultText = loading
    ? 'Loading places...'
    : `${filteredPlaces.length} ${filteredPlaces.length === 1 ? 'match' : 'matches'}`

  return (
    <main className="h-screen overflow-hidden bg-neutral-50">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-neutral-900">
              African Food Discovery
            </h1>
            <p className="text-sm text-neutral-500">
              Find African food and products near you
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <input
                type="text"
                placeholder="Search jollof, garri, suya, shea butter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  typeFilter === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('restaurant')}
                className={`shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  typeFilter === 'restaurant'
                    ? 'bg-red-600 text-white'
                    : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Restaurants
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('grocery')}
                className={`shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  typeFilter === 'grocery'
                    ? 'bg-green-600 text-white'
                    : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Grocery
              </button>

              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="shrink-0 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLocating ? 'Locating...' : 'Locate Me'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Reset
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid h-[calc(100vh-185px)] grid-cols-1 md:h-[calc(100vh-150px)] md:grid-cols-12">
        <section className="h-[45vh] min-h-0 md:col-span-7 md:h-full">
          <MapView
            places={filteredPlaces}
            selectedPlaceId={activeSelectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </section>

        <aside className="flex h-[55vh] min-h-0 flex-col overflow-hidden border-t border-neutral-200 bg-white md:col-span-5 md:h-full md:border-l md:border-t-0">
          <div className="border-b border-neutral-200 bg-white px-4 py-4 md:px-5">
            <h2 className="text-base font-semibold text-neutral-900">Places</h2>
            <p className="text-sm text-neutral-500">{resultText}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
            {loading ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                Loading places...
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                No places match your current search or filter.
              </div>
            ) : (
              <PlacesList
                places={filteredPlaces}
                selectedPlaceId={activeSelectedPlaceId}
                setSelectedPlaceId={setSelectedPlaceId}
                userLocation={userLocation}
              />
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}