import { ruleTester } from '../../rule-tester.js'

import { bddExpectOnlyInTestCaseRule } from './expect-only-in-test-case.js'

ruleTester.run('expect-only-in-test-case', bddExpectOnlyInTestCaseRule, {
	valid: [
		`it('shows the name', () => {
	expect(screen.getByText('Daren')).toBeVisible()
})`,
		`test.only('shows the name', () => {
	expect(name).toBe('Daren')
})`,
	],
	invalid: [
		{
			code: `describe('Given a user', () => {
	expect(user).toBeDefined()
})`,
			errors: [{ messageId: 'expectOnlyInTestCase' }],
		},
		{
			code: `beforeEach(() => {
	expect(server).toBeDefined()
})`,
			errors: [{ messageId: 'expectOnlyInTestCase' }],
		},
		{
			code: `When('the user saves', () => {
	beforeEach(() => expect(form).toBeValid())
})`,
			errors: [{ messageId: 'expectOnlyInTestCase' }],
		},
	],
})
