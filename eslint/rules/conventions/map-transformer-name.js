const MAP_METHODS = new Set(['flatMap', 'map'])

/**
 * Mapping callback and the call it is passed to, or null:
 * arr.map(fn) / arr.flatMap(fn) → fn
 * Array.from(source, fn) → fn
 */
function getMapCallback(node) {
	const { callee } = node

	if (
		callee.type !== 'MemberExpression' ||
		callee.property.type !== 'Identifier'
	) {
		return null
	}

	const methodName = callee.property.name

	if (MAP_METHODS.has(methodName)) {
		return { callback: node.arguments[0], call: `.${methodName}()` }
	}

	if (
		methodName === 'from' &&
		callee.object.type === 'Identifier' &&
		callee.object.name === 'Array'
	) {
		return { callback: node.arguments[1], call: 'Array.from()' }
	}

	return null
}

export const mapTransformerNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				"Require functions passed to .map(), .flatMap() or Array.from() to start with 'to'",
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
			invalidName:
				"Functions passed to {{call}} should start with '{{prefix}}'.",
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const prefix = options.prefix || 'to'

		return {
			CallExpression(node) {
				const match = getMapCallback(node)

				// Ignore inline callbacks:
				// arr.map(x => x.id)
				// arr.map(function(x) {})
				if (match?.callback?.type !== 'Identifier') {
					return
				}

				if (!match.callback.name.startsWith(prefix)) {
					context.report({
						node: match.callback,
						messageId: 'invalidName',
						data: {
							call: match.call,
							prefix,
						},
					})
				}
			},
		}
	},
}
