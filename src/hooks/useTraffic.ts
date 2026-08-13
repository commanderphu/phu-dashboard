import { useCallback, useEffect, useState } from "react";
import { fetchTraffic } from "@/lib/autobahn";
import type { TrafficResult } from "@/lib/autobahn";

export function useTraffic(intervalMs = 300_000) {
  const [data, setData] = useState<TrafficResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchTraffic();
      setData(result);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verkehrsdaten nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }, []);

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

  return { data, loading, error, updatedAt, refetch: load };
}
