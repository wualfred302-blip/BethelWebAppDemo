'use client';

import { useState } from 'react';
import ContactCoverageStep from './ContactCoverageStep';
import DocumentsStep from './DocumentsStep';
import { Button } from '@/components/ui/button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function Step2Combined({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  const [contactDone, setContactDone] = useState(false);

  if (!contactDone) {
    return (
      <ContactCoverageStep
        onNext={() => setContactDone(true)}
        onBack={onBack}
        isFirstStep={isFirstStep}
        isLastStep={false}
      />
    );
  }

  return (
    <div className="space-y-4">
      <DocumentsStep
        onNext={onNext}
        onBack={() => setContactDone(false)}
        isFirstStep={false}
        isLastStep={isLastStep}
      />
    </div>
  );
}
