import { Music2, Radio } from "lucide-react";
import { useMusicProvider } from "@/hooks/useMusicProvider";

export function MusicProviderToggle() {
  const { provider, toggleProvider, loading, error } = useMusicProvider();

  return (
    <button
      onClick={() =>
        toggleProvider(provider === "spotify" ? "navidrome" : "spotify")
      }
      disabled={loading}
      className={`flex items-center gap-2 rounded-md border bg-surface px-3 py-2
                 text-sm text-fg transition-colors hover:bg-elev
                 disabled:opacity-60 ${
                   error ? "border-danger/50" : "border-border hover:border-ok/50"
                 }`}
      title={
        error
          ? `Provider-Wechsel fehlgeschlagen: ${error}`
          : "Music Provider wechseln"
      }
    >
      {provider === "spotify" ? (
        <>
          <Music2 className="w-4 h-4 text-success" />
          Spotify
        </>
      ) : (
        <>
          <Radio className="w-4 h-4 text-ok-bright" />
          Navidrome
        </>
      )}
    </button>
  );
}
