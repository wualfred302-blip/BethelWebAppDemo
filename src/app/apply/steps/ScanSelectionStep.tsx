'use client';

import { useApplicationStore } from '@/store/useApplicationStore';

interface ScanSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

type ScanType = 'permit' | 'policy' | 'manual' | null;

const SCAN_OPTIONS: { type: ScanType; icon: string; title: string; subtitle: string }[] = [
  {
    type: 'permit',
    icon: '📷',
    title: 'Scan Business Permit',
    subtitle: 'New CGL Application',
  },
  {
    type: 'policy',
    icon: '📄',
    title: 'Scan Existing Policy',
    subtitle: 'Renewal / Transfer',
  },
  {
    type: 'manual',
    icon: '⏭️',
    title: 'Skip, Fill Manually',
    subtitle: 'No documents available',
  },
];

export default function ScanSelectionStep({ onNext }: ScanSelectionStepProps) {
  const { setScanType } = useApplicationStore();

  const handleSelect = (type: ScanType) => {
    setScanType(type);
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold" style={{ color: '#4868a8' }}>
          What would you like to do?
        </h2>
        <p className="text-sm text-zinc-500">
          Choose how you&apos;d like to proceed
        </p>
      </div>

      <div className="space-y-3">
        {SCAN_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelect(option.type)}
            className="w-full bg-white border border-zinc-200 rounded-lg p-4 flex items-center gap-4 transition-all hover:border-[#384888] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#384888]/20"
          >
            <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-2xl">
              {option.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-base text-[#1a1a2e]">
                {option.title}
              </div>
              <div className="text-[13px] text-zinc-500">
                {option.subtitle}
              </div>
            </div>
            <div className="text-zinc-300">
              <ChevronRight />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6" />
      <path d="m18 12-6 6-6 6" />
    </svg>
  );
}