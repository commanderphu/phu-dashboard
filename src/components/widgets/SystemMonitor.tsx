import { useEffect, useState } from "react";
import { WidgetCard } from "@/ui/WidgetCard";
import { Wifi, HardDrive, Clock, ShieldCheck, RefreshCw } from "lucide-react";

type SystemState = {
  online: boolean;
  latency?: number | null;
  connection?: string;
  storageUsed?: number;
  storageQuota?: number;
  battery?: number | null;
  lastCheck: string;
  checking: boolean;
};

export function SystemMonitor() {
  const [state, setState] = useState<SystemState>({
    online: navigator.onLine,
    lastCheck: new Date().toLocaleTimeString(),
    checking: false,
  });

  async function check() {
    setState((prev) => ({ ...prev, checking: true }));
    const newState: SystemState = {
      online: navigator.onLine,
      lastCheck: new Date().toLocaleTimeString(),
      checking: false,
    };

    const start = performance.now();
    try {
      // später: "https://api.phudevelopment.xyz/ping"
      const res = await fetch("https://cloudflare.com", { mode: "no-cors" });
      const end = performance.now();
      newState.latency = Math.round(end - start);
      newState.online = true;
    } catch {
      newState.online = false;
      newState.latency = null;
    }

    // 🔋 Battery API
    if ("getBattery" in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        newState.battery = Math.round(battery.level * 100);
      } catch {}
    }

    // 💾 Storage API
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const { usage, quota } = await navigator.storage.estimate();
        newState.storageUsed = usage ? Math.round(usage / 1024 / 1024) : undefined;
        newState.storageQuota = quota ? Math.round(quota / 1024 / 1024) : undefined;
      } catch {}
    }

    // 📡 Connection API
    const conn = (navigator as any).connection;
    if (conn?.effectiveType) newState.connection = conn.effectiveType;

    newState.lastCheck = new Date().toLocaleTimeString();
    setState(newState);
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000); // alle 30 s
    return () => clearInterval(interval);
  }, []);

  return (
    <WidgetCard
      title="System Monitor"
      hint="Local device"
      className="relative"
    >
      <button
        onClick={check}
        disabled={state.checking}
        className="absolute top-4 right-4 text-muted hover:text-fg transition-colors"
        aria-label="Neu prüfen"
        title="Neu prüfen"
      >
        <RefreshCw
          className={`h-4 w-4 ${state.checking ? "animate-spin text-ok" : ""}`}
        />
      </button>

      <ul className="text-sm space-y-1 mt-1">
        <li className="flex items-center gap-2">
          <Wifi className={`h-4 w-4 ${state.online ? "text-ok" : "text-red-500"}`} />
          Verbindung:{" "}
          <span className="font-medium">
            {state.online ? "Online" : "Offline"}
            {state.connection && ` (${state.connection})`}
          </span>
        </li>

        {state.latency != null && (
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ok" />
            Ping:{" "}
            <span className="font-medium">
              {state.latency} ms
            </span>
          </li>
        )}

        {state.battery != null && (
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ok" />
            Akku: <span className="font-medium">{state.battery}%</span>
          </li>
        )}

        {state.storageUsed && state.storageQuota && (
          <li className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-ok" />
            Speicher:{" "}
            <span className="font-medium">
              {state.storageUsed} MB / {state.storageQuota} MB
            </span>
          </li>
        )}

        <li className="flex items-center gap-2 text-xs text-muted pt-1">
          <Clock className="h-3 w-3" />
          Letzte Prüfung: {state.lastCheck}
        </li>
      </ul>
    </WidgetCard>
  );
}
