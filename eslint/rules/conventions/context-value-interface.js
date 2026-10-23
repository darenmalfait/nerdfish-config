import { getJsxElementName } from '../util.js'

const INTERFACE_KEYS = new Set(['state', 'actions', 'meta'])

/** `<ComposerContext>`, legacy `<ComposerContext.Provider>`. */
function isContextElement(elementName) {
	return /Context(\.Provider)?$/.test(elementName ?? '')
}

function toKeyName(property) {
	if (property.computed) {
		return null
	}

	if (property.key.type === 'Identifier') {
		return property.key.name
	}

	return property.key.type === 'Literal' ? String(property.key.value) : null
}

export const contextValueInterfaceRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require context values shaped as `{ state, actions, meta }` so any provider can implement the same interface.',
			guidelineRuleId: 'state-context-interface',
		},

		schema: [],

		messages: {
			contextValueInterface:
				'`<{{elementName}}>` exposes {{keyNames}} directly. Group the value as `{ state, actions, meta }` (e.g. `value={{ state: { input }, actions: { update } }}`) so UI components depend on the interface, and another provider can inject a different implementation. Compound parts then read it with `use(Context)` instead of taking it as props. See vercel-composition-patterns: state-context-interface.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * <ComposerContext value={{ state, actions, meta }}> ✅
		 * <ThemeContext value={theme}> ✅ (not an object literal)
		 * <ComposerContext value={{ input, setInput }}> ❌
		 */
		return {
			JSXOpeningElement(node) {
				const elementName = getJsxElementName(node.name)

				if (!isContextElement(elementName)) {
					return
				}

				const valueAttribute = node.attributes.find(
					(attribute) =>
						attribute.type === 'JSXAttribute' &&
						attribute.name.name === 'value',
				)
				const value = valueAttribute?.value?.expression

				if (value?.type !== 'ObjectExpression') {
					return
				}

				const outsideKeys = value.properties
					.filter((property) => property.type === 'Property')
					.map(toKeyName)
					.filter((name) => name && !INTERFACE_KEYS.has(name))

				if (outsideKeys.length === 0) {
					return
				}

				context.report({
					node: valueAttribute,
					messageId: 'contextValueInterface',
					data: {
						elementName,
						keyNames: outsideKeys.map((name) => `\`${name}\``).join(', '),
					},
				})
			},
		}
	},
}
