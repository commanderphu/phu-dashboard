# ============================================================
# 🧱 BASE IMAGE – Node Dev Environment
# ============================================================
FROM node:20-alpine

# Arbeitsverzeichnis setzen
WORKDIR /workspace

# Systemtools & Git installieren
RUN apk add --no-cache bash git openssh curl \
    && corepack enable

# Optional: globale Tools
RUN npm install -g vite

# Ports für Vite Dev & Preview
EXPOSE 5173
EXPOSE 4173

# Environment
ENV NODE_ENV=development
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Dependencies installieren (unterstützt pnpm, yarn, npm)
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm install; \
    elif [ -f yarn.lock ]; then yarn install; \
    else npm install; fi

# Sourcecode kopieren
COPY . .

# Default Command: Entwicklungsserver mit Hot Reload
CMD ["pnpm", "dev", "--host"]
