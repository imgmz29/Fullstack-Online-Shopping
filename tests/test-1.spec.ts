import { test, expect } from '@playwright/test';

export async function customerLogin({ page }) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username or email').fill('alice');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('alice');
  await page.getByLabel('Password').press('Enter');
}

export async function onePurchase({page}) {
  // purchase one item
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'New Order' }).click()
  await page.getByRole('link', { name: 'Coffee' }).click()
  await page.getByRole('link', { name: 'Latte' }).click()
  await page.getByRole('button', { name: '+' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await page.getByRole('link', { name: 'Shopping Cart' }).click()
  await page.getByRole('button', { name: 'Submit Order' }).click()
}

export async function operatorLogin({ page }) {
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username or email').fill('jim');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('jim');
  await page.getByLabel('Password').press('Enter');
  await page.getByRole('link', { name: 'Logout' }).click()
}

test('test one purchase', async ({ page }) => {

  // go to customer page and login
  await page.goto('http://127.0.0.1:8080/');
  await customerLogin({page})
  await onePurchase({page})
  
  // back to view orders page to check this order's status and items
  await page.goto('http://127.0.0.1:8080/vieworder');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'View Orders' }).click();
  const row = page.locator('tbody tr:last-child')
  const items = row.locator('td:nth-child(4)')
  console.log(items.innerText())
  await expect(items).toContainText("Latte");


});


