import { useMemo } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { useBriefing } from "@/hooks/useBriefing";
import { parseBriefing } from "@/lib/briefing";
import type { Token } from "@/lib/briefing";

function Line({ tokens }: { tokens: Token[] }) {
  return (
    <p className="text-sm leading-relaxed text-muted">
      {tokens.map((t, i) => {
        if (t.kind === "bold") {
          return (
            <strong key={i} className="font-semibold text-fg">
              {t.text}
            </strong>
          );
        }
        if (t.kind === "link") {
          return (
            <a
              key={i}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-1 text-ok transition-colors hover:text-ok-bright hover:underline"
            >
              {t.text}
              <ExternalLink className="h-3 w-3 shrink-0 self-center opacity-60" />
            </a>
          );
        }
        return <span key={i}>{t.text}</span>;
      })}
    </p>
  );
}

export function Briefing() {
  const { data, loading, error, refetch } = useBriefing();

  const sections = useMemo(
    () => (data?.text ? parseBriefing(data.text) : []),
    [data?.text]
  );

  const sentAt = data?.sentAt
    ? new Date(data.sentAt).toLocaleString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Die erste Sektion ist die Begrüßung — die bekommt eine eigene Behandlung.
  const [intro, ...rest] = sections;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Morning Briefing</h1>
          <p className="mt-1 text-xs text-muted">
            {sentAt ? `Verschickt am ${sentAt} Uhr` : "Einmal täglich per Telegram"}
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

      {loading && !data && <p className="text-sm text-muted">Lädt…</p>}

      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          ⚠ {error}
        </p>
      )}

      {intro && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          {intro.heading && (
            <h2 className="text-xl font-semibold text-ok">{intro.heading}</h2>
          )}
          {intro.lines.map((tokens, i) => (
            <Line key={i} tokens={tokens} />
          ))}
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rest.map((section, i) => (
          <WidgetCard key={i} title={section.heading ?? "Sonstiges"}>
            <div className="flex flex-col gap-1">
              {section.lines.map((tokens, j) => (
                <Line key={j} tokens={tokens} />
              ))}
            </div>
          </WidgetCard>
        ))}
      </div>
    </div>
  );
}
