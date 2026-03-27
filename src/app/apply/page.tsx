'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
import BusinessInfoStep from './steps/BusinessInfoStep';
import CoverNoteStep from './steps/CoverNoteStep';
import PaymentStep from './steps/PaymentStep';
import DoneStep from './steps/DoneStep';
import SplashScreen from './SplashScreen';
import ScanSelectionStep from './steps/ScanSelectionStep';
import ScanStep from './steps/ScanStep';
import PolicyScanStep from './steps/PolicyScanStep';

// ── Step definitions ──────────────────────────────────────

const STEPS = [
  { label: 'Select', name: 'Choose Action', component: ScanSelectionStep },
  { label: 'Scan Permit', name: 'Scan & OCR', component: ScanStep },
  { label: 'Business Info', name: 'Business Details', component: BusinessInfoStep },
  { label: 'Cover Note', name: 'Cover Note', component: CoverNoteStep },
  { label: 'Payment', name: 'Payment', component: PaymentStep },
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
}: {
  currentStep: number;
}) {
  return (
    <section className="mt-2 mb-5">
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
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/15 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          {currentStep > 1 && !submitted ? (
            <button
              onClick={handleBack}
              className="active:scale-95 transition-transform duration-200 text-primary"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          ) : (
            <div className="w-6" />
          )}
          <span className="font-bold text-[0.625rem] tracking-[0.1rem] uppercase text-primary">
            STEP {currentStep} OF {TOTAL_STEPS}
          </span>
        </div>
        <div className="text-primary font-bold tracking-tighter">
          BETHEL
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-20 mb-32 px-6 max-w-xl mx-auto w-full">
        {submitted ? (
          <DoneStep />
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
              {/* Progress — hidden, not deleted */}
              {false && currentStep < TOTAL_STEPS && (
                <SegmentedProgressBar
                  currentStep={currentStep}
                />
              )}

              <CurrentStepComponent />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
