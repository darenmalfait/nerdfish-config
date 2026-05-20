// Guideline registry id: no-translation-literal-assertions
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow translated literal assertions; prefer translation keys or semantic queries.',
		guidelineRuleId: 'no-translation-literal-assertions',
	},
	schema: [],
	messages: {
		noTranslationLiteral:
			'Avoid asserting translated literal text via {{queryName}}. Prefer translation keys or semantic queries instead.',
	},
}

function getMemberPropertyName(callee) {
	if (
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name
	}

	return null
}

function isLikelyTranslationKey(value) {
	return /^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value)
}

function getStaticStringValue(node) {
	if (node?.type === 'Literal' && typeof node.value === 'string') {
		return node.value.trim()
	}

	if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
		return node.quasis
			.map((quasi) => quasi.value.cooked ?? '')
			.join('')
			.trim()
	}

	return null
}

function getObjectProperty(objectExpression, propertyName) {
	if (objectExpression?.type !== 'ObjectExpression') {
		return null
	}

	return (
		objectExpression.properties.find((property) => {
			if (property.type !== 'Property' || property.computed) {
				return false
			}

			if (property.key.type === 'Identifier') {
				return property.key.name === propertyName
			}

			return (
				property.key.type === 'Literal' && property.key.value === propertyName
			)
		}) ?? null
	)
}

const TEXT_QUERY_NAMES = new Set([
	'findAllByText',
	'findByText',
	'getAllByText',
	'getByText',
	'queryAllByText',
	'queryByText',
])
const ROLE_QUERY_NAMES = new Set([
	'findAllByRole',
	'findByRole',
	'getAllByRole',
	'getByRole',
	'queryAllByRole',
	'queryByRole',
])

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				const queryName = getMemberPropertyName(node.callee)

				if (!TEXT_QUERY_NAMES.has(queryName)) {
					if (!ROLE_QUERY_NAMES.has(queryName)) {
						return
					}

					const [, optionsArg] = node.arguments
					const nameProperty = getObjectProperty(optionsArg, 'name')
					const value = getStaticStringValue(nameProperty?.value)
					if (!value || isLikelyTranslationKey(value)) {
						return
					}

					context.report({
						node: nameProperty.value,
						messageId: 'noTranslationLiteral',
						data: { queryName },
					})
					return
				}

				const [firstArg] = node.arguments
				const value = getStaticStringValue(firstArg)
				if (!value || isLikelyTranslationKey(value)) {
					return
				}

				context.report({
					node: firstArg,
					messageId: 'noTranslationLiteral',
					data: { queryName },
				})
			},
		}
	},
}

export default rule
