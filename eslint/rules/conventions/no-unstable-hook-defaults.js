import { getCallName } from '../util.js'

const HOOK_NAME = /^use[A-Z]/

/** `[]`, `{}`, `() => {}` and `new Map()` get a new identity every render. */
function getUnstableKind(node) {
	switch (node.type) {
		case 'ArrayExpression':
			return 'array'
		case 'ObjectExpression':
			return 'object'
		case 'ArrowFunctionExpression':
		case 'FunctionExpression':
			return 'function'
		case 'NewExpression':
			return 'instance'
		default:
			return null
	}
}

function getHookName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name
	}

	return fn.parent?.type === 'VariableDeclarator' &&
		fn.parent.id.type === 'Identifier'
		? fn.parent.id.name
		: null
}

/** Every default in a (possibly nested) destructuring pattern or parameter. */
function collectDefaults(pattern, defaults) {
	switch (pattern?.type) {
		case 'AssignmentPattern':
			defaults.push(pattern.right)
			collectDefaults(pattern.left, defaults)
			break
		case 'ObjectPattern':
			for (const property of pattern.properties) {
				collectDefaults(
					property.type === 'RestElement' ? property.argument : property.value,
					defaults,
				)
			}
			break
		case 'ArrayPattern':
			for (const element of pattern.elements) {
				collectDefaults(element, defaults)
			}
			break
		default:
			break
	}

	return defaults
}

export const noUnstableHookDefaultsRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Disallow inline array, object, function or instance defaults in hook parameters and in destructured hook results.',
			url: 'https://github.com/Expensify/eslint-config-expensify/blob/main/eslint-plugin-expensify/no-unstable-hook-defaults.js',
		},

		schema: [],

		messages: {
			unstableDefault:
				'This default {{kind}} is recreated on every render, so anything that depends on it (effects, memos, memoized children) re-runs too. Hoist it to a module-level constant.',
		},
	},

	create(context) {
		function report(defaults) {
			for (const value of defaults) {
				const kind = getUnstableKind(value)

				if (kind) {
					context.report({
						node: value,
						messageId: 'unstableDefault',
						data: { kind },
					})
				}
			}
		}

		function checkHookParams(fn) {
			const name = getHookName(fn)

			if (!name || !HOOK_NAME.test(name)) {
				return
			}

			report(fn.params.flatMap((param) => collectDefaults(param, [])))
		}

		/**
		 * Checks:
		 * const EMPTY_ITEMS: Item[] = []
		 * function useItems({ items = EMPTY_ITEMS }) ✅
		 * const { data = EMPTY_ITEMS } = useQuery() ✅
		 * function useItems({ items = [] }) ❌
		 * function useItems(onChange = () => {}) ❌
		 * const { data = [] } = useQuery() ❌
		 * const [value = {}] = useSomething() ❌
		 */
		return {
			FunctionDeclaration: checkHookParams,
			FunctionExpression: checkHookParams,
			ArrowFunctionExpression: checkHookParams,

			VariableDeclarator(node) {
				if (
					node.init?.type !== 'CallExpression' ||
					!HOOK_NAME.test(getCallName(node.init.callee) ?? '')
				) {
					return
				}

				report(collectDefaults(node.id, []))
			},
		}
	},
}
