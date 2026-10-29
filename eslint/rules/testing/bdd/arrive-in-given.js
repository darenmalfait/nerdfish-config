// Guideline registry id: testing.bdd.arrive-in-given
import { getMockServerName, mockServerNameSchema } from '../../util.js'

import { getNearestTestBlock, isArriveCall, isGivenBlock } from './util.js'

export const bddArriveInGivenRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require render, goto, visit, and server.use calls to live in a Given block, because they define the scenario.',
			guidelineRuleId: 'testing.bdd.arrive-in-given',
		},
		schema: mockServerNameSchema,
		messages: {
			arriveInGiven:
				'Move this call into a Given block (or its beforeEach); rendering, navigation, and network mocks define the scenario.',
		},
	},
	create(context) {
		const mockServerName = getMockServerName(context)

		return {
			CallExpression(node) {
				if (!isArriveCall(node, mockServerName)) {
					return
				}

				// Bodies of helpers declared outside any test block are not checked here.
				const block = getNearestTestBlock(node)
				if (!block || isGivenBlock(block)) {
					return
				}

				context.report({ node, messageId: 'arriveInGiven' })
			},
		}
	},
}
