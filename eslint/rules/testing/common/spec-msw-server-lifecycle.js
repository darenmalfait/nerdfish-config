// Guideline registry id: testing.spec.msw-server-lifecycle
import { getCallName, getFirstCallback, walkAst } from '../../util.js'

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

const LIFECYCLE_HOOKS = {
	beforeAll: 'listen',
	afterEach: 'resetHandlers',
	afterAll: 'close',
}
const SERVER_TOUCH_METHODS = new Set([
	'use',
	...Object.values(LIFECYCLE_HOOKS),
])

function isLifecycleHookCall(node, hookName) {
	return node?.type === 'CallExpression' && getCallName(node.callee) === hookName
}

function isSetupServerCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'setupServer'
	)
}

function isServerMethodCall(node, methodName) {
	const callee = node?.callee
	return (
		node?.type === 'CallExpression' &&
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object?.type === 'Identifier' &&
		callee.object.name === 'server' &&
		callee.property?.type === 'Identifier' &&
		callee.property.name === methodName
	)
}

function usesAnyServerMethod(node, methodNames) {
	for (const methodName of methodNames) {
		if (isServerMethodCall(node, methodName)) {
			return true
		}
	}
	return false
}

function hookCallbackInvokesServerMethod(callback, methodName) {
	let invokes = false

	walkAst(callback.body, (node) => {
		if (isServerMethodCall(node, methodName)) {
			invokes = true
			return true
		}
		return false
	})

	return invokes
}

const rule = {
	meta,
	create(context) {
		const found = {
			beforeAll: false,
			afterEach: false,
			afterAll: false,
		}
		let usesMsw = false

		return {
			CallExpression(node) {
				if (
					isSetupServerCall(node) ||
					usesAnyServerMethod(node, SERVER_TOUCH_METHODS)
				) {
					usesMsw = true
				}

				for (const [hookName, serverMethod] of Object.entries(
					LIFECYCLE_HOOKS,
				)) {
					if (!isLifecycleHookCall(node, hookName)) {
						continue
					}

					const callback = getFirstCallback(node)
					if (!callback) {
						continue
					}

					if (hookCallbackInvokesServerMethod(callback, serverMethod)) {
						found[hookName] = true
					}
				}
			},
			'Program:exit'(node) {
				if (!usesMsw) {
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
