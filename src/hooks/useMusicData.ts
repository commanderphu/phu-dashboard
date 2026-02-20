import { useEffect, useState } from "react";
import { useMusicProvider } from "./useMusicProvider";
import type {
  MusicDataResult,
  NowPlaying,
  MusicTrack,
  MusicTopTracksResponse,
} from "@/lib/types";

const API_BASE = "https://api.intern.phudevelopement.xyz";

export function useMusicData(): MusicDataResult {
  const { provider } = useMusicProvider();

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [topTracks, setTopTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchMusic() {
      try {
        setLoading(true);
        setError(null);

        const [npRes, ttRes] = await Promise.all([
          fetch(`${API_BASE}/music/now-playing`),
          fetch(`${API_BASE}/music/top-tracks`),
        ]);

        if (!npRes.ok) throw new Error("Now-Playing konnte nicht geladen werden");
        if (!ttRes.ok) throw new Error("Top-Tracks konnten nicht geladen werden");

        const npJson = await npRes.json();
        const topTracksData: MusicTopTracksResponse = await ttRes.json();

        if (!alive) return;

        // API gibt { playing, provider, now: NowPlaying } zurück
        const nowPlayingData: NowPlaying | null = npJson?.now ?? null;
        setNowPlaying(nowPlayingData);
        setTopTracks(topTracksData.tracks);
        // provider kommt weiter aus useMusicProvider (Single Source of Truth)
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error
            ? e.message
            : "Fehler beim Laden der Musikdaten"
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchMusic();
    return () => {
      alive = false;
    };
  }, [provider]);

  return {
    provider,
    nowPlaying,
    topTracks,
    loading,
    error,
  };
}
