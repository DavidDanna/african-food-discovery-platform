'use client'

import { useEffect, useState } from 'react'
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

  return (
    <main className="h-screen overflow-hidden bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">
              African Food Discovery
            </h1>
            <p className="text-sm text-neutral-500">
              Discover African restaurants and grocery stores
            </p>
          </div>
        </div>
      </header>

      <div className="grid h-[calc(100vh-64px)] grid-cols-1 md:grid-cols-5">
        <section className="h-[45vh] min-h-0 md:col-span-3 md:h-full">
          <div className="h-full overflow-hidden">
            <MapView
              places={places}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={setSelectedPlaceId}
            />
          </div>
        </section>

        <aside className="flex h-[55vh] flex-col border-t border-neutral-200 bg-white md:col-span-2 md:h-full md:border-l md:border-t-0">
          <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-4 md:px-5">
            <h2 className="text-base font-semibold text-neutral-900">
              Places
            </h2>
            <p className="text-sm text-neutral-500">
              {loading ? 'Loading places...' : `${places.length} locations`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
            {loading ? (
              <div className="p-4 text-sm text-neutral-500">Loading...</div>
            ) : (
              <PlacesList
                places={places}
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