import { ruleTester } from '../rule-tester.js'

import { noNegatedVariablesRule } from './no-negated-variables.js'

ruleTester.run('no-negated-variables', noNegatedVariablesRule, {
	valid: [
		'const isVisible = true',
		'const notificationCount = 1',
		'const isNotFound = true',
		{ code: 'const isNotAllowed = true', options: [{ allow: ['notAllowed'] }] },
	],
	invalid: [
		{
			code: 'const isNotVisible = true',
			errors: [{ messageId: 'negatedName' }],
		},
		{
			code: 'const CANNOT_EDIT = true',
			errors: [{ messageId: 'negatedName' }],
		},
		{
			code: 'function dontShowAgain() {}',
			errors: [{ messageId: 'negatedName' }],
		},
		{
			code: 'const isNotFound = true',
			options: [{ allow: [] }],
			errors: [{ messageId: 'negatedName' }],
		},
	],
})
