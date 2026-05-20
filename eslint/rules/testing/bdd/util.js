import {
	getCallName,
	getFirstCallback,
	getSecondCallback,
	resolveStaticStringArg,
	walkAst,
} from '../../util.js'

const NESTED_BDD_SCOPE_CALLS = new Set([
	'describe',
	'it',
	'test',
	'Given',
	'When',
])

export function isDescribeCall(node) {
	return (
		node?.type === 'CallExpression' && getCallName(node.callee) === 'describe'
	)
}

export function isTestCaseCall(node) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const callName = getCallName(node.callee)
	return callName === 'it' || callName === 'test'
}

export function isNamedTestBlock(node) {
	return isDescribeCall(node) || isTestCaseCall(node)
}

export function isHelperCall(node, helperName) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === helperName
	)
}

export function isDescribeTitled(node, titlePrefix) {
	if (!isDescribeCall(node)) {
		return false
	}

	const title = resolveStaticStringArg(node)
	return typeof title?.value === 'string' && title.value.startsWith(titlePrefix)
}

export function isBddScopeBlock(node, { helperName, describeTitlePrefix }) {
	return (
		isHelperCall(node, helperName) ||
		isDescribeTitled(node, describeTitlePrefix)
	)
}

export function getParentDescribe(node) {
	let current = node.parent

	while (current) {
		if (isDescribeCall(current)) {
			return current
		}

		current = current.parent
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
			return (
				statement.type === 'ExpressionStatement' &&
				statement.expression.type === 'SequenceExpression'
			)
		}

		return false
	}

	return body.type === 'SequenceExpression'
}

export function callbackHasMultipleActions(callback) {
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

		const beforeEachCallback = getFirstCallback(statement.expression)
		if (beforeEachCallback && bodyHasMultipleActions(beforeEachCallback.body)) {
			return true
		}
	}

	return false
}

export function containsExpectAssertion(body) {
	let found = false

	walkAst(
		body,
		(node) => {
			if (
				node.type === 'CallExpression' &&
				node.callee?.type === 'Identifier' &&
				node.callee.name === 'expect'
			) {
				found = true
				return true
			}
			return false
		},
		{ omitFunctionArgsForCalls: NESTED_BDD_SCOPE_CALLS },
	)

	return found
}

export function createNoAssertionsInBddBlockRule({
	guidelineRuleId,
	description,
	messageId,
	message,
	helperName,
	describeTitlePrefix,
}) {
	return {
		meta: {
			type: 'problem',
			docs: { description, guidelineRuleId },
			schema: [],
			messages: { [messageId]: message },
		},
		create(context) {
			return {
				CallExpression(node) {
					if (!isBddScopeBlock(node, { helperName, describeTitlePrefix })) {
						return
					}

					const callback = getSecondCallback(node)
					if (!callback?.body) {
						return
					}

					if (!containsExpectAssertion(callback.body)) {
						return
					}

					const title = resolveStaticStringArg(node)
					context.report({
						node: title?.node ?? node,
						messageId,
					})
				},
			}
		},
	}
}
