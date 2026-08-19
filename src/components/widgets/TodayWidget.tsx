import { AlertTriangle, CalendarDays, CheckSquare, MapPin } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { useWorkmateToday } from "@/hooks/useWorkmateToday";
import type { TodayEvent, TodayTask } from "@/hooks/useWorkmateToday";

const uhr = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

/** Läuft der Termin gerade? */
function laeuftGerade(e: TodayEvent): boolean {
  if (e.allDay) return false;
  const jetzt = Date.now();
  return jetzt >= new Date(e.start).getTime() && jetzt <= new Date(e.end).getTime();
}

function Termin({ e }: { e: TodayEvent }) {
  const aktiv = laeuftGerade(e);
  const vorbei = !e.allDay && Date.now() > new Date(e.end).getTime();

  return (
    <li className="flex gap-2 py-1.5">
      <span
        className={`mt-0.5 w-24 shrink-0 font-mono text-xs ${
          aktiv ? "font-semibold text-ok" : vorbei ? "text-subtle" : "text-muted"
        }`}
      >
        {e.allDay ? "ganztägig" : `${uhr(e.start)}–${uhr(e.end)}`}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm ${vorbei ? "text-subtle line-through" : "text-fg"}`}
          title={e.title}
        >
          {e.title}
        </span>
        {e.location && (
          <span className="flex items-center gap-1 text-[11px] text-subtle">
            <MapPin className="h-3 w-3" />
            {e.location}
          </span>
        )}
      </span>
    </li>
  );
}

function Aufgabe({ t }: { t: TodayTask }) {
  return (
    <li className="flex items-start gap-2 py-1.5">
      <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
      <span className="min-w-0 flex-1 truncate text-sm text-fg" title={t.title}>
        {t.title}
      </span>
      {t.urgent && (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-label="dringend" />
      )}
    </li>
  );
}

export function TodayWidget() {
  const { tasks, events, failed, loading, error } = useWorkmateToday();

  const offen = events.filter((e) => e.allDay || Date.now() <= new Date(e.end).getTime()).length;
  const hint =
    tasks.length || events.length
      ? `${tasks.length} Aufgaben · ${offen} Termine offen`
      : "Workmate";

  return (
    <WidgetCard title="Heute" hint={hint} collapsible>
      {loading && !events.length && !tasks.length && (
        <p className="text-sm text-muted">Lädt…</p>
      )}

      {error && (
        <p className="text-xs text-danger">⚠ {error}</p>
      )}

      {/* Teilausfall: das Vorhandene trotzdem zeigen, aber ehrlich benennen */}
      {!error && failed.length > 0 && (
        <p className="mb-2 text-[11px] text-subtle">
          {failed.includes("tasks") && "Aufgaben"}
          {failed.length > 1 && " und "}
          {failed.includes("events") && "Termine"}
          {failed.includes("nicht konfiguriert")
            ? "Workmate ist nicht konfiguriert."
            : " konnten nicht geladen werden."}
        </p>
      )}

      {!loading && !error && !tasks.length && !events.length && failed.length === 0 && (
        <p className="text-sm text-muted">Nichts los heute.</p>
      )}

      {events.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Termine
          </div>
          <ul className="mb-2 flex flex-col divide-y divide-border/40">
            {events.map((e, i) => (
              <Termin key={`${e.start}-${i}`} e={e} />
            ))}
          </ul>
        </>
      )}

      {tasks.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <CheckSquare className="h-3.5 w-3.5" />
            Aufgaben
          </div>
          <ul className="flex flex-col divide-y divide-border/40">
            {tasks.map((t, i) => (
              <Aufgabe key={`${t.title}-${i}`} t={t} />
            ))}
          </ul>
        </>
      )}
    </WidgetCard>
  );
}
