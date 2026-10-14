import { expect, test } from '@playwright/test';

test('complete 32x32 local flow works end-to-end', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-art.svg');

  await expect(page.getByText(/Generated 32×32 mosaic/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/tiles required/i)).toBeVisible();

  await page.getByRole('button', { name: /save locally/i }).click();
  await expect(page.getByText(/saved locally in IndexedDB/i)).toBeVisible({ timeout: 15_000 });

  const savedProjectButton = page.getByRole('button', { name: /sample-art/i });
  await expect(savedProjectButton).toBeVisible();
  await savedProjectButton.click();
  await expect(page.getByText(/opened .* from local storage/i)).toBeVisible({ timeout: 15_000 });
});
