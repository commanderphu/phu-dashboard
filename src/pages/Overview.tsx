import type { Weather } from "@/lib/types";
import { WidgetCard } from "@/ui/WidgetCard";
import { StatCard } from "@/ui/StatCard";
import { QuickLinks } from "@/components/QuickLinks";
import { Wetter } from "./Wetter";

export function Overview({ weather }: { weather: Weather }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Heute" value={new Date().toLocaleDateString()} />
        <StatCard label="Laune" value="⚡ fokussiert" />
        <StatCard label="Musik" value="🎧 Pop-Punk" />
        <StatCard label="System" value="🐧 Linux" />
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard
          className="lg:col-span-3"
          title="Abfahrtsmonitor – In der Goldgrube"
          hint="Live vom VRM"
        >
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border">
            <iframe
              title="Abfahrtsmonitor"
              src="https://www.vrs.de/partner/vrm/am/s/e6087ad7816bbab8613bc1fd962b4174"
              className="h-full w-full"
            />
          </div>
        </WidgetCard>

        <Wetter weather={weather} compact />

        <WidgetCard
          className="lg:col-span-2"
          title="Schnellzugriff"
          hint="dein Kram, deine Ordnung"
        >
          <QuickLinks />
        </WidgetCard>

        <WidgetCard className="lg:col-span-3" title="Notizen" hint="Markdown später">
          <textarea
            placeholder="Gedanken, TODOs, Lyrics…"
            className="h-48 w-full rounded-2xl border border-border bg-surface p-3 outline-none placeholder:text-muted focus:ring-2 focus:ring-ok/50"
          />
        </WidgetCard>
      </section>
    </>
  );
}
