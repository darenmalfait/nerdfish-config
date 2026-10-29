import { ruleTester } from '../rule-tester.js'

import { preferEllipsisCharacterRule } from './prefer-ellipsis-character.js'

ruleTester.run('prefer-ellipsis-character', preferEllipsisCharacterRule, {
	valid: ['<p>Loading…</p>', '<code>...args</code>', '<p>{...props}</p>'],
	invalid: [
		{
			code: '<p>Loading...</p>',
			output: '<p>Loading…</p>',
			errors: [{ messageId: 'preferEllipsis' }],
		},
		{
			code: '<input placeholder="Search..." />',
			output: '<input placeholder="Search…" />',
			errors: [{ messageId: 'preferEllipsis' }],
		},
		{
			code: "<span>{'Saving...'}</span>",
			output: "<span>{'Saving…'}</span>",
			errors: [{ messageId: 'preferEllipsis' }],
		},
	],
})
