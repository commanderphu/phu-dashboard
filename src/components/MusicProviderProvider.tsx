import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { MusicProvider } from "@/lib/types";
import { API_BASE } from "@/lib/api";
import { MusicProviderCtx } from "@/hooks/useMusicProvider";

const DEFAULT_PROVIDER: MusicProvider = "spotify";

export function MusicProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<MusicProvider>(DEFAULT_PROVIDER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProvider = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/music/provider`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.provider === "spotify" || data.provider === "navidrome") {
        setProvider(data.provider);
        setError(null);
      }
    } catch (e) {
      // Vorher wurde hier stillschweigend geschluckt — dadurch blieb der
      // Provider dauerhaft auf dem Standardwert, ohne dass es auffiel.
      setError(e instanceof Error ? e.message : "Provider nicht abrufbar");
    }
  }, []);

  const toggleProvider = useCallback(async (next: MusicProvider) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/music/provider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Der Server entscheidet, was gilt — nicht die lokale Annahme.
      const data = await res.json();
      setProvider(data.provider ?? next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wechsel fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const value = useMemo(
    () => ({ provider, loading, error, toggleProvider }),
    [provider, loading, error, toggleProvider]
  );

  return (
    <MusicProviderCtx.Provider value={value}>
      {children}
    </MusicProviderCtx.Provider>
  );
}
