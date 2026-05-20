import { testFiles } from '../test-files.js'
import bddGivenOnlySetup from './given-only-setup.js'
import bddSplitOnAnd from './split-on-and.js'
import bddUserStoryStructure from './user-story-structure.js'
import bddUserStoryUsesUser from './user-story-uses-user.js'
import bddWhenNoAssertions from './when-no-assertions.js'
import bddWhenSingleCoherentAction from './when-single-coherent-action.js'

const ERROR = 'error'

/** @type {import('eslint').Linter.RulesRecord} */
export const bddRules = {
	'@nerdfish/testing-bdd/bdd-user-story-structure': ERROR,
	'@nerdfish/testing-bdd/bdd-given-only-setup': ERROR,
	'@nerdfish/testing-bdd/bdd-split-on-and': ERROR,
	'@nerdfish/testing-bdd/bdd-user-story-uses-user': ERROR,
	'@nerdfish/testing-bdd/bdd-when-no-assertions': ERROR,
	'@nerdfish/testing-bdd/bdd-when-single-coherent-action': ERROR,
}

/** BDD describe / Given / When rules — opt in via spread alongside `@nerdfish/config/eslint/testing`. */
export const plugin = {
	rules: {
		'bdd-user-story-structure': bddUserStoryStructure,
		'bdd-given-only-setup': bddGivenOnlySetup,
		'bdd-split-on-and': bddSplitOnAnd,
		'bdd-user-story-uses-user': bddUserStoryUsesUser,
		'bdd-when-no-assertions': bddWhenNoAssertions,
		'bdd-when-single-coherent-action': bddWhenSingleCoherentAction,
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
