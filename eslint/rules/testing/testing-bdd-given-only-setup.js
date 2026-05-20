// Guideline registry id: testing.bdd.given-only-setup
import { hasExpectCall } from './util.js'
const meta = {
	type: 'problem',
	docs: {
		description: 'Ensure Given blocks are used for setup only, not assertions.',
		guidelineRuleId: 'testing.bdd.given-only-setup',
	},
	schema: [],
	messages: {
		givenOnlySetup:
			'Use Given blocks for setup only; move assertions to it/test blocks.',
	},
}

function isGivenCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'Given'
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

function isGivenDescribeCall(node) {
	if (
		node?.type !== 'CallExpression' ||
		getCallName(node.callee) !== 'describe'
	) {
		return false
	}

	const title = getTitle(node)
	return typeof title === 'string' && title.startsWith('Given ')
}

function isGivenBlock(node) {
	return isGivenCall(node) || isGivenDescribeCall(node)
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
				if (!isGivenBlock(node)) {
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
					messageId: 'givenOnlySetup',
				})
			},
		}
	},
}

export default rule
