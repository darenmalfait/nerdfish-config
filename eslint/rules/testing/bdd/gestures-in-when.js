// Guideline registry id: testing.bdd.gestures-in-when
import { getCallName, getMemberPropertyName } from '../../util.js'
import { getNearestTestBlock, isTestCaseCall } from './util.js'

const USER_EVENT_OBJECTS = new Set(['user', 'userEvent'])

function isUserEventGesture(node) {
	const callee = node.callee
	return (
		callee?.type === 'MemberExpression' &&
		callee.object?.type === 'Identifier' &&
		USER_EVENT_OBJECTS.has(callee.object.name) &&
		getMemberPropertyName(callee) !== 'setup'
	)
}

function isFireEventCall(node) {
	const callee = node.callee
	return (
		getCallName(callee) === 'fireEvent' ||
		(callee?.type === 'MemberExpression' &&
			callee.object?.type === 'Identifier' &&
			callee.object.name === 'fireEvent')
	)
}

export const bddGesturesInWhenRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require userEvent gestures to live in When blocks, not it/test, and forbid fireEvent.',
			guidelineRuleId: 'testing.bdd.gestures-in-when',
		},
		schema: [],
		messages: {
			gestureInWhen:
				'Move this userEvent gesture from the it/test block into a When block beforeEach.',
			noFireEvent: 'Use userEvent instead of fireEvent to simulate the user.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (isFireEventCall(node)) {
					context.report({ node, messageId: 'noFireEvent' })
					return
				}

				if (
					isUserEventGesture(node) &&
					isTestCaseCall(getNearestTestBlock(node))
				) {
					context.report({ node, messageId: 'gestureInWhen' })
				}
			},
		}
	},
}
