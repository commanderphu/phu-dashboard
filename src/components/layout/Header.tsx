// src/components/layout/Header.tsx
import { useEffect, useMemo } from "react";
import { User } from "lucide-react";

type HeaderProps = {
  user?: { name: string } | null;
  onAddClick?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  showSearch?: boolean;
};

export function Header({
  user = null,
  onAddClick,
  onLogin,
  onLogout,
  showSearch = true,
}: HeaderProps) {
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

  // Ctrl + K → Suche fokussieren
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[type="search"]');
        input?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* === Left: Branding === */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAddClick}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ok/10 ring-1 ring-ok/40 hover:bg-ok/20 transition-colors"
            aria-label="Neues Element hinzufügen"
            title="Neues Element hinzufügen"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M4 12h16M12 4v16" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Private Dashboard
            </h1>
            <p className="text-xs text-muted">{vibe}</p>
          </div>
        </div>

        {/* === Center: Search === */}
        {showSearch && (
          <div className="hidden items-center gap-2 sm:flex">
            <input
              type="search"
              placeholder="Suchen…"
              aria-label="Suchen"
              className="w-64 rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ok/50"
            />
          </div>
        )}

        {/* === Right: User === */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-ok/50 focus:outline-none focus:ring-2 focus:ring-ok/50"
            >
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold hover:border-ok/50 focus:outline-none focus:ring-2 focus:ring-ok/50"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
