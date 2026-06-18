'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useApplicationStore, type MotorVehicleInfo } from '@/store/useApplicationStore';
import { CheckCircle2 } from 'lucide-react';
import {
  formatVehicleCatalogLabel,
  formatVehicleRatingClassLabel,
  getVehicleEntry,
  getVehicleMakes,
  getVehicleModels,
  getVehicleVariants,
  getVehicleYears,
} from '@/data/motor/vehicle-catalog';

function UnderlineLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-outline transition-colors group-focus-within:text-primary"
    >
      {children}
    </label>
  );
}

function SectionLegend({ children }: { children: ReactNode }) {
  return (
    <legend className="mb-6 font-bold text-[0.75rem] uppercase tracking-[0.1rem] text-on-surface-variant">
      {children}
    </legend>
  );
}

function LockedField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="group">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-outline">
        {label}
      </span>
      <div className="input-underline flex min-h-[42px] items-center text-sm text-on-surface">
        <span className={value ? 'text-on-surface' : 'text-outline-variant'}>{value || 'Select vehicle profile'}</span>
      </div>
      {helper && <p className="mt-2 text-[11px] text-on-surface-variant">{helper}</p>}
    </div>
  );
}

const VEHICLE_USES = ['Private', 'Commercial'];
const VEHICLE_CONDITIONS = ['Brand New', 'Used'];
const COVERAGE_TYPES = ['CTPL Only', 'Comprehensive'];
const INCLUDED_OPTIONS = ['Included', 'Not Included'];

type FieldName = keyof MotorVehicleInfo;
type CatalogueField = 'make' | 'model' | 'yearModel' | 'variant';

