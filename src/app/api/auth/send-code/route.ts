import { NextResponse } from 'next/server';
import { buildOtpEmailHtml } from '@/lib/email/otp-email';
import { resend, resendFrom } from '@/lib/email/resend';
import {
  OTP_CHALLENGE_COOKIE,
  OTP_TTL_MS,
  createOtpChallenge,
  parseOtpChallenge,
} from '@/lib/auth/otp';
import { normalizeEmail, normalizePhilippinePhone } from '@/lib/auth/tokens';
import { z } from 'zod';

const sendCodeSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().min(1, 'Enter your phone number'),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = sendCodeSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Check the form values and try again';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const phone = normalizePhilippinePhone(parsed.data.phone);

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const existingChallenge = await parseOtpChallenge(
    request.headers
      .get('cookie')
      ?.split(';')
      .map((pair) => pair.trim())
      .find((pair) => pair.startsWith(`${OTP_CHALLENGE_COOKIE}=`))
      ?.split('=')
      .slice(1)
      .join('='),
  );

  if (
    existingChallenge &&
    existingChallenge.email === email &&
    existingChallenge.phone === phone &&
    existingChallenge.resendAvailableAt > Date.now()
  ) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existingChallenge.resendAvailableAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'Please wait before requesting a new code', retryAfterSeconds },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    );
  }

  const challenge = await createOtpChallenge({ email, phone });
  const emailHtml = buildOtpEmailHtml({
    code: challenge.code,
    email,
    expiresMinutes: Math.max(1, Math.round(OTP_TTL_MS / 60000)),
  });

  if (resend) {
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: 'Your Bethel verification code',
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? 'Unable to send verification code' },
        { status: 400 },
      );
    }
  } else {
    console.info(`[auth] dev otp code for ${email}: ${challenge.code}`);
  }

  const response = NextResponse.json({
    ok: true,
    maskedEmail: challenge.maskedEmail,
    phone,
    expiresInSeconds: Math.max(1, Math.floor(OTP_TTL_MS / 1000)),
  });

  response.cookies.set({
    name: OTP_CHALLENGE_COOKIE,
    value: challenge.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.max(1, Math.floor(OTP_TTL_MS / 1000)),
  });

  if (process.env.NODE_ENV !== 'production' && !resend) {
    response.headers.set('x-bethel-dev-otp', challenge.code);
  }

  return response;
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
    },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    },
  );
}
