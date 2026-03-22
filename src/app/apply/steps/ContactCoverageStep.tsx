'use client';

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
  const { contactCoverage, setContactCoverage } = useApplicationStore();

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

  const onSubmit = (data: ContactFormData) => {
    setContactCoverage(data);
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Contact</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
