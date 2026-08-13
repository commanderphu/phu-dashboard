import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface LiveStream {
  id: string;
  login: string;
  displayName: string;
  title: string;
  gameName: string;
  viewerCount: number;
  startedAt: string;
  /** Enthält {width}x{height} als Platzhalter — siehe thumbnail(). */
  thumbnailUrl: string;
}

interface LiveFollowsResponse {
  ok: boolean;
  total: number;
  streams: LiveStream[];
}

/** Twitch liefert die Vorschau mit Platzhaltern statt fester Größe. */
export function thumbnail(url: string, width = 320, height = 180): string {
  return url.replace("{width}", String(width)).replace("{height}", String(height));
}

/** "Läuft seit 2:14 h" */
export function laufzeit(startedAt: string): string {
  const min = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
  if (!Number.isFinite(min) || min < 0) return "";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")} h`;
}

export function useLiveFollows(intervalMs = 120_000) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/twitch/follows/live`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: LiveFollowsResponse = await res.json();
      if (!json.ok) throw new Error("Twitch antwortete ohne ok");

      // Die größten Streams zuerst — wer 2000 Zuschauer hat, ist eher das,
      // wonach man sucht, als der Kanal mit dreien.
      setStreams(
        [...(json.streams ?? [])].sort((a, b) => b.viewerCount - a.viewerCount)
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Live-Kanäle nicht abrufbar");
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

  return { streams, loading, error, refetch: load };
}
