// src/lib/weather.ts
// WMO-Wettercodes, wie Open-Meteo sie liefert.
// Vorher fehlten die meisten Zwischencodes (53, 63, 81, 96 …) und landeten
// als "–" in der Anzeige.

interface WeatherCode {
  text: string;
  /** Tagsüber */
  icon: string;
  /** Nachts, wo es einen Unterschied macht. */
  iconNight?: string;
}

const CODES: Record<number, WeatherCode> = {
  0: { text: "klar", icon: "☀️", iconNight: "🌙" },
  1: { text: "überwiegend klar", icon: "🌤", iconNight: "🌙" },
  2: { text: "teils bewölkt", icon: "⛅", iconNight: "☁️" },
  3: { text: "bedeckt", icon: "☁️" },

  45: { text: "Nebel", icon: "🌫" },
  48: { text: "Reifnebel", icon: "🌫" },

  51: { text: "leichter Niesel", icon: "🌦" },
  53: { text: "Niesel", icon: "🌦" },
  55: { text: "starker Niesel", icon: "🌦" },
  56: { text: "gefrierender Niesel", icon: "🌧" },
  57: { text: "starker gefrierender Niesel", icon: "🌧" },

  61: { text: "leichter Regen", icon: "🌦" },
  63: { text: "Regen", icon: "🌧" },
  65: { text: "starker Regen", icon: "🌧" },
  66: { text: "gefrierender Regen", icon: "🌧" },
  67: { text: "starker gefrierender Regen", icon: "🌧" },

  71: { text: "leichter Schneefall", icon: "🌨" },
  73: { text: "Schneefall", icon: "🌨" },
  75: { text: "starker Schneefall", icon: "❄️" },
  77: { text: "Schneegriesel", icon: "🌨" },

  80: { text: "leichte Schauer", icon: "🌦" },
  81: { text: "Schauer", icon: "🌧" },
  82: { text: "heftige Schauer", icon: "⛈" },
  85: { text: "Schneeschauer", icon: "🌨" },
  86: { text: "starke Schneeschauer", icon: "❄️" },

  95: { text: "Gewitter", icon: "⛈" },
  96: { text: "Gewitter mit Hagel", icon: "⛈" },
  99: { text: "schweres Gewitter mit Hagel", icon: "⛈" },
};

export function codeToText(code?: number): string {
  return CODES[code ?? -1]?.text ?? "–";
}

export function codeToIcon(code?: number, isDay = true): string {
  const entry = CODES[code ?? -1];
  if (!entry) return "❓";
  return !isDay && entry.iconNight ? entry.iconNight : entry.icon;
}

/** "2026-08-13T06:12" → "06:12" */
export function timeOnly(iso?: string): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "–"
    : d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
