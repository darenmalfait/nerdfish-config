import testingRules from './eslint/rules/testing/index.js'
import eslint from './eslint.js'

export default [...eslint, ...testingRules]
