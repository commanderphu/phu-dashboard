import { NavLink } from "react-router-dom";
import type { SidebarItem } from "@/lib/types";

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
      <nav className="sticky top-[72px] flex flex-col gap-2" aria-label="Hauptnavigation">
        {items.map((it) => (
            <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                    [
                      "group relative w-full select-none rounded-xl border px-3 py-2 text-left text-sm outline-none",
                      "transition-colors duration-150",
                      "focus-visible:ring-2 focus-visible:ring-ok/50 focus-visible:ring-offset-0",
                      isActive
                          ? "border-ok/50 bg-surface text-fg shadow-sm"
                          : "border-border bg-surface text-fg hover:border-ok/40"
                    ].join(" ")
                }
            >
              {/* Active Pill */}
              {({ isActive }) => (
                  <>
              <span
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 -z-10 rounded-xl transition-all",
                    isActive ? "bg-ok/10" : "bg-transparent group-hover:bg-elev/40"
                  ].join(" ")}
              />
                    <span className="block pr-1">{it.label}</span>
                  </>
              )}
            </NavLink>
        ))}
      </nav>
  );
}
