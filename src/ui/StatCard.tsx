import { useState } from "react";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface StatCardProps {
  label: string;
  value: string;
  editable?: boolean;
  storageKey?: string;
  to?: string;
}

export function StatCard({ label, value, editable = false, storageKey, to }: StatCardProps) {
  const [storedValue, setStoredValue] = useLocalStorage<string>(
    storageKey ?? `phu:statcard:${label}`,
    value
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayValue = editable ? storedValue : value;

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

  const baseClasses = "rounded-2xl border border-border bg-surface p-4";

  if (editable) {
    return (
      <div
        className={`group relative ${baseClasses} cursor-pointer`}
        onClick={!isEditing ? startEdit : undefined}
      >
        <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
        {isEditing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="mt-1 w-full bg-transparent text-2xl font-semibold text-ok outline-none border-b border-ok/50"
          />
        ) : (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-2xl font-semibold text-ok">{displayValue}</span>
            <Pencil className="h-3 w-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  }

  if (to) {
    return (
      <Link to={to} className={`block group ${baseClasses} transition-colors hover:border-ok/50`}>
        <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-ok truncate">{value}</div>
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ok">{value}</div>
    </div>
  );
}
