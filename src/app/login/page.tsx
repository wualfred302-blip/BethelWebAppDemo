'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizePhilippinePhone } from '@/lib/auth/tokens';

function UnderlineField({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5f6473]">
        {label}
      </span>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full border-0 border-b border-[#cfd3df] bg-transparent px-0 py-3 text-[14px] leading-5 text-on-surface placeholder:text-[#9fa4b3] focus:border-primary focus:outline-none focus:ring-0"
      />
    </label>
  );
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: normalizedPhone,
        }),
      });

      const rawBody = await response.text();
      const data = rawBody
        ? (JSON.parse(rawBody) as {
            error?: string;
            maskedEmail?: string;
            phone?: string;
          })
        : {};

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
    <div className="min-h-screen bg-white text-on-surface">
      <header className="flex flex-col items-center pt-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
          STEP 1 OF 2 · SIGN IN
        </p>
        <h1 className="mt-2 text-[18px] font-bold tracking-[-0.04em] text-primary">
          BETHEL
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-[420px] flex-1 items-start px-3 pb-8 pt-20 sm:px-4 sm:pt-24">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-[16px] border border-[#d8ddec] bg-white px-4 py-4 shadow-[0_4px_20px_rgba(56,72,136,0.05)] sm:px-5 sm:py-5"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-gold">
            Bethel General
          </p>
          <h2 className="text-[23px] font-semibold leading-tight tracking-[-0.03em] text-primary sm:text-[25px]">
            Sign in to continue
          </h2>
          <p className="mt-2 max-w-[24ch] text-[14px] leading-6 text-on-surface-variant">
            A 6-digit code will be sent to your email. No password required.
          </p>

          <div className="mt-5 space-y-5">
            <UnderlineField
              id="login-email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              required
            />
            <UnderlineField
              id="login-phone"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={setPhone}
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
            className="mt-5 h-12 w-full rounded-[10px] bg-primary px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(56,72,136,0.12)] hover:bg-primary-container"
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
            <p className="mx-auto max-w-[18ch] text-center text-[12px] leading-6 tracking-[0.01em] text-on-surface-variant">
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
