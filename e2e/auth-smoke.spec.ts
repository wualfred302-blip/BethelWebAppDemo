import { test } from '@playwright/test';
import { signInWithOtp } from './helpers/auth';

test('email otp login reaches apply', async ({ page }) => {
  await signInWithOtp(page);
});
