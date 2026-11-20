# Changelog — phu-dashboard

Alle nennenswerten Änderungen an diesem Projekt. Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
Kategorien: **Neu**, **Geändert**, **Behoben**, **Entfernt**, **Sicherheit**.
Das Dashboard wird zu **PhuOS** ausgebaut — Konzept im Vault `02 Projekte/PhuOS/`.

## [Geplant] — PhuOS

Grobe Stichpunkte, noch nicht beschlossen. Reihenfolge = Vorschlag.
**Phase 0 (Bestand prüfen) abgeschlossen am 18.11.2026** — Routen, Widgets, Hooks inventarisiert, Mobilansicht geprüft (Layout ok).

### Fehler (Befund Mobil-Test 18.11.2026)
- [x] Briefing-Seite zeigt Telegram-HTML roh — behoben, siehe Unreleased
- [x] „News doppelt" — kein Fehler: Artefakt des zusammengesetzten Scroll-Screenshots (Text enthält jede Meldung einmal, `parseBriefing()` bildet Zeilen 1:1 ab)

### Grundlagen (Phase 1)
- [x] Einheitliches Widget-Muster — erledigt 18.11. (`WidgetCard`, Vorbilder „Heute" und „Spruch des Tages")
- [ ] Zustände Laden / leer / offline / fehlende Berechtigung — Baustein da, restliche Kacheln umstellen
- [x] Morning Summary — erledigt 18.11. (Kachel „Auf einen Blick")
- [x] Workmate-Widget mit Deep Link (App-Link), Home-Assistant-Kachel mit Link — erledigt 18.11.
- [ ] Mobile Darstellung und Barrierefreiheit prüfen

### Modul Arbeit / Außendienst (Phase 2)
- [ ] Kachel **Meine Calls** (Kunde, Thema, Frist, In Jeopardy) mit Aktion „Call-Ahead-Liste erzeugen"
- [ ] Kachel **Einsatz-Stoppuhr**: Angekommen / Am Gerät / Abfahrt
- [ ] Kachel **Dienstwagen**: km-Stand, nächster Ölwechsel, fehlende Tankbelege, Aktion „Tankbeleg erfassen"
- [ ] Kacheln **Teile unterwegs**, **Arbeitszeit**, **Locker-Aufträge**
- [ ] Kundendaten nur im Heimnetz/VPN anzeigen

### Später (Phase 3)
- [ ] Ansichten Morning / Productivity / Chill
- [ ] Dynamische Priorisierung der Widgets

## [Unreleased]

### Neu
- **Seite „Arbeit“** (`/arbeit`, Dock-Symbol Aktentasche) — Modulansicht für den Außendienst (PhuOS Phase 2)
- **Kachel „Einsatz“** (Einsatz-Stoppuhr): Call/Kunde, vier große Knöpfe Angekommen / Am Gerät / Ende / Abfahrt (der nächste sinnvolle ist hervorgehoben), „vor Ort seit …“, Tagesliste mit Löschen, Summen am Gerät / vor Ort — `useStopwatch` über `/work/stopwatch` mit Keycloak-Token

### Sicherheit
- **Anmeldung per Keycloak** (PhuOS Phase 2, Paket 0): Realm `homelab`, Client `phu-dashboard`, Authorization Code Flow mit **PKCE (S256)** — ohne Zusatzbibliothek (`src/lib/auth.ts`, Web-Crypto + fetch). Das ganze Dashboard liegt hinter dem Login (`src/ui/AuthGate.tsx`), Rücksprung über `/auth/callback`, Token im sessionStorage, Erneuerung per Refresh-Token
- Schreibende Aufrufe (Briefing neu erzeugen, Musik-Anbieter) senden den Access-Token über `authFetch` an den api-hub
- Lokal abschaltbar mit `VITE_AUTH_DISABLED=true`; Issuer/Client über `window.__APP_CONFIG__` oder `VITE_AUTH_*` überschreibbar

### Neu
- Kachel **Zuhause** (PhuOS Phase 1, Paket 4) neben dem Spruch des Tages: Gewicht, Schritte (Ziel 6.000), Auto-Parkposition mit Kartenlink und Fahrtzweck, Handy-Akku; Aktion „Home Assistant öffnen". Nur lesend, Hook `useHomeSummary` → `GET /home/summary`
- Kachel **Auf einen Blick** (Morning Summary, PhuOS Phase 1, Paket 3) ganz oben in der Übersicht: Wetter, nächster Termin, Aufgabe (oder nächste fällige), offener Vault-Punkt, ungelesene Mails; Aktionen „Briefing öffnen" und Workmate. Hook `useMorningSummary` → `GET /briefing/summary`
- **Einheitliches Widget-Muster** (PhuOS Phase 1, Paket 2): `WidgetCard` mit `status` (ok/Hinweis/Handlungsbedarf/Fehler), `state`-Platzhaltern (lädt/leer/offline/keine Berechtigung), `source` + `updatedAt` („vor X min") und `primaryAction`/`secondaryAction` (intern, extern oder Klick, optional mit Rückfrage). Rückwärtskompatibel.
- Kachel **Heute**: Status aus Workmate (dringende Aufgabe → Handlungsbedarf), Aktionen „In Workmate öffnen" und „Aktualisieren"
- Kachel **Spruch des Tages**: Quelle/Aktualisierung, Aktion „Im Briefing ansehen"
- Kachel **Heute**: auf Android öffnet „Workmate-App öffnen" direkt die **Workmate-App** (Deep Link `workmate://open` per intent-Link mit Fallback auf die Web-Oberfläche, `src/lib/appLinks.ts`); am PC weiter die Webseite. `WidgetAction.newTab` für Links ohne neuen Tab.

### Behoben
- Briefing-Seite: `<i>` und `<code>` aus dem Briefing (Vault-Punkte, Bibelvers) werden jetzt kursiv bzw. als Code dargestellt statt als roher Text (`src/lib/briefing.ts`, `Briefing.tsx`)

### Neu
- Briefing-Seite: Button erzeugt das Briefing jetzt **frisch** (`regenerate()` → `POST /telegram/briefing/generate`), unabhängig vom Telegram-Versand — erste PhuOS-Aktion „Briefing neu erzeugen"

## 2026-11

### Neu
- Widget **Spruch des Tages** (`VotdWidget`, Hook `useVotd`) als ganze Zeile oben in der Übersicht

### Behoben
- `Dockerfile.prod`: pnpm über `npm install -g pnpm@9` statt corepack (corepack-pnpm brach mit `MODULE_NOT_FOUND`)

## 2026-09

### Sicherheit
- Container auf Gideon ohne veröffentlichte Ports

## 2026-08

### Neu
- Reverse Proxy auf Gideon, Dev und Produktion getrennt; Produktionsabbild mit nginx statt Dev-Server; Unraid-Vorlage
- Widget **Heute** mit Aufgaben und Terminen aus Workmate
- Widget **Preise im Blick** (Geizhals-Beobachtungsliste)
- Widget **Jetzt live** für gefolgte Twitch-Kanäle
- Morning Briefing als eigene Seite, Verkehrsseite mit Autobahn-Meldungen und Blätterfunktion, ausgebaute Wetterseite
- UI-Refresh im NEOTERRA-Stil

### Geändert
- Festes Widget-Raster statt Drag & Drop; Stat-Zeile entdoppelt, Laune-Picker als Overlay
- Musikliste je Provider ehrlich beschriftet

### Behoben
- Navidrome-Cover wurden nie angezeigt; Musik-Provider ging nie an die API

### Entfernt
- Platzhalterseiten, tote Links, totes Header-Chrome (Login, Suche, Plus-Icon); erfundene Fallback-Daten der Wetterseite

### Sicherheit
- Zentrale `API_BASE`, Spotify-Secret und Domain-Tippfehler bereinigt

## 2026-02

### Neu
- Interaktive Startseite mit System-API, personalisierten Tagesgrüßen, Twitch, Music Player, Mood Picker und Uhr
