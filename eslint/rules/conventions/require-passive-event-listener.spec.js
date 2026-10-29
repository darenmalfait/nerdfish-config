import { ruleTester } from '../rule-tester.js'
import { requirePassiveEventListenerRule } from './require-passive-event-listener.js'

ruleTester.run(
	'require-passive-event-listener',
	requirePassiveEventListenerRule,
	{
		valid: [
			"window.addEventListener('scroll', handleScroll, { passive: true })",
			"el.addEventListener('touchmove', handleMove, { passive: false })",
			"el.addEventListener('scroll', handleScroll, options)",
			"el.addEventListener('click', handleClick)",
		],
		invalid: [
			{
				code: "window.addEventListener('scroll', handleScroll)",
				errors: [{ messageId: 'requirePassive' }],
			},
			{
				code: "el.addEventListener('wheel', handleWheel, { capture: true })",
				errors: [{ messageId: 'requirePassive' }],
			},
			{
				code: "el.addEventListener('wheel', handleWheel, true)",
				errors: [{ messageId: 'requirePassive' }],
			},
		],
	},
)
