// Guideline registry id: no-within-findby-on-stale-scope
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow within(...).findBy* on stale scopes; prefer waitFor with getBy.',
		guidelineRuleId: 'no-within-findby-on-stale-scope',
	},
	schema: [],
	messages: {
		noWithinFindBy:
			'Avoid within(...).findBy* on potentially stale scopes. Prefer waitFor(() => within(...).getBy*()).',
	},
}

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

function isWithinCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'within'
	)
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				const propertyName = getMemberPropertyName(node.callee)

				if (!propertyName || !/^find(All)?By[A-Z]/.test(propertyName)) {
					return
				}

				if (!isWithinCall(node.callee.object)) {
					return
				}

				context.report({
					node,
					messageId: 'noWithinFindBy',
				})
			},
		}
	},
}

export default rule
