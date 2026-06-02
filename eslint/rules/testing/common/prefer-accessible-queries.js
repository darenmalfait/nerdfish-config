// Guideline registry id: testing.accessibility.prefer-accessible-queries
import { createBannedMemberQueryRule } from './util.js'

const DISALLOWED_QUERY_NAMES = new Set([
	'findAllByAltText',
	'findAllByDisplayValue',
	'findAllByPlaceholderText',
	'findAllByText',
	'findAllByTitle',
	'findByAltText',
	'findByDisplayValue',
	'findByPlaceholderText',
	'findByText',
	'findByTitle',
	'getAllByAltText',
	'getAllByDisplayValue',
	'getAllByPlaceholderText',
	'getAllByText',
	'getAllByTitle',
	'getByAltText',
	'getByDisplayValue',
	'getByPlaceholderText',
	'getByText',
	'getByTitle',
	'queryAllByAltText',
	'queryAllByDisplayValue',
	'queryAllByPlaceholderText',
	'queryAllByText',
	'queryAllByTitle',
	'queryByAltText',
	'queryByDisplayValue',
	'queryByPlaceholderText',
	'queryByText',
	'queryByTitle',
])

export const preferAccessibleQueriesRule = createBannedMemberQueryRule({
	guidelineRuleId: 'testing.accessibility.prefer-accessible-queries',
	description:
		'Prefer accessible Testing Library queries such as getByRole/findByLabelText.',
	messageId: 'preferAccessibleQuery',
	message:
		'Prefer accessible queries such as getByRole or findByLabelText instead of {{queryName}}.',
	bannedNames: DISALLOWED_QUERY_NAMES,
})
