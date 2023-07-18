import { test, expect } from '@playwright/test'
import {customerLogin, onePurchase} from './test-1.spec'

export async function commentItmes({page}, expectedComment : string) {
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'View Orders' }).click()
  const row = page.locator('tbody tr:last-child')
  await row.locator('td:nth-child(1)').click()
  // Check the items
  await page.locator('label').filter({ hasText: 'Latte' }).click();
  await page.locator('label').filter({ hasText: 'Turkey Sandwich' }).click();
  // await page.getByLabel('Turkey Sandwich').check()
  // await page.getByLabel('Latte').check()
  // Assert the checked state
  expect(await page.getByLabel('Turkey Sandwich').isChecked()).toBeTruthy()
  expect(await page.getByLabel('Latte').isChecked()).toBeTruthy()
  
  await page.getByPlaceholder('Write Your Comments...').fill(expectedComment)
  await page.getByLabel('Rate:').fill('5')
  await page.getByLabel('Rate:').click()
  await page.getByRole('button', { name: 'Submit' }).click()
}

export async function checkComments({page}, expectedComment: string) {
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'New Order' }).click()
  await page.getByRole('link', { name: 'Coffee' }).click()
  await page.getByRole('link', { name: 'Latte' }).click()
  //itemComments
  await page.getByTitle("itemComments")
  const comment = await page.getByTitle('itemComments').last()
  // const comment = await page.locator('.list-group-item').last()
  const commentContent = comment.getByTitle('comment content')
  await expect(commentContent).toContainText(expectedComment);

}

test('test comment function', async ({ page }) => {
  // go to customer page and login
  await page.goto('http://127.0.0.1:8080/')
  await customerLogin({page})
  const expectedComment = 'Best Coffee in Durham'
  await commentItmes({page}, expectedComment)
  await checkComments({page}, expectedComment)

});