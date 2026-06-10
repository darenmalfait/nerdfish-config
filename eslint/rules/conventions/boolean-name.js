export const booleanNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description: 'Require boolean variables to use approved prefixes.',
			guidelineRuleId: 'boolean-prefix',
		},

		schema: [
			{
				type: 'object',
				properties: {
					prefixes: {
						type: 'array',
						items: {
							type: 'string',
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			booleanPrefix:
				"Boolean variable '{{name}}' should start with one of: {{prefixes}}.",
		},
	},

	create(context) {
		const options = context.options[0] || {}

		const prefixes = options.prefixes || ['is', 'has', 'can', 'should']

		/** Methods that conventionally return boolean (e.g. `str.includes()`, `set.has()`). */
		const booleanMemberMethods = new Set([
			'every',
			'has',
			'hasOwn',
			'hasOwnProperty',
			'includes',
			'isPrototypeOf',
			'some',
			'startsWith',
			'endsWith',
			'test',
		])

		function hasAllowedPrefix(name) {
			return prefixes.some((prefix) => name.startsWith(prefix))
		}

		function isBooleanExpression(node) {
			if (!node) {
				return false
			}

			switch (node.type) {
				case 'Literal':
					return typeof node.value === 'boolean'

				case 'UnaryExpression':
					return node.operator === '!'

				case 'BinaryExpression':
					return [
						'===',
						'!==',
						'==',
						'!=',
						'>',
						'<',
						'>=',
						'<=',
						'instanceof',
						'in',
					].includes(node.operator)

				case 'LogicalExpression':
					if (node.operator === '&&') {
						return (
							isBooleanExpression(node.left) && isBooleanExpression(node.right)
						)
					}

					return (
						isBooleanExpression(node.left) || isBooleanExpression(node.right)
					)

				case 'CallExpression': {
					if (node.callee.type !== 'MemberExpression') {
						return false
					}

					const { property } = node.callee

					if (property.type === 'Identifier') {
						return (
							booleanMemberMethods.has(property.name) ||
							/^is[A-Z]/.test(property.name)
						)
					}

					return false
				}

				case 'ConditionalExpression':
					return (
						isBooleanExpression(node.consequent) &&
						isBooleanExpression(node.alternate)
					)

				default:
					return false
			}
		}

		return {
			VariableDeclarator(node) {
				/**
				 * Ensure:
				 * const isActive = ...
				 */
				if (!node.id || node.id.type !== 'Identifier') {
					return
				}

				const variableName = node.id.name

				// Ignore variables without initializer
				if (!node.init) {
					return
				}

				// Only care about obvious boolean expressions
				if (!isBooleanExpression(node.init)) {
					return
				}

				if (!hasAllowedPrefix(variableName)) {
					context.report({
						node: node.id,
						messageId: 'booleanPrefix',
						data: {
							name: variableName,
							prefixes: prefixes.join(', '),
						},
					})
				}
			},
		}
	},
}
