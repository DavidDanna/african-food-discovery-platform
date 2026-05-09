import { describe, expect, it } from "vitest";
import {
  calculateDistanceMiles,
  filterPlaces,
  Place,
  sortPlacesByDistance,
} from "../lib/placeLogic";

const samplePlaces: Place[] = [
  {
    id: "1",
    name: "Accra Palace Restaurant",
    type: "restaurant",
    address: "100 Main St",
    city: "Silver Spring",
    state: "MD",
    latitude: 38.9907,
    longitude: -77.0261,
    cuisine: "Ghanaian",
  },
  {
    id: "2",
    name: "African Market DMV",
    type: "grocery",
    address: "200 Market Rd",
    city: "Hyattsville",
    state: "MD",
    latitude: 38.9559,
    longitude: -76.9455,
    cuisine: null,
  },
  {
    id: "3",
    name: "Lagos Grill",
    type: "restaurant",
    address: "300 Food Ave",
    city: "Washington",
    state: "DC",
    latitude: 38.9072,
    longitude: -77.0369,
    cuisine: "Nigerian",
  },
];

describe("filterPlaces", () => {
  it("returns all places when query is empty and type filter is all", () => {
    const result = filterPlaces(samplePlaces, "", "all");

    expect(result).toHaveLength(3);
  });

  it("filters places by restaurant type", () => {
    const result = filterPlaces(samplePlaces, "", "restaurant");

    expect(result).toHaveLength(2);
    expect(result.every((place) => place.type === "restaurant")).toBe(true);
  });

  it("filters places by keyword across name, city, state, and cuisine", () => {
    const result = filterPlaces(samplePlaces, "ghanaian", "all");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Accra Palace Restaurant");
  });
});

describe("calculateDistanceMiles", () => {
  it("calculates distance between two coordinate pairs", () => {
    const distance = calculateDistanceMiles(
      38.9072,
      -77.0369,
      38.9907,
      -77.0261
    );

    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(7);
  });

  it("returns zero when user and place coordinates are the same", () => {
    const distance = calculateDistanceMiles(
      38.9072,
      -77.0369,
      38.9072,
      -77.0369
    );

    expect(distance).toBe(0);
  });
});

describe("sortPlacesByDistance", () => {
  it("sorts places from nearest to farthest based on user location", () => {
    const result = sortPlacesByDistance(samplePlaces, 38.9072, -77.0369);

    expect(result[0].name).toBe("Lagos Grill");
    expect(result[0].distanceMiles).toBe(0);
    expect(result[2].distanceMiles).toBeGreaterThan(result[1].distanceMiles);
  });
});