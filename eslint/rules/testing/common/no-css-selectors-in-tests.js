// Guideline registry id: no-css-selectors-in-tests
import { createBannedMemberQueryRule } from './util.js'

const CSS_SELECTOR_METHODS = new Set([
	'findByClassName',
	'getByClassName',
	'getElementsByClassName',
	'queryByClassName',
	'querySelector',
	'querySelectorAll',
])

export const noCssSelectorsInTestsRule = createBannedMemberQueryRule({
	guidelineRuleId: 'no-css-selectors-in-tests',
	description:
		'Disallow CSS selector queries in tests and prefer accessible queries.',
	messageId: 'noCssSelector',
	message:
		'Avoid {{methodName}} in tests. Prefer accessible queries such as getByRole or findByLabelText.',
	bannedNames: CSS_SELECTOR_METHODS,
})
