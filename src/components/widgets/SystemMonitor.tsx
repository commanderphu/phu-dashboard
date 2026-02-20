import { WidgetCard } from "@/ui/WidgetCard";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { Cpu, MemoryStick, Clock, Server, RefreshCw } from "lucide-react";

function Bar({ value }: { value: number }) {
  const color = value > 80 ? "bg-red-500" : value > 60 ? "bg-yellow-400" : "bg-ok";
  return (
    <div className="h-1.5 w-full rounded-full bg-border mt-1">
      <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function SystemMonitor() {
  const { data, loading, error, refetch } = useSystemInfo(30_000);

  return (
    <WidgetCard title="System Monitor" hint={data?.host} className="relative">
      <button
        onClick={refetch}
        className="absolute top-4 right-4 text-muted hover:text-fg transition-colors"
        aria-label="Neu laden"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-ok" : ""}`} />
      </button>

      {error && (
        <p className="text-xs text-red-400">⚠ {error}</p>
      )}

      {!data && !error && (
        <p className="text-xs text-muted">Lädt…</p>
      )}

      {data && (
        <ul className="space-y-3 text-sm mt-1">
          <li>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted">
                <Cpu className="h-4 w-4" /> CPU-Last
              </span>
              <span className="font-medium text-ok">{data.cpuLoad} %</span>
            </div>
            <Bar value={data.cpuLoad} />
          </li>

          <li>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted">
                <MemoryStick className="h-4 w-4" /> RAM
              </span>
              <span className="font-medium text-ok">{data.memUsed} / {data.memTotal} GB</span>
            </div>
            <Bar value={data.memUsage} />
          </li>

          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4" /> Uptime
            </span>
            <span className="font-medium">{data.uptime}</span>
          </li>

          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted">
              <Server className="h-4 w-4" /> Plattform
            </span>
            <span className="font-medium">{data.platform} / {data.arch}</span>
          </li>
        </ul>
      )}
    </WidgetCard>
  );
}
