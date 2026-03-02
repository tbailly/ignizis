import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export function TagManagementDialog({ onClose }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [deletingTag, setDeletingTag] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['document_tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_document_tags' as any)
        .select('*')
        .order('name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['document_tags'] });
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
  };

  const handleAdd = async () => {
    const name = newTag.trim();
    if (!name) return;
    const { error } = await supabase.from('document_tags').insert({ name });
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.documents.tagCreateSuccess'));
    setNewTag('');
    invalidate();
  };

  const handleRename = async (id: string) => {
    const name = editValue.trim();
    if (!name) return;
    const { error } = await supabase.from('document_tags').update({ name }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.documents.tagRenameSuccess'));
    setEditingId(null);
    invalidate();
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    const { error } = await supabase.from('document_tags').update({ deleted_at: new Date().toISOString() } as any).eq('id', deletingTag.id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.documents.tagDeleteSuccess'));
    setDeletingTag(null);
    setDeleteConfirm('');
    invalidate();
  };

  const startEdit = (tag: { id: string; name: string }) => {
    setEditingId(tag.id);
    setEditValue(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('admin.documents.manageTags')}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 min-h-0 px-1">
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              ) : tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('admin.documents.noTags')}</p>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    {editingId === tag.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(tag.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1 h-8"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRename(tag.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{tag.name}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(tag)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingTag(tag)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Input
              placeholder={t('admin.documents.tagName')}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAdd} disabled={!newTag.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              {t('admin.documents.addTag')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTag} onOpenChange={(open) => { if (!open) { setDeletingTag(null); setDeleteConfirm(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.documents.tagDeleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.documents.tagDeleteConfirmDesc')}
              <span className="font-semibold block mt-1">{deletingTag?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={deletingTag?.name}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== deletingTag?.name}
              onClick={handleDelete}
            >
              {t('admin.documents.tagDeleteConfirmButton')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
