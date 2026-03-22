'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
import { ProgressBar } from '@/components/ProgressBar';
import BusinessInfoStep from './steps/BusinessInfoStep';
import Step2Combined from './steps/Step2Combined';
import ReviewPayStep from './steps/ReviewPayStep';
import DoneStep from './steps/DoneStep';

// ── Step definitions ──────────────────────────────────────

const STEPS = [
  { label: 'Business', component: BusinessInfoStep },
  { label: 'Contact & Docs', component: Step2Combined },
  { label: 'Review & Pay', component: ReviewPayStep },
  { label: 'Done', component: DoneStep },
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
  const { currentStep, nextStep, prevStep, goToStep } = useApplicationStore();
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    setDirection(1);
    nextStep();
  }, [nextStep]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    prevStep();
  }, [prevStep]);

  // ── Browser back button support ─────────────────────────
  useEffect(() => {
    window.history.pushState({ step: currentStep }, '', '/apply');
  }, [currentStep]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const step = e.state?.step;
      if (step && step >= 1 && step <= TOTAL_STEPS) {
        goToStep(step);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goToStep]);

  // ── Enter key submission for placeholder steps ──────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // Don't interfere with form submissions (forms handle their own Enter)
        if (target.tagName === 'FORM' || target.closest('form')) return;
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext]);

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
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { duration: 0.2, ease: 'easeOut' },
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
