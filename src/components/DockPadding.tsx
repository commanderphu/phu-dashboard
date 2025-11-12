type Props = { extra?: number; className?: string };

/**
 * Reserviert Platz unterhalb des Inhalts, damit das Dock nichts überlappt.
 * `extra` = zusätzlicher Puffer in px.
 */
export default function DockPadding({ extra = 12, className = "" }: Props) {
    return (
        <div
            aria-hidden
            className={className}
            style={{
                height: `calc(var(--dock-h, 0px) + env(safe-area-inset-bottom, 0px) + ${extra}px)`,
            }}
        />
    );
}
