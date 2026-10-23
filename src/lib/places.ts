export const MAX_RIDE_KM = 65;
/** Straight-line distance is multiplied by this to estimate road distance. */
export const ROAD_FACTOR = 1.25;
export const AVG_SPEED_KMH = 45;

export type Place = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  kind: "university" | "place";
};

export const UNIVERSITIES: Place[] = [
  { id: "ub", name: "University of Botswana", area: "Gaborone", lat: -24.6603, lng: 25.9334, kind: "university" },
  { id: "biust", name: "Botswana International University of Science & Technology (BIUST)", area: "Palapye", lat: -22.588, lng: 27.125, kind: "university" },
  { id: "buan", name: "Botswana University of Agriculture & Natural Resources (BUAN)", area: "Sebele", lat: -24.5795, lng: 25.9492, kind: "university" },
  { id: "bou", name: "Botswana Open University", area: "Gaborone", lat: -24.6555, lng: 25.9185, kind: "university" },
  { id: "botho-gab", name: "Botho University", area: "Gaborone", lat: -24.6693, lng: 25.9483, kind: "university" },
  { id: "botho-ft", name: "Botho University", area: "Francistown", lat: -21.1745, lng: 27.5072, kind: "university" },
  { id: "limkokwing", name: "Limkokwing University of Creative Technology", area: "Gaborone", lat: -24.6412, lng: 25.9071, kind: "university" },
  { id: "bac", name: "Botswana Accountancy College", area: "Gaborone", lat: -24.6268, lng: 25.9245, kind: "university" },
  { id: "bac-ft", name: "Botswana Accountancy College", area: "Francistown", lat: -21.1608, lng: 27.4996, kind: "university" },
  { id: "baisago", name: "BA ISAGO University", area: "Gaborone", lat: -24.6478, lng: 25.9122, kind: "university" },
  { id: "abm", name: "ABM University College", area: "Gaborone", lat: -24.6545, lng: 25.9098, kind: "university" },
  { id: "gucl", name: "Gaborone University College of Law & Professional Studies", area: "Gaborone", lat: -24.6201, lng: 25.9112, kind: "university" },
  { id: "idm-gab", name: "Institute of Development Management (IDM)", area: "Gaborone", lat: -24.6565, lng: 25.9224, kind: "university" },
  { id: "idm-ft", name: "Institute of Development Management (IDM)", area: "Francistown", lat: -21.1702, lng: 27.5118, kind: "university" },
  { id: "newera", name: "New Era College", area: "Gaborone", lat: -24.6642, lng: 25.9203, kind: "university" },
  { id: "boitekanelo", name: "Boitekanelo College", area: "Gaborone", lat: -24.6497, lng: 25.9004, kind: "university" },
  { id: "imperial", name: "Imperial School of Business & Science", area: "Gaborone", lat: -24.6589, lng: 25.9266, kind: "university" },
  { id: "ihs", name: "Institute of Health Sciences", area: "Gaborone", lat: -24.6524, lng: 25.9302, kind: "university" },
  { id: "ub-ori", name: "UB Okavango Research Institute", area: "Maun", lat: -19.9952, lng: 23.4253, kind: "university" },
];

export const LANDMARKS: Place[] = [
  { id: "mainmall", name: "Main Mall", area: "Gaborone", lat: -24.6556, lng: 25.9086, kind: "place" },
  { id: "gamecity", name: "Game City", area: "Gaborone", lat: -24.6911, lng: 25.8834, kind: "place" },
  { id: "airport", name: "Sir Seretse Khama Airport", area: "Gaborone", lat: -24.5552, lng: 25.9182, kind: "place" },
  { id: "bus-gab", name: "Gaborone Bus Rank", area: "Gaborone", lat: -24.6507, lng: 25.9004, kind: "place" },
  { id: "mogoditshane", name: "Mogoditshane", area: "Kweneng", lat: -24.6268, lng: 25.8656, kind: "place" },
  { id: "tlokweng", name: "Tlokweng", area: "South-East", lat: -24.6669, lng: 25.9744, kind: "place" },
  { id: "molepolole", name: "Molepolole", area: "Kweneng", lat: -24.4066, lng: 25.4951, kind: "place" },
  { id: "mochudi", name: "Mochudi", area: "Kgatleng", lat: -24.3768, lng: 26.1522, kind: "place" },
  { id: "ramotswa", name: "Ramotswa", area: "South-East", lat: -24.8716, lng: 25.8697, kind: "place" },
  { id: "lobatse", name: "Lobatse", area: "South-East", lat: -25.2246, lng: 25.6791, kind: "place" },
  { id: "palapye", name: "Palapye Town", area: "Central", lat: -22.5465, lng: 27.1253, kind: "place" },
  { id: "serowe", name: "Serowe", area: "Central", lat: -22.3875, lng: 26.7108, kind: "place" },
  { id: "francistown", name: "Francistown CBD", area: "North-East", lat: -21.1702, lng: 27.5076, kind: "place" },
  { id: "maun", name: "Maun Village", area: "North-West", lat: -19.9833, lng: 23.4167, kind: "place" },
];

export const ALL_PLACES = [...UNIVERSITIES, ...LANDMARKS];

export function findPlace(id: string) {
  return ALL_PLACES.find((p) => p.id === id);
}

export function straightKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function rideKm(a: Place, b: Place) {
  return straightKm(a, b) * ROAD_FACTOR;
}

export function isWithinLimit(km: number) {
  return km <= MAX_RIDE_KM;
}

export function etaMinutes(km: number) {
  return Math.max(2, Math.round((km / AVG_SPEED_KMH) * 60));
}

/** A spot the rider dropped on the map instead of picking a saved place. */
export function droppedPin(lat: number, lng: number, name = "Dropped pin"): Place {
  return {
    id: `pin-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    name: name.trim() || "Dropped pin",
    area: "",
    lat,
    lng,
    kind: "place",
  };
}

export function isMapPin(p: Place) {
  return p.id.startsWith("pin-");
}

export function formatCoords(p: { lat: number; lng: number }) {
  const ns = p.lat >= 0 ? "N" : "S";
  const ew = p.lng >= 0 ? "E" : "W";
  return `${ns} ${Math.abs(p.lat).toFixed(4)}°, ${ew} ${Math.abs(p.lng).toFixed(4)}°`;
}
