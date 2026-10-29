import { ruleTester } from '../../rule-tester.js'

import { noStoredElementQueriesRule } from './no-stored-element-queries.js'

ruleTester.run('no-stored-element-queries', noStoredElementQueriesRule, {
	valid: [
		"const getSaveButton = () => screen.getByRole('button', { name: 'Save' })",
		`it('saves', () => {
	const button = screen.getByRole('button')
	expect(button).toBeEnabled()
})`,
		`describe('form', () => {
	beforeEach(() => {
		const button = screen.getByRole('button')
	})
})`,
		'const result = render(<Form />)',
	],
	invalid: [
		{
			code: `describe('form', () => {
	let button
	beforeEach(() => {
		button = screen.getByRole('button')
	})
})`,
			errors: [{ messageId: 'noStoredElementQuery' }],
		},
		{
			code: `describe('form', () => {
	beforeAll(async () => {
		const dialog = await screen.findByRole('dialog')
	})
})`,
			errors: [{ messageId: 'noStoredElementQuery' }],
		},
	],
})
