'use client';

import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react';
import { formatPHP } from '@/lib/pricing';

export default function MatchedOfferStep() {
  const { renewalOffer, prevStep, nextStep } = useApplicationStore();

  if (!renewalOffer) {
    return (
      <div className="max-w-2xl mx-auto min-h-[calc(100dvh-10rem)] flex items-center justify-center">
        <p className="text-on-surface-variant">No renewal offer available.</p>
      </div>
    );
  }

  const { currentTotal, bethelTotal, savings, savingsPercent, coverageLines, vehicleSummary, currentInsurer, currentPolicyNumber } = renewalOffer;

  return (
    <div className="max-w-2xl mx-auto min-h-[calc(100dvh-10rem)] flex flex-col pb-36">
      <section className="flex flex-col gap-2 pt-8 mb-6">
        <h2 className="text-2xl font-bold text-primary">Your matched renewal offer</h2>
        <p className="text-sm text-on-surface-variant">Same coverage, estimated {savingsPercent}% lower than your current policy.</p>
      </section>

      <section className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex justify-between items-center pb-4 border-b border-surface-container">
            <span className="text-sm text-on-surface-variant">Current Insurer Total</span>
            <span className="text-sm text-outline line-through">{formatPHP(currentTotal)}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Bethel Matched Offer</span>
            </div>
            <span className="text-2xl font-bold text-primary">{formatPHP(bethelTotal)}</span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-surface-container">
            <span className="text-sm text-on-surface-variant font-medium">Estimated Savings</span>
            <div className="bg-amber-50 text-amber-800 px-2 py-1 rounded flex items-center gap-1">
              <span className="text-sm font-semibold">Save {formatPHP(savings)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3 pl-1">Coverage Match</h3>
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
          <ul className="flex flex-col divide-y divide-surface-container">
            {coverageLines.map((line, i) => (
              <li key={i} className={`flex items-center gap-3 p-4 ${i % 2 === 0 ? 'bg-surface-bright/50' : ''}`}>
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-on-surface">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3 pl-1">Extracted Details</h3>
        <div className="border-y border-outline-variant/50">
          {currentPolicyNumber && (
            <div className="flex justify-between items-center py-3 border-b border-surface-container/50 bg-background">
              <span className="text-sm text-on-surface-variant">Policy Number</span>
              <span className="text-sm text-on-surface">{currentPolicyNumber}</span>
            </div>
          )}
          {currentInsurer && (
            <div className="flex justify-between items-center py-3 border-b border-surface-container/50 bg-surface-bright/30">
              <span className="text-sm text-on-surface-variant">Insurer</span>
              <span className="text-sm text-on-surface">{currentInsurer}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-b border-surface-container/50 bg-background">
            <span className="text-sm text-on-surface-variant">Vehicle</span>
            <span className="text-sm text-on-surface text-right">{vehicleSummary}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-surface-bright/30">
            <span className="text-sm text-on-surface-variant">Deductible</span>
            <span className="text-sm text-on-surface">{formatPHP(3000)}</span>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-relaxed text-outline text-center px-4">
        By accepting this offer, you agree to Bethel&apos;s terms and conditions. The estimated savings are based on your provided current policy document. Final premium is subject to physical vehicle inspection if required.
      </p>

      <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/30 px-6 py-4 flex flex-col gap-3 z-50">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-3">
          <Button
            type="button"
            onClick={nextStep}
            className="w-full bg-secondary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Accept renewal offer
            <ChevronRight className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={prevStep}
            className="w-full bg-transparent text-primary font-semibold py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Review extracted policy
          </button>
        </div>
      </footer>
    </div>
  );
}
