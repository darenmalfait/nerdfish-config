import { getMemberPropertyName } from '../util.js'

/** `Object.keys(obj)` → `obj`, else null. */
function getKeysTarget(node) {
	const [target] = node?.arguments ?? []

	return node?.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 'Object' &&
		getMemberPropertyName(node.callee) === 'keys' &&
		node.arguments.length === 1 &&
		target.type !== 'SpreadElement'
		? target
		: null
}

export const noObjectKeysIncludesRule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',

		docs: {
			description:
				'Disallow `Object.keys(obj).includes(key)`; use `Object.hasOwn(obj, key)`.',
			url: 'https://github.com/Expensify/eslint-config-expensify/blob/main/eslint-plugin-expensify/no-object-keys-includes.js',
		},

		schema: [],

		messages: {
			noObjectKeysIncludes:
				'`Object.keys(…).includes(…)` builds an array of every key to look up one (O(n)). Use `Object.hasOwn({{object}}, {{key}})` instead (O(1)).',
		},
	},

	create(context) {
		const { sourceCode } = context

		/**
		 * Checks:
		 * Object.hasOwn(labels, status) ✅
		 * Object.values(labels).includes(label) ✅
		 * Object.keys(labels).includes(status) ❌
		 */
		return {
			CallExpression(node) {
				const target = getKeysTarget(node.callee.object)
				const [key] = node.arguments

				if (
					!target ||
					getMemberPropertyName(node.callee) !== 'includes' ||
					node.arguments.length !== 1 ||
					key.type === 'SpreadElement'
				) {
					return
				}

				const object = sourceCode.getText(target)
				const keyText = sourceCode.getText(key)
				const isFixable =
					!node.optional &&
					!node.callee.optional &&
					sourceCode.getCommentsInside(node).length === 0

				context.report({
					node,
					messageId: 'noObjectKeysIncludes',
					data: { object, key: keyText },
					fix: isFixable
						? (fixer) =>
								fixer.replaceText(node, `Object.hasOwn(${object}, ${keyText})`)
						: null,
				})
			},
		}
	},
}
