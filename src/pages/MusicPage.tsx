import { useSpotifyData } from "@/hooks/fetchSpData";

export default function MusicPage() {
  const { nowPlaying, topTracks, loading, error } = useSpotifyData();

  if (loading) return <div className="p-8 text-muted-foreground">🎧 Lädt Spotify-Daten …</div>;
  if (error) return <div className="p-8 text-red-500">Fehler: {error}</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">🎵 Musik</h1>

      {nowPlaying ? (
        <a
            href={nowPlaying.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                nowPlaying.isPlaying
                ? "bg-green-500/10 ring-1 ring-green-400/30 animate-pulse"
                : "bg-muted/30 hover:bg-muted/50"
            }`}
            >
            {nowPlaying.isPlaying && (
                <div className="flex flex-col justify-center items-center w-4 h-16 mr-1">
                    <span className="w-[3px] bg-green-400/90 rounded-sm animate-[bar1_1s_ease-in-out_infinite]" />
                    <span className="w-[3px] bg-green-400/70 rounded-sm animate-[bar2_1.3s_ease-in-out_infinite]" />
                    <span className="w-[3px] bg-green-400/60 rounded-sm animate-[bar3_1.1s_ease-in-out_infinite]" />
                </div>
            )}
            <img
                src={nowPlaying.albumArt}
                alt={nowPlaying.title}
                className="w-16 h-16 rounded-xl shadow-md object-cover"
            />

            <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">{nowPlaying.title}</h2>
                <p className="text-sm text-muted-foreground truncate">
                {nowPlaying.artist} — {nowPlaying.album}
                </p>

                {nowPlaying.isPlaying && (
                <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                    className="h-full bg-green-400 rounded-full transition-all duration-500 ease-linear"
                    style={{
                        width: `${(nowPlaying.progress / nowPlaying.duration) * 100}%`,
                    }}
                    />
                </div>
                )}
            </div>
            </a>

      ) : (
        <p className="text-muted-foreground">Keine Wiedergabe aktiv.</p>
      )}

      {topTracks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Top-Tracks</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topTracks.map((track) => (
              <a
                key={track.id}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-card/80 transition"
              >
                <img src={track.image} alt={track.title} className="w-12 h-12 rounded-md" />
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
