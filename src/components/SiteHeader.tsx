import { Link } from "@tanstack/react-router";
import mark from "@/assets/palama-mark.png.asset.json";

const links = [
  { to: "/", label: "Ride" },
  { to: "/provider", label: "Drive" },
  { to: "/settings", label: "Settings" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[1000] glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={mark.url} alt="" className="h-9 w-9 rounded-xl" />
          <span className="font-display text-2xl font-bold text-primary">Palama</span>
        </Link>
        <nav className="flex gap-1 rounded-full bg-muted p-1 text-sm font-semibold">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="rounded-full px-4 py-1.5 text-muted-foreground transition-all hover:text-foreground"
              activeProps={{ className: "bg-primary !text-primary-foreground shadow-soft" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
