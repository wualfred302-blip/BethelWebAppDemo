import { NextResponse } from 'next/server';
import {
  AUTH_SESSION_COOKIE,
  MAX_OTP_ATTEMPTS,
  OTP_CHALLENGE_COOKIE,
  createAuthSession,
  parseOtpChallenge,
  touchOtpChallenge,
  verifyOtpCode,
} from '@/lib/auth/otp';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  code: z.string().trim().min(6, 'Enter the 6-digit code').max(6, 'Enter the 6-digit code'),
});

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;
  const part = cookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : undefined;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter the 6-digit code' }, { status: 400 });
  }

  const challengeToken = getCookieValue(request.headers.get('cookie'), OTP_CHALLENGE_COOKIE);
  const challenge = await parseOtpChallenge(challengeToken);

  if (!challenge) {
    return NextResponse.json({ error: 'Verification session expired. Please request a new code.' }, { status: 401 });
  }

  if (challenge.expiresAt <= Date.now()) {
    const response = NextResponse.json(
      { error: 'Verification code expired. Please request a new code.' },
      { status: 410 },
    );
    response.cookies.delete(OTP_CHALLENGE_COOKIE);
    return response;
  }

  const matches = await verifyOtpCode(challenge, parsed.data.code);
  if (!matches) {
    const attempts = challenge.attempts + 1;
    const response = NextResponse.json(
      {
        error: attempts >= MAX_OTP_ATTEMPTS
          ? 'Too many attempts. Please request a new code.'
          : 'The code you entered is incorrect.',
        attemptsLeft: Math.max(0, MAX_OTP_ATTEMPTS - attempts),
      },
      { status: attempts >= MAX_OTP_ATTEMPTS ? 429 : 400 },
    );

    if (attempts >= MAX_OTP_ATTEMPTS) {
      response.cookies.delete(OTP_CHALLENGE_COOKIE);
    } else {
      response.cookies.set({
        name: OTP_CHALLENGE_COOKIE,
        value: await touchOtpChallenge(challenge, attempts),
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: Math.max(1, Math.floor((challenge.expiresAt - Date.now()) / 1000)),
      });
    }

    return response;
  }

  const session = await createAuthSession({
    email: challenge.email,
    phone: challenge.phone,
  });

  const response = NextResponse.json({
    ok: true,
    redirectTo: '/apply',
  });

  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: session.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.max(1, Math.floor((session.payload.expiresAt - Date.now()) / 1000)),
  });
  response.cookies.delete(OTP_CHALLENGE_COOKIE);

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
