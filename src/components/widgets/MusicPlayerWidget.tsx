import { useEffect, useRef, useState } from "react";
import { WidgetCard } from "@/ui/WidgetCard";
import { resolveApiUrl } from "@/lib/api";
import type { NowPlaying } from "@/lib/types";

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

interface MusicPlayerWidgetProps {
  nowPlaying: NowPlaying | null;
  loading: boolean;
}

export function MusicPlayerWidget({ nowPlaying, loading }: MusicPlayerWidgetProps) {
  const [localProgress, setLocalProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync localProgress wenn sich nowPlaying ändert
  useEffect(() => {
    if (nowPlaying) {
      setLocalProgress(nowPlaying.progress);
    }
  }, [nowPlaying]);

  // Lokaler Ticker
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (nowPlaying?.isPlaying) {
      intervalRef.current = setInterval(() => {
        setLocalProgress((prev) => Math.min(prev + 100, nowPlaying.duration));
      }, 100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nowPlaying?.isPlaying, nowPlaying?.duration]);

  const progressPct = nowPlaying
    ? Math.min((localProgress / nowPlaying.duration) * 100, 100)
    : 0;

  return (
    <WidgetCard title="Musik" hint="Now Playing" collapsible>
      {loading && <p className="text-sm text-muted">Lädt…</p>}

      {!loading && !nowPlaying && (
        <p className="text-sm text-muted">⏸ Nichts wird abgespielt</p>
      )}

      {!loading && nowPlaying && (
        <div className="flex flex-col gap-3">
          {/* Cover + Info */}
          <div className="flex items-center gap-3">
            {resolveApiUrl(nowPlaying.albumArt) ? (
              <img
                src={resolveApiUrl(nowPlaying.albumArt) ?? undefined}
                alt={nowPlaying.album}
                className="h-16 w-16 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-border shrink-0 flex items-center justify-center text-2xl">
                🎵
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{nowPlaying.title}</p>
              <p className="text-sm text-muted truncate">{nowPlaying.artist}</p>
              <p className="text-xs text-muted truncate">{nowPlaying.album}</p>
            </div>
          </div>

          {/* Progressbar */}
          <div>
            <div className="h-1.5 w-full rounded-full bg-border">
              <div
                className="h-1.5 rounded-full bg-ok transition-all duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>{formatMs(localProgress)}</span>
              <span>{formatMs(nowPlaying.duration)}</span>
            </div>
          </div>

          {/* Status + Provider */}
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{nowPlaying.isPlaying ? "▶ spielt" : "⏸ pausiert"}</span>
            <span className="rounded-full border border-border px-2 py-0.5 capitalize">
              {nowPlaying.source}
            </span>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
