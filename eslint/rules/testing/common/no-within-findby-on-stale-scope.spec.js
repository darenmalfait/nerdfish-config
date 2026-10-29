import { ruleTester } from '../../rule-tester.js'
import { noWithinFindbyOnStaleScopeRule } from './no-within-findby-on-stale-scope.js'

ruleTester.run(
	'no-within-findby-on-stale-scope',
	noWithinFindbyOnStaleScopeRule,
	{
		valid: [
			"await waitFor(() => within(list).getByRole('row'))",
			"await screen.findByRole('row')",
		],
		invalid: [
			{
				code: "await within(list).findByRole('row')",
				errors: [{ messageId: 'noWithinFindBy' }],
			},
			{
				code: "await within(screen.getByRole('list')).findAllByRole('row')",
				errors: [{ messageId: 'noWithinFindBy' }],
			},
		],
	},
)
