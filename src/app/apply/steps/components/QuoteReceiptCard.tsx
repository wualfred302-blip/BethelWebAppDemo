'use client';

import { Download, Shield, Car, ReceiptText, UserRound } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────

export type QuoteReceiptRow = {
  label: string;
  value: string;
  emphasized?: boolean;
};

export type QuoteReceiptSection = {
  title: string;
  rows: QuoteReceiptRow[];
};

export type QuoteReceiptCardProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  totalLabel: string;
  totalAmount: string;
  finalTotalLabel?: string;
  insuredName: string;
  controlNumber: string;
  expiryTime?: string;
  sections: QuoteReceiptSection[];
  billingRows: QuoteReceiptRow[];
  finalTotal: string;
  transactionLabel?: string;
  transactionValue?: string;
  disclaimer?: string;
  isGenerating?: boolean;
  downloadLabel?: string;
  onDownloadPDF: () => void;
};

// ── Subcomponents ───────────────────────────────────────────

function ReceiptRow({ label, value, emphasized }: QuoteReceiptRow) {
  return (
    <div className="py-2">
      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-outline">
        {label}
      </span>
      <span
        className={`mt-1 block text-sm leading-snug text-on-surface ${
          emphasized ? 'font-semibold text-primary' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-primary/70">{icon}</span>}
      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary/70">{title}</h3>
    </div>
  );
}

function SummaryPanel({
  label,
  value,
  helper,
  emphasis,
}: {
  label: string;
  value: string;
  helper?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border-y border-outline-variant/60 px-5 py-4">
      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-outline">
        {label}
      </span>
      <span
        className={`mt-1 block break-words ${
          emphasis ? 'text-[20px] font-semibold text-primary' : 'text-[16px] font-semibold text-on-surface'
        }`}
      >
        {value}
      </span>
      {helper && <p className="mt-1 text-[11px] leading-snug text-on-surface-variant">{helper}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function QuoteReceiptCard({
  eyebrow,
  title,
  subtitle,
  totalLabel,
  totalAmount,
  finalTotalLabel = 'Final Total',
  insuredName,
  controlNumber,
  expiryTime,
  sections,
  billingRows,
  finalTotal,
  transactionLabel,
  transactionValue,
  disclaimer,
  isGenerating,
  downloadLabel = 'Download Cover Note PDF',
  onDownloadPDF,
}: QuoteReceiptCardProps) {
  const isAssessmentTotal = /assessment|pending|review/i.test(totalAmount);
  const isAssessmentFinalTotal = /assessment|pending|review/i.test(finalTotal);
  const displayedTransactionValue = transactionValue || controlNumber;

  const sectionIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('vehicle') || t.includes('car')) return <Car className="h-4 w-4" />;
    if (t.includes('coverage') || t.includes('limit')) return <Shield className="h-4 w-4" />;
    if (t.includes('insured') || t.includes('applicant')) return <UserRound className="h-4 w-4" />;
    return <ReceiptText className="h-4 w-4" />;
  };

  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden border border-outline-variant/60 bg-white shadow-none">
      {/* ── Header Section ─────────────────────────────── */}
      <div className="border-b border-outline-variant/30 px-5 py-6 text-center">
        <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-brand-gold mb-1">
          {eyebrow}
        </span>
        <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
        )}
        {expiryTime && (
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-outline">
            Valid until {expiryTime}
          </p>
        )}
      </div>

      {/* ── Premium Summary ────────────────────────────── */}
      {isAssessmentTotal ? (
        <SummaryPanel
          label="Premium"
          value={totalAmount}
          helper="Final premium will be confirmed after underwriting review."
        />
      ) : (
        <SummaryPanel
          label={totalLabel}
          value={totalAmount}
          helper={insuredName}
          emphasis
        />
      )}

      {/* ── Sections ──────────────────────────────────── */}
      <div className="divide-y divide-outline-variant/35">
        {sections.map((section, idx) => (
          <div key={idx} className="px-5 py-4">
            <SectionHeader icon={sectionIcon(section.title)} title={section.title} />
            <div className="space-y-1">
              {section.rows.map((row, ridx) => (
                <ReceiptRow key={ridx} {...row} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Billing Summary ───────────────────────────── */}
      {isAssessmentFinalTotal ? (
        displayedTransactionValue && (
          <div className="border-t border-outline-variant/35 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
              {transactionLabel || 'Control No.'}
            </p>
            <p className="mt-1 break-all font-mono text-[12px] font-medium tracking-[0.08em] text-on-surface">
              {displayedTransactionValue}
            </p>
          </div>
        )
      ) : (
        <div className="border-t border-outline-variant/35 px-5 py-4">
          <SectionHeader icon={<ReceiptText className="h-4 w-4" />} title="Billing Summary" />
          <div className="space-y-1">
            {billingRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[minmax(0,1fr)_minmax(7.5rem,45%)] gap-4 py-1.5">
                <span className="min-w-0 text-sm leading-snug text-outline">{row.label}</span>
                <span
                  className={`min-w-0 break-words text-right text-sm leading-snug ${
                    row.emphasized ? 'font-semibold text-primary' : 'text-on-surface'
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-end gap-4 border-t border-primary/20 pt-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-outline">
                {finalTotalLabel}
              </p>
              <p className="break-words text-[20px] font-bold tracking-tight text-primary">{finalTotal}</p>
            </div>
            {displayedTransactionValue && (
              <div className="min-w-0 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                  {transactionLabel || 'Transaction ID'}
                </p>
                <p className="break-all text-[12px] text-on-surface">{displayedTransactionValue}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Dislaimer ─────────────────────────────────── */}
      {disclaimer && (
        <div className="px-6 pb-4">
          <p className="text-[10px] leading-relaxed text-outline-variant">{disclaimer}</p>
        </div>
      )}

      {/* ── Download Button ───────────────────────────── */}
      <div className="px-5 pb-5 pt-0">
        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 border border-primary/20 bg-transparent px-4 py-4 text-sm font-bold uppercase tracking-[0.04em] text-primary transition active:scale-[0.98] hover:bg-primary/5 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : downloadLabel}</span>
        </button>
      </div>
    </div>
  );
}
