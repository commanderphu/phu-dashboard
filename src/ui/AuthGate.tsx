// src/ui/AuthGate.tsx
//
// Lässt das Dashboard erst nach Keycloak-Anmeldung rendern (PhuOS Phase 2,
// Paket 0). Verarbeitet auch den Rücksprung /auth/callback.
// Abschaltbar für lokale Entwicklung mit VITE_AUTH_DISABLED=true.
import { useEffect, useState } from "react";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
import { getAccessToken, handleCallback, isCallback, login } from "@/lib/auth";

type Phase = "checking" | "ready" | "error";

const DISABLED = import.meta.env.VITE_AUTH_DISABLED === "true";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>(DISABLED ? "ready" : "checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (DISABLED) return;
    let cancelled = false;

    (async () => {
      try {
        if (isCallback()) {
          const returnTo = await handleCallback();
          window.history.replaceState(null, "", returnTo);
          if (!cancelled) setPhase("ready");
          return;
        }
        const token = await getAccessToken();
        if (token) {
          if (!cancelled) setPhase("ready");
        } else {
          await login();
        }
      } catch (e) {
        if (cancelled) return;
        setMessage(e instanceof Error ? e.message : "Anmeldung fehlgeschlagen");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "ready") return <>{children}</>;

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6 text-fg">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-[var(--shadow-md)]">
        {phase === "checking" ? (
          <p className="flex items-center justify-center gap-2 text-sm text-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Anmeldung …
          </p>
        ) : (
          <>
            <ShieldAlert className="mx-auto mb-3 h-6 w-6 text-ok" />
            <p className="mb-1 text-base font-semibold">Anmeldung nicht möglich</p>
            <p className="mb-4 text-sm text-muted">{message}</p>
            <button
              type="button"
              onClick={() => void login("/")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ok/15 px-3 py-1.5 text-xs font-medium text-ok hover:bg-ok/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ok"
            >
              <LogIn className="h-4 w-4" /> Neu anmelden
            </button>
          </>
        )}
      </div>
    </div>
  );
}
