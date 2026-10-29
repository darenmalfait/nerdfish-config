import { ruleTester } from '../rule-tester.js'

import { requireTimerCleanupRule } from './require-timer-cleanup.js'

ruleTester.run('require-timer-cleanup', requireTimerCleanupRule, {
	valid: [
		`useEffect(() => {
	const id = setTimeout(close, 300)
	return () => clearTimeout(id)
})`,
		`useEffect(() => {
	timer.current = setInterval(poll, 1000)
	return () => clearInterval(timer.current)
})`,
		'function handleClick() { setTimeout(close, 300) }',
	],
	invalid: [
		{
			code: `useEffect(() => {
	setTimeout(close, 300)
})`,
			errors: [{ messageId: 'missingCleanup' }],
		},
		{
			code: `useEffect(() => {
	const id = setTimeout(close, 300)
})`,
			errors: [{ messageId: 'missingCleanup' }],
		},
		{
			code: `useLayoutEffect(() => {
	const id = setInterval(poll, 1000)
	return () => clearTimeout(other)
})`,
			errors: [{ messageId: 'missingCleanup' }],
		},
	],
})
