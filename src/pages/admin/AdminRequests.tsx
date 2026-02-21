import { useState } from 'react';
import { Plus, Kanban } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/admin/KanbanBoard';
import { RequestFormDialog, type RequestData } from '@/components/admin/RequestFormDialog';

interface Company {
  id: string;
  name: string;
}

export default function AdminRequests() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RequestData | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests' as any)
        .select('id, title, description, status, company_id, position, request_number, companies(id, name)')
        .order('position', { ascending: true });

      if (error) throw error;

      return ((data as any[]) || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        company_id: row.company_id,
        position: row.position,
        request_number: row.request_number,
        company: row.companies ?? undefined,
      })) as RequestData[];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['admin-companies-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return (data ?? []) as Company[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-requests'] });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('requests' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(t('admin.requests.deleteSuccess'));
      setEditingRequest(null);
      invalidate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Kanban className="h-8 w-8 text-primary" />
            {t('admin.requests.title')}
          </h1>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('admin.requests.create')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">{t('common.loading')}</div>
      ) : (
        <KanbanBoard
          requests={requests}
          onDataChange={invalidate}
          onEdit={setEditingRequest}
        />
      )}

      {isCreating && (
        <RequestFormDialog
          companies={companies}
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            invalidate();
          }}
        />
      )}

      {editingRequest && (
        <RequestFormDialog
          request={editingRequest}
          companies={companies}
          onClose={() => setEditingRequest(null)}
          onSuccess={() => {
            setEditingRequest(null);
            invalidate();
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
