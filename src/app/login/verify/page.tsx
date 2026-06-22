'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OtpInput from '../components/OtpInput';
import { maskEmail } from '@/lib/auth/tokens';

const RESEND_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasLoadedParams, setHasLoadedParams] = useState(false);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setEmail(searchParams.get('email') || '');
    setPhone(searchParams.get('phone') || '');
    setHasLoadedParams(true);

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedParams) {
      return;
    }

    if (!email) {
      router.replace('/login');
    }
  }, [email, hasLoadedParams, router]);

  const maskedEmail = useMemo(() => (email ? maskEmail(email) : 'your email address'), [email]);

  const formatTime = (totalSeconds: number) => {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as {
        error?: string;
        redirectTo?: string;
        attemptsLeft?: number;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to verify code');
      }

      router.replace(data.redirectTo || '/apply');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to verify code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setResendMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });

      const data = (await response.json()) as {
        error?: string;
        retryAfterSeconds?: number;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to resend code');
      }

      setSecondsLeft(RESEND_SECONDS);
      setCanResend(false);
      setResendMessage('New code sent.');
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Unable to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
          STEP 2 OF 2 · VERIFY
        </p>

        <div className="text-[15px] font-bold tracking-[-0.05em] text-primary">BETHEL</div>
      </header>

      <main className="mx-auto flex w-full max-w-[420px] flex-1 items-start px-3 pb-8 pt-28 sm:px-4 sm:pt-32">
        <form
          onSubmit={handleVerify}
          className="w-full rounded-[18px] border border-[#e0e3ec] bg-white px-4 py-5 shadow-[0_18px_40px_rgba(56,72,136,0.08)] sm:px-5 sm:py-6"
        >
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-gold">
            Bethel General
          </p>
          <h1 className="text-[23px] font-semibold leading-tight tracking-[-0.04em] text-primary sm:text-[25px]">
            Enter verification code
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-on-surface-variant">
            A 6-digit code has been sent to your email address ({maskedEmail}).
          </p>

          <div className="mt-5">
            <OtpInput value={code} onChange={setCode} disabled={isSubmitting} error={Boolean(error)} />
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-[13px] text-on-surface-variant">
              {canResend ? 'You can resend a new code now.' : `Resend code in ${formatTime(secondsLeft)}`}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="text-left text-[13px] font-semibold text-primary disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Change email
            </button>
          </div>

          {resendMessage && (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {resendMessage}
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || code.replace(/\D/g, '').length !== 6}
            className="mt-5 h-12 w-full rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(56,72,136,0.16)] hover:bg-primary-container"
          >
            {isSubmitting ? 'Verifying...' : 'Verify code'}
          </Button>

          <p className="mt-4 text-center text-[12px] leading-6 text-on-surface-variant">
            You are verifying the code for {maskedEmail}
          </p>
        </form>
      </main>
    </div>
  );
}
