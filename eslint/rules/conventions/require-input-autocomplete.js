/** Input types browsers and password managers can autofill, with the autoComplete values that fit them. */
const AUTOCOMPLETE_BY_TYPE = new Map([
	['email', ['email']],
	['password', ['current-password', 'new-password']],
	['tel', ['tel']],
])

function getAttribute(openingElement, name) {
	return openingElement.attributes.find(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === name,
	)
}

export const requireInputAutocompleteRule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		hasSuggestions: true,

		docs: {
			description: 'Require autoComplete on email, password and tel inputs.',
			guidelineRuleId: 'web-interface-guidelines.forms',
		},

		schema: [],

		messages: {
			requireAutocomplete:
				'`<input type="{{type}}">` needs `autoComplete` so browsers and password managers fill it correctly (e.g. `email`, `current-password`, `new-password`, `tel`, or `off` for non-personal fields).',
			addAutocomplete: 'Add `autoComplete="{{value}}"`.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * <input type="email" autoComplete="email" /> ✅
		 * <input type="password" autoComplete="new-password" /> ✅
		 * <input type="text" /> ✅
		 * <input type="email" {...field} /> ✅ (spread may carry it)
		 * <input type="email" /> ❌
		 */
		return {
			JSXOpeningElement(node) {
				if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'input') {
					return
				}

				const typeAttribute = getAttribute(node, 'type')
				const type = typeAttribute?.value

				if (
					type?.type !== 'Literal' ||
					!AUTOCOMPLETE_BY_TYPE.has(type.value) ||
					getAttribute(node, 'autoComplete') ||
					node.attributes.some(
						(attribute) => attribute.type === 'JSXSpreadAttribute',
					)
				) {
					return
				}

				const values = AUTOCOMPLETE_BY_TYPE.get(type.value)
				const addAutocomplete = (value) => (fixer) =>
					fixer.insertTextAfter(typeAttribute, ` autoComplete="${value}"`)

				// One fitting value is fixed; a password could be either, so the author picks.
				context.report({
					node,
					messageId: 'requireAutocomplete',
					data: { type: type.value },
					fix: values.length === 1 ? addAutocomplete(values[0]) : null,
					suggest:
						values.length > 1
							? values.map((value) => ({
									messageId: 'addAutocomplete',
									data: { value },
									fix: addAutocomplete(value),
								}))
							: [],
				})
			},
		}
	},
}
