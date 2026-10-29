import { ruleTester } from '../rule-tester.js'

import { requireFocusVisibleReplacementRule } from './require-focus-visible-replacement.js'

ruleTester.run(
	'require-focus-visible-replacement',
	requireFocusVisibleReplacementRule,
	{
		valid: [
			'<button className="outline-none focus-visible:ring-2" />',
			"cn('outline-hidden', 'focus-visible:outline-2')",
			'<button className="focus-visible:outline-none" />',
		],
		invalid: [
			{
				code: '<button className="outline-none" />',
				errors: [{ messageId: 'requireFocusVisible' }],
			},
			{
				code: '<button className="focus:outline-none focus:ring-2" />',
				errors: [{ messageId: 'requireFocusVisible' }],
			},
		],
	},
)
