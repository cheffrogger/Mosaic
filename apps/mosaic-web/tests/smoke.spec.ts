import { expect, test } from '@playwright/test';

test('complete 32x32 local flow works end-to-end', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-art.svg');

  await expect(page.getByText(/Generated 32×32 mosaic/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('img', { name: 'Selected source' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Selected source' })).toHaveAttribute('src', /^blob:/);
  await expect(page.getByText(/tiles required/i)).toBeVisible();

  const paletteDisclosure = page.locator('.palette-disclosure');
  await expect(paletteDisclosure.locator('.palette-grid')).not.toBeVisible();
  await paletteDisclosure.locator('summary').click();
  await expect(paletteDisclosure.locator('.palette-grid')).toBeVisible();

  await page.getByRole('button', { name: /save locally/i }).click();
  await expect(page.getByText(/saved locally in IndexedDB/i)).toBeVisible({ timeout: 15_000 });

  const savedProjectButton = page.getByRole('button', { name: /sample-art/i });
  await expect(savedProjectButton).toBeVisible();
  await savedProjectButton.click();
  await expect(page.getByText(/opened .* from local storage/i)).toBeVisible({ timeout: 15_000 });
});

test('mobile settings are stacked without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const controlsGrid = page.locator('.controls-grid').first();
  await expect(controlsGrid).toHaveCSS('display', 'grid');
  const mobileColumns = await controlsGrid.evaluate((element) => window.getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(mobileColumns).toBe(1);

  const documentWidth = await page.locator('body').evaluate((body) => body.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(390);

  await page.setViewportSize({ width: 820, height: 1180 });
  const tabletColumns = await controlsGrid.evaluate((element) => window.getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(tabletColumns).toBeGreaterThanOrEqual(2);

  await page.setViewportSize({ width: 320, height: 760 });
  const minimumWidth = await page.locator('body').evaluate((body) => body.scrollWidth);
  expect(minimumWidth).toBeLessThanOrEqual(320);
});

test('custom M2 settings generate a valid mosaic in the browser', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Grid width').fill('50');
  await page.getByLabel('Grid height').fill('50');
  await page.getByLabel('Section width').fill('10');
  await page.getByLabel('Section height').fill('10');
  await page.getByLabel('Color limit (K)').fill('1');
  await page.getByLabel('Mode').selectOption('pixel-art');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-art.svg');

  await expect(page.getByText(/Generated 50×50 mosaic/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/tiles required/i)).toBeVisible();
  await expect(page.getByText(/colors used/i)).toBeVisible();
});

test('image generation works without crypto.randomUUID', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'randomUUID', { configurable: true, value: undefined });
  });
  await page.goto('/');
  await page.setInputFiles('input[accept="image/*"]', 'tests/fixtures/sample-art.svg');

  await expect(page.getByText(/Generated 32×32 mosaic/i)).toBeVisible({ timeout: 30_000 });
});

test('a manually edited locked cell keeps its color after regeneration', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[accept="image/*"]', 'tests/fixtures/sample-art.svg');
  await expect(page.getByText(/Generated 32×32 mosaic/i)).toBeVisible({ timeout: 30_000 });

  const grid = page.getByRole('grid', { name: 'Mosaic grid' });
  await grid.click({ position: { x: 5, y: 5 } });
  const colorSelect = page.getByLabel('Selected cell color');
  const initialColor = await colorSelect.inputValue();
  const replacementColor = await colorSelect.locator('option').evaluateAll((options, currentColor) => (
    options.map((option) => (option as HTMLOptionElement).value).find((colorId) => colorId !== currentColor)
  ), initialColor);
  await colorSelect.selectOption(replacementColor!);
  const replacementName = await colorSelect.locator('option:checked').textContent();
  await page.getByRole('button', { name: 'Lock cell' }).click();
  await expect(page.locator('#selected-cell-description')).toContainText(/locked/i);
  await expect(page.locator('#selected-cell-description')).toContainText(replacementName!);

  await page.getByRole('button', { name: /refresh mosaic/i }).click();
  await expect(page.getByRole('button', { name: /refresh mosaic/i })).toBeEnabled({ timeout: 15_000 });
  await expect(colorSelect).toHaveValue(replacementColor!);
  await expect(page.getByRole('button', { name: 'Unlock cell' })).toBeVisible();

  await page.getByRole('button', { name: /save locally/i }).click();
  await expect(page.getByText(/saved locally in indexeddb/i)).toBeVisible({ timeout: 15_000 });
  await page.reload();
  const savedProject = page.getByRole('button', { name: /sample-art/i });
  await expect(savedProject).toBeVisible();
  await savedProject.click();
  await expect(colorSelect).toHaveValue(replacementColor!);
  await expect(page.getByRole('button', { name: 'Unlock cell' })).toBeVisible();
});

test('the selected mosaic cell moves with keyboard arrows', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[accept="image/*"]', 'tests/fixtures/sample-art.svg');
  await expect(page.getByText(/Generated 32×32 mosaic/i)).toBeVisible({ timeout: 30_000 });

  const grid = page.getByRole('grid', { name: 'Mosaic grid' });
  await grid.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#selected-cell-description')).toContainText('Cell 1, 2');
});

test.describe('touch cell editing', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('a tap selects and locks a cell', async ({ page }) => {
    await page.goto('/');
    await page.setInputFiles('input[accept="image/*"]', 'tests/fixtures/sample-art.svg');
    await expect(page.getByText(/Generated 32×32 mosaic/i)).toBeVisible({ timeout: 30_000 });

    const grid = page.getByRole('grid', { name: 'Mosaic grid' });
    const size = await grid.evaluate((canvas) => ({ width: canvas.clientWidth, height: canvas.clientHeight }));
    await grid.tap({ position: { x: size.width * 0.75, y: size.height * 0.75 } });
    await expect(page.locator('#selected-cell-description')).toContainText(/Cell (2[0-9]|3[01]), (2[0-9]|3[01])/);
    await page.getByRole('button', { name: 'Lock cell' }).tap();
    await expect(page.locator('#selected-cell-description')).toContainText(/locked/i);
  });
});
