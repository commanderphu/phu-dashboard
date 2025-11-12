import { WidgetCard } from "@/ui/WidgetCard";

export function Placeholder({ title, hint }: { title: string; hint?: string }) {
  return (
    <WidgetCard className="lg:col-span-5" title={title} hint={hint}>
      <div className="grid place-items-center rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
        <p>Kommt bald ✨</p>
      </div>
    </WidgetCard>
  );
}
