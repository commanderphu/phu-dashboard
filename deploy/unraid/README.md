# Betrieb auf Unraid (Gideon)

Das Produktionsabbild wird auf cisco gebaut und direkt übertragen — es liegt
in keiner Registry.

## Abbild übertragen

```sh
docker build -f Dockerfile.prod -t phu-dashboard:prod .
docker save phu-dashboard:prod | gzip -1 | ssh gideon 'gunzip | docker load'
```

## Vorlage

`my-phu-dashboard.xml` gehört nach
`/boot/config/plugins/dockerMan/templates-user/` auf Gideon. Danach taucht der
Container in der Unraid-Oberfläche auf und lässt sich dort verwalten.

Einstellbar sind der Port (Standard 8080) und `API_URL`.

## Reverse Proxy auf Gideon

Seit dem 23.08.2026 läuft der Container hinter einem eigenen Caddy und ist
unter `https://dashboard.intern.phudevelopement.xyz` erreichbar. Der
veröffentlichte Port wird damit überflüssig — Caddy spricht den Container über
das Docker-Netz `proxy-net` beim Namen an (`phu-dashboard:80`).

Dazugehörig in `caddy/`:

| Datei | wohin auf Gideon |
|---|---|
| `../my-infra-caddy.xml` | `/boot/config/plugins/dockerMan/templates-user/` |
| `caddy/Caddyfile` | `/mnt/user/appdata/caddy/conf/` |
| `caddy/nach-neuerstellen.sh` | `/mnt/user/appdata/caddy/` |

Nicht im Repo, weil Geheimnis: `/mnt/user/appdata/caddy/caddy.env` mit
`CLOUDFLARE_API_TOKEN=…` (Rechte 600). Caddy braucht ihn für die
DNS-01-Prüfung — die `intern.*`-Namen sind von außen nicht erreichbar, eine
HTTP-Prüfung scheidet damit aus.

### Zwei Stolpersteine

**Der Container braucht zwei Netze.** `br0` gibt ihm die eigene LAN-Adresse
192.168.178.3 (nötig, weil Unraids nginx die Ports 80/443 auf 192.168.178.99
belegt), `proxy-net` die Namensauflösung zu den Zielcontainern. Docker 20.10
vergibt beim Erstellen aber nur ein Netz — nach jedem Neuerstellen über die
Unraid-Oberfläche fehlt `proxy-net` und alle Seiten liefern 502. Dafür ist
`nach-neuerstellen.sh` da.

**Ein macvlan-Container erreicht seinen eigenen Host nicht.** Aus Caddy heraus
ist 192.168.178.99 unerreichbar. Home Assistant läuft im `host`-Netz und geht
deshalb über das Bridge-Gateway `172.18.0.1:8123`; dafür muss `172.18.0.0/16`
in HAs `trusted_proxies` stehen, sonst antwortet es mit 400. Unraids eigene
Oberfläche lauscht nur auf 127.0.0.1 und der LAN-Adresse und ist von dort gar
nicht erreichbar — `unraid.intern.phudevelopement.xyz` liegt darum in ciscos
Caddyfile.

## Zur API-Adresse

`API_URL` wird beim Start in `/usr/share/nginx/html/config.js` geschrieben und
von `src/lib/api.ts` vor `import.meta.env` ausgewertet. Dasselbe Abbild läuft
dadurch in jeder Umgebung.

**Wichtig:** Die API-Aufrufe macht der Browser des Betrachters, nicht dieser
Container. Die Adresse muss also von dort aus erreichbar sein — Gideon selbst
nutzt Google-DNS und kann interne Namen nicht auflösen, was für den Betrieb
aber unerheblich ist. Erst bei einer Veröffentlichung über den
Cloudflare-Tunnel käme der Browser nicht mehr an die interne API.
