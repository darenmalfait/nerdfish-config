import { ruleTester } from '../../rule-tester.js'

import { preferAccessibleQueriesRule } from './prefer-accessible-queries.js'

ruleTester.run('prefer-accessible-queries', preferAccessibleQueriesRule, {
	valid: [
		"screen.getByRole('button', { name: 'Save' })",
		"screen.getByLabelText('Email')",
	],
	invalid: [
		{
			code: "screen.getByText('Save')",
			errors: [{ messageId: 'preferAccessibleQuery' }],
		},
		{
			code: "screen.queryByPlaceholderText('Search')",
			errors: [{ messageId: 'preferAccessibleQuery' }],
		},
		{
			code: "await screen.findAllByTitle('Close')",
			errors: [{ messageId: 'preferAccessibleQuery' }],
		},
		{
			code: "screen.getByDisplayValue('Daren')",
			errors: [{ messageId: 'preferAccessibleQuery' }],
		},
	],
})
