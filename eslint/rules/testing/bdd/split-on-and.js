// Guideline registry id: testing.bdd.split-on-and
const meta = {
	type: 'problem',
	docs: {
		description:
			'Split test descriptions that combine multiple actions with "and".',
		guidelineRuleId: 'testing.bdd.split-on-and',
	},
	schema: [],
	messages: {
		splitOnAnd:
			'Split this test description; avoid combining actions with "and".',
	},
}

const TEST_BLOCK_NAMES = new Set(['describe', 'it', 'test'])
const AND_REGEX = /\band\b/i

function getCallName(callee) {
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

function getTitleArgument(node) {
	const [firstArg] = node.arguments

	if (!firstArg) {
		return null
	}

	if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
		return { value: firstArg.value, node: firstArg }
	}

	if (
		firstArg.type === 'TemplateLiteral' &&
		firstArg.expressions.length === 0 &&
		firstArg.quasis.length === 1
	) {
		return { value: firstArg.quasis[0].value.cooked ?? '', node: firstArg }
	}

	return null
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				const callName = getCallName(node.callee)

				if (!TEST_BLOCK_NAMES.has(callName)) {
					return
				}

				const title = getTitleArgument(node)
				if (!title?.value) {
					return
				}

				if (!AND_REGEX.test(title.value)) {
					return
				}

				context.report({
					node: title.node,
					messageId: 'splitOnAnd',
				})
			},
		}
	},
}

export default rule
