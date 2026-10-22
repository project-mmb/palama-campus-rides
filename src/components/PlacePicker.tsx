import { UNIVERSITIES, LANDMARKS } from "@/lib/places";

type Props = { label: string; value: string; onChange: (v: string) => void; dot: "pickup" | "dest" };

export function PlacePicker({ label, value, onChange, dot }: Props) {
  return (
    <label className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-all focus-within:border-primary focus-within:shadow-soft">
      <span className={`h-3 w-3 shrink-0 rounded-full ${dot === "pickup" ? "bg-primary" : "bg-accent"}`} />
      <span className="flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold outline-none"
        >
          <option value="">Choose a place…</option>
          <optgroup label="Universities & colleges">
            {UNIVERSITIES.map((u) => (
              <option key={u.id} value={u.id}>{u.name} — {u.area}</option>
            ))}
          </optgroup>
          <optgroup label="Popular places">
            {LANDMARKS.map((u) => (
              <option key={u.id} value={u.id}>{u.name} — {u.area}</option>
            ))}
          </optgroup>
        </select>
      </span>
    </label>
  );
}
