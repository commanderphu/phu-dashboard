import { Droplets, Sunrise, Sunset, Wind } from "lucide-react";
import type { Weather } from "@/lib/types";
import { WidgetCard } from "@/ui/WidgetCard";
import { codeToIcon, codeToText, timeOnly } from "@/lib/weather";

interface WetterProps {
  weather: Weather;
  /** Kompaktvariante fürs Übersichts-Widget. */
  compact?: boolean;
  collapsible?: boolean;
}

/** Ehrlicher Hinweis statt Platzhalterwerten. */
function Fehler({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
      ⚠ Wetter nicht verfügbar: {text}
    </p>
  );
}

/** Eine Tagesspalte der Vorhersage. */
function Tag({ d, showDetails }: { d: Weather["daily"][number]; showDetails?: boolean }) {
  return (
    <div className="rounded-xl bg-elev p-3 text-center">
      <div className="text-sm text-muted">{d.day}</div>
      <div className="my-1 text-2xl leading-none" title={d.desc}>
        {codeToIcon(d.code)}
      </div>
      <div className="text-xl font-semibold text-ok">{d.temp}°</div>
      <div className="text-xs text-subtle">{d.tempMin}°</div>

      {showDetails && (
        <>
          <div className="mt-1 truncate text-xs text-muted" title={d.desc}>
            {d.desc}
          </div>
          {d.rainChance > 0 && (
            <div className="mt-1 text-xs text-info">
              {d.rainChance}%{d.rain > 0 && ` · ${d.rain} mm`}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Wetter({ weather, compact, collapsible }: WetterProps) {
  const { daily, now, error, loading } = weather;

  // ---- Kompakt: das Widget auf der Übersicht -------------------------------
  if (compact) {
    return (
      <WidgetCard
        title="Wetter (Koblenz)"
        hint={now ? `Jetzt: ${now.temp}°C` : loading ? "lädt…" : "–"}
        collapsible={collapsible}
      >
        {error && daily.length === 0 ? (
          <Fehler text={error} />
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {daily.slice(0, 4).map((d) => (
              <Tag key={d.day} d={d} />
            ))}
          </div>
        )}
      </WidgetCard>
    );
  }

  // ---- Vollansicht: die eigene Seite ---------------------------------------
  const heute = daily[0];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Wetter</h1>
        <p className="mt-1 text-xs text-muted">
          Koblenz · Open-Meteo · aktualisiert alle 15 Minuten
        </p>
      </header>

      {error && daily.length === 0 && <Fehler text={error} />}
      {loading && daily.length === 0 && !error && (
        <p className="text-sm text-muted">Lädt…</p>
      )}

      {/* Fehler trotz vorhandener Daten: Daten zeigen, aber ehrlich kennzeichnen */}
      {error && daily.length > 0 && (
        <p className="rounded-xl border border-ok/30 bg-ok/10 p-3 text-xs text-muted">
          Letzte Aktualisierung fehlgeschlagen ({error}) – angezeigte Werte
          können veraltet sein.
        </p>
      )}

      {now && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl leading-none">
                {codeToIcon(now.code, now.isDay)}
              </span>
              <div>
                <div className="text-4xl font-semibold text-ok">
                  {Math.round(now.temp)}°
                </div>
                <div className="text-sm text-muted">
                  {codeToText(now.code)} · gefühlt {Math.round(now.feelsLike)}°
                </div>
              </div>
            </div>

            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted" />
                <dt className="sr-only">Wind</dt>
                <dd>{Math.round(now.wind)} km/h</dd>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted" />
                <dt className="sr-only">Luftfeuchte</dt>
                <dd>{now.humidity} %</dd>
              </div>
              {heute && (
                <>
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-muted" />
                    <dt className="sr-only">Sonnenaufgang</dt>
                    <dd>{timeOnly(heute.sunrise)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-muted" />
                    <dt className="sr-only">Sonnenuntergang</dt>
                    <dd>{timeOnly(heute.sunset)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </section>
      )}

      {daily.length > 0 && (
        <WidgetCard title="7-Tage-Vorhersage" hint="Höchst- / Tiefstwerte">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {daily.map((d) => (
              <Tag key={d.day} d={d} showDetails />
            ))}
          </div>
        </WidgetCard>
      )}
    </div>
  );
}
