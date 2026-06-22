const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }

  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64UrlToBytes(value: string) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64url'));
  }

  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function getAuthSecret() {
  const secret = process.env.BETHEL_AUTH_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing BETHEL_AUTH_SECRET');
  }

  return 'bethel-dev-auth-secret';
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signJsonToken<T extends object>(payload: T, secret = getAuthSecret()) {
  const key = await importSigningKey(secret);
  const serialized = encoder.encode(JSON.stringify(payload));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, serialized));
  return `${bytesToBase64Url(serialized)}.${bytesToBase64Url(signature)}`;
}

export async function verifyJsonToken<T>(token: string, secret = getAuthSecret()): Promise<T | null> {
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return null;

  try {
    const payloadBytes = base64UrlToBytes(payloadPart);
    const signatureBytes = base64UrlToBytes(signaturePart);
    const key = await importSigningKey(secret);
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes);
    if (!valid) return null;

    return JSON.parse(decoder.decode(payloadBytes)) as T;
  } catch {
    return null;
  }
}

export async function sha256Base64Url(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return bytesToBase64Url(new Uint8Array(digest));
}

export function randomSixDigitCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String((bytes[0] % 900000) + 100000);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePhilippinePhone(phone: string) {
  const cleaned = phone.trim().replace(/[\s()-]/g, '');
  if (/^09\d{9}$/.test(cleaned)) return `+63${cleaned.slice(1)}`;
  if (/^\+639\d{9}$/.test(cleaned)) return cleaned;
  if (/^639\d{9}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
}

export function isValidPhilippinePhone(phone: string) {
  return /^(?:\+63|0)9\d{9}$/.test(phone.trim().replace(/[\s()-]/g, ''));
}

export function maskEmail(email: string) {
  const trimmed = email.trim();
  const [local, domain] = trimmed.split('@');
  if (!local || !domain) return trimmed;

  if (local.length <= 2) {
    return `${local[0] ?? '*'}***@${domain}`;
  }

  return `${local[0]}***${local.at(-1)}@${domain}`;
}
