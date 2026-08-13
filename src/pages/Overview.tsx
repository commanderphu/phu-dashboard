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
import { useMusicData } from "@/hooks/useMusicData";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { useTwitchStatus } from "@/hooks/useTwitchStatus";
import { getDailyGreeting } from "@/lib/dailyGreeting";

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
  const { data: sysInfo } = useSystemInfo();
  const twitchData = useTwitchStatus();
  const [greeting] = useState(() => getDailyGreeting());
  const now = useClock();

  const clockSubtitle = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }) + " · " + now.toLocaleTimeString("de-DE");

  const musikValue = musicLoading
    ? "…"
    : nowPlaying
      ? `${nowPlaying.isPlaying ? "🎧" : "⏸"} ${nowPlaying.artist} – ${nowPlaying.title}`
      : "⏸ nichts";

  const twitchValue = twitchData.loading
    ? "…"
    : twitchData.status?.online
      ? `🔴 LIVE · ${twitchData.status.viewerCount?.toLocaleString("de-DE") ?? "?"} Viewer`
      : "⚫ Offline";

  const followerValue = twitchData.loading
    ? "…"
    : twitchData.followerCount != null
      ? `👥 ${twitchData.followerCount.toLocaleString("de-DE")}`
      : "–";

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

    // Zeile 3 — 5
    {
      id: "schnellzugriff",
      colSpan: "lg:col-span-5",
      node: (
        <WidgetCard title="Schnellzugriff" hint="dein Kram, deine Ordnung" collapsible>
          <QuickLinks />
        </WidgetCard>
      ),
    },
  ];

  return (
    <>
      {/* Erste Zeile: Systemdaten */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Heute" value={greeting} subtitle={clockSubtitle} />
        <StatCard
          label="Laune"
          value="⚡ fokussiert"
          editable
          storageKey="phu:statcard:laune"
          options={MOOD_OPTIONS}
        />
        <StatCard label="Musik" value={musikValue} to="/musik" />
        <StatCard label="System" value={sysInfo ? `🖥 ${sysInfo.host}` : "…"} />
        <StatCard label="Twitch" value={twitchValue} to="https://twitch.tv/commanderphu" />
        <StatCard label="Follower" value={followerValue} />
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
