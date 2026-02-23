import { useState, useEffect } from 'react';
import { Scale, Lock, Plus, Info } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface RequestRow {
  id: string;
  request_number: number;
  status: string;
  title: string;
  description: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  quote_pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  client_response: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  invoiced: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

async function generateUniqueRequestNumber(): Promise<number> {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(Math.random() * 9000) + 1000;
    const { data } = await supabase
      .from('requests' as any)
      .select('id')
      .eq('request_number', num)
      .limit(1);
    if (!data || (data as any[]).length === 0) return num;
  }
  throw new Error('Could not generate a unique request number');
}

export default function Juridique() {
  const { currentCompany, hasPermission, refreshCompanies } = useCompany();
  const { profile } = useAuth();
  const { t } = useTranslation();

  // Activation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const companyId = currentCompany?.company?.id;

  const fetchRequests = async () => {
    if (!companyId) return;
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from('requests' as any)
        .select('id, request_number, status, title, description')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests((data as any[]) || []);
    } catch (e: any) {
      console.error('Error fetching requests:', e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (companyId && hasPermission('legal')) {
      fetchRequests();
    }
  }, [companyId, hasPermission('legal')]);

  const handleActivate = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ perm_legal: true })
        .eq('id', companyId);
      if (error) throw error;
      toast.success(t('legal.activateSuccess'));
      setConfirmOpen(false);
      setChecked(false);
      refreshCompanies();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t('common.saving'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !companyId || !profile?.email) return;
    setCreating(true);
    try {
      const requestNumber = await generateUniqueRequestNumber();

      const { error } = await supabase
        .from('requests' as any)
        .insert({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          company_id: companyId,
          status: 'new',
          position: 0,
          request_number: requestNumber,
          requester_email: profile.email,
        });

      if (error) throw error;

      // Fire-and-forget notification email
      supabase.functions.invoke('notify-new-request', {
        body: {
          request_number: requestNumber,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          company_name: currentCompany?.company?.name || '',
          requester_email: profile?.email || null,
        },
      }).catch((err) => console.error('Notification error:', err));

      toast.success(t('legal.createSuccess'));
      setCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchRequests();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t('settings.updateError'));
    } finally {
      setCreating(false);
    }
  };

  // --- Locked state ---
  if (!hasPermission('legal')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('legal.title')}</h1>
          <p className="text-muted-foreground">{currentCompany?.company.name}</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">{t('common.lockedTitle')}</h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">{t('common.lockedDescription')}</p>
          <Button className="mt-6" onClick={() => { setChecked(false); setConfirmOpen(true); }}>
            {t('legal.activateButton')}
          </Button>
        </div>

        <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o) { setConfirmOpen(false); setChecked(false); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('legal.activateTitle')}</DialogTitle>
              <DialogDescription>{t('legal.activateDescription')}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">{t('legal.activateDisclaimer')}</p>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="legal-confirm"
                  checked={checked}
                  onCheckedChange={(v) => setChecked(v === true)}
                />
                <label htmlFor="legal-confirm" className="text-sm leading-tight cursor-pointer">
                  {t('legal.activateCheckbox')}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setConfirmOpen(false); setChecked(false); }} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleActivate} disabled={!checked || saving}>
                {saving ? t('common.saving') : t('legal.activateConfirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Active state ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('legal.title')}</h1>
          <p className="text-muted-foreground">{currentCompany?.company.name}</p>
        </div>
        <Button onClick={() => { setNewTitle(''); setNewDescription(''); setCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('legal.newRequest')}
        </Button>
      </div>

      {/* Disclaimer banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t('legal.disclaimer')}</AlertDescription>
      </Alert>

      {/* Requests table */}
      {loadingRequests ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/20">
          <Scale className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{t('legal.noRequests')}</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{t('legal.columns.number')}</TableHead>
                <TableHead className="w-[140px]">{t('legal.columns.status')}</TableHead>
                <TableHead>{t('legal.columns.title')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('legal.columns.description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">#{r.request_number}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={STATUS_COLORS[r.status] || ''}>
                      {t(`admin.requests.columns.${r.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[300px] truncate">
                    {r.description || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create request modal */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) setCreateOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('legal.createTitle')}</DialogTitle>
            <DialogDescription>{t('legal.createDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-req-title">{t('admin.requests.titleField')}</Label>
              <Input
                id="new-req-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('admin.requests.titlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-req-desc">{t('admin.requests.descriptionField')}</Label>
              <Textarea
                id="new-req-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t('admin.requests.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
              {creating ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
