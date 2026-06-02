import {
	getCallName,
	getFirstCallback,
	getSecondCallback,
	isFunctionNode,
	resolveStaticStringArg,
	walkAst,
} from '../../util.js'

const NON_TEST_CASE_IT_TEST_MEMBERS = new Set([
	'afterAll',
	'afterEach',
	'beforeAll',
	'beforeEach',
	'describe',
	'extend',
	'step',
	'use',
])

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

	const callee = node.callee

	if (callee?.type === 'Identifier') {
		return callee.name === 'it' || callee.name === 'test'
	}

	if (
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object?.type === 'Identifier'
	) {
		const base = callee.object.name
		if (base !== 'it' && base !== 'test') {
			return false
		}

		const member =
			callee.property?.type === 'Identifier' ? callee.property.name : null
		if (!member || NON_TEST_CASE_IT_TEST_MEMBERS.has(member)) {
			return false
		}

		return true
	}

	return false
}

export function isInsideTestCaseCallback(node) {
	let current = node.parent

	while (current) {
		if (isFunctionNode(current)) {
			const parent = current.parent
			if (
				parent?.type === 'CallExpression' &&
				isTestCaseCall(parent) &&
				getSecondCallback(parent) === current
			) {
				return true
			}
		}

		current = current.parent
	}

	return false
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

const LIFECYCLE_HOOK_CALLS = new Set([
	'afterAll',
	'afterEach',
	'beforeAll',
	'beforeEach',
])

function getExpressionStatementCallExpression(statement) {
	if (statement?.type !== 'ExpressionStatement') {
		return null
	}

	let expression = statement.expression
	if (expression?.type === 'AwaitExpression') {
		expression = expression.argument
	}

	return expression?.type === 'CallExpression' ? expression : null
}

export function isBeforeEachCallStatement(statement) {
	const callExpression = getExpressionStatementCallExpression(statement)
	if (!callExpression) {
		return false
	}

	return getCallName(callExpression.callee) === 'beforeEach'
}

export function scopeBlockHasBeforeEach(callback) {
	const body = callback?.body
	if (body?.type !== 'BlockStatement') {
		return false
	}

	return body.body.some(isBeforeEachCallStatement)
}

function isTestHarnessStatement(statement) {
	const callExpression = getExpressionStatementCallExpression(statement)
	if (!callExpression) {
		return false
	}

	if (
		isDescribeCall(callExpression) ||
		isTestCaseCall(callExpression) ||
		isHelperCall(callExpression, 'Given') ||
		isHelperCall(callExpression, 'When')
	) {
		return true
	}

	const callName = getCallName(callExpression.callee)
	return callName !== null && LIFECYCLE_HOOK_CALLS.has(callName)
}

function bodyHasMultipleActions(body, { excludeTestHarness = false } = {}) {
	if (!body) {
		return false
	}

	if (body.type === 'BlockStatement') {
		const statements = excludeTestHarness
			? body.body.filter((statement) => !isTestHarnessStatement(statement))
			: body.body

		if (statements.length > 1) {
			return true
		}

		if (statements.length === 1) {
			const statement = statements[0]
			return (
				statement.type === 'ExpressionStatement' &&
				statement.expression.type === 'SequenceExpression'
			)
		}

		return false
	}

	return body.type === 'SequenceExpression'
}

export function callbackHasMultipleActions(
	callback,
	{ excludeTestHarness = false } = {},
) {
	const body = callback.body

	if (bodyHasMultipleActions(body, { excludeTestHarness })) {
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
	let isFound = false

	walkAst(
		body,
		(node) => {
			if (
				node.type === 'CallExpression' &&
				node.callee?.type === 'Identifier' &&
				node.callee.name === 'expect'
			) {
				isFound = true
				return true
			}
			return false
		},
		{ omitFunctionArgsForCalls: NESTED_BDD_SCOPE_CALLS },
	)

	return isFound
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
