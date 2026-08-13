import { useMusicData } from "@/hooks/useMusicData";
import { MusicProviderToggle } from "@/components/MusicProviderToggle";

export default function MusicPage() {
  const { nowPlaying, topTracks, loading, error } = useMusicData();

  if (loading) {
    return <div className="text-muted">🎧 Lädt Musikdaten …</div>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
        ⚠ Musikdaten nicht verfügbar: {error}
      </p>
    );
  }

  return (
    // Kein eigenes p-8 — das Layout setzt die Seitenränder bereits.
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Musik</h1>
        {/* Der Umschalter zeigt den Provider bereits an — kein zweites
            Abzeichen daneben. */}
        <MusicProviderToggle />
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
