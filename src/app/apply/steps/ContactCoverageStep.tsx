'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormData } from '@/lib/validation';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function ContactCoverageStep({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  const { contactCoverage, setContactCoverage, businessInfo } = useApplicationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: contactCoverage.phone,
      email: contactCoverage.email,
    },
    mode: 'onBlur',
  });

  // Auto-calculate coverage based on floor area
  const coverageAmount = useMemo(() => {
    const area = parseFloat(businessInfo.floorArea) || 0;
    // Coverage formula: ₱5,000 per sqm, minimum ₱100,000
    return Math.max(area * 5000, 100000);
  }, [businessInfo.floorArea]);

  // Premium: 1% of coverage amount
  const premiumAmount = useMemo(() => {
    return coverageAmount * 0.01;
  }, [coverageAmount]);

  // Format as PHP currency
  const formattedCoverage = coverageAmount.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  const formattedPremium = premiumAmount.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  const onSubmit = (data: ContactFormData) => {
    setContactCoverage({
      ...data,
      limitOfLiability: String(coverageAmount),
      premium: String(premiumAmount),
    });
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Contact & Coverage</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Contact</h3>

          <Input
            label="Phone Number"
            placeholder="09123456789"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Calculated Coverage Display */}
        <div className="rounded-lg bg-blue-50 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Calculated Coverage</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Coverage Amount</span>
            <span className="font-medium">{formattedCoverage}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Premium (1%)</span>
            <span className="font-medium">{formattedPremium}</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {!isFirstStep && (
            <Button variant="outline" type="button" onClick={onBack} className="flex-1">
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1">
            {isLastStep ? 'Submit' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
