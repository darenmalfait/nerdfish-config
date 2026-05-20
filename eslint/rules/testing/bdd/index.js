import { testFiles } from '../test-files.js'
import { bddExpectOnlyInTestCaseRule } from './expect-only-in-test-case.js'
import { bddGivenOnlySetupRule } from './given-only-setup.js'
import { bddSplitOnAndRule } from './split-on-and.js'
import { bddUserStoryStructureRule } from './user-story-structure.js'
import { bddUserStoryUsesUserRule } from './user-story-uses-user.js'
import { bddWhenNoAssertions } from './when-no-assertions.js'
import { bddWhenRequiresBeforeEachRule } from './when-requires-before-each.js'
import { bddWhenSingleCoherentActionRule } from './when-single-coherent-action.js'

const ERROR = 'error'

/** @type {import('eslint').Linter.RulesRecord} */
export const bddRules = {
	'@nerdfish/testing-bdd/bdd-user-story-structure': ERROR,
	'@nerdfish/testing-bdd/bdd-expect-only-in-test-case': ERROR,
	'@nerdfish/testing-bdd/bdd-given-only-setup': ERROR,
	'@nerdfish/testing-bdd/bdd-split-on-and': ERROR,
	'@nerdfish/testing-bdd/bdd-user-story-uses-user': ERROR,
	'@nerdfish/testing-bdd/bdd-when-no-assertions': ERROR,
	'@nerdfish/testing-bdd/bdd-when-requires-before-each': ERROR,
	'@nerdfish/testing-bdd/bdd-when-single-coherent-action': ERROR,
}

/** BDD describe / Given / When rules — opt in via spread alongside `@nerdfish/config/eslint/testing`. */
export const plugin = {
	rules: {
		'bdd-user-story-structure': bddUserStoryStructureRule,
		'bdd-expect-only-in-test-case': bddExpectOnlyInTestCaseRule,
		'bdd-given-only-setup': bddGivenOnlySetupRule,
		'bdd-split-on-and': bddSplitOnAndRule,
		'bdd-user-story-uses-user': bddUserStoryUsesUserRule,
		'bdd-when-no-assertions': bddWhenNoAssertions,
		'bdd-when-requires-before-each': bddWhenRequiresBeforeEachRule,
		'bdd-when-single-coherent-action': bddWhenSingleCoherentActionRule,
	},
}

/** @type {import('eslint').Linter.Config[]} */
export const config = [
	{
		files: testFiles,
		plugins: {
			'@nerdfish/testing-bdd': plugin,
		},
		rules: bddRules,
	},
]

export default config
