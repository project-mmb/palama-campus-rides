import { describe, expect, it } from "vitest";
import {
  droppedPin,
  findPlace,
  formatCoords,
  isMapPin,
  isWithinLimit,
  MAX_RIDE_KM,
  rideKm,
} from "./places";

describe("ride distance limit", () => {
  it("caps rides at 65 km", () => {
    expect(MAX_RIDE_KM).toBe(65);
    expect(isWithinLimit(65)).toBe(true);
    expect(isWithinLimit(65.1)).toBe(false);
  });
  it("allows UB to Main Mall", () => {
    expect(isWithinLimit(rideKm(findPlace("ub")!, findPlace("mainmall")!))).toBe(true);
  });
  it("blocks UB Gaborone to BIUST Palapye", () => {
    expect(isWithinLimit(rideKm(findPlace("ub")!, findPlace("biust")!))).toBe(false);
  });
});

describe("map-dropped pins", () => {
  it("applies the 65 km rule to a pin dropped on the map", () => {
    const ub = findPlace("ub")!;
    expect(isWithinLimit(rideKm(ub, droppedPin(-24.6, 25.9)))).toBe(true);
    expect(isWithinLimit(rideKm(ub, droppedPin(-24.0, 25.0)))).toBe(false);
  });
  it("lets a dropped pin be named, and falls back to a default name", () => {
    const named = droppedPin(-24.6556, 25.9086, "Main Gate");
    expect(named.name).toBe("Main Gate");
    expect(isMapPin(named)).toBe(true);
    expect(isMapPin(findPlace("ub")!)).toBe(false);
    expect(droppedPin(-24.6556, 25.9086, "   ").name).toBe("Dropped pin");
  });
  it("shows a dropped pin's coordinates to the rider", () => {
    expect(formatCoords({ lat: -24.6556, lng: 25.9086 })).toBe("S 24.6556°, E 25.9086°");
  });
});
