// Guideline registry id: no-translation-literal-assertions
import {
	getMemberPropertyName,
	getObjectProperty,
	isLikelyTranslationKey,
	resolveStaticStringValue,
} from './util.js'

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

export const noTranslationLiteralAssertionsRule = {
	meta: {
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
	},
	create(context) {
		return {
			CallExpression(node) {
				const queryName = getMemberPropertyName(node.callee)

				if (ROLE_QUERY_NAMES.has(queryName)) {
					const [, optionsArg] = node.arguments
					const nameProperty = getObjectProperty(optionsArg, 'name')
					const value = resolveStaticStringValue(nameProperty?.value, {
						trim: true,
					})
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

				if (!TEXT_QUERY_NAMES.has(queryName)) {
					return
				}

				const [firstArg] = node.arguments
				const value = resolveStaticStringValue(firstArg, { trim: true })
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
