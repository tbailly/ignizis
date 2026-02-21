import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { KanbanCard } from './KanbanCard';
import type { RequestData } from './RequestFormDialog';

interface KanbanColumnProps {
  status: string;
  label: string;
  requests: RequestData[];
  onEdit: (request: RequestData) => void;
}

export function KanbanColumn({ status, label, requests, onEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-semibold text-foreground truncate">{label}</span>
        <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
          {requests.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-lg p-2 min-h-[200px] space-y-2 transition-colors
          ${isOver ? 'bg-accent/60' : 'bg-muted/40'}
        `}
      >
        <SortableContext
          items={requests.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {requests.map((request) => (
            <KanbanCard
              key={request.id}
              request={request}
              onEdit={onEdit}
            />
          ))}
        </SortableContext>

        {requests.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[80px]">
            <p className="text-xs text-muted-foreground/60 text-center">—</p>
          </div>
        )}
      </div>
    </div>
  );
}
