export const mapTransformerNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description: "Require functions passed to .map() to start with 'to'",
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
			invalidName: "Functions passed to .map() should start with '{{prefix}}'.",
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const prefix = options.prefix || 'to'

		return {
			CallExpression(node) {
				// Ensure this is: something.map(...)
				if (
					node.callee.type !== 'MemberExpression' ||
					node.callee.property.type !== 'Identifier' ||
					node.callee.property.name !== 'map'
				) {
					return
				}

				const firstArg = node.arguments[0]

				// Ignore inline callbacks:
				// arr.map(x => x.id)
				// arr.map(function(x) {})
				if (!firstArg || firstArg.type !== 'Identifier') {
					return
				}

				const functionName = firstArg.name

				if (!functionName.startsWith(prefix)) {
					context.report({
						node: firstArg,
						messageId: 'invalidName',
						data: {
							prefix,
						},
					})
				}
			},
		}
	},
}
