'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function SplashScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface overflow-hidden px-6">
      {/* ── Branding + Form — compact stack ─────────────── */}
      <div className="w-full max-w-sm text-center">
        {/* ── Logo Lockup ──────────────────────────────── */}
        <div className="flex flex-col items-center">
          {/* Shield — 30% bigger, lifted from title */}
          <div className="mb-[-14px]">
            <Image
              src="/bethel-shield.png"
              alt="Bethel General Insurance"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>
          {/* BETHEL — clips through shield sides */}
          <h1 className="-mt-1 text-center font-[family-name:var(--font-montserrat)] text-5xl font-black tracking-[-0.03em] text-primary leading-none">
            BETHEL
          </h1>
        </div>

        {/* Gold line below */}
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
          General Insurance
        </p>

        {/* ── Form fields ──────────────────────────────── */}
        <div className="mt-10 space-y-5 text-left">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-outline mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-underline w-full"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-outline mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="input-underline w-full"
            />
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────── */}
        <button
          type="button"
          onClick={onGetStarted}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold uppercase tracking-[0.04em] text-primary-foreground shadow-md transition active:scale-[0.98] hover:shadow-lg"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* ── Trust line ───────────────────────────────── */}
        <p className="mt-5 text-[10px] text-outline-variant text-center">
          Your information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
