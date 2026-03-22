'use client';

import { Button } from '@/components/ui/button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function ReviewPayStep({ onNext, onBack }: StepProps) {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Review &amp; Pay</h2>
      <p className="text-sm text-zinc-500">
        Review your application details and complete payment.
      </p>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
