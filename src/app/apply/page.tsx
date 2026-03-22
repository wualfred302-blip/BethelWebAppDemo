'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BusinessInfoStep from './steps/BusinessInfoStep';
import LocationStep from './steps/LocationStep';
import ContactCoverageStep from './steps/ContactCoverageStep';
import DocumentsStep from './steps/DocumentsStep';
import CoverNoteStep from './steps/CoverNoteStep';
import PaymentStep from './steps/PaymentStep';
import SuccessStep from './steps/SuccessStep';

// ── Step definitions ──────────────────────────────────────

const STEPS = [
  { label: 'Business', component: BusinessInfoStep },
  { label: 'Location', component: LocationStep },
  { label: 'Contact', component: ContactCoverageStep },
  { label: 'Documents', component: DocumentsStep },
  { label: 'Cover Note', component: CoverNoteStep },
  { label: 'Payment', component: PaymentStep },
  { label: 'Success', component: SuccessStep },
] as const;

// ── Slide transition variants ─────────────────────────────

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ── Step indicator (3-step circles) ──────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.slice(0, 3).map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === i + 1
                ? 'bg-[#2563EB] text-white'
                : currentStep > i + 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
            )}
          >
            {currentStep > i + 1 ? '✓' : i + 1}
          </div>
          <span
            className={cn(
              'text-sm hidden sm:inline',
              currentStep === i + 1
                ? 'text-[#2563EB] font-medium'
                : 'text-gray-400'
            )}
          >
            {step.label}
          </span>
          {i < 2 && (
            <div
              className={cn(
                'w-8 h-0.5',
                currentStep > i + 1 ? 'bg-green-500' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page component ────────────────────────────────────────

export default function ApplyPage() {
  const { currentStep, nextStep, prevStep, reset } = useApplicationStore();
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    nextStep();
  };

  const handleBack = () => {
    setDirection(-1);
    prevStep();
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Step indicator circles */}
        <StepIndicator currentStep={currentStep} />

        {/* Start over button (step 1 only) */}
        {isFirstStep && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" onClick={reset}>
              Start Over
            </Button>
          </div>
        )}

        {/* Step content with slide transitions */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
