'use client';

export default function SplashScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1a1a2e] overflow-hidden">
      {/* Top — logo + descriptions grouped together */}
      <main className="flex flex-col items-center text-center px-6 pt-[28vh]">
        {/* Bethel shield logo */}
        <img
          src="/bethel-shield.png"
          alt="Bethel General Insurance and Surety Corporation"
          width={196}
          height={196}
        />

        {/* Brand name — slightly spaced from logo */}
        <h1 className="text-[28px] font-bold tracking-[-0.04em] -mt-10 mb-1" style={{ color: '#4868a8' }}>
          Bethel
        </h1>

        {/* Corporation name — gold */}
        <p
          className="text-[11px] font-medium tracking-[0.1em] uppercase mb-3"
          style={{ color: '#b89858' }}
        >
          General Insurance &amp; Surety Corporation
        </p>

        {/* Tagline — navy */}
        <p
          className="text-[16px] font-medium leading-relaxed"
          style={{ color: '#384888' }}
        >
          We provide the insurance<br />that works for you.
        </p>
      </main>

      {/* Bottom — pinned action */}
      <footer className="mt-auto px-6 pb-10">
        <button
          onClick={onGetStarted}
          style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          className="w-full h-[40px] bg-[#384888] text-white text-[13px] font-medium rounded transition-colors active:bg-[#2d3a6d]"
        >
          Get Started
        </button>
      </footer>
    </div>
  );
}
