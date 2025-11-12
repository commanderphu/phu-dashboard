export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ok/10 ring-1 ring-ok/40">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M4 12h16M12 4v16" />
            </svg>
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Private Dashboard</h1>
            <p className="text-xs text-muted">clean • nerdy • private vibe</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <input
            className="w-64 rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ok/50"
            placeholder="Suchen…"
          />
          <button className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold hover:border-ok/50 focus:outline-none focus:ring-2 focus:ring-ok/50">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
