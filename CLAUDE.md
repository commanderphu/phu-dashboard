# phu-dashboard

Persönliches Control Center im Homelab. React 19 + Vite + TailwindCSS 4 +
TypeScript, Theme Catppuccin Frappe. Läuft auf cisco im Container
`phu-dashboard`, Port 5173, **Vite-Dev-Server mit HMR — kein Rebuild nötig bei
Codeänderungen**. Nur bei neuen Paketen: `docker compose up -d --build`.

Erreichbar unter `https://dashboard.intern.phudevelopement.xyz`
(Caddy → `phu-dashboard:5173`, Eintrag in `/srv/infra/Caddyfile` ab Zeile 302).

## Aufbau

```
src/
├── components/   Layout (Header/Footer/Sidebar), DockNav, MobileNav,
│   └── widgets/  MusicPlayer, SystemMonitor, Twitch
├── hooks/        useWeather, useSystemInfo, useTwitchStatus, useMusicData,
│                 useWidgetOrder, useLocalStorage, useMusicProvider
├── pages/        Overview, Wetter, Verkehr, MusicPage, NotFound, Placeholder
├── lib/          dailyGreeting, weather, types
└── routes/       index.tsx (lazy), path.ts, icons.tsx
```

41 Dateien, ~2400 Zeilen. Widget-Reihenfolge auf der Overview ist per
`@dnd-kit` sortierbar und liegt im localStorage (`useWidgetOrder`).

## Datenquellen

| Quelle | wofür |
|---|---|
| `https://api.intern.phudevelopement.xyz` | System, Twitch, Musik — das ist **phu-api-hub** (`/srv/services/phu-api-hub`, Port 3001) |
| `https://api.open-meteo.com/v1/forecast` | Wetter (**nicht** OpenWeather, anders als die README behauptet) |
| VRM/VRS-Widget | Abfahrten Koblenz, eingebettet |

## Befund vom 11.08.2026

Sortiert nach Gewicht. Nichts davon ist akut kaputt — das Dashboard läuft.

**1. + 2. erledigt (11.08.2026):** `src/lib/api.ts` exportiert jetzt
`API_BASE = import.meta.env.VITE_API_URL ?? "https://api.intern.phudevelopement.xyz"`,
die drei Hooks (`useSystemInfo`, `useTwitchStatus`, `useMusicData`) nutzen es
statt hartkodierter URLs. `VITE_SPOTIFY_CLIENT_SECRET` ist aus `.env` und
`.env.example` raus (Kommentar verweist auf den serverseitigen
`SPOTIFY_CLIENT_SECRET` im phu-api-hub). Der Tippfehler `phudevelopment.xyz`
(ohne zweites „e") ist dabei gleich mit korrigiert — in `.env`, `.env.example`,
`.env.local`, `README.md` und `src/assets/README_sections.md`, per Browser-Test
gegen `https://dashboard.intern.phudevelopement.xyz` verifiziert (System-,
Twitch- und Musik-Widget laden, HTTP 200, keine Konsolenfehler).

**3. Produktion fährt den Dev-Server.**
`docker-compose.yml`: `command: pnpm dev --host`, `NODE_ENV=development`. Kein
`vite build`, kein `preview`, kein nginx. Intern hinter Caddy vertretbar, aber
es liefert Source Maps aus, hält einen HMR-Websocket offen und ist spürbar
langsamer als ein statisches Artefakt. Ein Umbau auf Multi-Stage-Build mit
nginx wäre die saubere Variante — kostet dafür den Live-Reload beim Entwickeln.

**4. Das ganze Projektverzeichnis ist gemountet** (`.:/workspace`), inklusive
`.env` und `.git`. Beim Dev-Server bauartbedingt, beim Umbau auf Punkt 3 fällt
es weg.

**5. Zwei Platzhalterseiten** in `src/routes/index.tsx`: „Energie"
(PV/Verbrauch) und „Einstellungen" (Theme & Layout).

## Bekannte Fallstricke

- **Live-Reload greift sofort** — der Container mountet den Host-Ordner. Ein
  `docker compose restart` ist bei Codeänderungen unnötig.
- **`.env`-Änderungen brauchen `docker compose up -d`**, nicht `restart`:
  `env_file`/`environment` wird beim *Erstellen* des Containers ausgewertet.
  (Dieselbe Falle wie beim phu-api-hub.)
- Die Warnung `[baseline-browser-mapping] data is over two months old` in den
  Logs ist harmlos — nur ein veralteter Datensatz in einer Build-Abhängigkeit.
- Git: Remote `git@github.com:commanderphu/phu-dashboard.git`, Branch `main`.
  **Signieren auf cisco funktioniert nur über gpg-agent-Forwarding** von barry
  (SSH-Sitzung nötig); sonst `-c commit.gpgsign=false`.

## Naheliegende nächste Schritte

- Instagram-Widget: Der phu-api-hub liest seit 11.08.2026 Follower, Beiträge und
  die Likes/Kommentare des letzten Posts (`src-v2/instagram/stats.service.ts`).
  Ein Endpunkt dort, ein Hook hier — die Daten liegen schon bereit.
- Punkt 3 (Dev-Server in Produktion) angehen: Multi-Stage-Build mit nginx.
