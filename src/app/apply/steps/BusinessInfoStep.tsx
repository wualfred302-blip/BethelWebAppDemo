'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApplicationStore } from '@/store/useApplicationStore';
import { businessInfoSchema, locationSchema, type BusinessInfoFormData } from '@/lib/validation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  loadPSGCData,
  getRegions,
  getProvinces,
  getCities,
  getBarangays,
  type SelectOption,
} from '@/lib/psgc-data';

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

// ── Searchable SelectContent ─────────────────────────────────

function SearchableSelectContent({
  options,
  placeholder,
  className,
}: {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  return (
    <SelectContent className={className}>
      <div className="sticky top-0 z-10 bg-white p-2 border-b border-zinc-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder || 'Search...'}
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {filtered.length === 0 ? (
        <li className="px-4 py-2 text-sm text-zinc-400">No results found</li>
      ) : (
        filtered.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))
      )}
    </SelectContent>
  );
}

// ── Props ─────────────────────────────────────────────────────

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// ── Component ─────────────────────────────────────────────────

export default function BusinessInfoStep({ onNext, onBack, isFirstStep }: StepProps) {
  const { businessInfo, location, setBusinessInfo, setLocation } = useApplicationStore();

  // ── Business form (react-hook-form + zod) ───────────────────

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
      fullName: businessInfo.fullName,
      businessName: businessInfo.businessName,
      tin: businessInfo.tin,
      natureOfBusiness: businessInfo.natureOfBusiness,
      floorArea: businessInfo.floorArea,
      streetAddress: businessInfo.streetAddress,
    },
    mode: 'onBlur',
  });

  // ── PSGC data loading ──────────────────────────────────────

  const [data, setData] = useState<Awaited<ReturnType<typeof loadPSGCData>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPSGCData()
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  // ── Cascading options ──────────────────────────────────────

  const regions = useMemo(() => (data ? getRegions(data) : []), [data]);
  const provinces = useMemo(
    () => (data ? getProvinces(data, location.regionCode) : []),
    [data, location.regionCode],
  );
  const cities = useMemo(
    () => (data ? getCities(data, location.regionCode, location.provinceCode) : []),
    [data, location.regionCode, location.provinceCode],
  );
  const barangays = useMemo(
    () =>
      data
        ? getBarangays(data, location.regionCode, location.provinceCode, location.cityCode)
        : [],
    [data, location.regionCode, location.provinceCode, location.cityCode],
  );

  // ── Location change handlers (parent clears children) ──────

  const handleRegionChange = (value: string) => {
    const region = regions.find((r) => r.value === value);
    setLocation({
      regionCode: value,
      regionName: region?.label || '',
      provinceCode: '',
      provinceName: '',
      cityCode: '',
      cityName: '',
      barangayCode: '',
      barangayName: '',
    });
  };

  const handleProvinceChange = (value: string) => {
    const province = provinces.find((p) => p.value === value);
    setLocation({
      provinceCode: value,
      provinceName: province?.label || '',
      cityCode: '',
      cityName: '',
      barangayCode: '',
      barangayName: '',
    });
  };

  const handleCityChange = (value: string) => {
    const city = cities.find((c) => c.value === value);
    setLocation({
      cityCode: value,
      cityName: city?.label || '',
      barangayCode: '',
      barangayName: '',
    });
  };

  const handleBarangayChange = (value: string) => {
    const barangay = barangays.find((b) => b.value === value);
    setLocation({ barangayCode: value, barangayName: barangay?.label || '' });
  };

  // ── Location validation on blur ────────────────────────────

  const validateLocationField = (field: string) => {
    const result = locationSchema.safeParse(location);
    if (!result.success) {
      const fieldError = result.error.issues.find((e) => e.path[0] === field);
      setLocationErrors((prev) => ({
        ...prev,
        [field]: fieldError?.message || '',
      }));
    } else {
      setLocationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLocationBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateLocationField(field);
  };

  // ── Submit ─────────────────────────────────────────────────

  const onSubmit = async (data: BusinessInfoFormData) => {
    // Validate location fields too
    const locationResult = locationSchema.safeParse(location);
    if (!locationResult.success) {
      const newErrors: Record<string, string> = {};
      for (const err of locationResult.error.issues) {
        newErrors[err.path[0] as string] = err.message;
      }
      setLocationErrors(newErrors);
      setTouched({
        regionCode: true,
        provinceCode: true,
        cityCode: true,
        barangayCode: true,
      });
      return;
    }

    setBusinessInfo(data);
    onNext();
  };

  const natureOfBusinessValue = watch('natureOfBusiness');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-5">
      {/* ── Personal ──────────────────────────────────────────── */}
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-6 first:mt-0">Personal</h3>

      <Input
        label="Full Name of Assured *"
        placeholder="Juan Dela Cruz"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      {/* ── Business ──────────────────────────────────────────── */}
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-6 first:mt-0">Business</h3>

      <Input
        label="Business Name *"
        placeholder="e.g., Juan Dela Cruz Store"
        error={errors.businessName?.message}
        {...register('businessName')}
      />

      <Input
        label="TIN (Tax Identification Number) *"
        placeholder="123-456-789-000"
        error={errors.tin?.message}
        {...register('tin')}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Nature of Business *</label>
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
        label="Floor Area *"
        placeholder="0"
        suffix="sqm"
        type="text"
        error={errors.floorArea?.message}
        {...register('floorArea')}
      />

      {/* ── Location ──────────────────────────────────────────── */}
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-6 first:mt-0">Location</h3>

      <Input
        label="Street Address *"
        placeholder="123 Main St"
        error={errors.streetAddress?.message}
        {...register('streetAddress')}
      />

      {/* Region */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Region *</label>
        <Select
          value={location.regionCode}
          onValueChange={handleRegionChange}
          disabled={isLoading}
        >
          <SelectTrigger onBlur={() => handleLocationBlur('regionCode')}>
            <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Region'} />
          </SelectTrigger>
          <SearchableSelectContent
            options={regions}
            placeholder="Search regions..."
          />
        </Select>
        {touched.regionCode && locationErrors.regionCode && (
          <p className="text-sm text-red-500">{locationErrors.regionCode}</p>
        )}
      </div>

      {/* Province */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Province *</label>
        <Select
          value={location.provinceCode}
          onValueChange={handleProvinceChange}
          disabled={!location.regionCode}
        >
          <SelectTrigger onBlur={() => handleLocationBlur('provinceCode')}>
            <SelectValue
              placeholder={!location.regionCode ? 'Select Region first' : 'Select Province'}
            />
          </SelectTrigger>
          <SearchableSelectContent
            options={provinces}
            placeholder="Search provinces..."
          />
        </Select>
        {touched.provinceCode && locationErrors.provinceCode && (
          <p className="text-sm text-red-500">{locationErrors.provinceCode}</p>
        )}
      </div>

      {/* City/Municipality */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">City/Municipality *</label>
        <Select
          value={location.cityCode}
          onValueChange={handleCityChange}
          disabled={!location.provinceCode}
        >
          <SelectTrigger onBlur={() => handleLocationBlur('cityCode')}>
            <SelectValue
              placeholder={!location.provinceCode ? 'Select Province first' : 'Select City/Municipality'}
            />
          </SelectTrigger>
          <SearchableSelectContent
            options={cities}
            placeholder="Search cities..."
          />
        </Select>
        {touched.cityCode && locationErrors.cityCode && (
          <p className="text-sm text-red-500">{locationErrors.cityCode}</p>
        )}
      </div>

      {/* Barangay */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Barangay *</label>
        <Select
          value={location.barangayCode}
          onValueChange={handleBarangayChange}
          disabled={!location.cityCode}
        >
          <SelectTrigger onBlur={() => handleLocationBlur('barangayCode')}>
            <SelectValue
              placeholder={!location.cityCode ? 'Select City first' : 'Select Barangay'}
            />
          </SelectTrigger>
          <SearchableSelectContent
            options={barangays}
            placeholder="Search barangays..."
          />
        </Select>
        {touched.barangayCode && locationErrors.barangayCode && (
          <p className="text-sm text-red-500">{locationErrors.barangayCode}</p>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
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
