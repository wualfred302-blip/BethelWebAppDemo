'use client';

import { useEffect, useMemo, useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  useApplicationStore,
  generateControlNumber,
  generateExpiryTime,
} from '@/store/useApplicationStore';
import { lookupPremium, formatPHP } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

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

async function generateCoverNotePDF(data: {
  controlNumber: string;
  expiryTime: string;
  fullName: string;
  businessName: string;
  fullAddress: string;
  natureOfBusiness: string;
  floorArea: string;
  limitOfLiability: string;
  premium: string;
  coveragePeriod: string;
}) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
    page.drawText(text, { x, y, size, font: isBold ? boldFont : font, color: rgb(0, 0, 0) });
  };

  drawText('COVER NOTE', 240, 790, 16, true);
  drawText('Bethel General Insurance and Surety Corporation', 160, 770, 9);
  drawText('Unit 200, 2nd Floor Valero Plaza 124, Valero St., Salcedo Village, Makati City', 140, 758, 7);

  drawText(`Control No: ${data.controlNumber}`, 50, 730, 10, true);
  drawText(`Valid until: ${data.expiryTime}`, 400, 730, 10);

  let y = 700;
  drawText('APPLICANT', 50, y, 10, true); y -= 18;
  drawText(`Name: ${data.fullName}`, 50, y); y -= 14;
  drawText(`Business: ${data.businessName}`, 50, y); y -= 14;
  if (data.fullAddress) { drawText(`Address: ${data.fullAddress}`, 50, y); y -= 14; }

  y -= 20;
  drawText('COVERAGE', 50, y, 10, true); y -= 18;
  drawText(`Nature of Business: ${data.natureOfBusiness}`, 50, y); y -= 14;
  drawText(`Floor Area: ${data.floorArea} sqm`, 50, y); y -= 14;
  drawText(`Limit of Liability: ${data.limitOfLiability}`, 50, y); y -= 14;
  drawText(`Coverage Period: ${data.coveragePeriod}`, 50, y); y -= 14;

  y -= 20;
  drawText('BILLING', 50, y, 10, true); y -= 18;
  drawText(`Premium: ${data.premium}`, 50, y, 11, true); y -= 14;
  drawText('Amount subject to final assessment', 50, y, 8); y -= 14;

  y -= 30;
  drawText('DISCLAIMER', 50, y, 9, true); y -= 14;
  const disclaimer = 'Any person who knowingly and with intent to defraud any insurance company or other person files a statement of claim containing any false information, or conceals for the purpose of misleading, information thereto, commits a fraudulent act, which is a crime and subjects such person to criminal and civil penalties.';
  const words = disclaimer.split(' ');
  let line = '';
  for (const word of words) {
    if (font.widthOfTextAtSize(line + word, 7) > 480) {
      drawText(line, 50, y, 7); y -= 10;
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line) drawText(line, 50, y, 7);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CoverNote-${data.controlNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReviewPayStep({ onNext, onBack }: StepProps) {
  const businessInfo = useApplicationStore((s) => s.businessInfo);
  const location = useApplicationStore((s) => s.location);
  const coverNote = useApplicationStore((s) => s.coverNote);
  const setCoverNote = useApplicationStore((s) => s.setCoverNote);
  const setPayment = useApplicationStore((s) => s.setPayment);

  const [isGenerating, setIsGenerating] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!coverNote.controlNumber) {
      setCoverNote({
        controlNumber: generateControlNumber(),
        expiryTime: generateExpiryTime(),
      });
    }
  }, [coverNote.controlNumber, setCoverNote]);

  const premium = useMemo(
    () => lookupPremium(businessInfo.floorArea, businessInfo.natureOfBusiness),
    [businessInfo.floorArea, businessInfo.natureOfBusiness],
  );

  const fullAddress = useMemo(() => {
    const parts = [
      businessInfo.streetAddress,
      location.barangayName,
      location.cityName,
      location.provinceName,
    ].filter(Boolean);
    return parts.join(', ');
  }, [businessInfo.streetAddress, location.barangayName, location.cityName, location.provinceName]);

  const handleDownloadPDF = useCallback(async () => {
    if (!coverNote.controlNumber) return;
    setIsGenerating(true);
    try {
      await generateCoverNotePDF({
        controlNumber: coverNote.controlNumber,
        expiryTime: coverNote.expiryTime,
        fullName: businessInfo.fullName,
        businessName: businessInfo.businessName,
        fullAddress,
        natureOfBusiness: businessInfo.natureOfBusiness,
        floorArea: businessInfo.floorArea,
        limitOfLiability: premium ? formatPHP(premium.limitOfLiability) : '—',
        premium: premium ? formatPHP(premium.grossPremium) : '—',
        coveragePeriod: '1 year from date of payment',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [coverNote, businessInfo, fullAddress, premium]);

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

  const handleContinue = useCallback(() => {
    if (proofFile) {
      setPayment({ proofOfPayment: proofFile.name });
    }
    onNext();
  }, [proofFile, setPayment, onNext]);

  const isImage = proofFile && proofFile.type.startsWith('image/');
  const isPdf = proofFile && proofFile.type === 'application/pdf';

  return (
    <div className="max-w-md mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-zinc-900">Review &amp; Pay</h2>
      <p className="text-sm text-zinc-500">
        Review your application details and complete payment.
      </p>

      {/* Cover Note Card */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
        <h3 className="text-lg font-bold text-center text-zinc-900">COVER NOTE</h3>

        <div className="flex justify-between text-xs text-zinc-500">
          <span>Control No: {coverNote.controlNumber}</span>
          <span>Valid until {coverNote.expiryTime}</span>
        </div>

        <hr className="border-zinc-200" />

        {/* Applicant */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Applicant</p>
          <p className="text-sm font-medium text-zinc-900">{businessInfo.fullName}</p>
          <p className="text-sm text-zinc-700">{businessInfo.businessName}</p>
          {fullAddress && <p className="text-sm text-zinc-500">{fullAddress}</p>}
          {businessInfo.email && (
            <p className="text-sm text-zinc-500">{businessInfo.email}</p>
          )}
        </div>

        <hr className="border-zinc-200" />

        {/* Coverage */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Coverage</p>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Nature of Business</span>
            <span className="text-zinc-900">{businessInfo.natureOfBusiness || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Floor Area</span>
            <span className="text-zinc-900">
              {businessInfo.floorArea ? `${businessInfo.floorArea} sqm` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Limit of Liability</span>
            <span className="text-zinc-900">
              {premium ? formatPHP(premium.limitOfLiability) : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Coverage Period</span>
            <span className="text-zinc-900">1 year from payment</span>
          </div>
        </div>

        <hr className="border-zinc-200" />

        {/* Billing */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Billing</p>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Premium</span>
             <span className="text-2xl font-bold text-zinc-900">
              {premium ? formatPHP(premium.grossPremium) : '—'}
            </span>
          </div>
          <p className="text-xs text-zinc-500">Amount subject to final assessment</p>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-zinc-50 rounded p-3 text-xs text-zinc-500">
        Any person who knowingly and with intent to defraud any insurance company or other person
        files a statement of claim containing any false information, or conceals for the purpose of
        misleading, information thereto, commits a fraudulent act, which is a crime and subjects
        such person to criminal and civil penalties.
      </div>

      {/* Download Cover Note PDF */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleDownloadPDF}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Download Cover Note PDF'}
      </Button>

      {/* Payment Section */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-zinc-900">Payment</h3>
        <div className="space-y-1 text-sm">
          <p className="text-zinc-500">Reference: <span className="font-medium text-zinc-900">{coverNote.controlNumber}</span></p>
          <p className="text-zinc-500">Amount: <span className="font-bold text-zinc-900">{premium ? formatPHP(premium.grossPremium) : '—'}</span></p>
        </div>

        {/* GCash */}
        <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-1">
          <p className="text-sm font-semibold text-zinc-900">GCash</p>
          <p className="text-sm text-zinc-700">Send to: 0917-123-4567</p>
          <p className="text-sm text-zinc-500">Account: Bethel General Insurance</p>
        </div>

        {/* Online Banking */}
        <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-1">
          <p className="text-sm font-semibold text-zinc-900">Online Banking</p>
          <p className="text-sm text-zinc-700">BDO — Acct: 1234-5678-9012</p>
          <p className="text-sm text-zinc-500">Bethel General Insurance Corporation</p>
        </div>

        {/* Over the Counter */}
        <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-1">
          <p className="text-sm font-semibold text-zinc-900">Over the Counter</p>
          <p className="text-sm text-zinc-500">Visit nearest Bethel branch</p>
        </div>
      </div>

      {/* Proof of Payment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Proof of Payment</label>
        {!proofFile ? (
          <>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
                dragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50',
              )}
            >
              <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-zinc-500">Drop file here or click to upload</p>
              <p className="text-xs text-zinc-400">JPG, PNG, PDF — max 5MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={handleInputChange}
            />
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
            {isImage && (
              <img
                src={URL.createObjectURL(proofFile)}
                alt="Preview"
                className="h-[120px] w-[120px] rounded object-cover"
              />
            )}
            {isPdf && (
              <div className="flex h-[120px] w-[120px] items-center justify-center rounded bg-red-50">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{proofFile.name}</p>
              <p className="text-xs text-zinc-400">{formatSize(proofFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleProofRemove}
              className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              aria-label="Remove file"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {proofError && <p className="text-sm text-red-500">{proofError}</p>}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={handleContinue} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
