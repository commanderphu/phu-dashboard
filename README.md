
![Phu’s Nerd Dashboard](/src/assets/header.webp)

# 🧠 Phu’s Nerd Dashboard  
**clean · nerdy · private vibe**

[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Design-0ea5e9?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Dockerized](https://img.shields.io/badge/Docker-ready-blue?logo=docker&logoColor=white)](https://www.docker.com)
![License: Private](https://img.shields.io/badge/license-private-lightgrey.svg)

---

## 🚀 About

**Phu’s Nerd Dashboard** ist das persönliche Control Center innerhalb deines Homelabs —  
entwickelt mit **React + Vite + Tailwind + TypeScript** und optimiert für  
`dashboard.intern.phudevelopment.xyz`.

> Teil des PhuDevelopment-Ökosystems – modular, self-hosted, clean und nerdy.

---

## 🧩 Core Features

- 🧭 **Overview** – Systemstatus, Notizen, Schnellzugriff  
- 🚌 **Verkehr (VRM)** – Live-Abfahrten aus Koblenz  
- 🌦️ **Wetter** – OpenWeather-Widget  
- 🎨 **Theme** – Catppuccin Frappe (Green Accent)  
- ⚙️ **Docker-Ready** – läuft im `core_network` mit Caddy + Cloudflare TLS  

---

## 🏗️ Tech Stack

| Layer | Technologie |
|:------|:-------------|
| Frontend | React + Vite + TypeScript |
| Styling | TailwindCSS + Catppuccin |
| Dev-Container | Node 20 Alpine + pnpm |
| Reverse-Proxy | Caddy (TLS via Cloudflare DNS) |
| Network | `core_network` (Homelab internal) |

---

## 🐳 Docker Quickstart

```bash
# Build & Run
docker compose up -d
````

**Zugriff:**

* 🔗 [http://localhost:5173](http://localhost:5173)
* 🌐 [https://dashboard.intern.phudevelopment.xyz](https://dashboard.intern.phudevelopment.xyz) (intern)

---

## ⚙️ Environment

`.env` Beispiel:

```bash
NODE_ENV=development
PORT=5173
NETWORK=core_network

VITE_APP_TITLE="Phu’s Nerd Dashboard"
VITE_API_URL=https://api.phudevelopment.xyz
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

dashboard.intern.phudevelopment.xyz {
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

## 🧠 Vision

Ein cleanes, privates **Nerd-OS-Interface** als Teil des PhuDevelopment-Homelabs –
für Projekte, Musik, Systeme und Workflows.

> *“Tech shouldn’t feel corporate – it should feel like home.”*

---

© 2025 **Joshua Phu Kuhrau** · All rights reserved
*Developed within the PhuDevelopment Homelab*
