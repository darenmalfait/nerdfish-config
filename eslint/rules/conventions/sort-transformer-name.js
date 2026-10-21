const SORT_METHODS = new Set(['sort', 'toSorted'])

export const sortTransformerNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require comparator functions passed to .sort() / .toSorted() to start with by.',
			guidelineRuleId: 'sort-comparator-prefix',
		},

		schema: [
			{
				type: 'object',
				properties: {
					prefix: {
						type: 'string',
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			comparatorPrefix:
				"Comparator functions passed to .{{method}}() should start with '{{prefix}}'.",
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const prefix = options.prefix || 'by'

		return {
			CallExpression(node) {
				/**
				 * Match:
				 * array.sort(...)
				 * array.toSorted(...)
				 */
				if (
					node.callee.type !== 'MemberExpression' ||
					node.callee.property.type !== 'Identifier' ||
					!SORT_METHODS.has(node.callee.property.name)
				) {
					return
				}

				const firstArg = node.arguments[0]

				// Ignore:
				// arr.sort()
				if (!firstArg) {
					return
				}

				// Ignore inline comparators:
				// arr.sort((a, b) => ...)
				// arr.sort(function(a, b) {})
				if (
					firstArg.type === 'ArrowFunctionExpression' ||
					firstArg.type === 'FunctionExpression'
				) {
					return
				}

				// Only validate named identifiers:
				// arr.sort(byName)
				if (firstArg.type !== 'Identifier') {
					return
				}

				const comparatorName = firstArg.name

				if (!comparatorName.startsWith(prefix)) {
					context.report({
						node: firstArg,
						messageId: 'comparatorPrefix',
						data: {
							method: node.callee.property.name,
							prefix,
						},
					})
				}
			},
		}
	},
}
