import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** 1-basiert. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

/**
 * Seitenzahlen mit Auslassung: bei 22 Seiten sollen nicht 22 Knöpfe stehen.
 * Immer sichtbar sind erste, letzte und die Nachbarn der aktuellen Seite.
 */
function buildPages(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const visible = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const items = buildPages(page, pageCount);
  const btn =
    "grid h-7 min-w-7 place-items-center rounded-lg border px-2 text-xs transition-colors";

  return (
    <nav
      className="mt-3 flex items-center justify-center gap-1"
      aria-label="Seitennavigation"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Vorherige Seite"
        className={`${btn} border-border text-muted hover:border-ok/50 hover:text-fg disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-subtle" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Seite ${item}`}
            className={`${btn} ${
              item === page
                ? "border-ok bg-ok/10 font-semibold text-ok"
                : "border-border text-muted hover:border-ok/50 hover:text-fg"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Nächste Seite"
        className={`${btn} border-border text-muted hover:border-ok/50 hover:text-fg disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted`}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
