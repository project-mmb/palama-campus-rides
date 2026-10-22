import { useEffect, useRef } from "react";
import type { Map as LMap, Marker, Polyline } from "leaflet";
import type { Place } from "@/lib/places";

type Props = { pickup?: Place | undefined; dest?: Place | undefined; progress?: number | undefined; className?: string };

export function RideMap({ pickup, dest, progress, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layers = useRef<{ items: (Marker | Polyline)[]; car?: Marker }>({ items: [] });
  const L = useRef<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      L.current = mod.default ?? mod;
      map.current = L.current.map(el.current, { zoomControl: false, attributionControl: true }).setView([-24.6556, 25.9086], 12);
      L.current.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);
      draw();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const l = L.current, m = map.current;
    if (!l || !m) return;
    layers.current.items.forEach((x) => x.remove());
    layers.current.car?.remove();
    layers.current = { items: [] };
    const pin = (cls: string) => l.divIcon({ className: `palama-pin ${cls}`, html: "<span></span>", iconSize: [18, 18] });
    if (pickup) layers.current.items.push(l.marker([pickup.lat, pickup.lng], { icon: pin("pickup") }).addTo(m));
    if (dest) layers.current.items.push(l.marker([dest.lat, dest.lng], { icon: pin("dest") }).addTo(m));
    if (pickup && dest) {
      layers.current.items.push(
        l.polyline([[pickup.lat, pickup.lng], [dest.lat, dest.lng]], { color: "oklch(0.44 0.18 262)", weight: 5, dashArray: "10 10" }).addTo(m),
      );
      m.fitBounds([[pickup.lat, pickup.lng], [dest.lat, dest.lng]], { padding: [60, 60], maxZoom: 15 });
    } else if (pickup || dest) {
      const p = (pickup ?? dest)!;
      m.setView([p.lat, p.lng], 14);
    }
    placeCar();
  }

  function placeCar() {
    const l = L.current, m = map.current;
    if (!l || !m || progress === undefined || !pickup || !dest) return;
    const pos: [number, number] = [
      pickup.lat + (dest.lat - pickup.lat) * progress,
      pickup.lng + (dest.lng - pickup.lng) * progress,
    ];
    if (layers.current.car) layers.current.car.setLatLng(pos);
    else
      layers.current.car = l
        .marker(pos, { icon: l.divIcon({ className: "", html: '<div class="palama-car">🚕</div>', iconSize: [34, 34] }) })
        .addTo(m);
  }

  useEffect(draw, [pickup?.id, dest?.id]);
  useEffect(placeCar, [progress]);

  return <div ref={el} className={className} />;
}
