'use client';

import { type FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizePhilippinePhone } from '@/lib/auth/tokens';

async function readJsonSafely(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as { error?: string };
  } catch {
    return {};
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = normalizePhilippinePhone(phone);
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, phone: normalizedPhone }),
      });

      const data = (await readJsonSafely(response)) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || `Unable to send code (${response.status})`);
      }

      router.push(
        `/login/verify?email=${encodeURIComponent(normalizedEmail)}&phone=${encodeURIComponent(normalizedPhone)}`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to send code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface text-on-surface px-6">
      {/* ── Compact Stack ────────────────────────────────── */}
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
              priority
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

        {/* ── Form ──────────────────────────────────────── */}
        <form className="mt-10 space-y-5 text-left" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login-email"
              className="block text-[10px] font-bold uppercase tracking-[0.1em] text-outline mb-1"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="input-underline w-full"
            />
          </div>

          <div>
            <label
              htmlFor="login-phone"
              className="block text-[10px] font-bold uppercase tracking-[0.1em] text-outline mb-1"
            >
              Phone Number
            </label>
            <input
              id="login-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="input-underline w-full"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold uppercase tracking-[0.04em] text-primary-foreground shadow-md transition active:scale-[0.98] hover:shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Sending code
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ── Trust line ────────────────────────────────── */}
        <p className="mt-6 text-[10px] text-outline-variant text-center">
          Your information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
