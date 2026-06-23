'use client';

import { type FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizePhilippinePhone } from '@/lib/auth/tokens';

function BottomBorderField({
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
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#747781]">
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
        className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 text-[14px] leading-5 text-on-surface placeholder:text-outline focus:border-[#4868a8] focus:outline-none focus:ring-0"
      />
    </label>
  );
}

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: normalizedPhone,
        }),
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
    <div className="min-h-screen bg-background p-4 text-on-surface md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-between md:min-h-[calc(100vh-3rem)]">
        <header className="flex flex-col items-center justify-center pt-10 text-center md:pt-14">
          <Image
            src="/bethel-shield.png"
            alt="Bethel Logo"
            width={80}
            height={80}
            className="mb-4 h-20 w-20 object-contain"
            priority
          />
          <h1 className="text-[32px] font-black leading-tight tracking-[-0.02em] text-[#4868a8]">
            Bethel Account
          </h1>
          <p className="mt-2 text-[16px] font-light leading-6 text-on-surface-variant">
            A simpler way to stay protected.
          </p>
        </header>

        <main className="w-full pb-6 md:pb-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <BottomBorderField
              id="login-email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              required
            />

            <BottomBorderField
              id="login-phone"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={setPhone}
              required
            />

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4868a8] px-5 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(56,72,136,0.12)] hover:bg-primary-container"
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
        </main>
      </div>
    </div>
  );
}
