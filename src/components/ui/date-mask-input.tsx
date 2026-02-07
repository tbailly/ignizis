import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateMaskInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export function DateMaskInput({ value, onChange, className, ...props }: DateMaskInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const oldValue = value;
    let rawNew = input.value;

    // If user is deleting (new value is shorter), handle backspace over slashes
    if (rawNew.length < oldValue.length) {
      onChange(rawNew);
      return;
    }

    // Strip all non-digit characters from the newly typed content
    const digitsOnly = rawNew.replace(/\D/g, '');

    // Rebuild with auto-slashes
    let formatted = '';
    for (let i = 0; i < digitsOnly.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += digitsOnly[i];
    }

    onChange(formatted);

    // Set cursor position after React re-renders
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = formatted.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const pos = input.selectionStart ?? 0;

    // If backspace and cursor is right after a slash, remove the slash too
    if (e.key === 'Backspace' && (pos === 3 || pos === 6) && value[pos - 1] === '/') {
      e.preventDefault();
      const newValue = value.slice(0, pos - 2) + value.slice(pos);
      onChange(newValue);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(pos - 2, pos - 2);
        }
      });
    }
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="DD/MM/YYYY"
      maxLength={10}
      inputMode="numeric"
      className={cn(className)}
      {...props}
    />
  );
}
