import { ComboboxSelect } from '@/components/admin/ComboboxSelect';

interface MultiCompanySelectProps {
  companies: { id: string; name: string; status?: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function MultiCompanySelect({ companies, selectedIds, onChange, placeholder }: MultiCompanySelectProps) {
  const active = companies.filter(c => c.status !== 'inactive');
  const inactive = companies.filter(c => c.status === 'inactive');

  return (
    <ComboboxSelect
      groups={[
        { items: active.map(c => ({ id: c.id, label: c.name })) },
        ...(inactive.length > 0
          ? [{ heading: 'Inactives', items: inactive.map(c => ({ id: c.id, label: c.name })), className: 'opacity-50' }]
          : []),
      ]}
      selectedIds={selectedIds}
      onToggle={(id) => {
        onChange(
          selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id]
        );
      }}
      placeholder={placeholder || 'Select...'}
      emptyText="No company found."
      multiSelect
      renderBadges
      onRemove={(id) => onChange(selectedIds.filter(i => i !== id))}
    />
  );
}
