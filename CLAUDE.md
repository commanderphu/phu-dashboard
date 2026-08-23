# phu-dashboard

Persönliches Control Center im Homelab. React 19 + Vite + TailwindCSS 4 +
TypeScript, Theme NEOTERRA.

Es gibt zwei Stände (seit 23.08.2026):

| | Entwicklung | Produktion |
|---|---|---|
| Host | cisco (192.168.178.100) | Gideon/Unraid (192.168.178.99) |
| Name | `dev-dashboard.intern.phudevelopement.xyz` | `dashboard.intern.phudevelopement.xyz` |
| Läuft als | Vite-Dev-Server, Port 5173 | nginx im Abbild aus `Dockerfile.prod`, Port 80 |
| Proxy | Caddy auf cisco, `/srv/infra/Caddyfile` | Caddy auf Gideon, `/mnt/user/appdata/caddy/conf/Caddyfile` |

**Auf cisco kein Rebuild nötig** — HMR greift sofort, das Projektverzeichnis ist
gemountet. Nur bei neuen Paketen: `docker compose up -d --build`. Änderungen an
`server:` in `vite.config.ts` (z.B. `allowedHosts`) brauchen dagegen einen
`docker compose restart`, die liest Vite nur beim Start.

Die Produktion bekommt ihre API-Adresse **zur Laufzeit** über die Umgebungs-
variable `API_URL` (Startskript schreibt `config.js`, siehe `src/lib/api.ts`) —
das Abbild ist damit nicht auf eine Adresse festgelegt.

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

## Befund vom 11.08.2026 — vollständig abgearbeitet

Alle fünf Punkte sind erledigt. Der Abschnitt bleibt als Chronik stehen.

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

**3. + 4. erledigt (23.08.2026):** Der Dev-Server ist nicht mehr die
Produktion. `Dockerfile.prod` baut ein Multi-Stage-Abbild (node:22-alpine →
nginx:alpine, 63 MB), das auf Gideon läuft. Damit fällt dort auch der Mount des
ganzen Projektverzeichnisses samt `.env` und `.git` weg — auf cisco bleibt er,
weil der Dev-Server ihn braucht.

**5. erledigt:** Die Platzhalterseiten „Energie" und „Einstellungen" sind raus
(Commit `e78237f`).

## Bekannte Fallstricke

- **Live-Reload greift sofort** — der Container mountet den Host-Ordner. Ein
  `docker compose restart` ist bei Codeänderungen unnötig.
- **`.env`-Änderungen brauchen `docker compose up -d`**, nicht `restart`:
  `env_file`/`environment` wird beim *Erstellen* des Containers ausgewertet.
  (Dieselbe Falle wie beim phu-api-hub.)
- **`vite.config.ts` unter `server:`** (z.B. `allowedHosts`) liest Vite nur beim
  Start — hier hilft HMR nicht, es braucht `docker compose restart`. Ohne den
  passenden Eintrag antwortet Vite mit `403 Blocked request`.
- Die Warnung `[baseline-browser-mapping] data is over two months old` in den
  Logs ist harmlos — nur ein veralteter Datensatz in einer Build-Abhängigkeit.
- **Nie `sed -i` auf eine als *Datei* gemountete Konfiguration** (Caddyfile,
  compose-Dateien im Container). `sed -i` schreibt eine neue Datei und benennt
  um; der Bind-Mount zeigt danach auf die alte Inode und der Container meldet
  `stale file handle`. `scp` oder Python mit `open(p, "w")` behalten die Inode.
  Caddys Konfiguration auf Gideon liegt deshalb als *Verzeichnis*-Mount vor.
- **`pihole-FTL --config dns.hosts` will beim Setzen echtes JSON** —
  `["192.168.178.3 name.beispiel", …]` —, gibt beim Lesen aber ein anderes
  Format aus (`[ 192.168.178.3 name.beispiel, … ]`). Das Gelesene lässt sich
  nicht zurückschreiben. Ungültige Eingaben werden abgelehnt, ohne dass sich
  der Rückgabewert ändert: die Meldung im Text prüfen, nicht `$?`.
- Git: Remote `git@github.com:commanderphu/phu-dashboard.git`, Branch `main`.
  **Signieren auf cisco funktioniert nur über gpg-agent-Forwarding** von barry
  (SSH-Sitzung nötig); sonst `-c commit.gpgsign=false`.

## Naheliegende nächste Schritte

- Instagram-Widget: Der phu-api-hub liest seit 11.08.2026 Follower, Beiträge und
  die Likes/Kommentare des letzten Posts (`src-v2/instagram/stats.service.ts`).
  Ein Endpunkt dort, ein Hook hier — die Daten liegen schon bereit.
- Das Abbild über GHCR und eine GitHub-Action bauen lassen, statt es mit
  `docker save | ssh … docker load` von Hand nach Gideon zu schieben.
- `package-lock.json` listet noch die entfernten `@dnd-kit`-Pakete.
- Verwaiste localStorage-Schlüssel: `phu:widget:order`,
  `phu:widget:collapsed:notizen`, `phu:statcard:musik`.

## Der Proxy auf Gideon (23.08.2026)

Gideon hat einen eigenen Caddy auf **192.168.178.3** (`infra-caddy`,
Unraid-Vorlage `my-infra-caddy.xml`), damit die Container dort ohne
veröffentlichte Ports erreichbar sind. Zwei Eigenheiten sind dabei
entscheidend und leicht zu vergessen:

- **Der Container hängt an br0 *und* an `proxy-net`.** br0 gibt ihm die eigene
  LAN-Adresse — nötig, weil Unraids nginx die Ports 80/443 auf 192.168.178.99
  belegt. `proxy-net` gibt ihm die Namensauflösung zu den Zielcontainern.
  **Docker 20.10 kann beim Erstellen nur ein Netz vergeben**, das zweite muss
  nach jedem Neuerstellen über die Unraid-Oberfläche nachgereicht werden:
  `/mnt/user/appdata/caddy/nach-neuerstellen.sh`.
- **Ein macvlan-Container erreicht seinen eigenen Host nicht.** 192.168.178.99
  ist von dort aus tot. Home Assistant läuft im `host`-Netz und ist deshalb
  über das Bridge-Gateway `172.18.0.1:8123` erreichbar (dafür muss
  `172.18.0.0/16` in HAs `trusted_proxies` stehen, sonst 400). Unraids eigene
  Oberfläche lauscht nur auf 127.0.0.1 und der LAN-Adresse — `unraid.intern`
  liegt darum in **ciscos** Caddyfile.
