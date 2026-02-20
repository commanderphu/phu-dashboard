import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableWidgetProps {
  id: string;
  colSpan: string;
  children: React.ReactNode;
}

export function SortableWidget({ id, colSpan, children }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className={`group ${colSpan}`} {...attributes}>
      <button
        {...listeners}
        aria-label="Widget verschieben"
        className="absolute top-3 right-3 z-10 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted" />
      </button>
      {children}
    </div>
  );
}
