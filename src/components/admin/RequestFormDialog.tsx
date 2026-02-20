import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';

export interface RequestData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  company_id: string;
  position: number;
  company?: { id: string; name: string };
}

interface Company {
  id: string;
  name: string;
}

interface RequestFormDialogProps {
  request?: RequestData;
  companies: Company[];
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_VALUES = [
  'new',
  'quote_pending',
  'in_progress',
  'client_response',
  'invoiced',
  'done',
] as const;

export function RequestFormDialog({ request, companies, onClose, onSuccess }: RequestFormDialogProps) {
  const { t } = useTranslation();
  const isEditMode = !!request;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [status, setStatus] = useState<string>('new');
  const [companyOpen, setCompanyOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description ?? '');
      setCompanyId(request.company_id);
      setStatus(request.status);
    } else {
      setTitle('');
      setDescription('');
      setCompanyId('');
      setStatus('new');
    }
  }, [request]);

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
        // Compute max position in 'new' column
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

  const canSave = title.trim().length > 0 && companyId.length > 0;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('admin.requests.edit') : t('admin.requests.create')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('admin.requests.editDesc') : t('admin.requests.createDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Company */}
          <div className="space-y-2">
            <Label>{t('admin.requests.company')}</Label>
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companyOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className={cn('truncate', !selectedCompany && 'text-muted-foreground')}>
                    {selectedCompany ? selectedCompany.name : t('admin.requests.companyPlaceholder')}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup>
                      {companies.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.name}
                          onSelect={() => {
                            setCompanyId(c.id);
                            setCompanyOpen(false);
                          }}
                        >
                          <Check
                            className={cn('mr-2 h-4 w-4 shrink-0', companyId === c.id ? 'opacity-100' : 'opacity-0')}
                          />
                          <span className="truncate">{c.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Title */}
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
