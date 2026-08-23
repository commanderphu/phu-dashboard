#!/bin/bash
# Nach jedem Neuerstellen von infra-caddy ueber die Unraid-Oberflaeche.
#
# Docker 20.10 kann beim Erstellen nur ein Netz zuweisen. Die Vorlage setzt
# br0 (fuer die eigene LAN-Adresse 192.168.178.3), proxy-net muss danach von
# Hand dazu. Ohne proxy-net findet Caddy phu-dashboard und paperless-ngx
# nicht beim Namen und liefert 502.

set -e

if docker inspect infra-caddy --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | grep -q proxy-net; then
    echo "proxy-net haengt bereits dran — nichts zu tun."
    exit 0
fi

docker network connect proxy-net infra-caddy
docker restart infra-caddy >/dev/null
echo "proxy-net verbunden, Caddy neu gestartet."

sleep 8
for host in dashboard office home; do
    code=$(curl -s -o /dev/null -w '%{http_code}' \
        --resolve "$host.intern.phudevelopement.xyz:443:192.168.178.3" \
        "https://$host.intern.phudevelopement.xyz/" --max-time 15 || echo 000)
    printf '  %-10s HTTP %s\n' "$host" "$code"
done
