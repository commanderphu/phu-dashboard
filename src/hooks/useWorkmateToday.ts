import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface TodayTask {
  title: string;
  priority: string;
  /** high oder critical */
  urgent: boolean;
  dueDate: string | null;
}

export interface TodayEvent {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
}

interface WorkmateResponse {
  ok: boolean;
  tasks: TodayTask[];
  events: TodayEvent[];
  /** Welche Teilabfragen im API-Hub fehlgeschlagen sind. */
  failed: string[];
  fetchedAt: string;
}

export function useWorkmateToday(intervalMs = 300_000) {
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [events, setEvents] = useState<TodayEvent[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/workmate/today`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: WorkmateResponse = await res.json();
      if (!json.ok) throw new Error("Antwort ohne ok");

      setTasks(json.tasks ?? []);
      setEvents(json.events ?? []);
      setFailed(json.failed ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Workmate nicht erreichbar");
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

  return { tasks, events, failed, loading, error, refetch: load };
}
