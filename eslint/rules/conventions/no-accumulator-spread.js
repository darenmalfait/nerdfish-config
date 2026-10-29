import { getMemberPropertyName, isFunctionNode } from '../util.js'

const REDUCE_METHODS = new Set(['reduce', 'reduceRight'])

/** `[...acc]` and `{ ...acc }` copy; `Math.max(...acc)` only reads. */
const COPY_TARGETS = new Set(['ArrayExpression', 'ObjectExpression'])

/** `acc` in `[...acc]` / `{ ...acc }` or `acc.concat(…)`: both copy the whole accumulator. */
function isCopy(reference) {
	const { parent } = reference.identifier

	return (
		(parent.type === 'SpreadElement' && COPY_TARGETS.has(parent.parent.type)) ||
		(parent.type === 'MemberExpression' &&
			parent.object === reference.identifier &&
			getMemberPropertyName(parent) === 'concat' &&
			parent.parent.type === 'CallExpression' &&
			parent.parent.callee === parent)
	)
}

export const noAccumulatorSpreadRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow copying the accumulator on every step of reduce (`...acc`, `acc.concat()`).',
			url: 'https://github.com/Expensify/eslint-config-expensify/blob/main/eslint-plugin-expensify/no-acc-spread-in-reduce.js',
		},

		schema: [],

		messages: {
			noAccumulatorSpread:
				'Copying `{{name}}` on every step makes this reduce O(n²). Build the result directly (`Object.fromEntries(items.map(…))`, `items.map(…)`, `new Map(…)`), or mutate `{{name}}` and return it.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * Object.fromEntries(users.map((user) => [user.id, user])) ✅
		 * users.reduce((byId, user) => { byId[user.id] = user; return byId }, {}) ✅
		 * users.reduce((total, user) => total + user.age, 0) ✅
		 * users.reduce((byId, user) => ({ ...byId, [user.id]: user }), {}) ❌
		 * users.reduce((ids, user) => [...ids, user.id], []) ❌
		 * users.reduce((ids, user) => ids.concat(user.id), []) ❌
		 */
		return {
			CallExpression(node) {
				const [callback] = node.arguments

				if (
					!REDUCE_METHODS.has(getMemberPropertyName(node.callee)) ||
					!isFunctionNode(callback) ||
					callback.params[0]?.type !== 'Identifier'
				) {
					return
				}

				const [accumulator] = context.sourceCode.getDeclaredVariables(callback)
				const copy = accumulator?.references.find(isCopy)

				if (!copy) {
					return
				}

				context.report({
					node: copy.identifier.parent,
					messageId: 'noAccumulatorSpread',
					data: { name: accumulator.name },
				})
			},
		}
	},
}
