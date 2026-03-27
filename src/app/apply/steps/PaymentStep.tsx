'use client';

import { useMemo, useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
import { lookupPremium, formatPHP } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { ShieldCheck, Smartphone, Building2, Store, X } from 'lucide-react';

// ── Section legend ────────────────────────────────────────────

function SectionLegend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="font-bold text-[0.75rem] tracking-[0.1rem] uppercase text-on-surface-variant mb-6">
      {children}
    </legend>
  );
}

// ── File validation ───────────────────────────────────────────

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Only JPG, PNG, PDF allowed';
  if (file.size > MAX_SIZE) return 'File must be under 5MB';
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────

export default function PaymentStep() {
  const businessInfo = useApplicationStore((s) => s.businessInfo);
  const coverNote = useApplicationStore((s) => s.coverNote);
  const setPayment = useApplicationStore((s) => s.setPayment);
  const nextStep = useApplicationStore((s) => s.nextStep);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const premium = useMemo(
    () => lookupPremium(businessInfo.floorArea, businessInfo.natureOfBusiness),
    [businessInfo.floorArea, businessInfo.natureOfBusiness],
  );

  const handleProofSelect = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) {
      setProofError(err);
      setProofFile(null);
      return;
    }
    setProofError(null);
    setProofFile(file);
  }, []);

  const handleProofRemove = useCallback(() => {
    setProofFile(null);
    setProofError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleProofSelect(dropped);
    },
    [handleProofSelect],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleProofSelect(selected);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleProofSelect],
  );

  const handleSubmit = useCallback(() => {
    if (proofFile) {
      setPayment({ proofOfPayment: proofFile.name });
    }
    nextStep();
  }, [proofFile, setPayment, nextStep]);

  const isImage = proofFile && proofFile.type.startsWith('image/');
  const isPdf = proofFile && proofFile.type === 'application/pdf';

  return (
    <div className="space-y-12">
      {/* ── Title ───────────────────────────────────────────── */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Payment</h1>
        <p className="text-sm text-on-surface-variant">
          Complete your payment to finalize your application.
        </p>
      </section>

      {/* ── Amount Due ──────────────────────────────────────── */}
      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Amount Due</p>
        <p className="text-3xl font-bold text-primary">
          {premium ? formatPHP(premium.grossPremium) : '—'}
        </p>
        <p className="text-[11px] text-outline">Ref: {coverNote.controlNumber}</p>
      </div>

      {/* ── Payment Methods ─────────────────────────────────── */}
      <fieldset>
        <SectionLegend>PAYMENT METHODS</SectionLegend>
        <div className="space-y-0">
          <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
            <Smartphone className="w-5 h-5 text-outline" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">GCash</p>
              <p className="text-[13px] text-outline">Send to: 0917-123-4567</p>
            </div>
            <p className="text-[11px] text-outline">Bethel General Insurance</p>
          </div>

          <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
            <Building2 className="w-5 h-5 text-outline" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">BDO Online Banking</p>
              <p className="text-[13px] text-outline">Acct: 1234-5678-9012</p>
            </div>
            <p className="text-[11px] text-outline">Bethel General Insurance Corp.</p>
          </div>

          <div className="flex items-center gap-4 py-4">
            <Store className="w-5 h-5 text-outline" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">Over the Counter</p>
              <p className="text-[13px] text-outline">Visit nearest Bethel branch</p>
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── Proof of Payment ────────────────────────────────── */}
      <fieldset>
        <SectionLegend>PROOF OF PAYMENT</SectionLegend>
        {!proofFile ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 border-b-2 py-8 cursor-pointer transition-colors',
              dragging
                ? 'border-primary'
                : 'border-outline-variant hover:border-primary',
            )}
          >
            <svg
              className="w-6 h-6 text-outline"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-outline">Tap to upload</p>
            <p className="text-[11px] text-outline-variant">JPG, PNG, or PDF — max 5MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 py-3">
            {isImage && (
              <img
                src={URL.createObjectURL(proofFile)}
                alt="Preview"
                className="h-12 w-12 rounded object-cover"
              />
            )}
            {isPdf && (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-zinc-100">
                <svg
                  className="h-6 w-6 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{proofFile.name}</p>
              <p className="text-[11px] text-outline">{formatSize(proofFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleProofRemove}
              className="shrink-0 p-1 text-outline-variant hover:text-on-surface transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {proofError && <p className="text-[11px] text-red-500 mt-1">{proofError}</p>}
      </fieldset>

      {/* ── Security Notice ─────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-12">
        <ShieldCheck className="w-4 h-4 text-outline" />
        <p className="text-[11px] font-medium text-outline-variant uppercase tracking-wider">
          Your payment is secure
        </p>
      </div>

      {/* ── Fixed Bottom Continue ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 pt-4 pb-8 z-50">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-md"
          >
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );
}
