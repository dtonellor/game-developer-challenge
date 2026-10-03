# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Pirate Battle — Menu & Options >> should reject options and return to menu via Cancel
- Location: e2e\game.spec.ts:36:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /pirate battle/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /pirate battle/i }) with timeout 15000ms
  - waiting for getByRole('heading', { name: /pirate battle/i })

```

```yaml
- text: "[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration. C:/Users/dtone/OneDrive/Área de Trabalho/jungle gaming/game-developer-challenge/src/index.css:undefined:null at mt (C:\\Users\\dtone\\OneDrive\\Área de Trabalho\\jungle gaming\\game-developer-challenge\\node_modules\\tailwindcss\\dist\\lib.js:38:1643) at LazyResult.runOnRoot (C:\\Users\\dtone\\OneDrive\\Área de Trabalho\\jungle gaming\\game-developer-challenge\\node_modules\\postcss\\lib\\lazy-result.js:367:16) at LazyResult.runAsync (C:\\Users\\dtone\\OneDrive\\Área de Trabalho\\jungle gaming\\game-developer-challenge\\node_modules\\postcss\\lib\\lazy-result.js:296:26) at async runPostCSS (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:30280:19) at async compilePostCSS (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:30264:6) at async compileCSS (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:30194:26) at async TransformPluginContext.handler (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:29665:47) at async EnvironmentPluginContainer.transform (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:8545:14) at async loadAndTransform (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:19988:26) at async viteTransformMiddleware (file:///C:/Users/dtone/OneDrive/%C3%81rea%20de%20Trabalho/jungle%20gaming/game-developer-challenge/node_modules/vite/dist/node/chunks/node.js:20207:20) Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | // Helper: navigate and wait for React app to render
  4   | async function waitForApp(page: Page) {
  5   |   await page.goto('/');
  6   |   // React renders immediately (MSW starts in background), so heading appears fast
> 7   |   await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible({ timeout: 15000 });
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  8   | }
  9   | 
  10  | test.describe('Pirate Battle — Menu & Options', () => {
  11  |   test('should load menu with title', async ({ page }) => {
  12  |     await waitForApp(page);
  13  |     await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  14  |     await expect(page.getByRole('button', { name: /play/i })).toBeVisible();
  15  |     await expect(page.getByRole('button', { name: /options/i })).toBeVisible();
  16  |     await expect(page.getByRole('button', { name: /ranking/i })).toBeVisible();
  17  |     await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
  18  |   });
  19  | 
  20  |   test('should navigate to options, change settings and save', async ({ page }) => {
  21  |     await waitForApp(page);
  22  | 
  23  |     await page.getByRole('button', { name: /options/i }).click();
  24  |     await expect(page.getByRole('heading', { name: /options/i })).toBeVisible();
  25  | 
  26  |     const sessionInput = page.locator('input[type="number"]').first();
  27  |     await sessionInput.fill('120');
  28  | 
  29  |     const spawnInput = page.locator('input[type="number"]').nth(1);
  30  |     await spawnInput.fill('1500');
  31  | 
  32  |     await page.getByRole('button', { name: /save/i }).click();
  33  |     await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  34  |   });
  35  | 
  36  |   test('should reject options and return to menu via Cancel', async ({ page }) => {
  37  |     await waitForApp(page);
  38  |     await page.getByRole('button', { name: /options/i }).click();
  39  |     await page.getByRole('button', { name: /cancel/i }).click();
  40  |     await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  41  |   });
  42  | });
  43  | 
  44  | test.describe('Pirate Battle — Ranking & History', () => {
  45  |   test('should open Ranking and return to menu', async ({ page }) => {
  46  |     await waitForApp(page);
  47  |     await page.getByRole('button', { name: /ranking/i }).click();
  48  |     await expect(page.getByRole('heading', { name: /top players/i })).toBeVisible();
  49  |     await page.getByRole('button', { name: /back to menu/i }).click();
  50  |     await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  51  |   });
  52  | 
  53  |   test('should open History and return to menu', async ({ page }) => {
  54  |     await waitForApp(page);
  55  |     await page.getByRole('button', { name: /history/i }).click();
  56  |     await expect(page.getByRole('heading', { name: /match history/i })).toBeVisible();
  57  |     await page.getByRole('button', { name: /back to menu/i }).click();
  58  |     await expect(page.getByRole('heading', { name: /pirate battle/i })).toBeVisible();
  59  |   });
  60  | });
  61  | 
  62  | test.describe('Pirate Battle — Gameplay', () => {
  63  |   test('should start the game and show HUD', async ({ page }) => {
  64  |     await waitForApp(page);
  65  |     await page.getByRole('button', { name: /play/i }).click();
  66  | 
  67  |     // Wait for game canvas and HUD
  68  |     await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
  69  |     await expect(page.locator('text=HP:')).toBeVisible({ timeout: 15000 });
  70  |     await expect(page.locator('text=Score:')).toBeVisible();
  71  |     await expect(page.locator('text=Time:')).toBeVisible();
  72  |   });
  73  | 
  74  |   test('should pause and resume with button', async ({ page }) => {
  75  |     await waitForApp(page);
  76  |     await page.getByRole('button', { name: /play/i }).click();
  77  |     await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
  78  |     await expect(page.locator('text=HP:')).toBeVisible({ timeout: 15000 });
  79  | 
  80  |     // Pause
  81  |     await page.getByRole('button', { name: /pause/i }).click();
  82  |     await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();
  83  | 
  84  |     // Resume
  85  |     await page.getByRole('button', { name: /resume game/i }).click();
  86  |     await expect(page.getByRole('heading', { name: /paused/i })).toBeHidden();
  87  |   });
  88  | 
  89  |   test('should pause automatically on window blur', async ({ page }) => {
  90  |     await waitForApp(page);
  91  |     await page.getByRole('button', { name: /play/i }).click();
  92  |     await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
  93  |     await expect(page.locator('text=HP:')).toBeVisible({ timeout: 15000 });
  94  | 
  95  |     // Simulate blur (tab switch)
  96  |     await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  97  |     await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();
  98  |   });
  99  | });
  100 | 
```