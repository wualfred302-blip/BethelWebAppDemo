'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  className?: string;
}

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const TOTAL_DOTS = 7;
  const totalIntervals = TOTAL_DOTS - 1;

  return (
    <div className={cn('w-full py-4', className)}>
      <div className="relative h-3">
        {/* Background line - full width */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-zinc-200 rounded-full" />

        {/* Progress line - from start to current position */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-blue-600 rounded-full"
          initial={false}
          animate={{
            width: `${((currentStep - 1) / totalIntervals) * 100}%`,
          }}
        />

        {/* Dots - all same size, centered on line */}
        <div className="absolute inset-0 flex items-center justify-between">
          {Array.from({ length: TOTAL_DOTS }, (_, i) => {
            const step = i + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <motion.div
                key={step}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.3 : 1,
                  backgroundColor: isCompleted || isCurrent
                    ? '#2563EB'
                    : '#a1a1aa',
                }}
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  isCurrent && 'ring-2 ring-blue-600 ring-offset-2'
                )}
              >
                {isCompleted && (
                  <div className="flex items-center justify-center h-full">
                    <Check className="h-2 w-2 text-white" strokeWidth={3} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
