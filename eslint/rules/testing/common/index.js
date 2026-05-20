import { testFiles } from '../test-files.js'
import noCssSelectorsInTests from './no-css-selectors-in-tests.js'
import noStoredElementQueries from './no-stored-element-queries.js'
import noTestidQueries from './no-testid-queries.js'
import noTestingInternals from './no-testing-internals.js'
import noTranslationLiteralAssertions from './no-translation-literal-assertions.js'
import noWithinFindbyOnStaleScope from './no-within-findby-on-stale-scope.js'
import preferAccessibleQueries from './prefer-accessible-queries.js'
import specMswServerLifecycle from './spec-msw-server-lifecycle.js'
import specPartialMocksUseJestRequireActual from './spec-partial-mocks-use-jest-require-actual.js'

const ERROR = 'error'

export { testFiles }

/** @type {import('eslint').Linter.RulesRecord} */
export const testingRules = {
	'@nerdfish/testing/no-css-selectors-in-tests': ERROR,
	'@nerdfish/testing/no-stored-element-queries': ERROR,
	'@nerdfish/testing/no-testid-queries': ERROR,
	'@nerdfish/testing/no-testing-internals': ERROR,
	'@nerdfish/testing/no-translation-literal-assertions': ERROR,
	'@nerdfish/testing/no-within-findby-on-stale-scope': ERROR,
	'@nerdfish/testing/prefer-accessible-queries': ERROR,
	'@nerdfish/testing/spec-msw-server-lifecycle': ERROR,
	'@nerdfish/testing/spec-partial-mocks-use-jest-require-actual': ERROR,
}

/** @type {import('eslint').ESLint.Plugin} */
export const plugin = {
	rules: {
		'no-css-selectors-in-tests': noCssSelectorsInTests,
		'no-stored-element-queries': noStoredElementQueries,
		'no-testid-queries': noTestidQueries,
		'no-testing-internals': noTestingInternals,
		'no-translation-literal-assertions': noTranslationLiteralAssertions,
		'no-within-findby-on-stale-scope': noWithinFindbyOnStaleScope,
		'prefer-accessible-queries': preferAccessibleQueries,
		'spec-msw-server-lifecycle': specMswServerLifecycle,
		'spec-partial-mocks-use-jest-require-actual':
			specPartialMocksUseJestRequireActual,
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
