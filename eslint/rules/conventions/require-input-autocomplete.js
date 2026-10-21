/** Input types browsers and password managers can autofill. */
const AUTOFILL_TYPES = new Set(['email', 'password', 'tel'])

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

		docs: {
			description: 'Require autoComplete on email, password and tel inputs.',
			guidelineRuleId: 'web-interface-guidelines.forms',
		},

		schema: [],

		messages: {
			requireAutocomplete:
				'`<input type="{{type}}">` needs `autoComplete` so browsers and password managers fill it correctly (e.g. `email`, `current-password`, `new-password`, `tel`, or `off` for non-personal fields).',
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

				const type = getAttribute(node, 'type')?.value

				if (
					type?.type !== 'Literal' ||
					!AUTOFILL_TYPES.has(type.value) ||
					getAttribute(node, 'autoComplete') ||
					node.attributes.some(
						(attribute) => attribute.type === 'JSXSpreadAttribute',
					)
				) {
					return
				}

				context.report({
					node,
					messageId: 'requireAutocomplete',
					data: { type: type.value },
				})
			},
		}
	},
}
