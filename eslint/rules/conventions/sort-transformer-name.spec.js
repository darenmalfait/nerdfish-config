import { ruleTester } from '../rule-tester.js'

import { sortTransformerNameRule } from './sort-transformer-name.js'

ruleTester.run('sort-transformer-name', sortTransformerNameRule, {
	valid: [
		'users.sort(byName)',
		'users.toSorted(byAge)',
		'users.sort()',
		'users.sort((a, b) => a.age - b.age)',
		'users.sort(comparators.name)',
		{ code: 'users.sort(compareName)', options: [{ prefix: 'compare' }] },
	],
	invalid: [
		{
			code: 'users.sort(compareName)',
			errors: [{ messageId: 'comparatorPrefix' }],
		},
		{
			code: 'users.toSorted(nameAscending)',
			errors: [{ messageId: 'comparatorPrefix' }],
		},
		{
			code: 'users.sort(byName)',
			options: [{ prefix: 'compare' }],
			errors: [{ messageId: 'comparatorPrefix' }],
		},
	],
})
