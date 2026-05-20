// Guideline registry id: testing.accessibility.prefer-accessible-queries
const meta = {
	type: 'problem',
	docs: {
		description:
			'Prefer accessible Testing Library queries such as getByRole/findByLabelText.',
		guidelineRuleId: 'testing.accessibility.prefer-accessible-queries',
	},
	schema: [],
	messages: {
		preferAccessibleQuery:
			'Prefer accessible queries such as getByRole or findByLabelText instead of {{queryName}}.',
	},
}

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

function getCalleeName(callee) {
	if (!callee) {
		return null
	}

	if (callee.type === 'Identifier') {
		return callee.name
	}

	if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name
	}

	return null
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				const calleeName = getCalleeName(node.callee)

				if (!DISALLOWED_QUERY_NAMES.has(calleeName)) {
					return
				}

				context.report({
					node,
					messageId: 'preferAccessibleQuery',
					data: { queryName: calleeName },
				})
			},
		}
	},
}

export default rule
