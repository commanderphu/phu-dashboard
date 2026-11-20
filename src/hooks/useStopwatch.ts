import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { authFetch } from "@/lib/auth";

export type StopwatchEvent = "angekommen" | "am-geraet" | "ende" | "abfahrt";

export interface Stamp {
  id: string;
  event: StopwatchEvent;
  at: string;
  call?: string;
  customer?: string;
  note?: string;
  place?: string;
}

export interface Visit {
  call?: string;
  customer?: string;
  place?: string;
  arrivedAt?: string;
  atDeviceAt?: string;
  endAt?: string;
  departedAt?: string;
  deviceMinutes?: number;
  onSiteMinutes?: number;
  open: boolean;
}

interface DayResponse {
  ok: boolean;
  day: string;
  stamps: Stamp[];
  visits: Visit[];
  current: Visit | null;
}

/** Einsatz-Stoppuhr des Tages (api-hub `/work/stopwatch`, PhuOS Phase 2 Paket 2). */
export function useStopwatch(intervalMs = 60_000) {
  const [data, setData] = useState<DayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const apply = (json: DayResponse) => {
    setData(json);
    setError(null);
    setUpdatedAt(new Date());
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/work/stopwatch`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      apply(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stoppuhr nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  const stamp = useCallback(async (event: StopwatchEvent, input: { call?: string; customer?: string; note?: string } = {}) => {
    setBusy(true);
    try {
      const body = Object.fromEntries(Object.entries(input).filter(([, v]) => v && v.trim()));
      const res = await authFetch(`${API_BASE}/work/stopwatch/${event}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Nicht angemeldet" : `HTTP ${res.status}`);
      apply(await res.json());
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stempel fehlgeschlagen");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setBusy(true);
    try {
      const res = await authFetch(`${API_BASE}/work/stopwatch/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      apply(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }, []);

  return { data, loading, busy, error, updatedAt, stamp, remove, refetch: load };
}
