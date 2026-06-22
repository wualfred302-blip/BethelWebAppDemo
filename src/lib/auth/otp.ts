import {
  getAuthSecret,
  isValidPhilippinePhone,
  maskEmail,
  normalizeEmail,
  normalizePhilippinePhone,
  randomSixDigitCode,
  sha256Base64Url,
  signJsonToken,
  verifyJsonToken,
} from './tokens';

export const OTP_CHALLENGE_COOKIE = 'bethel_otp_challenge';
export const AUTH_SESSION_COOKIE = 'bethel_auth_session';
export const OTP_CODE_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const AUTH_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;

export const PHONE_VALIDATION_ERROR = 'Enter a valid Philippine mobile number';

export const phoneRegex = /^(?:\+63|0)9\d{9}$/;

export interface OtpChallengePayload {
  kind: 'otp-challenge';
  email: string;
  phone: string;
  nonce: string;
  codeHash: string;
  issuedAt: number;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
}

export interface AuthSessionPayload {
  kind: 'auth-session';
  email: string;
  phone: string;
  issuedAt: number;
  expiresAt: number;
}

export interface CreateOtpChallengeInput {
  email: string;
  phone: string;
}

export interface OtpSendResult {
  token: string;
  code: string;
  payload: OtpChallengePayload;
  maskedEmail: string;
  phone: string;
}

export function validateEmailAndPhone(input: { email: string; phone: string }) {
  const email = normalizeEmail(input.email);
  const phone = normalizePhilippinePhone(input.phone);

  if (!email) {
    throw new Error('Email address is required');
  }

  if (!email.includes('@')) {
    throw new Error('Enter a valid email address');
  }

  if (!isValidPhilippinePhone(phone)) {
    throw new Error(PHONE_VALIDATION_ERROR);
  }

  return {
    email,
    phone,
  };
}

export function generateOtpCode() {
  return randomSixDigitCode();
}

export async function createOtpChallenge(input: CreateOtpChallengeInput): Promise<OtpSendResult> {
  const { email, phone } = validateEmailAndPhone(input);
  const code = generateOtpCode();
  const nonce = crypto.randomUUID();
  const issuedAt = Date.now();
  const payload: OtpChallengePayload = {
    kind: 'otp-challenge',
    email,
    phone,
    nonce,
    codeHash: await sha256Base64Url(`${getAuthSecret()}:${nonce}:${code}`),
    issuedAt,
    expiresAt: issuedAt + OTP_TTL_MS,
    resendAvailableAt: issuedAt + OTP_RESEND_COOLDOWN_MS,
    attempts: 0,
  };

  return {
    token: await signJsonToken(payload),
    code,
    payload,
    maskedEmail: maskEmail(email),
    phone,
  };
}

export async function parseOtpChallenge(token: string | undefined) {
  if (!token) return null;
  const payload = await verifyJsonToken<OtpChallengePayload>(token);
  if (!payload || payload.kind !== 'otp-challenge') return null;
  return payload;
}

export async function verifyOtpCode(challenge: OtpChallengePayload, code: string) {
  const normalizedCode = code.replace(/\D/g, '').slice(0, OTP_CODE_LENGTH);
  if (normalizedCode.length !== OTP_CODE_LENGTH) {
    return false;
  }

  const candidateHash = await sha256Base64Url(`${getAuthSecret()}:${challenge.nonce}:${normalizedCode}`);
  return candidateHash === challenge.codeHash;
}

export async function touchOtpChallenge(challenge: OtpChallengePayload, attempts: number) {
  const nextPayload: OtpChallengePayload = {
    ...challenge,
    attempts,
  };
  return signJsonToken(nextPayload);
}

export async function createAuthSession(input: { email: string; phone: string }) {
  const { email, phone } = validateEmailAndPhone(input);
  const issuedAt = Date.now();
  const payload: AuthSessionPayload = {
    kind: 'auth-session',
    email,
    phone,
    issuedAt,
    expiresAt: issuedAt + AUTH_SESSION_TTL_MS,
  };

  return {
    token: await signJsonToken(payload),
    payload,
  };
}

export async function parseAuthSession(token: string | undefined) {
  if (!token) return null;
  const payload = await verifyJsonToken<AuthSessionPayload>(token);
  if (!payload || payload.kind !== 'auth-session') return null;
  if (payload.expiresAt <= Date.now()) return null;
  return payload;
}
