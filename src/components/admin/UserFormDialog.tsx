import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiCompanySelect } from '@/components/admin/MultiCompanySelect';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  companies: { id: string; name: string }[];
}

interface UserFormDialogProps {
  open: boolean;
  user: UserData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormDialog({ open, user, onClose, onSuccess }: UserFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!user;

  const [email, setEmail] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch all companies for the multi-select
  const { data: allCompanies = [] } = useQuery({
    queryKey: ['admin-all-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_companies' as any)
        .select('id, name, status')
        .order('name');
      if (error) throw error;
      return (data as any[]) as { id: string; name: string; status?: string }[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      if (user) {
        setEmail(user.email);
        setSelectedCompanyIds(user.companies.map(c => c.id));
      } else {
        setEmail('');
        setSelectedCompanyIds([]);
      }
    }
  }, [open, user]);

  const handleSave = async () => {
    if (!email.trim()) return;
    setSaving(true);

    try {
      if (isEditing) {
        // Diff companies: add new, remove old
        const currentIds = new Set(user.companies.map(c => c.id));
        const newIds = new Set(selectedCompanyIds);

        const toAdd = selectedCompanyIds.filter(id => !currentIds.has(id));
        const toRemove = user.companies.filter(c => !newIds.has(c.id)).map(c => c.id);

        if (toAdd.length > 0) {
          const { error } = await supabase
            .from('user_companies')
            .insert(toAdd.map(companyId => ({
              user_id: user.id,
              company_id: companyId,
            })));
          if (error) throw error;
        }

        if (toRemove.length > 0) {
          const { error } = await supabase
            .from('user_companies')
            .delete()
            .eq('user_id', user.id)
            .in('company_id', toRemove);
          if (error) throw error;
        }
      } else {
        // Create user via edge function
        const { data, error } = await supabase.functions.invoke('admin-users', {
          body: { action: 'create', email: email.trim().toLowerCase() },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const newUserId = data.user.id;

        // Associate with companies
        if (selectedCompanyIds.length > 0) {
          const { error: ucError } = await supabase
            .from('user_companies')
            .insert(selectedCompanyIds.map(companyId => ({
              user_id: newUserId,
              company_id: companyId,
            })));
          if (ucError) throw ucError;
        }
      }

      toast.success(t('admin.users.saveSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md" aria-describedby={isEditing ? undefined : undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('admin.users.edit') : t('admin.users.create')}
          </DialogTitle>
          {isEditing && (
            <DialogDescription>
              {t('admin.users.edit')}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0 px-1">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-email">{t('admin.users.email')}</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEditing}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.users.companies')}</Label>
              <MultiCompanySelect
                companies={allCompanies}
                selectedIds={selectedCompanyIds}
                onChange={setSelectedCompanyIds}
                placeholder={t('admin.users.companiesPlaceholder')}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('admin.users.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !email.trim()}>
            {saving ? t('common.saving') : t('admin.users.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
