import { useState } from "react";
import { MapPin } from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import type { Place } from "@/lib/places";

type Props = {
  label: string;
  value: Place | undefined;
  onSelect: (p: Place) => void;
  other: Place | undefined;
  dot: "pickup" | "dest";
};

export function PlacePicker({ label, value, onSelect, other, dot }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-all hover:border-primary/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={`h-3 w-3 shrink-0 rounded-full ${dot === "pickup" ? "bg-primary" : "bg-accent"}`} />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className={`block truncate text-sm font-semibold ${value ? "text-foreground" : "text-muted-foreground"}`}>
            {value ? value.name.trim() || "Dropped pin" : "Tap to choose on the map…"}
          </span>
        </span>
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-primary" />
      </button>

      {open && (
        <MapPicker
          label={label}
          dot={dot}
          value={value}
          other={other}
          onClose={() => setOpen(false)}
          onSelect={(p) => {
            setOpen(false);
            onSelect(p);
          }}
        />
      )}
    </>
  );
}
