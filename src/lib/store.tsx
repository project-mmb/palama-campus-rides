import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Contact = { id: string; name: string; phone: string };
export type Profile = { name: string; phone: string; universityId: string; studentId: string };
export type Prefs = { autoShare: boolean; womenDriversOnly: boolean; quietRide: boolean };
export type ProviderProfile = {
  registered: boolean;
  name: string;
  vehicle: string;
  plate: string;
  seats: number;
  online: boolean;
};

type State = {
  profile: Profile;
  contacts: Contact[];
  prefs: Prefs;
  provider: ProviderProfile;
};

const initial: State = {
  profile: { name: "", phone: "", universityId: "ub", studentId: "" },
  contacts: [],
  prefs: { autoShare: false, womenDriversOnly: false, quietRide: false },
  provider: { registered: false, name: "", vehicle: "", plate: "", seats: 4, online: false },
};

type Ctx = State & { update: (patch: Partial<State>) => void };
const StoreCtx = createContext<Ctx | null>(null);
const KEY = "palama-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  return (
    <StoreCtx.Provider value={{ ...state, update: (p) => setState((s) => ({ ...s, ...p })) }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
