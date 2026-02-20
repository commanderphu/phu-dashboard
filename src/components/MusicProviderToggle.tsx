import { Music2, Radio } from "lucide-react";
import { useMusicProvider } from "@/hooks/useMusicProvider";

export function MusicProviderToggle() {
  const { provider, toggleProvider, loading } = useMusicProvider();

  return (
    <button
      onClick={() =>
        toggleProvider(provider === "spotify" ? "navidrome" : "spotify")
      }
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-md
                 bg-white/5 hover:bg-white/10 transition
                 text-sm text-white"
      title="Music Provider wechseln"
    >
      {provider === "spotify" ? (
        <>
          <Music2 className="w-4 h-4 text-green-400" />
          Spotify
        </>
      ) : (
        <>
          <Radio className="w-4 h-4 text-orange-400" />
          Navidrome
        </>
      )}
    </button>
  );
}
