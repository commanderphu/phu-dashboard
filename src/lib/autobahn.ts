// Verkehrsmeldungen der Autobahn GmbH des Bundes.
// Offen, ohne Schlüssel, und liefert Access-Control-Allow-Origin: * — deshalb
// fragt der Browser direkt an, ohne Umweg über den phu-api-hub.
const AUTOBAHN_API = "https://verkehr.autobahn.de/o/autobahn";

/** Autobahnen rund um Koblenz. */
export const ROADS = ["A61", "A48", "A3"] as const;
export type Road = (typeof ROADS)[number];

/** Koblenz, Zentrum — Bezugspunkt fürs Filtern. */
const KOBLENZ = { lat: 50.3569, lon: 7.5886 };

/** Weiter entfernte Meldungen sind für die tägliche Fahrt irrelevant. */
export const DEFAULT_RADIUS_KM = 60;

export type ServiceKind = "warning" | "closure" | "roadworks";

/** Rohform der API — nur die Felder, die wir wirklich auswerten. */
interface RawItem {
  identifier?: string;
  title?: string;
  subtitle?: string;
  description?: string[];
  startTimestamp?: string;
  delayTimeValue?: string;
  abnormalTrafficType?: string;
  isBlocked?: string;
  future?: boolean;
  coordinate?: { lat: string | number; long: string | number };
}

export interface TrafficItem {
  id: string;
  road: Road;
  kind: ServiceKind;
  /** z. B. "A61 | Am blauen Stein - Miel" */
  title: string;
  /** Fahrtrichtung, z. B. "Mönchengladbach -> Koblenz" */
  subtitle: string;
  /** Aufbereitete Beschreibung ohne Leerzeilen und Meta-Zeilen. */
  lines: string[];
  /** Zeitverlust in Minuten, sofern die Meldung einen nennt. */
  delayMinutes: number | null;
  startedAt: string | null;
  blocked: boolean;
  distanceKm: number | null;
}

/** Luftlinie in km (Haversine). */
function distanceKm(lat: number, lon: number): number {
  const R = 6371;
  const dLat = ((lat - KOBLENZ.lat) * Math.PI) / 180;
  const dLon = ((lon - KOBLENZ.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((KOBLENZ.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** "Mönchengladbach -> Koblenz" lesbarer machen. */
function tidyDirection(s: string): string {
  return s.replace(/\s*->\s*/g, " → ").trim();
}

function normalize(raw: RawItem, road: Road, kind: ServiceKind): TrafficItem {
  const lat = Number(raw.coordinate?.lat);
  const lon = Number(raw.coordinate?.long);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  // Die API wiederholt Titel und Zeitangaben in der Beschreibung und streut
  // Label-Zeilen ein ("Zeitraum dieser Bauphase:"), die ohne die Zeilen
  // darunter nichts aussagen. Beides raus.
  const lines = (raw.description ?? [])
    .map((l) => l.trim())
    .filter(
      (l) =>
        l !== "" &&
        !l.endsWith(":") &&
        !/^Beginn:/i.test(l) &&
        l !== raw.title
    );

  const delay = Number(raw.delayTimeValue);

  return {
    id: raw.identifier ?? `${road}-${kind}-${raw.title ?? Math.random()}`,
    road,
    kind,
    title: (raw.title ?? "Ohne Titel").trim(),
    subtitle: tidyDirection(raw.subtitle ?? ""),
    lines,
    delayMinutes: Number.isFinite(delay) && delay > 0 ? delay : null,
    startedAt: raw.startTimestamp ?? null,
    blocked: raw.isBlocked === "true",
    distanceKm: hasCoords ? distanceKm(lat, lon) : null,
  };
}

async function fetchService(road: Road, kind: ServiceKind): Promise<TrafficItem[]> {
  const res = await fetch(`${AUTOBAHN_API}/${road}/services/${kind}`);
  if (!res.ok) throw new Error(`${road}/${kind}: HTTP ${res.status}`);

  const json = await res.json();
  // Der Antwortschlüssel heißt je nach Dienst warning/closure/roadworks.
  const items: RawItem[] = json[kind] ?? json.warning ?? json.closure ?? json.roadworks ?? [];
  return items.map((raw) => normalize(raw, road, kind));
}

export interface TrafficResult {
  warnings: TrafficItem[];
  closures: TrafficItem[];
  roadworks: TrafficItem[];
  /** Strecken, die sich nicht abrufen ließen — Rest wird trotzdem angezeigt. */
  failed: string[];
}

/**
 * Holt alle Dienste für alle Strecken und filtert auf den Umkreis.
 * Meldungen ohne Koordinaten bleiben drin — lieber eine zu viel als eine zu
 * wenig, wenn wir die Entfernung nicht kennen.
 */
export async function fetchTraffic(radiusKm = DEFAULT_RADIUS_KM): Promise<TrafficResult> {
  const kinds: ServiceKind[] = ["warning", "closure", "roadworks"];
  const jobs = ROADS.flatMap((road) =>
    kinds.map(async (kind) => ({ kind, items: await fetchService(road, kind) }))
  );

  const settled = await Promise.allSettled(jobs);
  const failed: string[] = [];
  const byKind: Record<ServiceKind, TrafficItem[]> = {
    warning: [],
    closure: [],
    roadworks: [],
  };

  settled.forEach((r) => {
    if (r.status === "fulfilled") byKind[r.value.kind].push(...r.value.items);
    else failed.push(String(r.reason?.message ?? r.reason));
  });

  const nearby = (items: TrafficItem[]) =>
    items
      .filter((i) => i.distanceKm === null || i.distanceKm <= radiusKm)
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  return {
    warnings: nearby(byKind.warning),
    closures: nearby(byKind.closure),
    roadworks: nearby(byKind.roadworks),
    failed,
  };
}
