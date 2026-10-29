import { getCallName, getMemberPropertyName, isFunctionNode } from '../util.js'

/** lodash/underscore `isEqual`, fast-deep-equal, dequal, Ramda `equals`, … */
const DEFAULT_FUNCTIONS = [
	'deepEqual',
	'dequal',
	'equal',
	'equals',
	'isDeepEqual',
	'isEqual',
	'isEqualWith',
]

/** `JSON.stringify(…)`: serializing props to compare them is a deep comparison too. */
function isJsonStringify(node) {
	return (
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 'JSON' &&
		getMemberPropertyName(node.callee) === 'stringify'
	)
}

export const noDeepEqualInMemoRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow deep equality checks in `memo` comparison functions; compare the props that matter instead.',
			url: 'https://github.com/Expensify/eslint-config-expensify/blob/main/eslint-plugin-expensify/no-deep-equal-in-memo.js',
		},

		schema: [
			{
				type: 'object',
				properties: {
					functions: {
						type: 'array',
						items: { type: 'string' },
						uniqueItems: true,
						description: `Deep equality helpers to report (default ${DEFAULT_FUNCTIONS.join(', ')}). \`JSON.stringify\` is always reported.`,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			noDeepEqualInMemo:
				'`{{name}}` walks every nested value on each render, which can cost more than the re-render `memo` is saving. Compare only the props that affect the output (`prev.user.id === next.user.id`), or drop the custom comparison.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const functions = new Set(
			context.options[0]?.functions ?? DEFAULT_FUNCTIONS,
		)

		/** Comparison functions passed to `memo`, inline or declared in this file. */
		const comparators = new Set()
		const deepComparisons = []

		/** `arePropsEqual` → its function, when declared in this file. */
		function resolveFunction(node) {
			if (isFunctionNode(node)) {
				return node
			}

			if (node?.type !== 'Identifier') {
				return null
			}

			const definition = sourceCode
				.getScope(node)
				.references.find((reference) => reference.identifier === node)?.resolved
				?.defs[0]

			if (definition?.type === 'FunctionName') {
				return definition.node
			}

			return definition?.type === 'Variable' &&
				isFunctionNode(definition.node.init)
				? definition.node.init
				: null
		}

		function isInsideComparator(node) {
			for (let current = node.parent; current; current = current.parent) {
				if (comparators.has(current)) {
					return true
				}
			}

			return false
		}

		/**
		 * Checks:
		 * memo(UserRow) ✅
		 * memo(UserRow, (prev, next) => prev.user.id === next.user.id) ✅
		 * memo(UserRow, (prev, next) => isEqual(prev, next)) ❌
		 * memo(UserRow, (prev, next) => JSON.stringify(prev) === JSON.stringify(next)) ❌
		 * function arePropsEqual(prev, next) { return _.isEqual(prev, next) }
		 * memo(UserRow, arePropsEqual) ❌
		 */
		return {
			CallExpression(node) {
				if (getCallName(node.callee) === 'memo' && node.arguments.length > 1) {
					const comparator = resolveFunction(node.arguments[1])

					if (comparator) {
						comparators.add(comparator)
					}
				}

				if (isJsonStringify(node)) {
					deepComparisons.push({ node, name: 'JSON.stringify' })
				} else if (functions.has(getCallName(node.callee))) {
					deepComparisons.push({ node, name: sourceCode.getText(node.callee) })
				}
			},
			'Program:exit'() {
				for (const { node, name } of deepComparisons) {
					if (isInsideComparator(node)) {
						context.report({
							node,
							messageId: 'noDeepEqualInMemo',
							data: { name },
						})
					}
				}
			},
		}
	},
}
