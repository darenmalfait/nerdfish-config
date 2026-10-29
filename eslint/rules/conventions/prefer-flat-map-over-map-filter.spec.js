import { ruleTester } from '../rule-tester.js'

import { preferFlatMapOverMapFilterRule } from './prefer-flat-map-over-map-filter.js'

ruleTester.run(
	'prefer-flat-map-over-map-filter',
	preferFlatMapOverMapFilterRule,
	{
		valid: [
			'users.flatMap((user) => (user.isActive ? [user.name] : []))',
			'users.map(toName).filter(isPresent)',
			'users.filter(Boolean).map(toName)',
		],
		invalid: [
			{
				code: 'users.map((user) => (user.isActive ? user.name : null)).filter(Boolean)',
				errors: [{ messageId: 'preferFlatMap' }],
			},
		],
	},
)