export default function MotorVehicleDetailsStep() {
  const { motorVehicleInfo, motorOcrData, setMotorVehicleInfo, nextStep } = useApplicationStore();
  const [form, setForm] = useState<MotorVehicleInfo>(motorVehicleInfo);

  const makeOptions = useMemo(() => getVehicleMakes(), []);
  const modelOptions = useMemo(() => getVehicleModels(form.make), [form.make]);
  const yearOptions = useMemo(() => getVehicleYears(form.make, form.model), [form.make, form.model]);
  const selectedYear = useMemo(() => {
    if (!form.yearModel) return null;
    const parsed = Number(form.yearModel);
    return Number.isFinite(parsed) ? parsed : null;
  }, [form.yearModel]);
  const variantOptions = useMemo(
    () => getVehicleVariants(form.make, form.model, selectedYear),
    [form.make, form.model, selectedYear],
  );
  const selectedEntry = useMemo(
    () => getVehicleEntry(form.make, form.model, form.yearModel, form.variant),
    [form.make, form.model, form.yearModel, form.variant],
  );

  useEffect(() => {
    setForm((current) => {
      if (!variantOptions.length) {
        if (!current.variant && !current.bodyType && !current.seatingCapacity) {
          return current;
        }
        return { ...current, variant: '', bodyType: '', seatingCapacity: '' };
      }

      if (variantOptions.length === 1) {
        const nextVariant = variantOptions[0];
        if (current.variant === nextVariant) return current;
        return { ...current, variant: nextVariant };
      }

      if (current.variant && !variantOptions.includes(current.variant)) {
        return { ...current, variant: '', bodyType: '', seatingCapacity: '' };
      }

      return current;
    });
  }, [variantOptions]);

  useEffect(() => {
    setForm((current) => {
      if (selectedEntry) {
        const nextBodyType = selectedEntry.bodyType;
        const nextSeating = String(selectedEntry.seatingCapacity);
        if (current.bodyType === nextBodyType && current.seatingCapacity === nextSeating) {
          return current;
        }
        return {
          ...current,
          bodyType: nextBodyType,
          seatingCapacity: nextSeating,
        };
      }

      if (current.bodyType || current.seatingCapacity) {
        return {
          ...current,
          bodyType: '',
          seatingCapacity: '',
        };
      }

      return current;
    });
  }, [selectedEntry]);

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCatalogueField = (field: CatalogueField, value: string) => {
    setForm((current) => {
      switch (field) {
        case 'make':
          return {
            ...current,
            make: value,
            model: '',
            yearModel: '',
            variant: '',
            bodyType: '',
            seatingCapacity: '',
          };
        case 'model':
          return {
            ...current,
            model: value,
            yearModel: '',
            variant: '',
            bodyType: '',
            seatingCapacity: '',
          };
        case 'yearModel':
          return {
            ...current,
            yearModel: value,
            variant: '',
            bodyType: '',
            seatingCapacity: '',
          };
        case 'variant':
          return {
            ...current,
            variant: value,
            bodyType: '',
            seatingCapacity: '',
          };
        default:
          return current;
      }
    });
  };

  const handleContinue = () => {
    if (!selectedEntry) return;
    setMotorVehicleInfo({
      ...form,
      variant: selectedEntry.variant,
      bodyType: selectedEntry.bodyType,
      seatingCapacity: String(selectedEntry.seatingCapacity),
    });
    nextStep();
  };

  const input = (
    field: FieldName,
    label: string,
    placeholder: string,
    options?: {
      type?: string;
      inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    },
  ) => (
    <div className="group">
      <UnderlineLabel htmlFor={field}>{label}</UnderlineLabel>
      <input
        id={field}
        className="input-underline"
        placeholder={placeholder}
        type={options?.type || 'text'}
        inputMode={options?.inputMode}
        value={form[field]}
        onChange={(event) => updateField(field, event.target.value)}
      />
    </div>
  );

  const select = (
    field: CatalogueField | FieldName,
    label: string,
    options: readonly string[],
    placeholder = 'Select option',
    disabled = false,
  ) => (
    <div className="group">
      <UnderlineLabel htmlFor={field}>{label}</UnderlineLabel>
      <select
        id={field}
        className="input-underline"
        value={form[field] as string}
        disabled={disabled}
        onChange={(event) =>
          field === 'make' || field === 'model' || field === 'yearModel' || field === 'variant'
            ? updateCatalogueField(field, event.target.value)
            : updateField(field, event.target.value)
        }
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const vehicleSelectionReady =
    Boolean(form.make) &&
    Boolean(form.model) &&
    Boolean(form.yearModel) &&
    (variantOptions.length <= 1 || Boolean(form.variant)) &&
    Boolean(selectedEntry);

  return (
    <form className="space-y-12">
      <section className="mb-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary">Vehicle Details</h1>
        <p className="text-sm text-on-surface-variant">
          Choose the vehicle from the catalogue. The body type and seating capacity lock automatically once the profile is resolved.
        </p>
      </section>

      {motorOcrData && (
        <section className="border border-outline-variant bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-on-surface">
                OCR-filled fields are ready for review.
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-outline">
                {motorOcrData.documentType.replace('_', ' ')} · {Math.round(motorOcrData.confidence * 100)}%
                confidence
              </p>
            </div>
          </div>
        </section>
      )}

      <fieldset>
        <SectionLegend>ASSURED DETAILS</SectionLegend>
        <div className="space-y-8">
          {input('fullName', 'Full Name', 'Juan Dela Cruz')}
          {input('address', 'Address', 'Unit 402, High-Street Tower')}
          <div className="grid grid-cols-2 gap-6">
            {input('phone', 'Phone Number', '+63 900 000 0000', { type: 'tel' })}
            {input('email', 'Email Address', 'juan.dc@example.com', { type: 'email' })}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <SectionLegend>VEHICLE INFORMATION</SectionLegend>
        <div className="space-y-8">
          {input('plateNumber', 'Plate Number', 'ABC 1234')}
          {input('mvFileNumber', 'MV File Number', '1301-00000012345')}

          <div className="grid grid-cols-2 gap-6">
            {select('make', 'Make', makeOptions, 'Select make')}
            {select('model', 'Model', modelOptions, 'Select model', !form.make)}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {select('yearModel', 'Year Model', yearOptions.map(String), 'Select year', !form.model)}
            {variantOptions.length > 1 ? (
              select('variant', 'Variant', variantOptions, 'Select variant', !form.yearModel)
            ) : (
              <LockedField
                label="Variant"
                value={form.variant || selectedEntry?.variant || '—'}
                helper={
                  form.yearModel
                    ? 'Variant is fixed for this catalogue entry.'
                    : 'Select make, model, and year first.'
                }
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <LockedField
              label="Body Type"
              value={form.bodyType || selectedEntry?.bodyType || ''}
              helper="Locked from the selected catalogue profile."
            />
            <LockedField
              label="Seating Capacity"
              value={form.seatingCapacity || (selectedEntry ? String(selectedEntry.seatingCapacity) : '')}
              helper="Locked from the selected catalogue profile."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {input('color', 'Color', 'White')}
            {select('vehicleUse', 'Vehicle Use', VEHICLE_USES)}
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-outline">
              Selected catalogue profile
            </p>
            {selectedEntry ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-semibold text-on-surface">
                  {formatVehicleCatalogLabel(selectedEntry)}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {selectedEntry.bodyType} · {selectedEntry.seatingCapacity} seats ·{' '}
                  {formatVehicleRatingClassLabel(selectedEntry.ratingClass)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-outline">
                  {selectedEntry.yearStart === selectedEntry.yearEnd
                    ? `${selectedEntry.yearStart}`
                    : `${selectedEntry.yearStart}-${selectedEntry.yearEnd}`}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-on-surface-variant">
                Choose a catalogue make, model, year, and variant to lock the vehicle profile.
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <SectionLegend>IDENTIFICATION NUMBERS</SectionLegend>
        <div className="space-y-8">
          {input('chassisNumber', 'Chassis Number', 'MR053HY...')}
          {input('engineNumber', 'Engine Number', '2NRX123456')}
          {input('conductionSticker', 'Conduction Sticker', 'A1B234')}
        </div>
      </fieldset>

      <fieldset>
        <SectionLegend>VALUATION</SectionLegend>
        <div className="space-y-8">
          {select('vehicleCondition', 'Vehicle Condition', VEHICLE_CONDITIONS)}
          <div className="group">
            <UnderlineLabel htmlFor="estimatedMarketValue">Estimated Market Value</UnderlineLabel>
            <input
              id="estimatedMarketValue"
              className="input-underline"
              placeholder="600000"
              type="text"
              value={form.estimatedMarketValue}
              onChange={(event) => updateField('estimatedMarketValue', event.target.value)}
            />
            <p className="mt-2 text-[11px] text-outline">
              Use the current fair market value or invoice value for brand-new vehicles.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <SectionLegend>COVERAGE</SectionLegend>
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            {input('effectiveDate', 'Effective Date', '', { type: 'date' })}
            {select('coverageType', 'Coverage Type', COVERAGE_TYPES)}
          </div>
          {select('actsOfNature', 'Acts of Nature / AOG', INCLUDED_OPTIONS)}
          {input('thirdPartyPropertyDamageLimit', 'Third Party Property Damage Limit', '100000')}
          {select('autoPersonalAccident', 'Auto Personal Accident', INCLUDED_OPTIONS)}
          {input('deductibleParticipation', 'Deductible / Participation', '3000')}
        </div>
      </fieldset>

      <div className="flex items-center justify-center gap-2 pt-8 pb-12">
        <svg
          className="h-4 w-4 text-outline"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className="text-[11px] font-medium uppercase tracking-wider text-outline-variant">
          Your information is encrypted and secure
        </p>
      </div>

      {!vehicleSelectionReady && (
        <p className="mx-auto -mt-4 max-w-sm text-center text-[11px] text-outline-variant">
          Complete the catalogue selection to unlock the quote step.
        </p>
      )}

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-100 bg-white px-6 pb-8 pt-4">
        <div className="mx-auto max-w-md">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!vehicleSelectionReady}
            className="w-full rounded-md bg-primary py-4 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
