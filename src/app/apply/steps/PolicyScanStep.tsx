'use client';

import { useState } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';

interface PolicyScanStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PolicyScanStep({ onNext, onBack }: PolicyScanStepProps) {
  const { scanType } = useApplicationStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

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
        // Store extracted policy data
        setPolicyData(result.data);
        onNext();
      } else {
        // For now, just proceed even if extraction fails
        onNext();
      }
    } catch (error) {
      console.error('Policy OCR error:', error);
      // Proceed even on error
      onNext();
    } finally {
      setIsProcessing(false);
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

  const setPolicyData = (data: any) => {
    // Could extend store to handle policy data
    console.log('Policy data extracted:', data);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold" style={{ color: '#4868a8' }}>
          Scan Existing Policy
        </h2>
        <p className="text-sm text-zinc-500">
          Upload a photo of your current CGL policy document
        </p>
      </div>

      {/* Upload Area */}
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleSelectFile}
          className="hidden"
          disabled={isProcessing}
        />
        <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center hover:border-[#384888] hover:bg-[#384888]/5 transition-colors">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#384888] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Processing policy...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-3xl">
                📄
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a2e]">
                  Tap to upload policy document
                </p>
                <p className="text-xs text-zinc-400">
                  JPG, PNG, or PDF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      </label>

      {/* Skip option */}
      <button
        onClick={onNext}
        className="w-full py-3 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
      >
        Skip, enter details manually
      </button>
    </div>
  );
}