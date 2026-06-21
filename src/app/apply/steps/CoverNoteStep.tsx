'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useApplicationStore,
  generateControlNumber,
  generateExpiryTime,
} from '@/store/useApplicationStore';
import { lookupPremium, formatPHP } from '@/lib/pricing';
import { calculateIndicativeMotorQuote, formatMotorQuoteSummary } from '@/lib/motor-rating';
import QuoteReceiptCard from './components/QuoteReceiptCard';
import type { QuoteReceiptRow, QuoteReceiptSection } from './components/QuoteReceiptCard';

// ── PDF generation ────────────────────────────────────────────

async function generateCoverNotePDF(data: {
  controlNumber: string;
  expiryTime: string;
  fullName: string;
  businessName: string;
  fullAddress: string;
  natureOfBusiness: string;
  floorArea: string;
  effectiveDate: string;
  limitOfLiability: string;
  netPremium: string;
  dst: string;
  vat: string;
  lgTax: string;
  grossPremium: string;
  coveragePeriod: string;
}) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pdfText = (text: string) =>
    String(text)
      .replace(/₱/g, 'PHP ')
      .replace(/—/g, '-')
      .replace(/•/g, '-')
      .replace(/·/g, '/');

  const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
    page.drawText(pdfText(text), { x, y, size, font: isBold ? boldFont : font, color: rgb(0, 0, 0) });
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
  drawText(`Effective Date: ${data.effectiveDate}`, 50, y); y -= 14;
  drawText(`Limit of Liability: ${data.limitOfLiability}`, 50, y); y -= 14;
  drawText(`Coverage Period: ${data.coveragePeriod}`, 50, y); y -= 14;

  y -= 20;
  drawText('BILLING', 50, y, 10, true); y -= 18;
  drawText(`Net Premium: ${data.netPremium}`, 50, y); y -= 14;
  drawText(`Documentary Stamp Tax (DST) 25%: ${data.dst}`, 50, y); y -= 14;
  drawText(`Value Added Tax (VAT) 12%: ${data.vat}`, 50, y); y -= 14;
  drawText(`Local Government Tax (LGT) 2%: ${data.lgTax}`, 50, y); y -= 14;
  drawText(`Gross Premium: ${data.grossPremium}`, 50, y, 11, true); y -= 14;
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
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function generateMotorQuotePDF(data: {
  controlNumber: string;
  expiryTime: string;
  insuredName: string;
  subtitle: string;
  totalLabel: string;
  totalAmount: string;
  sections: QuoteReceiptSection[];
  billingRows: QuoteReceiptRow[];
  finalTotalLabel: string;
  finalTotal: string;
  disclaimer: string;
}) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pdfText = (text: string) =>
    String(text)
      .replace(/₱/g, 'PHP ')
      .replace(/—/g, '-')
      .replace(/•/g, '-')
      .replace(/·/g, '/');

  const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
    page.drawText(pdfText(text), { x, y, size, font: isBold ? boldFont : font, color: rgb(0, 0, 0) });
  };

  const wrapLines = (text: string, size: number, maxWidth: number) => {
    const safeText = pdfText(text);
    const words = safeText.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [''];

    const lines: string[] = [];
    let current = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${current} ${word}`;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
    return lines;
  };

  const drawWrappedText = (text: string, x: number, y: number, size: number, maxWidth: number, isBold = false) => {
    let nextY = y;
    for (const line of wrapLines(text, size, maxWidth)) {
      drawText(line, x, nextY, size, isBold);
      nextY -= size + 3;
    }
    return nextY;
  };

  drawText('MOTOR CAR QUOTATION', 205, 792, 16, true);
  drawText('Bethel General Insurance and Surety Corporation', 142, 772, 9);
  drawText('Indicative motor quote subject to underwriting review', 178, 760, 7);

  drawText(`Control No: ${data.controlNumber}`, 50, 734, 10, true);
  drawText(`Valid until: ${data.expiryTime}`, 405, 734, 10);

  drawText(data.totalLabel.toUpperCase(), 50, 699, 9, true);
  drawText(data.totalAmount, 50, 675, 24, true);
  drawText(data.insuredName || 'Applicant', 50, 660, 10);
  if (data.subtitle) {
    drawWrappedText(data.subtitle, 50, 645, 8, 495);
  }

  let y = 618;
  for (const section of data.sections) {
    drawText(section.title.toUpperCase(), 50, y, 9, true);
    y -= 12;
    for (const row of section.rows) {
      drawText(row.label, 50, y, 8);
      const valueStartY = drawWrappedText(row.value, 235, y, 8, 300, row.emphasized);
      y = Math.min(y - 11, valueStartY - 2);
    }
    y -= 12;
  }

  drawText('BILLING SUMMARY', 50, y, 9, true);
  y -= 12;
  for (const row of data.billingRows) {
    drawText(row.label, 50, y, 8);
    const value = row.value || '—';
    y = drawWrappedText(value, 300, y, 8, 220, row.emphasized) - 3;
  }

  y -= 8;
  drawText(data.finalTotalLabel.toUpperCase(), 50, y, 9, true);
  drawText(data.finalTotal, 50, y - 22, 18, true);
  if (data.disclaimer) {
    y -= 44;
    drawWrappedText(data.disclaimer, 50, y, 7, 495);
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MotorQuote-${data.controlNumber}.pdf`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Component ─────────────────────────────────────────────────

export default function CoverNoteStep() {
  const businessInfo = useApplicationStore((s) => s.businessInfo);
  const motorVehicleInfo = useApplicationStore((s) => s.motorVehicleInfo);
  const location = useApplicationStore((s) => s.location);
  const coverNote = useApplicationStore((s) => s.coverNote);
  const setCoverNote = useApplicationStore((s) => s.setCoverNote);
  const nextStep = useApplicationStore((s) => s.nextStep);
  const scanType = useApplicationStore((s) => s.scanType);

  const [isGenerating, setIsGenerating] = useState(false);

  const isMotor = scanType === 'vehicle';
  const controlPrefix = isMotor ? 'MOTOR' : 'CGL';

  useEffect(() => {
    if (!coverNote.controlNumber) {
      setCoverNote({
        controlNumber: generateControlNumber(controlPrefix),
        expiryTime: generateExpiryTime(),
      });
    }
  }, [coverNote.controlNumber, setCoverNote, controlPrefix]);

  // ── CGL premium calculation ──────────────────────────────
  const premium = useMemo(
    () => lookupPremium(businessInfo.floorArea, businessInfo.natureOfBusiness),
    [businessInfo.floorArea, businessInfo.natureOfBusiness],
  );

  const coveragePeriod = useMemo(() => {
    if (!businessInfo.effectiveDate) return null;
    const start = new Date(businessInfo.effectiveDate + 'T00:00:00');
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${fmt(start)} — ${fmt(end)}`;
  }, [businessInfo.effectiveDate]);

  const fullAddress = useMemo(() => {
    const parts = [
      businessInfo.streetAddress,
      location.barangayName,
      location.cityName,
      location.provinceName,
    ].filter(Boolean);
    return parts.join(', ');
  }, [businessInfo.streetAddress, location.barangayName, location.cityName, location.provinceName]);

  const motorQuote = useMemo(
    () => calculateIndicativeMotorQuote(motorVehicleInfo),
    [motorVehicleInfo],
  );
  const motorQuoteSummary = useMemo(
    () => formatMotorQuoteSummary(motorQuote),
    [motorQuote],
  );

  // ── Build receipt data ──────────────────────────────────
  const motorReceiptData = useMemo(() => {
    const isPendingAssessment = motorQuote.status === 'pending_assessment' || motorQuote.status === 'not_enough_data';
    const compactRows = (rows: QuoteReceiptRow[], fallback: string): QuoteReceiptRow[] => {
      const visible = rows.filter((row) => row.value && row.value !== '—');
      return visible.length ? visible : [{ label: 'Status', value: fallback }];
    };

    const formatOptionalPHP = (value: string) => {
      const amount = Number(String(value).replace(/[^0-9.]/g, ''));
      return amount > 0 ? formatPHP(amount) : '—';
    };

    const formatMotorLineItem = (item: (typeof motorQuote.lineItems)[number]) => {
      const noteText = item.notes?.filter(Boolean).join(' · ');
      if (typeof item.amountPHP === "number") {
        const amount = formatPHP(item.amountPHP);
        if (noteText) {
          return `${amount} (${noteText})`;
        }
        return item.ratePercent ? `${amount} (${item.ratePercent}%)` : amount;
      }
      if (noteText) {
        return noteText;
      }
      return item.status === 'missing' ? 'Pending assessment' : 'Included';
    };
    const displayVariant =
      motorVehicleInfo.variant && motorVehicleInfo.variant !== 'Standard' ? motorVehicleInfo.variant : '';
    const coverageTypeLabel =
      motorVehicleInfo.coverageType === 'CTPL Only' ? 'CTPL' : motorVehicleInfo.coverageType || '—';
    const hideCtplLine = motorVehicleInfo.coverageType === 'Comprehensive';

    const sections: QuoteReceiptSection[] = [
      {
        title: 'Insured Details',
        rows: compactRows([
          { label: 'Name', value: motorVehicleInfo.fullName || '—' },
          { label: 'Address', value: motorVehicleInfo.address || '—' },
          { label: 'Email', value: motorVehicleInfo.email || '—' },
          { label: 'Phone', value: motorVehicleInfo.phone || '—' },
        ], 'Applicant details pending'),
      },
      {
        title: 'Vehicle Details',
        rows: compactRows([
          {
            label: 'Make & Model',
            value:
              [motorVehicleInfo.yearModel, motorVehicleInfo.make, motorVehicleInfo.model, displayVariant]
                .filter(Boolean)
                .join(' ') || '—',
          },
          { label: 'Variant', value: displayVariant || 'Standard' },
          { label: 'Plate Number', value: motorVehicleInfo.plateNumber || motorVehicleInfo.conductionSticker || '—' },
          { label: 'MV File Number', value: motorVehicleInfo.mvFileNumber || '—' },
          { label: 'Engine Number', value: motorVehicleInfo.engineNumber || '—' },
          { label: 'Chassis Number', value: motorVehicleInfo.chassisNumber || '—' },
          { label: 'Color', value: motorVehicleInfo.color || '—' },
          { label: 'Body Type', value: motorVehicleInfo.bodyType || '—' },
          { label: 'Seating Capacity', value: motorVehicleInfo.seatingCapacity || '—' },
          { label: 'Vehicle Use', value: motorVehicleInfo.vehicleUse || '—' },
        ], 'Vehicle details pending'),
      },
      {
        title: 'Coverage Limits',
        rows: compactRows([
          { label: 'Effective Date', value: motorVehicleInfo.effectiveDate || '—' },
          { label: 'Coverage Type', value: coverageTypeLabel },
          {
            label: 'Sum Insured / FMV',
            value: formatOptionalPHP(motorVehicleInfo.estimatedMarketValue),
          },
          {
            label: 'TPPD Limit',
            value: formatOptionalPHP(motorVehicleInfo.thirdPartyPropertyDamageLimit),
          },
          { label: 'Auto Personal Accident', value: motorVehicleInfo.autoPersonalAccident || '—' },
          { label: 'Roadside Assistance', value: motorVehicleInfo.roadsideAssistance || '—' },
        ], 'Coverage details pending'),
      },
    ];

    const billingRows: QuoteReceiptRow[] = motorQuote.lineItems
      .filter((item) =>
        item.key !== 'own_damage_theft' &&
        item.key !== 'acts_of_nature' &&
        !(hideCtplLine && item.key === 'ctpl'),
      )
      .map((item) => ({
        label: item.label,
        value: formatMotorLineItem(item),
        emphasized: item.status === 'calculated' || item.status === 'selected',
      }));

    return {
      eyebrow: 'Bethel General',
      title: 'Motor Car Insurance',
      subtitle: isPendingAssessment
        ? 'Complete the vehicle fields to calculate an indicative annual quote.'
        : 'Tariff-based annual estimate subject to underwriting review.',
      totalLabel: isPendingAssessment ? motorQuoteSummary.label : 'Annual Gross Premium',
      totalAmount: motorQuoteSummary.value,
      finalTotalLabel: 'Annual Gross Premium',
      insuredName: motorVehicleInfo.fullName || 'Applicant',
      controlNumber: coverNote.controlNumber,
      expiryTime: coverNote.expiryTime,
      sections,
      billingRows,
      finalTotal: motorQuoteSummary.value,
      transactionLabel: 'Control No.',
      transactionValue: coverNote.controlNumber,
      disclaimer: motorQuoteSummary.note,
    };
  }, [motorQuote, motorQuoteSummary, motorVehicleInfo, coverNote]);

  const cglReceiptData = useMemo(() => {
    const sections: QuoteReceiptSection[] = [
      {
        title: 'Insured Details',
        rows: [
          { label: 'Business Name', value: businessInfo.businessName || '—' },
          { label: 'Address', value: fullAddress || '—' },
          { label: 'Email', value: businessInfo.email || '—' },
        ],
      },
      {
        title: 'Coverage Details',
        rows: [
          { label: 'Nature of Business', value: businessInfo.natureOfBusiness || '—' },
          { label: 'Floor Area', value: businessInfo.floorArea ? `${businessInfo.floorArea} sqm` : '—' },
          {
            label: 'Limit of Liability',
            value: premium ? formatPHP(premium.limitOfLiability) : '—',
            emphasized: true,
          },
          { label: 'Coverage Period', value: coveragePeriod || '—' },
        ],
      },
    ];

    const billingRows: QuoteReceiptRow[] = premium
      ? [
          { label: 'Net Premium', value: formatPHP(premium.netPremium) },
          { label: 'Documentary Stamp Tax (DST) 25%', value: formatPHP(premium.dst) },
          { label: 'Value Added Tax (VAT) 12%', value: formatPHP(premium.vat) },
          { label: 'Local Government Tax (LGT) 2%', value: formatPHP(premium.lgTax) },
        ]
      : [{ label: 'Billing', value: 'Awaiting premium calculation' }];

    return {
      eyebrow: 'Bethel General',
      title: 'CGL Insurance',
      subtitle: undefined,
      totalLabel: 'Gross Premium',
      totalAmount: premium ? formatPHP(premium.grossPremium) : '—',
      insuredName: businessInfo.fullName || 'Applicant',
      controlNumber: coverNote.controlNumber,
      expiryTime: coverNote.expiryTime,
      sections,
      billingRows,
      finalTotal: premium ? formatPHP(premium.grossPremium) : '—',
      finalTotalLabel: undefined,
      transactionLabel: 'Control No.',
      transactionValue: coverNote.controlNumber,
      disclaimer: 'Estimated premium only. Subject to Bethel final underwriting assessment.',
    };
  }, [businessInfo, fullAddress, premium, coveragePeriod, coverNote]);

  const receiptData = isMotor ? motorReceiptData : cglReceiptData;

  // ── PDF download ────────────────────────────────────────
  const handleDownloadPDF = useCallback(async () => {
    if (!coverNote.controlNumber) return;
    setIsGenerating(true);
    try {
      if (isMotor) {
        await generateMotorQuotePDF({
          controlNumber: coverNote.controlNumber,
          expiryTime: coverNote.expiryTime,
          insuredName: motorVehicleInfo.fullName || 'Applicant',
          subtitle: motorReceiptData.subtitle || motorQuoteSummary.note,
          totalLabel: motorReceiptData.totalLabel,
          totalAmount: motorReceiptData.totalAmount,
          sections: motorReceiptData.sections,
          billingRows: motorReceiptData.billingRows,
          finalTotalLabel: motorReceiptData.finalTotalLabel || 'Indicative Total',
          finalTotal: motorReceiptData.finalTotal,
          disclaimer: motorReceiptData.disclaimer || motorQuoteSummary.note,
        });
        return;
      }

      await generateCoverNotePDF({
        controlNumber: coverNote.controlNumber,
        expiryTime: coverNote.expiryTime,
        fullName: businessInfo.fullName,
        businessName: businessInfo.businessName,
        fullAddress,
        natureOfBusiness: businessInfo.natureOfBusiness,
        floorArea: businessInfo.floorArea,
        effectiveDate: businessInfo.effectiveDate
          ? new Date(businessInfo.effectiveDate + 'T00:00:00').toLocaleDateString('en-PH', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : '—',
        limitOfLiability: premium ? formatPHP(premium.limitOfLiability) : '—',
        netPremium: premium ? formatPHP(premium.netPremium) : '—',
        dst: premium ? formatPHP(premium.dst) : '—',
        vat: premium ? formatPHP(premium.vat) : '—',
        lgTax: premium ? formatPHP(premium.lgTax) : '—',
        grossPremium: premium ? formatPHP(premium.grossPremium) : '—',
        coveragePeriod: coveragePeriod || '—',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    businessInfo,
    coverNote,
    coveragePeriod,
    fullAddress,
    isMotor,
    motorVehicleInfo.fullName,
    motorQuoteSummary.label,
    motorQuoteSummary.note,
    motorQuoteSummary.value,
    motorReceiptData.billingRows,
    motorReceiptData.disclaimer,
    motorReceiptData.finalTotal,
    motorReceiptData.finalTotalLabel,
    motorReceiptData.sections,
    motorReceiptData.subtitle,
    premium,
  ]);

  return (
    <div className="pb-12">
      {/* ── Quote Receipt Card ─────────────────────────────── */}
      <QuoteReceiptCard
        eyebrow={receiptData.eyebrow}
        title={receiptData.title}
        subtitle={receiptData.subtitle}
        totalLabel={receiptData.totalLabel}
        totalAmount={receiptData.totalAmount}
        insuredName={receiptData.insuredName}
        controlNumber={receiptData.controlNumber}
        expiryTime={receiptData.expiryTime}
        sections={receiptData.sections}
        billingRows={receiptData.billingRows}
        finalTotal={receiptData.finalTotal}
        finalTotalLabel={receiptData.finalTotalLabel}
        transactionLabel={receiptData.transactionLabel}
        transactionValue={receiptData.transactionValue}
        disclaimer={receiptData.disclaimer}
        isGenerating={isGenerating}
        downloadLabel={isMotor ? 'Download Motor Quote PDF' : 'Download Cover Note PDF'}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* ── Footer note ────────────────────────────────────── */}
      <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-relaxed text-on-surface-variant">
        A digital copy has been sent to your registered email address.
        <br />
        <span className="font-semibold text-primary">support@bethelgeneral.com</span>
      </p>

      {/* ── Fixed Bottom Continue ──────────────────────────── */}
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
