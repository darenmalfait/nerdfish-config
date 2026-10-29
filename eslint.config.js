import baseConfig from './eslint.js'
import conventionsRules from './eslint/rules/conventions/index.js'
import bddRules from './eslint/rules/testing/bdd/index.js'
import testingRules from './eslint/rules/testing/common/index.js'

export default [
	{ ignores: ['.tmp/**', '.agents/skills/**'] },
	...baseConfig,
	...testingRules,
	...bddRules,
	...conventionsRules,
	{
		// Rule specs hold the code under test as strings, template literals included.
		files: ['eslint/rules/**/*.spec.js'],
		rules: { 'no-template-curly-in-string': 'off' },
	},
]
