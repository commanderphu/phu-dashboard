import { createContext, useContext } from "react";
import type { MusicProvider } from "@/lib/types";

export interface MusicProviderState {
  provider: MusicProvider;
  loading: boolean;
  error: string | null;
  toggleProvider: (next: MusicProvider) => Promise<void>;
}

// Ein gemeinsamer Zustand für alle Verbraucher. Vorher rief jeder Aufrufer
// den Hook einzeln auf und bekam eine eigene Kopie — der Umschalter wusste
// dann nichts vom Datenhook und umgekehrt.
export const MusicProviderCtx = createContext<MusicProviderState | null>(null);

export function useMusicProvider(): MusicProviderState {
  const ctx = useContext(MusicProviderCtx);
  if (!ctx) {
    throw new Error(
      "useMusicProvider muss innerhalb von <MusicProviderProvider> stehen"
    );
  }
  return ctx;
}
