// Home-Kachel (PhuOS Phase 1, Paket 4): ausgewählte Zustände aus Home Assistant,
// nur lesend. Steuerung kommt frühestens in Phase 2.
import { BatteryCharging, BatteryMedium, Car, Footprints, House, Scale } from "lucide-react";
import { WidgetCard } from "@/ui/WidgetCard";
import type { WidgetState, WidgetStatus } from "@/ui/WidgetCard";
import { useHomeSummary } from "@/hooks/useHomeSummary";

const HA_URL = "https://home.phudevelopement.xyz";

/** Ziel fürs Schrittziel aus dem Abnehmplan (5.000–6.000 pro Tag). */
const STEP_GOAL = 6000;

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2 py-1">
      <span className="mt-0.5 shrink-0 text-muted" aria-hidden>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-subtle">{label}</p>
        <p className="truncate text-sm text-fg">{value}</p>
        {sub && <p className="truncate text-[11px] text-subtle">{sub}</p>}
      </div>
    </div>
  );
}

const zeit = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

export function HomeWidget() {
  const { data, loading, error } = useHomeSummary();

  const state: WidgetState | undefined =
    loading && !data ? "loading" : error && !data ? "offline" : undefined;
  const status: WidgetStatus | undefined = error
    ? "error"
    : data?.failed.length
      ? "hint"
      : data
        ? "ok"
        : undefined;

  const steps = data?.steps?.value ?? null;
  const battery = data?.phoneBattery;

  return (
    <WidgetCard
      title="Zuhause"
      collapsible
      source="Home Assistant"
      updatedAt={data?.generatedAt}
      status={status}
      state={state}
      stateMessage={state === "offline" ? `Home Assistant nicht erreichbar (${error}).` : undefined}
      primaryAction={{ label: "Home Assistant öffnen", href: HA_URL, icon: <House className="h-3.5 w-3.5" /> }}
    >
      {data && (
        <div className="grid grid-cols-2 gap-x-4">
          <Stat
            icon={<Scale className="h-4 w-4" />}
            label="Gewicht"
            value={data.weightKg ? `${data.weightKg.value.toFixed(1).replace(".", ",")} kg` : "–"}
            sub={data.weightKg ? `gemessen ${new Date(data.weightKg.at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${zeit(data.weightKg.at)}` : undefined}
          />
          <Stat
            icon={<Footprints className="h-4 w-4" />}
            label="Schritte heute"
            value={steps !== null ? steps.toLocaleString("de-DE") : "–"}
            sub={steps !== null ? (steps >= STEP_GOAL ? "Ziel erreicht ✓" : `noch ${(STEP_GOAL - steps).toLocaleString("de-DE")} bis ${STEP_GOAL.toLocaleString("de-DE")}`) : undefined}
          />
          <Stat
            icon={<Car className="h-4 w-4" />}
            label="Auto"
            value={
              data.car ? (
                <a
                  className="text-ok hover:underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${data.car.lat},${data.car.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  geparkt {data.car.parkedAt ?? ""}
                </a>
              ) : (
                "–"
              )
            }
            sub={data.tripPurpose ? `Fahrtzweck: ${data.tripPurpose}` : undefined}
          />
          <Stat
            icon={battery?.charging ? <BatteryCharging className="h-4 w-4" /> : <BatteryMedium className="h-4 w-4" />}
            label="Handy-Akku"
            value={battery ? `${battery.percent} %` : "–"}
            sub={battery ? (battery.charging ? "lädt" : battery.percent <= 20 ? "bald laden" : undefined) : undefined}
          />
        </div>
      )}
    </WidgetCard>
  );
}
