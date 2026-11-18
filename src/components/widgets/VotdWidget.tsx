import { BookOpen, Newspaper } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import type { WidgetState } from "@/ui/WidgetCard";
import { useVotd } from "@/hooks/useVotd";
import { PATH } from "@/routes/path";

export function VotdWidget() {
  const { votd, loading, error, updatedAt } = useVotd();

  // Nur dann einen Platzhalter, wenn es nichts zu zeigen gibt.
  const state: WidgetState | undefined =
    loading && !votd ? "loading" : error && !votd ? "offline" : !votd ? "empty" : undefined;

  return (
    <WidgetCard
      title="Spruch des Tages"
      hint={votd?.reference ?? undefined}
      collapsible
      source="Volxbibel"
      updatedAt={updatedAt}
      status={error ? "error" : undefined}
      state={state}
      stateMessage={
        state === "empty"
          ? "Noch kein Spruch für heute — die Mail kommt gegen 06:20."
          : state === "offline"
            ? `Spruch des Tages nicht erreichbar (${error}).`
            : undefined
      }
      primaryAction={{
        label: "Im Briefing ansehen",
        href: PATH.briefing,
        icon: <Newspaper className="h-3.5 w-3.5" />,
      }}
    >
      {votd && (
        <div className="flex gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-sm text-fg">{votd.text}</p>
        </div>
      )}
    </WidgetCard>
  );
}
