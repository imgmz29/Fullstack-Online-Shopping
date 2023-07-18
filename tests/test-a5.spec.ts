import { test, expect } from '@playwright/test';

test('customer creating a random order, operator working on it', async ({ page }) => {
    await page.goto('http://127.0.0.1:8096/customer/bob')
    
    // get all the "Add" buttons
    const buttons = page.getByRole('button', { name: /Add/ })

    // get a random index
    let minIndex = 0
    let maxIndex = await buttons.count() - 1
    let randomIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex

    // select a random ingredient
    let randomIngredient = buttons.nth(randomIndex)
    // get the ingredient name
    const ingredientsText = (await randomIngredient.innerText()).split(" ")[1]

    // add this ingredient
    await randomIngredient.click()
    // save and submit order
    await page.click("text='Save'")
    await page.click("text='Submit'")

    
    await page.goto('http://127.0.0.1:8096/operator/jim')
    
    // validate ingredient
    const row = page.locator('tbody tr:last-child')
    const ingredients = row.locator('td:nth-child(4)')
    await expect(ingredients).toHaveText(ingredientsText)

    // operator working on this order
    const startButton = row.getByRole('button', { name: /Start Preparing/ })
    await startButton.click()
    
    const doneButton = row.getByRole('button', { name: /Done/ })
    await doneButton.click()       
});