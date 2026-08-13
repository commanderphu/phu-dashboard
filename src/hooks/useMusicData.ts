import { useEffect, useState } from "react";
import { useMusicProvider } from "./useMusicProvider";
import type {
  MusicDataResult,
  NowPlaying,
  MusicTrack,
  MusicTopTracksResponse,
} from "@/lib/types";
import { API_BASE } from "@/lib/api";

export function useMusicData(intervalMs = 20_000): MusicDataResult {
  const { provider } = useMusicProvider();

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [topTracks, setTopTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    // Nur der erste Abruf zeigt "Lädt…" — sonst flackerte die Seite bei
    // jedem Intervall zurück auf den Ladezustand.
    let erstAbruf = true;

    async function fetchMusic() {
      try {
        if (erstAbruf) setLoading(true);
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
        // Der Provider kommt aus dem gemeinsamen Context, nicht aus dieser
        // Antwort — sonst gäbe es zwei Wahrheiten.
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error
            ? e.message
            : "Fehler beim Laden der Musikdaten"
        );
      } finally {
        if (alive) setLoading(false);
        erstAbruf = false;
      }
    }

    fetchMusic();
    const id = setInterval(fetchMusic, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [provider, intervalMs]);

  return {
    provider,
    nowPlaying,
    topTracks,
    loading,
    error,
  };
}
