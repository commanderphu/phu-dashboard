// src/lib/weather.ts
export function codeToText(code?: number) {
  const map: Record<number, string> = {
    0: "klar",
    1: "überwiegend klar",
    2: "bewölkt",
    3: "bedeckt",
    45: "Nebel",
    48: "Reifnebel",
    51: "Niesel",
    61: "Regen",
    71: "Schnee",
    80: "Schauer",
    95: "Gewitter",
  };
  return map[code ?? -1] || "–";
}
