import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    useLayoutEffect,
    type ReactNode,
} from "react";
import { NavLink } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

// Mini-Tooltip (mobil sichtbar, Desktop ausgeblendet)
function Tooltip({
                     text,
                     children,
                     className = "",
                 }: {
    text: string;
    children: React.ReactNode;
    className?: string;
}) {
    const id = useId();
    return (
        <span className={["relative inline-flex group", className].join(" ")}>
      {children}
            <span
                id={id}
                role="tooltip"
                // nur auf Mobile anzeigen (Desktop hat Labels)
                className={[
                    "md:hidden",
                    "pointer-events-none select-none",
                    "absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full",
                    "px-2 py-1 rounded-md text-[11px] leading-none",
                    "bg-elev text-fg border border-border shadow",
                    "opacity-0 scale-95",
                    "transition-all duration-150",
                    // erscheint bei Hover (Maus) oder Fokus (Tastatur)
                    "group-hover:opacity-100 group-hover:scale-100",
                    "group-focus-within:opacity-100 group-focus-within:scale-100",
                    "whitespace-nowrap z-50",
                ].join(" ")}
                aria-hidden="true"
            >
        {text}
      </span>
    </span>
    );
}


export type DockItem = {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    end?: boolean;
};

type DockNavProps = {
    items: DockItem[];
    maxVisible?: number;              // Anzahl direkt sichtbarer Tabs
    labelsDesktopOnly?: boolean;      // Labels nur >= md sichtbar
    size?: "sm" | "md" | "lg";        // Icon-/Padding-Größe
    className?: string;
    footerLinks?: { label: string; href: string; external?: boolean }[];
    badges?: Record<string, ReactNode>; // key = route.to
    rightSlot?: ReactNode;              // optionaler Bereich rechts im Dock
};

