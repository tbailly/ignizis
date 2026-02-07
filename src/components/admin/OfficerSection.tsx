import { useTranslation } from '@/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DateMaskInput } from '@/components/ui/date-mask-input';
import { Plus, Trash2 } from 'lucide-react';

export interface Officer {
  id: string;
  last_name: string;
  first_name: string;
  date_of_birth: string | null; // display format "DD/MM/YYYY"
  position: string;
}

interface OfficerSectionProps {
  officers: Officer[];
  onChange: (officers: Officer[]) => void;
}

export function OfficerSection({ officers, onChange }: OfficerSectionProps) {
  const { t } = useTranslation();

  const addOfficer = () => {
    onChange([
      ...officers,
      {
        id: `temp-${crypto.randomUUID()}`,
        last_name: '',
        first_name: '',
        date_of_birth: null,
        position: '',
      },
    ]);
  };

  const removeOfficer = (id: string) => {
    onChange(officers.filter((o) => o.id !== id));
  };

  const updateOfficer = (id: string, field: keyof Officer, value: string) => {
    onChange(
      officers.map((o) =>
        o.id === id ? { ...o, [field]: value || (field === 'date_of_birth' ? null : '') } : o
      )
    );
  };

  return (
    <div className="space-y-3">
      <Label>{t('admin.companies.officers')}</Label>

      {officers.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('admin.companies.noOfficers')}</p>
      )}

      {officers.map((officer) => (
        <div
          key={officer.id}
          className="rounded-md border border-border p-3 space-y-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('admin.companies.officerLastName')}</Label>
              <Input
                value={officer.last_name}
                onChange={(e) => updateOfficer(officer.id, 'last_name', e.target.value)}
                placeholder={t('admin.companies.officerLastName')}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('admin.companies.officerFirstName')}</Label>
              <Input
                value={officer.first_name}
                onChange={(e) => updateOfficer(officer.id, 'first_name', e.target.value)}
                placeholder={t('admin.companies.officerFirstName')}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('admin.companies.officerDob')}</Label>
              <DateMaskInput
                value={officer.date_of_birth || ''}
                onChange={(val) => updateOfficer(officer.id, 'date_of_birth', val)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('admin.companies.officerPosition')}</Label>
              <Input
                value={officer.position}
                onChange={(e) => updateOfficer(officer.id, 'position', e.target.value)}
                placeholder={t('admin.companies.officerPosition')}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOfficer(officer.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('admin.companies.removeOfficer')}
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addOfficer} className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        {t('admin.companies.addOfficer')}
      </Button>
    </div>
  );
}
