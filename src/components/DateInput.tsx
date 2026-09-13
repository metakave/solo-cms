'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDate, parseDateInput, toIsoDate } from '@/lib/date';

interface DateInputProps {
  id?: string;
  value: string | null | undefined;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
  required = false,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  // Sync internal display value whenever external value prop changes
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
    } else {
      const formatted = formatDate(value);
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);

    if (!raw.trim()) {
      onChange('');
      return;
    }

    const parsed = parseDateInput(raw);
    if (parsed) {
      const iso = toIsoDate(parsed);
      onChange(iso);
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // Format: "YYYY-MM-DD"
    if (isoVal) {
      onChange(isoVal);
      setDisplayValue(formatDate(isoVal));
    } else {
      onChange('');
      setDisplayValue('');
    }
  };

  const handleOpenCalendar = () => {
    if (disabled) return;
    if (hiddenDateRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          hiddenDateRef.current.showPicker();
        } catch {
          hiddenDateRef.current.focus();
        }
      } else {
        hiddenDateRef.current.focus();
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayValue('');
    onChange('');
  };

  // Get current ISO for the hidden input
  const isoCurrent = toIsoDate(value);

  return (
    <div className="relative flex items-center w-full">
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={10}
        className={`w-full px-3 py-2 pr-16 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs ${className}`}
      />

      <div className="absolute right-2 flex items-center gap-1">
        {displayValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          type="button"
          onClick={handleOpenCalendar}
          disabled={disabled}
          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Pick date from calendar"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hidden native date input to trigger browser calendar */}
      <input
        ref={hiddenDateRef}
        type="date"
        value={isoCurrent}
        onChange={handleNativeDateChange}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
};
