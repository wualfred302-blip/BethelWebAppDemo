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

// ── Building Type options ────────────────────────────────────

const BUILDING_TYPE_OPTIONS = [
  'Commercial',
  'Residential',
  'Industrial',
  'Mixed-Use',
] as const;

// ── Construction Type options ────────────────────────────────

const CONSTRUCTION_TYPE_OPTIONS = [
  'Concrete',
  'Wood',
  'Metal',
  'Mixed',
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
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
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

export default function BusinessInfoStep() {
  const { businessInfo, location, scanData, setBusinessInfo, setLocation, nextStep } = useApplicationStore();

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
      phone: businessInfo.phone,
      email: businessInfo.email,
      buildingFloors: businessInfo.buildingFloors,
      buildingType: businessInfo.buildingType,
      constructionType: businessInfo.constructionType,
    },
    mode: 'onBlur',
  });

  // ── Pre-fill form from OCR scan data ───────────────────────

  useEffect(() => {
    if (scanData) {
      if (scanData.fullName) setValue('fullName', scanData.fullName);
      if (scanData.businessName) setValue('businessName', scanData.businessName);
      if (scanData.tin) setValue('tin', scanData.tin);
      if (scanData.streetAddress) setValue('streetAddress', scanData.streetAddress);
      if (scanData.regionName) setLocation({ regionName: scanData.regionName });
      if (scanData.provinceName) setLocation({ provinceName: scanData.provinceName });
      if (scanData.cityName) setLocation({ cityName: scanData.cityName });
      if (scanData.barangayName) setLocation({ barangayName: scanData.barangayName });
    }
  }, [scanData, setValue, setLocation]);

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
    nextStep();
  };

  const natureOfBusinessValue = watch('natureOfBusiness');
  const buildingTypeValue = watch('buildingType');
  const constructionTypeValue = watch('constructionType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Assured Details ──────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: '#4868a8' }}>Assured Details</h2>

        <Input
          label="Full Name of Assured"
          placeholder="Enter legal name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Business Name"
          placeholder="Trading name (if different)"
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        {/* Two-column: TIN + Floor Area */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="TIN"
            placeholder="000-000-000"
            error={errors.tin?.message}
            {...register('tin')}
          />
          <Input
            label="Floor Area"
            placeholder="0.00"
            suffix="sqm"
            type="text"
            error={errors.floorArea?.message}
            {...register('floorArea')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
            Nature of Business
          </label>
          <Select
            value={natureOfBusinessValue}
            onValueChange={(v) => {
              setValue('natureOfBusiness', v);
              trigger('natureOfBusiness');
            }}
          >
            <SelectTrigger onBlur={() => trigger('natureOfBusiness')}>
              <SelectValue placeholder="Select category" />
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
            <p className="text-sm text-red-500 px-1">{errors.natureOfBusiness.message}</p>
          )}
        </div>
      </div>

      {/* ── Building Details ──────────────────────────────────── */}
      <div className="pt-2 space-y-4">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: '#4868a8' }}>Building Details</h2>

        {/* Building Floors */}
        <Input
          label="Building Floors/Level"
          placeholder="e.g. 3"
          type="text"
          error={errors.buildingFloors?.message}
          {...register('buildingFloors')}
        />

        {/* Building Type & Construction Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Building Type
            </label>
            <Select
              value={buildingTypeValue}
              onValueChange={(v) => {
                setValue('buildingType', v);
                trigger('buildingType');
              }}
            >
              <SelectTrigger onBlur={() => trigger('buildingType')}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {BUILDING_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.buildingType && (
              <p className="text-sm text-red-500 px-1">{errors.buildingType.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Construction Type
            </label>
            <Select
              value={constructionTypeValue}
              onValueChange={(v) => {
                setValue('constructionType', v);
                trigger('constructionType');
              }}
            >
              <SelectTrigger onBlur={() => trigger('constructionType')}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {CONSTRUCTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.constructionType && (
              <p className="text-sm text-red-500 px-1">{errors.constructionType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Location ────────────────────────────────────────── */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#4868a8' }}>Location</h2>
          <svg
            className="h-5 w-5 text-primary/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
        </div>

        {/* Street Address */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
            Street Address
          </label>
          <textarea
            placeholder="Building, Unit No., Street name"
            rows={1}
            className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-4 text-sm text-on-surface placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            {...register('streetAddress')}
          />
          {errors.streetAddress && (
            <p className="text-sm text-red-500 px-1">{errors.streetAddress.message}</p>
          )}
        </div>

        {/* Region & Province */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Region
            </label>
            <Select
              value={location.regionCode}
              onValueChange={handleRegionChange}
              disabled={isLoading}
            >
              <SelectTrigger onBlur={() => handleLocationBlur('regionCode')}>
                <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Region'} />
              </SelectTrigger>
              <SearchableSelectContent options={regions} placeholder="Search regions..." />
            </Select>
            {touched.regionCode && locationErrors.regionCode && (
              <p className="text-sm text-red-500">{locationErrors.regionCode}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Province
            </label>
            <Select
              value={location.provinceCode}
              onValueChange={handleProvinceChange}
              disabled={!location.regionCode}
            >
              <SelectTrigger onBlur={() => handleLocationBlur('provinceCode')}>
                <SelectValue
                  placeholder={
                    !location.regionCode ? 'Select Region first' : 'Select Province'
                  }
                />
              </SelectTrigger>
              <SearchableSelectContent options={provinces} placeholder="Search provinces..." />
            </Select>
            {touched.provinceCode && locationErrors.provinceCode && (
              <p className="text-sm text-red-500">{locationErrors.provinceCode}</p>
            )}
          </div>
        </div>

        {/* City & Barangay */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              City
            </label>
            <Select
              value={location.cityCode}
              onValueChange={handleCityChange}
              disabled={!location.provinceCode}
            >
              <SelectTrigger onBlur={() => handleLocationBlur('cityCode')}>
                <SelectValue
                  placeholder={
                    !location.provinceCode ? 'Select Province first' : 'Select City'
                  }
                />
              </SelectTrigger>
              <SearchableSelectContent options={cities} placeholder="Search cities..." />
            </Select>
            {touched.cityCode && locationErrors.cityCode && (
              <p className="text-sm text-red-500">{locationErrors.cityCode}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Barangay
            </label>
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
        </div>
      </div>

      {/* ── Contact ──────────────────────────────────────────── */}
      <div className="pt-2 space-y-4">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: '#4868a8' }}>Contact</h2>

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

      {/* ── Security Notice ─────────────────────────────────── */}
      <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-4 border border-primary/10">
        <svg
          className="h-5 w-5 text-primary mt-0.5 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          All data is encrypted. We use your business details solely for risk assessment and
          policy underwriting.
        </p>
      </div>

      {/* ── Fixed Bottom Continue ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 px-6 py-6 z-50">
        <div className="max-w-md mx-auto">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-container text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform duration-200"
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
