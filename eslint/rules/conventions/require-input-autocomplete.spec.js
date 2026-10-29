import { ruleTester } from '../rule-tester.js'
import { requireInputAutocompleteRule } from './require-input-autocomplete.js'

ruleTester.run('require-input-autocomplete', requireInputAutocompleteRule, {
	valid: [
		'<input type="email" autoComplete="email" />',
		'<input type="password" autoComplete="new-password" />',
		'<input type="text" />',
		'<input type="email" {...field} />',
	],
	invalid: [
		{
			code: '<input type="email" />',
			output: '<input type="email" autoComplete="email" />',
			errors: [{ messageId: 'requireAutocomplete' }],
		},
		{
			code: '<input type="password" />',
			output: null,
			errors: [
				{
					messageId: 'requireAutocomplete',
					suggestions: [
						{
							messageId: 'addAutocomplete',
							output:
								'<input type="password" autoComplete="current-password" />',
						},
						{
							messageId: 'addAutocomplete',
							output: '<input type="password" autoComplete="new-password" />',
						},
					],
				},
			],
		},
		{
			code: '<input type="tel" />',
			output: '<input type="tel" autoComplete="tel" />',
			errors: [{ messageId: 'requireAutocomplete' }],
		},
	],
})
