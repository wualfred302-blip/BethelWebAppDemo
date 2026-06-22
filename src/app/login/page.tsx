'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalizePhilippinePhone } from '@/lib/auth/tokens';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone: normalizePhilippinePhone(phone),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        maskedEmail?: string;
        phone?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send code');
      }

      router.push(
        `/login/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&phone=${encodeURIComponent(
          normalizePhilippinePhone(phone),
        )}`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to send code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="flex flex-col items-center pt-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
          STEP 1 OF 2 · SIGN IN
        </p>
        <h1 className="mt-1 text-[30px] font-bold tracking-[-0.05em] text-primary">
          BETHEL
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-[420px] flex-1 items-start px-3 pb-8 pt-20 sm:px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-[18px] border border-[#d8ddee] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(56,72,136,0.08)] sm:px-5 sm:py-6"
        >
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-gold">
            Bethel General
          </p>
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.04em] text-primary sm:text-[26px]">
            Sign in to continue
          </h2>
          <p className="mt-2 max-w-[26ch] text-[14px] leading-6 text-on-surface-variant">
            A 6-digit code will be sent to your email. No password required.
          </p>

          <div className="mt-5 space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              filled={false}
              className="input-underline"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              filled={false}
              className="input-underline"
              required
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 h-12 w-full rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(56,72,136,0.16)] hover:bg-primary-container"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending code
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Send code
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="mt-5 border-t border-[#e5e7eb] pt-4">
            <p className="text-center text-[12px] leading-6 tracking-[0.01em] text-on-surface-variant">
              This code will be used for verification and
              <br />
              secure account access.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
