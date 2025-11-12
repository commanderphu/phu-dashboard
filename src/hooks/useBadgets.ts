import { useMemo } from "react";
import type { Weather } from "@/lib/types";
import { PATH } from "@/routes/path.ts";

export function useBadges(weather: Weather) {
  return useMemo(() => {
    const map: Record<string, string> = {};
    if (weather?.current != null) map[PATH.wetter] = `${Math.round(weather.current)}°`;
    return map;
  }, [weather?.current]);
}
