import { useMusicData } from "@/hooks/useMusicData";
import {MusicProviderToggle} from "@/components/MusicProviderToggle";

export default function MusicPage() {
  const {
    provider,
    nowPlaying,
    topTracks,
    loading,
    error,
  } = useMusicData();

  if (loading) {
    return (
      <div className="p-8 text-muted">
        🎧 Lädt Musikdaten …
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-danger">
        Fehler: {error}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">🎵 Musik</h1>
         <MusicProviderToggle />
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            provider === "spotify"
              ? "bg-success/10 text-success"
              : "bg-ok/10 text-ok-bright"
          }`}
        >
          {provider}
        </span>
      </header>

      {/* NOW PLAYING */}
      {nowPlaying ? (
        nowPlaying.url ? (
          <a
            href={nowPlaying.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
              nowPlaying.isPlaying
                ? "bg-success/10 ring-1 ring-success/30"
                : "bg-elev/60 hover:bg-elev"
            }`}
          >
            <NowPlayingContent nowPlaying={nowPlaying} />
          </a>
        ) : (
          <div
            className={`flex items-center gap-4 p-4 rounded-2xl ${
              nowPlaying.isPlaying
                ? "bg-ok/10 ring-1 ring-ok/30"
                : "bg-elev/60"
            }`}
          >
            <NowPlayingContent nowPlaying={nowPlaying} />
          </div>
        )
      ) : (
        <p className="text-muted">
          Keine Wiedergabe aktiv.
        </p>
      )}

      {/* TOP TRACKS */}
      {topTracks.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">
            Top-Tracks
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topTracks.map((track) => (
              <a
                key={track.id}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:bg-elev transition-colors"
              >
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {track.artist}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* =========================================================
   🎧 Sub-Component: Now Playing Content
   ========================================================= */

function NowPlayingContent({
  nowPlaying,
}: {
  nowPlaying: NonNullable<ReturnType<typeof useMusicData>["nowPlaying"]>;
}) {
  const showProgress =
    nowPlaying.isPlaying && nowPlaying.duration > 0;

  return (
    <>
      {/* VISUALIZER */}
      {nowPlaying.isPlaying && (
        <div className="flex flex-col justify-center items-center w-4 h-16 mr-1">
          <span className="w-[3px] bg-success/90 rounded-sm animate-[bar1_1s_ease-in-out_infinite]" />
          <span className="w-[3px] bg-success/70 rounded-sm animate-[bar2_1.3s_ease-in-out_infinite]" />
          <span className="w-[3px] bg-success/60 rounded-sm animate-[bar3_1.1s_ease-in-out_infinite]" />
        </div>
      )}

      {/* COVER */}
      <img
        src={nowPlaying.albumArt}
        alt={nowPlaying.title}
        className="w-16 h-16 rounded-xl shadow-md object-cover"
      />

      {/* META */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate">
          {nowPlaying.title}
        </h2>
        <p className="text-sm text-muted truncate">
          {nowPlaying.artist} — {nowPlaying.album}
        </p>

        {/* PROGRESS */}
        {showProgress && (
          <div className="mt-2 w-full h-1.5 bg-elev rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500 ease-linear"
              style={{
                width: `${(nowPlaying.progress / nowPlaying.duration) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
