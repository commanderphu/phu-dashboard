// Relative Zeitangabe für Kachel-Kopfzeilen (WidgetCard).

/** „gerade eben", „vor 5 min", „vor 2 h", sonst Datum und Uhrzeit. */
export function relativeTime(value: Date | string, now = Date.now()): string {
  const t = typeof value === "string" ? new Date(value).getTime() : value.getTime();
  if (Number.isNaN(t)) return "";
  const min = Math.round((now - t) / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} min`;
  if (min < 12 * 60) return `vor ${Math.round(min / 60)} h`;
  return new Date(t).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
