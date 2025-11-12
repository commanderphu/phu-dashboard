/// <reference types="vite/client" />

// Eigene Env-Variablen kannst du hier ergänzen
interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_TITLE: string
    // mehr Variablen…
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
