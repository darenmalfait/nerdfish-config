// Guideline registry id: testing.bdd.expect-only-in-test-case
import { isInsideTestCaseCallback } from './util.js'

export const bddExpectOnlyInTestCaseRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require expect() calls to live inside it/test callbacks only.',
			guidelineRuleId: 'testing.bdd.expect-only-in-test-case',
		},
		schema: [],
		messages: {
			expectOnlyInTestCase:
				'Keep assertions inside it/test blocks only (not describe, Given, When, or hooks).',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee?.type !== 'Identifier' ||
					node.callee.name !== 'expect'
				) {
					return
				}

				if (isInsideTestCaseCallback(node)) {
					return
				}

				context.report({
					node,
					messageId: 'expectOnlyInTestCase',
				})
			},
		}
	},
}
