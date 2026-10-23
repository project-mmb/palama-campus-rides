import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MapPin, Navigation, Power, X } from "lucide-react";
import { toast } from "sonner";
import { findPlace, MAX_RIDE_KM, rideKm } from "@/lib/places";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Drive with Palama — Providers" },
      { name: "description", content: "Offer rides to students across Botswana. Go online, accept trips and earn." },
      { property: "og:title", content: "Drive with Palama — Providers" },
      { property: "og:description", content: "Offer rides to students across Botswana and earn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Provider,
});

const field = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

const SAMPLE_REQUESTS = [
  { id: "r1", rider: "Lesedi T.", from: "ub", to: "gamecity" },
  { id: "r2", rider: "Onalenna K.", from: "buan", to: "mainmall" },
  { id: "r3", rider: "Thato P.", from: "limkokwing", to: "airport" },
  { id: "r4", rider: "Neo B.", from: "botho-gab", to: "mochudi" },
];

function Provider() {
  const { provider, update } = useStore();
  const [form, setForm] = useState({ name: provider.name, vehicle: provider.vehicle, plate: provider.plate, seats: provider.seats });
  const [handled, setHandled] = useState<Record<string, "accepted" | "declined">>({});

  if (!provider.registered) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2">
        <div className="animate-rise">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Palama providers</span>
          <h1 className="mt-3 text-5xl font-black leading-tight md:text-6xl">Your car. Your hours. <em className="text-primary">Student fares.</em></h1>
          <p className="mt-4 max-w-md text-muted-foreground">Offer rides between campuses and town. Trips are always within {MAX_RIDE_KM} km, so you're never far from home.</p>
        </div>
        <form
          className="animate-rise rounded-3xl bg-card p-6 shadow-float [animation-delay:150ms]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.vehicle || !form.plate) { toast.error("Please fill in all fields"); return; }
            update({ provider: { ...provider, ...form, registered: true } });
            toast.success("Welcome to Palama!");
          }}
        >
          <h2 className="text-2xl font-bold">Become a provider</h2>
          <div className="mt-5 space-y-3">
            <input className={field} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={field} placeholder="Vehicle (e.g. Toyota Vitz, Silver)" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} />
            <input className={field} placeholder="Number plate (e.g. B 123 ABC)" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
            <label className="block text-sm font-semibold">Seats available
              <select className={`${field} mt-1`} value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6, 7, 14].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <button className="mt-6 w-full rounded-2xl bg-primary py-4 font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-float">Start driving</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-rise">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Dumela, {provider.name.split(" ")[0]}</p>
          <h1 className="text-4xl font-black">Provider dashboard</h1>
          <p className="text-sm text-muted-foreground">{provider.vehicle} · {provider.plate} · {provider.seats} seats</p>
        </div>
        <button
          onClick={() => update({ provider: { ...provider, online: !provider.online } })}
          className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all ${provider.online ? "bg-success text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}
        >
          <Power className="h-4 w-4" /> {provider.online ? "Online" : "Go online"}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 animate-rise [animation-delay:100ms]">
        {[
          ["Trips accepted", Object.values(handled).filter((v) => v === "accepted").length],
          ["Max distance", `${MAX_RIDE_KM} km`],
          ["Status", provider.online ? "Live" : "Offline"],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl bg-card p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{l}</p>
            <p className="mt-1 font-display text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold">Ride requests</h2>
      {!provider.online ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Go online to see students requesting rides near you.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {SAMPLE_REQUESTS.map((r, i) => {
            const from = findPlace(r.from)!, to = findPlace(r.to)!;
            const km = rideKm(from, to);
            const state = handled[r.id];
            return (
              <li key={r.id} className={`flex flex-wrap items-center gap-4 rounded-2xl bg-card p-5 shadow-soft animate-in fade-in slide-in-from-bottom-3 transition-opacity ${state === "declined" ? "opacity-40" : ""}`} style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold">{r.rider}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" />{from.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-accent" />{to.name}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground"><Navigation className="h-3.5 w-3.5" />{km.toFixed(1)} km</span>
                {state ? (
                  <span className="text-sm font-bold capitalize text-muted-foreground">{state}</span>
                ) : (
                  <span className="flex gap-2">
                    <button aria-label="Decline" onClick={() => setHandled({ ...handled, [r.id]: "declined" })} className="rounded-full border border-border p-2.5 hover:bg-muted"><X className="h-4 w-4" /></button>
                    <button aria-label="Accept" onClick={() => { setHandled({ ...handled, [r.id]: "accepted" }); toast.success(`Heading to ${from.name}`); }} className="rounded-full bg-primary p-2.5 text-primary-foreground transition-transform hover:scale-110"><Check className="h-4 w-4" /></button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <button onClick={() => update({ provider: { ...provider, registered: false, online: false } })} className="mt-10 text-sm text-muted-foreground underline">Edit vehicle details</button>
    </div>
  );
}
