import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RequestData } from './RequestFormDialog';

interface KanbanCardProps {
  request: RequestData;
  onEdit: (request: RequestData) => void;
}

export function KanbanCard({ request, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing touch-none"
      {...attributes}
      {...listeners}
      onClick={() => onEdit(request)}
    >
      <p className="text-sm font-medium leading-snug break-words">
        <span className="text-muted-foreground font-mono mr-1.5">#{request.request_number}</span>
        {request.title}
      </p>
      {request.company && (
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {request.company.name}
        </p>
      )}
      {request.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
          {request.description}
        </p>
      )}
    </div>
  );
}
