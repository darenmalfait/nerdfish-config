import { ruleTester } from '../../rule-tester.js'

import { noCssSelectorsInTestsRule } from './no-css-selectors-in-tests.js'

ruleTester.run('no-css-selectors-in-tests', noCssSelectorsInTestsRule, {
	valid: [
		"screen.getByRole('button', { name: 'Save' })",
		"screen.findByLabelText('Email')",
	],
	invalid: [
		{
			code: "container.querySelector('.save-button')",
			errors: [{ messageId: 'noCssSelector' }],
		},
		{
			code: "document.querySelectorAll('li')",
			errors: [{ messageId: 'noCssSelector' }],
		},
		{
			code: "screen.getByClassName('card')",
			errors: [{ messageId: 'noCssSelector' }],
		},
	],
})
