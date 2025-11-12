import { WidgetCard } from "@/ui/WidgetCard";

export function Verkehr() {
  return (
    <WidgetCard
      className="lg:col-span-5"
      title="Verkehr – Abfahrtsmonitor"
      hint="Haltestelle: In der Goldgrube"
    >
      <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border">
        <iframe
          title="Abfahrtsmonitor"
          src="https://www.vrs.de/partner/vrm/am/s/e6087ad7816bbab8613bc1fd962b4174"
          className="h-full w-full"
        />
      </div>
    </WidgetCard>
  );
}
