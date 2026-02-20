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
import { DateMaskInput } from '@/components/ui/date-mask-input';
import { MultiCompanySelect } from '@/components/admin/MultiCompanySelect';

interface OfficerData {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  position: string;
  companies: { id: string; name: string }[];
}

interface OfficerFormDialogProps {
  officer?: OfficerData;
  onClose: () => void;
  onSuccess: () => void;
}

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

export function OfficerFormDialog({ officer, onClose, onSuccess }: OfficerFormDialogProps) {
  const { t } = useTranslation();
  const isEditMode = !!officer;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [position, setPosition] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [allCompanies, setAllCompanies] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (officer) {
      setFirstName(officer.first_name);
      setLastName(officer.last_name);
      setDateOfBirth(isoToDisplay(officer.date_of_birth));
      setPosition(officer.position);
      setSelectedCompanyIds(officer.companies.map(c => c.id));
    } else {
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setPosition('');
      setSelectedCompanyIds([]);
    }

    supabase.from('companies').select('id, name').order('name').then(({ data }) => {
      setAllCompanies(data || []);
    });
  }, [officer]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !position.trim()) return;
    setSaving(true);

    try {
      if (isEditMode && officer) {
        // Edit mode: UPDATE + diff assignments
        const { error } = await supabase
          .from('company_officers')
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            date_of_birth: displayToIso(dateOfBirth),
            position: position.trim(),
          })
          .eq('id', officer.id);

        if (error) throw error;

        const currentIds = new Set(officer.companies.map(c => c.id));
        const newIds = new Set(selectedCompanyIds);

        const toRemove = [...currentIds].filter(id => !newIds.has(id));
        if (toRemove.length > 0) {
          const { error: delErr } = await (supabase
            .from('officer_company_assignments' as any)
            .delete()
            .eq('officer_id', officer.id)
            .in('company_id', toRemove) as any);
          if (delErr) throw delErr;
        }

        const toAdd = [...newIds].filter(id => !currentIds.has(id));
        if (toAdd.length > 0) {
          const { error: insErr } = await (supabase
            .from('officer_company_assignments' as any)
            .insert(toAdd.map(companyId => ({ officer_id: officer.id, company_id: companyId }))) as any);
          if (insErr) throw insErr;
        }

        toast.success(t('admin.officers.saveSuccess'));
      } else {
        // Create mode: INSERT officer then assignments
        const { data: newOfficer, error: insertErr } = await supabase
          .from('company_officers')
          .insert({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            date_of_birth: displayToIso(dateOfBirth),
            position: position.trim(),
          })
          .select('id')
          .single();

        if (insertErr) throw insertErr;

        if (selectedCompanyIds.length > 0) {
          const { error: assignErr } = await (supabase
            .from('officer_company_assignments' as any)
            .insert(selectedCompanyIds.map(companyId => ({ officer_id: newOfficer.id, company_id: companyId }))) as any);
          if (assignErr) throw assignErr;
        }

        toast.success(t('admin.officers.createSuccess'));
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving officer:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('admin.officers.edit') : t('admin.officers.create')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('admin.officers.editDesc') : t('admin.officers.createDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('admin.officers.companies')}</Label>
            <MultiCompanySelect
              companies={allCompanies}
              selectedIds={selectedCompanyIds}
              onChange={setSelectedCompanyIds}
              placeholder={t('admin.officers.selectCompanies')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officer-first-name">{t('admin.officers.firstName')}</Label>
            <Input
              id="officer-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officer-last-name">{t('admin.officers.lastName')}</Label>
            <Input
              id="officer-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officer-dob">{t('admin.officers.dateOfBirth')}</Label>
            <DateMaskInput
              id="officer-dob"
              value={dateOfBirth}
              onChange={setDateOfBirth}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officer-position">{t('admin.officers.position')}</Label>
            <Input
              id="officer-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !firstName.trim() || !lastName.trim() || !position.trim()}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
