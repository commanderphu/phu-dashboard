import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface Briefing {
  ok: boolean;
  text: string;
  /** ISO-Zeitstempel, wann das Briefing verschickt wurde (typisch 04:30). */
  sentAt: string;
}

export function useBriefing() {
  const [data, setData] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/telegram/briefing/last`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: Briefing = await res.json();
      if (!json.ok || !json.text) throw new Error("Kein Briefing verfügbar");

      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, []);

  // Das Briefing wird einmal täglich gebaut — kein Polling nötig.
  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  return { data, loading, error, refetch: fetchBriefing };
}
