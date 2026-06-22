import { expect, type Page } from '@playwright/test';

const DEFAULT_EMAIL = 'e2e.alfred@example.com';
const DEFAULT_PHONE = '09171234567';

function extractCookieValue(header: string | undefined, cookieName: string) {
  if (!header) return '';

  const match = header.match(new RegExp(`${cookieName}=([^;]+)`));
  return match?.[1] ?? '';
}

export async function signInWithOtp(
  page: Page,
  options?: {
    email?: string;
    phone?: string;
  },
) {
  const email = options?.email ?? DEFAULT_EMAIL;
  const phone = options?.phone ?? DEFAULT_PHONE;

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'BETHEL' })).toBeVisible();

  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByLabel('Phone Number', { exact: true }).fill(phone);

  const sendCodeResponse = await page.request.post('/api/auth/send-code', {
    headers: {
      'content-type': 'application/json',
    },
    data: { email, phone },
  });
  expect(sendCodeResponse.ok()).toBeTruthy();

  const devOtp = sendCodeResponse.headers()['x-bethel-dev-otp'];
  expect(devOtp, 'dev OTP header should be present when running against next dev').toHaveLength(6);
  const challengeCookie = extractCookieValue(sendCodeResponse.headers()['set-cookie'], 'bethel_otp_challenge');
  expect(challengeCookie, 'challenge cookie should be present').toBeTruthy();

  await page.goto(`/login/verify?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`, {
    waitUntil: 'commit',
  });
  await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible();
  const otpInputs = page.locator('main input');
  await expect(otpInputs).toHaveCount(6);

  for (let index = 0; index < 6; index += 1) {
    await otpInputs.nth(index).fill(devOtp[index] ?? '');
  }

  const verifyResponse = await page.request.post('/api/auth/verify-code', {
    headers: {
      'content-type': 'application/json',
      cookie: `bethel_otp_challenge=${challengeCookie}`,
    },
    data: { code: devOtp },
  });
  expect(verifyResponse.ok()).toBeTruthy();

  const sessionCookie = extractCookieValue(verifyResponse.headers()['set-cookie'], 'bethel_auth_session');
  expect(sessionCookie, 'session cookie should be present').toBeTruthy();
  await page.context().addCookies([
    {
      name: 'bethel_auth_session',
      value: sessionCookie,
      url: process.env.E2E_BASE_URL ?? 'http://localhost:3001',
    },
  ]);

  await page.goto('/apply', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
}
