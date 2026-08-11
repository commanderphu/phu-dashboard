---

## ⚙️ Environment

`.env` Beispiel:

```bash
NODE_ENV=development
PORT=5173
NETWORK=core_network

VITE_APP_TITLE="Phu’s Nerd Dashboard"
VITE_API_URL=https://api.intern.phudevelopement.xyz
```

---

## 📂 Struktur

```plaintext
src/
├── components/    # Layouts & Widgets
├── pages/         # Overview · Wetter · Verkehr
├── hooks/         # Custom Hooks (Theme)
├── lib/           # API-Utils & Mock-Data
└── main.tsx
```

---

## 🔒 Proxy / TLS Setup

Caddyfile-Snippet (zentraler Reverse Proxy):

```caddy
# ======================================================
# ⚙️ Phu’s Nerd Dashboard (intern)
# ======================================================

dashboard.intern.phudevelopement.xyz {
    reverse_proxy phu-dashboard:5173

    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }

    encode zstd gzip

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    log {
        output file /var/log/caddy/dashboard.access.log {
            roll_size 10MiB
            roll_keep 10
        }
        format console
    }
}
```

---
