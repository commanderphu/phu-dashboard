// src/components/layout/Header.tsx
import { useMemo } from "react";

export function Header() {
  // Dynamischer Untertitel
  const vibes = useMemo(
    () => [
      "clean • nerdy • private vibe",
      "code • chill • caffeine",
      "homelab • zen • focus",
      "data • beats • peace",
    ],
    []
  );
  const vibe = useMemo(
    () => vibes[Math.floor(Math.random() * vibes.length)],
    [vibes]
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        {/* === Branding === */}
        <h1 className="text-lg font-semibold tracking-tight">
          Private Dashboard
        </h1>
        <p className="text-xs text-muted">{vibe}</p>
      </div>
    </header>
  );
}
