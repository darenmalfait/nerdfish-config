import { getCallName } from '../../util.js'

const SKIP_ASSERTION_SEARCH_IN_CALLBACKS = new Set([
	'describe',
	'it',
	'test',
	'Given',
	'When',
])

/** `describe(...)` and `test.describe(...)` */
export function isDescribeCall(node) {
	return (
		node?.type === 'CallExpression' && getCallName(node.callee) === 'describe'
	)
}

/** `it(...)`, `test(...)`, and `test.only` / `test.skip` title callbacks */
export function isTestCaseCall(node) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const callName = getCallName(node.callee)
	return callName === 'it' || callName === 'test'
}

export function getStringTitleArgument(node) {
	const [firstArg] = node?.arguments ?? []

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

function isExpectCall(node) {
	return (
		node.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'expect'
	)
}

function isSkippableCallbackArgument(skipFunctionArguments, argument) {
	return (
		skipFunctionArguments &&
		(argument.type === 'FunctionExpression' ||
			argument.type === 'ArrowFunctionExpression')
	)
}

function pushCallExpressionChildren(node, stack, skipFunctionArguments) {
	if (node.callee && typeof node.callee === 'object') {
		stack.push(node.callee)
	}

	for (const argument of node.arguments ?? []) {
		if (isSkippableCallbackArgument(skipFunctionArguments, argument)) {
			continue
		}
		stack.push(argument)
	}
}

function pushAstChildren(node, stack) {
	for (const value of Object.values(node)) {
		if (!value) {
			continue
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === 'object') {
					stack.push(item)
				}
			}
			continue
		}
		if (typeof value === 'object' && typeof value.type === 'string') {
			stack.push(value)
		}
	}
}

export function hasExpectCall(node) {
	const stack = [node]
	const seen = new Set()

	while (stack.length > 0) {
		const current = stack.pop()
		if (!current || typeof current !== 'object') {
			continue
		}
		if (seen.has(current)) {
			continue
		}
		seen.add(current)

		if (isExpectCall(current)) {
			return true
		}

		if (current.type === 'CallExpression') {
			const callName = getCallName(current.callee)
			const skipFunctionArguments = callName
				? SKIP_ASSERTION_SEARCH_IN_CALLBACKS.has(callName)
				: false
			pushCallExpressionChildren(current, stack, skipFunctionArguments)
			continue
		}

		pushAstChildren(current, stack)
	}

	return false
}
