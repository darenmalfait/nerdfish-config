// Guideline registry id: testing.bdd.when-no-assertions
import { hasExpectCall } from './util.js'
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow assertions inside When blocks; keep them in it blocks.',
		guidelineRuleId: 'testing.bdd.when-no-assertions',
	},
	schema: [],
	messages: {
		whenNoAssertions:
			'Avoid assertions inside When blocks; keep assertions inside it/test blocks.',
	},
}

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

function getTitle(node) {
	const [firstArg] = node.arguments
	if (!firstArg) {
		return null
	}

	if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
		return firstArg.value
	}

	if (
		firstArg.type === 'TemplateLiteral' &&
		firstArg.expressions.length === 0 &&
		firstArg.quasis.length === 1
	) {
		return firstArg.quasis[0].value.cooked ?? null
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
	return typeof title === 'string' && title.startsWith('When ')
}

function isWhenBlock(node) {
	return isWhenCall(node) || isWhenDescribeCall(node)
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

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				if (!isWhenBlock(node)) {
					return
				}

				const callback = getCallback(node)
				if (!callback) {
					return
				}

				const body = callback.body
				if (!body) {
					return
				}

				if (!hasExpectCall(body)) {
					return
				}

				context.report({
					node: node.arguments[0] ?? node,
					messageId: 'whenNoAssertions',
				})
			},
		}
	},
}

export default rule
