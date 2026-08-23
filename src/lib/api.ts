declare global {
  interface Window {
    /** Wird im Produktionsabbild beim Containerstart aus API_URL erzeugt. */
    __APP_CONFIG__?: { apiUrl?: string };
  }
}

const FALLBACK = "https://api.intern.phudevelopement.xyz";

/**
 * Adresse des phu-api-hub.
 *
 * Vite ersetzt import.meta.env schon beim Bauen — ein fertiges Abbild hätte
 * die Adresse also einbetoniert. Deshalb zuerst window.__APP_CONFIG__, das
 * der Container-Startpunkt zur Laufzeit aus der Umgebungsvariable API_URL
 * schreibt. Im Entwicklungsbetrieb ist das leer und die .env greift wie bisher.
 */
export const API_BASE: string =
  window.__APP_CONFIG__?.apiUrl?.trim() ||
  import.meta.env.VITE_API_URL ||
  FALLBACK;

/**
 * Macht aus API-Pfaden benutzbare URLs.
 *
 * Spotify liefert fertige Adressen (https://…), Navidrome dagegen relative
 * Pfade wie "/music/cover/abc123". Die löst der Browser gegen die
 * Dashboard-Domain auf und bekommt dort Vites index.html statt eines Bildes —
 * das Cover bleibt leer. Deshalb hier auf API_BASE beziehen.
 */
export function resolveApiUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  // Diese Route existiert auf der API nicht (404) — die Navidrome-Antwort
  // setzt sie als Fallback, wenn der Titel keine eigene URL hat. Lieber gar
  // kein Link als einer, der ins Leere führt.
  if (path.startsWith("/music/navidrome/song/")) return null;

  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
