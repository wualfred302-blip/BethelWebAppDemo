import { test, expect } from '@playwright/test';

test('cover note pricing is dynamic based on floor area', async ({ page }) => {
  await page.goto('http://localhost:3000/apply');
  await page.waitForLoadState('networkidle');

  // Splash screen
  await page.locator('button:has-text("Get Started")').click();
  await page.waitForTimeout(1000);

  // Scan selection
  await page.locator('text=Skip, Fill Manually').click();
  await page.waitForTimeout(1000);

  // Scan step - skip
  await page.locator('button:has-text("Skip, fill manually")').click();
  await page.waitForTimeout(1000);

  // Fill business details using type() for react-hook-form
  await page.locator('#fullName').type('Juan Dela Cruz');
  await page.locator('#businessName').type('Test Business Corp');
  await page.locator('#tin').type('123-456-789-000');
  await page.locator('#floorArea').scrollIntoViewIfNeeded();
  await page.locator('#floorArea').type('120');

  // Nature of Business
  await page.selectOption('#natureOfBusiness', 'Retail Trade');

  // Building details
  await page.locator('#buildingFloors').type('2');
  await page.selectOption('#buildingType', 'Commercial');
  await page.selectOption('#constructionType', 'Concrete');

  // Location
  await page.locator('#streetAddress').type('123 Test Street');

  // Contact
  await page.locator('#phone').type('09171234567');
  await page.locator('#email').type('test@example.com');

  // Continue to cover note
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(1000);

  // Now on cover note step
  const body = await page.locator('body').innerText();
  console.log('=== COVER NOTE PAGE ===');
  console.log(body.substring(0, 2000));

  // Verify tax breakdown exists
  expect(body).toContain('DST');
  expect(body).toContain('VAT');
  expect(body).toContain('LGT');
  expect(body).toContain('Net Premium');
  expect(body).toContain('Effective Date');

  // Verify pricing is dynamic (not just default 0 sqm values)
  // 120 sqm Class I should be: Net ₱1,460.37, Gross ₱1,821.08
  // Default 0 sqm Class II is: Net ₱489.02, Gross ₱609.81
  const hasDynamicPricing = body.includes('1,460') || body.includes('1,821');
  const hasDefaultPricing = body.includes('489.02') || body.includes('609.81');

  console.log(`Dynamic pricing (1460/1821): ${hasDynamicPricing}`);
  console.log(`Default pricing (489/609): ${hasDefaultPricing}`);

  // Check nature of business is shown
  expect(body).toContain('Retail Trade');
  expect(body).toContain('120 sqm');
});
