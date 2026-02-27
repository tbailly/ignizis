import { ComboboxSelect } from '@/components/admin/ComboboxSelect';
import { useTranslation } from '@/i18n/useTranslation';

interface CompanySelectProps {
  companies: { id: string; name: string; status?: string }[];
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CompanySelect({ companies, value, onChange }: CompanySelectProps) {
  const { t } = useTranslation();

  const active = companies.filter(c => c.status !== 'inactive');
  const inactive = companies.filter(c => c.status === 'inactive');

  return (
    <ComboboxSelect
      groups={[
        { items: active.map(c => ({ id: c.id, label: c.name })) },
        ...(inactive.length > 0
          ? [{ heading: t('common.inactive'), items: inactive.map(c => ({ id: c.id, label: c.name })), className: 'opacity-50' }]
          : []),
      ]}
      selectedIds={value ? [value] : []}
      onToggle={(id) => onChange(id === value ? null : id)}
      onClear={() => onChange(null)}
      placeholder={t('admin.documents.selectCompany')}
      emptyText={t('admin.documents.noCompany')}
    />
  );
}
