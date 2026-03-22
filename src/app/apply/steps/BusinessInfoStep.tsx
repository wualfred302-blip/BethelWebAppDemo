'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApplicationStore } from '@/store/useApplicationStore';
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/validation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// ── 24 Nature of Business categories ─────────────────────────

const NATURE_OF_BUSINESS_OPTIONS = [
  'Retail Trade',
  'Wholesale Trade',
  'Food Service / Restaurant',
  'Manufacturing',
  'Construction',
  'Transportation / Logistics',
  'Real Estate',
  'Professional Services',
  'Healthcare / Medical',
  'Education / Training',
  'Information Technology',
  'Financial Services',
  'Agriculture / Farming',
  'Fishing / Aquaculture',
  'Mining / Quarrying',
  'Tourism / Hospitality',
  'Entertainment / Recreation',
  'Personal Services',
  'Repair / Maintenance',
  'Cleaning / Sanitation',
  'Security Services',
  'Printing / Publishing',
  'Import / Export',
  'Other',
] as const;

// ── Props ─────────────────────────────────────────────────────

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// ── Component ─────────────────────────────────────────────────

export default function BusinessInfoStep({ onNext, onBack, isFirstStep }: StepProps) {
  const { businessInfo, setBusinessInfo } = useApplicationStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: businessInfo.businessName,
      tin: businessInfo.tin,
      natureOfBusiness: businessInfo.natureOfBusiness,
      floorArea: businessInfo.floorArea,
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: BusinessInfoFormData) => {
    setBusinessInfo(data);
    onNext();
  };

  const natureOfBusinessValue = watch('natureOfBusiness');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6">
      <h3 className="text-lg font-semibold text-zinc-900">Business</h3>

      <Input
        label="Business Name"
        placeholder="e.g., Juan Dela Cruz Store"
        error={errors.businessName?.message}
        {...register('businessName')}
      />

      <Input
        label="TIN (Tax Identification Number)"
        placeholder="123-456-789-000"
        error={errors.tin?.message}
        {...register('tin')}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Nature of Business</label>
        <Select
          value={natureOfBusinessValue}
          onValueChange={(v) => {
            setValue('natureOfBusiness', v);
            trigger('natureOfBusiness');
          }}
        >
          <SelectTrigger onBlur={() => trigger('natureOfBusiness')}>
            <SelectValue placeholder="Select nature of business" />
          </SelectTrigger>
          <SelectContent>
            {NATURE_OF_BUSINESS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.natureOfBusiness && (
          <p className="text-sm text-red-500">{errors.natureOfBusiness.message}</p>
        )}
      </div>

      <Input
        label="Floor Area"
        placeholder="0"
        suffix="sqm"
        type="text"
        error={errors.floorArea?.message}
        {...register('floorArea')}
      />

      <div className="flex gap-3 pt-4">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
}
