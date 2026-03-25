'use client';

import { useState, useRef } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

interface ScanStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function ScanStep({ onNext, onBack, isFirstStep, isLastStep }: ScanStepProps) {
  const { scanData, setScanData } = useApplicationStore();
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

      const response = await fetch('/api/extract-permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setScanData(result.data);
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
    setScanData(null);
    onNext();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold" style={{ color: '#4868a8' }}>
          Scan Business Permit
        </h2>
        <p className="text-sm text-zinc-500">
          Upload a photo of your business permit to auto-fill the form
        </p>
      </div>

      {/* Upload Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {status === 'scanning' ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-zinc-500">Processing your permit...</p>
          </div>
        ) : selectedFile && status === 'error' ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-red-500 text-sm">{error}</p>
            <p className="text-sm text-zinc-500">Try again or skip to manual entry</p>
          </div>
        ) : selectedFile && status === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <p className="text-sm text-green-600">Data extracted successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
              <Camera className="w-7 h-7 text-zinc-400" />
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
      {status === 'success' && scanData && (
        <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Extracted Data</p>
          
          {scanData.tin && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">TIN</span>
              <span className="font-medium">{scanData.tin}</span>
            </div>
          )}
          
          {scanData.businessName && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Business</span>
              <span className="font-medium">{scanData.businessName}</span>
            </div>
          )}
          
          {scanData.fullName && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Owner</span>
              <span className="font-medium">{scanData.fullName}</span>
            </div>
          )}
          
          {scanData.streetAddress && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Address</span>
              <span className="font-medium text-right max-w-[200px]">{scanData.streetAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
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