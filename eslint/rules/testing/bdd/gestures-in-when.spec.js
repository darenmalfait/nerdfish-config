import { ruleTester } from '../../rule-tester.js'

import { bddGesturesInWhenRule } from './gestures-in-when.js'

ruleTester.run('gestures-in-when', bddGesturesInWhenRule, {
	valid: [
		`describe('When the user saves', () => {
	beforeEach(async () => {
		await user.click(saveButton())
	})
})`,
		`it('sets up', () => {
	const user = userEvent.setup()
})`,
	],
	invalid: [
		{
			code: `it('saves', async () => {
	await user.click(saveButton())
})`,
			errors: [{ messageId: 'gestureInWhen' }],
		},
		{
			code: `test('types', async () => {
	await userEvent.type(input(), 'hi')
})`,
			errors: [{ messageId: 'gestureInWhen' }],
		},
		{ code: 'fireEvent.click(button)', errors: [{ messageId: 'noFireEvent' }] },
		{
			code: "fireEvent(button, new MouseEvent('click'))",
			errors: [{ messageId: 'noFireEvent' }],
		},
	],
})
