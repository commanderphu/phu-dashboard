import { Users } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { useLiveFollows, thumbnail, laufzeit } from "@/hooks/useLiveFollows";
import type { LiveStream } from "@/hooks/useLiveFollows";

function Eintrag({ s }: { s: LiveStream }) {
  return (
    <li>
      <a
        href={`https://twitch.tv/${s.login}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-ok/40 hover:bg-elev"
      >
        <div className="relative shrink-0">
          <img
            src={thumbnail(s.thumbnailUrl, 160, 90)}
            alt=""
            loading="lazy"
            className="h-12 w-20 rounded-md object-cover"
          />
          <span className="absolute bottom-0.5 left-0.5 rounded bg-danger px-1 text-[9px] font-bold leading-tight text-fg">
            LIVE
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{s.displayName}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-danger">
              <Users className="h-3 w-3" />
              {s.viewerCount.toLocaleString("de-DE")}
            </span>
          </div>
          <p className="truncate text-xs text-muted" title={s.title}>
            {s.title}
          </p>
          <p className="truncate text-[11px] text-subtle">
            {s.gameName}
            {laufzeit(s.startedAt) && ` · seit ${laufzeit(s.startedAt)}`}
          </p>
        </div>
      </a>
    </li>
  );
}

export function LiveFollowsWidget({ max = 5 }: { max?: number }) {
  const { streams, loading, error } = useLiveFollows();

  return (
    <WidgetCard
      title="Jetzt live"
      hint={streams.length ? `${streams.length} Kanäle` : "deine Follows"}
      collapsible
    >
      {loading && streams.length === 0 && (
        <p className="text-sm text-muted">Lädt…</p>
      )}

      {error && streams.length === 0 && (
        <p className="text-xs text-danger">⚠ {error}</p>
      )}

      {!loading && !error && streams.length === 0 && (
        <p className="text-sm text-muted">Gerade streamt niemand.</p>
      )}

      {streams.length > 0 && (
        <ul className="-mx-2 flex flex-col">
          {streams.slice(0, max).map((s) => (
            <Eintrag key={s.id} s={s} />
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
