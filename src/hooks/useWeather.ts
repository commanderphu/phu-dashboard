import { useEffect, useState } from "react";
import type { Weather } from "@/lib/types";
import { codeToText } from "@/lib/weather"

export function useWeather(lat = 50.3569, lon = 7.5889) {
  const [weather, setWeather] = useState<Weather>({ current: null, daily: [] });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&daily=temperature_2m_max,weather_code&timezone=auto`
        );
        const data = await res.json();

        const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
        const daily = (data.daily?.time || []).slice(0, 4).map((iso: string, i: number) => ({
          day: i === 0 ? "Heute" : days[new Date(iso).getDay()],
          temp: Math.round(data.daily.temperature_2m_max?.[i] ?? 0),
          desc: codeToText(data.daily.weather_code?.[i]),
        }));

        setWeather({ current: data.current?.temperature_2m ?? null, daily });
      } catch (err) {
        console.warn("Weather fetch failed:", err);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return weather;
}
