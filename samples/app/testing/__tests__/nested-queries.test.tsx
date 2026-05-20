import {
	describe,
	expect,
	it,
	screen,
	waitFor,
	within,
} from './testing-runtime'

describe('User Story: user can find nested content', () => {
	describe('Given a region is visible', () => {
		describe('When the user waits for nested copy', () => {
			it('shows nested content', async () => {
				const region = await screen.findByRole('region', {
					name: 'panel.region',
				})

				await waitFor(() => {
					expect(
						within(region).getByRole('status', { name: 'done.label' }),
					).toBeInTheDocument()
				})
			})
		})
	})
})
