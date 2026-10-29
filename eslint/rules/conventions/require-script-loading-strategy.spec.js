import { ruleTester } from '../rule-tester.js'

import { requireScriptLoadingStrategyRule } from './require-script-loading-strategy.js'

ruleTester.run(
	'require-script-loading-strategy',
	requireScriptLoadingStrategyRule,
	{
		valid: [
			'<script src="/app.js" defer />',
			'<script src="/app.js" async />',
			'<script src="/app.js" type="module" />',
			'<script dangerouslySetInnerHTML={{ __html: theme }} />',
			'<script src="/app.js" {...props} />',
		],
		invalid: [
			{
				code: '<script src="/app.js" />',
				errors: [{ messageId: 'requireLoadingStrategy' }],
			},
		],
	},
)
