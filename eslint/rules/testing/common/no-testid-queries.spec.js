import { ruleTester } from '../../rule-tester.js'

import { noTestidQueriesRule } from './no-testid-queries.js'

ruleTester.run('no-testid-queries', noTestidQueriesRule, {
	valid: [
		"screen.getByRole('dialog')",
		"within(screen.getByRole('list')).getByTestId('row-1')",
	],
	invalid: [
		{
			code: "screen.getByTestId('save-button')",
			errors: [{ messageId: 'noTestIdQuery' }],
		},
		{
			code: "await screen.findAllByTestId('row')",
			errors: [{ messageId: 'noTestIdQuery' }],
		},
		{
			code: "screen.queryByTestId('spinner')",
			errors: [{ messageId: 'noTestIdQuery' }],
		},
	],
})
