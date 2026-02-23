import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { RequestData } from './RequestFormDialog';

const STATUSES = [
  'new',
  'quote_pending',
  'in_progress',
  'client_response',
  'invoiced',
  'done',
] as const;

interface KanbanBoardProps {
  requests: RequestData[];
  onDataChange: () => void;
  onEdit: (request: RequestData) => void;
}

export function KanbanBoard({ requests: initialRequests, onDataChange, onEdit }: KanbanBoardProps) {
  const { t } = useTranslation();
  const [localRequests, setLocalRequests] = useState<RequestData[]>(initialRequests);
  const [activeRequest, setActiveRequest] = useState<RequestData | null>(null);

  // Sync when parent data changes
  if (JSON.stringify(initialRequests.map(r => r.id + r.status + r.position)) !==
      JSON.stringify(localRequests.map(r => r.id + r.status + r.position))) {
    setLocalRequests(initialRequests);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const getColumnRequests = (status: string) =>
    localRequests
      .filter(r => r.status === status)
      .sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const req = localRequests.find(r => r.id === event.active.id);
    setActiveRequest(req ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveRequest(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeReq = localRequests.find(r => r.id === activeId);
    if (!activeReq) return;

    const isOverColumn = (STATUSES as readonly string[]).includes(overId);
    const destStatus = isOverColumn
      ? overId
      : (localRequests.find(r => r.id === overId)?.status ?? activeReq.status);

    const sourceStatus = activeReq.status;

    if (sourceStatus === destStatus) {
      const colItems = getColumnRequests(sourceStatus);
      const oldIndex = colItems.findIndex(r => r.id === activeId);
      const newIndex = colItems.findIndex(r => r.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(colItems, oldIndex, newIndex).map((r, i) => ({
        ...r,
        position: i,
      }));

      setLocalRequests(prev => {
        const others = prev.filter(r => r.status !== sourceStatus);
        return [...others, ...reordered];
      });

      try {
        await Promise.all(
          reordered.map(r =>
            supabase.from('requests' as any).update({ position: r.position }).eq('id', r.id)
          )
        );
        onDataChange();
      } catch (err: any) {
        toast.error(err.message);
        onDataChange();
      }
    } else {
      const destColItems = getColumnRequests(destStatus);
      const newPosition = destColItems.length;

      setLocalRequests(prev =>
        prev.map(r =>
          r.id === activeId
            ? { ...r, status: destStatus, position: newPosition }
            : r
        )
      );

      try {
        const { error } = await supabase
          .from('requests' as any)
          .update({ status: destStatus, position: newPosition })
          .eq('id', activeId);

        if (error) throw error;

        const newLabel = t(`admin.requests.columns.${destStatus}`);
        toast.success(`${t('admin.requests.statusChanged')} → ${newLabel}`);
        onDataChange();
      } catch (err: any) {
        toast.error(err.message);
        onDataChange();
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 pb-4 h-full">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            label={t(`admin.requests.columns.${status}`)}
            requests={getColumnRequests(status)}
            onEdit={onEdit}
            dropZoneMode={!!activeRequest && status !== activeRequest.status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeRequest ? (
          <div className="rotate-1 shadow-lg opacity-95 w-64">
            <KanbanCard
              request={activeRequest}
              onEdit={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
