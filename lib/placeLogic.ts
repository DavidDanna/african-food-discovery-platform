export type PlaceType = "restaurant" | "grocery";

export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  cuisine?: string | null;
};

export function filterPlaces(
  places: Place[],
  query: string,
  typeFilter: "all" | PlaceType = "all"
): Place[] {
  const normalizedQuery = query.trim().toLowerCase();

  return places.filter((place) => {
    const matchesType = typeFilter === "all" || place.type === typeFilter;

    const searchableText = [
      place.name,
      place.type,
      place.address,
      place.city,
      place.state,
      place.cuisine ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesType && matchesQuery;
  });
}

export function calculateDistanceMiles(
  userLat: number,
  userLng: number,
  placeLat: number,
  placeLng: number
): number {
  const earthRadiusMiles = 3958.8;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(placeLat - userLat);
  const dLng = toRadians(placeLng - userLng);

  const lat1 = toRadians(userLat);
  const lat2 = toRadians(placeLat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusMiles * c).toFixed(2));
}

export function sortPlacesByDistance(
  places: Place[],
  userLat: number,
  userLng: number
): Array<Place & { distanceMiles: number }> {
  return places
    .map((place) => ({
      ...place,
      distanceMiles: calculateDistanceMiles(
        userLat,
        userLng,
        place.latitude,
        place.longitude
      ),
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}