import { useCallback, useEffect, useState } from "react";
import type { Weather, WeatherDay } from "@/lib/types";
import { codeToText } from "@/lib/weather";

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "wind_speed_10m",
  "weather_code",
  "is_day",
].join(",");

const DAILY_FIELDS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "weather_code",
  "precipitation_sum",
  "precipitation_probability_max",
  "sunrise",
  "sunset",
  "wind_speed_10m_max",
].join(",");

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const EMPTY: Weather = {
  current: null,
  daily: [],
  now: null,
  error: null,
  loading: true,
};

export function useWeather(lat = 50.3569, lon = 7.5889, intervalMs = 900_000) {
  const [weather, setWeather] = useState<Weather>(EMPTY);

  const load = useCallback(async () => {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=${CURRENT_FIELDS}&daily=${DAILY_FIELDS}&forecast_days=7&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const d = data.daily;
      if (!d?.time?.length) throw new Error("Keine Vorhersagedaten erhalten");

      const daily: WeatherDay[] = d.time.map((iso: string, i: number) => ({
        day: i === 0 ? "Heute" : WEEKDAYS[new Date(iso).getDay()],
        temp: Math.round(d.temperature_2m_max?.[i] ?? 0),
        tempMin: Math.round(d.temperature_2m_min?.[i] ?? 0),
        desc: codeToText(d.weather_code?.[i]),
        code: d.weather_code?.[i] ?? -1,
        rain: d.precipitation_sum?.[i] ?? 0,
        rainChance: d.precipitation_probability_max?.[i] ?? 0,
        windMax: Math.round(d.wind_speed_10m_max?.[i] ?? 0),
        sunrise: d.sunrise?.[i] ?? "",
        sunset: d.sunset?.[i] ?? "",
      }));

      const c = data.current;

      setWeather({
        current: c?.temperature_2m ?? null,
        daily,
        now: c
          ? {
              temp: c.temperature_2m,
              feelsLike: c.apparent_temperature,
              humidity: c.relative_humidity_2m,
              wind: c.wind_speed_10m,
              code: c.weather_code,
              isDay: c.is_day === 1,
            }
          : null,
        error: null,
        loading: false,
      });
    } catch (err) {
      // Bewusst keine Platzhalterwerte: ein Dashboard, das bei Ausfall
      // erfundenes Wetter anzeigt, ist schlimmer als eines, das schweigt.
      setWeather((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Wetter nicht erreichbar",
        loading: false,
      }));
    }
  }, [lat, lon]);

  useEffect(() => {
    let alive = true;
    const run = () => {
      if (alive) load();
    };

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return weather;
}
