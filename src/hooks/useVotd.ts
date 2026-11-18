import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface Votd {
  date: string;
  reference: string | null;
  text: string;
}

export function useVotd(intervalMs = 300_000) {
  const [votd, setVotd] = useState<Votd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/votd/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: Votd | null = await res.json();
      setVotd(json);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Spruch des Tages nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { votd, loading, error, updatedAt, refetch: load };
}
