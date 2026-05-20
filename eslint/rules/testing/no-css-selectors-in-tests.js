// Guideline registry id: no-css-selectors-in-tests
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow CSS selector queries in tests and prefer accessible queries.',
		guidelineRuleId: 'no-css-selectors-in-tests',
	},
	schema: [],
	messages: {
		noCssSelector:
			'Avoid {{methodName}} in tests. Prefer accessible queries such as getByRole or findByLabelText.',
	},
}

const CSS_SELECTOR_METHODS = new Set([
	'findByClassName',
	'getByClassName',
	'getElementsByClassName',
	'queryByClassName',
	'querySelector',
	'querySelectorAll',
])

function getMemberPropertyName(callee) {
	if (
		callee?.type === 'MemberExpression' &&
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
				const methodName = getMemberPropertyName(node.callee)

				if (!CSS_SELECTOR_METHODS.has(methodName)) {
					return
				}

				context.report({
					node,
					messageId: 'noCssSelector',
					data: { methodName },
				})
			},
		}
	},
}

export default rule
