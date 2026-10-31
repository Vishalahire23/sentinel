import { test, expect } from '@playwright/test';

test.describe('Sentinel Monitoring E2E Dashboard', () => {
  test('User authentication and dashboard workflow', async ({ page }) => {
    await page.goto('/');

    // Check if auth page loads
    const authTitle = page.locator('.auth-title');
    await expect(authTitle).toBeVisible();

    // Use Quick Demo Admin button
    const demoAdminBtn = page.getByRole('button', { name: 'Demo Admin' });
    if (await demoAdminBtn.isVisible()) {
      await demoAdminBtn.click();
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    // Verify main overview page loaded
    await expect(page.locator('.page-title')).toContainText('Market Telemetry Overview');

    // Check navigation to Monitors
    await page.locator('.nav-item').filter({ hasText: 'Monitors' }).click();
    await expect(page.locator('.page-title')).toContainText('Monitored Target Catalog');

    // Check navigation to Alerts
    await page.locator('.nav-item').filter({ hasText: 'Alerts' }).click();
    await expect(page.locator('.page-title')).toContainText('Price Drop & Policy Alerts');

    // Check navigation to Policies
    await page.locator('.nav-item').filter({ hasText: 'Policies' }).click();
    await expect(page.locator('.page-title')).toContainText('Autonomous Defense Policies');
  });
});
