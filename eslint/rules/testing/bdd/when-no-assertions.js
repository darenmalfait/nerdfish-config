// Guideline registry id: testing.bdd.when-no-assertions
import { createNoAssertionsInBddBlockRule } from './util.js'

export const bddWhenNoAssertions = createNoAssertionsInBddBlockRule({
	guidelineRuleId: 'testing.bdd.when-no-assertions',
	description:
		'Disallow assertions inside When blocks; keep them in it blocks.',
	messageId: 'whenNoAssertions',
	message:
		'Avoid assertions inside When blocks; keep assertions inside it/test blocks.',
	helperName: 'When',
	describeTitlePrefix: 'When ',
})
