import { getCallName, isFunctionNode } from '../util.js'

const TS_WRAPPERS = new Set([
	'TSAsExpression',
	'TSNonNullExpression',
	'TSSatisfiesExpression',
])

/**
 * True when evaluating the expression cannot allocate or run user code
 * (beyond property getters): no calls, `new`, or object/array/function/regex
 * literals. Its result is then a primitive or an existing reference, so
 * memoizing it never saves work.
 */
function isTrivialExpression(node) {
	if (!node) {
		return false
	}

	if (TS_WRAPPERS.has(node.type)) {
		return isTrivialExpression(node.expression)
	}

	switch (node.type) {
		case 'Identifier':
		case 'ThisExpression':
			return true
		case 'Literal':
			return !node.regex
		case 'TemplateLiteral':
			return node.expressions.every(isTrivialExpression)
		case 'ChainExpression':
			return isTrivialExpression(node.expression)
		case 'MemberExpression':
			return (
				isTrivialExpression(node.object) &&
				(!node.computed || isTrivialExpression(node.property))
			)
		case 'UnaryExpression':
			return node.operator !== 'delete' && isTrivialExpression(node.argument)
		case 'BinaryExpression':
		case 'LogicalExpression':
			return isTrivialExpression(node.left) && isTrivialExpression(node.right)
		case 'ConditionalExpression':
			return (
				isTrivialExpression(node.test) &&
				isTrivialExpression(node.consequent) &&
				isTrivialExpression(node.alternate)
			)
		default:
			return false
	}
}

/** The single returned expression of `() => expr` or `() => { return expr }`. */
function getReturnedExpression(callback) {
	if (callback.body.type !== 'BlockStatement') {
		return callback.body
	}

	const [statement] = callback.body.body

	return callback.body.body.length === 1 &&
		statement.type === 'ReturnStatement'
		? statement.argument
		: null
}

export const noTrivialUseMemoRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow useMemo around expressions that cannot allocate or call anything.',
			guidelineRuleId: 'rerender-simple-expression-in-memo',
		},

		schema: [],

		messages: {
			noTrivialUseMemo:
				'This `useMemo` returns an expression without calls or new objects, so its result is a primitive or an existing reference: memoizing it costs more than computing it. Compute it inline during render.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * useMemo(() => items.filter(isActive), [items]) ✅ (call)
		 * useMemo(() => ({ id, name }), [id, name]) ✅ (new object)
		 * useMemo(() => user.isLoading || notifications.isLoading, […]) ❌
		 * useMemo(() => `${first} ${last}`, [first, last]) ❌
		 */
		return {
			CallExpression(node) {
				if (getCallName(node.callee) !== 'useMemo') {
					return
				}

				const [callback] = node.arguments

				if (!isFunctionNode(callback) || callback.async) {
					return
				}

				if (!isTrivialExpression(getReturnedExpression(callback))) {
					return
				}

				context.report({
					node,
					messageId: 'noTrivialUseMemo',
				})
			},
		}
	},
}
