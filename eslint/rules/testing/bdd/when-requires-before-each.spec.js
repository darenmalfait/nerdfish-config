import { ruleTester } from '../../rule-tester.js'
import { bddWhenRequiresBeforeEachRule } from './when-requires-before-each.js'

ruleTester.run('when-requires-before-each', bddWhenRequiresBeforeEachRule, {
	valid: [
		`describe('When the user saves', () => {
	beforeEach(async () => {
		await user.click(saveButton())
	})
})`,
		`When('the user saves', () => {
	beforeEach(() => user.click(saveButton()))
})`,
		"describe('Given a user', () => {})",
	],
	invalid: [
		{
			code: `describe('When the user saves', () => {
	it('saves', () => {})
})`,
			errors: [{ messageId: 'whenRequiresBeforeEach' }],
		},
		{
			code: "When('the user saves', () => {})",
			errors: [{ messageId: 'whenRequiresBeforeEach' }],
		},
	],
})
