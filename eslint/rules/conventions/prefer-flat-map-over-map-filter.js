import { getMemberPropertyName } from '../util.js'

export const preferFlatMapOverMapFilterRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description: 'Prefer .flatMap() over .map(…).filter(Boolean).',
			guidelineRuleId: 'js-flatmap-filter',
		},

		schema: [],

		messages: {
			preferFlatMap:
				'`.map(…).filter(Boolean)` builds an intermediate array, iterates twice, and does not narrow the type. Use `.flatMap((item) => (keep ? [value] : []))`.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * users.flatMap((user) => (user.isActive ? [user.name] : [])) ✅
		 * users.map(toName).filter(isPresent) ✅ (named predicate)
		 * users.map((user) => (user.isActive ? user.name : null)).filter(Boolean) ❌
		 */
		return {
			CallExpression(node) {
				if (getMemberPropertyName(node.callee) !== 'filter') {
					return
				}

				const [predicate] = node.arguments

				if (
					node.arguments.length !== 1 ||
					predicate.type !== 'Identifier' ||
					predicate.name !== 'Boolean'
				) {
					return
				}

				const receiver = node.callee.object

				if (
					receiver.type !== 'CallExpression' ||
					getMemberPropertyName(receiver.callee) !== 'map'
				) {
					return
				}

				context.report({
					node: node.callee.property,
					messageId: 'preferFlatMap',
				})
			},
		}
	},
}
