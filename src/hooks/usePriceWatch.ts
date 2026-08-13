import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface PriceEntry {
  name: string;
  price: number | null;
  /** Zielmarke, falls für diesen Artikel eine gesetzt ist. */
  threshold?: number;
  triggered: boolean;
  url: string;
}

interface PriceResponse {
  ok: boolean;
  items: PriceEntry[];
  fetchedAt: string;
  cached: boolean;
}

export function usePriceWatch(intervalMs = 1_800_000) {
  const [items, setItems] = useState<PriceEntry[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/price-alert`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: PriceResponse = await res.json();
      if (!json.ok) throw new Error("Preisabfrage ohne ok");

      // Erreichte Zielmarken zuerst, dann alles mit Zielmarke.
      setItems(
        [...(json.items ?? [])].sort((a, b) => {
          if (a.triggered !== b.triggered) return a.triggered ? -1 : 1;
          const aZiel = a.threshold !== undefined;
          const bZiel = b.threshold !== undefined;
          if (aZiel !== bZiel) return aZiel ? -1 : 1;
          return 0;
        })
      );
      setFetchedAt(json.fetchedAt);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preise nicht abrufbar");
    } finally {
      setLoading(false);
    }
  }, []);

  // Die API puffert 30 Minuten — öfter zu fragen bringt nichts.
  useEffect(() => {
    let alive = true;
    const run = () => {
      if (alive) load();
    };

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return { items, fetchedAt, loading, error, refetch: load };
}
