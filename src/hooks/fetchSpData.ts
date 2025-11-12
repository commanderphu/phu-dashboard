import { useEffect, useState, useRef } from "react";

interface SpotifyTrack {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
}

interface SpotifyTopTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  url: string;
}

interface SpotifyData {
  nowPlaying: SpotifyTrack | null;
  topTracks: SpotifyTopTrack[];
  loading: boolean;
  error: string | null;
}

/**
 * useSpotifyData
 * Holt Spotify-Daten + simuliert Song-Fortschritt live
 */
export function useSpotifyData(): SpotifyData {
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTopTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progressRef = useRef<number | null>(null);
  const durationRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // --- Daten holen ---
  async function fetchSpotifyData() {
    try {
      setError(null);
      const [npRes, ttRes] = await Promise.all([
        fetch("https://api.intern.phudevelopement.xyz/api/spotify/now-playing"),
        fetch("https://api.intern.phudevelopement.xyz/api/spotify/top-tracks"),
      ]);

      const [npData, ttData] = await Promise.all([
        npRes.ok ? npRes.json() : null,
        ttRes.ok ? ttRes.json() : null,
      ]);

      if (npData?.track) {
        setNowPlaying(npData.track);
        progressRef.current = npData.track.progress;
        durationRef.current = npData.track.duration;
        isPlayingRef.current = npData.track.isPlaying;
      }

      if (ttData?.tracks) setTopTracks(ttData.tracks);
    } catch (err: any) {
      console.error("Fehler beim Laden der Spotify-Daten:", err);
      setError(err.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  // --- Initial & 15s Intervall ---
  useEffect(() => {
    fetchSpotifyData();
    const interval = setInterval(fetchSpotifyData, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- Lokaler Fortschrittsticker (alle 500ms) ---
  useEffect(() => {
    const tick = setInterval(() => {
      if (
        nowPlaying &&
        isPlayingRef.current &&
        progressRef.current !== null &&
        durationRef.current !== null
      ) {
        progressRef.current += 500; // alle 0.5s erhöhen
        if (progressRef.current > durationRef.current) progressRef.current = durationRef.current;

        setNowPlaying((prev) =>
          prev
            ? {
                ...prev,
                progress: progressRef.current!,
              }
            : prev
        );
      }
    }, 500);

    return () => clearInterval(tick);
  }, [nowPlaying]);

  return { nowPlaying, topTracks, loading, error };
}
