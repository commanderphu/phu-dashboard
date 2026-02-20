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
import { SortableWidget } from "@/components/SortableWidget";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWidgetOrder } from "@/hooks/useWidgetOrder";
import { useMusicData } from "@/hooks/useMusicData";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { useTwitchStatus } from "@/hooks/useTwitchStatus";
import { getDailyGreeting } from "@/lib/dailyGreeting";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const DEFAULT_ORDER = [
  "abfahrtsmonitor",
  "wetter",
  "schnellzugriff",
  "notizen",
  "musik",
  "twitch",
  "systemmonitor",
];

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
  const [notes, setNotes] = useLocalStorage<string>("phu:notizen", "");
  const [order, setOrder] = useWidgetOrder(DEFAULT_ORDER);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    setOrder(arrayMove(order, oldIndex, newIndex));
  }

  const widgetMap: Record<string, { colSpan: string; node: React.ReactNode }> = {
    abfahrtsmonitor: {
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
    wetter: {
      colSpan: "lg:col-span-2",
      node: <Wetter weather={weather} compact collapsible />,
    },
    schnellzugriff: {
      colSpan: "lg:col-span-2",
      node: (
        <WidgetCard title="Schnellzugriff" hint="dein Kram, deine Ordnung" collapsible>
          <QuickLinks />
        </WidgetCard>
      ),
    },
    notizen: {
      colSpan: "lg:col-span-3",
      node: (
        <WidgetCard title="Notizen" hint="Markdown später" collapsible>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gedanken, TODOs, Lyrics…"
            className="h-48 w-full rounded-2xl border border-border bg-surface p-3 outline-none placeholder:text-muted focus:ring-2 focus:ring-ok/50"
          />
        </WidgetCard>
      ),
    },
    musik: {
      colSpan: "lg:col-span-2",
      node: <MusicPlayerWidget nowPlaying={nowPlaying} loading={musicLoading} />,
    },
    twitch: {
      colSpan: "lg:col-span-2",
      node: <TwitchWidget data={twitchData} />,
    },
    systemmonitor: {
      colSpan: "lg:col-span-1",
      node: <SystemMonitor />,
    },
  };

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

      {/* Zweite Zeile: Widgets mit DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-5 mt-4">
            {order.map((id) => {
              const widget = widgetMap[id];
              if (!widget) return null;
              return (
                <SortableWidget key={id} id={id} colSpan={widget.colSpan}>
                  {widget.node}
                </SortableWidget>
              );
            })}
          </section>
        </SortableContext>
      </DndContext>
    </>
  );
}
