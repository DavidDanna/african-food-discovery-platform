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
}

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'restaurant' | 'grocery'>('all')

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase.from('places').select('*')

      if (!error && data) {
        setPlaces(data)
        if (data.length > 0) {
          setSelectedPlaceId(data[0].id)
        }
      }

      setLoading(false)
    }

    fetchPlaces()
  }, [])

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const search = searchTerm.toLowerCase().trim()

      const matchesSearch =
        search === '' ||
        (place.name || '').toLowerCase().includes(search) ||
        (place.address || '').toLowerCase().includes(search) ||
        (place.city || '').toLowerCase().includes(search) ||
        (place.state || '').toLowerCase().includes(search) ||
        (place.cuisine || '').toLowerCase().includes(search)

      const matchesType =
        typeFilter === 'all' || place.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [places, searchTerm, typeFilter])

  useEffect(() => {
    if (filteredPlaces.length === 0) {
      setSelectedPlaceId(null)
      return
    }

    const selectedStillExists = filteredPlaces.some(
      (place) => place.id === selectedPlaceId
    )

    if (!selectedStillExists) {
      setSelectedPlaceId(filteredPlaces[0].id)
    }
  }, [filteredPlaces, selectedPlaceId])

  const handleLocateMe = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        alert('Unable to get your location.')
      }
    )
  }

  const handleReset = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setUserLocation(null)
    setSelectedPlaceId(places[0]?.id ?? null)
  }

  return (
    <main className="h-screen overflow-hidden bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-neutral-900">
              African Food Discovery
            </h1>
            <p className="text-sm text-neutral-500">
              Discover African restaurants and grocery stores
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <input
                type="text"
                placeholder="Search by name, cuisine, city, or address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
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
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
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
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
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
                className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Locate Me
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid h-[calc(100vh-160px)] grid-cols-1 md:h-[calc(100vh-126px)] md:grid-cols-12">
        <section className="h-[45vh] min-h-0 md:col-span-7 md:h-full">
          <MapView
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </section>

        <aside className="flex min-h-0 h-[55vh] flex-col border-t border-neutral-200 bg-white md:col-span-5 md:h-full md:border-l md:border-t-0">
          <div className="border-b border-neutral-200 bg-white px-4 py-4 md:px-5">
            <h2 className="text-base font-semibold text-neutral-900">Places</h2>
            <p className="text-sm text-neutral-500">
              {loading ? 'Loading places...' : `${filteredPlaces.length} locations`}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
            {loading ? (
              <div className="p-4 text-sm text-neutral-500">Loading...</div>
            ) : (
              <PlacesList
                places={filteredPlaces}
                selectedPlaceId={selectedPlaceId}
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