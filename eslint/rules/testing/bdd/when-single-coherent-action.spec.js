import { ruleTester } from '../../rule-tester.js'
import { bddWhenSingleCoherentActionRule } from './when-single-coherent-action.js'

ruleTester.run('when-single-coherent-action', bddWhenSingleCoherentActionRule, {
	valid: [
		`describe('When the user saves', () => {
	beforeEach(async () => {
		await user.type(nameInput(), 'Daren')
		await user.click(saveButton())
	})
	it('saves', () => {})
})`,
	],
	invalid: [
		{
			code: "describe('When the user edits and saves', () => {})",
			errors: [{ messageId: 'whenSingleAction' }],
		},
		{
			code: `When('the user saves', () => {
	user.type(nameInput(), 'Daren')
	user.click(saveButton())
})`,
			errors: [{ messageId: 'whenSingleAction' }],
		},
	],
})
