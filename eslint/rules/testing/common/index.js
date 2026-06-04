import { testFiles } from '../test-files.js'
import { noCssSelectorsInTestsRule } from './no-css-selectors-in-tests.js'
import { noStoredElementQueriesRule } from './no-stored-element-queries.js'
import { noTestidQueriesRule } from './no-testid-queries.js'
import { noTestingInternalsRule } from './no-testing-internals.js'
import { noWithinFindbyOnStaleScopeRule } from './no-within-findby-on-stale-scope.js'
import { preferAccessibleQueriesRule } from './prefer-accessible-queries.js'
import { specHttpMockLifecycleRule } from './spec-http-mock-lifecycle.js'
import { specPartialMocksUseJestRequireActualRule } from './spec-partial-mocks-use-jest-require-actual.js'

const ERROR = 'error'

export { testFiles }

/** @type {import('eslint').Linter.RulesRecord} */
export const testingRules = {
	'@nerdfish/testing/no-css-selectors-in-tests': ERROR,
	'@nerdfish/testing/no-stored-element-queries': ERROR,
	'@nerdfish/testing/no-testid-queries': ERROR,
	'@nerdfish/testing/no-testing-internals': ERROR,
	'@nerdfish/testing/no-within-findby-on-stale-scope': ERROR,
	'@nerdfish/testing/prefer-accessible-queries': ERROR,
	'@nerdfish/testing/spec-http-mock-lifecycle': ERROR,
	'@nerdfish/testing/spec-partial-mocks-use-jest-require-actual': ERROR,
}

/** @type {import('eslint').ESLint.Plugin} */
export const plugin = {
	rules: {
		'no-css-selectors-in-tests': noCssSelectorsInTestsRule,
		'no-stored-element-queries': noStoredElementQueriesRule,
		'no-testid-queries': noTestidQueriesRule,
		'no-testing-internals': noTestingInternalsRule,
		'no-within-findby-on-stale-scope': noWithinFindbyOnStaleScopeRule,
		'prefer-accessible-queries': preferAccessibleQueriesRule,
		'spec-http-mock-lifecycle': specHttpMockLifecycleRule,
		'spec-partial-mocks-use-jest-require-actual':
			specPartialMocksUseJestRequireActualRule,
	},
}

/** Testing Library / spec rules — opt in via spread. Add `@nerdfish/config/eslint/testing/bdd` for BDD rules. */
export const config = [
	{
		files: testFiles,
		plugins: {
			'@nerdfish/testing': plugin,
		},
		rules: testingRules,
	},
]

export default config
