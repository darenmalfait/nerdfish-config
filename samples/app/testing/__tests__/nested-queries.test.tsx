import * as React from 'react'
import {
	beforeEach,
	describe,
	expect,
	it,
	render,
	screen,
	waitFor,
	within,
} from './testing-runtime'

function Panel() {
	return (
		<section role="region" aria-label="panel.region">
			<button type="button">panel.open</button>
		</section>
	)
}

function getPanelRegion() {
	return screen.getByRole('region', { name: 'panel.region' })
}

describe('User Story: user can read status inside a panel', () => {
	describe('Given the panel is rendered', () => {
		beforeEach(() => {
			render(<Panel />)
		})

		describe('When the user opens the panel', () => {
			beforeEach(() => {
				openPanel()
			})

			it('shows the completion status inside the panel', async () => {
				await waitFor(() => {
					expect(
						within(getPanelRegion()).getByRole('status', {
							name: 'done.label',
						}),
					).toBeInTheDocument()
				})
			})
		})
	})
})

function openPanel() {}
