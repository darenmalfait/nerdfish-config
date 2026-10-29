import { ruleTester } from '../rule-tester.js'
import { noTrivialUseMemoRule } from './no-trivial-use-memo.js'

ruleTester.run('no-trivial-use-memo', noTrivialUseMemoRule, {
	valid: [
		'useMemo(() => items.filter(isActive), [items])',
		'useMemo(() => ({ id, name }), [id, name])',
		'useMemo(() => [a, b], [a, b])',
	],
	invalid: [
		{
			code: 'const isLoading = useMemo(() => user.isLoading || notifications.isLoading, [user.isLoading, notifications.isLoading])',
			output: 'const isLoading = user.isLoading || notifications.isLoading',
			errors: [{ messageId: 'noTrivialUseMemo' }],
		},
		{
			code: 'const fullName = useMemo(() => `${first} ${last}`, [first, last])',
			output: 'const fullName = `${first} ${last}`',
			errors: [{ messageId: 'noTrivialUseMemo' }],
		},
		{
			code: 'const total = React.useMemo(() => { return price * quantity }, [price, quantity])',
			output: 'const total = price * quantity',
			errors: [{ messageId: 'noTrivialUseMemo' }],
		},
	],
})
