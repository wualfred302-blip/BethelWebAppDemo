'use client';

import { useRef } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Camera, SkipForward } from 'lucide-react';

export default function MotorScanStep() {
  const { nextStep, prevStep, currentStep } = useApplicationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkip = () => {
    nextStep();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold" style={{ color: '#4868a8' }}>
          Scan Vehicle Documents
        </h2>
        <p className="text-sm text-zinc-500">
          Upload your OR/CR or existing motor policy to help fill the form
        </p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          capture="environment"
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
            <Camera className="w-7 h-7 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">Tap to capture or upload</p>
            <p className="text-xs text-zinc-400">
              OR/CR, policy document, JPG, PNG, or PDF up to 5MB
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
      >
        <SkipForward className="w-4 h-4" />
        <span>Skip, fill vehicle details manually</span>
      </button>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep <= 1}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handleSkip}
          className="flex-1"
          style={{ backgroundColor: '#384888' }}
        >
          Skip
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
