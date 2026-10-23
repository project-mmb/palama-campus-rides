import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Car, Clock, GraduationCap, MapPin, Navigation, ShieldCheck, Star, Users, X } from "lucide-react";
import { RideMap } from "@/components/RideMap";
import { PlacePicker } from "@/components/PlacePicker";
import { ShareLocation } from "@/components/ShareLocation";
import {
  etaMinutes, findPlace, isWithinLimit, MAX_RIDE_KM, rideKm, straightKm, UNIVERSITIES, type Place,
} from "@/lib/places";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palama — Student rides across Botswana" },
      { name: "description", content: "Safe, affordable rides between Botswana's universities, campuses and town. Built for students." },
      { property: "og:title", content: "Palama — Student rides across Botswana" },
      { property: "og:description", content: "Safe, affordable rides between Botswana's universities, campuses and town." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Phase = "idle" | "searching" | "matched" | "riding" | "arrived";
const DRIVER = { name: "Kagiso M.", car: "Toyota Vitz · Silver", plate: "B 482 BHK", rating: 4.9, uni: "Driver since 2024" };
const TRIP_SECONDS = 45;

function Home() {
  const { profile } = useStore();
  const [pickup, setPickup] = useState<Place | undefined>(undefined);
  const [dest, setDest] = useState<Place | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pickup && profile.universityId) setPickup(findPlace(profile.universityId));
  }, [profile.universityId, pickup]);
  const km = useMemo(() => (pickup && dest ? rideKm(pickup, dest) : 0), [pickup, dest]);
  const tooFar = km > 0 && !isWithinLimit(km);
  const same = !!pickup && !!dest && straightKm(pickup, dest) < 0.05;

  useEffect(() => {
    if (phase === "searching") { const t = setTimeout(() => setPhase("matched"), 2200); return () => clearTimeout(t); }
    if (phase === "matched") { const t = setTimeout(() => setPhase("riding"), 2500); return () => clearTimeout(t); }
    if (phase === "riding") {
      const start = Date.now();
      const i = setInterval(() => {
        const p = Math.min(1, (Date.now() - start) / (TRIP_SECONDS * 1000));
        setProgress(p);
        if (p >= 1) { clearInterval(i); setPhase("arrived"); }
      }, 250);
      return () => clearInterval(i);
    }
    return undefined;
  }, [phase]);

  const carPos = pickup && dest
    ? { lat: pickup.lat + (dest.lat - pickup.lat) * progress, lng: pickup.lng + (dest.lng - pickup.lng) * progress }
    : { lat: 0, lng: 0 };
  const remaining = km * (1 - progress);
  const inRide = phase !== "idle";

  function reset() { setPhase("idle"); setProgress(0); }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-28 pt-16 md:grid-cols-2 md:pt-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">
              <GraduationCap className="h-4 w-4" /> Made for students
            </span>
            <h1 className="mt-5 text-5xl font-black leading-[1.02] md:text-7xl">Campus to anywhere, <em className="text-accent">sorted.</em></h1>
            <p className="mt-5 max-w-md text-lg opacity-85">
              Palama connects students at {UNIVERSITIES.length} campuses across Botswana with trusted drivers — for any trip up to {MAX_RIDE_KM} km.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold">
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Verified drivers</span>
              <span className="flex items-center gap-2"><Share2Icon /> Live location sharing</span>
              <span className="flex items-center gap-2"><Users className="h-5 w-5 text-accent" /> Student-first pricing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking + map */}
      <section className="mx-auto -mt-20 max-w-6xl px-4 pb-20">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="animate-rise rounded-3xl bg-card p-6 shadow-float [animation-delay:150ms]">
            {!inRide ? (
              <>
                <h2 className="text-2xl font-bold">Where to?</h2>
                <div className="relative mt-5 space-y-3">
                  <PlacePicker label="Collection point" value={pickup} onSelect={setPickup} other={dest} dot="pickup" />
                  <button
                    onClick={() => { setPickup(dest); setDest(pickup); }}
                    aria-label="Swap collection point and destination"
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card p-2 transition-transform hover:rotate-180"
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </button>
                  <PlacePicker label="Destination" value={dest} onSelect={setDest} other={pickup} dot="dest" />
                </div>

                {pickup && dest && !same && (
                  <div key={km} className="mt-5 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <Stat icon={<Navigation className="h-4 w-4" />} label="Distance" value={`${km.toFixed(1)} km`} />
                    <Stat icon={<Clock className="h-4 w-4" />} label="Est. time" value={`${etaMinutes(km)} min`} />
                  </div>
                )}
                {tooFar && (
                  <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                    This trip is about {km.toFixed(0)} km. Palama covers rides up to {MAX_RIDE_KM} km.
                  </p>
                )}
                {same && <p className="mt-4 text-sm text-muted-foreground">Pick two different places.</p>}

                <button
                  disabled={!pickup || !dest || tooFar || same}
                  onClick={() => setPhase("searching")}
                  className="mt-6 w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-float disabled:pointer-events-none disabled:opacity-40"
                >
                  Request ride
                </button>
              </>
            ) : (
              <InRide
                phase={phase}
                km={km}
                remaining={remaining}
                progress={progress}
                 pickupName={pickup?.name ?? ""}
                 destName={dest?.name ?? ""}
                carPos={carPos}
                onCancel={reset}
              />
            )}
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-3xl shadow-float animate-rise [animation-delay:300ms]">
            <RideMap pickup={pickup} dest={dest} progress={phase === "riding" || phase === "arrived" ? progress : undefined} className="absolute inset-0" />
            {phase === "searching" && pickup && (
              <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center">
                <span className="relative block h-6 w-6 rounded-full bg-primary">
                  <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { t: "Tap the map", d: "Search a campus or drop a pin anywhere — set your exact pickup and drop-off in a tap." },
            { t: "Ride with peace of mind", d: "See your distance live and share your location with anyone in one tap." },
            { t: "Drive & earn", d: "Got a car? Become a Palama provider and earn between lectures." },
          ].map((f, i) => (
            <div key={f.t} className="animate-rise rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-soft" style={{ animationDelay: `${400 + i * 120}ms` }}>
              <span className="font-display text-4xl font-black text-accent">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Share2Icon() { return <MapPin className="h-5 w-5 text-accent" />; }

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground/70">{icon}{label}</span>
      <span className="mt-1 block font-display text-2xl font-bold text-secondary-foreground">{value}</span>
    </div>
  );
}

function InRide(props: {
  phase: Phase; km: number; remaining: number; progress: number; pickupName: string; destName: string;
  carPos: { lat: number; lng: number }; onCancel: () => void;
}) {
  const { phase, km, remaining, progress } = props;
  const title = { searching: "Finding your driver…", matched: "Driver on the way", riding: "On your ride", arrived: "You've arrived 🎉", idle: "" }[phase];

  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={props.onCancel} aria-label="Close" className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>

      <div className="mt-4 rounded-2xl bg-hero p-5 text-primary-foreground">
        <p className="text-xs font-bold uppercase tracking-widest opacity-75">Collection point → destination</p>
        <p className="mt-1 font-display text-4xl font-black">{km.toFixed(1)} km</p>
        <p className="mt-1 text-sm opacity-85 line-clamp-1">{props.pickupName} → {props.destName}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold opacity-85">
          <span>{(km - remaining).toFixed(1)} km done</span>
          <span>{remaining.toFixed(1)} km left · {etaMinutes(remaining)} min</span>
        </div>
      </div>

      {phase !== "searching" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border p-4 animate-in fade-in">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground"><Car className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="font-bold">{DRIVER.name} <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-accent text-accent" />{DRIVER.rating}</span></p>
            <p className="text-xs text-muted-foreground">{DRIVER.car} · {DRIVER.plate}</p>
          </div>
        </div>
      )}

      {(phase === "riding" || phase === "matched") && (
        <div className="mt-5">
          <h3 className="mb-3 text-lg font-bold">Share my location</h3>
          <ShareLocation position={props.carPos} destName={props.destName} driver={DRIVER.name} />
        </div>
      )}

      {phase === "arrived" && (
        <button onClick={props.onCancel} className="mt-6 w-full rounded-2xl bg-primary py-4 font-bold text-primary-foreground">Book another ride</button>
      )}
    </div>
  );
}
