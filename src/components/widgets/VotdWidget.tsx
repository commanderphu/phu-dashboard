import { BookOpen } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import { useVotd } from "@/hooks/useVotd";

export function VotdWidget() {
  const { votd, loading, error } = useVotd();

  return (
    <WidgetCard title="Spruch des Tages" hint={votd?.reference ?? undefined} collapsible>
      {loading && !votd && <p className="text-sm text-muted">Lädt…</p>}

      {error && <p className="text-xs text-danger">⚠ {error}</p>}

      {!loading && !error && !votd && (
        <p className="text-sm text-muted">Noch kein Spruch für heute.</p>
      )}

      {votd && (
        <div className="flex gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-sm text-fg">{votd.text}</p>
        </div>
      )}
    </WidgetCard>
  );
}