export default function DockNav({
                                    items,
                                    maxVisible = 4,
                                    labelsDesktopOnly = true,
                                    size = "md",
                                    className = "",
                                    footerLinks = [],
                                    badges = {},
                                    rightSlot,
                                }: DockNavProps) {
    const primary = useMemo(
        () => items.slice(0, Math.min(maxVisible, items.length)),
        [items, maxVisible]
    );
    const overflow = useMemo(() => items.slice(primary.length), [items, primary.length]);

    const [open, setOpen] = useState(false);
    const popRef = useRef<HTMLDivElement | null>(null);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuId = useId();
    const rootRef = useRef<HTMLElement | null>(null);

    // Größenklassen zentral
    const sizeCls = useMemo(() => {
        switch (size) {
            case "sm":
                return { pad: "px-2 py-1.5", icon: "h-5 w-5" };
            case "lg":
                return { pad: "px-4 py-3", icon: "h-7 w-7" };
            default:
                return { pad: "px-3 py-2", icon: "h-6 w-6" };
        }
    }, [size]);

    // Klick außerhalb & ESC
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (!popRef.current) return;
            if (!popRef.current.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    // Keyboard-Navigation im Menü (Pfeile, Home/End)
    const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const menuItems = popRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
        if (!menuItems || menuItems.length === 0) return;

        const active = document.activeElement as HTMLElement | null;
        const idx = Array.from(menuItems).findIndex((n) => n === active);
        const focusAt = (i: number) =>
            menuItems[Math.max(0, Math.min(i, menuItems.length - 1))].focus();

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                focusAt(idx < 0 ? 0 : idx + 1);
                break;
            case "ArrowUp":
                e.preventDefault();
                focusAt(idx <= 0 ? menuItems.length - 1 : idx - 1);
                break;
            case "Home":
                e.preventDefault();
                focusAt(0);
                break;
            case "End":
                e.preventDefault();
                focusAt(menuItems.length - 1);
                break;
        }
    };

    // Dock-Höhe messen -> CSS-Var --dock-h setzen
    useLayoutEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const setVar = () => {
            const h = el.getBoundingClientRect().height;
            document.documentElement.style.setProperty("--dock-h", `${Math.ceil(h)}px`);
        };
        setVar();
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setVar) : null;
        ro?.observe(el);
        const onResize = () => setVar();
        window.addEventListener("resize", onResize);
        return () => {
            ro?.disconnect();
            window.removeEventListener("resize", onResize);
            document.documentElement.style.removeProperty("--dock-h");
        };
    }, []);

    // HINWEIS: Tooltip-Komponente muss vorhanden sein (wie zuvor eingebaut)
    // function Tooltip(...) { ... }

    return (
        <nav
            ref={rootRef}
            aria-label="Dock Navigation"
            className={[
                "fixed bottom-4 left-0 right-0 z-40 mx-auto",
                "w-[min(640px,95%)] md:w-[min(900px,85%)]",
                "rounded-2xl border border-border bg-surface/90 backdrop-blur",
                "px-2 py-2 shadow-[var(--shadow-md)]",
                className,
            ].join(" ")}
        >
            {/* Wrapper: links die Tabs, rechts optionaler Slot */}
            <div className="flex items-stretch gap-2">
                <ul className="flex flex-1 items-stretch justify-between gap-1">
                    {primary.map((it) => {
                        const Icon = it.icon;
                        return (
                            <li key={it.to} className="min-w-0 flex-1">
                                <NavLink
                                    to={it.to}
                                    end={it.end}
                                    className={({ isActive }) =>
                                        [
                                            "group relative flex flex-col items-center gap-1 rounded-xl",
                                            sizeCls.pad,
                                            "text-xs md:text-[11px]", // vereinheitlichte Schriftgröße
                                            "transition-colors duration-150 focus:outline-none",
                                            "focus-visible:ring-2 focus-visible:ring-ok/50 focus-visible:rounded-xl",
                                            isActive ? "text-ok font-semibold" : "text-muted hover:text-fg font-medium",
                                        ].join(" ")
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* Active Glow/Hintergrund */}
                                            <span
                                                aria-hidden
                                                className={[
                                                    "absolute inset-0 -z-10 rounded-xl border transition-all duration-150",
                                                    isActive
                                                        ? "bg-ok/15 border-ok/30 shadow-[0_0_12px_var(--color-ok,_theme(colors.green.500))]"
                                                        : "border-transparent",
                                                ].join(" ")}
                                            />

                                            <Tooltip text={it.label} className="group">
                        <span className="grid place-items-center relative rounded-lg p-1 transition-transform duration-150 active:scale-95">
                          <Icon
                              className={[
                                  sizeCls.icon,
                                  isActive ? "scale-110" : "scale-100",
                                  "transition-transform",
                              ].join(" ")}
                          />
                            {badges[it.to] && (
                                <span
                                    className={[
                                        "absolute -top-0.5 -right-0.5",
                                        "min-w-4 h-4 px-1 rounded-full",
                                        "border border-border bg-elev text-[10px] leading-4 text-center",
                                        "text-fg",
                                    ].join(" ")}
                                >
                              {badges[it.to]}
                            </span>
                            )}
                        </span>
                                            </Tooltip>

                                            {/* Label Handling */}
                                            {labelsDesktopOnly ? (
                                                <>
                                                    <span className="leading-none truncate hidden md:inline">{it.label}</span>
                                                    <span className="sr-only md:hidden">{it.label}</span>
                                                </>
                                            ) : (
                                                <span className="leading-none truncate">{it.label}</span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}

                    {/* Mehr / Overflow */}
                    {overflow.length > 0 && (
                        <li className="relative">
                            <button
                                ref={btnRef}
                                type="button"
                                onClick={() => setOpen((v) => !v)}
                                className={[
                                    "group relative flex flex-col items-center gap-1 rounded-xl",
                                    sizeCls.pad,
                                    "text-xs md:text-[11px]",
                                    "text-muted hover:text-fg",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ok/50 focus-visible:rounded-xl",
                                ].join(" ")}
                                aria-haspopup="menu"
                                aria-expanded={open}
                                aria-controls={menuId}
                                aria-label="Weitere"
                            >
                <span className="grid place-items-center rounded-lg p-1">
                  <MoreHorizontal className={sizeCls.icon} />
                </span>
                                {labelsDesktopOnly ? (
                                    <>
                                        <span className="leading-none hidden md:inline">Mehr</span>
                                        <span className="sr-only md:hidden">Mehr</span>
                                    </>
                                ) : (
                                    <span className="leading-none">Mehr</span>
                                )}
                            </button>

                            {open && (
                                <div
                                    ref={popRef}
                                    id={menuId}
                                    role="menu"
                                    tabIndex={-1}
                                    onKeyDown={onMenuKeyDown}
                                    className="absolute bottom-12 right-0 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-elev p-1 shadow-xl"
                                >
                                    {/* Overflow-Routen: EIN ul, EIN map */}
                                    <ul className="flex flex-col">
                                        {overflow.map((it) => {
                                            const Icon = it.icon;
                                            return (
                                                <li key={it.to}>
                                                    <NavLink
                                                        to={it.to}
                                                        end={it.end}
                                                        role="menuitem"
                                                        onClick={() => setOpen(false)}
                                                        className={({ isActive }) =>
                                                            [
                                                                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                                                                "transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ok/40",
                                                                isActive ? "text-ok bg-ok/10" : "text-fg hover:bg-surface",
                                                            ].join(" ")
                                                        }
                                                    >
                            <span className="relative shrink-0">
                              <Icon className="h-5 w-5" />
                                {badges[it.to] && (
                                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full border border-border bg-elev text-[10px] leading-4 text-center">
                                  {badges[it.to]}
                                </span>
                                )}
                            </span>
                                                        <span className="truncate">{it.label}</span>
                                                    </NavLink>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {/* Divider + Footer-Links: AUßERHALB der map() */}
                                    {footerLinks.length > 0 && (
                                        <>
                                            <div className="my-1 h-px bg-border/60" />
                                            <ul className="flex flex-col" role="none">
                                                {footerLinks.map((l) => (
                                                    <li key={l.href} role="none">
                                                        <a
                                                            role="menuitem"
                                                            href={l.href}
                                                            target={l.external ? "_blank" : undefined}
                                                            rel={l.external ? "noopener noreferrer" : undefined}
                                                            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-fg hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ok/40"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <span className="truncate">{l.label}</span>
                                                            {l.external && (
                                                                <svg
                                                                    aria-hidden
                                                                    viewBox="0 0 24 24"
                                                                    className="h-4 w-4 opacity-70"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                >
                                                                    <path d="M7 17 17 7M8 7h9v9" />
                                                                </svg>
                                                            )}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    )}
                </ul>

                {/* Rechter Slot (optional) */}
                {rightSlot && (
                    <div className="shrink-0 hidden md:flex items-center gap-2">
                        <div className="h-8 w-px bg-border/60" aria-hidden />
                        {rightSlot}
                    </div>
                )}
            </div>
        </nav>
    );
}
