// src/ui/WidgetCard.tsx
//
// Einheitlicher Rahmen für alle Kacheln (PhuOS Phase 1, Paket 2).
// Jede Kachel beantwortet: Was ist los? Muss ich etwas tun? Was kann ich jetzt tun?
// → Status, Zustand, Quelle + Aktualisierung, primäre/sekundäre Aktion.
// Alle neuen Props sind optional — bestehende Kacheln laufen unverändert weiter.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ExternalLink,
  Inbox,
  Loader2,
  Lock,
  WifiOff,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { relativeTime } from "@/lib/relativeTime";

/** normal · Hinweis · Handlungsbedarf · Fehler */
export type WidgetStatus = "ok" | "hint" | "action" | "error";

/** Platzhalter statt Inhalt — ersetzt die je Kachel eigenen „Lädt…"-Zeilen. */
export type WidgetState = "loading" | "empty" | "offline" | "forbidden";

export interface WidgetAction {
  label: string;
  /** Interner Pfad ("/briefing") oder externe URL. */
  href?: string;
  onClick?: () => void;
  /** Rückfrage vor der Aktion — Pflicht für alles, was nach außen geht. */
  confirm?: string;
  /** Externe Links im neuen Tab öffnen (Standard). false z. B. für App-Links (intent:). */
  newTab?: boolean;
  icon?: React.ReactNode;
}

interface WidgetCardProps {
  title: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
  collapsible?: boolean;
  /** Zustand beim ersten Aufruf, danach entscheidet der localStorage. */
  defaultCollapsed?: boolean;
  status?: WidgetStatus;
  state?: WidgetState;
  /** Text zum Platzhalter, z. B. „Nichts los heute." */
  stateMessage?: string;
  /** Woher die Daten kommen, z. B. „Workmate". */
  source?: string;
  /** Wann die Daten zuletzt erfolgreich geladen wurden. */
  updatedAt?: Date | string | null;
  primaryAction?: WidgetAction;
  secondaryAction?: WidgetAction;
}

const STATUS_STYLE: Record<WidgetStatus, { dot: string; border: string; label: string }> = {
  ok: { dot: "bg-success", border: "", label: "alles in Ordnung" },
  hint: { dot: "bg-info", border: "border-info/40", label: "Hinweis" },
  action: { dot: "bg-ok", border: "border-ok/50", label: "Handlungsbedarf" },
  error: { dot: "bg-danger", border: "border-danger/50", label: "Fehler" },
};

const STATE_DEFAULTS: Record<WidgetState, { icon: React.ReactNode; text: string }> = {
  loading: { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: "Lädt…" },
  empty: { icon: <Inbox className="h-4 w-4" />, text: "Nichts vorhanden." },
  offline: { icon: <WifiOff className="h-4 w-4" />, text: "Quelle nicht erreichbar." },
  forbidden: { icon: <Lock className="h-4 w-4" />, text: "Keine Berechtigung." },
};

/** Neu rendern im Minutentakt, damit „vor X min" mitläuft. */
function useMinuteTick(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [active]);
}

const ACTION_BASE =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ok";

function ActionButton({ action, primary }: { action: WidgetAction; primary: boolean }) {
  const style = primary
    ? `${ACTION_BASE} bg-ok/15 text-ok hover:bg-ok/25`
    : `${ACTION_BASE} border border-border text-muted hover:border-ok/50 hover:text-fg`;

  const confirmed = (e: React.MouseEvent) => {
    if (action.confirm && !window.confirm(action.confirm)) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  if (action.href?.startsWith("/")) {
    return (
      <Link to={action.href} className={style} onClick={confirmed}>
        {action.icon}
        {action.label}
      </Link>
    );
  }
  if (action.href) {
    return (
      <a
        href={action.href}
        target={action.newTab === false ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={style}
        onClick={confirmed}
      >
        {action.icon}
        {action.label}
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    );
  }
  return (
    <button
      type="button"
      className={style}
      onClick={(e) => {
        if (confirmed(e)) action.onClick?.();
      }}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

export function WidgetCard({
  title,
  hint,
  className = "",
  children,
  collapsible = false,
  defaultCollapsed = false,
  status,
  state,
  stateMessage,
  source,
  updatedAt,
  primaryAction,
  secondaryAction,
}: WidgetCardProps) {
  // Achtung: Der Titel darf nichts Veränderliches enthalten (z. B. eine
  // Trefferzahl) — sonst wechselt der Schlüssel und der Zustand geht verloren.
  const slug = title
    .toLowerCase()
    .replace(/[\s–]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    `phu:widget:collapsed:${slug}`,
    defaultCollapsed
  );

  useMinuteTick(Boolean(updatedAt));

  const statusStyle = status ? STATUS_STYLE[status] : null;
  const meta = [source, updatedAt ? relativeTime(updatedAt) : null].filter(Boolean).join(" · ");
  const hasActions = Boolean(primaryAction || secondaryAction);

  return (
    <section
      className={`flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] ${statusStyle?.border ?? ""} ${className}`}
    >
      <div
        className={`mb-3 flex items-baseline justify-between gap-2 ${collapsible ? "cursor-pointer select-none" : ""}`}
        onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
      >
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {statusStyle && (
              <span
                className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusStyle.dot}`}
                role="img"
                aria-label={statusStyle.label}
                title={statusStyle.label}
              />
            )}
            {title}
          </h2>
          {meta && <p className="text-[11px] text-subtle">{meta}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hint && <span className="text-xs text-muted">{hint}</span>}
          {collapsible && (
            <ChevronDown
              className={`h-4 w-4 text-muted transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          collapsed ? "grid-rows-[0fr] opacity-0" : "flex-1 grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="flex min-h-0 flex-col overflow-hidden">
          {state ? (
            <p
              className={`flex items-center gap-2 text-sm ${state === "offline" ? "text-danger" : "text-muted"}`}
              role={state === "loading" ? "status" : undefined}
            >
              {STATE_DEFAULTS[state].icon}
              {stateMessage ?? STATE_DEFAULTS[state].text}
            </p>
          ) : (
            children
          )}

          {hasActions && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
              {primaryAction && <ActionButton action={primaryAction} primary />}
              {secondaryAction && <ActionButton action={secondaryAction} primary={false} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
