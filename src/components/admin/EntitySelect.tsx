import { useState } from 'react';
import { Check, ChevronsUpDown, X, Building2, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useTranslation } from '@/i18n/useTranslation';

interface EntitySelectProps {
  companies: { id: string; name: string }[];
  officers: { id: string; first_name: string; last_name: string }[];
  linkedType: 'company' | 'officer' | null;
  linkedId: string | null;
  onChange: (linkedType: 'company' | 'officer' | null, linkedId: string | null) => void;
}

export function EntitySelect({ companies, officers, linkedType, linkedId, onChange }: EntitySelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedLabel = (() => {
    if (linkedType === 'company') {
      return companies.find(c => c.id === linkedId)?.name || null;
    }
    if (linkedType === 'officer') {
      const o = officers.find(o => o.id === linkedId);
      return o ? `${o.first_name} ${o.last_name}` : null;
    }
    return null;
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate flex items-center gap-2', !selectedLabel && 'text-muted-foreground')}>
            {selectedLabel ? (
              <>
                {linkedType === 'company' ? <Building2 className="h-4 w-4 shrink-0" /> : <UserRound className="h-4 w-4 shrink-0" />}
                {selectedLabel}
              </>
            ) : (
              t('admin.documents.selectCompanyOrOfficer')
            )}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {linkedId && (
              <span
                role="button"
                tabIndex={0}
                className="rounded-sm hover:bg-accent p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null, null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onChange(null, null);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('admin.documents.selectCompanyOrOfficer')} />
          <CommandList>
            <CommandEmpty>{t('admin.documents.noCompany')}</CommandEmpty>
            {companies.length > 0 && (
              <CommandGroup heading={t('sidebar.adminCompanies')}>
                {companies.map((company) => (
                  <CommandItem
                    key={`company:${company.id}`}
                    value={`company ${company.name}`}
                    onSelect={() => {
                      const isSame = linkedType === 'company' && linkedId === company.id;
                      onChange(isSame ? null : 'company', isSame ? null : company.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4 shrink-0', linkedType === 'company' && linkedId === company.id ? 'opacity-100' : 'opacity-0')}
                    />
                    <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{company.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {officers.length > 0 && (
              <CommandGroup heading={t('sidebar.adminOfficers')}>
                {officers.map((officer) => {
                  const fullName = `${officer.first_name} ${officer.last_name}`;
                  return (
                    <CommandItem
                      key={`officer:${officer.id}`}
                      value={`officer ${fullName}`}
                      onSelect={() => {
                        const isSame = linkedType === 'officer' && linkedId === officer.id;
                        onChange(isSame ? null : 'officer', isSame ? null : officer.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4 shrink-0', linkedType === 'officer' && linkedId === officer.id ? 'opacity-100' : 'opacity-0')}
                      />
                      <UserRound className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{fullName}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
