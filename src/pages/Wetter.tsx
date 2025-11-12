import type { Weather } from "@/lib/types";
import { WidgetCard } from "@/ui/WidgetCard";

export function Wetter({ weather, compact }: { weather: Weather; compact?: boolean }) {
  const content = (
    <div className="grid grid-cols-4 gap-3">
      {(weather.daily.length
        ? weather.daily
        : [
            { day: "Heute", temp: 21, desc: "bewölkt" },
            { day: "Do", temp: 19, desc: "bewölkt" },
            { day: "Fr", temp: 22, desc: "bewölkt" },
            { day: "Sa", temp: 24, desc: "bewölkt" },
          ]
      ).map((x) => (
        <div key={x.day} className="rounded-xl bg-surface p-3 text-center">
          <div className="text-sm text-muted">{x.day}</div>
          <div className="text-2xl font-semibold text-ok">{x.temp}°</div>
          <div className="text-xs text-muted">{x.desc}</div>
        </div>
      ))}
    </div>
  );

  return (
    <WidgetCard
      className={compact ? "lg:col-span-2" : "lg:col-span-5"}
      title="Wetter (Koblenz)"
      hint={weather.current !== null ? `Jetzt: ${weather.current}°C` : "lädt…"}
    >
      {content}
    </WidgetCard>
  );
}
