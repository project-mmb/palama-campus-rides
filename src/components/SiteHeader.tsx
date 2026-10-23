import { Link } from "@tanstack/react-router";
import mark from "@/assets/palama-mark.png.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[1000] glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/settings" aria-label="Palama settings" title="Settings" className="flex items-center gap-2">
          <img src={mark.url} alt="" className="h-9 w-9 rounded-xl" />
          <span className="font-display text-2xl font-bold text-primary">Palama</span>
        </Link>
      </div>
    </header>
  );
}
