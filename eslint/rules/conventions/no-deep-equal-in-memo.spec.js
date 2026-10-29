import { ruleTester } from '../rule-tester.js'
import { noDeepEqualInMemoRule } from './no-deep-equal-in-memo.js'

ruleTester.run('no-deep-equal-in-memo', noDeepEqualInMemoRule, {
	valid: [
		'memo(UserRow)',
		'memo(UserRow, (prev, next) => prev.user.id === next.user.id)',
		'React.memo(UserRow, (prev, next) => prev.id === next.id)',
	],
	invalid: [
		{
			code: 'memo(UserRow, (prev, next) => isEqual(prev, next))',
			errors: [{ messageId: 'noDeepEqualInMemo' }],
		},
		{
			code: 'memo(UserRow, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))',
			errors: [
				{ messageId: 'noDeepEqualInMemo' },
				{ messageId: 'noDeepEqualInMemo' },
			],
		},
		{
			code: `function arePropsEqual(prev, next) { return _.isEqual(prev, next) }
memo(UserRow, arePropsEqual)`,
			errors: [{ messageId: 'noDeepEqualInMemo' }],
		},
		{
			code: 'memo(UserRow, (prev, next) => deepEqual(prev, next))',
			options: [{ functions: ['deepEqual'] }],
			errors: [{ messageId: 'noDeepEqualInMemo' }],
		},
	],
})
