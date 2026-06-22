'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OtpInput({ value, onChange, disabled = false, error = false }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => value.padEnd(6, ' ').slice(0, 6).split(''), [value]);
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (focusIndex < 0 || focusIndex > 5) return;
    inputsRef.current[focusIndex]?.focus();
  }, [focusIndex]);

  const updateDigit = (index: number, nextValue: string) => {
    const cleaned = nextValue.replace(/\D/g, '').slice(0, 1);
    const nextDigits = digits.map((digit, digitIndex) => (digitIndex === index ? cleaned : digit === ' ' ? '' : digit));
    const joined = nextDigits.join('').replace(/\s/g, '');
    onChange(joined);
    if (cleaned && index < 5) {
      setFocusIndex(index + 1);
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const nextDigits = [...digits.map((digit) => (digit === ' ' ? '' : digit))];
    for (let i = 0; i < pasted.length && index + i < 6; i += 1) {
      nextDigits[index + i] = pasted[i];
    }
    onChange(nextDigits.join('').replace(/\s/g, ''));
    setFocusIndex(Math.min(index + pasted.length, 5));
  };

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {Array.from({ length: 6 }, (_, index) => {
        const digit = digits[index] === ' ' ? '' : digits[index];
        return (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onFocus={() => setFocusIndex(index)}
            onChange={(event) => updateDigit(index, event.target.value)}
            onPaste={(event) => handlePaste(index, event)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !digit && index > 0) {
                event.preventDefault();
                const nextDigits = [...digits.map((d) => (d === ' ' ? '' : d))];
                nextDigits[index - 1] = '';
                onChange(nextDigits.join('').replace(/\s/g, ''));
                setFocusIndex(index - 1);
              }
              if (event.key === 'ArrowLeft' && index > 0) {
                setFocusIndex(index - 1);
              }
              if (event.key === 'ArrowRight' && index < 5) {
                setFocusIndex(index + 1);
              }
            }}
            className={cn(
              'h-10 w-10 rounded-md border bg-white text-center text-base font-semibold text-primary outline-none transition-all sm:h-11 sm:w-11',
              'border-[#d8ddec] shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          />
        );
      })}
    </div>
  );
}
