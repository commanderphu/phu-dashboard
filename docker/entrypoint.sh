#!/bin/sh
# Schreibt die Laufzeit-Konfiguration, bevor nginx startet.
#
# Das nginx-Abbild führt alles unter /docker-entrypoint.d/ vor dem Start aus.
# Vite hat die API-Adresse beim Bauen fest eingesetzt; diese Datei überschreibt
# sie, damit dasselbe Abbild in jeder Umgebung laufen kann.
set -eu

ZIEL=/usr/share/nginx/html/config.js

# Leeres API_URL ist zulässig: dann greift der im Bündel eingebackene Wert.
API_URL="${API_URL:-}"

# In JSON-Zeichenkette einbetten, Anführungszeichen und Backslashes maskieren.
ESCAPED=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > "$ZIEL" <<INNER
window.__APP_CONFIG__ = { apiUrl: "${ESCAPED}" };
INNER

if [ -n "$API_URL" ]; then
  echo "[app-config] API_URL = $API_URL"
else
  echo "[app-config] API_URL nicht gesetzt — es gilt der beim Bauen eingebackene Wert"
fi
