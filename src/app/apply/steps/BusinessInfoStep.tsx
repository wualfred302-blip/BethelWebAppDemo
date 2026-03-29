'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApplicationStore } from '@/store/useApplicationStore';
import { businessInfoSchema, locationSchema, type BusinessInfoFormData } from '@/lib/validation';
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

const BUILDING_TYPE_OPTIONS = ['Commercial', 'Residential', 'Industrial', 'Mixed-Use'] as const;

const CONSTRUCTION_TYPE_OPTIONS = ['Concrete', 'Wood', 'Metal', 'Mixed'] as const;

// ── Underline label ───────────────────────────────────────────

function UnderlineLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1 group-focus-within:text-primary transition-colors"
    >
      {children}
    </label>
  );
}

// ── Field error ───────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-500 mt-1">{message}</p>;
}

// ── Section legend ────────────────────────────────────────────

function SectionLegend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="font-bold text-[0.75rem] tracking-[0.1rem] uppercase text-on-surface-variant mb-6">
      {children}
    </legend>
  );
}

// ── Component ─────────────────────────────────────────────────

export default function BusinessInfoStep() {
  const { businessInfo, location, scanData, policyData, setBusinessInfo, setLocation, nextStep } =
    useApplicationStore();

  // ── Business form (react-hook-form + zod) ───────────────────

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
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
      effectiveDate: businessInfo.effectiveDate || new Date().toISOString().split('T')[0],
      streetAddress: businessInfo.streetAddress,
      phone: businessInfo.phone,
      email: businessInfo.email,
      buildingFloors: businessInfo.buildingFloors,
      buildingType: businessInfo.buildingType,
      constructionType: businessInfo.constructionType,
    },
    mode: 'onBlur',
  });

  // ── Pre-fill form from OCR scan data (permit) ───────────

  useEffect(() => {
    if (scanData) {
      if (scanData.fullName) setValue('fullName', scanData.fullName);
      if (scanData.businessName) setValue('businessName', scanData.businessName);
      if (scanData.tin) setValue('tin', scanData.tin);
      if (scanData.streetAddress) setValue('streetAddress', scanData.streetAddress);
      if (scanData.effectiveDate) setValue('effectiveDate', scanData.effectiveDate);
      if (scanData.regionName) setLocation({ regionName: scanData.regionName });
      if (scanData.provinceName) setLocation({ provinceName: scanData.provinceName });
      if (scanData.cityName) setLocation({ cityName: scanData.cityName });
      if (scanData.barangayName) setLocation({ barangayName: scanData.barangayName });
    }
  }, [scanData, setValue, setLocation]);

  // ── Pre-fill form from policy scan data (renewal) ───────

  useEffect(() => {
    if (policyData) {
      if (policyData.namedInsured) setValue('fullName', policyData.namedInsured);
      if (policyData.businessAddress) setValue('streetAddress', policyData.businessAddress);
    }
  }, [policyData, setValue]);

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

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const city = cities.find((c) => c.value === value);
    setLocation({
      cityCode: value,
      cityName: city?.label || '',
      barangayCode: '',
      barangayName: '',
    });
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const barangay = barangays.find((b) => b.value === value);
    setLocation({ barangayCode: value, barangayName: barangay?.label || '' });
  };

  // ── Location validation on blur ────────────────────────────

  const validateLocationField = (field: string) => {
    const result = locationSchema.safeParse(location);
    if (!result.success) {
      const fieldError = result.error.issues.find((err) => err.path[0] === field);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {/* ── Title Section ───────────────────────────────────── */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Business Details</h1>
        <p className="text-sm text-on-surface-variant">
          Please provide the details of the establishment to be insured under the CGL policy.
        </p>
      </section>

      {/* ── Assured Details ──────────────────────────────────── */}
      <fieldset>
        <SectionLegend>ASSURED DETAILS</SectionLegend>
        <div className="space-y-8">
          <div className="group">
            <UnderlineLabel htmlFor="fullName">Full Name</UnderlineLabel>
            <input
              id="fullName"
              className="input-underline"
              placeholder="Juan Dela Cruz"
              type="text"
              {...register('fullName')}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div className="group">
            <UnderlineLabel htmlFor="businessName">Business Name</UnderlineLabel>
            <input
              id="businessName"
              className="input-underline"
              placeholder="Bethel Enterprises Corp."
              type="text"
              {...register('businessName')}
            />
            <FieldError message={errors.businessName?.message} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
              <UnderlineLabel htmlFor="tin">TIN</UnderlineLabel>
              <input
                id="tin"
                className="input-underline"
                placeholder="000-000-000"
                type="text"
                {...register('tin')}
              />
              <FieldError message={errors.tin?.message} />
            </div>
            <div className="group">
              <UnderlineLabel htmlFor="effectiveDate">Effective Date</UnderlineLabel>
              <input
                id="effectiveDate"
                className="input-underline"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                max={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 30);
                  return d.toISOString().split('T')[0];
                })()}
                {...register('effectiveDate')}
              />
              <FieldError message={errors.effectiveDate?.message} />
            </div>
          </div>

          <div className="group">
            <UnderlineLabel htmlFor="floorArea">Floor Area (sqm)</UnderlineLabel>
            <input
              id="floorArea"
              className="input-underline"
              placeholder="120"
              type="text"
              {...register('floorArea')}
            />
            <FieldError message={errors.floorArea?.message} />
          </div>

          <div className="group">
            <UnderlineLabel htmlFor="natureOfBusiness">Nature of Business</UnderlineLabel>
            <select
              id="natureOfBusiness"
              className="input-underline"
              value={natureOfBusinessValue || ''}
              onChange={(e) => {
                setValue('natureOfBusiness', e.target.value);
                trigger('natureOfBusiness');
              }}
              onBlur={() => trigger('natureOfBusiness')}
            >
              <option disabled value="">
                Select option
              </option>
              {NATURE_OF_BUSINESS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.natureOfBusiness?.message} />
          </div>
        </div>
      </fieldset>

      {/* ── Building Details ──────────────────────────────────── */}
      <fieldset>
        <SectionLegend>BUILDING DETAILS</SectionLegend>
        <div className="space-y-8">
          <div className="group">
            <UnderlineLabel htmlFor="buildingFloors">Building Floors/Levels</UnderlineLabel>
            <input
              id="buildingFloors"
              className="input-underline"
              placeholder="2"
              type="text"
              {...register('buildingFloors')}
            />
            <FieldError message={errors.buildingFloors?.message} />
          </div>

          <div className="group">
            <UnderlineLabel htmlFor="buildingType">Building Type</UnderlineLabel>
            <select
              id="buildingType"
              className="input-underline"
              value={buildingTypeValue || ''}
              onChange={(e) => {
                setValue('buildingType', e.target.value);
                trigger('buildingType');
              }}
              onBlur={() => trigger('buildingType')}
            >
              <option disabled value="">
                Select option
              </option>
              {BUILDING_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.buildingType?.message} />
          </div>

          <div className="group">
            <UnderlineLabel htmlFor="constructionType">Construction Type</UnderlineLabel>
            <select
              id="constructionType"
              className="input-underline"
              value={constructionTypeValue || ''}
              onChange={(e) => {
                setValue('constructionType', e.target.value);
                trigger('constructionType');
              }}
              onBlur={() => trigger('constructionType')}
            >
              <option disabled value="">
                Select option
              </option>
              {CONSTRUCTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.constructionType?.message} />
          </div>
        </div>
      </fieldset>

      {/* ── Location ────────────────────────────────────────── */}
      <fieldset>
        <SectionLegend>LOCATION</SectionLegend>
        <div className="space-y-8">
          <div className="group">
            <UnderlineLabel htmlFor="streetAddress">Street Address</UnderlineLabel>
            <textarea
              id="streetAddress"
              className="input-underline resize-none"
              placeholder="Unit 402, High-Street Tower"
              rows={2}
              {...register('streetAddress')}
            />
            <FieldError message={errors.streetAddress?.message} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
              <UnderlineLabel htmlFor="region">Region</UnderlineLabel>
              <select
                id="region"
                className="input-underline"
                value={location.regionCode}
                onChange={handleRegionChange}
                disabled={isLoading}
                onBlur={() => handleLocationBlur('regionCode')}
              >
                <option disabled value="">
                  {isLoading ? 'Loading...' : 'Select'}
                </option>
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {touched.regionCode && <FieldError message={locationErrors.regionCode} />}
            </div>
            <div className="group">
              <UnderlineLabel htmlFor="province">Province</UnderlineLabel>
              <select
                id="province"
                className="input-underline"
                value={location.provinceCode}
                onChange={handleProvinceChange}
                disabled={!location.regionCode}
                onBlur={() => handleLocationBlur('provinceCode')}
              >
                <option disabled value="">
                  {!location.regionCode ? 'Select Region first' : 'Select'}
                </option>
                {provinces.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {touched.provinceCode && <FieldError message={locationErrors.provinceCode} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
              <UnderlineLabel htmlFor="city">City</UnderlineLabel>
              <select
                id="city"
                className="input-underline"
                value={location.cityCode}
                onChange={handleCityChange}
                disabled={!location.provinceCode}
                onBlur={() => handleLocationBlur('cityCode')}
              >
                <option disabled value="">
                  {!location.provinceCode ? 'Select Province first' : 'Select'}
                </option>
                {cities.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {touched.cityCode && <FieldError message={locationErrors.cityCode} />}
            </div>
            <div className="group">
              <UnderlineLabel htmlFor="barangay">Barangay</UnderlineLabel>
              <select
                id="barangay"
                className="input-underline"
                value={location.barangayCode}
                onChange={handleBarangayChange}
                disabled={!location.cityCode}
                onBlur={() => handleLocationBlur('barangayCode')}
              >
                <option disabled value="">
                  {!location.cityCode ? 'Select City first' : 'Select'}
                </option>
                {barangays.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              {touched.barangayCode && <FieldError message={locationErrors.barangayCode} />}
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── Contact ──────────────────────────────────────────── */}
      <fieldset>
        <SectionLegend>CONTACT</SectionLegend>
        <div className="space-y-8">
          <div className="group">
            <UnderlineLabel htmlFor="phone">Phone Number</UnderlineLabel>
            <input
              id="phone"
              className="input-underline"
              placeholder="+63 900 000 0000"
              type="tel"
              {...register('phone')}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="group">
            <UnderlineLabel htmlFor="email">Email Address</UnderlineLabel>
            <input
              id="email"
              className="input-underline"
              placeholder="juan.dc@example.com"
              type="email"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
        </div>
      </fieldset>

      {/* ── Security Notice ─────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-12">
        <svg
          className="w-4 h-4 text-outline"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className="text-[11px] font-medium text-outline-variant uppercase tracking-wider">
          Your information is encrypted and secure
        </p>
      </div>

      {/* ── Fixed Bottom Continue ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 pt-4 pb-8 z-50">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            onClick={() => {
              setBusinessInfo(getValues());
              nextStep();
            }}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-md"
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
