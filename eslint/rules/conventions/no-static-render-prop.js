import { isFunctionNode } from '../util.js'

export const noStaticRenderPropRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow render* props whose callback takes no arguments; compose with children instead.',
			guidelineRuleId: 'patterns-children-over-render-props',
		},

		schema: [],

		messages: {
			noStaticRenderProp:
				'`{{attributeName}}` receives nothing from the component, so it is static structure, not a render prop. Compose it as children (e.g. a compound `<Parent.Slot>` component) instead. Render props are for passing data back, like `renderItem={({ item }) => …}`.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * <List renderItem={({ item }) => <Item item={item} />} /> ✅ (passes data back)
		 * <Composer renderHeader={() => <Header />} /> ❌ (static structure)
		 */
		return {
			JSXAttribute(node) {
				if (node.name?.type !== 'JSXIdentifier') {
					return
				}

				const attributeName = node.name.name

				if (!/^render[A-Z]/.test(attributeName)) {
					return
				}

				if (node.value?.type !== 'JSXExpressionContainer') {
					return
				}

				const { expression } = node.value

				if (!isFunctionNode(expression) || expression.params.length > 0) {
					return
				}

				context.report({
					node,
					messageId: 'noStaticRenderProp',
					data: {
						attributeName,
					},
				})
			},
		}
	},
}
