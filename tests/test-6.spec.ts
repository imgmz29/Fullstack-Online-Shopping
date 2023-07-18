import { test, Page } from '@playwright/test';
import {customerLogin, onePurchase, operatorLogin} from './test-1.spec'
import {commentItmes, checkComments} from './test-4.spec'

test.describe.configure({ mode: 'parallel' });

let page1: Page
let page2: Page

test.beforeAll(async ({ browser }) => {
  page1 = await browser.newPage()
  page2 = await browser.newPage()
  
});

test.afterAll(async () => {
  await page1.close();
  await page2.close();
});

async function purchase2Items({page}) {
  // purchase 2 kinds of food and change number of items
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'New Order' }).click()
  await page.getByRole('link', { name: 'Coffee' }).click()
  await page.getByRole('link', { name: 'Latte' }).click()

  const rndLatte = Math.floor(Math.random() * 10 + 1)
  await page.getByRole('button', { name: '+' }).click({clickCount: rndLatte})
  await page.getByRole('button', { name: 'Add to Cart' }).click()

  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'New Order' }).click()
  await page.getByRole('link', { name: 'Sandwich' }).click()
  
  await page.getByRole('link', { name: 'Turkey Sandwich' }).click()
  const rndSandwich = Math.floor(Math.random() * 10 + 1)
  await page.getByRole('button', { name: '+' }).click({clickCount: rndSandwich})
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await page.getByRole('link', { name: 'Shopping Cart' }).click()
  await page.getByRole('button', { name: 'Submit Order' }).click()
}

test('customer runs in parallel 1', async ({ page }) => { 
  // go to customer page and login
  await page.goto('http://127.0.0.1:8080/')
  await customerLogin({page})
  await purchase2Items({page})
  const expectedComment = 'Best Coffee in Durham'
  await commentItmes({page}, expectedComment)
  await checkComments({page}, expectedComment)
});
test('operator runs in parallel 2', async ({ page }) => { 
  // navigate to operator page and finish the order
  await page.goto('http://127.0.0.1:8080/operator');
  operatorLogin({page})
  const row = page.locator('tbody tr:last-child')
  const items = row.locator('td:nth-child(4)')
  console.log(items.innerText())
  row.getByRole('button', { name: 'Start Preparing' }).click()
  row.getByRole('button', { name: 'Done' }).click()
  /* ... */ });