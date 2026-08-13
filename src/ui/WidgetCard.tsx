// src/ui/WidgetCard.tsx
import { ChevronDown } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface WidgetCardProps {
  title: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

export function WidgetCard({
  title,
  hint,
  className = "",
  children,
  collapsible = false,
}: WidgetCardProps) {
  const slug = title
    .toLowerCase()
    .replace(/[\s–]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    `phu:widget:collapsed:${slug}`,
    false
  );

  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] ${className}`}
    >
      <div
        className={`mb-3 flex items-baseline justify-between ${collapsible ? "cursor-pointer select-none" : ""}`}
        onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
      >
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {hint && <span className="text-xs text-muted">{hint}</span>}
          {collapsible && (
            <ChevronDown
              className={`h-4 w-4 text-muted transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
