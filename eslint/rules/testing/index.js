import bddUserStoryStructure from './bdd-user-story-structure.js'
import noCssSelectorsInTests from './no-css-selectors-in-tests.js'
import noStoredElementQueries from './no-stored-element-queries.js'
import noTestidQueries from './no-testid-queries.js'
import noTestingInternals from './no-testing-internals.js'
import noTranslationLiteralAssertions from './no-translation-literal-assertions.js'
import noWithinFindbyOnStaleScope from './no-within-findby-on-stale-scope.js'
import preferAccessibleQueries from './testing-accessibility-prefer-accessible-queries.js'
import bddGivenOnlySetup from './testing-bdd-given-only-setup.js'
import bddSplitOnAnd from './testing-bdd-split-on-and.js'
import bddUserStoryUsesUser from './testing-bdd-user-story-uses-user.js'
import bddWhenNoAssertions from './testing-bdd-when-no-assertions.js'
import bddWhenSingleCoherentAction from './testing-bdd-when-single-coherent-action.js'
import specMswServerLifecycle from './testing-spec-msw-server-lifecycle.js'
import specPartialMocksUseJestRequireActual from './testing-spec-partial-mocks-use-jest-require-actual.js'

const ERROR = 'error'

export const testFiles = [
	'**/tests/**',
	'**/#tests/**',
	'**/__tests__/**/*',
	'**/*.test.*',
	'**/e2e/**',
]

/** @type {import('eslint').Linter.RulesRecord} */
export const testingRules = {
	'@nerdfish/testing/bdd-user-story-structure': ERROR,
	'@nerdfish/testing/no-css-selectors-in-tests': ERROR,
	'@nerdfish/testing/no-stored-element-queries': ERROR,
	'@nerdfish/testing/no-testid-queries': ERROR,
	'@nerdfish/testing/no-testing-internals': ERROR,
	'@nerdfish/testing/no-translation-literal-assertions': ERROR,
	'@nerdfish/testing/no-within-findby-on-stale-scope': ERROR,
	'@nerdfish/testing/prefer-accessible-queries': ERROR,
	'@nerdfish/testing/bdd-given-only-setup': ERROR,
	'@nerdfish/testing/bdd-split-on-and': ERROR,
	'@nerdfish/testing/bdd-user-story-uses-user': ERROR,
	'@nerdfish/testing/bdd-when-no-assertions': ERROR,
	'@nerdfish/testing/bdd-when-single-coherent-action': ERROR,
	'@nerdfish/testing/spec-msw-server-lifecycle': ERROR,
	'@nerdfish/testing/spec-partial-mocks-use-jest-require-actual': ERROR,
}

/** @type {import('eslint').ESLint.Plugin} */
export const plugin = {
	rules: {
		'bdd-user-story-structure': bddUserStoryStructure,
		'no-css-selectors-in-tests': noCssSelectorsInTests,
		'no-stored-element-queries': noStoredElementQueries,
		'no-testid-queries': noTestidQueries,
		'no-testing-internals': noTestingInternals,
		'no-translation-literal-assertions': noTranslationLiteralAssertions,
		'no-within-findby-on-stale-scope': noWithinFindbyOnStaleScope,
		'prefer-accessible-queries': preferAccessibleQueries,
		'bdd-given-only-setup': bddGivenOnlySetup,
		'bdd-split-on-and': bddSplitOnAnd,
		'bdd-user-story-uses-user': bddUserStoryUsesUser,
		'bdd-when-no-assertions': bddWhenNoAssertions,
		'bdd-when-single-coherent-action': bddWhenSingleCoherentAction,
		'spec-msw-server-lifecycle': specMswServerLifecycle,
		'spec-partial-mocks-use-jest-require-actual':
			specPartialMocksUseJestRequireActual,
	},
}

/** Opinionated Testing Library / BDD / spec rules — opt in via spread. */
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
