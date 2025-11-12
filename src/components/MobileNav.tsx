import { NavLink } from "react-router-dom";
import type { MobileNavItem } from "@/lib/types";

export function MobileNav({
                              items,
                              showOnDesktop = false,
                          }: {
    items: MobileNavItem[];
    /** wenn true: Dock auch auf Desktop anzeigen */
    showOnDesktop?: boolean;
}) {
    // per Prop steuern, ob wir die md:hidden Klasse setzen
    const visibility = showOnDesktop ? "" : "md:hidden";

    return (
        <nav
            className={[
                "fixed bottom-4 left-0 right-0 z-40 mx-auto",
                // etwas breiter auf Desktop, schmaler auf Mobile
                "w-[min(640px,95%)] md:w-[min(900px,85%)]",
                "rounded-2xl border border-border bg-surface/90 backdrop-blur",
                "px-2 py-2 shadow-[var(--shadow-md)]",
                visibility,
            ].join(" ")}
            aria-label="Dock Navigation"
        >
            <ul className="grid grid-cols-4 gap-1">
                {items.map((it) => (
                    <li key={it.to}>
                        <NavLink
                            to={it.to}
                            className={({ isActive }) =>
                                [
                                    "group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px]",
                                    "transition-colors duration-150",
                                    isActive ? "text-ok" : "text-muted hover:text-fg",
                                ].join(" ")
                            }
                        >
                            {({ isActive }) => (
                                <>
                  <span
                      aria-hidden
                      className={[
                          "absolute inset-0 -z-10 rounded-xl border transition-all",
                          isActive ? "bg-ok/15 border-ok/30" : "border-transparent",
                      ].join(" ")}
                  />
                                    <span className="grid place-items-center rounded-lg p-1 transition-transform duration-150 active:scale-95">
                    {/* Icon erbt die Textfarbe */}
                                        <span className="h-6 w-6">{it.icon}</span>
                  </span>
                                    <span className="leading-none"> {it.label} </span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
