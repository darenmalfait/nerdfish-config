import {
	beforeEach,
	describe,
	expect,
	it,
	render,
	screen,
} from './testing-runtime'

describe('User Story: user can submit the form', () => {
	describe('Given the form is rendered', () => {
		beforeEach(() => {
			render(<Form />)
		})

		describe('When the user submits valid input', () => {
			beforeEach(() => {
				clickSubmit()
			})

			it('shows a success message', async () => {
				expect(
					await screen.findByRole('status', { name: 'form.success' }),
				).toBeInTheDocument()
			})
		})
	})
})

function clickSubmit() {}

function Form() {
	return (
		<form>
			<button type="submit">form.submit</button>
		</form>
	)
}
