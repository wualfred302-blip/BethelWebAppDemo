'use client';

import { useApplicationStore } from '@/store/useApplicationStore';
import { Building2, Car, FileText, ChevronRight } from 'lucide-react';
import type { ScanType } from '@/store/useApplicationStore';

const SCAN_OPTIONS: {
  type: ScanType;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}[] = [
  {
    type: 'vehicle',
    icon: <Car className="w-5 h-5" />,
    title: 'Insure a Vehicle',
    subtitle: 'Motor car insurance for private vehicles',
  },
  {
    type: 'permit',
    icon: <Building2 className="w-5 h-5" />,
    title: 'Insure a Business Property',
    subtitle: 'CGL/property cover for business premises',
  },
  {
    type: 'policy',
    icon: <FileText className="w-5 h-5" />,
    title: 'Renew an Existing Policy',
    subtitle: 'Scan your current policy to continue',
  },
];

export default function ScanSelectionStep() {
  const { setScanType, nextStep } = useApplicationStore();

  const handleSelect = (type: ScanType) => {
    setScanType(type);
    nextStep();
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Title — matches Stitch form h1 */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
          What would you like to do?
        </h1>
        <p className="text-sm text-outline">
          Choose the insurance journey you&apos;d like to start
        </p>
      </section>

      {/* Options — fieldset/legend pattern matching Stitch form */}
      <fieldset>
        <legend className="font-bold text-[0.75rem] tracking-[0.1rem] uppercase text-outline mb-6">
          SELECT INSURANCE TYPE
        </legend>

        <div className="space-y-0">
          {SCAN_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className="group w-full flex items-center gap-4 py-5 border-b border-outline-variant transition-colors hover:border-primary focus:outline-none focus:border-primary text-left"
            >
              {/* Icon */}
              <div className="text-outline group-hover:text-primary transition-colors">
                {option.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="font-semibold text-base text-on-surface">
                  {option.title}
                </div>
                <div className="text-[13px] text-outline">
                  {option.subtitle}
                </div>
              </div>

              {/* Chevron */}
              <div className="text-outline-variant group-hover:text-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
