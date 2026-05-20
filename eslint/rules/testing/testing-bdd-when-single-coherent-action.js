// Guideline registry id: testing.bdd.when-single-coherent-action
const meta = {
	type: 'problem',
	docs: {
		description: 'Require When blocks to represent a single coherent action.',
		guidelineRuleId: 'testing.bdd.when-single-coherent-action',
	},
	schema: [],
	messages: {
		whenSingleAction:
			'Each When block should represent a single coherent action.',
	},
}

const AND_REGEX = /\band\b/i

function isWhenCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'When'
	)
}

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

function isWhenDescribeCall(node) {
	if (
		node?.type !== 'CallExpression' ||
		getCallName(node.callee) !== 'describe'
	) {
		return false
	}

	const title = getTitle(node)
	return Boolean(title?.value) && title?.value?.startsWith('When ')
}

function isWhenBlock(node) {
	return isWhenCall(node) || isWhenDescribeCall(node)
}

function getTitle(node) {
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

function getCallback(node) {
	const [, secondArg] = node.arguments
	if (!secondArg) {
		return null
	}
	if (
		secondArg.type === 'FunctionExpression' ||
		secondArg.type === 'ArrowFunctionExpression'
	) {
		return secondArg
	}
	return null
}

function getFirstFunctionArgument(callExpression) {
	if (callExpression?.type !== 'CallExpression') {
		return null
	}

	const [firstArg] = callExpression.arguments
	if (!firstArg) {
		return null
	}

	if (
		firstArg.type === 'FunctionExpression' ||
		firstArg.type === 'ArrowFunctionExpression'
	) {
		return firstArg
	}

	return null
}

function bodyHasMultipleActions(body) {
	if (!body) {
		return false
	}

	if (body.type === 'BlockStatement') {
		if (body.body.length > 1) {
			return true
		}

		if (body.body.length === 1) {
			const statement = body.body[0]
			if (
				statement.type === 'ExpressionStatement' &&
				statement.expression.type === 'SequenceExpression'
			) {
				return true
			}
		}

		return false
	}

	return body.type === 'SequenceExpression'
}

function hasMultipleActions(callback) {
	const body = callback.body

	if (bodyHasMultipleActions(body)) {
		return true
	}

	if (body?.type !== 'BlockStatement') {
		return false
	}

	for (const statement of body.body) {
		if (
			statement.type !== 'ExpressionStatement' ||
			statement.expression.type !== 'CallExpression'
		) {
			continue
		}

		if (getCallName(statement.expression.callee) !== 'beforeEach') {
			continue
		}

		const beforeEachCallback = getFirstFunctionArgument(statement.expression)
		if (beforeEachCallback && bodyHasMultipleActions(beforeEachCallback.body)) {
			return true
		}
	}

	return false
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				if (!isWhenBlock(node)) {
					return
				}

				const title = getTitle(node)
				if (title?.value && AND_REGEX.test(title.value)) {
					context.report({
						node: title.node,
						messageId: 'whenSingleAction',
					})
					return
				}

				const callback = getCallback(node)
				if (!callback) {
					return
				}

				if (!hasMultipleActions(callback)) {
					return
				}

				context.report({
					node: title?.node ?? node,
					messageId: 'whenSingleAction',
				})
			},
		}
	},
}

export default rule
