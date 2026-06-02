import conventionsRules from './eslint/rules/conventions/index.js'
import bddRules from './eslint/rules/testing/bdd/index.js'
import testingRules from './eslint/rules/testing/common/index.js'
import baseConfig from './eslint.js'

export default [
	...baseConfig,
	...testingRules,
	...bddRules,
	...conventionsRules,
]
