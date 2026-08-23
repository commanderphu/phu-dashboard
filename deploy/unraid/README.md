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

## Zur API-Adresse

`API_URL` wird beim Start in `/usr/share/nginx/html/config.js` geschrieben und
von `src/lib/api.ts` vor `import.meta.env` ausgewertet. Dasselbe Abbild läuft
dadurch in jeder Umgebung.

**Wichtig:** Die API-Aufrufe macht der Browser des Betrachters, nicht dieser
Container. Die Adresse muss also von dort aus erreichbar sein — Gideon selbst
nutzt Google-DNS und kann interne Namen nicht auflösen, was für den Betrieb
aber unerheblich ist. Erst bei einer Veröffentlichung über den
Cloudflare-Tunnel käme der Browser nicht mehr an die interne API.
