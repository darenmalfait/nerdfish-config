import { ruleTester } from '../rule-tester.js'

import { noTransitionAllRule } from './no-transition-all.js'

ruleTester.run('no-transition-all', noTransitionAllRule, {
	valid: [
		'<div className="transition-colors" />',
		"<div style={{ transition: 'opacity 150ms' }} />",
		"cn('transition-opacity')",
	],
	invalid: [
		{
			code: '<div className="transition-all duration-200" />',
			errors: [{ messageId: 'noTransitionAll' }],
		},
		{
			code: "cn('hover:transition-all')",
			errors: [{ messageId: 'noTransitionAll' }],
		},
		{
			code: "<div style={{ transition: 'all 150ms' }} />",
			errors: [{ messageId: 'noTransitionAll' }],
		},
	],
})
