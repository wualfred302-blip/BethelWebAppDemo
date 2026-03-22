'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

// ─── Context ────────────────────────────────────────────────────────────────

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  displayLabel: string;
  setDisplayLabel: (label: string) => void;
  placeholder: string;
  setPlaceholder: (placeholder: string) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select compound components must be used within <Select>');
  return ctx;
}

// ─── Select (Root) ──────────────────────────────────────────────────────────

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

function Select({ value, onValueChange, disabled = false, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [displayLabel, setDisplayLabel] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleValueChange = useCallback(
    (newValue: string) => {
      onValueChange(newValue);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange: handleValueChange,
        disabled,
        displayLabel,
        setDisplayLabel,
        placeholder,
        setPlaceholder,
      }}
    >
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ─── SelectTrigger ──────────────────────────────────────────────────────────

interface SelectTriggerProps {
  className?: string;
  onBlur?: () => void;
  children: ReactNode;
}

function SelectTrigger({ className, onBlur, children }: SelectTriggerProps) {
  const { open, setOpen, disabled, displayLabel, placeholder } = useSelectContext();

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled}
      onClick={() => !disabled && setOpen(!open)}
      onBlur={onBlur}
      className={cn(
        'flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm text-left',
        'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !displayLabel && 'text-gray-400',
        className,
      )}
    >
      <span className="truncate">{displayLabel || placeholder}</span>
      <svg
        className={cn('ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// ─── SelectValue ────────────────────────────────────────────────────────────

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder: ph }: SelectValueProps) {
  const { setPlaceholder, displayLabel, placeholder } = useSelectContext();

  useEffect(() => {
    if (ph) setPlaceholder(ph);
  }, [ph, setPlaceholder]);

  return <>{displayLabel || placeholder}</>;
}

// ─── SelectContent ──────────────────────────────────────────────────────────

interface SelectContentProps {
  className?: string;
  children: ReactNode;
}

function SelectContent({ className, children }: SelectContentProps) {
  const { open } = useSelectContext();

  if (!open) return null;

  return (
    <ul
      role="listbox"
      className={cn(
        'absolute z-50 mt-1 w-full max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg',
        className,
      )}
    >
      {children}
    </ul>
  );
}

// ─── SelectItem ─────────────────────────────────────────────────────────────

interface SelectItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

function SelectItem({ value: itemValue, className, children }: SelectItemProps) {
  const { value, onValueChange, setDisplayLabel } = useSelectContext();
  const isSelected = value === itemValue;

  const handleSelect = () => {
    // Extract text label from children for display
    const label = typeof children === 'string' ? children : itemValue;
    setDisplayLabel(label);
    onValueChange(itemValue);
  };

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={handleSelect}
      className={cn(
        'cursor-pointer px-4 py-2 text-sm hover:bg-blue-50',
        isSelected && 'bg-blue-50 font-medium text-[#2563EB]',
        className,
      )}
    >
      {children}
    </li>
  );
}

// ─── Exports ────────────────────────────────────────────────────────────────

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
