import { useEffect, useState } from "react";

export interface SystemInfo {
  host: string;
  platform: string;
  arch: string;
  uptime: string;
  uptimeRaw: number;
  cpuLoad: number;
  memTotal: number;
  memUsed: number;
  memUsage: number;
}

export function useSystemInfo(intervalMs = 30_000) {
  const [data, setData] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchInfo() {
    try {
      const res = await fetch("https://api.intern.phudevelopement.xyz/system");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SystemInfo = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
    const id = setInterval(fetchInfo, intervalMs);
    return () => clearInterval(id);
  }, []);

  return { data, loading, error, refetch: fetchInfo };
}
