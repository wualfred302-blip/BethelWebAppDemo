'use client';

import { useRef } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { Camera, ChevronRight } from 'lucide-react';

export default function MotorScanStep() {
  const { nextStep, prevStep } = useApplicationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkip = () => {
    nextStep();
  };

  return (
    <div className="max-w-md mx-auto min-h-[calc(100dvh-10rem)] flex flex-col text-center">
      <section className="flex flex-col gap-2 pt-8">
        <h1 className="text-2xl font-bold leading-tight text-primary">
          Scan Vehicle Documents
        </h1>
        <p className="text-sm leading-6 text-on-surface-variant max-w-[280px] mx-auto">
          Upload your OR/CR or existing motor policy to help fill the form
        </p>
      </section>

      <section className="w-full mt-12 flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[240px] border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors group"
        >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          capture="environment"
          className="hidden"
        />

          <div className="rounded-full bg-surface-container-low p-4 group-hover:bg-surface-container-high transition-colors">
            <Camera className="w-9 h-9 text-primary" strokeWidth={1.75} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold tracking-[0.02em] text-primary">
              Tap to capture or upload
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] leading-4 text-on-surface-variant">
              OR/CR, policy document, JPG, PNG, or PDF up to 5MB
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center justify-center gap-1 text-sm font-semibold tracking-[0.02em] text-primary hover:opacity-80 focus:outline-none transition-opacity"
        >
          <span>Skip, fill vehicle details manually</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="min-w-[100px] border-primary text-primary font-semibold rounded-sm bg-transparent hover:bg-surface-container-low"
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={handleSkip}
            className="min-w-[100px] bg-[#384888] text-primary-foreground font-semibold rounded-sm hover:opacity-90"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
