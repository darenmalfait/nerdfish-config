// Guideline registry id: no-testid-queries
import { createBannedMemberQueryRule, isQueryScopedWithin } from './util.js'

const TEST_ID_QUERY_NAMES = new Set([
	'findAllByTestId',
	'findByTestId',
	'getAllByTestId',
	'getByTestId',
	'queryAllByTestId',
	'queryByTestId',
])

export const noTestidQueriesRule = createBannedMemberQueryRule({
	guidelineRuleId: 'no-testid-queries',
	description:
		'Disallow test-id queries as the primary selector in tests and prefer accessible queries.',
	messageId: 'noTestIdQuery',
	message:
		'Avoid {{queryName}} as a primary selector in tests. Prefer accessible queries such as getByRole or findByLabelText.',
	bannedNames: TEST_ID_QUERY_NAMES,
	exclude: (node) => isQueryScopedWithin(node),
})
