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
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { OfficerSection, type Officer } from '@/components/admin/OfficerSection';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  status: string;
  company_number: string | null;
  address: string | null;
  country: string | null;
  perm_legal: boolean;
  perm_accounting: boolean;
  perm_finance: boolean;
}

interface CompanyFormDialogProps {
  open: boolean;
  company: CompanyData | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COUNTRY_OPTIONS = [
  { code: 'FR', label: 'admin.companies.countries.FR' },
  { code: 'AE', label: 'admin.companies.countries.AE' },
  { code: 'HK', label: 'admin.companies.countries.HK' },
  { code: 'CH', label: 'admin.companies.countries.CH' },
  { code: 'BE', label: 'admin.companies.countries.BE' },
  { code: 'US', label: 'admin.companies.countries.US' },
];

// Date helpers
function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string | null {
  if (!display || display.length !== 10) return null;
  const [d, m, y] = display.split('/');
  if (!d || !m || !y || y.length !== 4) return null;
  const date = new Date(`${y}-${m}-${d}`);
  if (isNaN(date.getTime())) return null;
  return `${y}-${m}-${d}`;
}

export function CompanyFormDialog({ open, company, onClose, onSuccess }: CompanyFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!company;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState(true);
  const [companyNumber, setCompanyNumber] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [permLegal, setPermLegal] = useState(true);
  const [permAccounting, setPermAccounting] = useState(true);
  const [permFinance, setPermFinance] = useState(true);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (company) {
        setName(company.name);
        setSlug(company.slug);
        setSlugManuallyEdited(true);
        setStatus(company.status === 'active');
        setCompanyNumber(company.company_number || '');
        setAddress(company.address || '');
        setCountry(company.country || '');
        setPermLegal(company.perm_legal !== false);
        setPermAccounting(company.perm_accounting !== false);
        setPermFinance(company.perm_finance !== false);
        // Load officers from DB
        loadOfficers(company.id);
      } else {
        setName('');
        setSlug('');
        setSlugManuallyEdited(false);
        setStatus(true);
        setCompanyNumber('');
        setAddress('');
        setCountry('');
        setPermLegal(true);
        setPermAccounting(true);
        setPermFinance(true);
        setOfficers([]);
      }
    }
  }, [open, company]);

  const loadOfficers = async (companyId: string) => {
    const { data, error } = await supabase
      .from('company_officers')
      .select('id, last_name, first_name, date_of_birth, position')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading officers:', error);
      return;
    }

    setOfficers(
      (data || []).map((o) => ({
        id: o.id,
        last_name: o.last_name,
        first_name: o.first_name,
        date_of_birth: isoToDisplay(o.date_of_birth),
        position: o.position,
      }))
    );
  };

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

  const syncOfficers = async (companyId: string) => {
    // Load existing officers from DB
    const { data: existing, error: fetchErr } = await supabase
      .from('company_officers')
      .select('id')
      .eq('company_id', companyId);

    if (fetchErr) throw fetchErr;

    const existingIds = new Set((existing || []).map((o) => o.id));
    const localIds = new Set(officers.filter((o) => !o.id.startsWith('temp-')).map((o) => o.id));

    // Delete removed officers
    const toDelete = [...existingIds].filter((id) => !localIds.has(id));
    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('company_officers')
        .delete()
        .in('id', toDelete);
      if (error) throw error;
    }

    // Insert new officers
    const toInsert = officers
      .filter((o) => o.id.startsWith('temp-'))
      .map((o) => ({
        company_id: companyId,
        last_name: o.last_name,
        first_name: o.first_name,
        date_of_birth: displayToIso(o.date_of_birth || ''),
        position: o.position,
      }));

    if (toInsert.length > 0) {
      const { error } = await supabase.from('company_officers').insert(toInsert);
      if (error) throw error;
    }

    // Update existing officers
    const toUpdate = officers.filter((o) => !o.id.startsWith('temp-') && existingIds.has(o.id));
    for (const o of toUpdate) {
      const { error } = await supabase
        .from('company_officers')
        .update({
          last_name: o.last_name,
          first_name: o.first_name,
          date_of_birth: displayToIso(o.date_of_birth || ''),
          position: o.position,
        })
        .eq('id', o.id);
      if (error) throw error;
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        status: status ? 'active' : 'inactive',
        company_number: companyNumber.trim() || null,
        address: address.trim() || null,
        country: country || null,
        perm_legal: permLegal,
        perm_accounting: permAccounting,
        perm_finance: permFinance,
      };

      let companyId: string;

      if (isEditing) {
        const { error } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', company.id);
        if (error) throw error;
        companyId = company.id;
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        companyId = data.id;
      }

      // Sync officers
      await syncOfficers(companyId);

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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('admin.companies.edit') : t('admin.companies.create')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('admin.companies.edit') : t('admin.companies.create')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Company name */}
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

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="company-slug">{t('admin.companies.slug')}</Label>
            <Input
              id="company-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-company"
            />
          </div>

          {/* Company number */}
          <div className="space-y-2">
            <Label htmlFor="company-number">{t('admin.companies.companyNumber')}</Label>
            <Input
              id="company-number"
              value={companyNumber}
              onChange={(e) => setCompanyNumber(e.target.value)}
              placeholder={t('admin.companies.companyNumber')}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="company-address">{t('admin.companies.address')}</Label>
            <Textarea
              id="company-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('admin.companies.addressPlaceholder')}
              rows={3}
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="company-country">{t('admin.companies.country')}</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="company-country">
                <SelectValue placeholder={t('admin.companies.countryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {t(opt.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
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

          {/* Permissions */}
          <div className="space-y-3">
            <Label>{t('admin.companies.permissions')}</Label>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t('admin.companies.legal')}</span>
              <Switch checked={permLegal} onCheckedChange={setPermLegal} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t('admin.companies.accounting')}</span>
              <Switch checked={permAccounting} onCheckedChange={setPermAccounting} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">{t('admin.companies.finance')}</span>
              <Switch checked={permFinance} onCheckedChange={setPermFinance} />
            </div>
          </div>

          {/* Corporate officers */}
          <OfficerSection officers={officers} onChange={setOfficers} />
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
