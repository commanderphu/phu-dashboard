import { ExternalLink, Tag } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { usePriceWatch } from "@/hooks/usePriceWatch";
import type { PriceEntry } from "@/hooks/usePriceWatch";

const euro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

function Zeile({ p }: { p: PriceEntry }) {
  // Wie weit ist der Preis noch von der Zielmarke entfernt?
  const abstand =
    p.threshold !== undefined && p.price !== null ? p.price - p.threshold : null;

  return (
    <li className="border-b border-border/60 py-2 last:border-0 last:pb-0">
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-baseline justify-between gap-3"
      >
        <span className="min-w-0 flex-1 truncate text-sm text-fg" title={p.name}>
          {p.name}
          <ExternalLink className="ml-1 inline h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
        </span>

        <span className="shrink-0 text-right">
          <span
            className={`text-sm font-semibold ${
              p.triggered ? "text-success" : "text-ok"
            }`}
          >
            {p.price === null ? "–" : euro(p.price)}
          </span>
          {p.threshold !== undefined && (
            <span className="block text-[11px] text-subtle">
              {p.triggered
                ? `Ziel erreicht (≤ ${euro(p.threshold)})`
                : abstand !== null
                  ? `noch ${euro(abstand)} über Ziel`
                  : `Ziel ≤ ${euro(p.threshold)}`}
            </span>
          )}
        </span>
      </a>
    </li>
  );
}

export function PriceWatchWidget() {
  const { items, fetchedAt, loading, error } = usePriceWatch();

  const treffer = items.filter((i) => i.triggered).length;
  const stand = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <WidgetCard
      title="Preise im Blick"
      hint={
        treffer > 0
          ? `${treffer} Ziel erreicht`
          : stand
            ? `Stand ${stand} Uhr`
            : "Geizhals"
      }
      collapsible
    >
      {loading && items.length === 0 && (
        <p className="text-sm text-muted">Lädt…</p>
      )}

      {error && items.length === 0 && (
        <p className="text-xs text-danger">⚠ {error}</p>
      )}

      {items.length > 0 && (
        <>
          <ul className="flex flex-col">
            {items.map((p) => (
              <Zeile key={p.url} p={p} />
            ))}
          </ul>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-subtle">
            <Tag className="h-3 w-3" />
            Preise werden höchstens alle 30 Minuten neu geholt.
          </p>
        </>
      )}
    </WidgetCard>
  );
}
