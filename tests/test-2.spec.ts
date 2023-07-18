import { test, expect } from '@playwright/test';
import { customerLogin } from './test-1.spec'
// async function customerLogin({ page }) {
//   await page.getByRole('link', { name: 'Login' }).click();
//   await page.getByLabel('Username or email').fill('alice');
//   await page.getByLabel('Password').click();
//   await page.getByLabel('Password').fill('alice');
//   await page.getByLabel('Password').press('Enter');
// }

test('test shopping chart', async ({ page }) => {
  // go to customer page and login
  await page.goto('http://127.0.0.1:8080/');
  await customerLogin({page})

  // purchase 2 kinds of food and change number of items
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'New Order' }).click();
  await page.getByRole('link', { name: 'Coffee' }).click();
  await page.getByRole('link', { name: 'Latte' }).click();

  const rndLatte = Math.floor(Math.random() * 10 + 1)
  await page.getByRole('button', { name: '+' }).click({clickCount: rndLatte});
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'New Order' }).click();
  await page.getByRole('link', { name: 'Sandwich' }).click();
  
  await page.getByRole('link', { name: 'Turkey Sandwich' }).click();
  const rndSandwich = Math.floor(Math.random() * 10 + 1)
  await page.getByRole('button', { name: '+' }).click({clickCount: rndSandwich});
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await page.getByRole('link', { name: 'Shopping Cart' }).click();
  const firstItem = page.getByRole("table").locator('tbody tr:first-child')
  const lastItem = page.getByRole("table").locator('tbody tr:last-child')
  // const firstName = firstItem.getByLabel("Item Name")
  // await expect(firstItem.locator('td:nth-child(1)')).toContainText("Latte");

  // check items and total price in shoppingCart
  await expect(firstItem).toContainText("Latte");
  await expect(lastItem).toContainText("Turkey Sandwich");
  const expectedPrice = rndLatte * 10 + rndSandwich * 10
  const totalPrice = page.getByTitle("total price output")
  console.log(totalPrice)
  await expect(totalPrice).toContainText(expectedPrice.toString());
  await page.getByRole('button', { name: 'Submit Order' }).click();
});