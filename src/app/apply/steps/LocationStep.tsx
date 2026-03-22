'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  loadPSGCData,
  getRegions,
  getProvinces,
  getCities,
  getBarangays,
} from '@/lib/psgc-data';
import { locationSchema } from '@/lib/validation';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
}

export default function LocationStep({ onNext, onBack, isFirstStep }: StepProps) {
  const { location, setLocation } = useApplicationStore();

  const [data, setData] = useState<Awaited<ReturnType<typeof loadPSGCData>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load PSGC data on mount
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

  // Cascading options
  const regions = useMemo(() => (data ? getRegions(data) : []), [data]);
  const provinces = useMemo(
    () => (data ? getProvinces(data, location.regionCode) : []),
    [data, location.regionCode]
  );
  const cities = useMemo(
    () => (data ? getCities(data, location.regionCode, location.provinceCode) : []),
    [data, location.regionCode, location.provinceCode]
  );
  const barangays = useMemo(
    () =>
      data
        ? getBarangays(data, location.regionCode, location.provinceCode, location.cityCode)
        : [],
    [data, location.regionCode, location.provinceCode, location.cityCode]
  );

  // Change handlers — parent clears children silently
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

  // Validation on blur
  const validateField = (field: string) => {
    const result = locationSchema.safeParse(location);
    if (!result.success) {
      const fieldError = result.error.issues.find((e) => e.path[0] === field);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError?.message || '',
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Continue validation
  const handleContinue = () => {
    const result = locationSchema.safeParse(location);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        newErrors[err.path[0] as string] = err.message;
      }
      setErrors(newErrors);
      setTouched({
        regionCode: true,
        provinceCode: true,
        cityCode: true,
        barangayCode: true,
      });
      return;
    }
    onNext();
  };

  const isValid =
    location.regionCode &&
    location.provinceCode &&
    location.cityCode &&
    location.barangayCode;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Location</h2>

      {/* Region */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Region</label>
        <Select
          value={location.regionCode}
          onValueChange={handleRegionChange}
          disabled={isLoading}
        >
          <SelectTrigger
            onBlur={() => handleBlur('regionCode')}
            className={touched.regionCode && errors.regionCode ? 'border-red-500' : ''}
          >
            <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Region'} />
          </SelectTrigger>
          <SelectContent>
            {regions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.regionCode && errors.regionCode && (
          <p className="text-sm text-red-500">{errors.regionCode}</p>
        )}
      </div>

      {/* Province */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Province</label>
        <Select
          value={location.provinceCode}
          onValueChange={handleProvinceChange}
          disabled={!location.regionCode}
        >
          <SelectTrigger
            onBlur={() => handleBlur('provinceCode')}
            className={touched.provinceCode && errors.provinceCode ? 'border-red-500' : ''}
          >
            <SelectValue
              placeholder={!location.regionCode ? 'Select Region first' : 'Select Province'}
            />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.provinceCode && errors.provinceCode && (
          <p className="text-sm text-red-500">{errors.provinceCode}</p>
        )}
      </div>

      {/* City/Municipality */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">City/Municipality</label>
        <Select
          value={location.cityCode}
          onValueChange={handleCityChange}
          disabled={!location.provinceCode}
        >
          <SelectTrigger
            onBlur={() => handleBlur('cityCode')}
            className={touched.cityCode && errors.cityCode ? 'border-red-500' : ''}
          >
            <SelectValue
              placeholder={!location.provinceCode ? 'Select Province first' : 'Select City/Municipality'}
            />
          </SelectTrigger>
          <SelectContent>
            {cities.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.cityCode && errors.cityCode && (
          <p className="text-sm text-red-500">{errors.cityCode}</p>
        )}
      </div>

      {/* Barangay */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Barangay</label>
        <Select
          value={location.barangayCode}
          onValueChange={handleBarangayChange}
          disabled={!location.cityCode}
        >
          <SelectTrigger
            onBlur={() => handleBlur('barangayCode')}
            className={touched.barangayCode && errors.barangayCode ? 'border-red-500' : ''}
          >
            <SelectValue
              placeholder={!location.cityCode ? 'Select City first' : 'Select Barangay'}
            />
          </SelectTrigger>
          <SelectContent>
            {barangays.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.barangayCode && errors.barangayCode && (
          <p className="text-sm text-red-500">{errors.barangayCode}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleContinue} className="flex-1" disabled={!isValid}>
          Continue
        </Button>
      </div>
    </div>
  );
}
