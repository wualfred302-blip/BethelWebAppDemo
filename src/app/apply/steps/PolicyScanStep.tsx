'use client';

import { useState, useRef } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function PolicyScanStep() {
  const { policyData, setPolicyData, nextStep, prevStep, currentStep } = useApplicationStore();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setStatus('scanning');
    setError('');

    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';

      const response = await fetch('/api/extract-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setPolicyData(result.data);
        setStatus('success');
      } else {
        setError(result.details || result.error || 'Failed to extract data');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSkip = () => {
    setPolicyData(null);
    nextStep();
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-primary">
          Scan Existing Policy
        </h2>
        <p className="text-sm text-outline">
          Upload a photo of your current CGL policy to auto-fill renewal details
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {status === 'scanning' ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-outline">Scanning policy document...</p>
          </div>
        ) : selectedFile && status === 'error' ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-red-500 text-sm">{error}</p>
            <p className="text-sm text-outline">Try again or skip to manual entry</p>
          </div>
        ) : selectedFile && status === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xl">&#10003;</span>
            </div>
            <p className="text-sm text-green-600">Policy data extracted successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
              <FileText className="w-7 h-7 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Tap to capture or upload</p>
              <p className="text-xs text-zinc-400">JPG, PNG, or PDF up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Skip Button (always visible) */}
      <button
        onClick={handleSkip}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
      >
        <SkipForward className="w-4 h-4" />
        <span>Skip, fill manually</span>
      </button>

      {/* Extracted Data Preview */}
      {status === 'success' && policyData && (
        <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Extracted Policy Data</p>

          {policyData.policyNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Policy #</span>
              <span className="font-medium">{policyData.policyNumber}</span>
            </div>
          )}

          {policyData.namedInsured && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Insured</span>
              <span className="font-medium">{policyData.namedInsured}</span>
            </div>
          )}

          {policyData.priorInsurer && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Prior Insurer</span>
              <span className="font-medium">{policyData.priorInsurer}</span>
            </div>
          )}

          {policyData.expiryDate && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Expiry</span>
              <span className="font-medium">{policyData.expiryDate}</span>
            </div>
          )}

          {policyData.coverageLimit && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Coverage</span>
              <span className="font-medium">{policyData.coverageLimit}</span>
            </div>
          )}

          {policyData.businessAddress && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Address</span>
              <span className="font-medium text-right max-w-[200px]">{policyData.businessAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
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
          onClick={status === 'success' ? handleContinue : handleSkip}
          className="flex-1"
          style={{ backgroundColor: '#384888' }}
        >
          {status === 'success' ? 'Continue' : 'Skip'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
