// Guideline registry id: no-testid-queries
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow test-id queries as the primary selector in tests and prefer accessible queries.',
		guidelineRuleId: 'no-testid-queries',
	},
	schema: [],
	messages: {
		noTestIdQuery:
			'Avoid {{queryName}} as a primary selector in tests. Prefer accessible queries such as getByRole or findByLabelText.',
	},
}

const TEST_ID_QUERY_NAMES = new Set([
	'findAllByTestId',
	'findByTestId',
	'getAllByTestId',
	'getByTestId',
	'queryAllByTestId',
	'queryByTestId',
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

function isWithinScopedTestIdQuery(node) {
	const callee = node?.callee
	if (callee?.type !== 'MemberExpression') {
		return false
	}

	const object = callee.object
	return (
		object?.type === 'CallExpression' &&
		object.callee?.type === 'Identifier' &&
		object.callee.name === 'within'
	)
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				const calleeName = getCalleeName(node.callee)

				if (!TEST_ID_QUERY_NAMES.has(calleeName)) {
					return
				}

				if (isWithinScopedTestIdQuery(node)) {
					return
				}

				context.report({
					node,
					messageId: 'noTestIdQuery',
					data: { queryName: calleeName },
				})
			},
		}
	},
}

export default rule
