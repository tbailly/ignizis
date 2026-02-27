import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';

export interface ComboboxItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ComboboxGroup {
  heading?: string;
  items: ComboboxItem[];
  className?: string;
}

export interface ComboboxSelectProps {
  groups: ComboboxGroup[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear?: () => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText: string;
  multiSelect?: boolean;
  renderTriggerLabel?: (selected: ComboboxItem[]) => React.ReactNode;
  renderBadges?: boolean;
  onRemove?: (id: string) => void;
}

export function ComboboxSelect({
  groups,
  selectedIds,
  onToggle,
  onClear,
  placeholder,
  searchPlaceholder,
  emptyText,
  multiSelect = false,
  renderTriggerLabel,
  renderBadges = false,
  onRemove,
}: ComboboxSelectProps) {
  const [open, setOpen] = useState(false);

  const allItems = groups.flatMap(g => g.items);
  const selectedItems = allItems.filter(item => selectedIds.includes(item.id));

  const handleToggle = (id: string) => {
    onToggle(id);
    if (!multiSelect) setOpen(false);
  };

  const triggerContent = renderTriggerLabel
    ? renderTriggerLabel(selectedItems)
    : selectedItems.length > 0
      ? (multiSelect ? `${selectedItems.length} selected` : selectedItems[0]?.label)
      : null;

  return (
    <div className={cn(renderBadges && 'space-y-2')}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className={cn('truncate', !triggerContent && 'text-muted-foreground')}>
              {triggerContent || placeholder}
            </span>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {onClear && selectedIds.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded-sm hover:bg-accent p-0.5"
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onClear(); }
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
            <CommandInput placeholder={searchPlaceholder || placeholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {groups.map((group, gi) =>
                group.items.length > 0 ? (
                  <CommandGroup key={gi} heading={group.heading}>
                    {group.items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.label}
                        onSelect={() => handleToggle(item.id)}
                        className={group.className}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4 shrink-0', selectedIds.includes(item.id) ? 'opacity-100' : 'opacity-0')}
                        />
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {renderBadges && selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map(item => (
            <Badge key={item.id} variant="secondary" className="gap-1">
              {item.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => onRemove?.(item.id)}
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
