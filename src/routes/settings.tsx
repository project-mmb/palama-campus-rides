import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { UNIVERSITIES } from "@/lib/places";
import { useStore, type Prefs } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Palama" },
      { name: "description", content: "Manage your Palama profile, campus, trusted contacts and ride preferences." },
      { property: "og:title", content: "Settings — Palama" },
      { property: "og:description", content: "Manage your Palama profile, campus and trusted contacts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

const field = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function Settings() {
  const { profile, contacts, prefs, update } = useStore();
  const [c, setC] = useState({ name: "", phone: "" });

  const prefRows: { key: keyof Prefs; label: string; desc: string }[] = [
    { key: "autoShare", label: "Auto-share every ride", desc: "Remind me to share my location as soon as a ride starts." },
    { key: "womenDriversOnly", label: "Prefer women drivers", desc: "Match me with women drivers when available." },
    { key: "quietRide", label: "Quiet ride", desc: "Let drivers know you'd rather not chat." },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="animate-rise text-5xl font-black">Settings</h1>

      <Card title="Your profile" delay={100}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={field} placeholder="Full name" value={profile.name} onChange={(e) => update({ profile: { ...profile, name: e.target.value } })} />
          <input className={field} placeholder="Phone" value={profile.phone} onChange={(e) => update({ profile: { ...profile, phone: e.target.value } })} />
          <input className={field} placeholder="Student ID" value={profile.studentId} onChange={(e) => update({ profile: { ...profile, studentId: e.target.value } })} />
          <select className={field} value={profile.universityId} onChange={(e) => update({ profile: { ...profile, universityId: e.target.value } })}>
            {UNIVERSITIES.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.area}</option>)}
          </select>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Your campus is used as the default collection point.</p>
      </Card>

      <Card title="Trusted contacts" delay={200}>
        <p className="mb-3 text-sm text-muted-foreground">People you can share your live ride location with in one tap.</p>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!c.name || !c.phone) return;
            update({ contacts: [...contacts, { id: crypto.randomUUID(), ...c }] });
            setC({ name: "", phone: "" });
            toast.success("Contact added");
          }}
        >
          <input className={field} placeholder="Name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          <input className={field} placeholder="+267 …" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} />
          <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><UserPlus className="h-4 w-4" />Add</button>
        </form>
        <ul className="mt-4 space-y-2">
          {contacts.map((x) => (
            <li key={x.id} className="flex items-center justify-between rounded-xl bg-muted px-4 py-2.5 animate-in fade-in slide-in-from-left-2">
              <span className="text-sm font-semibold">{x.name} <span className="ml-2 font-normal text-muted-foreground">{x.phone}</span></span>
              <button aria-label="Remove" onClick={() => update({ contacts: contacts.filter((y) => y.id !== x.id) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Ride preferences" delay={300}>
        <div className="divide-y divide-border">
          {prefRows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-4 py-3">
              <div><p className="font-semibold">{r.label}</p><p className="text-sm text-muted-foreground">{r.desc}</p></div>
              <Switch checked={prefs[r.key]} onCheckedChange={(v) => update({ prefs: { ...prefs, [r.key]: v } })} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <section className="mt-8 animate-rise rounded-3xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
