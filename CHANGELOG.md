# Changelog — phu-dashboard

Alle nennenswerten Änderungen an diesem Projekt. Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
Kategorien: **Neu**, **Geändert**, **Behoben**, **Entfernt**, **Sicherheit**.
Das Dashboard wird zu **PhuOS** ausgebaut — Konzept im Vault `02 Projekte/PhuOS/`.

## [Geplant] — PhuOS

Grobe Stichpunkte, noch nicht beschlossen. Reihenfolge = Vorschlag.
**Phase 0 (Bestand prüfen) abgeschlossen am 18.11.2026** — Routen, Widgets, Hooks inventarisiert, Mobilansicht geprüft (Layout ok).

### Fehler (Befund Mobil-Test 18.11.2026)
- [ ] Briefing-Seite zeigt Telegram-HTML roh (`<code>`, `<i>`) — `TAG_PATTERN` in `src/lib/briefing.ts` kennt nur `<b>`/`<a>`
- [ ] News doppelt: Zwischenüberschrift „IT & Tech (Heise)" wird von `parseBriefing()` doppelt ausgegeben (Briefing-Text enthält sie nur einmal)

### Grundlagen (Phase 1)
- [ ] Einheitliches Widget-Muster: Titel + Quelle, 1–3 Kennzahlen, Zustand (normal / Hinweis / Handlungsbedarf / Fehler), primäre und sekundäre Aktion, Zeitpunkt der Aktualisierung
- [ ] Zustände Laden / leer / offline / fehlende Berechtigung für alle Widgets
- [ ] Morning Summary: Wetter, nächster Termin, eine Aufgabe, wichtigste Meldung; Details auf Abruf
- [ ] Workmate-Widget mit Deep Link, Home-Assistant-Kachel mit Deep Link
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
