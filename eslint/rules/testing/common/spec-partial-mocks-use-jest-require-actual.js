// Guideline registry id: testing.spec.partial-mocks.use-jest-require-actual
import {
	factoryReturnsNonEmptyObject,
	factoryUsesJestRequireActual,
	getSecondCallback,
	isJestMemberCall,
} from './util.js'

export const specPartialMocksUseJestRequireActualRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require jest.requireActual() when creating partial mocks.',
			guidelineRuleId: 'testing.spec.partial-mocks.use-jest-require-actual',
		},
		schema: [],
		messages: {
			useJestRequireActual:
				'Use jest.requireActual() inside partial mocks before overriding specific exports.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (!isJestMemberCall(node, 'mock')) {
					return
				}

				const factory = getSecondCallback(node)
				if (!factory || !factoryReturnsNonEmptyObject(factory)) {
					return
				}

				if (factoryUsesJestRequireActual(factory)) {
					return
				}

				context.report({
					node: node.arguments[1] ?? node,
					messageId: 'useJestRequireActual',
				})
			},
		}
	},
}
