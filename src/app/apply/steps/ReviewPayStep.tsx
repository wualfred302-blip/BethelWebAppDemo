'use client';

import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  useApplicationStore,
  generateControlNumber,
  generateExpiryTime,
} from '@/store/useApplicationStore';
import { lookupPremium, formatPHP } from '@/lib/pricing';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function ReviewPayStep({ onNext, onBack }: StepProps) {
  const businessInfo = useApplicationStore((s) => s.businessInfo);
  const location = useApplicationStore((s) => s.location);
  const contactCoverage = useApplicationStore((s) => s.contactCoverage);
  const coverNote = useApplicationStore((s) => s.coverNote);
  const setCoverNote = useApplicationStore((s) => s.setCoverNote);

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

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Review &amp; Pay</h2>
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
          {contactCoverage.email && (
            <p className="text-sm text-zinc-500">{contactCoverage.email}</p>
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
            <span className="text-lg font-bold text-zinc-900">
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

      {/* Download PDF Placeholder */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => console.log('Download Cover Note PDF — to be wired in 03-02')}
      >
        Download Cover Note PDF
      </Button>

      {/* Payment Placeholder */}
      <p className="text-sm text-zinc-500 text-center">
        Payment instructions below (coming in next update)
      </p>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
