import { test, expect } from '@playwright/test';
import {customerLogin, onePurchase} from './test-1.spec'

async function applyCode({page}) {
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'Get Promotion Code' }).click()
  await page.getByAltText('club suit').first().click()
}
async function useCodePurchase({page}) {
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'New Order' }).click()
  await page.getByRole('link', { name: 'Coffee' }).click()
  await page.getByRole('link', { name: 'Latte' }).click()
  await page.getByRole('button', { name: '+' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await page.getByRole('link', { name: 'Shopping Cart' }).click()
  await expect(page.getByAltText('coupon')).toBeVisible()
  await page.getByAltText('coupon').first().click()
  const totalPrice = page.getByTitle("total price output")
  await expect(totalPrice).toContainText('5');
  await page.getByRole('button', { name: 'Submit Order' }).click()
}
test('test promotion code', async ({ page }) => {
  // go to customer page and login
  await page.goto('http://127.0.0.1:8080/');
  await customerLogin({page})
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'View Orders' }).click();
  

  // purchase 5 orders
  // await onePurchase({page})
  // await onePurchase({page})
  // await onePurchase({page})
  // await onePurchase({page})
  // await onePurchase({page}) 
  // // get a promotion code
  await applyCode({page})
  await useCodePurchase({page})
  //another purchase
  
});