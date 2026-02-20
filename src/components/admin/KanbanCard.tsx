import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';
import type { RequestData } from './RequestFormDialog';

interface KanbanCardProps {
  request: RequestData;
  onEdit: (request: RequestData) => void;
  onDelete: (id: string) => void;
}

export function KanbanCard({ request, onEdit, onDelete }: KanbanCardProps) {
  const { t } = useTranslation();
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
      className="bg-card border rounded-lg p-3 shadow-sm group"
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          tabIndex={-1}
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Card content — click to edit */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit(request)}
        >
          <p className="text-sm font-medium leading-snug break-words">
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

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.requests.deleteConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.requests.deleteConfirmDesc')}
                <span className="block font-medium text-foreground mt-1">{request.title}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(request.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('admin.requests.deleteConfirmButton')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
