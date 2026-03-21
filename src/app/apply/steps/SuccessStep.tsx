'use client';

import { Button } from '@/components/ui/button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function SuccessStep({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Application Submitted</h2>
      <p className="text-sm text-zinc-500">Form fields will go here in a later phase.</p>

      <div className="flex gap-3 pt-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={onNext} className="flex-1">
          {isLastStep ? 'Submit' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
