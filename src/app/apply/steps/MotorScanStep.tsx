'use client';

import { useRef, useState } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { mapMotorOcrToVehicleInfo, type MotorOcrMappingResult } from '@/lib/motor-ocr/mapping';
import { calculateRenewalOffer } from '@/lib/renewal-offer';
import type { MotorDocumentOcrResult } from '@/lib/motor-ocr/schema';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export default function MotorScanStep() {
  const { nextStep, prevStep, setMotorVehicleInfo, setMotorOcrData, setRenewalMapping, setRenewalOffer, setIsRenewalFlow, motorOcrData } = useApplicationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState('');
  const [mapping, setMapping] = useState<MotorOcrMappingResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const processDocument = async (file: File) => {
    setStatus('scanning');
    setError('');
    setMapping(null);

    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error('Upload a JPG, PNG, WebP, or PDF that is 5MB or smaller.');
      }

      const mimeType = file.type || 'image/jpeg';
      if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
        throw new Error('Upload a supported document: JPG, PNG, WebP, or PDF.');
      }

      const imageBase64 = await fileToBase64(file);

      const response = await fetch('/api/extract-motor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, filename: file.name }),
      });

      const result: {
        success?: boolean;
        data?: MotorDocumentOcrResult;
        error?: string;
        details?: string;
      } = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        const mapped = mapMotorOcrToVehicleInfo(data);
        setMotorOcrData(data);
        setMotorVehicleInfo(mapped.values);
        setMapping(mapped);
        setStatus('success');

        if (data.documentType === 'previous_policy') {
          const offer = calculateRenewalOffer(data, mapped.values);
          setRenewalMapping(mapped);
          setRenewalOffer(offer);
        }
      } else {
        setError(result.details || result.error || 'Failed to extract vehicle data');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    await processDocument(file);
  };

  const handleSkip = () => {
    setMotorOcrData(null);
    nextStep();
  };

  const handleReview = () => {
    if (motorOcrData?.documentType === 'previous_policy') {
      setIsRenewalFlow(true);
    }
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
            onChange={handleFileSelect}
            className="hidden"
          />

          {status === 'scanning' ? (
            <>
              <div className="rounded-full bg-surface-container-low p-4">
                <Loader2 className="w-9 h-9 animate-spin text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold tracking-[0.02em] text-primary">
                  Reading vehicle document
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] leading-4 text-on-surface-variant">
                  Extracting OR/CR, policy, and coverage fields
                </span>
              </div>
            </>
          ) : selectedFile && status === 'success' ? (
            <>
              <div className="rounded-full bg-green-50 p-4">
                <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold tracking-[0.02em] text-green-700">
                  Vehicle data extracted
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] leading-4 text-on-surface-variant">
                  Continue to review and correct the form
                </span>
              </div>
            </>
          ) : selectedFile && status === 'error' ? (
            <>
              <div className="rounded-full bg-red-50 p-4">
                <AlertTriangle className="w-9 h-9 text-red-600" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold tracking-[0.02em] text-red-600">
                  Extraction failed
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] leading-4 text-on-surface-variant">
                  {error || 'Try again or continue without scan'}
                </span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center justify-center gap-1 text-sm font-semibold tracking-[0.02em] text-primary hover:opacity-80 focus:outline-none transition-opacity"
        >
          <span>Skip scan</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {status === 'success' && mapping && (
          <div className="w-full border border-outline-variant bg-white px-4 py-4 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-outline">
              Applied to Vehicle Form
            </p>
            <div className="mt-3 space-y-2">
              {mapping.appliedFields.length > 0 ? (
                mapping.appliedFields.slice(0, 6).map((field) => (
                  <div key={field.formKey} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-outline">{field.label}</span>
                    <span className="max-w-[58%] text-right font-medium text-on-surface">
                      {field.value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">
                  OCR completed, but no high-confidence fields were applied automatically.
                </p>
              )}
            </div>
            {mapping.suggestions.length > 0 && (
              <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
                {mapping.suggestions.length} lower-confidence field
                {mapping.suggestions.length === 1 ? '' : 's'} will need manual review.
              </p>
            )}
          </div>
        )}
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
            onClick={status === 'success' ? handleReview : handleSkip}
            className="min-w-[100px] bg-[#384888] text-primary-foreground font-semibold rounded-sm hover:opacity-90"
          >
            {status === 'success' ? 'Review' : 'Skip'}
          </Button>
        </div>
      </div>
    </div>
  );
}
