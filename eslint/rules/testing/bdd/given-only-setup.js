// Guideline registry id: testing.bdd.given-only-setup
import { createNoAssertionsInBddBlockRule } from './util.js'

export const bddGivenOnlySetupRule = createNoAssertionsInBddBlockRule({
	guidelineRuleId: 'testing.bdd.given-only-setup',
	description: 'Ensure Given blocks are used for setup only, not assertions.',
	messageId: 'givenOnlySetup',
	message:
		'Use Given blocks for setup only; move assertions to it/test blocks.',
	helperName: 'Given',
	describeTitlePrefix: 'Given ',
})
