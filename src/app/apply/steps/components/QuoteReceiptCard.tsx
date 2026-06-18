'use client';

import Image from 'next/image';
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
  logoSrc?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  totalLabel: string;
  totalAmount: string;
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
  onDownloadPDF: () => void;
};

// ── Subcomponents ───────────────────────────────────────────

function ReceiptRow({ label, value, emphasized }: QuoteReceiptRow) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-outline">{label}</span>
      <span className={`max-w-[55%] text-right text-sm text-on-surface ${emphasized ? 'font-semibold text-primary' : ''}`}>
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

function TicketDivider() {
  return (
    <div className="relative h-6 w-full overflow-hidden bg-white">
      <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-outline-variant" />
      <div className="absolute left-0 top-1/2 -ml-3 h-6 w-6 -translate-y-1/2 rounded-full border-r border-outline-variant bg-background" />
      <div className="absolute right-0 top-1/2 -mr-3 h-6 w-6 -translate-y-1/2 rounded-full border-l border-outline-variant bg-background" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function QuoteReceiptCard({
  logoSrc = '/bethel-shield.png',
  eyebrow,
  title,
  subtitle,
  totalLabel,
  totalAmount,
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
  onDownloadPDF,
}: QuoteReceiptCardProps) {
  const isAssessmentTotal = /assessment|pending|review/i.test(totalAmount);
  const displayedTransactionValue = transactionValue || controlNumber;

  const sectionIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('vehicle') || t.includes('car')) return <Car className="h-4 w-4" />;
    if (t.includes('coverage') || t.includes('limit')) return <Shield className="h-4 w-4" />;
    if (t.includes('insured') || t.includes('applicant')) return <UserRound className="h-4 w-4" />;
    return <ReceiptText className="h-4 w-4" />;
  };

  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-[0_10px_30px_rgba(56,72,136,0.08)]">
      {/* ── Header / Logo Section ─────────────────────── */}
      <div className="bg-gradient-to-b from-surface-container-low to-white px-6 py-7 text-center border-b border-outline-variant/30">
        <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full border border-outline-variant/45 bg-surface shadow-[0_8px_20px_rgba(56,72,136,0.08)]">
          <Image
            src={logoSrc}
            alt="Bethel General Logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
        </div>
        <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-brand-gold mb-1">
          {eyebrow}
        </span>
        <h2 className="text-[28px] font-bold leading-tight tracking-tight text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
        )}
        {expiryTime && (
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-outline">
            Valid until {expiryTime}
          </p>
        )}
      </div>

      {/* ── Hero Amount ───────────────────────────────── */}
      <div className="px-6 py-7 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-outline">
          {totalLabel}
        </span>
        {isAssessmentTotal ? (
          <div className="mx-auto mt-3 inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5 shadow-[0_4px_10px_rgba(56,72,136,0.06)]">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary/75">
              {totalAmount}
            </span>
          </div>
        ) : (
          <div className="mt-1 text-[42px] font-extrabold leading-tight tracking-tight text-primary">
            {totalAmount}
          </div>
        )}
        <p className="mt-2 text-sm text-on-surface-variant">{insuredName}</p>
      </div>

      {/* ── Sections ──────────────────────────────────── */}
      {sections.map((section, idx) => (
        <div key={idx} className={`px-6 py-4 ${idx % 2 === 0 ? '' : 'bg-surface-container-low/50'}`}>
          <SectionHeader icon={sectionIcon(section.title)} title={section.title} />
          <div className="space-y-0.5">
            {section.rows.map((row, ridx) => (
              <ReceiptRow key={ridx} {...row} />
            ))}
          </div>
        </div>
      ))}

      {/* ── Ticket Divider ────────────────────────────── */}
      <TicketDivider />

      {/* ── Billing Summary ───────────────────────────── */}
      <div className="px-6 pt-4 pb-5">
        <SectionHeader icon={<ReceiptText className="h-4 w-4" />} title="Billing Summary" />
        <div className="space-y-1">
          {billingRows.map((row, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-sm text-outline">{row.label}</span>
              <span className="text-sm text-on-surface">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-primary/20 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-outline">Final Total</p>
            <p className="text-[20px] font-bold tracking-tight text-primary">{finalTotal}</p>
          </div>
          {displayedTransactionValue && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                {transactionLabel || 'Transaction ID'}
              </p>
              <p className="text-[12px] text-on-surface">{displayedTransactionValue}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Dislaimer ─────────────────────────────────── */}
      {disclaimer && (
        <div className="px-6 pb-4">
          <p className="text-[10px] leading-relaxed text-outline-variant">{disclaimer}</p>
        </div>
      )}

      {/* ── Download Button ───────────────────────────── */}
      <div className="px-6 pb-6 pt-0">
        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-[0.04em] text-primary-foreground shadow-md transition active:scale-[0.98] hover:shadow-lg disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : 'Download Cover Note PDF'}</span>
        </button>
      </div>
    </div>
  );
}
