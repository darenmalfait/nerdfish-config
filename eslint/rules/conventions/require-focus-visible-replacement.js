import { createClassRootVisitor, getUtility } from './class-tokens.js'

/** `outline-none` (v3) and `outline-hidden` (v4) both remove the focus ring. */
const OUTLINE_REMOVERS = new Set(['outline-hidden', 'outline-none'])

function removesOutline(token) {
	return (
		OUTLINE_REMOVERS.has(getUtility(token)) && !token.includes('focus-visible:')
	)
}

function isFocusVisibleStyle(token) {
	return (
		token.includes('focus-visible:') && !OUTLINE_REMOVERS.has(getUtility(token))
	)
}

export const requireFocusVisibleReplacementRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require a focus-visible style when removing the outline with Tailwind.',
			guidelineRuleId: 'web-interface-guidelines.focus-states',
		},

		schema: [],

		messages: {
			requireFocusVisible:
				'`{{token}}` removes the focus indicator for keyboard users. Add a `focus-visible:` replacement such as `focus-visible:ring-2` in the same class list (`focus:` styles also flash on mouse click).',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * className="outline-none focus-visible:ring-2" ✅
		 * cn('outline-hidden', 'focus-visible:outline-2') ✅
		 * className="focus-visible:outline-none" ✅ (only drops the outline while also focus-visible)
		 * className="outline-none" ❌
		 * className="focus:outline-none focus:ring-2" ❌ (ring shows on mouse click, not keyboard-only)
		 */
		return createClassRootVisitor(context, (node, tokens) => {
			const remover = tokens.find(removesOutline)

			if (!remover || tokens.some(isFocusVisibleStyle)) {
				return
			}

			context.report({
				node,
				messageId: 'requireFocusVisible',
				data: { token: remover },
			})
		})
	},
}
