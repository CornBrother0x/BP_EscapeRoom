import { expect, test } from '@playwright/test';

/**
 * End-to-end smoke test: prove the shipped bundle actually boots in a real
 * browser and reaches the playable EXPLORE state — WebGL initialises, the boot
 * sequence runs, the SYSTEM PROMPT accepts compliance, and nothing throws.
 *
 * This is the one assertion the unit/integration suite cannot make: that the
 * whole thing composes and runs in Chromium, not just that each pure module is
 * correct in isolation.
 */
test('boots to a playable state without uncaught errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto('/');

  const overlay = page.locator('#overlay');

  // If WebGL were missing, the app renders an ERROR window instead of the boot
  // gate — assert we got the real boot, not the fallback.
  await expect(overlay).toContainText('PRESS ANY KEY TO BOOT');

  // First gesture unlocks audio and starts the typing; the second skips it.
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  await page.keyboard.press('Enter');

  // The SYSTEM PROMPT dialog: its only live control is "I will comply".
  const comply = page.getByRole('button', { name: 'I will comply' });
  await expect(comply).toBeVisible({ timeout: 15_000 });
  await comply.click();

  // In EXPLORE the boot overlay is hidden and the WebGL canvas is live.
  await expect(overlay).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('#app canvas')).toBeVisible();

  expect(pageErrors, `uncaught page errors:\n${pageErrors.join('\n')}`).toEqual([]);
});
