import { useState } from "react";
import { Copy, MessageCircle, Send, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

type Props = { position: { lat: number; lng: number }; destName: string; driver: string };

export function ShareLocation({ position, destName, driver }: Props) {
  const { contacts } = useStore();
  const [phone, setPhone] = useState("");
  const link = `https://maps.google.com/?q=${position.lat.toFixed(5)},${position.lng.toFixed(5)}`;
  const text = `I'm on a Palama ride with ${driver}, heading to ${destName}. My live location: ${link}`;
  const clean = (p: string) => p.replace(/[^\d]/g, "");
  const wa = (p: string) => `https://wa.me/${clean(p)}?text=${encodeURIComponent(text)}`;
  const sms = (p: string) => `sms:${p}?&body=${encodeURIComponent(text)}`;

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: "My Palama ride", text }); } catch {}
    } else copy();
  }
  async function copy() {
    await navigator.clipboard.writeText(text);
    toast.success("Location link copied");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={nativeShare} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
          <Share2 className="h-4 w-4" /> Share with anyone
        </button>
        <button onClick={copy} aria-label="Copy link" className="rounded-xl border border-border px-4 transition-colors hover:bg-muted">
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {contacts.length > 0 ? (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
              <span className="text-sm font-semibold">{c.name}<span className="block text-xs font-normal text-muted-foreground">{c.phone}</span></span>
              <span className="flex gap-1">
                <a href={wa(c.phone)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg bg-success p-2 text-primary-foreground"><MessageCircle className="h-4 w-4" /></a>
                <a href={sms(c.phone)} aria-label="SMS" className="rounded-lg bg-primary p-2 text-primary-foreground"><Smartphone className="h-4 w-4" /></a>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Any number, e.g. +267 71 234 567" className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
        <a href={phone ? wa(phone) : undefined} target="_blank" rel="noreferrer" aria-disabled={!phone} className={`flex items-center rounded-xl bg-accent px-3 text-accent-foreground ${phone ? "" : "pointer-events-none opacity-50"}`}>
          <Send className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
