'use client';

import { Button } from '@/components/ui/button';
import { useApplicationStore } from '@/store/useApplicationStore';

export default function DoneStep() {
  const prevStep = useApplicationStore((s) => s.prevStep);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Application Submitted</h2>
      <p className="text-sm text-zinc-500">
        Your application has been received. We will contact you shortly.
      </p>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
      </div>
    </div>
  );
}
