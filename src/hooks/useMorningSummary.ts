import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import type { TodayEvent, TodayTask } from "@/hooks/useWorkmateToday";

export interface MorningSummary {
  generatedAt: string;
  weather: { desc: string; minC: number; maxC: number; rainMm: number } | null;
  nextEvent: TodayEvent | null;
  allDay: string[];
  task: (TodayTask & { more: number }) | null;
  upcomingTask: TodayTask | null;
  notice: { text: string; file: string } | null;
  mail: { label: string; unseen: number }[];
  failed: string[];
}

/** Morning Summary aus dem api-hub (`GET /briefing/summary`, dort 5 min Cache). */
export function useMorningSummary(intervalMs = 300_000) {
  const [data, setData] = useState<MorningSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/briefing/summary${force ? "?refresh=1" : ""}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as MorningSummary & { ok: boolean };
      if (!json.ok) throw new Error("Antwort ohne ok");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summary nicht erreichbar");
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
