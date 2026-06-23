'use client';

import { useRef, useState } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, ChevronRight, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { mapMotorOcrToVehicleInfo, type MotorOcrMappingResult } from '@/lib/motor-ocr/mapping';
import { calculateRenewalOffer } from '@/lib/renewal-offer';
import type { MotorDocumentOcrResult } from '@/lib/motor-ocr/schema';
import { formatPHP } from '@/lib/pricing';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'low_confidence';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export default function RenewalOcrReviewStep() {
  const {
    nextStep, setMotorVehicleInfo, setMotorOcrData,
    setRenewalMapping, setRenewalOffer, setIsRenewalFlow,
  } = useApplicationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState('');
  const [mapping, setMapping] = useState<MotorOcrMappingResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<MotorDocumentOcrResult | null>(null);

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
      if (file.size > MAX_UPLOAD_BYTES) throw new Error('Upload a JPG, PNG, WebP, or PDF that is 5MB or smaller.');

      const mimeType = file.type || 'image/jpeg';
      if (!SUPPORTED_MIME_TYPES.has(mimeType)) throw new Error('Upload a supported document: JPG, PNG, WebP, or PDF.');

      const imageBase64 = await fileToBase64(file);
      const response = await fetch('/api/extract-motor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, filename: file.name }),
      });

      const result: { success?: boolean; data?: MotorDocumentOcrResult; error?: string; details?: string } = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.details || result.error || 'Failed to extract policy data');
      }

      const data = result.data;
      const mapped = mapMotorOcrToVehicleInfo(data, 0.5);

      setExtracted(data);
      setMapping(mapped);
      setMotorOcrData(data);
      setMotorVehicleInfo(mapped.values);

      const highConfCount = mapped.appliedFields.length;
      const lowConfCount = mapped.suggestions.length;

      if (highConfCount === 0 && lowConfCount === 0) {
        setStatus('error');
        setError('Could not read any fields from this document. Try a clearer image or different document.');
      } else if (lowConfCount > highConfCount) {
        setStatus('low_confidence');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setExtracted(null);
    processDocument(file);
  };

  const handleReviewQuote = () => {
    if (!extracted) return;
    const vehicleInfo = mapping?.values || {};
    const offer = calculateRenewalOffer(extracted, vehicleInfo);
    setRenewalMapping(mapping);
    setRenewalOffer(offer);
    setIsRenewalFlow(true);
    nextStep();
  };

  const formatConfidence = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  const allFields = [...(mapping?.appliedFields || []), ...(mapping?.suggestions || [])];
  const displayFields = allFields.slice(0, 8);
  const policyNumber = extracted?.fields?.previousPolicyNumber?.value;
  const insurer = extracted?.fields?.previousInsurer?.value;
  const coverageType = extracted?.fields?.coverageType?.value;
  const totalPremium = extracted?.fields?.premiumTotal?.value || extracted?.fields?.previousPremium?.value;

  return (
    <div className="max-w-2xl mx-auto min-h-[calc(100dvh-10rem)] flex flex-col pb-32">
      <section className="mb-6 pt-8">
        <h1 className="text-2xl font-bold text-primary">Upload your current policy</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          We will read the entire policy, extract the coverage, and prepare a Bethel renewal offer at a lower price.
        </p>
      </section>

      <section className="border border-outline-variant rounded-xl p-6 bg-white relative">
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-surface-container-low mb-4 cursor-pointer hover:bg-surface-container transition-colors ${status === 'idle' ? '' : 'hidden'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" capture="environment" onChange={handleFileSelect} className="hidden" />
          <div className="rounded-full bg-surface-container-low p-4 mb-3">
            <Camera className="w-9 h-9 text-primary" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-semibold text-primary">Tap to capture or upload policy</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-outline mt-1">JPG, PNG, or PDF up to 5MB</span>
        </div>

        {status === 'scanning' && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-low mb-4">
            <div className="rounded-full bg-surface-container-low p-4 mb-3">
              <Loader2 className="w-9 h-9 animate-spin text-primary" strokeWidth={1.75} />
            </div>
            <div className="w-full max-w-xs h-1 bg-surface-variant rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary w-2/3 rounded-full animate-pulse" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-outline">Reading policy details...</span>
          </div>
        )}

        {status === 'success' && extracted && (
          <div className="bg-surface-bright rounded-lg border border-surface-variant overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-surface-variant bg-surface-container-low">
              <span className="text-sm font-semibold text-on-surface">Extracted Data</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-surface-container border border-surface-variant rounded-full text-[10px] font-bold uppercase tracking-widest text-outline flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  High confidence
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Matched
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              {policyNumber && (
                <div className="flex justify-between items-center py-3 px-5 border-b border-surface-variant bg-surface-bright">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Policy Number</span>
                  <span className="text-sm font-medium text-on-surface">{policyNumber}</span>
                </div>
              )}
              {insurer && (
                <div className="flex justify-between items-center py-3 px-5 border-b border-surface-variant bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Insurer</span>
                  <span className="text-sm font-medium text-on-surface">{insurer}</span>
                </div>
              )}
              {allFields.find(f => f.formKey === 'make' || f.formKey === 'model' || f.formKey === 'yearModel') && (
                <div className="flex justify-between items-center py-3 px-5 border-b border-surface-variant bg-surface-bright">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Vehicle</span>
                  <span className="text-sm font-medium text-on-surface">
                    {[extracted.fields?.yearModel?.value, extracted.fields?.make?.value, extracted.fields?.model?.value].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
              {coverageType && (
                <div className="flex justify-between items-center py-3 px-5 border-b border-surface-variant bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Coverage Type</span>
                  <span className="text-sm font-medium text-on-surface">{coverageType}</span>
                </div>
              )}
              {totalPremium && (
                <div className="flex justify-between items-center py-3 px-5 bg-surface-bright">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Previous Total Due</span>
                  <span className="text-sm font-medium text-on-surface">{formatPHP(Number(totalPremium.replace(/[^0-9.]/g, '')))}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-surface-container-low border-t border-surface-variant text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Quote is not final until fields are confirmed.</span>
            </div>
          </div>
        )}

        {status === 'low_confidence' && mapping && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Low confidence extraction</span>
            </div>
            <p className="text-xs text-amber-700">Some fields had low confidence and need manual review.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-red-700">Extraction failed</span>
            </div>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </section>

      {displayFields.length > 0 && (
        <section className="mt-6 border border-outline-variant rounded-xl overflow-hidden bg-white">
          <div className="p-4 bg-surface-container-low border-b border-outline-variant">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Extracted Fields</span>
          </div>
          <div className="divide-y divide-surface-container">
            {displayFields.map((field) => (
              <div key={field.formKey} className="flex items-center justify-between px-5 py-3">
                <span className="text-xs text-outline">{field.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-on-surface">{field.value}</span>
                  <span className={`text-[10px] font-bold ${formatConfidence(field.confidence)}`}>
                    {Math.round(field.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {status === 'idle' && extracted === null && (
        <section className="mt-12">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-12 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            <Camera className="w-8 h-8 text-outline" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-outline">Tap to upload your policy document</span>
          </button>
        </section>
      )}

      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-outline-variant px-6 py-4 z-50">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {(status === 'success' || status === 'low_confidence') && extracted && (
            <Button
              type="button"
              onClick={handleReviewQuote}
              className="w-full bg-secondary hover:bg-on-secondary-container text-white font-semibold py-3 rounded-lg"
            >
              Review matched quote
            </Button>
          )}
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full text-primary border-primary font-semibold"
          >
            {selectedFile ? 'Replace document' : 'Upload document'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
