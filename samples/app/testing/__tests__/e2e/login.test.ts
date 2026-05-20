import { expect, screen, test } from '../testing-runtime'

test.describe('User Story: user can open the login page', () => {
	test.describe('Given the app is loaded', () => {
		test('shows the sign-in heading', async () => {
			expect(
				await screen.findByRole('heading', { name: 'auth.sign_in' }),
			).toBeInTheDocument()
		})
	})
})
