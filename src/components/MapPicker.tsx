import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LeafletMouseEvent, Map as LMap, Marker } from "leaflet";
import { Crosshair, Loader2, Search, X } from "lucide-react";
import {
  ALL_PLACES,
  MAX_RIDE_KM,
  ROAD_FACTOR,
  droppedPin,
  etaMinutes,
  formatCoords,
  isMapPin,
  straightKm,
  type Place,
} from "@/lib/places";

type Props = {
  label: string;
  dot: "pickup" | "dest";
  value: Place | undefined;
  other: Place | undefined;
  onSelect: (p: Place) => void;
  onClose: () => void;
};

const CENTER: [number, number] = [-24.6556, 25.9086];
const BOTSWANA: [[number, number], [number, number]] = [
  [-27.3, 19.6],
  [-17.3, 29.6],
];

export function MapPicker({ label, dot, value, other, onSelect, onClose }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const pin = useRef<Marker | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const search = useRef<HTMLInputElement>(null);

  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Place | undefined>(value);
  const [q, setQ] = useState("");
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");

  const choose = useCallback((p: Place, fly: boolean) => {
    setSelected(p);
    setQ("");
    const m = map.current;
    if (fly && m) m.flyTo([p.lat, p.lng], Math.max(m.getZoom(), 15), { duration: 0.7 });
  }, []);

  // Build the map once the picker opens (Leaflet is browser-only).
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      const l = mod.default ?? mod;
      L.current = l;
      const m = l.map(el.current, {
        zoomControl: true,
        attributionControl: true,
        maxBounds: BOTSWANA,
        maxBoundsViscosity: 0.75,
      });
      m.setView(value ? [value.lat, value.lng] : CENTER, value ? 15 : 11);
      l.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(m);
      m.on("click", (e: LeafletMouseEvent) => choose(droppedPin(e.latlng.lat, e.latlng.lng), false));
      map.current = m;
      setReady(true);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      pin.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the draggable pin marker in step with the current selection.
  useEffect(() => {
    const l = L.current;
    const m = map.current;
    if (!l || !m) return;
    if (!selected) {
      pin.current?.remove();
      pin.current = null;
      return;
    }
    if (!pin.current) {
      const marker = l
        .marker([selected.lat, selected.lng], {
          draggable: true,
          icon: l.divIcon({ className: `palama-pin ${dot}`, html: "<span></span>", iconSize: [18, 18] }),
        })
        .addTo(m);
      marker.on("dragend", () => {
        const ll = marker.getLatLng();
        setSelected((s) => droppedPin(ll.lat, ll.lng, s && isMapPin(s) ? s.name : "Dropped pin"));
      });
      pin.current = marker;
    } else {
      pin.current.setLatLng([selected.lat, selected.lng]);
    }
  }, [selected, dot, ready]);

  // Lock page scroll behind the dialog and close on Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    search.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = t ? ALL_PLACES.filter((p) => `${p.name} ${p.area}`.toLowerCase().includes(t)) : ALL_PLACES;
    return list.slice(0, 40);
  }, [q]);

  const km = selected && other ? straightKm(other, selected) * ROAD_FACTOR : 0;
  const tooFar = km > MAX_RIDE_KM;
  const dupe = !!selected && !!other && straightKm(other, selected) < 0.05;

  function useMyLocation() {
    if (!navigator.geolocation) {
      setNote("This browser can't share a location — tap the map to drop a pin instead.");
      return;
    }
    setLocating(true);
    setNote("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choose(droppedPin(pos.coords.latitude, pos.coords.longitude, "My location"), true);
      },
      () => {
        setLocating(false);
        setNote("Couldn't read your location — tap the map to drop a pin instead.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-foreground/45 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-6"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Choose ${label.toLowerCase()} on the map`}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-float animate-in fade-in slide-in-from-bottom-8 duration-300 sm:h-[660px] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${dot === "pickup" ? "bg-primary" : "bg-accent"}`} />
              {label}
            </span>
            <h3 className="mt-1 truncate text-xl font-bold">Find your spot on the map</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close map"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="relative isolate min-h-[260px] flex-1 md:order-2">
            <div ref={el} className="absolute inset-0" />
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="glass absolute left-3 top-3 z-[900] inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4 text-primary" />}
              Use my location
            </button>
            <p className="glass pointer-events-none absolute bottom-3 left-1/2 z-[900] -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-soft">
              Tap the map to drop a pin, then drag it to fine-tune
            </p>
          </div>

          <div className="flex min-h-0 w-full flex-col border-t border-border md:order-1 md:w-80 md:border-r md:border-t-0">
            <div className="p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={search}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search campus or town"
                  aria-label="Search campuses and towns"
                  className="w-full bg-transparent text-sm outline-none"
                />
                {q && (
                  <button onClick={() => setQ("")} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {note && <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{note}</p>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No match — drop a pin on the map instead.</p>
              )}
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => choose(p, true)}
                  className={`flex w-full items-start gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                    selected?.id === p.id ? "bg-secondary" : ""
                  }`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${p.kind === "university" ? "bg-primary" : "bg-accent"}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.area}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          {selected ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                {isMapPin(selected) ? (
                  <input
                    value={selected.name}
                    onChange={(e) => setSelected((s) => (s ? { ...s, name: e.target.value } : s))}
                    placeholder="Name this spot (optional)"
                    aria-label="Name this spot"
                    className="w-full max-w-xs rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                  />
                ) : (
                  <p className="truncate text-base font-bold">{selected.name}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {isMapPin(selected) ? formatCoords(selected) : selected.area}
                  {other && km > 0 ? ` · ${km.toFixed(1)} km · ${etaMinutes(km)} min` : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  if (selected) onSelect(selected);
                }}
                disabled={!selected || tooFar || dupe}
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-float disabled:pointer-events-none disabled:opacity-40"
              >
                Use this spot
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Search a campus, tap the map, or use my location to set your {label.toLowerCase()}.
            </p>
          )}
          {tooFar && (
            <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              That's about {km.toFixed(0)} km from {other?.name}. Palama covers rides up to {MAX_RIDE_KM} km.
            </p>
          )}
          {dupe && (
            <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              That's the same as your other stop — pick a different spot.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}