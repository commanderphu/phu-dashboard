// Morning Summary (PhuOS Phase 1, Paket 3): die Tageslage auf einen Blick,
// kompakt statt Telegram-Volltext. Details gibt es auf der Briefing-Seite.
import { CalendarClock, CheckSquare, CloudSun, Mail, Newspaper, StickyNote } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import type { WidgetState, WidgetStatus } from "@/ui/WidgetCard";
import { useMorningSummary } from "@/hooks/useMorningSummary";
import { workmateLink } from "@/lib/appLinks";
import { PATH } from "@/routes/path";

const uhr = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

const tag = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 py-1.5">
      <span className="mt-0.5 shrink-0 text-muted" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-subtle">{label}</p>
        <div className="text-sm text-fg">{children}</div>
      </div>
    </div>
  );
}

export function MorningSummaryWidget() {
  const { data, loading, error, refetch } = useMorningSummary();
  const workmate = workmateLink();

  const state: WidgetState | undefined =
    loading && !data ? "loading" : error && !data ? "offline" : undefined;

  const status: WidgetStatus | undefined = !data
    ? error
      ? "error"
      : undefined
    : data.task?.urgent
      ? "action"
      : data.failed.length
        ? "hint"
        : "ok";

  const unseen = data?.mail.reduce((sum, m) => sum + m.unseen, 0) ?? 0;

  return (
    <WidgetCard
      title="Auf einen Blick"
      collapsible
      source="Briefing"
      updatedAt={data?.generatedAt}
      status={status}
      state={state}
      stateMessage={state === "offline" ? `Summary nicht erreichbar (${error}).` : undefined}
      primaryAction={{
        label: "Briefing öffnen",
        href: PATH.briefing,
        icon: <Newspaper className="h-3.5 w-3.5" />,
      }}
      secondaryAction={{
        label: workmate.isApp ? "Workmate-App öffnen" : "In Workmate ansehen",
        href: workmate.href,
        newTab: !workmate.isApp,
      }}
    >
      {data && (
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          <Row icon={<CloudSun className="h-4 w-4" />} label="Wetter Koblenz">
            {data.weather ? (
              <>
                {data.weather.desc} · {data.weather.minC}–{data.weather.maxC} °C
                {data.weather.rainMm > 1 && (
                  <span className="text-muted"> · {data.weather.rainMm.toFixed(1).replace(".", ",")} mm</span>
                )}
              </>
            ) : (
              <span className="text-muted">nicht verfügbar</span>
            )}
          </Row>

          <Row icon={<CalendarClock className="h-4 w-4" />} label="Nächster Termin">
            {data.nextEvent ? (
              <span className="block truncate" title={data.nextEvent.title}>
                <span className="font-mono text-xs text-ok">{uhr(data.nextEvent.start)}</span>{" "}
                {data.nextEvent.title}
              </span>
            ) : (
              <span className="text-muted">Heute keine mehr</span>
            )}
            {data.allDay.length > 0 && (
              <span className="block truncate text-xs text-muted">ganztägig: {data.allDay.join(", ")}</span>
            )}
          </Row>

          <Row icon={<CheckSquare className="h-4 w-4" />} label="Aufgabe">
            {data.task ? (
              <span className="block truncate" title={data.task.title}>
                {data.task.urgent && <span className="text-danger">● </span>}
                {data.task.title}
                {data.task.more > 0 && <span className="text-muted"> (+{data.task.more})</span>}
              </span>
            ) : data.upcomingTask ? (
              <span className="block truncate" title={data.upcomingTask.title}>
                <span className="text-muted">heute nichts · als Nächstes {data.upcomingTask.dueDate ? tag(data.upcomingTask.dueDate) : ""}: </span>
                {data.upcomingTask.title}
              </span>
            ) : (
              <span className="text-muted">Nichts offen</span>
            )}
          </Row>

          <Row icon={<StickyNote className="h-4 w-4" />} label="Offener Punkt">
            {data.notice ? (
              <span className="line-clamp-2" title={`${data.notice.text} — ${data.notice.file}`}>
                {data.notice.text}
              </span>
            ) : (
              <span className="text-muted">keiner</span>
            )}
          </Row>
        </div>
      )}

      {data && unseen > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <Mail className="h-3.5 w-3.5" />
          {data.mail.map((m) => `${m.unseen} ungelesen (${m.label})`).join(" · ")}
        </p>
      )}

      {data && error && <p className="mt-1 text-xs text-danger">⚠ Aktualisierung fehlgeschlagen: {error}</p>}

      {data && (
        <button
          type="button"
          onClick={refetch}
          className="mt-1 self-start text-[11px] text-subtle underline-offset-2 hover:text-fg hover:underline"
        >
          jetzt aktualisieren
        </button>
      )}
    </WidgetCard>
  );
}
