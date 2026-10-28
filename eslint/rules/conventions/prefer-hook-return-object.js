import { isFunctionNode } from '../util.js'

const HOOK_NAME = /^use[A-Z]/

/** `useState` style pairs read fine positionally; past that callers start counting. */
const MAX_TUPLE_LENGTH = 2

function getFunctionName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name
	}

	return fn.parent?.type === 'VariableDeclarator' &&
		fn.parent.id.type === 'Identifier'
		? fn.parent.id.name
		: null
}

function getEnclosingFunction(node) {
	for (let current = node.parent; current; current = current.parent) {
		if (isFunctionNode(current) || current.type === 'FunctionDeclaration') {
			return current
		}
	}

	return null
}

/** `[a, b, c] as const` → `[a, b, c]`. */
function unwrapTypeAssertion(node) {
	return node?.type === 'TSAsExpression' ||
		node?.type === 'TSSatisfiesExpression'
		? unwrapTypeAssertion(node.expression)
		: node
}

export const preferHookReturnObjectRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description: `Require hooks returning more than ${MAX_TUPLE_LENGTH} values to return an object instead of a tuple.`,
			url: 'https://github.com/Shopify/web-configs/blob/main/packages/eslint-plugin/docs/rules/react-hooks-strict-return.md',
		},

		schema: [],

		messages: {
			preferObject: `\`{{name}}\` returns a {{length}}-item tuple. Past ${MAX_TUPLE_LENGTH} items callers have to remember positions and skip unused ones with holes; return an object so they can destructure by name.`,
		},
	},

	create(context) {
		function check(fn, returned) {
			const name = getFunctionName(fn)
			const array = unwrapTypeAssertion(returned)

			if (
				!name ||
				!HOOK_NAME.test(name) ||
				array?.type !== 'ArrayExpression' ||
				array.elements.length <= MAX_TUPLE_LENGTH
			) {
				return
			}

			context.report({
				node: array,
				messageId: 'preferObject',
				data: { name, length: array.elements.length },
			})
		}

		/**
		 * Checks:
		 * function useToggle() { return [isOn, toggle] as const } ✅
		 * function useForm() { return { values, errors, submit } } ✅
		 * function useForm() { return [values, errors, submit] } ❌
		 */
		return {
			ReturnStatement(node) {
				const fn = getEnclosingFunction(node)

				if (fn) {
					check(fn, node.argument)
				}
			},

			ArrowFunctionExpression(node) {
				if (node.expression) {
					check(node, node.body)
				}
			},
		}
	},
}
