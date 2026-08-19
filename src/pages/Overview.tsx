// src/pages/Overview.tsx
import { useState, useEffect } from "react";
import type { Weather } from "@/lib/types";
import { WidgetCard } from "@/ui/WidgetCard";
import { StatCard } from "@/ui/StatCard";
import { QuickLinks } from "@/components/QuickLinks";
import { Wetter } from "./Wetter";
import { SystemMonitor } from "@/components/widgets/SystemMonitor";
import { MusicPlayerWidget } from "@/components/widgets/MusicPlayerWidget";
import { TwitchWidget } from "@/components/widgets/TwitchWidget";
import { LiveFollowsWidget } from "@/components/widgets/LiveFollowsWidget";
import { PriceWatchWidget } from "@/components/widgets/PriceWatchWidget";
import { TodayWidget } from "@/components/widgets/TodayWidget";
import { useMusicData } from "@/hooks/useMusicData";
import { useTwitchStatus } from "@/hooks/useTwitchStatus";
import { getDailyGreeting } from "@/lib/dailyGreeting";

// [0] dient als Startwert, sobald etwas gewählt wurde kommt der Wert aus dem
// localStorage (siehe storageKey unten).
const MOOD_OPTIONS = [
  "⚡ fokussiert",
  "🔥 produktiv",
  "💻 am coden",
  "🎮 gaming",
  "🎵 musik-modus",
  "☕ kaffee-modus",
  "😴 müde",
  "😅 im chaos",
];

function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Overview({ weather }: { weather: Weather }) {
  const { nowPlaying, loading: musicLoading } = useMusicData();
  const twitchData = useTwitchStatus();
  const [greeting] = useState(() => getDailyGreeting());
  const now = useClock();

  const clockSubtitle = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }) + " · " + now.toLocaleTimeString("de-DE");

  // Festes Layout, auf 5 Spalten durchgerechnet: jede Zeile ergibt exakt 5.
  // Wer hier etwas verschiebt oder ergänzt, muss die Zeilensumme wieder auf 5
  // bringen — sonst entstehen Lücken im Raster.
  const widgets: { id: string; colSpan: string; node: React.ReactNode }[] = [
    // Zeile 1 — 2 + 2 + 1
    {
      id: "musik",
      colSpan: "lg:col-span-2",
      node: <MusicPlayerWidget nowPlaying={nowPlaying} loading={musicLoading} />,
    },
    {
      id: "twitch",
      colSpan: "lg:col-span-2",
      node: <TwitchWidget data={twitchData} />,
    },
    {
      id: "systemmonitor",
      colSpan: "lg:col-span-1",
      node: <SystemMonitor />,
    },

    // Zeile 2 — 3 + 2
    {
      id: "abfahrtsmonitor",
      colSpan: "lg:col-span-3",
      node: (
        <WidgetCard
          title="Abfahrtsmonitor – In der Goldgrube"
          hint="Live vom VRM"
          collapsible
        >
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border">
            <iframe
              title="Abfahrtsmonitor"
              src="https://www.vrs.de/partner/vrm/am/s/e6087ad7816bbab8613bc1fd962b4174"
              className="h-full w-full"
            />
          </div>
        </WidgetCard>
      ),
    },
    {
      id: "wetter",
      colSpan: "lg:col-span-2",
      node: <Wetter weather={weather} compact collapsible />,
    },

    // Zeile 3 — 2 + 3
    {
      id: "heute",
      colSpan: "lg:col-span-2",
      node: <TodayWidget />,
    },
    {
      id: "preise",
      colSpan: "lg:col-span-3",
      node: <PriceWatchWidget />,
    },

    // Zeile 4 — 2 + 3
    {
      id: "live",
      colSpan: "lg:col-span-2",
      node: <LiveFollowsWidget />,
    },
    {
      id: "schnellzugriff",
      colSpan: "lg:col-span-3",
      node: (
        <WidgetCard title="Schnellzugriff" hint="dein Kram, deine Ordnung" collapsible>
          <QuickLinks />
        </WidgetCard>
      ),
    },
  ];

  return (
    <>
      {/* Begrüßungszeile — nur was in keinem Widget darunter steht */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StatCard label="Heute" value={greeting} subtitle={clockSubtitle} />
        </div>
        <div className="lg:col-span-2">
          <StatCard
            label="Laune"
            value={MOOD_OPTIONS[0]}
            editable
            storageKey="phu:statcard:laune"
            options={MOOD_OPTIONS}
          />
        </div>
      </div>

      {/* Widget-Raster */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {widgets.map((w) => (
          <div key={w.id} className={`flex ${w.colSpan}`}>
            {w.node}
          </div>
        ))}
      </section>
    </>
  );
}
