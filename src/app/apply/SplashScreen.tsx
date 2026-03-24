'use client';

import Image from 'next/image';

export default function SplashScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1a1a2e] overflow-hidden">
      {/* Top — logo + descriptions grouped together */}
      <main className="flex flex-col items-center text-center px-6 pt-[18vh]">
        {/* Bethel shield logo */}
        <Image
          src="/bethel-shield.png"
          alt="Bethel General Insurance and Surety Corporation"
          width={300}
          height={300}
          priority
        />

        {/* Brand name — slightly spaced from logo */}
        <h1 className="text-[28px] font-bold tracking-[-0.04em] mt-1 mb-1" style={{ color: '#4868a8' }}>
          Bethel
        </h1>

        {/* Thin rule */}
        <div className="w-10 h-[1px] mb-1 mx-auto" style={{ backgroundColor: '#5868a8' }} />

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
          className="w-full h-[40px] bg-[#384888] text-white text-[13px] font-medium rounded transition-colors hover:bg-[#2d3a6d]"
        >
          Get Started
        </button>
      </footer>
    </div>
  );
}
