import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  editable?: boolean;
  storageKey?: string;
  to?: string;
  options?: string[];
}

export function StatCard({
  label,
  value,
  subtitle,
  editable = false,
  storageKey,
  to,
  options,
}: StatCardProps) {
  const [storedValue, setStoredValue] = useLocalStorage<string>(
    storageKey ?? `phu:statcard:${label}`,
    value
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const popRef = useRef<HTMLDivElement | null>(null);

  const displayValue = editable ? storedValue : value;

  // Klick außerhalb & Escape schließen den Picker
  useEffect(() => {
    if (!isEditing) return;

    const onClickOutside = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditing(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isEditing]);

  function startEdit() {
    if (!editable) return;
    setDraft(storedValue);
    setIsEditing(true);
  }

  function saveEdit() {
    setStoredValue(draft);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  }

  const baseClasses =
    "rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-[box-shadow,border-color] duration-200 hover:shadow-[var(--shadow-md)]";

  if (editable) {
    return (
      <div
        ref={popRef}
        className={`group relative ${baseClasses} cursor-pointer`}
        onClick={!isEditing ? startEdit : undefined}
      >
        <div className="text-xs uppercase tracking-wide text-muted">{label}</div>

        {/* Freitext ersetzt den Wert an Ort und Stelle (gleiche Höhe, kein Sprung) */}
        {isEditing && !options ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="mt-1 w-full border-b border-ok/50 bg-transparent text-2xl font-semibold text-ok outline-none"
          />
        ) : (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-2xl font-semibold text-ok">{displayValue}</span>
            <Pencil className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        )}

        {subtitle && <div className="mt-1 text-xs text-muted">{subtitle}</div>}

        {/* Auswahl schwebt über der Karte, damit das Raster darunter stehen bleibt */}
        {isEditing && options && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 top-full z-40 mt-2 rounded-2xl border border-border bg-elev p-2 shadow-[var(--shadow-lg)]"
          >
            <div className="grid grid-cols-2 gap-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setStoredValue(opt);
                    setIsEditing(false);
                  }}
                  className={`rounded-lg border px-2 py-1 text-left text-sm transition-colors ${
                    storedValue === opt
                      ? "border-ok bg-ok/10 text-ok"
                      : "border-border text-fg hover:border-ok/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              onClick={cancelEdit}
              className="mt-2 text-xs text-muted hover:text-fg"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    );
  }

  if (to) {
    const isExternal = to.startsWith("http");
    const content = (
      <>
        <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-ok truncate">{value}</div>
        {subtitle && <div className="mt-1 text-xs text-muted">{subtitle}</div>}
      </>
    );

    if (isExternal) {
      return (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={`block group ${baseClasses} transition-colors hover:border-ok/50`}
        >
          {content}
        </a>
      );
    }

    return (
      <Link to={to} className={`block group ${baseClasses} transition-colors hover:border-ok/50`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ok">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-muted">{subtitle}</div>}
    </div>
  );
}
