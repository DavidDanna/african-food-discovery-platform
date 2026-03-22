import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params

  const { data: place, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !place) {
    notFound()
  }

  const directionsHref =
    place.latitude && place.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
      : place.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
        : null

  const phoneHref = place.phone ? `tel:${place.phone}` : null

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          {place.image_url ? (
            <div className="relative h-72 w-full sm:h-96">
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="mb-3 flex flex-wrap gap-2">
                  {place.type && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        place.type === 'restaurant'
                          ? 'bg-red-500/90 text-white'
                          : 'bg-green-500/90 text-white'
                      }`}
                    >
                      {place.type}
                    </span>
                  )}

                  {place.cuisine && (
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                      {place.cuisine}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-white sm:text-5xl">
                  {place.name}
                </h1>

                {place.address && (
                  <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
                    {place.address}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-neutral-100 text-neutral-400 sm:h-96">
              No image available
            </div>
          )}

          <div className="space-y-8 p-6 sm:p-8">
            <div className="hidden gap-3 sm:flex">
              {phoneHref && (
                <a
                  href={phoneHref}
                  className="flex-1 rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Call
                </a>
              )}

              {directionsHref && (
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100"
                >
                  Directions
                </a>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Category</p>
                <p className="mt-1 font-semibold text-neutral-900">
                  {place.type || 'Not listed'}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Cuisine</p>
                <p className="mt-1 font-semibold text-neutral-900">
                  {place.cuisine || 'Not listed'}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="mt-1 font-semibold text-neutral-900">
                  {place.phone || 'Not available'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-neutral-200 p-5">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">
                  About
                </h2>
                <p className="leading-7 text-neutral-700">
                  {place.description || 'No description available yet.'}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-5">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">
                  Location
                </h2>

                {place.address ? (
                  <p className="text-sm leading-6 text-neutral-700">
                    {place.address}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500">Address not available</p>
                )}

                {directionsHref && (
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white p-4 sm:hidden">
        <div className="flex gap-3">
          {phoneHref && (
            <a
              href={phoneHref}
              className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Call
            </a>
          )}

          {directionsHref && (
            <a
              href={directionsHref}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-800"
            >
              Directions
            </a>
          )}
        </div>
      </div>
    </main>
  )
}