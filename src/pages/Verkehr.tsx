import { AlertTriangle, Ban, Clock, Cone, RefreshCw } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { useTraffic } from "@/hooks/useTraffic";
import { ROADS, DEFAULT_RADIUS_KM } from "@/lib/autobahn";
import type { TrafficItem } from "@/lib/autobahn";

function RoadBadge({ road }: { road: string }) {
  return (
    <span className="shrink-0 rounded-md border border-ok/40 bg-ok/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-ok">
      {road}
    </span>
  );
}

function Meldung({ item, tone }: { item: TrafficItem; tone: "warn" | "block" | "work" }) {
  const accent =
    tone === "block" ? "text-danger" : tone === "warn" ? "text-ok-bright" : "text-muted";

  return (
    <li className="flex flex-col gap-1 border-b border-border/60 py-2 last:border-0 last:pb-0">
      <div className="flex items-start gap-2">
        <RoadBadge road={item.road} />
        <span
          className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-fg"
          title={item.title}
        >
          {item.title.replace(/^A\d+\s*\|\s*/, "")}
        </span>
        {item.delayMinutes !== null && (
          <span className={`shrink-0 text-sm font-semibold ${accent}`}>
            +{item.delayMinutes} min
          </span>
        )}
        {item.blocked && item.delayMinutes === null && (
          <span className="shrink-0 text-xs font-semibold text-danger">gesperrt</span>
        )}
      </div>

      {item.subtitle && <p className="text-xs text-muted">{item.subtitle}</p>}

      {item.lines.length > 0 && (
        <p className="text-xs text-subtle">{item.lines[0]}</p>
      )}

      {item.distanceKm !== null && (
        <p className="text-[11px] text-subtle">
          ca. {Math.round(item.distanceKm)} km entfernt
        </p>
      )}
    </li>
  );
}

function Abschnitt({
  title,
  icon,
  items,
  tone,
  collapsible = false,
  defaultCollapsed = false,
  leerText,
}: {
  title: string;
  icon: React.ReactNode;
  items: TrafficItem[];
  tone: "warn" | "block" | "work";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  leerText: string;
}) {
  return (
    <WidgetCard
      // Titel bleibt konstant — die Zahl gehört in den Hinweis, sonst wechselt
      // der localStorage-Schlüssel bei jeder neuen Meldungszahl.
      title={title}
      hint={`${items.length} · ${ROADS.join(" · ")}`}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
    >
      {items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          {icon}
          {leerText}
        </p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <Meldung key={item.id} item={item} tone={tone} />
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export function Verkehr() {
  const { data, loading, error, updatedAt, refetch } = useTraffic();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verkehr</h1>
          <p className="mt-1 text-xs text-muted">
            Autobahn GmbH · Umkreis {DEFAULT_RADIUS_KM} km um Koblenz
            {updatedAt &&
              ` · aktualisiert ${updatedAt.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })} Uhr`}
          </p>
        </div>
        <button
          onClick={refetch}
          className="shrink-0 rounded-xl border border-border bg-surface p-2 text-muted transition-colors hover:border-ok/50 hover:text-fg"
          aria-label="Neu laden"
          title="Neu laden"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-ok" : ""}`} />
        </button>
      </header>

      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          ⚠ {error}
        </p>
      )}

      {data && data.failed.length > 0 && (
        <p className="rounded-xl border border-ok/30 bg-ok/10 p-3 text-xs text-muted">
          Teilweise unvollständig: {data.failed.length} Abfrage(n) fehlgeschlagen.
        </p>
      )}

      {loading && !data && <p className="text-sm text-muted">Lädt Verkehrslage…</p>}

      {data && (
        // items-start: die Abschnitte sind unterschiedlich lang, eine leere
        // "Freie Fahrt"-Karte soll nicht auf Listenhöhe gestreckt werden.
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <Abschnitt
            title="Verkehrslage"
            icon={<AlertTriangle className="h-4 w-4 text-success" />}
            items={data.warnings}
            tone="warn"
            leerText="Freie Fahrt – keine Störungen gemeldet."
          />
          <Abschnitt
            title="Sperrungen"
            icon={<Ban className="h-4 w-4 text-success" />}
            items={data.closures}
            tone="block"
            leerText="Keine Sperrungen im Umkreis."
          />
          <div className="lg:col-span-2">
            <Abschnitt
              title="Baustellen"
              icon={<Cone className="h-4 w-4 text-muted" />}
              items={data.roadworks}
              tone="work"
              collapsible
              defaultCollapsed
              leerText="Keine Baustellen im Umkreis."
            />
          </div>
        </div>
      )}

      <WidgetCard
        title="Abfahrten – In der Goldgrube"
        hint="Live vom VRM"
        collapsible
      >
        <div className="flex items-center gap-2 pb-2 text-xs text-muted">
          <Clock className="h-3 w-3" />
          Nahverkehr Koblenz
        </div>
        {/* Kein 16:9 — das VRS-Widget ist eine Tabelle und wächst nicht mit der
            Breite, ein Seitenverhältnis erzeugte nur Leerraum. */}
        <div className="h-[26rem] overflow-hidden rounded-xl border border-border">
          <iframe
            title="Abfahrtsmonitor"
            src="https://www.vrs.de/partner/vrm/am/s/e6087ad7816bbab8613bc1fd962b4174"
            className="h-full w-full"
          />
        </div>
      </WidgetCard>
    </div>
  );
}
