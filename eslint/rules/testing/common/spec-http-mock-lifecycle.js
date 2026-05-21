// Guideline registry id: testing.spec.http-mock-lifecycle
import { getCallName, getFirstCallback, walkAst } from '../../util.js'

const LIFECYCLE_HOOKS = {
	beforeAll: 'listen',
	afterEach: 'resetHandlers',
	afterAll: 'close',
}
const HTTP_MOCK_TOUCH_METHODS = new Set([
	'use',
	...Object.values(LIFECYCLE_HOOKS),
])
const DEFAULT_MOCK_SERVER_NAME = 'server'

function getMockServerName(context) {
	const [options] = context.options
	return options?.mockServerName ?? DEFAULT_MOCK_SERVER_NAME
}

function isLifecycleHookCall(node, hookName) {
	return (
		node?.type === 'CallExpression' && getCallName(node.callee) === hookName
	)
}

function isSetupHttpMockCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'setupServer'
	)
}

function isMockServerMethodCall(node, mockServerName, methodName) {
	const callee = node?.callee
	return (
		node?.type === 'CallExpression' &&
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object?.type === 'Identifier' &&
		callee.object.name === mockServerName &&
		callee.property?.type === 'Identifier' &&
		callee.property.name === methodName
	)
}

function usesAnyMockServerMethod(node, mockServerName, methodNames) {
	for (const methodName of methodNames) {
		if (isMockServerMethodCall(node, mockServerName, methodName)) {
			return true
		}
	}
	return false
}

function hookCallbackInvokesMockServerMethod(
	callback,
	mockServerName,
	methodName,
) {
	let isInvoking = false

	walkAst(callback.body, (node) => {
		if (isMockServerMethodCall(node, mockServerName, methodName)) {
			isInvoking = true
			return true
		}
		return false
	})

	return isInvoking
}

export const specHttpMockLifecycleRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Ensure HTTP mock servers are started, reset, and stopped with beforeAll, afterEach, and afterAll.',
			guidelineRuleId: 'testing.spec.http-mock-lifecycle',
		},
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					mockServerName: {
						type: 'string',
						description:
							'Identifier of the HTTP mock server instance (default: server).',
					},
				},
			},
		],
		messages: {
			missingBeforeAll:
				'Add beforeAll/test.beforeAll(() => {{mockServer}}.listen()) to start the HTTP mock server.',
			missingAfterEach:
				'Add afterEach/test.afterEach(() => {{mockServer}}.resetHandlers()) to reset HTTP mock handlers between tests.',
			missingAfterAll:
				'Add afterAll/test.afterAll(() => {{mockServer}}.close()) to stop the HTTP mock server.',
		},
	},
	create(context) {
		const mockServerName = getMockServerName(context)
		const found = {
			beforeAll: false,
			afterEach: false,
			afterAll: false,
		}
		let isUsingHttpMock = false

		return {
			CallExpression(node) {
				if (
					isSetupHttpMockCall(node) ||
					usesAnyMockServerMethod(node, mockServerName, HTTP_MOCK_TOUCH_METHODS)
				) {
					isUsingHttpMock = true
				}

				for (const [hookName, mockMethod] of Object.entries(LIFECYCLE_HOOKS)) {
					if (!isLifecycleHookCall(node, hookName)) {
						continue
					}

					const callback = getFirstCallback(node)
					if (!callback) {
						continue
					}

					if (
						hookCallbackInvokesMockServerMethod(
							callback,
							mockServerName,
							mockMethod,
						)
					) {
						found[hookName] = true
					}
				}
			},
			'Program:exit'(node) {
				if (!isUsingHttpMock) {
					return
				}

				const data = { mockServer: mockServerName }

				if (!found.beforeAll) {
					context.report({ node, messageId: 'missingBeforeAll', data })
				}
				if (!found.afterEach) {
					context.report({ node, messageId: 'missingAfterEach', data })
				}
				if (!found.afterAll) {
					context.report({ node, messageId: 'missingAfterAll', data })
				}
			},
		}
	},
}
