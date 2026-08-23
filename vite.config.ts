import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    // dev-dashboard ist der Entwicklungsstand auf cisco; dashboard zeigt
    // seit dem Umzug auf das Produktionsabbild auf Gideon und läuft nicht
    // mehr über diesen Server.
    allowedHosts: [
      "dev-dashboard.intern.phudevelopement.xyz",
      "dashboard.intern.phudevelopement.xyz",
    ],
  },
});
