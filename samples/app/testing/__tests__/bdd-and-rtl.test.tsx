import { beforeEach, describe, expect, it, screen } from './testing-runtime'

describe('User Story: user can submit the form', () => {
	describe('Given the form is open', () => {
		beforeEach(() => {
			// setup only
		})

		describe('When the user submits valid input', () => {
			it('shows a success message', async () => {
				clickSubmit()
				expect(
					await screen.findByRole('status', { name: 'form.success' }),
				).toBeInTheDocument()
			})
		})
	})
})

function clickSubmit() {}
