import { useState, useRef } from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiCompanySelectProps {
  companies: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function MultiCompanySelect({ companies, selectedIds, onChange, placeholder }: MultiCompanySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCompanies = companies.filter(c => selectedIds.includes(c.id));

  const toggleCompany = (companyId: string) => {
    if (selectedIds.includes(companyId)) {
      onChange(selectedIds.filter(id => id !== companyId));
    } else {
      onChange([...selectedIds, companyId]);
    }
  };

  const removeCompany = (companyId: string) => {
    onChange(selectedIds.filter(id => id !== companyId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : placeholder || 'Select...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No company found.</CommandEmpty>
              <CommandGroup>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name}
                    onSelect={() => toggleCompany(company.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIds.includes(company.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {company.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCompanies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCompanies.map(c => (
            <Badge key={c.id} variant="secondary" className="gap-1">
              {c.name}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => removeCompany(c.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
