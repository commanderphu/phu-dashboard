import { useEffect, useState } from "react";
import type { MusicProvider } from "@/lib/types";

const DEFAULT_PROVIDER: MusicProvider = "spotify";

export function useMusicProvider() {
  const [provider, setProvider] = useState<MusicProvider>(DEFAULT_PROVIDER);
  const [loading, setLoading] = useState(false);

  async function fetchProvider() {
    try {
      const res = await fetch("/music/provider");
      const data = await res.json();

      if (data.provider === "spotify" || data.provider === "navidrome") {
        setProvider(data.provider);
      }
    } catch {
      // Fallback bleibt DEFAULT_PROVIDER
    }
  }

  async function toggleProvider(next: MusicProvider) {
    setLoading(true);
    await fetch("/music/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: next }),
    });
    setProvider(next);
    setLoading(false);
  }

  useEffect(() => {
    fetchProvider();
  }, []);

  return {
    provider,   // ✅ NIE null
    loading,
    toggleProvider,
  };
}
