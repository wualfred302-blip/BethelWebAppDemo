'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
import { ProgressBar } from '@/components/ProgressBar';
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
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Progress Bar at top */}
      <div className="bg-white px-4 pt-4">
        <div className="max-w-md mx-auto">
          <ProgressBar currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {isFirstStep && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" onClick={reset}>
              Start Over
            </Button>
          </div>
        )}

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
      </main>
    </div>
  );
}
