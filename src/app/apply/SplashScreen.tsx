'use client';

export default function SplashScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface overflow-hidden">
      {/* Top 60% — centered content */}
      <main
        className="flex-grow flex flex-col items-center justify-center text-center px-6"
        style={{ height: '60vh' }}
      >
        {/* Shield icon in circle */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
              shield
            </span>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-on-surface mb-4">
          Bethel
        </h1>

        {/* Thin rule */}
        <div className="w-10 h-[1px] bg-[#E5E7EB] mb-4 mx-auto" />

        {/* Corporation name */}
        <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#9CA3AF] mb-12">
          General Insurance &amp; Surety Corporation
        </p>

        {/* CTA text */}
        <div className="space-y-1">
          <p className="text-[14px] text-[#374151]">Get your CGL coverage</p>
          <p className="text-[14px] font-semibold text-on-surface">in 3 minutes.</p>
        </div>
      </main>

      {/* Bottom 20% — pinned action */}
      <footer
        className="mt-auto px-6 pb-10 flex flex-col items-center justify-end"
        style={{ height: '20vh' }}
      >
        {/* Get Started button */}
        <button
          onClick={onGetStarted}
          className="w-full h-[52px] bg-primary text-white rounded-lg font-semibold text-base transition-all active:scale-[0.98] mb-[20px]"
        >
          Get Started
        </button>

        {/* Footer */}
        <div className="flex flex-col items-center justify-center w-full py-2 gap-2">
          <p className="text-[10px] tracking-widest uppercase text-[#c0c0c0] font-medium text-center">
            Bethel General Insurance &amp; Surety Corp. — Est. 1961
          </p>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] tracking-widest uppercase text-[#c0c0c0] opacity-80">
              Privacy Policy
            </span>
            <span className="w-1 h-1 bg-[#c0c0c0] rounded-full" />
            <span className="text-[10px] tracking-widest uppercase text-[#c0c0c0] opacity-80">
              Terms of Service
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
