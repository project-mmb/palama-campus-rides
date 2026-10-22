import { describe, expect, it } from "vitest";
import { findPlace, isWithinLimit, rideKm, MAX_RIDE_KM } from "./places";

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
