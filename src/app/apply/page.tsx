'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
import BusinessInfoStep from './steps/BusinessInfoStep';
import DocumentsStep from './steps/DocumentsStep';
import ReviewPayStep from './steps/ReviewPayStep';
import DoneStep from './steps/DoneStep';
import SplashScreen from './SplashScreen';

// ── Step definitions ──────────────────────────────────────

const STEPS = [
  { label: 'General Info', name: 'Business & Contact', component: BusinessInfoStep },
  { label: 'Documents', name: 'Document Upload', component: DocumentsStep },
  { label: 'Review & Pay', name: 'Review & Payment', component: ReviewPayStep },
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

// ── Segmented Progress Bar ────────────────────────────────

function SegmentedProgressBar({
  currentStep,
  stepName,
}: {
  currentStep: number;
  stepName: string;
}) {
  return (
    <section className="mt-4 mb-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        <span className="text-[11px] font-medium text-on-surface-variant">{stepName}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const step = i + 1;
          const isFilled = step <= currentStep;
          return (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${isFilled ? 'bg-primary shadow-sm' : 'bg-zinc-200'}`}
            />
          );
        })}
      </div>
    </section>
  );
}

// ── Page component ────────────────────────────────────────

export default function ApplyPage() {
  const { currentStep, nextStep, prevStep, goToStep } = useApplicationStore();
  const [direction, setDirection] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleGetStarted = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === TOTAL_STEPS) {
      setSubmitted(true);
      return;
    }
    setDirection(1);
    nextStep();
  }, [currentStep, nextStep]);

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

  return showSplash ? (
    <SplashScreen onGetStarted={handleGetStarted} />
  ) : (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {currentStep > 1 && !submitted ? (
            <button
              onClick={handleBack}
              className="active:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <div className="w-6" />
          )}
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            {submitted ? 'Done' : STEPS[currentStep - 1].label}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
          <svg
            className="h-5 w-5 text-on-surface-variant"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 pb-32">
        {submitted ? (
          <DoneStep
            onNext={() => {}}
            onBack={() => {}}
            isFirstStep={false}
            isLastStep={true}
          />
        ) : (
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
              {/* Progress */}
              {currentStep < TOTAL_STEPS && (
                <SegmentedProgressBar
                  currentStep={currentStep}
                  stepName={STEPS[currentStep - 1].name}
                />
              )}

              <CurrentStepComponent
                onNext={handleNext}
                onBack={handleBack}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
