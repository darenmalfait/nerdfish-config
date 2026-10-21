const LOADING_ATTRIBUTES = new Set(['async', 'defer'])

function getAttribute(openingElement, name) {
	return openingElement.attributes.find(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === name,
	)
}

function isModuleScript(openingElement) {
	const type = getAttribute(openingElement, 'type')

	return type?.value?.type === 'Literal' && type.value.value === 'module'
}

export const requireScriptLoadingStrategyRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require external <script> tags to declare async, defer or type="module".',
			guidelineRuleId: 'rendering-script-defer-async',
		},

		schema: [],

		messages: {
			requireLoadingStrategy:
				'External `<script src>` without `async` or `defer` blocks HTML parsing. Use `defer` for scripts that depend on the DOM or each other, `async` for independent ones (e.g. analytics), or `type="module"` (deferred by default).',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * <script src="/app.js" defer /> ✅
		 * <script dangerouslySetInnerHTML={…} /> ✅ (inline, e.g. theme no-flicker)
		 * <script src="/app.js" /> ❌
		 *
		 * Spread attributes may carry async/defer, so they are not reported.
		 */
		return {
			JSXOpeningElement(node) {
				if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'script') {
					return
				}

				if (!getAttribute(node, 'src')) {
					return
				}

				const hasLoadingStrategy = node.attributes.some(
					(attribute) =>
						attribute.type === 'JSXSpreadAttribute' ||
						(attribute.name.type === 'JSXIdentifier' &&
							LOADING_ATTRIBUTES.has(attribute.name.name)),
				)

				if (hasLoadingStrategy || isModuleScript(node)) {
					return
				}

				context.report({
					node,
					messageId: 'requireLoadingStrategy',
				})
			},
		}
	},
}
