import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toKebabCase } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  status: string;
  permissions: Record<string, boolean>;
}

interface CompanyFormDialogProps {
  open: boolean;
  company: CompanyData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompanyFormDialog({ open, company, onClose, onSuccess }: CompanyFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!company;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState(true); // true = active
  const [permJuridique, setPermJuridique] = useState(true);
  const [permComptabilite, setPermComptabilite] = useState(true);
  const [permFinance, setPermFinance] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (company) {
        setName(company.name);
        setSlug(company.slug);
        setSlugManuallyEdited(true);
        setStatus(company.status === 'active');
        setPermJuridique(company.permissions?.juridique !== false);
        setPermComptabilite(company.permissions?.comptabilite !== false);
        setPermFinance(company.permissions?.finance !== false);
      } else {
        setName('');
        setSlug('');
        setSlugManuallyEdited(false);
        setStatus(true);
        setPermJuridique(true);
        setPermComptabilite(true);
        setPermFinance(true);
      }
    }
  }, [open, company]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(toKebabCase(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(toKebabCase(value));
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);

    try {
      const permissions = {
        entreprise: true,
        contrats: true,
        juridique: permJuridique,
        comptabilite: permComptabilite,
        finance: permFinance,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('companies')
          .update({
            name: name.trim(),
            slug: slug.trim(),
            status: status ? 'active' : 'inactive',
            permissions,
          })
          .eq('id', company.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert({
            name: name.trim(),
            slug: slug.trim(),
            status: status ? 'active' : 'inactive',
            permissions,
          });

        if (error) throw error;
      }

      toast.success(t('admin.companies.saveSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('admin.companies.edit') : t('admin.companies.create')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('admin.companies.edit') : t('admin.companies.create')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">{t('admin.companies.name')}</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={100}
              placeholder={t('admin.companies.name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-slug">{t('admin.companies.slug')}</Label>
            <Input
              id="company-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-company"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="company-status">{t('admin.companies.status')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {status ? t('admin.companies.active') : t('admin.companies.inactive')}
              </span>
              <Switch
                id="company-status"
                checked={status}
                onCheckedChange={setStatus}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t('admin.companies.permissions')}</Label>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t('admin.companies.legal')}</span>
              <Switch checked={permJuridique} onCheckedChange={setPermJuridique} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t('admin.companies.accounting')}</span>
              <Switch checked={permComptabilite} onCheckedChange={setPermComptabilite} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t('admin.companies.finance')}</span>
              <Switch checked={permFinance} onCheckedChange={setPermFinance} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('admin.companies.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !slug.trim()}>
            {saving ? t('common.saving') : t('admin.companies.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
