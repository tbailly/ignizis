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

interface OfficerData {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  position: string;
  company_name: string;
}

interface OfficerFormDialogProps {
  officer: OfficerData;
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [position, setPosition] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(officer.first_name);
    setLastName(officer.last_name);
    setDateOfBirth(isoToDisplay(officer.date_of_birth));
    setPosition(officer.position);
  }, [officer]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !position.trim()) return;
    setSaving(true);

    try {
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

      toast.success(t('admin.officers.saveSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error updating officer:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.officers.edit')}</DialogTitle>
          <DialogDescription>{t('admin.officers.editDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('admin.officers.company')}</Label>
            <Input value={officer.company_name} disabled />
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
