function hasAttribute(openingElement, name) {
	return openingElement.attributes.some(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === name,
	)
}

export const requireImgDimensionsRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description: 'Require explicit width and height on <img>.',
			guidelineRuleId: 'web-interface-guidelines.images',
		},

		schema: [],

		messages: {
			requireDimensions:
				'`<img>` without {{missing}} shifts the layout when it loads. Set both `width` and `height` (CSS can still scale it), or use your framework image component.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * <img src="/a.png" alt="" width={24} height={24} /> ✅
		 * <img {...props} /> ✅ (spread may carry them)
		 * <Image src="/a.png" fill /> ✅ (framework component)
		 * <img src="/a.png" alt="" /> ❌
		 */
		return {
			JSXOpeningElement(node) {
				if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'img') {
					return
				}

				if (
					node.attributes.some(
						(attribute) => attribute.type === 'JSXSpreadAttribute',
					)
				) {
					return
				}

				const missing = ['width', 'height'].filter(
					(name) => !hasAttribute(node, name),
				)

				if (missing.length === 0) {
					return
				}

				context.report({
					node,
					messageId: 'requireDimensions',
					data: { missing: missing.map((name) => `\`${name}\``).join(' and ') },
				})
			},
		}
	},
}
