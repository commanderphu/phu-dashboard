// Modulansicht „Arbeit" (PhuOS Phase 2, Paket 1 + 2). Startet mit der
// Einsatz-Stoppuhr; „Meine Calls" folgt, sobald die TOP-Cloud angebunden ist.
import { StopwatchWidget } from "@/components/widgets/StopwatchWidget";

export function Arbeit() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <StopwatchWidget />
    </div>
  );
}
