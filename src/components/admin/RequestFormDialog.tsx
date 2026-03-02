import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Check, ChevronsUpDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { CompanySelect } from '@/components/admin/CompanySelect';

export interface RequestData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  company_id: string;
  position: number;
  request_number: number;
  requester_email: string | null;
  company?: { id: string; name: string };
}

interface Company {
  id: string;
  name: string;
  status?: string;
}

interface RequestFormDialogProps {
  request?: RequestData;
  companies: Company[];
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (id: string) => Promise<void>;
}

const STATUS_VALUES = [
  'new',
  'quote_pending',
  'in_progress',
  'client_response',
  'invoiced',
  'done',
] as const;

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

export function RequestFormDialog({ request, companies, onClose, onSuccess, onDelete }: RequestFormDialogProps) {
  const { t } = useTranslation();
  const isEditMode = !!request;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [suggestedEmails, setSuggestedEmails] = useState<string[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [status, setStatus] = useState<string>('new');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description ?? '');
      setCompanyId(request.company_id);
      setRequesterEmail(request.requester_email ?? '');
      setStatus(request.status);
    } else {
      setTitle('');
      setDescription('');
      setCompanyId('');
      setRequesterEmail('');
      setStatus('new');
    }
  }, [request]);

  // Fetch suggested emails when companyId changes
  useEffect(() => {
    if (!companyId) {
      setSuggestedEmails([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('user_companies')
        .select('users(email)')
        .eq('company_id', companyId);
      const emails = ((data as any[]) || [])
        .map((row: any) => row.users?.email)
        .filter(Boolean) as string[];
      setSuggestedEmails([...new Set(emails)].sort());
    })();
  }, [companyId]);

  const selectedCompany = companies.find(c => c.id === companyId);

  const handleSave = async () => {
    if (!title.trim() || !companyId) return;
    setSaving(true);

    try {
      const previousStatus = request?.status;

      if (isEditMode && request) {
        const { error } = await supabase
          .from('requests' as any)
          .update({
            title: title.trim(),
            description: description.trim() || null,
            company_id: companyId,
            status,
          })
          .eq('id', request.id);

        if (error) throw error;

        if (previousStatus !== status) {
          const newLabel = t(`admin.requests.columns.${status}`);
          toast.success(`${t('admin.requests.statusChanged')} → ${newLabel}`);
        } else {
          toast.success(t('admin.requests.saveSuccess'));
        }
      } else {
        const requestNumber = await generateUniqueRequestNumber();

        const { data: maxData } = await supabase
          .from('requests' as any)
          .select('position')
          .eq('status', 'new')
          .eq('company_id', companyId)
          .order('position', { ascending: false })
          .limit(1);

        const maxPos = (maxData as any)?.[0]?.position ?? -1;

        const { error } = await supabase
          .from('requests' as any)
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            company_id: companyId,
            status: 'new',
            position: maxPos + 1,
            request_number: requestNumber,
            requester_email: requesterEmail.trim() || null,
          });

        if (error) throw error;

        toast.success(t('admin.requests.createSuccess'));
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving request:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!request || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(request.id);
    } finally {
      setDeleting(false);
    }
  };

  const canSave = title.trim().length > 0 && companyId.length > 0;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md" aria-describedby={isEditMode ? undefined : undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('admin.requests.edit') : t('admin.requests.create')}
          </DialogTitle>
          {isEditMode && (
            <DialogDescription>
              {t('admin.requests.editDesc')}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Request number badge in edit mode */}
          {isEditMode && request && (
            <Badge variant="outline" className="w-fit font-mono text-sm mb-4">
              #{request.request_number}
            </Badge>
          )}

          <div className="space-y-4 py-2">
            {/* Company */}
            <div className="space-y-2">
              <Label>{t('admin.requests.company')}</Label>
              {isEditMode ? (
                <Input
                  value={selectedCompany?.name ?? ''}
                  disabled
                  className="opacity-70"
                />
              ) : (
                <CompanySelect
                  companies={companies}
                  value={companyId || null}
                  onChange={(id) => setCompanyId(id || '')}
                />
              )}
            </div>

            {/* Requester email — visible when company is selected */}
            {companyId && (
              <div className="space-y-2">
                <Label>{t('admin.requests.requesterEmail')}</Label>
                {isEditMode ? (
                  <Input
                    value={requesterEmail}
                    disabled
                    className="opacity-70"
                  />
                ) : (
                  <Popover open={emailOpen} onOpenChange={setEmailOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={emailOpen}
                        className="w-full justify-between font-normal"
                      >
                        <span className={cn('truncate', !requesterEmail && 'text-muted-foreground')}>
                          {requesterEmail || t('admin.requests.requesterEmailPlaceholder')}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={t('admin.requests.requesterEmailPlaceholder')}
                          value={requesterEmail}
                          onValueChange={setRequesterEmail}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {requesterEmail ? (
                              <button
                                type="button"
                                className="w-full text-left px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded"
                                onClick={() => setEmailOpen(false)}
                              >
                                {requesterEmail}
                              </button>
                            ) : null}
                          </CommandEmpty>
                          <CommandGroup>
                            {suggestedEmails.map((email) => (
                              <CommandItem
                                key={email}
                                value={email}
                                onSelect={() => {
                                  setRequesterEmail(email);
                                  setEmailOpen(false);
                                }}
                              >
                                <Check
                                  className={cn('mr-2 h-4 w-4 shrink-0', requesterEmail === email ? 'opacity-100' : 'opacity-0')}
                                />
                                <span className="truncate">{email}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="request-title">{t('admin.requests.titleField')}</Label>
              <Input
                id="request-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('admin.requests.titlePlaceholder')}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="request-description">{t('admin.requests.descriptionField')}</Label>
              <Textarea
                id="request-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('admin.requests.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* Status — edit mode only */}
            {isEditMode && (
              <div className="space-y-2">
                <Label>{t('admin.requests.status')}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`admin.requests.columns.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex !justify-between gap-2">
          {/* Delete button — edit mode only */}
          {isEditMode && onDelete ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={saving || deleting} className="gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  {t('admin.companies.delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('admin.requests.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('admin.requests.deleteConfirmDesc')}
                    <span className="block font-medium text-foreground mt-1">{request!.title}</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('admin.requests.deleteConfirmButton')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : <div />}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving || deleting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving || !canSave || deleting}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
