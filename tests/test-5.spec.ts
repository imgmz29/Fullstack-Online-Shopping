import { test, expect } from '@playwright/test';

test('test operator working on last order', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username or email').fill('jim');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('123');
  await page.getByLabel('Password').press('Enter');
  await page.getByRole('link', { name: 'My Work Screen' }).click();
  const row = page.locator('tbody tr:last-child')
  const items = row.locator('td:nth-child(4)')
  await expect(items).toContainText("Turkey Sandwich")
  // operator working on this order
  const startButton = row.getByRole('button', { name: /Start Preparing/ })
  await startButton.click()
  
  const doneButton = row.getByRole('button', { name: /Done/ })
  await doneButton.click()
  const operator = row.locator('td:nth-child(5)')
  await expect(operator).toContainText("jim")
});