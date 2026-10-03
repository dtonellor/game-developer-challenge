import { test, expect, Page } from '@playwright/test';

// Helper: navigate and wait for React app to render
async function waitForApp(page: Page) {
  await page.goto('/');
  // React renders immediately (MSW starts in background), so heading appears fast
  await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible({ timeout: 15000 });
}

test.describe('Pirate Battle — Menu & Options', () => {
  test('should load menu with title', async ({ page }) => {
    await waitForApp(page);
    await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /options/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ranking/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
  });

  test('should navigate to options, change settings and save', async ({ page }) => {
    await waitForApp(page);

    await page.getByRole('button', { name: /options/i }).click();
    await expect(page.getByRole('heading', { name: /options/i })).toBeVisible();

    const sessionInput = page.locator('input[type="number"]').first();
    await sessionInput.fill('120');

    const spawnInput = page.locator('input[type="number"]').nth(1);
    await spawnInput.fill('1500');

    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  });

  test('should reject options and return to menu via Cancel', async ({ page }) => {
    await waitForApp(page);
    await page.getByRole('button', { name: /options/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  });
});

test.describe('Pirate Battle — Ranking & History', () => {
  test('should open Ranking and return to menu', async ({ page }) => {
    await waitForApp(page);
    await page.getByRole('button', { name: /ranking/i }).click();
    await expect(page.getByRole('heading', { name: /top players/i })).toBeVisible();
    await page.getByRole('button', { name: /back to menu/i }).click();
    await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  });

  test('should open History and return to menu', async ({ page }) => {
    await waitForApp(page);
    await page.getByRole('button', { name: /history/i }).click();
    await expect(page.getByRole('heading', { name: /match history/i })).toBeVisible();
    await page.getByRole('button', { name: /back to menu/i }).click();
    await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  });
});

test.describe('Pirate Battle — Gameplay', () => {
  test('should start the game and show HUD', async ({ page }) => {
    await waitForApp(page);
    await page.getByRole('button', { name: /play/i }).click();

    // Wait for game canvas and HUD
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=HP:')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Score:')).toBeVisible();
    await expect(page.locator('text=Time:')).toBeVisible();
  });

  test('should pause and resume with button', async ({ page }) => {
    await waitForApp(page);
    await page.getByRole('button', { name: /play/i }).click();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=HP:')).toBeVisible({ timeout: 15000 });

    // Pause
    await page.getByRole('button', { name: /pause/i }).click();
    await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();

    // Resume
    await page.getByRole('button', { name: /resume game/i }).click();
    await expect(page.getByRole('heading', { name: /paused/i })).toBeHidden();
  });

  test('should pause automatically on window blur', async ({ page }) => {
    await waitForApp(page);
    await page.getByRole('button', { name: /play/i }).click();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=HP:')).toBeVisible({ timeout: 15000 });

    // Simulate blur (tab switch)
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();
  });
});
