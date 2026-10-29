import { ruleTester } from '../rule-tester.js'

import { requireReducedMotionRule } from './require-reduced-motion.js'

ruleTester.run('require-reduced-motion', requireReducedMotionRule, {
	valid: [
		'<div className="motion-safe:animate-bounce" />',
		'<div className="animate-spin motion-reduce:animate-none" />',
		"cn('animate-pulse', 'motion-reduce:hidden')",
		'<div className="animate-none" />',
	],
	invalid: [
		{
			code: '<div className="animate-bounce" />',
			output: '<div className="motion-safe:animate-bounce" />',
			errors: [{ messageId: 'requireReducedMotion' }],
		},
		{
			code: "cn('p-4', 'animate-spin')",
			output: "cn('p-4', 'motion-safe:animate-spin')",
			errors: [{ messageId: 'requireReducedMotion' }],
		},
	],
})
