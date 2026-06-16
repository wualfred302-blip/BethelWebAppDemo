'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApplicationStore, type MotorVehicleInfo } from '@/store/useApplicationStore';

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

function SectionLegend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="font-bold text-[0.75rem] tracking-[0.1rem] uppercase text-on-surface-variant mb-6">
      {children}
    </legend>
  );
}

const BODY_TYPES = ['Sedan', 'SUV', 'Van', 'Pickup', 'Hatchback'];
const VEHICLE_USES = ['Private', 'Commercial'];
const VEHICLE_CONDITIONS = ['Brand New', 'Used'];
const COVERAGE_TYPES = ['CTPL Only', 'Comprehensive'];
const INCLUDED_OPTIONS = ['Included', 'Not Included'];

type FieldName = keyof MotorVehicleInfo;

export default function MotorVehicleDetailsStep() {
  const { motorVehicleInfo, setMotorVehicleInfo, nextStep } = useApplicationStore();
  const [form, setForm] = useState<MotorVehicleInfo>(motorVehicleInfo);

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleContinue = () => {
    setMotorVehicleInfo(form);
    nextStep();
  };

  const input = (field: FieldName, label: string, placeholder: string, type = 'text') => (
    <div className="group">
      <UnderlineLabel htmlFor={field}>{label}</UnderlineLabel>
      <input
        id={field}
        className="input-underline"
        placeholder={placeholder}
        type={type}
        value={form[field]}
        onChange={(event) => updateField(field, event.target.value)}
      />
    </div>
  );

  const select = (field: FieldName, label: string, options: readonly string[]) => (
    <div className="group">
      <UnderlineLabel htmlFor={field}>{label}</UnderlineLabel>
      <select
        id={field}
        className="input-underline"
        value={form[field]}
        onChange={(event) => updateField(field, event.target.value)}
      >
        <option disabled value="">
          Select option
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form className="space-y-12">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Vehicle Details</h1>
        <p className="text-sm text-on-surface-variant">
          Please provide the vehicle and coverage details for the motor car policy.
        </p>
      </section>

      <fieldset>
        <SectionLegend>ASSURED DETAILS</SectionLegend>
        <div className="space-y-8">
          {input('fullName', 'Full Name', 'Juan Dela Cruz')}
          {input('address', 'Address', 'Unit 402, High-Street Tower')}
          <div className="grid grid-cols-2 gap-6">
            {input('phone', 'Phone Number', '+63 900 000 0000', 'tel')}
            {input('email', 'Email Address', 'juan.dc@example.com', 'email')}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <SectionLegend>VEHICLE INFORMATION</SectionLegend>
        <div className="space-y-8">
          {input('plateNumber', 'Plate Number', 'ABC 1234')}
          {input('mvFileNumber', 'MV File Number', '1301-00000012345')}
          <div className="grid grid-cols-2 gap-6">
            {input('make', 'Make', 'Toyota')}
            {input('model', 'Model', 'Vios')}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {input('yearModel', 'Year Model', '2022')}
            {select('bodyType', 'Body Type', BODY_TYPES)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {input('color', 'Color', 'White')}
            {input('seatingCapacity', 'Seating Capacity', '5')}
          </div>
          {select('vehicleUse', 'Vehicle Use', VEHICLE_USES)}
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
            <p className="text-[11px] text-outline mt-2">
              Use the current fair market value or invoice value for brand-new vehicles.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <SectionLegend>COVERAGE</SectionLegend>
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            {input('effectiveDate', 'Effective Date', '', 'date')}
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

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 pt-4 pb-8 z-50">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            onClick={handleContinue}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-md"
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
