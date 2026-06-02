import { expect, test, type Page } from './playwright-runtime'

test.describe('User Story: user can open the login page', () => {
	test.describe('Given the app is loaded', () => {
		test.beforeEach(async ({ page }: { page: Page }) => {
			await page.goto('/login')
		})

		test('it shows the sign-in heading', async ({ page }: { page: Page }) => {
			await expect(
				page.getByRole('heading', { name: 'auth.sign_in' }),
			).toBeVisible()
		})
	})
})
