import { expect, test, type Page } from './playwright-runtime'

test.describe('User Story: user can sign in to the app', () => {
	test.describe('Given the login page is open', () => {
		test.beforeEach(async ({ page }: { page: Page }) => {
			await page.goto('/login')
		})

		test.describe('When the user submits valid credentials', () => {
			test.beforeEach(async ({ page }: { page: Page }) => {
				await submitLogin(page)
			})

			test('it shows a success message', async ({ page }: { page: Page }) => {
				await expect(
					page.getByRole('status', { name: 'form.success' }),
				).toBeVisible()
			})
		})
	})
})

async function submitLogin(page: Page) {
	await page.getByRole('button', { name: 'auth.submit' }).click()
}
