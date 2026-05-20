// Guideline registry id: testing.spec.msw-server-lifecycle
import { getCallName } from './util.js'

const meta = {
	type: 'problem',
	docs: {
		description:
			'Ensure MSW server lifecycle hooks are set with beforeAll/afterEach/afterAll.',
		guidelineRuleId: 'testing.spec.msw-server-lifecycle',
	},
	schema: [],
	messages: {
		missingBeforeAll:
			'Add beforeAll/test.beforeAll(() => server.listen()) to set up the MSW server.',
		missingAfterEach:
			'Add afterEach/test.afterEach(() => server.resetHandlers()) to reset MSW handlers.',
		missingAfterAll:
			'Add afterAll/test.afterAll(() => server.close()) to shut down the MSW server.',
	},
}

const LIFECYCLE_METHODS = {
	beforeAll: 'listen',
	afterEach: 'resetHandlers',
	afterAll: 'close',
}
const SERVER_USAGE_METHODS = new Set([
	'use',
	...Object.values(LIFECYCLE_METHODS),
])

function isLifecycleCall(node, name) {
	return node?.type === 'CallExpression' && getCallName(node.callee) === name
}

function isSetupServerCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'setupServer'
	)
}

function getCallback(node) {
	const [firstArg] = node.arguments
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

function isServerMethodCall(node, methodName) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const callee = node.callee
	if (callee?.type !== 'MemberExpression' || callee.computed) {
		return false
	}

	return (
		callee.object?.type === 'Identifier' &&
		callee.object.name === 'server' &&
		callee.property?.type === 'Identifier' &&
		callee.property.name === methodName
	)
}

function isAnyServerMethodCall(node, methodNames) {
	if (methodNames.size === 0) {
		return false
	}

	for (const methodName of methodNames) {
		if (isServerMethodCall(node, methodName)) {
			return true
		}
	}

	return false
}

function enqueueTraversalTargets(stack, value) {
	if (!value) {
		return
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			if (item && typeof item === 'object') {
				stack.push(item)
			}
		}
		return
	}

	if (
		typeof value === 'object' &&
		typeof value.type === 'string'
	) {
		stack.push(value)
	}
}

function callbackContainsServerCall(callback, methodName) {
	const stack = [callback.body]
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

		if (isServerMethodCall(current, methodName)) {
			return true
		}

		for (const value of Object.values(current)) {
			enqueueTraversalTargets(stack, value)
		}
	}

	return false
}

const rule = {
	meta,
	create(context) {
		const found = {
			beforeAll: false,
			afterEach: false,
			afterAll: false,
		}
		let hasMsw = false

		return {
			CallExpression(node) {
				if (
					isSetupServerCall(node) ||
					isAnyServerMethodCall(node, SERVER_USAGE_METHODS)
				) {
					hasMsw = true
				}

				for (const [lifecycle, method] of Object.entries(LIFECYCLE_METHODS)) {
					if (!isLifecycleCall(node, lifecycle)) {
						continue
					}

					const callback = getCallback(node)
					if (!callback) {
						return
					}

					if (callbackContainsServerCall(callback, method)) {
						found[lifecycle] = true
					}
				}
			},
			'Program:exit'(node) {
				if (!hasMsw) {
					return
				}

				if (!found.beforeAll) {
					context.report({ node, messageId: 'missingBeforeAll' })
				}
				if (!found.afterEach) {
					context.report({ node, messageId: 'missingAfterEach' })
				}
				if (!found.afterAll) {
					context.report({ node, messageId: 'missingAfterAll' })
				}
			},
		}
	},
}

export default rule
