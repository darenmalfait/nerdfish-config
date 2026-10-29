import { ruleTester } from '../../rule-tester.js'

import { bddSplitOnAndRule } from './split-on-and.js'

ruleTester.run('split-on-and', bddSplitOnAndRule, {
	valid: [
		"it('saves the profile', () => {})",
		"describe('Given a brand new user', () => {})",
		"it('shows the Android banner', () => {})",
	],
	invalid: [
		{
			code: "it('saves and closes the dialog', () => {})",
			errors: [{ messageId: 'splitOnAnd' }],
		},
		{
			code: "describe('When the user edits AND saves', () => {})",
			errors: [{ messageId: 'splitOnAnd' }],
		},
		{
			code: "test.skip('loads and renders', () => {})",
			errors: [{ messageId: 'splitOnAnd' }],
		},
	],
})
