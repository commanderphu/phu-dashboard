// Einsatz-Stoppuhr (PhuOS Phase 2, Paket 2): vier Stempel mit Zeit + Ort aus HA.
import { useEffect, useState } from "react";
import { Car, Flag, MapPin, Play, Trash2, Wrench } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { useStopwatch, type StopwatchEvent, type Visit } from "@/hooks/useStopwatch";

const EVENTS: { event: StopwatchEvent; label: string; icon: React.ReactNode }[] = [
  { event: "angekommen", label: "Angekommen", icon: <MapPin className="h-5 w-5" /> },
  { event: "am-geraet", label: "Am Gerät", icon: <Wrench className="h-5 w-5" /> },
  { event: "ende", label: "Ende", icon: <Flag className="h-5 w-5" /> },
  { event: "abfahrt", label: "Abfahrt", icon: <Car className="h-5 w-5" /> },
];

const LABEL: Record<StopwatchEvent, string> = {
  angekommen: "Angekommen",
  "am-geraet": "Am Gerät",
  ende: "Ende",
  abfahrt: "Abfahrt",
};

const hhmm = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "–";

/** Nächster sinnvoller Stempel, abhängig vom laufenden Einsatz. */
function nextEvent(v: Visit | null): StopwatchEvent {
  if (!v) return "angekommen";
  if (!v.atDeviceAt) return "am-geraet";
  if (!v.endAt) return "ende";
  return "abfahrt";
}

function useMinutesSince(iso?: string) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!iso) return;
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, [iso]);
  return iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : null;
}

const fmtMin = (m?: number | null) => (m == null ? "–" : m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} h` : `${m} min`);

export function StopwatchWidget() {
  const { data, loading, busy, error, updatedAt, stamp, remove } = useStopwatch();
  const current = data?.current ?? null;
  const [call, setCall] = useState("");
  const [customer, setCustomer] = useState("");
  const onSite = useMinutesSince(current?.arrivedAt);
  const atDevice = useMinutesSince(current?.atDeviceAt && !current.endAt ? current.atDeviceAt : undefined);
  const suggested = nextEvent(current);

  const press = async (event: StopwatchEvent) => {
    const ok = await stamp(event, event === "angekommen" ? { call, customer } : {});
    if (ok && event === "angekommen") {
      setCall("");
      setCustomer("");
    }
  };

  const status = error ? "error" : current ? "action" : "ok";
  const state = loading && !data ? "loading" : error && !data ? "offline" : undefined;

  return (
    <WidgetCard
      title="Einsatz"
      source="Stoppuhr · HA"
      updatedAt={updatedAt}
      status={status}
      state={state}
      stateMessage={error ?? undefined}
    >
      {/* Laufender Einsatz */}
      {current ? (
        <div className="mb-3 rounded-xl border border-ok/40 bg-ok/10 p-3">
          <p className="text-sm font-semibold text-fg">
            {current.customer || "Einsatz läuft"}
            {current.call && <span className="ml-2 font-mono text-xs text-muted">{current.call}</span>}
          </p>
          {current.place && <p className="text-xs text-muted">{current.place}</p>}
          <p className="mt-1 font-mono text-sm text-ok">
            vor Ort seit {hhmm(current.arrivedAt)} · {fmtMin(onSite)}
            {atDevice != null && <> · am Gerät {fmtMin(atDevice)}</>}
          </p>
        </div>
      ) : (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <input
            value={call}
            onChange={(e) => setCall(e.target.value)}
            placeholder="Call-Nr. (optional)"
            inputMode="numeric"
            className="rounded-lg border border-border bg-elev px-3 py-2 font-mono text-sm text-fg placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-ok"
          />
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Kunde (optional)"
            className="rounded-lg border border-border bg-elev px-3 py-2 text-sm text-fg placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-ok"
          />
        </div>
      )}

      {/* Stempel-Knöpfe — groß fürs Handy, der nächste sinnvolle ist hervorgehoben */}
      <div className="grid grid-cols-2 gap-2">
        {EVENTS.map(({ event, label, icon }) => {
          const primary = event === suggested;
          return (
            <button
              key={event}
              type="button"
              disabled={busy}
              onClick={() => void press(event)}
              className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ok disabled:opacity-50 ${
                primary ? "bg-ok/20 text-ok hover:bg-ok/30" : "border border-border text-muted hover:border-ok/50 hover:text-fg"
              }`}
            >
              {icon} {label}
            </button>
          );
        })}
      </div>

      {/* Stempel des Tages */}
      {data && data.stamps.length > 0 && (
        <div className="mt-4 border-t border-border/40 pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            <Play className="h-3 w-3" /> Heute
          </p>
          <ul className="space-y-1">
            {[...data.stamps].reverse().map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <span className="w-12 shrink-0 font-mono text-ok">{hhmm(s.at)}</span>
                <span className="w-24 shrink-0 text-fg">{LABEL[s.event]}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted">
                  {[s.customer, s.call, s.place].filter(Boolean).join(" · ")}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Stempel „${LABEL[s.event]} ${hhmm(s.at)}“ löschen?`)) void remove(s.id);
                  }}
                  className="rounded p-1 text-subtle hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-ok"
                  aria-label={`Stempel ${LABEL[s.event]} ${hhmm(s.at)} löschen`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {data.visits.some((v) => v.deviceMinutes != null || v.onSiteMinutes != null) && (
            <p className="mt-2 text-xs text-muted">
              Am Gerät gesamt:{" "}
              <span className="font-mono text-fg">
                {fmtMin(data.visits.reduce((a, v) => a + (v.deviceMinutes ?? 0), 0))}
              </span>
              {" · "}vor Ort gesamt:{" "}
              <span className="font-mono text-fg">
                {fmtMin(data.visits.reduce((a, v) => a + (v.onSiteMinutes ?? 0), 0))}
              </span>
            </p>
          )}
        </div>
      )}
      {error && data && <p className="mt-2 text-xs text-danger">{error}</p>}
    </WidgetCard>
  );
}
