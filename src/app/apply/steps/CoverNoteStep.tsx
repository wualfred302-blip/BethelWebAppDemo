'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useApplicationStore,
  generateControlNumber,
  generateExpiryTime,
} from '@/store/useApplicationStore';
import { lookupPremium, formatPHP } from '@/lib/pricing';
import { FileDown } from 'lucide-react';

// ── Section legend ────────────────────────────────────────────

function SectionLegend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="font-bold text-[0.75rem] tracking-[0.1rem] uppercase text-on-surface-variant mb-6">
      {children}
    </legend>
  );
}

// ── Row ───────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-outline">{label}</span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  );
}

// ── PDF generation ────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────

export default function CoverNoteStep() {
  const businessInfo = useApplicationStore((s) => s.businessInfo);
  const location = useApplicationStore((s) => s.location);
  const coverNote = useApplicationStore((s) => s.coverNote);
  const setCoverNote = useApplicationStore((s) => s.setCoverNote);
  const nextStep = useApplicationStore((s) => s.nextStep);
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <div className="space-y-12">
      {/* ── Title ───────────────────────────────────────────── */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Cover Note</h1>
        <p className="text-sm text-on-surface-variant">
          Review your quotation before proceeding to payment.
        </p>
      </section>

      {/* ── Header Info ─────────────────────────────────────── */}
      <div className="flex justify-between text-[11px] text-outline">
        <span className="font-medium">{coverNote.controlNumber}</span>
        <span>Valid until {coverNote.expiryTime}</span>
      </div>

      {/* ── Applicant ───────────────────────────────────────── */}
      <fieldset>
        <SectionLegend>INSURED</SectionLegend>
        <div className="space-y-3">
          <p className="text-base font-semibold text-on-surface">{businessInfo.fullName}</p>
          <p className="text-sm text-on-surface-variant">{businessInfo.businessName}</p>
          {fullAddress && <p className="text-sm text-outline">{fullAddress}</p>}
          {businessInfo.email && <p className="text-sm text-outline">{businessInfo.email}</p>}
        </div>
      </fieldset>

      {/* ── Coverage ────────────────────────────────────────── */}
      <fieldset>
        <SectionLegend>COVERAGE</SectionLegend>
        <div className="space-y-3">
          <Row label="Nature of Business" value={businessInfo.natureOfBusiness || '—'} />
          <Row label="Floor Area" value={businessInfo.floorArea ? `${businessInfo.floorArea} sqm` : '—'} />
          <Row label="Limit of Liability" value={premium ? formatPHP(premium.limitOfLiability) : '—'} />
          <Row label="Coverage Period" value="1 year from payment" />
        </div>
      </fieldset>

      {/* ── Billing ─────────────────────────────────────────── */}
      <fieldset>
        <SectionLegend>BILLING</SectionLegend>
        <div className="space-y-3">
          <Row label="Net Premium" value={premium ? formatPHP(premium.netPremium) : '—'} />
          <div className="border-t border-outline-variant pt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-on-surface uppercase tracking-wide">Total</span>
            <span className="text-xl font-bold text-primary">
              {premium ? formatPHP(premium.grossPremium) : '—'}
            </span>
          </div>
          <p className="text-[11px] text-outline">Amount subject to final assessment</p>
        </div>
      </fieldset>

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <p className="text-[10px] text-outline-variant leading-relaxed">
        Any person who knowingly and with intent to defraud any insurance company or other person
        files a statement of claim containing any false information, or conceals for the purpose of
        misleading, information thereto, commits a fraudulent act, which is a crime and subjects
        such person to criminal and civil penalties.
      </p>

      {/* ── Download PDF ────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 w-full py-3 text-sm text-outline hover:text-primary transition-colors"
      >
        <FileDown className="w-4 h-4" />
        <span>{isGenerating ? 'Generating...' : 'Download Cover Note PDF'}</span>
      </button>

      {/* ── Fixed Bottom Continue ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 pt-4 pb-8 z-50">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            onClick={nextStep}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-md"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
