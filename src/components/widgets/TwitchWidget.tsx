import { WidgetCard } from "@/ui/WidgetCard";
import type { TwitchData } from "@/lib/types";

interface TwitchWidgetProps {
  data: TwitchData;
}

export function TwitchWidget({ data }: TwitchWidgetProps) {
  const { status, followerCount, loading, error } = data;

  return (
    <WidgetCard title="Twitch" hint="commanderphu" collapsible>
      {loading && <p className="text-sm text-muted">Lädt…</p>}

      {error && <p className="text-xs text-red-400">⚠ {error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            {status?.user?.avatar ? (
              <img
                src={status.user.avatar}
                alt={status.user.display_name}
                className={`h-12 w-12 rounded-full object-cover ring-2 ${
                  status.online ? "ring-red-500" : "ring-border"
                }`}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-border ring-2 ring-border flex items-center justify-center text-xl">
                🎮
              </div>
            )}
            <div className="min-w-0">
              <a
                href="https://twitch.tv/commanderphu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-ok transition-colors"
              >
                {status?.user?.display_name ?? "commanderphu"}
              </a>

              {/* Live-Status */}
              {status?.online ? (
                <div className="flex items-center gap-1.5 text-sm text-red-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE · {status.viewerCount?.toLocaleString("de-DE") ?? "?"} Viewer
                </div>
              ) : (
                <div className="text-sm text-muted">Offline</div>
              )}
            </div>
          </div>

          {/* Follower */}
          {followerCount != null && (
            <div className="text-sm text-muted">
              👥 {followerCount.toLocaleString("de-DE")} Follower
            </div>
          )}

          {/* Beschreibung */}
          {status?.user?.description && (
            <p className="text-xs text-muted line-clamp-2">{status.user.description}</p>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
