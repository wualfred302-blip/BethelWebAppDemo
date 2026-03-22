'use client';

import { Button } from '@/components/ui/button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function DoneStep({ onBack }: StepProps) {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Application Submitted</h2>
      <p className="text-sm text-zinc-500">
        Your application has been received. We will contact you shortly.
      </p>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
      </div>
    </div>
  );
}
