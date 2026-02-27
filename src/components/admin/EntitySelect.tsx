import { Building2, UserRound } from 'lucide-react';
import { ComboboxSelect } from '@/components/admin/ComboboxSelect';
import { useTranslation } from '@/i18n/useTranslation';

interface EntitySelectProps {
  companies: { id: string; name: string; status?: string }[];
  officers: { id: string; first_name: string; last_name: string }[];
  linkedType: 'company' | 'officer' | null;
  linkedId: string | null;
  onChange: (linkedType: 'company' | 'officer' | null, linkedId: string | null) => void;
}

export function EntitySelect({ companies, officers, linkedType, linkedId, onChange }: EntitySelectProps) {
  const { t } = useTranslation();

  const activeCompanies = companies.filter(c => c.status !== 'inactive');
  const inactiveCompanies = companies.filter(c => c.status === 'inactive');

  const icon = (type: 'company' | 'officer') =>
    type === 'company'
      ? <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      : <UserRound className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />;

  const companyItem = (c: { id: string; name: string }) => ({
    id: `company:${c.id}`,
    label: c.name,
    icon: icon('company'),
  });

  const groups = [
    ...(activeCompanies.length > 0
      ? [{ heading: t('sidebar.adminCompanies'), items: activeCompanies.map(companyItem) }]
      : []),
    ...(officers.length > 0
      ? [{
          heading: t('sidebar.adminOfficers'),
          items: officers.map(o => ({
            id: `officer:${o.id}`,
            label: `${o.first_name} ${o.last_name}`,
            icon: icon('officer'),
          })),
        }]
      : []),
    ...(inactiveCompanies.length > 0
      ? [{ heading: t('common.inactiveCompanies'), items: inactiveCompanies.map(companyItem), className: 'opacity-50' }]
      : []),
  ];

  const currentKey = linkedType && linkedId ? `${linkedType}:${linkedId}` : null;

  const selectedLabel = (() => {
    if (linkedType === 'company') {
      const c = companies.find(c => c.id === linkedId);
      return c ? c.name : null;
    }
    if (linkedType === 'officer') {
      const o = officers.find(o => o.id === linkedId);
      return o ? `${o.first_name} ${o.last_name}` : null;
    }
    return null;
  })();

  return (
    <ComboboxSelect
      groups={groups}
      selectedIds={currentKey ? [currentKey] : []}
      onToggle={(compositeId) => {
        const [type, id] = compositeId.split(':') as ['company' | 'officer', string];
        const isSame = linkedType === type && linkedId === id;
        onChange(isSame ? null : type, isSame ? null : id);
      }}
      onClear={() => onChange(null, null)}
      placeholder={t('admin.documents.selectCompanyOrOfficer')}
      emptyText={t('admin.documents.noCompany')}
      renderTriggerLabel={(selected) => {
        if (!selectedLabel) return null;
        return (
          <span className="flex items-center gap-2">
            {linkedType === 'company' ? icon('company') : icon('officer')}
            {selectedLabel}
          </span>
        );
      }}
    />
  );
}
