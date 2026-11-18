import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface HomeSummary {
  generatedAt: string;
  weightKg: { value: number; at: string } | null;
  steps: { value: number; at: string } | null;
  car: { parkedAt: string | null; lat: number; lon: number } | null;
  tripPurpose: string | null;
  phoneBattery: { percent: number; charging: boolean } | null;
  failed: string[];
}

/** Ausgewählte Home-Assistant-Zustände über den api-hub (`GET /home/summary`, nur lesend). */
export function useHomeSummary(intervalMs = 120_000) {
  const [data, setData] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/home/summary${force ? "?refresh=1" : ""}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as HomeSummary & { ok: boolean };
      if (!json.ok) throw new Error("Antwort ohne ok");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Home Assistant nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(), intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { data, loading, error, refetch: () => load(true) };
}
