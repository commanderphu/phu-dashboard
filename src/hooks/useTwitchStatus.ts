import { useEffect, useState } from "react";
import type { TwitchData, TwitchStatus } from "@/lib/types";
import { API_BASE } from "@/lib/api";

export function useTwitchStatus(intervalMs = 60_000): TwitchData {
  const [status, setStatus] = useState<TwitchStatus | null>(null);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchTwitch() {
      try {
        const [statusRes, followersRes] = await Promise.all([
          fetch(`${API_BASE}/twitch/`),
          fetch(`${API_BASE}/twitch/followers`),
        ]);

        if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
        if (!followersRes.ok) throw new Error(`HTTP ${followersRes.status}`);

        const statusJson: TwitchStatus = await statusRes.json();
        const followersJson: { count: number } = await followersRes.json();

        if (!alive) return;
        setStatus(statusJson);
        setFollowerCount(followersJson.count);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Fehler");
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchTwitch();
    const id = setInterval(fetchTwitch, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { status, followerCount, loading, error };
}
