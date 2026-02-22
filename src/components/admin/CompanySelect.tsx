import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useTranslation } from '@/i18n/useTranslation';

interface CompanySelectProps {
  companies: { id: string; name: string }[];
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CompanySelect({ companies, value, onChange }: CompanySelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selected = companies.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.name : t('admin.documents.selectCompany')}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={0}
                className="rounded-sm hover:bg-accent p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onChange(null);
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
          <CommandInput placeholder={t('admin.documents.selectCompany')} />
          <CommandList>
            <CommandEmpty>{t('admin.documents.noCompany')}</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    onChange(company.id === value ? null : company.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4 shrink-0', value === company.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{company.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
